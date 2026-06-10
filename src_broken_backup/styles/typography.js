// src/styles/typography.js

export const typography = {
  // GRADIENTE GLOBAL (Purple Emerald - Gemini Style)
  gradient: "bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent transform",

  // Títulos de Página (Ej: Mesa de Contratación)
  // Minimalista: Sans-serif, tracking normal, weight medium/semibold. No más itálicas forzadas.
  pageTitle: "text-2xl md:text-3xl font-semibold tracking-tight text-white leading-tight",

  // Títulos de Sección (Ej: Sidebar, Encabezados de bloques)
  // Sutil y limpio. Menos ruido visual.
  sectionTitle: "text-xs font-semibold text-zinc-500 uppercase tracking-wide",

  // Nombre del postulante en la Card Principal
  // Limpio, grande pero fino.
  entityName: "text-2xl md:text-3xl font-medium text-zinc-100 tracking-tight",

  // Nombre del postulante dentro del Modal (Micro-jerarquía)
  modalEntityName: "text-sm font-semibold text-white tracking-wide",

  // Cuerpo de texto (Bio, descripciones cortas)
  // legible, color suave.
  body: "text-xs md:text-sm text-zinc-400 font-normal leading-relaxed",

  // Meta datos (Etiquetas de KPI, Roles secundarios)
  meta: "text-[10px] font-medium text-zinc-500 uppercase tracking-wider",

  // Valores numéricos técnicos (Distancia, Score, Turnos)
  // Tabular nums para alineación perfecta
  data: "font-semibold text-zinc-300 tabular-nums",

  // Texto dentro de botones y menús de acción
  action: "text-xs font-semibold tracking-wide"
};