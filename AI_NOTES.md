# Notas sobre el uso de IA

Este ejercicio se construyó con un agente de código (OpenCode) como par de programación. Estas notas
documentan cómo se dirigió el trabajo, qué se verificó y qué quedó fuera, para que el resultado sea
auditable y no una caja negra.

## Estrategia de prompting

El trabajo se dividió en iteraciones con un objetivo verificable cada una:

1. **Leer antes de escribir.** Primero se inspeccionaron la consigna, el `mock-api` (`index.ts`,
   `seed.ts`, tests) y el seed real. Las reglas de la API — login, `422` por fondos insuficientes,
   transferencias `pending` que liquidan a los ~1,5 s, ausencia de directorio de usuarios — se
   tomaron del código, no de suposiciones.
2. **Definir el dominio antes de la UI.** Se acordaron las reglas de dinero, transferencia, sesión y
   filtros. Recién después se construyeron pantallas.
3. **Pedir decisiones explícitas.** Los puntos ambiguos (multimoneda, estados asincrónicos, saldo
   insuficiente, registro sin API) se resolvieron de forma visible y quedaron en `DECISIONS.md`.
4. **Cerrar cada iteración con verificación.** Typecheck, build, tests y, al final, un smoke test en
   navegador real.

Los prompts fueron concretos y acotados: "implementá la pantalla X usando el dominio Y", "agregá
tests para esta regla", "revisá por qué este flujo no abre el modal". Evité pedir "hacé toda la app"
en un solo paso porque vuelve imposible revisar el resultado.

## Qué se generó con IA y cómo se revisó

| Área | Verificación |
| --- | --- |
| Dominio de dinero, transferencias, historial y contactos | Tests unitarios de Vitest sobre casos borde (centavos, monedas distintas, saldo exacto, misma cuenta, filtros inválidos). |
| Cliente HTTP y errores | Tests de traducción de `400`, `401`, `404`, `422`, red y mensajes desconocidos. |
| Sesión en `localStorage` | Tests de round-trip, JSON inválido, forma inválida y limpieza. |
| Login | Test de integración con MSW: campos vacíos, credenciales de demo, login exitoso y error `401`. |
| Pantallas | Build de producción (`tsc -b && vite build`) y smoke test con Chrome headless. |
| Transferencia completa | Smoke test: login → selección de contacto → monto → confirmación → comprobante `pending` → `completed` → billetera actualizada. |

Los tests se escribieron contra el comportamiento observable (textos, roles, requests), no contra
detalles internos. Antes de dar por buena una pantalla se ejecutó el build, no solo el dev server: los
errores de TypeScript con `noUnusedLocals` y `verbatimModuleSyntax` aparecen ahí.

## Verificación en navegador

Además de la suite automatizada, se corrió un smoke test con `puppeteer-core` sobre Chrome real
(la CLI de Playwright no estaba disponible en el entorno). El script:

- inicia sesión con las credenciales de demo;
- recorre billetera, historial, transferir, cuenta, recuperación y registro;
- verifica que una ruta protegida redirija al login sin sesión;
- completa una transferencia real contra el `mock-api` y espera el cambio de estado;
- captura errores de consola, `pageerror` y requests fallidos.

Las capturas de `docs/screenshots/` salen de ese recorrido. Después de la prueba de transferencia se
volvió a correr `npm run seed` en el `mock-api` para dejar la base en su estado inicial.

Durante el smoke test apareció un falso negativo: el modal de confirmación no se abría en el script.
El diagnóstico mostró que el botón "Revisar transferencia" se clickeaba antes de que React habilitara
el formulario; el problema era del script, no de la UI. Se corrigió esperando el estado habilitado y
el flujo completo pasó.

## Qué no se automatizó

- No hay tests E2E versionados dentro del repo: el smoke test vive fuera del proyecto y se usó como
  verificación manual asistida. El siguiente paso natural sería incorporar Playwright con un servidor
  de prueba y datos sembrados.
- No se testearon visualmente todos los breakpoints; se revisó el layout responsive en el navegador
  durante el recorrido.
- No se probó con lectores de pantalla reales. Se usaron etiquetas, roles, foco visible y `aria-live`,
  pero una auditoría de accesibilidad completa queda pendiente.
- El registro y la recuperación no tienen integración real porque la consigna lo impide.

## Riesgos y límites conocidos

- **Token en `localStorage`**: es una decisión de demo, explicitada en la UI y en `DECISIONS.md`. En
  producción correspondería una cookie `HttpOnly`.
- **Contactos hardcodeados**: la API no lista usuarios. Están aislados en un módulo para reemplazarlos
  por un endpoint real.
- **Polling**: suficiente para esta demo, pero no escala como mecanismo de notificación.
- **Bundle único**: no se hizo code splitting por ruta; la app es chica y se priorizó claridad.

## Cómo reproducir la verificación

```bash
# Terminal 1
cd mock-api
npm install
npm run seed
npm run dev

# Terminal 2
cd frontend
npm install
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

Luego abrir `http://localhost:5173` e ingresar con `demo@example.com / demo123`.
