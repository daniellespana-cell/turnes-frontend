const msgs = [
  "No autenticado",
  "No autorizado o sesión inválida",
  "Token no contiene user ID",
  "No se pudo obtener el perfil",
  "No Authorization header provided",
  "OPENAI_API_KEY no configurada en Supabase"
];

for (const m of msgs) {
  const json = JSON.stringify({ error: m });
  console.log(`"${m}" -> length: ${Buffer.byteLength(json, 'utf8')}`);
}
