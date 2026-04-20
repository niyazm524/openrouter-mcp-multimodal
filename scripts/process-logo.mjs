#!/usr/bin/env node
/**
 * Process the Gemini-generated logo:
 *   1. Crop to the circular content (remove transparent corners)
 *   2. Resize to 512x512 for the README hero
 *   3. Create a 128x128 favicon-sized version
 *   4. Optimize both as PNG
 */
import sharp from 'sharp';
import { promises as fs } from 'node:fs';

const input = process.argv[2] || 'Gemini_Generated_Image_tcdv5itcdv5itcdv.png';
const outDir = 'assets';
await fs.mkdir(outDir, { recursive: true });

const buf = await fs.readFile(input);
const meta = await sharp(buf).metadata();
console.log(`Input: ${meta.width}x${meta.height} ${meta.format}`);

// The logo is a circle on a dark background. Trim transparent edges first,
// then resize. The image is already circular so we just need to optimize.

// 512px version for README hero
await sharp(buf)
  .resize(512, 512, { fit: 'cover' })
  .png({ quality: 90, compressionLevel: 9 })
  .toFile(`${outDir}/logo.png`);

// 128px version for small contexts (npm, social cards)
await sharp(buf)
  .resize(128, 128, { fit: 'cover' })
  .png({ quality: 85, compressionLevel: 9 })
  .toFile(`${outDir}/logo-128.png`);

// 1024px version for high-DPI / social preview
await sharp(buf)
  .resize(1024, 1024, { fit: 'cover' })
  .png({ quality: 92, compressionLevel: 9 })
  .toFile(`${outDir}/logo-1024.png`);

const stat512 = await fs.stat(`${outDir}/logo.png`);
const stat128 = await fs.stat(`${outDir}/logo-128.png`);
const stat1024 = await fs.stat(`${outDir}/logo-1024.png`);
console.log(`512px:  ${(stat512.size / 1024).toFixed(1)} KB → ${outDir}/logo.png`);
console.log(`128px:  ${(stat128.size / 1024).toFixed(1)} KB → ${outDir}/logo-128.png`);
console.log(`1024px: ${(stat1024.size / 1024).toFixed(1)} KB → ${outDir}/logo-1024.png`);
