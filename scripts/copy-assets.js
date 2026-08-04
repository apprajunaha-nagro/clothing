import fs from 'fs';
import path from 'path';

const srcAssets = path.join(process.cwd(), 'src', 'assets');
const publicSrcAssets = path.join(process.cwd(), 'public', 'src', 'assets');
const publicAssets = path.join(process.cwd(), 'public', 'assets');

try {
  if (fs.existsSync(srcAssets)) {
    fs.mkdirSync(publicSrcAssets, { recursive: true });
    fs.mkdirSync(publicAssets, { recursive: true });

    fs.cpSync(srcAssets, publicSrcAssets, { recursive: true });
    fs.cpSync(srcAssets, publicAssets, { recursive: true });
    console.log('Successfully synced assets to public/ directory for Vercel static serving.');
  }
} catch (err) {
  console.error('Error copying assets to public directory:', err);
}
