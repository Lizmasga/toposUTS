import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(typeAndData), 8 + len);
  return buf;
}

function generateSheriffPng(width, height, isMaskable = false) {
  // RGBA buffer with filter byte per row
  const rowLength = width * 4;
  const rawData = Buffer.alloc((1 + rowLength) * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) / 2;
  const innerMargin = isMaskable ? maxRadius * 0.75 : maxRadius * 0.92;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + rowLength);
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Star shape or golden round badge with star
      const angle = Math.atan2(dy, dx);
      // 6-pointed star radius
      const starR = innerMargin * (0.65 + 0.35 * Math.cos(6 * angle));

      if (dist <= innerMargin * 0.98) {
        // Badge interior
        if (dist <= innerMargin * 0.45) {
          // Central medallion
          rawData[pxOffset] = 217;     // R
          rawData[pxOffset + 1] = 119; // G
          rawData[pxOffset + 2] = 6;   // B (amber-600)
          rawData[pxOffset + 3] = 255; // A
        } else if (dist <= starR) {
          // Gold star body
          const gradient = 1 - (dist / innerMargin) * 0.4;
          rawData[pxOffset] = Math.round(245 * gradient);
          rawData[pxOffset + 1] = Math.round(158 * gradient);
          rawData[pxOffset + 2] = Math.round(11 * gradient);
          rawData[pxOffset + 3] = 255;
        } else {
          // Dark leather/wood backdrop
          rawData[pxOffset] = 41;
          rawData[pxOffset + 1] = 24;
          rawData[pxOffset + 2] = 13;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Outer background
        if (isMaskable) {
          rawData[pxOffset] = 28;
          rawData[pxOffset + 1] = 16;
          rawData[pxOffset + 2] = 8;
          rawData[pxOffset + 3] = 255;
        } else {
          rawData[pxOffset] = 0;
          rawData[pxOffset + 1] = 0;
          rawData[pxOffset + 2] = 0;
          rawData[pxOffset + 3] = 0;
        }
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT
  const idat = createChunk('IDAT', deflated);

  // IEND
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Generate PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generateSheriffPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generateSheriffPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generateSheriffPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generateSheriffPng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generateSheriffPng(64, 64, false));

// Generate icon.svg
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="96" fill="#2b1810"/>
  <circle cx="256" cy="256" r="230" fill="#451a03" stroke="#d97706" stroke-width="8"/>
  <path d="M256 60 L295 190 L430 190 L320 270 L360 400 L256 320 L152 400 L192 270 L82 190 L217 190 Z" fill="#f59e0b" stroke="#78350f" stroke-width="12" stroke-linejoin="round"/>
  <circle cx="256" cy="256" r="75" fill="#78350f" stroke="#fbbf24" stroke-width="6"/>
  <text x="256" y="246" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="28" fill="#fef3c7" letter-spacing="2">0101</text>
  <text x="256" y="278" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="#fbbf24">SHERIFF</text>
  <circle cx="256" cy="60" r="10" fill="#fef3c7"/>
  <circle cx="430" cy="190" r="10" fill="#fef3c7"/>
  <circle cx="360" cy="400" r="10" fill="#fef3c7"/>
  <circle cx="152" cy="400" r="10" fill="#fef3c7"/>
  <circle cx="82" cy="190" r="10" fill="#fef3c7"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg);

console.log('Successfully generated all PWA icons in /public!');
