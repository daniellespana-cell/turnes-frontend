# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## 📚 Documentación de Arquitectura y Especificaciones (SSOT)

- [🔔 Especificación de Notificaciones y Mensajería (SSOT)](docs/NOTIFICATIONS_SYSTEM_SPEC.md): Guía de aislamiento de dominios entre Notificaciones de Sistema (Campanita 🔔) y Mensajería Privada (Chat 💬).
- [🏗️ Blueprint de Arquitectura](docs/ARCHITECTURE_BLUEPRINT.md): Estándares de diseño, Mobile-First y Clean Architecture de Turnes.
- [💬 Arquitectura del Servicio de Chat](docs/chat_service.md): Protocolo y manejo de estado en tiempo real.

