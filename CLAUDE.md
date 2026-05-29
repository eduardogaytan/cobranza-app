# CLAUDE.md — Sistema de Cobranza (Efecticora)

Este archivo contiene todo el contexto del proyecto para que Claude Code pueda trabajar en él sin necesidad de re-explicaciones. Léelo completo antes de hacer cualquier cambio.

---

## Descripción del negocio

App de cobranza semanal para una **financiera de microcréditos** con rutas en campo atendidas por asesores. Los asesores visitan clientes cada semana, registran abonos, y envían un cierre a la administradora para su aprobación.

**Operación actual:**
- Jalisco: 4 rutas
- Michoacán: 3 rutas
- Querétaro: 1 ruta
- Total: 8 rutas activas (escalable — se irán agregando)

Cada ruta tiene múltiples **poblados**, y cada poblado tiene múltiples **clientes** con créditos activos.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite |
| Base de datos | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Repositorio | GitHub (`eduardogaytan/cobranza-app`) |

**Variables de entorno requeridas (Vercel):**
```
VITE_SUPABASE_URL=https://uyrgczbcpxtucpdenqpi.supabase.co
VITE_SUPABASE_KEY=<guardada en Vercel, nunca en el código>
```

> ⚠️ NUNCA escribir la SUPABASE_KEY directamente en el código. Siempre usar `import.meta.env.VITE_SUPABASE_KEY`.

---

## Estructura del repositorio

```
cobranza-app/
├── index.html
├── main.jsx
├── manifest.json
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx          ← componente raíz + toda la lógica actual
    └── main.jsx
```

> ⚠️ PROBLEMA CONOCIDO: Todo el código vive en un solo archivo `App.jsx` (~1,100 líneas). Esto agota el contexto rápidamente. Al refactorizar, separar en módulos bajo `src/components/` y `src/screens/`.

---

## Base de datos — Tablas en Supabase

### `rutas`
Representa cada ruta de cobranza.
```
id, nombre, estado
```
- `estado`: "Jalisco", "Michoacán", "Querétaro"

### `poblados`
Subgrupos dentro de una ruta.
```
id, nombre, ruta_id, numero
```
- `ruta_id` → FK a `rutas`
- `numero`: orden del poblado dentro de la ruta

### `asesores`
Usuarios del sistema (asesores de campo + administradora).
```
id, nombre, email, password_hash, ruta_id, es_admin
```
- `es_admin = true` → accede al panel de administración
- `password_hash`: actualmente se guarda texto plano (pendiente de mejorar)
- `ruta_id` → FK a `rutas` (un asesor pertenece a una ruta)

### `clientes`
Cada cliente con su crédito activo.
```
id, poblado_id, codigo, nombre, activo,
monto_credito, pago_con_intereses, abono_original,
plazo, fecha_ingreso, fecha_inicio_cobro,
cobro_semana, num_semana,
domicilio, celular,
aval_nombre, aval_domicilio, aval_celular
```
- `activo = false` cuando el crédito se liquida o se renueva
- `cobro_semana`: lo que debe pagar esta semana (incluye adeudos acumulados)
- `abono_original`: el abono semanal base del crédito
- `pago_con_intereses`: saldo total pendiente
- `num_semana`: número de semana actual del crédito

**Regla crítica de cartera vencida:**
```
cartera_vencida = cobro_semana - abono_original
```
Solo es cartera vencida si `cobro_semana > abono_original`. Si es <= 0, el cliente está al corriente.

### `cobros`
Registro de cada abono capturado por un asesor.
```
id, cliente_id, semana_id, asesor_id,
abono, cobro_semana, pago_pendiente,
observaciones, enviado, aprobado,
fecha_registro, pre_guardado
```
- `enviado = false`: pre-guardado (borrador)
- `enviado = true, aprobado = false`: enviado, pendiente de revisión admin
- `enviado = true, aprobado = true`: aprobado, datos del cliente actualizados

### `semanas`
Semana activa de cobranza.
```
id, fecha_inicio, fecha_fin, activa
```
- Solo debe haber UNA semana con `activa = true` a la vez
- Si no hay semana activa, los asesores no pueden registrar cobros

### `cierres`
(Tabla existente — verificar uso actual vs tabla `cobros`)

### `tipos_credito`
Catálogo de productos de crédito disponibles para renovaciones.
```
id, monto, plazo, abono, total_credito
```

### `resumen_rutas`
(Vista o tabla de resumen — verificar si es view o tabla real)

---

## Flujo de trabajo principal

```
1. ASESOR inicia sesión
2. Selecciona su ruta → poblado → semana
3. Registra abonos cliente por cliente (puede pre-guardar)
4. El lunes envía el cierre completo
5. ADMIN recibe el cierre en panel "Revisar"
6. ADMIN aprueba → se actualizan los saldos de todos los clientes
7. ADMIN puede rechazar → el asesor corrige y reenvía
```

