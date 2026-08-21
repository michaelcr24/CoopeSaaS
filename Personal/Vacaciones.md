# Módulo de Vacaciones

## 1. Objetivo

El módulo de Vacaciones permitirá administrar el derecho, saldo, solicitudes, aprobaciones, disfrute y control histórico de las vacaciones de los colaboradores de la cooperativa.

El módulo debe estar integrado directamente con el expediente del colaborador y permitir conocer en todo momento:

- Días acumulados.
- Días disfrutados.
- Días disponibles.
- Días solicitados.
- Periodos de vacaciones.
- Historial de vacaciones.
- Estado de cada solicitud.

> **Principio:** el saldo de vacaciones debe calcularse automáticamente a partir de los movimientos registrados y no debe depender de valores ingresados manualmente.

---

# 2. Estructura general

El módulo puede dividirse en:

```text
VACACIONES
│
├── Solicitudes
├── Saldos
├── Historial
├── Calendario
└── Configuración
    └── Tipos de vacaciones
```

---

# 3. Formulario de solicitud de vacaciones

## 3.1 Información del colaborador

- Colaborador
- Código de colaborador
- Departamento
- Puesto
- Jefatura
- Fecha de ingreso

Los datos del colaborador deben cargarse automáticamente al seleccionar el colaborador.

No deben ser digitados nuevamente.

---

# 4. Información de la solicitud

### Campos

- Número de solicitud
- Fecha de solicitud
- Tipo de vacaciones
- Fecha de inicio
- Fecha de finalización
- Cantidad de días solicitados
- Cantidad de días hábiles
- Observaciones del colaborador

### Número de solicitud

Debe generarse automáticamente.

Ejemplo:

```text
VAC-2026-000125
```

Esto facilitará la búsqueda y trazabilidad.

---

# 5. Tipo de vacaciones

El tipo debe provenir de un catálogo administrable.

Ejemplo:

- Vacaciones ordinarias
- Vacaciones acumuladas
- Vacaciones parciales
- Otro

La cooperativa podrá agregar o modificar los tipos desde la configuración del sistema.

---

# 6. Control del saldo

Esta sección debe mostrar información calculada automáticamente.

```text
┌─────────────────────────────────────┐
│ SALDO DE VACACIONES                 │
├─────────────────────────────────────┤
│ Saldo anterior:       18 días       │
│ Días generados:        2 días       │
│ Días disfrutados:      5 días       │
│ Días solicitados:      3 días       │
│                                     │
│ Disponible:           12 días       │
└─────────────────────────────────────┘
```

### Datos

- Saldo anterior
- Días generados
- Días disfrutados
- Días pendientes
- Días solicitados
- Saldo posterior

### Regla importante

El usuario **no debe poder modificar manualmente el saldo**.

El sistema debe calcular:

```text
Saldo disponible =
Saldo acumulado
+ Días generados
- Días disfrutados
- Días comprometidos
```

Antes de aprobar una solicitud, el sistema debe verificar que existan suficientes días disponibles.

---

# 7. Validaciones de la solicitud

El sistema debería realizar automáticamente varias validaciones.

### Validar saldo

No permitir solicitar más días de los disponibles.

### Validar fechas

La fecha final no puede ser anterior a la fecha inicial.

### Validar solicitudes duplicadas

El sistema debe detectar si el colaborador ya tiene vacaciones registradas durante ese periodo.

### Validar días no laborables

El sistema debería calcular automáticamente los días que corresponden según la configuración de la cooperativa.

### Validar anticipación

La cooperativa podría configurar una cantidad mínima de días para solicitar vacaciones con anticipación.

Ejemplo:

```text
Las vacaciones deben solicitarse
con al menos 5 días de anticipación.
```

Esta regla debe ser configurable.

---

# 8. Flujo de aprobación

La solicitud debe manejar un flujo de estados.

```text
BORRADOR
   ↓
PENDIENTE DE APROBACIÓN
   ↓
APROBADA
   ↓
DISFRUTADA
```

También pueden existir:

```text
RECHAZADA
CANCELADA
```

### Información de aprobación

- Responsable de aprobación
- Estado
- Fecha de aprobación
- Usuario que aprobó
- Comentario
- Fecha de rechazo, si aplica
- Motivo de rechazo

