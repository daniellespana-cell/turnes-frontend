# 📌 Turnes — Puntos Pendientes & Roadmap Estratégico

Documento central de seguimiento para futuras iteraciones y mejoras de la plataforma.

---

## 1. 📊 Analítica de Producto y Comportamiento de Usuario
- [ ] **Microsoft Clarity / Hotjar:**
  - Integrar script de analítica visual y mapas de calor en index.html.
  - Capturar grabaciones anónimas de sesión para optimizar la tasa de conversión de empresas y postulantes.
- [ ] **PostHog / Mixpanel:**
  - Medir embudos de conversión clave (Landing ➔ Clic en Turno Gratis ➔ Registro Completado ➔ Primera Vacante Publicada).

---

## 2. ⚡ Optimización de Rendimiento y Bundle (Vite)
- [ ] **rollup-plugin-visualizer:**
  - Instalar en devDependencies y configurar en vite.config.js para auditar el tamaño de cada chunk en KB.
- [ ] **vite-plugin-compression:**
  - Habilitar pre-compresión Brotli (.br) y Gzip (.gz) para descargas ultra-rápidas en redes móviles 3G/4G.

---

## 3. 💬 Comunicación de Alta Velocidad y Soporte
- [ ] **Widget de Soporte en Vivo (Landing):**
  - Añadir botón flotante de WhatsApp Business o widget de Crisp/Chatwoot para resolver dudas de contratación en tiempo real.
- [ ] **WhatsApp Cloud API (Meta API):**
  - Implementar alertas instantáneas de turnos urgentes por WhatsApp para personal operativo con radio < 3 km.

---

## 4. 🛡️ Seguridad Anti-Bot y Pagos
- [ ] **Cloudflare Turnstile:**
  - Reemplazar captchas invasivos por validación humana invisible en los formularios de registro y contacto.
- [ ] **Cobros Rápidos Wompi:**
  - Incorporar botones directos de recarga Nequi / Bancolombia QR en la Billetera.

---

*Última actualización: Agosto 2026*
