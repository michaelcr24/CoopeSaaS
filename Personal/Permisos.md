# Módulo de Permisos

## 1. Objetivo

El módulo de Permisos permitirá registrar, solicitar, aprobar y controlar las ausencias autorizadas de los colaboradores de la cooperativa que no correspondan a vacaciones ni incapacidades.

El módulo debe estar integrado con el expediente del colaborador y mantener un historial completo de los permisos solicitados y aprobados.

> **Principio:** cada permiso debe tener trazabilidad desde su solicitud hasta su aprobación, rechazo, cancelación o finalización.

---

# 2. Estructura general

```text id="qz1r4h"
PERMISOS
│
├── Solicitudes
├── Historial
├── Calendario
└── Configuración
    └── Tipos de permisos
```

---

# 3. Formulario de solicitud de permiso

## 3.1 Información del colaborador

- Colaborador
- Código de colaborador
- Departamento
- Puesto
- Jefatura
- Fecha de ingreso

Los datos deben cargarse automáticamente al seleccionar al colaborador.

---

# 4. Información de la solicitud

### Campos

- Número de solicitud
- Fecha de solicitud
- Tipo de permiso
- Motivo
- Fecha de inicio
- Fecha de finalización
- Hora de inicio
- Hora de finalización
- Cantidad de días
- Cantidad de horas
- Observaciones

### Número de solicitud

Debe generarse automáticamente.

Ejemplo:

```text id="0f7z7w"
PER-2026-000125
```

---

# 5. Tipo de permiso

Los tipos deben administrarse mediante un catálogo configurable.

Ejemplos:

- Cita médica
- Asunto personal
- Calamidad doméstica
- Estudio
- Matrimonio
- Fallecimiento de familiar
- Maternidad
- Paternidad
- Lactancia
- Representación institucional
- Permiso con goce salarial
- Permiso sin goce salarial
- Recuperación de horas
- Otro

La cooperativa podrá agregar, modificar o desactivar tipos de permisos.

---

# 6. Condiciones del permiso

Cada tipo de permiso puede tener reglas diferentes.

Por ello, el sistema debería permitir configurar:

- Con goce de salario
- Sin goce de salario
- Con goce parcial
- Requiere aprobación de jefatura
- Requiere aprobación de Recursos Humanos
- Requiere documento
- Cantidad máxima de horas
- Cantidad máxima de días
- Requiere justificación
- Requiere aprobación adicional

Estas reglas deben asociarse al tipo de permiso.

---

# 7. Duración

El sistema debe permitir registrar permisos por:

- Días completos
- Medio día
- Horas
- Intervalos de horas

Ejemplo:

```text id="n2e3s7"
Fecha:          20/08/2026
Hora inicio:    08:00
Hora final:     11:30
Duración:       3.5 horas
```

La duración debería calcularse automáticamente cuando sea posible.

---

# 8. Goce salarial

El sistema debe identificar si el permiso afecta o no el salario.

### Opciones

```text id="v5u6t1"
Con goce de salario
Sin goce de salario
Goce parcial
Recuperación de horas
```

Cuando corresponda, registrar:

- Porcentaje de goce
- Cantidad de horas afectadas
- Cantidad de horas a recuperar
- Fecha límite para recuperación
- Estado de recuperación

---

# 9. Justificación

Dependiendo del tipo de permiso, puede ser obligatorio indicar una justificación.

### Campos

- Motivo
- Descripción
- Observaciones
- Documento de respaldo

Ejemplo:

```text id="t5a8jq"
Tipo: Cita médica

Motivo:
Cita médica previamente programada.

Documento:
Comprobante de cita.pdf
```

---

# 10. Documentos

El sistema debe permitir adjuntar documentos relacionados con el permiso.

### Información

- Tipo de documento
- Nombre
- Archivo
- Fecha de carga
- Usuario que cargó
- Observaciones

Ejemplos:

- Comprobante médico
- Constancia
- Documento institucional
- Justificación
- Otro

---

# 11. Flujo de aprobación

El permiso debe manejar diferentes estados.

```text id="v8k4z2"
BORRADOR
    ↓
PENDIENTE DE APROBACIÓN
    ↓
APROBADO
    ↓
FINALIZADO
```

También:

```text id="g0b7pm"
RECHAZADO
CANCELADO
```

---

# 12. Aprobación

### Información

- Responsable de aprobación
- Estado
- Fecha de aprobación
- Usuario que aprobó
- Comentario
- Fecha de rechazo
- Motivo de rechazo

Dependiendo del tipo de permiso, puede requerirse:

```text id="7e2s5a"
Colaborador
     ↓
Jefatura
     ↓
Recursos Humanos
```

La cantidad de niveles debe ser configurable.

---

# 13. Rechazo

Cuando un permiso sea rechazado, debe registrarse obligatoriamente:

- Usuario que rechazó
- Fecha
- Motivo
- Comentario

Ejemplo:

```text id="5zj3hp"
Estado: RECHAZADO

Motivo:
No se puede autorizar el permiso debido a
necesidades operativas del departamento.
```

El registro debe permanecer en el historial.

---

# 14. Cancelación

Un permiso pendiente o aprobado puede ser cancelado dependiendo de las reglas configuradas.

Debe registrarse:

- Usuario que cancela
- Fecha
- Motivo
- Estado anterior
- Estado nuevo
- Observaciones

