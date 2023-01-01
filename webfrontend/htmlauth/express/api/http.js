const directories = require('../utils/directories')();
const fileHandler = require('../utils/fileHandler');
const axios = require('axios');
const configFile = `${directories.config}/messageCenter.json`;
const globalConfigFile = `${directories.homedir}/config/system/general.json`;
const subscriptionFile = `${directories.config}/mqtt_subscriptions.cfg`;
let config = require(configFile);
const globalConfig = require(globalConfigFile);
delete require.cache[require.resolve(configFile)];
delete require.cache[require.resolve(globalConfigFile)];

const loxoneUuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{16}$/i;
process.env.PM2_HOME = `${directories.bin}/.pm2`;
const pm2 = require('pm2');

const index = async (req, res) => res.render('index', { title: 'Message Center' });

const getConfig = (_) => (req, res) => {
  res.json(_.assign(config, { mqtt: _.has(globalConfig, 'Mqtt') }));
};

const saveConfig = async (req, res) => {
  const hasMqttTopicChanged = !!(req.body.topic !== config.topic);
  config = Object.assign(config, req.body);

  if (hasMqttTopicChanged) {
    await fileHandler.write(subscriptionFile, `${config.topic}/#`);
  }
  await fileHandler.writeJson(configFile, config);

  res.json(config);
};

const restartService = (_) => async (req, res) => {
  pm2.connect((err) => {
    if (err) {
      pm2.disconnect();
      return res.status(403).send({ error: { message: 'restarting the service failed' } });
    }

    pm2.restart('Message Center Server', (error, proc) => {
      if (error) {
        pm2.disconnect();
        return res.status(403).send({ error: err });
      }

      const process = _.head(proc);
      if (_.isNil(process)) {
        return res.status(500).send({ error: { message: 'Process not restartet' } });
      }

      pm2.disconnect();
      return res.send({
        name: process.name,
        status: process.status
      });
    });
  });
};

const serviceInfo = (_) => async (req, res) => {
  pm2.connect((err) => {
    if (err) {
      pm2.disconnect();
      return res.status(403).send({ error: { message: err } });
    }

    pm2.describe('Message Center Server', (error, processes) => {
      if (error) {
        pm2.disconnect();
        return res.status(403).send({ error: err });
      }

      const messageCenter = processes.find((process) => process.name === 'Message Center Server');
      if (_.isNil(messageCenter)) {
        return res.status(500).send({ error: { message: 'Cannot find background process' } });
      }
      pm2.disconnect();

      return res.send({
        pid: messageCenter.pid,
        name: messageCenter.name,
        status: messageCenter.pm2_env.status,
        log: {
          out: messageCenter.pm2_env.pm_log_path
        }
      });
    });
  });
};

const getMessageCenterId = async (_, miniserver) => {
  const response = await axios.get(`http://${miniserver.Ipaddress}/data/LoxAPP3.json`, {
    timeout: 900,
    withCredentials: true,
    auth: {
      username: miniserver.Admin_raw,
      password: miniserver.Pass_raw
    }
  });

  const messageCenterId = _.first(_.keys(response.data.messageCenter));
  return messageCenterId;
};

const sendToMiniserver = async ({ _, loxberry, logger, req, res, getUrl }) => {
  try {
    const messageId = _.get(req, 'params.messageId');
    let messageCenterId = _.get(config, 'messageCenterId');
    const miniserver = _.head(await loxberry.system.getMiniserver());

    if (_.isNil(messageId)) {
      return res.status(403).send('Parameter <message-id> is required');
    }

    if (!loxoneUuidRegex.test(messageId)) {
      return res.status(403).send('Parameter <message-id> needs to be a valid loxone uuid');
    }

    if (_.isNil(miniserver)) {
      return res.status(503).send('There is no minisever configured');
    }

    if (_.isNil(messageCenterId)) {
      messageCenterId = await getMessageCenterId(_, miniserver);
    }

    const response = await axios.get(getUrl(miniserver, messageCenterId, messageId), {
      timeout: 900,
      withCredentials: true,
      auth: {
        username: miniserver.Admin_raw,
        password: miniserver.Pass_raw
      }
    });
    logger.info('Miniserver Response:');
    logger.info(JSON.stringify(response.data));
    res.status(parseInt(_.get(response, 'data.LL.Code', 500))).send(response.data);
  } catch (error) {
    logger.info('Miniserver Error Response:');
    logger.info(error.message);
    res.status(500).send({ error: error.message });
  }
};

const markAsRead = (_, loxberry, logger) => async (req, res) => {
  const getUrl = (miniserver, messageCenterId, messageId) =>
    `http://${miniserver.Ipaddress}/jdev/sps/io/${messageCenterId}/readEntry/${messageId}`;

  return sendToMiniserver({ _, loxberry, logger, req, res, getUrl });
};
const markAsConfirmed = (_, loxberry, logger) => (req, res) => {
  const getUrl = (miniserver, messageCenterId, messageId) =>
    `http://${miniserver.Ipaddress}/jdev/sps/io/${messageCenterId}/action/${messageId}/1005`;

  return sendToMiniserver({ _, loxberry, logger, req, res, getUrl });
};

module.exports = {
  index,
  getConfig,
  saveConfig,
  restartService,
  serviceInfo,
  markAsRead,
  markAsConfirmed
};
