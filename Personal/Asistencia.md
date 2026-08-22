# Módulo de Asistencia

## 1. Objetivo

El módulo de **Asistencia** permitirá registrar y consultar la asistencia de los colaboradores de la cooperativa.

El sistema debe contemplar dos modalidades:

1. **Carga masiva:** para cooperativas que ya cuentan con un sistema de marcación.
2. **Marcación desde el sistema:** para cooperativas que no cuentan con un sistema propio.

> **Principio:** el módulo no busca reemplazar sistemas especializados de marcación. Su función principal será centralizar, validar y relacionar la información de asistencia con los colaboradores, horarios, vacaciones, permisos e incapacidades.

---

## 2. Pantalla principal

La pantalla principal debe ser sencilla y presentar las principales acciones:

```text
┌──────────────────────────────────────────────────────┐
│ ASISTENCIA                                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│ [ 📥 Cargar asistencia ]  [ 📄 Descargar plantilla ]│
│                                                      │
│ [ 🕐 Marcar asistencia ]                             │
│                                                      │
├──────────────────────────────────────────────────────┤
│ RESUMEN DE HOY                                       │
│                                                      │
│ Presentes     Tardanzas     Ausentes     Justificar  │
│     38            3             2            4       │
└──────────────────────────────────────────────────────┘
```

---

## 3. Carga masiva

Esta será la principal opción para cooperativas que ya utilizan un sistema de marcación.

### 3.1 Descargar plantilla

El sistema permitirá descargar una plantilla en:

- Excel (`.xlsx`)
- CSV

La plantilla debe contener únicamente los datos necesarios para importar las marcaciones.

### Campos

| Campo | Obligatorio | Descripción |
|---|---|---|
| Identificación | Sí | Identificación del colaborador |
| Fecha | Sí | Fecha de la marcación |
| Hora entrada | Sí | Hora registrada de entrada |
| Hora salida | No | Hora registrada de salida |
| Observación | No | Observación de la marcación |

> No se deben solicitar en la plantilla datos como nombre, departamento o puesto, ya que estos datos existen en el expediente del colaborador.

---

## 4. Importación de archivo

El proceso debe realizarse en dos pasos.

### Paso 1 — Cargar archivo

```text
┌─────────────────────────────────────────┐
│ Cargar asistencia                       │
│                                         │
│ Arrastre el archivo aquí                │
│                                         │
│       [ Seleccionar archivo ]            │
│                                         │
│ Formatos: XLSX, CSV                     │
└─────────────────────────────────────────┘
```

### Paso 2 — Validación

Antes de guardar los datos, el sistema debe validar el archivo.

```text
Registros encontrados:        850

✓ Registros válidos:          842
⚠ Registros con advertencia:    5
✕ Registros con error:          3
```

---

## 5. Errores y advertencias

El sistema debe indicar exactamente qué registros presentan problemas.

```text
Fila 23
Identificación: 1-4444-4444
✕ Colaborador no encontrado.

Fila 87
Identificación: 1-5555-5555
✕ Formato de hora inválido.

Fila 120
Identificación: 1-6666-6666
⚠ Ya existe una marcación para esa fecha.
```

El usuario debe poder corregir el archivo y volver a cargarlo.

---

## 6. Cálculo automático

Una vez importadas las marcaciones, el sistema utilizará:

```text
Colaborador
     +
Fecha
     +
Horario asignado
     ↓
Estado de asistencia
```

El sistema obtiene automáticamente del expediente:

- Colaborador.
- Horario.
- Departamento.
- Puesto.
- Jornada.

---

## 7. Tolerancia de entrada

La cooperativa podrá configurar una tolerancia para determinar cuándo una entrada se considera tardía.

### Valor predeterminado

**15 minutos**

Ejemplo:

```text
Horario: 08:00

08:00 → Puntual
08:05 → Puntual
08:10 → Puntual
08:15 → Puntual
08:16 → Tardanza
08:25 → Tardanza
```

La tolerancia debe ser configurable:

