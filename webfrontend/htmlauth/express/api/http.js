const directories = require('../utils/directories')();
const fileHandler = require('../utils/fileHandler');
const configFile = `${directories.config}/messageCenter.json`;
const globalConfigFile = `${directories.homedir}/config/system/general.json`;
const subscriptionFile = `${directories.config}/mqtt_subscriptions.cfg`;
let config = require(configFile);
const globalConfig = require(globalConfigFile);

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

module.exports = {
  index,
  getConfig,
  saveConfig,
  restartService,
  serviceInfo
};
