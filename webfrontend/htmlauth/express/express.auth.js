const path = require('path');

const http = require('./api/http');

module.exports = ({ router, expressStatic, _, loxberry }) => {
  router.use('/assets', expressStatic(path.resolve(__dirname, '../assets')));

  router.get('/', http.index);

  router.get('/api/config', http.getConfig(_, loxberry));
  router.put('/api/config', http.saveConfig);
  router.post('/api/restart-service', http.restartService(_));
  router.get('/api/service-info', http.serviceInfo(_));

  return router;
};