```text
Tolerancia de entrada: [ 15 ] minutos
```

---

## 8. Tardanzas

Cuando un colaborador supere la tolerancia establecida, el sistema debe marcar la asistencia como:

**Tardanza**

Ejemplo:

```text
Colaborador: Juan Pérez

Horario:       08:00
Entrada:       08:27
Tolerancia:    15 minutos

Tardanza:       27 minutos

Estado:
⚠ Tardanza
```

La tardanza puede quedar:

- Registrada.
- Pendiente de justificación.
- Justificada.
- No justificada.

---

## 9. Justificación

Cuando corresponda, el usuario autorizado podrá justificar una tardanza o ausencia.

### Formulario

- Colaborador
- Fecha
- Tipo de incidencia
- Motivo
- Descripción
- Documento adjunto
- Observaciones

### Estados

```text
PENDIENTE
    ↓
EN REVISIÓN
    ↓
APROBADA
```

O:

```text
RECHAZADA
```

---

## 10. Marcación desde el sistema

Para cooperativas que no cuentan con un sistema de marcación, se podrá habilitar la opción:

**🕐 Marcar asistencia**

El colaborador debe ingresar al sistema con su usuario.

El sistema identificará automáticamente:

- Usuario.
- Colaborador.
- Horario.
- Fecha.
- Hora actual.

---

## 11. Marcación de entrada

La pantalla debe ser muy sencilla:

```text
┌──────────────────────────────────┐
│                                  │
│       Buenos días, Juan          │
│                                  │
│       Miércoles 19 agosto        │
│              07:58               │
│                                  │
│      [ 🟢 MARCAR ENTRADA ]       │
│                                  │
└──────────────────────────────────┘
```

Al marcar:

```text
Entrada registrada: 07:58

Horario: 08:00
Tolerancia: 15 minutos

✓ Entrada puntual
```

---

## 12. Marcación tardía

Si la hora supera la tolerancia:

```text
Entrada registrada: 08:23

Horario: 08:00
Tolerancia: 15 minutos

⚠ Tardanza: 23 minutos
```

El sistema puede indicar:

**[ Justificar tardanza ]**

---

## 13. Marcación de salida

Durante la jornada se mostrará:

```text
┌──────────────────────────────────┐
│       Entrada registrada         │
│                                  │
│       07:58                      │
│                                  │
│       [ 🔴 MARCAR SALIDA ]       │
└──────────────────────────────────┘
```

Al marcar la salida, el sistema calcula automáticamente:

- Horas trabajadas.
- Salida anticipada.
- Tiempo adicional.

---

## 14. Integración con otros módulos

El módulo debe consultar automáticamente:

```text
                    ASISTENCIA
                        │
          ┌─────────────┼─────────────┐
          │             │             │
     Vacaciones      Permisos    Incapacidades
          │             │             │
          └─────────────┼─────────────┘
                        │
                 Estado del día
```

Ejemplo:

Si un colaborador no tiene marcación, pero tiene una incapacidad activa:

```text
Sin marcación
      ↓
Incapacidad activa
      ↓
🏥 INCAPACIDAD
```

No debe registrarse como ausencia injustificada.

---

## 15. Estados de asistencia

El sistema puede utilizar:

- Presente
- Tardanza
- Ausente
- Ausencia justificada
- Vacaciones
- Permiso
- Incapacidad
- Feriado
- Día libre
- Trabajo remoto

---

## 16. Consulta de asistencia

El módulo debe permitir consultar la asistencia por:

- Fecha.
- Periodo.
- Colaborador.
- Departamento.
- Estado.

### Ejemplo

| Colaborador | Entrada | Salida | Estado |
|---|---:|---:|---|
| Juan Pérez | 07:58 | 17:02 | ✓ Presente |
| María Rodríguez | 08:21 | 17:00 | ⚠ Tardanza |
| Carlos Soto | — | — | 📝 Permiso |
| Ana López | — | — | 🏥 Incapacidad |

---

## 17. Vista desde el expediente

