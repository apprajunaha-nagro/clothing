import fs from 'fs';
import path from 'path';

const srcAssets = path.join(process.cwd(), 'src', 'assets');
const publicSrcAssets = path.join(process.cwd(), 'public', 'src', 'assets');
const publicAssets = path.join(process.cwd(), 'public', 'assets');
const distSrcAssets = path.join(process.cwd(), 'dist', 'src', 'assets');
const distAssets = path.join(process.cwd(), 'dist', 'assets');

const publicUploads = path.join(process.cwd(), 'public', 'uploads');
const distUploads = path.join(process.cwd(), 'dist', 'uploads');

try {
  fs.mkdirSync(publicUploads, { recursive: true });
  fs.mkdirSync(distUploads, { recursive: true });

  if (fs.existsSync(srcAssets)) {
    fs.mkdirSync(publicSrcAssets, { recursive: true });
    fs.mkdirSync(publicAssets, { recursive: true });
    fs.mkdirSync(distSrcAssets, { recursive: true });
    fs.mkdirSync(distAssets, { recursive: true });

    fs.cpSync(srcAssets, publicSrcAssets, { recursive: true });
    fs.cpSync(srcAssets, publicAssets, { recursive: true });
    fs.cpSync(srcAssets, distSrcAssets, { recursive: true });
    fs.cpSync(srcAssets, distAssets, { recursive: true });
    console.log('Successfully synced assets to public/ and dist/ directories.');
  }
} catch (err) {
  console.error('Error copying assets to public/dist directory:', err);
}
