# Módulo de Incapacidades

## 1. Objetivo

El módulo de Incapacidades permitirá registrar, controlar y dar seguimiento a las incapacidades y licencias médicas de los colaboradores de la cooperativa.

El módulo debe estar integrado con el expediente del colaborador y mantener el historial completo de las incapacidades, incluyendo documentos, periodos, prórrogas, reincorporaciones y efectos administrativos.

> **Principio:** el sistema debe almacenar únicamente la información médica y administrativa necesaria para gestionar correctamente la ausencia, evitando registrar diagnósticos o información clínica innecesaria.

---

# 2. Estructura general

```text
INCAPACIDADES
│
├── Registros
├── Prórrogas
├── Historial
├── Calendario
└── Configuración
    ├── Tipos de incapacidad
    └── Instituciones emisoras
```

---

# 3. Formulario de incapacidad

## 3.1 Información del colaborador

- Colaborador
- Código de colaborador
- Departamento
- Puesto
- Jefatura
- Fecha de ingreso

Los datos deben cargarse automáticamente al seleccionar al colaborador.

No deben ser digitados nuevamente.

---

# 4. Información de la incapacidad

### Campos

- Número de registro
- Número de incapacidad / referencia
- Tipo de incapacidad
- Institución emisora
- Fecha de emisión
- Fecha de inicio
- Fecha de finalización
- Cantidad de días
- Fecha prevista de reincorporación
- Observaciones administrativas

### Número de registro

Debe generarse automáticamente.

Ejemplo:

```text id="j3v8yp"
INC-2026-000125
```

El número de incapacidad o referencia emitido por la institución debe conservarse como un dato independiente.

---

# 5. Tipo de incapacidad

Los tipos deben administrarse mediante un catálogo.

Ejemplos:

- Enfermedad
- Accidente
- Riesgo laboral
- Maternidad
- Paternidad
- Licencia médica
- Otro

La cooperativa podrá agregar, modificar o desactivar tipos según sus necesidades.

> **Nota:** conviene separar el "tipo administrativo" de cualquier diagnóstico médico. El sistema no debería requerir un diagnóstico detallado para registrar una incapacidad.

---

# 6. Institución emisora

Crear un catálogo de instituciones.

Ejemplos:

- CCSS
- INS
- Médico autorizado
- Otra institución

### Datos del catálogo

- Nombre
- Tipo
- Identificación, si aplica
- Estado
- Observaciones

Esto permitirá posteriormente generar estadísticas sobre las incapacidades según su origen administrativo.

---

# 7. Periodo de incapacidad

El formulario debe registrar:

- Fecha de inicio
- Fecha de finalización
- Cantidad de días
- Fecha prevista de reincorporación

La cantidad de días debe calcularse automáticamente según las reglas configuradas.

Ejemplo:

```text id="g8u1rm"
Inicio:                18/08/2026
Finalización:          22/08/2026
Días:                         5
Reincorporación:       23/08/2026
```

---

# 8. Estado

La incapacidad debe manejar diferentes estados.

```text id="e4p2nb"
REGISTRADA
     ↓
ACTIVA
     ↓
FINALIZADA
```

También:

```text id="u6k3qy"
ANULADA
```

### Estados adicionales

Si la operación de la cooperativa lo requiere:

- Pendiente de revisión
- Pendiente de documentación
- En proceso de validación

Los estados deben ser configurables.

---

# 9. Documentos

Cada incapacidad debe permitir adjuntar el documento correspondiente.

### Información del documento

- Tipo de documento
- Nombre
- Archivo
- Fecha de emisión
- Fecha de carga
- Usuario que cargó
- Observaciones

### Documentos posibles

- Boleta de incapacidad
- Certificación
- Prórroga
- Documento de reincorporación
- Otro documento administrativo

---

# 10. Prórrogas

Una incapacidad puede extenderse mediante una nueva incapacidad o prórroga.

No se recomienda modificar directamente la fecha final del registro original.

Debe existir una relación:

