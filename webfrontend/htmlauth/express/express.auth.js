const path = require('path');

const http = require('./api/http');

module.exports = ({ router, expressStatic, _, logger, loxberry }) => {
  router.use('/assets', expressStatic(path.resolve(__dirname, '../assets')));

  router.get('/', http.index);

  router.get('/api/config', http.getConfig(_, loxberry));
  router.put('/api/config', http.saveConfig);
  router.post('/api/restart-service', http.restartService(_));
  router.get('/api/service-info', http.serviceInfo(_));

  router.get('/message/mark-as-read/:messageId', http.markAsRead(_, loxberry, logger));
  router.get('/message/mark-as-confirmed/:messageId', http.markAsConfirmed(_, loxberry, logger));

  router.get('/getOutputs', async (req, res) => {
    const ip = await loxberry.system.getLocalIp();
    res.header('Content-type', 'text/xml');
    res.header('Content-Disposition', 'attachment; filename="VO_Message_Center.xml"');
    res.header('Content-Transfer-Encoding', 'binary');
    return res.render('virtualOutputs', { ip, layout: false });
  });

  return router;
};
