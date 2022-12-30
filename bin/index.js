const _ = require('lodash');
const Mqtt = require('./lib/Mqtt');
const fs = require('fs');
const directories = require('./lib/directories');
const axios = require('axios');

const configFile = `${directories.config}/messageCenter.json`;
const globalConfigFile = `${directories.homedir}/config/system/general.json`;

let config = require(configFile);
let globalConfig = require(globalConfigFile);
let lastMessage = null;
let messageId = null;

const miniserverEntries = _.get(globalConfig, 'Miniserver', {});
const miniserver = _.get(_.values(miniserverEntries), 0);

const mqtt = new Mqtt(globalConfig);

fs.watch(configFile, {}, () => {
  delete require.cache[require.resolve(configFile)];
  try {
    config = require(configFile);
    console.log('Config got changed - load new config');
  } catch {
    //
  }
});

const hasMqttInstalled = async () => {
  if (_.get(globalConfig, 'Mqtt', null) === null) {
    throw Error('MQTT is missing');
  }
  mqtt.setConfig(globalConfig);
  await mqtt.connect();
  return true;
};

const fetchStatus = async (messageId) => {
  try {
    const response = await axios.get(`http://${miniserver.Ipaddress}/jdev/sps/io/${messageId}/getEntries`, {
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
      console.error('unkown response format', response);
    }
  } catch (error) {
    console.error(error);
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

  return _.first(_.keys(response.data.messageCenter));
};

const getAndSendMessages = async () => {
  if (_.isNil(messageId)) {
    console.log('Empty Message ID - try to restart the service');
  }
  const message = await fetchStatus(messageId);
  const newMessage = {
    affectedName: _.get(message, 'affectedName', null),
    title: _.get(message, 'title', null),
    desc: _.get(message, 'desc', null),
    severity: _.get(message, 'severity', 0)
  };

  if (!_.isEqual(newMessage, lastMessage)) {
    lastMessage = newMessage;
    console.log('New system message on miniserver. sending:', newMessage);

    mqtt.send(config.topic, JSON.stringify(newMessage));
  }
};

const eventLoop = async () => {
  try {
    await getAndSendMessages();
  } catch (error) {
    console.error('received error while fetching system messages:', error.message);
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
