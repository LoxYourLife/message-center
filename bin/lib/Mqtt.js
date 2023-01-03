const mqtt = require('async-mqtt');
const _ = require('lodash');

module.exports = class Mqtt {
  constructor(globalConfig, logger) {
    this.setConfig(globalConfig);
    this.logger = logger;
  }

  setConfig(globalConfig) {
    this.config = _.get(globalConfig, 'Mqtt', null);
  }

  async connect() {
    if (!this.config || !this.config.Brokerhost || !this.config.Brokerport || !this.config.Brokeruser || !this.config.Brokerpass) {
      throw new Error('Cant connect to MQTT. Configuration is missing');
    }
    const connectUrl = `mqtt://${this.config.Brokerhost}:${this.config.Brokerport}`;
    this.logger.debug(`connecting to MQTT using ${connectUrl}`);

    try {
      this.client = await mqtt.connectAsync(connectUrl, {
        username: this.config.Brokeruser,
        password: this.config.Brokerpass,
        clientId: 'MessageCenter',
        keepalive: 300,
        reconnectPeriod: 0,
        queueQoSZero: false
      });

      this.client.on('connect', () => {
        this.logger.debug('connected to mqtt');
      });
      this.client.on('disconnect', () => {
        this.logger.debug('disconnected from mqtt');
      });

      this.client.on('packetreceive', () => {});
    } catch (error) {
      this.logger.error('Error during mqtt connection', error);
    }
  }

  async disconnect() {
    if (!this.client) return;
    await this.client.end();
  }

  async send(topic, message) {
    if (_.isNil(this.config)) {
      this.logger.debug('NO Config for MQTT - not sending anything');
      return;
    }

    try {
      if (!this.client.connected) {
        this.logger.debug('MQTT not connected, reconnecting');
        this.client.reconnect();
      }
      await this.client.publish(topic, message, { retain: true });
    } catch (error) {
      this.logger.error('error while sending mqtt message', error);
    }
  }
};