```text id="n8x5cj"
INC-2026-000125
18/08/2026 → 22/08/2026
        │
        └── PRÓRROGA
             23/08/2026 → 27/08/2026
```

### Datos de la prórroga

- Número de prórroga
- Número de referencia
- Fecha de emisión
- Fecha de inicio
- Fecha de finalización
- Cantidad de días
- Institución emisora
- Documento
- Observaciones

Esto permite conservar el historial real de la incapacidad.

---

# 11. Reincorporación

El sistema debe registrar cuándo el colaborador vuelve a sus funciones.

### Información

- Fecha prevista de reincorporación
- Fecha real de reincorporación
- Usuario que registra
- Observaciones
- Documento de respaldo, si aplica

Ejemplo:

```text id="q7z4sf"
Fecha final incapacidad:      22/08/2026
Reincorporación prevista:     23/08/2026
Reincorporación real:         23/08/2026

Estado: FINALIZADA
```

---

# 12. Información administrativa

Esta sección debe contener únicamente información necesaria para la gestión laboral.

### Campos posibles

- ¿Tiene impacto salarial?
- Tipo de impacto
- Porcentaje aplicable, si corresponde
- Cantidad de días afectados
- Fecha de recepción del documento
- Fecha de registro
- Usuario responsable
- Observaciones administrativas

Los cálculos salariales deberían realizarse en el módulo de **Nómina**, no directamente dentro de Incapacidades.

---

# 13. Integración con nómina

El módulo debe poder comunicar a Nómina los periodos que tengan impacto salarial.

```text id="b2w5ka"
Incapacidad
     ↓
Periodo
     ↓
Días afectados
     ↓
Nómina
     ↓
Cálculo correspondiente
```

El módulo de Incapacidades registra el evento; el módulo de Nómina realiza los cálculos.

Esto evita duplicar reglas de cálculo.

---

# 14. Integración con asistencia

Una incapacidad activa debe reflejarse automáticamente en el control de asistencia.

Ejemplo:

```text id="s4v9cx"
18/08/2026 → 22/08/2026

Incapacidad activa
        ↓
Asistencia
        ↓
Ausencia justificada
```

Esto permite diferenciar:

- Asistencia normal
- Vacaciones
- Permiso
- Incapacidad
- Ausencia injustificada

---

# 15. Calendario de incapacidades

El módulo debe incluir un calendario de ausencias.

Ejemplo:

```text id="r5d1zk"
AGOSTO 2026

Colaborador       18   19   20   21   22   23
────────────────────────────────────────────────
Juan Pérez        🏥   🏥   🏥   🏥   🏥
María Rodríguez             🏥   🏥   🏥
Carlos Soto       🏥   🏥
```

### Filtros

- Colaborador
- Departamento
- Sede
- Tipo
- Institución
- Estado
- Periodo

---

# 16. Historial

Cada colaborador debe tener un historial completo de incapacidades.

| Registro | Tipo | Inicio | Finalización | Días | Estado |
|---|---|---|---|---:|---|
| INC-2026-001 | Enfermedad | 10/02/2026 | 12/02/2026 | 3 | Finalizada |
| INC-2026-018 | Accidente | 15/04/2026 | 19/04/2026 | 5 | Finalizada |
| INC-2026-125 | Enfermedad | 18/08/2026 | 22/08/2026 | 5 | Activa |

El historial debe poder consultarse desde:

**Personal → Colaborador → Incapacidades**

---

# 17. Alertas

### Para Recursos Humanos

- Nueva incapacidad registrada.
- Incapacidad próxima a finalizar.
- Incapacidad finalizada.
- Documento pendiente.
- Prórroga registrada.
- Reincorporación pendiente.

### Para jefaturas

- Colaborador incapacitado.
- Próxima reincorporación.
- Prórroga de incapacidad.

### Para el colaborador

- Registro de incapacidad.
- Confirmación de recepción.
- Próxima fecha de reincorporación.

Las notificaciones deben respetar los permisos de acceso a información sensible.

---

# 18. Reportes

El módulo debe permitir generar reportes administrativos.

