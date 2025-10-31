/**
 * Simple PWA Icon Creator
 * Creates basic placeholder icons without requiring sharp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICON_SIZES = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const OUTPUT_DIR = path.join('public', 'icons');

// Create a simple SVG icon
function createSVGIcon(size) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#3B82F6" rx="${size * 0.1}"/>
  
  <!-- City/Community Icon -->
  <g transform="translate(${size * 0.15}, ${size * 0.2})">
    <!-- Buildings -->
    <rect x="${size * 0.05}" y="${size * 0.3}" width="${size * 0.15}" height="${size * 0.3}" fill="#FFFFFF" opacity="0.9"/>
    <rect x="${size * 0.25}" y="${size * 0.2}" width="${size * 0.15}" height="${size * 0.4}" fill="#FFFFFF" opacity="0.9"/>
    <rect x="${size * 0.45}" y="${size * 0.25}" width="${size * 0.15}" height="${size * 0.35}" fill="#FFFFFF" opacity="0.9"/>
    
    <!-- Windows -->
    <rect x="${size * 0.08}" y="${size * 0.35}" width="${size * 0.03}" height="${size * 0.04}" fill="#3B82F6"/>
    <rect x="${size * 0.14}" y="${size * 0.35}" width="${size * 0.03}" height="${size * 0.04}" fill="#3B82F6"/>
    <rect x="${size * 0.08}" y="${size * 0.45}" width="${size * 0.03}" height="${size * 0.04}" fill="#3B82F6"/>
    <rect x="${size * 0.14}" y="${size * 0.45}" width="${size * 0.03}" height="${size * 0.04}" fill="#3B82F6"/>
    
    <rect x="${size * 0.28}" y="${size * 0.25}" width="${size * 0.03}" height="${size * 0.04}" fill="#3B82F6"/>
    <rect x="${size * 0.34}" y="${size * 0.25}" width="${size * 0.03}" height="${size * 0.04}" fill="#3B82F6"/>
    <rect x="${size * 0.28}" y="${size * 0.35}" width="${size * 0.03}" height="${size * 0.04}" fill="#3B82F6"/>
    <rect x="${size * 0.34}" y="${size * 0.35}" width="${size * 0.03}" height="${size * 0.04}" fill="#3B82F6"/>
    
    <rect x="${size * 0.48}" y="${size * 0.3}" width="${size * 0.03}" height="${size * 0.04}" fill="#3B82F6"/>
    <rect x="${size * 0.54}" y="${size * 0.3}" width="${size * 0.03}" height="${size * 0.04}" fill="#3B82F6"/>
    <rect x="${size * 0.48}" y="${size * 0.4}" width="${size * 0.03}" height="${size * 0.04}" fill="#3B82F6"/>
    <rect x="${size * 0.54}" y="${size * 0.4}" width="${size * 0.03}" height="${size * 0.04}" fill="#3B82F6"/>
  </g>
  
  <!-- Text/Badge -->
  <text x="${size / 2}" y="${size * 0.85}" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold" fill="#FFFFFF" text-anchor="middle">CIVIC</text>
</svg>`;
  return svg;
}

console.log('🎨 Creating PWA Icons...\n');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('✅ Created icons directory\n');
}

// Generate SVG icons for each size
ICON_SIZES.forEach(size => {
  const svgContent = createSVGIcon(size);
  const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
  const svgPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.svg`);
  
  // Save as SVG (browsers support SVG icons)
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Created icon-${size}x${size}.svg`);
});

// Create a PNG note file
const noteContent = `PWA Icons Created!

SVG icons have been generated in this directory.
These will work for PWA, but for better compatibility, convert them to PNG:

Option 1: Use an online converter
   - Visit https://cloudconvert.com/svg-to-png
   - Upload all SVG files
   - Download PNG versions

Option 2: Use ImageMagick (if installed)
   - Run: magick convert icon-SIZE.svg icon-SIZE.png

Option 3: Use your logo
   - Replace these icons with your actual logo
   - Use https://realfavicongenerator.net/ for best results

The SVG icons will work for now as placeholders!
`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'README.txt'), noteContent);

console.log('\n✨ PWA Icons Setup Complete!');
console.log('📁 Location: public/icons/');
console.log(`📊 Created ${ICON_SIZES.length} icon sizes`);
console.log('\n💡 Tip: Replace with your actual logo for production\n');

