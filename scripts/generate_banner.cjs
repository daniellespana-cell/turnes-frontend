const sharp = require('sharp');
const fs = require('fs');

async function createBanner() {
  const width = 1200;
  const height = 630;
  
  const svgText = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#09090b" />
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#34d399;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#047857;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="12" height="100%" fill="url(#grad1)" />
      <g transform="translate(480, 260)">
        <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="#ffffff" letter-spacing="-1">TU OPERACIÓN</text>
        <text x="0" y="65" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="#34d399" letter-spacing="-1">NO PUEDE DETENERSE.</text>
        <text x="0" y="145" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="28" fill="#a1a1aa">Infraestructura del trabajo operativo · LATAM</text>
      </g>
    </svg>
  `;

  const logoPath = 'C:/Users/R059/.gemini/antigravity/brain/c226f87f-b186-474c-a7ad-d85f81329a17/uploaded_media_1783750148360.png';
  const outputPath = 'public/turnes_og_banner.png';

  try {
    const logoBuffer = await sharp(logoPath)
      .resize({ height: 400, fit: 'contain' })
      .toBuffer();

    await sharp(Buffer.from(svgText))
      .composite([
        {
          input: logoBuffer,
          top: 115,
          left: 100
        }
      ])
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outputPath);

    console.log('Banner generated successfully at', outputPath);
    const stat = fs.statSync(outputPath);
    console.log('Size:', stat.size / 1024, 'KB');
  } catch (error) {
    console.error('Error:', error);
  }
}

createBanner();
