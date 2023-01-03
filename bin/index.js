const _ = require('lodash');
const Mqtt = require('./lib/Mqtt');
const fs = require('fs');
const directories = require('./lib/directories');
const axios = require('axios');
const { writeJson } = require('./lib/fileHandler');
const Logger = require('./lib/Logger');

const configFile = `${directories.config}/messageCenter.json`;
const globalConfigFile = `${directories.homedir}/config/system/general.json`;
const globalPluginDbFile = `${directories.systemData}/plugindatabase.json`;

const getPluginLogLevel = () => {
  const pluginData = _.find(globalPluginDb.plugins, (entry) => entry.name === 'message_center');
  if (_.isUndefined(pluginData)) return 3;

  return pluginData.loglevel;
};

let config = require(configFile);
let globalConfig = require(globalConfigFile);
let globalPluginDb = require(globalPluginDbFile);
let lastMessage = null;
let messageId = null;
let logLevel = getPluginLogLevel();
const logLevelList = ['Emergency', 'Alert', 'Critical', 'Error', 'Warning', 'Notice', 'Informational', 'Debug'];

console.log(`Current LogLevel: ${logLevelList[logLevel]}`);

const miniserverEntries = _.get(globalConfig, 'Miniserver', {});
const miniserver = _.head(_.values(miniserverEntries));
const logger = new Logger(logLevel);
const mqtt = new Mqtt(globalConfig, logger);

fs.watch(configFile, {}, () => {
  delete require.cache[require.resolve(configFile)];
  try {
    config = require(configFile);
    logger.debug('Config got changed - load new config');
  } catch {
    //
  }
});
fs.watch(globalPluginDbFile, {}, () => {
  delete require.cache[require.resolve(globalPluginDbFile)];
  try {
    globalPluginDb = require(globalPluginDbFile);
    logLevel = getPluginLogLevel();
    logger.loglevel = logLevel;
    logger.debug('Loaded changed plugindatabase');
  } catch {
    //
  }
});

const saveMessageIdToConfig = async (messageId) => {
  const currentMessageId = _.get(config, 'messageCenterId');
  if (currentMessageId != messageId) {
    config.messageCenterId = messageId;
    return writeJson(configFile, config);
  }
};

const hasMqttInstalled = async () => {
  if (_.get(globalConfig, 'Mqtt', null) === null) {
    return logger.error('MQTT is missing');
  }
  mqtt.setConfig(globalConfig);
  await mqtt.connect();
  return true;
};

const fetchStatus = async (messageId) => {
  try {
    const response = await axios.get(`http://${miniserver.Ipaddress}/jdev/sps/io/${messageId}/getEntries/2`, {
      timeout: 900,
      withCredentials: true,
      auth: {
        username: miniserver.Admin_raw,
        password: miniserver.Pass_raw
      }
    });

    if (response.data.LL && response.data.LL.value) {
      const values = JSON.parse(response.data.LL.value);

      return values.entries.find((entry) => entry.readAt === null);
    } else {
      logger.error('unkown response format', response);
    }
  } catch (error) {
    logger.error(error);
  }
};

const getMessageId = async () => {
  const response = await axios.get(`http://${miniserver.Ipaddress}/data/LoxAPP3.json`, {
    timeout: 900,
    withCredentials: true,
    auth: {
      username: miniserver.Admin_raw,
      password: miniserver.Pass_raw
    }
  });

  const messageCenterId = _.first(_.keys(response.data.messageCenter));
  try {
    await saveMessageIdToConfig(messageCenterId);
  } catch {
    logger.error('cannot write message center id to config file');
  }

  return messageCenterId;
};

const getAndSendMessages = async () => {
  if (_.isNil(messageId)) {
    logger.debug('Empty Message ID - try to restart the service');
  }
  const message = await fetchStatus(messageId);
  const newMessage = {
    entryUuid: _.get(message, 'entryUuid', ''),
    affectedName: _.get(message, 'affectedName', ''),
    title: _.get(message, 'title', ''),
    desc: _.get(message, 'desc', ''),
    severity: _.get(message, 'severity', 0),
    hasConfirmAction: _.find(_.get(message, 'actions', []), (action) => _.get(action, 'actionId', null) === 1005) !== undefined
  };

  if (!_.isEqual(newMessage, lastMessage)) {
    lastMessage = newMessage;
    logger.info(`New system message on miniserver. sending to topic ${config.topic}:`);
    logger.info(JSON.stringify(newMessage, null, 2));

    await mqtt.send(config.topic, JSON.stringify(newMessage));
  }
};

const eventLoop = async () => {
  try {
    await getAndSendMessages();
  } catch (error) {
    logger.error('received error while fetching system messages:', error);
  }
  await new Promise((resolve) => setTimeout(resolve, config.interval * 1000));
  await eventLoop();
};

const main = async () => {
  await hasMqttInstalled();
  messageId = await getMessageId();
  await eventLoop();
};

main();
