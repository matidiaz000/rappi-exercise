# Decisiones de producto y técnicas

Este documento registra los criterios con los que resolví los puntos ambiguos del ejercicio y los
trade-offs que asumí. La consigna no fija varias de estas reglas; las decisiones buscan que la app
sea coherente frente al dinero, explícita frente al usuario y fácil de cambiar.

## 1. Multimoneda: nunca sumar ARS y USD

**Contexto.** La API permite tener cuentas en ARS y USD, pero no expone cotización ni conversión.
El enunciado pide mostrar "saldo en pesos y dólares".

**Decisión.**

- Los saldos se agrupan **por moneda**; nunca se muestra un total único que mezcle ARS y USD.
- Las transferencias entre cuentas de distinta moneda quedan **bloqueadas en el cliente** con una
  explicación visible: la API no convierte y no existe una cotización confiable en el sistema.
- Las cuentas de otra moneda aparecen deshabilitadas en el selector de destino, no ocultas, para que
  el usuario entienda por qué no puede elegirlas.
- El dominio de dinero (`domain/money/money.ts`) modela cada monto con `{ cents, currency }` y
  **lanza un error** si se intenta sumar o restar monedas distintas. Es una defensa en profundidad:
  si una feature intenta hacerlo, falla en desarrollo y en tests.

**Por qué.** Un saldo total mezclado sería un número incorrecto disfrazado de dato. Mostrar monedas
separadas es la opción honesta y la que mejor representa lo que la API realmente sabe.

## 2. Estados asincrónicos: el saldo cambia cuando la operación se completa

**Contexto.** La API crea transferencias en estado `pending` y las liquida unos 1,5 segundos después.
No hay websockets.

**Decisión.**

- El comprobante hace **polling cada segundo** mientras el estado sea `pending`.
- El polling se detiene en estados terminales (`completed` o `failed`) y no corre en segundo plano.
- Al llegar a un estado terminal se invalidan las queries de cuentas y transacciones. Así la
  billetera y el historial reflejan el cambio cuando el usuario vuelve.
- Mientras está pendiente se muestra un sello "En curso", se aclara que el saldo todavía no cambió y
  se evita dar a entender que el dinero ya se movió.
- Si la consulta falla, se muestra un error con reintento; no se asume un estado.

**Por qué.** El saldo mostrado tiene que coincidir con la realidad de la API. Actualizar optimisticamente
el saldo antes de la liquidación haría que un fallo posterior deje números mentirosos. La espera de
1,5 segundos es visible y explicada, no simulada.

## 3. Fondos insuficientes: bloquear en el cliente y respetar el 422

**Contexto.** La API rechaza con `422 Insufficient funds in source account`, pero también permite
que una cuenta quede con saldo negativo si se insiste por otros medios.

**Decisión.**

- El cliente valida el saldo disponible **antes** de abrir la confirmación y bloquea el envío con un
  mensaje que muestra el saldo real.
- El monto máximo se ofrece como atajo, pero no se autocompleta silenciosamente.
- Si aun así la API responde `422`, se traduce el error a lenguaje de producto y se mantiene el
  formulario abierto para corregir.
- Los gastos manuales del historial también se bloquean si superan el saldo de la cuenta, aunque la
  API los aceptaría.

**Por qué.** El usuario no debería llegar a un error evitable. El `422` sigue siendo la fuente de
verdad y se maneja como segunda barrera, no como reemplazo de la validación local.

## 4. Dinero en centavos enteros

**Decisión.** Todo el dominio usa centavos enteros (`number`) y la conversión a decimal ocurre solo
al llamar a la API o al formatear. El parseo acepta coma o punto decimal y puntos de miles, y rechaza
más de dos decimales, texto y montos fuera de rango.

**Por qué.** `0.1 + 0.2` no es `0.3` en punto flotante. Con dinero, ese error se acumula. Los enteros
hacen que sumas, restas y comparaciones sean exactas y testeables.

## 5. Sesión en `localStorage` (con límites explícitos)

**Decisión.** Se guarda `{ token, user, loggedInAt }` bajo una clave versionada. Al leer, se valida
con Zod; si el JSON o la forma son inválidos, se limpia la clave. La UI aclara que es una decisión de
la demo y que el token no expira.

**Por qué.** El enunciado pide persistir los datos del usuario para usarlos en endpoints futuros. En
producción, un token de sesión en `localStorage` es vulnerable a XSS; la alternativa correcta sería
una cookie `HttpOnly` emitida por el backend. Al ser una demo sin backend propio, se explicita el
límite en vez de esconderlo.

## 6. Registro y recuperación sin API

**Decisión.**

- El registro valida todos los campos y términos, muestra una pantalla de éxito y redirige al login
  con un aviso de que la cuenta es ilustrativa.
- "Olvidé mi usuario" y "Olvidé mi contraseña" responden siempre con el mismo mensaje neutro, sin
  revelar si el email existe.
- No se envían correos ni se crean usuarios.

**Por qué.** La consigna pide validación pero no conexión con la API. La respuesta neutra evita
convertir un flujo de demo en un oráculo de enumeración de cuentas.

## 7. Contactos de transferencia

**Contexto.** La API no tiene un endpoint para listar usuarios; solo autentica y opera sobre cuentas
del usuario.

**Decisión.** El directorio de contactos vive en `domain/contacts/contacts.ts`, construido a partir de
las cuentas del seed y excluyendo las del usuario actual. La UI aclara que es un directorio de
demostración.

**Por qué.** Sin directorio, la transferencia P2P no sería usable. Aislarlo en una sola pieza permite
reemplazarlo por un endpoint real sin tocar la pantalla ni las reglas.

## 8. Errores y validaciones

- Los errores de la API se traducen a mensajes de producto en `infrastructure/api/errors.ts`
  (`401`, `404`, `422`, errores por campo de `400`, fallas de red).
- Las validaciones de formulario viven en `domain` y devuelven errores por campo; la UI los asocia a
  cada input y mueve el foco al primero con error.
- Los estados de carga, error, vacío y reintento son componentes compartidos, para que ninguna
  pantalla invente su propio comportamiento.

## 9. Arquitectura y testeo

**Decisión.** Separar `domain`, `infrastructure`, `features` y `ui`, con dependencias hacia adentro.

- `domain` no conoce React ni `fetch`: se testea con Vitest puro.
- `infrastructure` concentra contratos, schemas y traducción de errores.
- Las features componen dominio + datos + UI.
- MSW intercepta la API en tests de integración; `onUnhandledFrame: "error"` hace fallar la suite ante
  requests no declarados, en lugar de esconderlos.

**Trade-offs asumidos.**

- No se agregó un framework de formularios: los formularios son pocos y la validación propia mantiene
  el dominio testeable sin dependencias extra.
- No se agregó un cliente de estado global: TanStack Query cubre el estado remoto y React local el
  resto.
- El polling es simple y suficiente para una demo; en producción se evaluaría SSE/websockets o
  notificaciones push.
- El bundle no se dividió por ruta: la app es chica y la prioridad fue claridad. Si creciera, el
  siguiente paso sería `React.lazy` por feature.

## 10. Diseño

La estética "Cauce" usa papel verde, tinta profunda y un acento verde billete, con tipografía de
display y cifras tabulares. La intención es que los montos y estados se lean como un registro
contable, no como una landing genérica. Los estados de dinero tienen color y sello propios
(`En curso`, `Completada`, `Fallida`) y los montos negativos o pendientes nunca dependen solo del
color.
