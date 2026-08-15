// Phusion Passenger / Hostinger Node.js Application Startup File
// Loads pre-built CJS bundle dist/server.cjs or server.ts via tsx fallback

const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'dist', 'server.cjs');

let serverApp;
if (fs.existsSync(bundlePath)) {
  console.log('[Passenger Startup]: Loading compiled bundle dist/server.cjs...');
  serverApp = require(bundlePath);
} else {
  console.log('[Passenger Startup]: dist/server.cjs not found, attempting tsx execution of server.ts...');
  try {
    require('tsx/cjs');
    serverApp = require('./server.ts');
  } catch (err) {
    console.error('[Passenger Startup Error]: Failed to start Node application:', err);
    throw err;
  }
}

const expressApp = serverApp?.app || serverApp?.default || serverApp;
module.exports = expressApp;
