const sharp = require('sharp');
const fs = require('fs');

async function createBanner() {
  const width = 1200;
  const height = 628;
  
  // The user's exact uploaded file
  const logoPath = 'C:/Users/R059/.gemini/antigravity/brain/c226f87f-b186-474c-a7ad-d85f81329a17/uploaded_media_1783750148360.png';
  const outputPath = 'public/turnes_og_banner.png';

  try {
    // We take the user's logo, resize it so it fits nicely inside a 1200x628 canvas,
    // and pad the rest of the canvas with #f4f4f4 (a subtle off-white to match the paper texture of the original image)
    
    await sharp(logoPath)
      .resize({
        width: 1200,
        height: 628,
        fit: 'contain',
        background: { r: 244, g: 244, b: 244, alpha: 1 }
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outputPath);

    console.log('Senior OG banner generated successfully at', outputPath);
    const stat = fs.statSync(outputPath);
    console.log('Size:', stat.size / 1024, 'KB');
  } catch (error) {
    console.error('Error:', error);
  }
}

createBanner();