---

# 9. Rechazo de una solicitud

Cuando una jefatura rechace una solicitud, debe ser obligatorio registrar un motivo.

Ejemplo:

```text
Estado: Rechazada

Motivo:
Se requiere la presencia del colaborador durante
el periodo solicitado debido a cierre mensual.
```

Esto debe quedar registrado en el historial.

---

# 10. Cancelación

Una solicitud aprobada podría necesitar ser cancelada.

La cancelación debe registrar:

- Usuario que cancela
- Fecha
- Motivo
- Estado anterior
- Estado nuevo

Cuando una solicitud aprobada sea cancelada, los días comprometidos deben regresar automáticamente al saldo disponible, según las reglas configuradas.

---

# 11. Calendario de vacaciones

El módulo debe incluir un calendario.

Este permitirá visualizar las vacaciones de todos los colaboradores.

### Información mostrada

- Nombre del colaborador
- Departamento
- Fecha de inicio
- Fecha final
- Cantidad de días
- Estado

Ejemplo:

```text
AGOSTO 2026

Colaborador        10  11  12  13  14  15  16
────────────────────────────────────────────────
Juan Pérez          🏖️  🏖️  🏖️  🏖️
María Rodríguez                 🏖️  🏖️
Carlos Soto             🏖️  🏖️
```

### Filtros

El calendario debería permitir filtrar por:

- Departamento
- Sede
- Puesto
- Colaborador
- Estado
- Periodo

---

# 12. Alertas

El sistema puede generar alertas relacionadas con vacaciones.

### Para el colaborador

- Solicitud recibida.
- Solicitud aprobada.
- Solicitud rechazada.
- Solicitud cancelada.
- Próximo inicio de vacaciones.

### Para la jefatura

- Nueva solicitud pendiente.
- Varios colaboradores ausentes simultáneamente.
- Solicitud próxima a iniciar.

### Para Recursos Humanos

- Saldos pendientes.
- Vacaciones acumuladas.
- Solicitudes pendientes.
- Periodos próximos.
- Situaciones que requieran revisión.

---

# 13. Historial de vacaciones

Cada colaborador debe tener un historial completo.

Ejemplo:

| Solicitud | Periodo | Días | Estado |
|---|---|---:|---|
| VAC-2026-001 | 05/01/2026 - 09/01/2026 | 5 | Disfrutada |
| VAC-2026-018 | 20/04/2026 - 22/04/2026 | 3 | Disfrutada |
| VAC-2026-125 | 10/08/2026 - 12/08/2026 | 3 | Aprobada |

El historial debe poder consultarse desde el expediente del colaborador.

---

# 14. Documentos

La solicitud puede permitir adjuntar documentos cuando sean necesarios.

### Información

- Tipo de documento
- Nombre
- Archivo
- Fecha de carga
- Usuario que cargó
- Observaciones

Ejemplos:

- Solicitud firmada.
- Autorización.
- Documento administrativo.
- Otro.

---

# 15. Auditoría

Todas las operaciones importantes deben quedar registradas.

### Registrar

- Usuario
- Fecha
- Hora
- Acción
- Estado anterior
- Estado nuevo
- Campo modificado
- Valor anterior
- Valor nuevo

Ejemplo:

```text
Solicitud: VAC-2026-000125

18/08/2026 09:32
Usuario: María Rodríguez
Acción: Aprobación

Estado:
Pendiente → Aprobada
```

---

# 16. Saldos de vacaciones

El sistema debe mantener un registro de movimientos que permita reconstruir el saldo.

Ejemplo:

```text
SALDO INICIAL
        +
DÍAS GENERADOS
        +
AJUSTES
        -
DÍAS DISFRUTADOS
        -
DÍAS COMPROMETIDOS
        =
SALDO DISPONIBLE
```

Esto es preferible a almacenar únicamente un campo:

```text
dias_disponibles = 15
```

porque un sistema de gestión necesita poder explicar **cómo se llegó a ese saldo**.

---

# 17. Movimientos del saldo

Cada movimiento debería registrar:

- Colaborador
- Fecha
- Tipo de movimiento
- Cantidad de días
- Saldo anterior
- Saldo posterior
- Referencia
- Motivo
- Usuario

### Tipos de movimiento

