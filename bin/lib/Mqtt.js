const mqtt = require('mqtt');
const _ = require('lodash');

module.exports = class Mqtt {
  constructor(globalConfig) {
    this.setConfig(globalConfig);
  }

  setConfig(globalConfig) {
    this.config = _.get(globalConfig, 'Mqtt', null);
  }

  async connect() {
    if (!this.config || !this.config.Brokerhost || !this.config.Brokerport || !this.config.Brokeruser || !this.config.Brokerpass) {
      throw new Error('Cant connect to MQTT. Configuration is missing');
    }
    const connectUrl = `mqtt://${this.config.Brokerhost}:${this.config.Brokerport}`;

    return new Promise(
      function (resolve) {
        this.client = mqtt.connect(connectUrl, {
          username: this.config.Brokeruser,
          password: this.config.Brokerpass,
          clientId: 'MessageCenter',
          keepalive: 300,
          reconnectPeriod: 0,
          queueQoSZero: false
        });

        this.client.on('connect', resolve);
        this.client.on('packetreceive', () => {});
      }.bind(this)
    );
  }

  disconnect() {
    if (!this.client) return;
    this.client.end();
  }

  async send(topic, message) {
    if (_.isNil(this.config)) {
      console.info('NO Config for MQTT - not sending');
      return;
    }
    if (!this.client.connected) {
      console.info('MQTT not connected, reconnecting');
      await this.connect();
    }
    this.client.publish(topic, message);
  }
};