### Indicadores

- Cantidad de incapacidades.
- Total de días incapacitados.
- Incapacidades activas.
- Incapacidades finalizadas.
- Incapacidades por departamento.
- Incapacidades por periodo.
- Incapacidades por institución emisora.
- Incapacidades por tipo administrativo.
- Colaboradores con incapacidades activas.

### Importante

Los reportes generales deberían evitar exponer información médica sensible que no sea necesaria para el objetivo del reporte.

---

# 19. Configuración

El módulo debe contar con una sección de configuración.

### Catálogos

- Tipos de incapacidad
- Instituciones emisoras
- Estados
- Tipos de documentos

### Reglas

- Cálculo de días
- Reglas de reincorporación
- Estados automáticos
- Reglas de notificación
- Permisos de acceso

---

# 20. Auditoría

Toda acción importante debe quedar registrada.

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

```text id="k4y7mz"
Registro: INC-2026-000125

18/08/2026 10:25

Usuario: Recursos Humanos
Acción: Registro de incapacidad

Estado:
Pendiente → Activa
```

---

# 21. Seguridad y privacidad

Esta sección es especialmente importante porque las incapacidades pueden contener información sensible.

Se recomienda implementar:

- Acceso restringido por roles.
- Permisos específicos para documentos.
- Registro de consultas y modificaciones.
- No mostrar diagnósticos médicos en listados generales.
- No incluir documentos médicos en reportes generales.
- Cifrado y protección de documentos.
- Auditoría de accesos.
- Separación entre información administrativa y médica.

### Ejemplo de permisos

```text id="p8w3qc"
Administrador
    ↓
Configuración y administración

Recursos Humanos
    ↓
Gestión de incapacidades

Jefatura
    ↓
Información necesaria para gestionar la ausencia

Colaborador
    ↓
Consulta de sus propios registros
```

---

# 22. Integración con el expediente

Desde el expediente del colaborador:

**Personal → Colaborador → Incapacidades**

se debería visualizar un resumen:

```text id="f3x6ta"
┌─────────────────────────────────────┐
│ INCAPACIDADES                       │
├─────────────────────────────────────┤
│ Incapacidades año:       3          │
│ Días acumulados:        12          │
│ Activas:                 1          │
│ Última incapacidad: 18/08/2026      │
└─────────────────────────────────────┘

[Registrar incapacidad]

Historial
─────────────────────────────────────
10/02/2026   3 días    Finalizada
15/04/2026   5 días    Finalizada
18/08/2026   5 días    Activa
```

---

# 23. Estructura de datos recomendada

La estructura inicial podría ser:

```text id="t7n4mb"
colaboradores
      │
      └── incapacidades
              │
              ├── incapacidades_prorrogas
              ├── incapacidades_documentos
              └── incapacidades_auditoria
```

Adicionalmente:

```text id="w2q8kf"
catalogo_tipos_incapacidad
catalogo_instituciones_emisoras
```

La incapacidad debe mantener siempre la referencia al colaborador.

---

# 24. Principios del módulo

1. Cada incapacidad debe estar asociada a un colaborador.
2. Las fechas y duración deben calcularse automáticamente.
3. Las prórrogas deben conservarse como registros relacionados.
4. No se deben sobrescribir registros históricos.
5. Los documentos deben estar vinculados al registro correspondiente.
6. La reincorporación debe quedar registrada.
7. Los efectos salariales deben comunicarse al módulo de Nómina.
8. Las ausencias deben integrarse con Asistencia.
9. Los estados deben tener trazabilidad.
10. La información sensible debe estar protegida mediante permisos.
11. Los reportes deben minimizar la exposición de información médica.
12. Toda modificación importante debe quedar registrada en auditoría.

> **Resultado esperado:** Recursos Humanos debe poder conocer de forma controlada qué colaboradores se encuentran incapacitados, durante qué periodo, cuál es el estado administrativo del registro, qué documentación lo respalda, si existen prórrogas y cuándo corresponde la reincorporación, manteniendo la información sensible protegida.