- Saldo inicial
- Acumulación
- Disfrute
- Ajuste positivo
- Ajuste negativo
- Corrección
- Cancelación de vacaciones

Ejemplo:

```text
18/08/2026

Tipo: Disfrute
Días: -3

Saldo anterior: 15
Saldo posterior: 12

Referencia:
VAC-2026-000125
```

---

# 18. Configuración

El módulo debe tener una sección de configuración para que la cooperativa pueda adaptar las reglas.

### Configuraciones

- Tipos de vacaciones
- Forma de cálculo
- Días de vacaciones generados
- Periodicidad de acumulación
- Días mínimos de anticipación
- Reglas de aprobación
- Estados
- Reglas de cancelación
- Días laborables
- Feriados
- Límites de acumulación, si aplican

Estas configuraciones deberían ser administrables por usuarios autorizados.

---

# 19. Integración con Personal

El módulo debe estar conectado con el expediente del colaborador.

Desde:

**Personal → Colaborador → Vacaciones**

se debería poder visualizar:

```text
┌─────────────────────────────────────┐
│ VACACIONES                          │
├─────────────────────────────────────┤
│ Disponible:          12 días        │
│ Comprometido:         3 días        │
│ Disfrutado año:       8 días        │
│ Generado año:        18 días        │
└─────────────────────────────────────┘

[Solicitar vacaciones]

Historial
─────────────────────────────────────
05/01/2026     5 días     Disfrutada
20/04/2026     3 días     Disfrutada
10/08/2026     3 días     Aprobada
```

---

# 20. Integración futura

El módulo de vacaciones debe quedar preparado para integrarse con:

```text
Personal
   │
   └── Colaborador
          │
          ├── Vacaciones
          ├── Permisos
          ├── Incapacidades
          ├── Asistencia
          ├── Nómina
          ├── Evaluaciones
          └── Capacitaciones
```

De esta manera, la información de cada colaborador se registra una sola vez.

---

# 21. Panel de control

El módulo podría incluir un dashboard para Recursos Humanos.

### Indicadores

- Colaboradores activos
- Solicitudes pendientes
- Vacaciones aprobadas
- Colaboradores actualmente de vacaciones
- Días disfrutados
- Días disponibles
- Días acumulados
- Solicitudes rechazadas
- Solicitudes próximas a iniciar

### Ejemplo

```text
┌───────────────┬───────────────┬───────────────┐
│ Pendientes    │ De vacaciones │ Días usados   │
│      8        │       5       │      126      │
└───────────────┴───────────────┴───────────────┘

Solicitudes pendientes
────────────────────────────────────
Juan Pérez          3 días
María Rodríguez     5 días
Carlos Soto         2 días
```

---

# 22. Recomendación de arquitectura

El módulo debería manejar al menos estas entidades:

```text
colaboradores
      │
      ├── vacaciones_saldos
      │
      ├── vacaciones_movimientos
      │
      └── vacaciones_solicitudes
                  │
                  ├── aprobaciones
                  ├── documentos
                  └── auditoria
```

Esta estructura permite separar:

- El colaborador.
- El saldo.
- Los movimientos que modifican el saldo.
- Las solicitudes.
- Las aprobaciones.
- Los documentos.
- La auditoría.

Esto hará que el módulo sea mucho más robusto y permitirá posteriormente generar reportes confiables.

---

# 23. Principios del módulo

El módulo de Vacaciones debe cumplir principalmente con estos principios:

1. **El saldo se calcula automáticamente.**
2. **No se deben eliminar movimientos históricos.**
3. **Toda solicitud debe tener trazabilidad.**
4. **Las aprobaciones deben quedar registradas.**
5. **Las cancelaciones deben revertir correctamente los días comprometidos.**
6. **El calendario debe reflejar las ausencias aprobadas.**
7. **Las reglas deben ser configurables.**
8. **Los datos deben estar relacionados con el expediente del colaborador.**
9. **Los permisos de acceso deben ser controlados.**
10. **El sistema debe poder explicar cómo se obtuvo cualquier saldo.**

> **Resultado esperado:** Recursos Humanos debe poder consultar el expediente de cualquier colaborador y conocer de forma inmediata su saldo actual, historial, solicitudes pendientes, vacaciones programadas y movimientos que explican cada cambio en su saldo.