**Regla de edición por semana:**
- Semana actual: siempre editable
- Semana anterior: editable solo el lunes
- Semanas más antiguas: solo lectura

---

## Bugs conocidos y activos

### Bug 1 — Cartera vencida incorrecta al cargar Excel ⚠️ PRIORITARIO
**Síntoma:** Al importar clientes desde Excel, `cobro_semana` no se calcula correctamente, lo que genera carteras vencidas falsas o incorrectas.
**Causa probable:** En `CargaExcelModal`, la línea:
```js
const cobro_semana = parseFloat(row[9]) || abono;
```
Si la columna 9 del Excel viene vacía o con formato incorrecto, toma `abono` como fallback pero no verifica si ya existe adeudo previo.
**Solución:** Validar y limpiar cada campo numérico del Excel antes de insertar. Si `cobro_semana` viene vacío, debe ser igual a `abono_original` (cliente nuevo, sin adeudo).

### Bug 2 — Abonos bloqueados en semana actual ⚠️ PRIORITARIO
**Síntoma:** Ciertas rutas no permiten modificar abonos aunque estén en la semana activa.
**Causa probable:** La función `isEditable()` verifica contra `getWeekBounds()` usando la fecha local del dispositivo. Si el dispositivo tiene fecha/hora incorrecta, bloquea la edición. También puede fallar si `semanas.activa` no está correctamente configurada en Supabase.
**Solución:** Verificar que existe una semana activa en Supabase. La edición debe basarse en `semanas.activa = true`, no solo en la fecha del dispositivo.

### Bug 3 — Filtro invertido al aprobar cierres 🔴 CRÍTICO
**Síntoma:** Al aprobar un cierre, los clientes sin cobro de la semana acumulan deuda incorrectamente (se procesan clientes de otras rutas).
**Causa:** En `aprobarCierre`, el filtro está al revés:
```js
// INCORRECTO — procesa clientes que NO son de la ruta:
if (!cl.poblado || cl.poblado.ruta_id !== parseInt(rutaId)) continue;

// CORRECTO — debe procesar solo los de la ruta:
if (!cl.poblado || cl.poblado.ruta_id === parseInt(rutaId)) continue;
// (o quitar el continue y dejar solo los que sí son de la ruta)
```
**Solución:** Corregir el filtro y agregar log para verificar qué clientes se están procesando.

### Bug 4 — Semana activa requerida pero frágil
**Síntoma:** Si no hay semana con `activa = true` en Supabase, la pantalla de cobros falla silenciosamente.
**Solución:** Agregar validación explícita y mensaje de error claro cuando no hay semana activa.

---

## Reglas para hacer cambios

1. **Un bug a la vez.** No mezclar correcciones de bugs con refactorizaciones.
2. **Cambios sistémicos primero.** Si un bug existe en múltiples rutas, la corrección debe aplicarse en el lugar central, no ruta por ruta.
3. **Nunca hardcodear credenciales.** Siempre `import.meta.env.VITE_*`.
4. **Probar en la semana activa.** Después de cualquier cambio en lógica de cobros, verificar que `semanas` tenga una fila con `activa = true`.
5. **El dueño no es programador.** Las instrucciones deben ser claras: decir exactamente en qué archivo pegar el código y si va en Supabase SQL o en GitHub.

---

## Cómo dar instrucciones a Claude Code

Eduardo trabaja así:
- Describe el problema o lo que quiere en lenguaje natural
- Claude Code responde con el código exacto a pegar
- Siempre especificar: **¿va en `App.jsx`? ¿En qué línea? ¿O es SQL para Supabase?**
- Si hay dudas, preguntar antes de asumir

---

## Próximas mejoras planeadas

- [ ] Separar `App.jsx` en componentes individuales (`/src/screens/`, `/src/components/`)
- [ ] Autenticación real con Supabase Auth (en lugar de query por email/password)
- [ ] Historial de pagos por cliente
- [ ] Notificaciones push para asesores (recordatorio de cierre)
- [ ] Dashboard de cartera vencida por estado en tiempo real
- [ ] App móvil nativa (actualmente es web responsive)
- [ ] ## Seguridad — PRIORIDAD INMEDIATA

- [ ] 1. Mover SUPABASE_KEY a variable de entorno en Vercel (VITE_SUPABASE_KEY)
- [ ] 2. Activar Row Level Security (RLS) en todas las tablas de Supabase
- [ ] 3. Reemplazar login actual por Supabase Auth

---

## Contexto adicional

- El negocio opera en México (moneda: MXN, formato: `$1,234`)
- Los cobros son **semanales**, los lunes es el día de cierre
- Un cliente puede tener solo **un crédito activo** a la vez
- La **renovación** liquida el crédito anterior y crea uno nuevo
- Los clientes se cargan masivamente desde Excel con una plantilla específica
- Los reportes semanales se generan en PDF por estado (jsPDF + autoTable)
