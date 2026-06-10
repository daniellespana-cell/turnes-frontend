const fs = require('fs');
const path = require('path');

const logPath = 'C:/Users/R059/.gemini/antigravity/brain/89158365-49cc-4f9d-97ee-0ef09ccbf5c3/.system_generated/tasks/task-2940.log';
const log = fs.readFileSync(logPath, 'utf8');

const lines = log.split('\n');

const fileMissingVars = {};
let currentFile = null;

for (const line of lines) {
    if (line.trim() === '') continue;
    
    // Si la linea no empieza con espacio, es una ruta de archivo
    if (line.match(/^[a-zA-Z]:\\/)) {
        currentFile = line.trim();
        if (!fileMissingVars[currentFile]) {
            fileMissingVars[currentFile] = [];
        }
    } else if (currentFile && line.includes('unused-imports/no-unused-imports')) {
        const match = line.match(/'([^']+)' is defined but never used/);
        if (match && match[1]) {
            fileMissingVars[currentFile].push(match[1]);
        }
    }
}

console.log(`Encontrados ${Object.keys(fileMissingVars).length} archivos afectados.`);
fs.writeFileSync('missing_vars_map.json', JSON.stringify(fileMissingVars, null, 2));
