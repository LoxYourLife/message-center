export default (t) => ({
  topic: [(v) => /^[\w-]+((?:\/[\w-]+)+)?$/.test(v) || t('VALIDATION.INVALID_TOPIC')],
  interval: [(v) => /^[1-9]([0-9]{1,2})?$/.test(v) || t('VALIDATION.INVALID_INTERVAL')]
});
