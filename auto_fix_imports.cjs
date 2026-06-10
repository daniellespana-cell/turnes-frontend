const fs = require('fs');
const path = require('path');

const missingVarsMap = JSON.parse(fs.readFileSync('missing_vars_map.json', 'utf8'));
const localExportsMap = JSON.parse(fs.readFileSync('exports_index.json', 'utf8'));

const reactRouterDomExports = ['Link', 'NavLink', 'Outlet', 'useNavigate', 'useLocation', 'useParams', 'useSearchParams', 'RouterProvider'];
const reactExports = ['React', 'useEffect', 'useState', 'useRef', 'useMemo', 'useCallback', 'Suspense', 'Fragment'];
const framerMotionExports = ['motion', 'AnimatePresence'];
const sonnerExports = ['Toaster', 'toast'];
const helmetExports = ['Helmet', 'HelmetProvider'];

let fixedCount = 0;

for (const [filePath, missingVars] of Object.entries(missingVarsMap)) {
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    const importsToAdd = {}; // modulePath -> Set of variables

    for (const v of missingVars) {
        let modulePath = null;
        let isDefault = false;

        if (reactExports.includes(v)) {
            modulePath = 'react';
            if (v === 'React') isDefault = true;
        } else if (reactRouterDomExports.includes(v)) {
            modulePath = 'react-router-dom';
        } else if (framerMotionExports.includes(v)) {
            modulePath = 'framer-motion';
        } else if (sonnerExports.includes(v)) {
            modulePath = 'sonner';
        } else if (helmetExports.includes(v)) {
            modulePath = 'react-helmet-async';
        } else if (localExportsMap[v]) {
            // Calcular ruta relativa
            const targetPath = localExportsMap[v];
            let rel = path.relative(path.dirname(filePath), targetPath);
            rel = rel.replace(/\\/g, '/');
            if (!rel.startsWith('.')) rel = './' + rel;
            // Remover extensión .jsx o .js
            rel = rel.replace(/\.jsx?$/, '');
            modulePath = rel;
            
            // Determinar si es default o nombrado
            // Heuristica basica: Si el nombre del componente es el nombre del archivo, es default
            const targetBase = path.basename(targetPath, path.extname(targetPath));
            if (targetBase === v) {
                isDefault = true;
            }
        } else {
            // Asumir lucide-react si empieza con mayuscula
            if (v[0] === v[0].toUpperCase()) {
                modulePath = 'lucide-react';
            }
        }

        if (modulePath) {
            if (!importsToAdd[modulePath]) importsToAdd[modulePath] = { default: null, named: new Set() };
            if (isDefault) {
                importsToAdd[modulePath].default = v;
            } else {
                importsToAdd[modulePath].named.add(v);
            }
        }
    }

    // Generar string de imports
    let importStatements = '';
    for (const [mod, types] of Object.entries(importsToAdd)) {
        const parts = [];
        if (types.default) parts.push(types.default);
        if (types.named.size > 0) parts.push(`{ ${Array.from(types.named).join(', ')} }`);
        
        if (parts.length > 0) {
            importStatements += `import ${parts.join(', ')} from '${mod}';\n`;
        }
    }

    if (importStatements) {
        content = importStatements + '\n' + content;
        fs.writeFileSync(filePath, content, 'utf8');
        fixedCount++;
    }
}

console.log(`Se han agregado importaciones a ${fixedCount} archivos.`);
