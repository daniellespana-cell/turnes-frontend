const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/R059/turnes_frontend/turnes-vite/src';

const index = {};

function walkSync(currentDirPath) {
    const files = fs.readdirSync(currentDirPath);
    files.forEach(function (name) {
        const filePath = path.join(currentDirPath, name);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
            if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Buscar export default
                const defaultMatch = content.match(/export default (\w+)/);
                if (defaultMatch) {
                    index[defaultMatch[1]] = filePath;
                } else {
                    // Si no dice export default Name, pero es un archivo jsx, asumimos que exporta el nombre del archivo
                    const baseName = path.basename(filePath, path.extname(filePath));
                    if (baseName[0] === baseName[0].toUpperCase()) {
                        index[baseName] = filePath;
                    }
                }

                // Buscar export const, export function
                const exportMatches = content.matchAll(/export (const|function|class) (\w+)/g);
                for (const match of exportMatches) {
                    index[match[2]] = filePath;
                }
            }
        } else if (stat.isDirectory()) {
            walkSync(filePath);
        }
    });
}

walkSync(srcPath);

fs.writeFileSync('exports_index.json', JSON.stringify(index, null, 2));
console.log(`Indexados ${Object.keys(index).length} exports locales.`);