Desde:

**Personal → Colaborador → Asistencia**

se debe poder consultar:

```text
AGOSTO 2026

Fecha       Entrada   Salida    Estado
────────────────────────────────────────
18/08       07:55     17:02     ✓ Presente
19/08       08:18     17:00     ⚠ Tardanza
20/08       --        --        📝 Permiso
21/08       --        --        🏥 Incapacidad
22/08       --        --        🏖 Vacaciones
```

---

## 18. Dashboard

El dashboard debe mostrar información resumida.

```text
┌────────────┬────────────┬────────────┬────────────┐
│ Presentes  │ Tardanzas  │ Ausentes   │ Justificar │
│     38     │      3     │      2     │      4     │
└────────────┴────────────┴────────────┴────────────┘
```

También puede mostrar:

- Colaboradores presentes.
- Colaboradores ausentes.
- Tardanzas.
- Permisos.
- Incapacidades.
- Vacaciones.
- Incidencias pendientes.

---

## 19. Auditoría

Las modificaciones manuales deben quedar registradas.

### Registrar

- Usuario.
- Fecha.
- Hora.
- Registro afectado.
- Valor anterior.
- Valor nuevo.
- Motivo.
- Usuario que aprobó.

Ejemplo:

```text
Registro original:

Entrada: 08:35

Modificación:

Entrada: 08:05

Motivo:
Error de marcación.

Modificado por:
Recursos Humanos

Aprobado por:
Jefatura Administrativa
```

---

## 20. Configuración

El módulo debe permitir configurar:

- Tolerancia de entrada.
- Horarios.
- Jornadas laborales.
- Días laborales.
- Feriados.
- Reglas de tardanza.
- Reglas de justificación.
- Estados de asistencia.
- Modalidades de marcación.

---

## 21. Estructura de datos recomendada

La estructura debe mantenerse sencilla:

```text
colaboradores
      │
      └── asistencia
             │
             ├── marcaciones
             │
             ├── incidencias
             │
             └── justificaciones
```

La información de horarios debe relacionarse con el colaborador:

```text
colaborador
     │
     └── horario asignado
              │
              ↓
         asistencia
```

---

## 22. Principios del módulo

1. La carga masiva debe ser la principal forma de integración con sistemas externos.
2. La plantilla debe estar disponible para descarga.
3. El sistema debe validar los archivos antes de guardar la información.
4. Los datos del colaborador deben obtenerse automáticamente mediante su identificación.
5. El horario debe utilizarse para calcular tardanzas.
6. La tolerancia de entrada debe ser configurable, con **15 minutos como valor predeterminado**.
7. Las tardanzas pueden requerir justificación.
8. Las vacaciones, permisos e incapacidades deben afectar automáticamente el estado de asistencia.
9. La marcación desde el sistema debe ser opcional.
10. La marcación desde el sistema debe limitarse inicialmente a **Entrada** y **Salida**.
11. Las modificaciones manuales deben quedar auditadas.
12. El módulo debe mantenerse simple y no intentar sustituir sistemas especializados de control de asistencia.

---

## 23. Resultado esperado

El módulo debe ofrecer una solución sencilla para cualquier cooperativa:

### Cooperativa con sistema de marcación

```text
COOPERATIVA CON SISTEMA DE MARCACIÓN
                ↓
       Descargar plantilla
                ↓
          Cargar Excel
                ↓
             Validar
                ↓
      Calcular asistencia
                ↓
       Consultar / Reportar
```

### Cooperativa sin sistema de marcación

```text
COLABORADOR
     ↓
Inicia sesión
     ↓
MARCAR ENTRADA
     ↓
Sistema verifica horario
     ↓
Puntual / Tardanza
     ↓
MARCAR SALIDA
     ↓
Horas trabajadas
```

De esta manera, **Asistencia funciona como un módulo flexible y sencillo**, capaz de trabajar tanto con cooperativas que ya poseen infraestructura de marcación como con aquellas que necesitan una solución básica integrada dentro del sistema.
