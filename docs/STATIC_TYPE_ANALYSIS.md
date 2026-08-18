# 🛡️ Static Type Analysis & Quality Gate Guide (AI / Dev Guardrails)

> **OBLIGATORIO PARA TODA IA Y DESARROLLADOR:**  
> Ninguna modificación en la base de código de Turnes puede ser entregada, comiteada o desplegada sin antes haber superado el guardián de análisis estático y pruebas en verde.

---

## 🎯 1. ¿Por qué existe este Guardián?

JavaScript es un lenguaje interpretado dinámicamente. Errores como `ReferenceError: variable is not defined` o `TypeError: cannot read properties of undefined` pueden pasar desapercibidos en compiladores básicos de empaquetado (como Vite/Rollup) si no se evalúa el grafo completo de símbolos léxicos.

Para garantizar **cero caídas en producción**, Turnes utiliza el compilador de TypeScript en modo guardián (`tsc --noEmit`) respaldado por `tsconfig.json`.

---

## ⚡ 2. El Comando Sagrado de Validación (`npm run check`)

Antes de finalizar cualquier tarea o hacer push a `origin/main`, **TODO AGENTE DE IA DEBE EJECUTAR OBLIGATORIAMENTE**:

```bash
npm run check
```

### ¿Qué hace `npm run check` tras bambalinas?
1. **`npm run typecheck` (`tsc --noEmit`):**
   * Lee el AST (Árbol de Sintaxis Abstracta) de todos los archivos en `src/`.
   * Verifica que todas las funciones, variables, imports y referencias existan y sean válidas.
   * **Tiempo de ejecución:** ~1.5 segundos.
2. **`npm run lint` (`eslint .`):**
   * Valida convenciones de código limpio, reglas de hooks de React y prohíbe variables no definidas (`no-undef`).
3. **`npm run test` (`vitest run`):**
   * Ejecuta la suite de pruebas unitarias y de integración de hooks.

---

## 📋 3. Protocolo de Acción para Agentes de IA

Cuando trabajes en este repositorio, sigue estrictamente este ciclo:

```
[ 1. Modificar Código ]
         ↓
[ 2. Ejecutar npm run check ]
         ↓
    ┌────┴────┐
  ¿Errores?  ¿En Verde?
    │         │
   SÍ         NO
    │         │
  Corregir    Proceder con Commit & Push
  la causa    (git commit / git push)
  raíz
```

---

## 🔍 4. Diagnóstico de Errores Comunes de `tsc`

| Error de `tsc` | Causa Raíz | Solución Correcta (Senior) |
| :--- | :--- | :--- |
| `Cannot find name 'X'` | Se invocó una variable `X` que no fue declarada o importada. | Declarar la variable o importar el módulo correspondiente en la cabecera. **Nunca inventar variables globales.** |
| `Cannot find module 'Y'` | La ruta del import está rota o el archivo fue renombrado/movido. | Corregir la ruta relativa o usar el alias `@/` configurado en `tsconfig.json`. |
| `Property 'Z' does not exist` | Se asume que un objeto tiene una propiedad que no está presente. | Usar optional chaining (`obj?.Z`) o validar la estructura antes de accederla. |

---

## 🚫 Prácticas Estrictamente Prohibidas

1. **PROHIBIDO** Usar directivas `// @ts-ignore` o `// @ts-nocheck` para silenciar errores en lugar de resolver la causa raíz.
2. **PROHIBIDO** Desactivar reglas del linter (`eslint.config.js`) para "hacer pasar" código roto.
3. **PROHIBIDO** Omitir el paso `npm run check` argumentando que *"Vite ya compiló"*.

---

## ⚙️ 5. Integración Continua (CI/CD)

El pipeline de GitHub Actions ([`.github/workflows/ci.yml`](file:///c:/Users/R059/turnes_frontend/turnes-vite/.github/workflows/ci.yml)) tiene configurado el paso:

```yaml
- name: 🛡️ Static Type Analysis (tsc)
  run: npm run typecheck
```

Cualquier Pull Request o commit que no supere `tsc --noEmit` será **automáticamente bloqueado y rechazado** por el sistema de integración continua.
