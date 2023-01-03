const path = require('path');
const PRODUCTION = process.env.NODE_ENV === 'production';

const directories = () => {
  if (PRODUCTION) {
    return {
      config: 'REPLACELBPCONFIGDIR',
      data: 'REPLACELBPDATADIR',
      logdir: 'REPLACELBPLOGDIR',
      homedir: process.env.LBHOMEDIR,
      systemData: path.join(process.env.LBHOMEDIR, 'data', 'system')
    };
  }

  return {
    config: path.join(__dirname, '../../config'),
    data: path.join(__dirname, '../../data'),
    logdir: path.join(__dirname, '../../loxberry/logs'),
    homedir: path.join(__dirname, '../../loxberry'),
    systemData: path.join(__dirname, '../../loxberry/data/system'),
  };
};

module.exports = directories();
