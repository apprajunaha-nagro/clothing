// cPanel Entry Point for Node.js Application
process.env.NODE_ENV = 'production';
require('./dist/server.cjs');
