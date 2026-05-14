#!/usr/bin/env node
/**
 * Convert TTF fonts to WOFF2 format
 * Usage: node convert-fonts.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicFontsDir = path.join(__dirname, '..', 'public', 'fonts');

const fonts = [
  { input: 'ibm-plex-sans-600.ttf', output: 'ibm-plex-sans-600.woff2' },
  { input: 'ibm-plex-sans-700.ttf', output: 'ibm-plex-sans-700.woff2' },
  { input: 'open-sans-400.ttf', output: 'open-sans-400.woff2' },
];

console.log('🔤 Font Conversion to WOFF2');
console.log('============================\n');

// Try using google's woff2 encoder if available via npm
async function convertWithWoff2Library() {
  try {
    // Try importing woff2 package if available
    const woff2 = await import('woff2');
    
    for (const font of fonts) {
      const inputPath = path.join(publicFontsDir, font.input);
      const outputPath = path.join(publicFontsDir, font.output);
      
      if (!fs.existsSync(inputPath)) {
        console.log(`⚠️  ${font.input} not found`);
        continue;
      }
      
      try {
        const ttfBuffer = fs.readFileSync(inputPath);
        const woff2Buffer = woff2.encode(ttfBuffer);
        fs.writeFileSync(outputPath, woff2Buffer);
        
        const ttfSize = (fs.statSync(inputPath).size / 1024).toFixed(1);
        const woff2Size = (fs.statSync(outputPath).size / 1024).toFixed(1);
        const savings = (((ttfSize - woff2Size) / ttfSize) * 100).toFixed(0);
        
        console.log(`✅ ${font.input}`);
        console.log(`   ${ttfSize}KB → ${woff2Size}KB (saved ${savings}%)\n`);
      } catch (e) {
        console.log(`❌ Failed to convert ${font.input}: ${e.message}\n`);
      }
    }
  } catch (e) {
    console.log('ℹ️  woff2 package not available');
    console.log('ℹ️  Please use online converter or install: npm install -D woff2\n');
    manualInstructions();
  }
}

function manualInstructions() {
  console.log('📋 MANUAL CONVERSION OPTIONS:\n');
  console.log('Option 1: Online Converter');
  console.log('  1. Visit: https://convertio.co/ttf-woff2/');
  console.log('  2. Upload TTF files from public/fonts/');
  console.log('  3. Download WOFF2 files');
  console.log('  4. Place in public/fonts/\n');
  
  console.log('Option 2: Using fonttools (Python)');
  console.log('  1. Install: pip install fonttools brotli');
  console.log('  2. Run: fonttools ttLib.woff2 convert public/fonts/ibm-plex-sans-600.ttf\n');
  
  console.log('Option 3: CloudConvert API');
  console.log('  curl -X POST https://api.cloudconvert.com/v2/convert -H "Authorization: Bearer YOUR_API_KEY" \\');
  console.log('    -F "file=@public/fonts/ibm-plex-sans-600.ttf" \\');
  console.log('    -F "output_format=woff2"\n');
}

// Run conversion
convertWithWoff2Library();
