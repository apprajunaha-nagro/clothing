const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== STARTING CROSS-PLATFORM PRODUCTION BUILD ===\n');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
}

try {
  // 1. Prisma Client Generation
  console.log('\n[1/4] Generating Prisma Client...');
  run('node node_modules/prisma/build/index.js generate');

  // 2. Server Bundle Build (esbuild)
  console.log('\n[2/4] Bundling Express Server (dist/server.cjs)...');
  run('node node_modules/esbuild/bin/esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs');

  // 3. Frontend Vite Build
  console.log('\n[3/4] Building Frontend Static Assets (dist/)...');
  run('node node_modules/vite/bin/vite.js build');

  // 4. Asset Sync
  console.log('\n[4/4] Syncing Assets...');
  require('./copy-assets.js');

  console.log('\n================================================================');
  console.log('✅ PRODUCTION BUILD COMPLETED SUCCESSFULLY!');
  console.log('================================================================\n');
} catch (err) {
  console.error('\n❌ BUILD FAILED:', err.message);
  process.exit(1);
}
