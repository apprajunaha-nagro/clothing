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
    // Sync pgmart logo to favicons
    const logoPath = path.join(srcAssets, 'images', 'pgmart_logo_new.png');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      const base64 = logoBuffer.toString('base64');
      const publicDir = path.join(process.cwd(), 'public');
      const distDir = path.join(process.cwd(), 'dist');

      // Standard ICO header + directory entry + PNG data
      const icoHeader = Buffer.alloc(22);
      icoHeader.writeUInt16LE(0, 0); // reserved
      icoHeader.writeUInt16LE(1, 2); // icon type
      icoHeader.writeUInt16LE(1, 4); // 1 image
      icoHeader.writeUInt8(0, 6); // width
      icoHeader.writeUInt8(0, 7); // height
      icoHeader.writeUInt8(0, 8); // color count
      icoHeader.writeUInt8(0, 9); // reserved
      icoHeader.writeUInt16LE(1, 10); // color planes
      icoHeader.writeUInt16LE(32, 12); // bpp
      icoHeader.writeUInt32LE(logoBuffer.length, 14); // image size
      icoHeader.writeUInt32LE(22, 18); // offset
      const icoBuffer = Buffer.concat([icoHeader, logoBuffer]);

      fs.writeFileSync(path.join(publicDir, 'favicon.png'), logoBuffer);
      fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
      fs.writeFileSync(path.join(publicDir, 'pgmart_logo_new.png'), logoBuffer);

      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <clipPath id="rounded">
      <rect width="128" height="128" rx="24" fill="#ffffff"/>
    </clipPath>
  </defs>
  <rect width="128" height="128" rx="24" fill="#ffffff"/>
  <image width="128" height="128" href="data:image/png;base64,${base64}" clip-path="url(#rounded)"/>
</svg>
`;
      fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');

      if (fs.existsSync(distDir)) {
        fs.writeFileSync(path.join(distDir, 'favicon.png'), logoBuffer);
        fs.writeFileSync(path.join(distDir, 'favicon.ico'), icoBuffer);
        fs.writeFileSync(path.join(distDir, 'favicon.svg'), svgContent, 'utf-8');
        fs.writeFileSync(path.join(distDir, 'pgmart_logo_new.png'), logoBuffer);
      }
    }

    console.log('Successfully synced assets and favicons to public/ and dist/ directories.');
  }
} catch (err) {
  console.error('Error copying assets to public/dist directory:', err);
}
