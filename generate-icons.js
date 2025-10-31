/**
 * Icon Generation Script for PWA
 * 
 * This script helps you generate all required PWA icons from a single source image.
 * 
 * PREREQUISITES:
 * 1. Install sharp: npm install --save-dev sharp
 * 2. Place your source icon (512x512 or larger) as 'source-icon.png' in the project root
 * 
 * USAGE:
 * node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Sharp is not installed. Please run: npm install --save-dev sharp');
  process.exit(1);
}

// Icon sizes needed for PWA
const ICON_SIZES = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
];

const SOURCE_ICON = 'source-icon.png';
const OUTPUT_DIR = 'public/icons';

async function generateIcons() {
  console.log('🎨 PWA Icon Generator\n');

  // Check if source icon exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`❌ Source icon not found: ${SOURCE_ICON}`);
    console.log('\n📝 Instructions:');
    console.log('   1. Create or find a square icon (512x512 or larger)');
    console.log(`   2. Save it as '${SOURCE_ICON}' in the project root`);
    console.log('   3. Run this script again\n');
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created directory: ${OUTPUT_DIR}`);
  }

  // Generate icons for each size
  console.log('\n🔨 Generating icons...\n');
  
  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    
    try {
      await sharp(SOURCE_ICON)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 59, g: 130, b: 246, alpha: 1 } // #3B82F6
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate icon-${size}x${size}.png:`, error.message);
    }
  }

  // Generate Apple touch icons (rounded square)
  console.log('\n🍎 Generating Apple touch icons...\n');
  
  const appleSize = 180;
  const applePath = path.join(OUTPUT_DIR, `apple-touch-icon.png`);
  
  try {
    await sharp(SOURCE_ICON)
      .resize(appleSize, appleSize, {
        fit: 'contain',
        background: { r: 59, g: 130, b: 246, alpha: 1 }
      })
      .png()
      .toFile(applePath);
    
    console.log(`✅ Generated: apple-touch-icon.png`);
  } catch (error) {
    console.error(`❌ Failed to generate apple-touch-icon.png:`, error.message);
  }

  // Generate favicon
  console.log('\n🔖 Generating favicon...\n');
  
  const faviconPath = path.join('public', 'favicon.ico');
  
  try {
    await sharp(SOURCE_ICON)
      .resize(32, 32)
      .toFile(faviconPath);
    
    console.log(`✅ Generated: favicon.ico`);
  } catch (error) {
    console.error(`❌ Failed to generate favicon.ico:`, error.message);
  }

  console.log('\n✨ Icon generation complete!\n');
  console.log('📦 Generated files:');
  console.log(`   - ${ICON_SIZES.length} PWA icons in ${OUTPUT_DIR}/`);
  console.log('   - 1 Apple touch icon');
  console.log('   - 1 Favicon\n');
  console.log('🚀 Your PWA is ready to go!\n');
}

// Run the generator
generateIcons().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

