const fs = require('fs');
const content = fs.readFileSync('src/domain/geography.config.js', 'utf8');
const match = content.match(/export const CIUDADES_COORDS = ({[\s\S]*?});/);
if (match) {
  const code = 'const obj = ' + match[1] + '; return obj;';
  const CIUDADES_COORDS = new Function(code)();
  
  let sql = 'INSERT INTO public.ciudades_coords (nombre, lat, lng, departamento, activa)\nVALUES\n';
  const entries = Object.entries(CIUDADES_COORDS);
  
  const values = entries.map(([nombre, data]) => {
      const nameEscaped = nombre.replace(/'/g, "''");
      const depEscaped = data.departamento.replace(/'/g, "''");
      return `('${nameEscaped}', ${data.lat}, ${data.lng}, '${depEscaped}', true)`;
  });
  
  sql += values.join(',\n') + '\nON CONFLICT (nombre) DO UPDATE SET lat = EXCLUDED.lat, lng = EXCLUDED.lng, departamento = EXCLUDED.departamento, activa = EXCLUDED.activa;';
  
  fs.writeFileSync('supabase_ciudades_seed.sql', sql);
  console.log('SQL file generated!');
}
