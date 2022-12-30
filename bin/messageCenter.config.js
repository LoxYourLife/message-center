process.env.NODE_ENV = process.env.LBHOMEDIR ? 'production' : 'development';
const path = require('path');
const directories = require('./lib/directories');

module.exports = [
  {
    name: 'Message Center Server',
    script: 'index.js',
    cwd: __dirname,
    env: {
      NODE_ENV: process.env.NODE_ENV
    },
    log_file: path.resolve(directories.logdir, 'message-center.log'),
    pid_file: path.resolve(directories.logdir, 'message-center.pid'),
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    time: true,
    watch: false
  }
];