---

# 15. Calendario de permisos

El módulo debe incluir un calendario para visualizar las ausencias autorizadas.

Ejemplo:

```text id="x7r5kp"
AGOSTO 2026

Colaborador       18   19   20   21   22
──────────────────────────────────────────
Juan Pérez             📝
María Rodríguez             📝
Carlos Soto        📝
```

El calendario debe permitir visualizar:

- Colaborador
- Tipo de permiso
- Fecha
- Horario
- Duración
- Estado

### Filtros

- Departamento
- Sede
- Colaborador
- Tipo de permiso
- Estado
- Periodo

---

# 16. Historial de permisos

Cada colaborador debe tener un historial.

| Solicitud | Tipo | Fecha | Duración | Estado |
|---|---|---|---:|---|
| PER-2026-001 | Cita médica | 10/02/2026 | 3 h | Finalizado |
| PER-2026-018 | Asunto personal | 15/04/2026 | 1 día | Aprobado |
| PER-2026-125 | Estudio | 20/08/2026 | 4 h | Pendiente |

El historial debe poder consultarse desde el expediente del colaborador.

---

# 17. Integración con asistencia

El módulo debería quedar preparado para integrarse posteriormente con un módulo de asistencia.

Por ejemplo:

```text id="b8k2h6"
Permiso aprobado
        ↓
20/08/2026
08:00 - 11:30
        ↓
Sistema de asistencia
        ↓
Ausencia autorizada
```

Esto permitirá diferenciar entre:

- Ausencia injustificada.
- Ausencia por permiso.
- Ausencia por vacaciones.
- Ausencia por incapacidad.

---

# 18. Integración con nómina

Cuando el permiso tenga impacto salarial, debe poder comunicarse con el módulo de nómina.

Ejemplo:

```text id="s5g3c2"
Permiso sin goce
       ↓
4 horas
       ↓
Nómina
       ↓
Horas no remuneradas
```

No se debería modificar directamente la nómina desde el módulo de permisos; debe existir una integración controlada.

---

# 19. Alertas

### Para el colaborador

- Solicitud recibida.
- Solicitud aprobada.
- Solicitud rechazada.
- Solicitud cancelada.
- Próximo permiso.

### Para la jefatura

- Nueva solicitud pendiente.
- Permiso próximo a iniciar.
- Permisos pendientes de aprobación.

### Para Recursos Humanos

- Solicitudes pendientes.
- Permisos sin documentación.
- Permisos sin aprobación.
- Permisos con impacto salarial.
- Permisos próximos a finalizar.

---

# 20. Configuración

El módulo debe contar con una sección de configuración.

### Catálogos

- Tipos de permisos
- Estados
- Motivos
- Instituciones, cuando corresponda

### Reglas

- Duración máxima
- Anticipación mínima
- Requiere documento
- Requiere aprobación
- Niveles de aprobación
- Goce salarial
- Recuperación de horas

Esto permitirá adaptar el sistema a las políticas internas de cada cooperativa.

---

# 21. Auditoría

Todas las acciones importantes deben quedar registradas.

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

```text id="c8z5xy"
Solicitud: PER-2026-000125

18/08/2026 10:25

Usuario: Jefatura Administrativa
Acción: Aprobación

Estado:
Pendiente → Aprobado
```

---

# 22. Integración con el expediente

Desde:

**Personal → Colaborador → Permisos**

se debería poder consultar:

```text id="v2n6xr"
┌─────────────────────────────────────┐
│ PERMISOS                            │
├─────────────────────────────────────┤
│ Permisos año:          8             │
│ Horas utilizadas:      24            │
│ Pendientes:             1            │
└─────────────────────────────────────┘

[Solicitar permiso]

Historial
─────────────────────────────────────
10/02/2026   Cita médica      3 h
15/04/2026   Asunto personal  1 día
20/08/2026   Estudio          4 h
```

---

# 23. Estructura de datos recomendada

El módulo puede estructurarse inicialmente de esta forma:

```text id="3q5x1p"
colaboradores
      │
      └── permisos_solicitudes
                │
                ├── permisos_aprobaciones
                ├── permisos_documentos
                └── permisos_auditoria
```

Y adicionalmente:

```text id="k6f4y2"
catalogo_tipos_permiso
```

La solicitud debe almacenar la referencia al colaborador y al tipo de permiso, evitando duplicar información.

---

# 24. Principios del módulo

1. Cada permiso debe estar asociado a un colaborador.
2. El tipo de permiso debe provenir de un catálogo.
3. Las reglas deben ser configurables.
4. La duración debe calcularse automáticamente cuando sea posible.
5. Los permisos con impacto salarial deben identificarse claramente.
6. Las aprobaciones deben quedar registradas.
7. Los rechazos deben tener un motivo.
8. Los documentos deben almacenarse junto con la solicitud.
9. Los registros históricos no deben eliminarse.
10. El módulo debe integrarse posteriormente con asistencia y nómina.
11. El acceso a la información debe estar controlado mediante permisos de usuario.
12. Toda modificación importante debe quedar registrada en auditoría.

> **Resultado esperado:** Recursos Humanos debe poder conocer qué permisos ha solicitado cada colaborador, cuáles fueron aprobados o rechazados, cuánto tiempo estuvo ausente, qué documentación presentó y qué impacto tuvo el permiso en su jornada o remuneración.