export default {
  COMMON: {
    SAVE_BTN: 'Save',
    RESTART: 'Restart Backround Service',
    OPEN_LOG: 'Show Log'
  },
  MESSAGE: {
    SETTINGS: 'Settings',
    PLUGIN_SETTINGS: 'Plugin Settings',
    TOPIC: 'MQTT Topic',
    TOPIC_HINT:
      "Specify the topic you'd like the data to be published. eg. UniFi/clients. No slash in the beginning or the end. Subscription is added automatically.",
    INTERVAL: 'Request interval in seconds',
    INTERVAL_HINT: 'Specifies how often loxberry queries the miniserver to recveive the latest messages.',
    NEED_MQTT: 'To use this plugin, the MQTT Gateway plugin is required. Please install the MQTT Gateway Plugin version >= 2.0.4 first.',
    ONLINE: 'Online',
    OFFLINE: 'Offline',
    BACKGROUND_SERVICE: 'Background Service',
    EXPLANATION: 'Explantion of the messages'
  },
  EXPLANATION: {
    HOWTO:
      'The plugin reads during the defined interval all system messages form the loxone miniserver and publishes them to MQTT. Within the Loxone config you could add the virtual inputs and use it to control someting.',

    AFFECTED_NAME: 'Text: Name of the affected device',
    DESC: 'Text: The detailed description of the warning. This is useful for TTS output.',
    SEVERITY: 'Integer: The error level: 1: Info, 2: Warning, >3: Error',
    TITLE: 'Text: A short title of the message.'
  },
  VALIDATION: {
    REQUIRED: 'This field is required.',
    INVALID_TOPIC: 'A topic can only be alphanumeric and separated by /. e.g. test/topic',
    INVALID_INTERVAL: 'Please enter a value between 1 and 999.'
  }
};
