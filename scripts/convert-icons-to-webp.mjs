import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import path from 'path';

const imageDir = './public/images';
const filesToConvert = [
  'heat_tech_pest_control_heat_treatment_icon.png',
  'checmical_treatment_icon.png'
];

async function convertToWebp() {
  console.log('🚀 Starting PNG to WebP conversion...\n');

  for (const file of filesToConvert) {
    const inputPath = path.join(imageDir, file);
    const outputPath = path.join(imageDir, file.replace('.png', '.webp'));

    try {
      // Get original file size
      const inputStats = await stat(inputPath);
      const inputSize = (inputStats.size / 1024 / 1024).toFixed(2);

      // Convert to WebP with quality 85 (good balance)
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);

      // Get WebP file size
      const outputStats = await stat(outputPath);
      const outputSize = (outputStats.size / 1024 / 1024).toFixed(2);
      const savings = (((inputStats.size - outputStats.size) / inputStats.size) * 100).toFixed(1);

      console.log(`✅ ${file}`);
      console.log(`   PNG:  ${inputSize} MB`);
      console.log(`   WebP: ${outputSize} MB`);
      console.log(`   Saved: ${savings}% (${((inputStats.size - outputStats.size) / 1024 / 1024).toFixed(2)} MB)\n`);
    } catch (error) {
      console.error(`❌ Error converting ${file}:`, error.message);
    }
  }

  console.log('✨ Conversion complete!');
}

convertToWebp();
