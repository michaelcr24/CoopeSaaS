# Módulo de Personal — Expediente del Colaborador

## 1. Información general

El módulo de Personal permitirá administrar el expediente digital de cada colaborador contratado por la cooperativa.

El expediente debe funcionar como el registro central del colaborador y permitir relacionarlo posteriormente con otros módulos del sistema.

---

## 2. Información personal

### Datos de identificación

- Número de identificación
- Tipo de identificación
  - Cédula nacional
  - DIMEX
  - Pasaporte
  - Otro
- Nombre
- Primer apellido
- Segundo apellido
- Nombre completo
- Fecha de nacimiento
- Nacionalidad
- Sexo
- Estado civil
- Fotografía

### Información de contacto

- Teléfono principal
- Teléfono secundario
- Correo electrónico personal
- Correo electrónico institucional

### Dirección

- Provincia
- Cantón
- Distrito
- Dirección exacta

### Sugerencias

- El nombre completo debe generarse automáticamente a partir de los campos individuales.
- Provincia, cantón y distrito deben utilizar catálogos relacionados.
- La identificación debe ser única dentro del sistema.
- La fotografía debería poder actualizarse sin eliminar el historial anterior.

---

# 3. Contactos de emergencia

El sistema debe permitir registrar uno o varios contactos de emergencia.

### Información

- Nombre completo
- Parentesco
- Teléfono principal
- Teléfono secundario
- Correo electrónico
- Dirección
- Contacto principal
- Observaciones

### Sugerencias

Permitir múltiples contactos y establecer cuál es el contacto principal.

Ejemplo:

```text
Contacto 1
Juan Pérez
Padre
8888-8888
Principal: Sí

Contacto 2
María Rodríguez
Hermana
8777-7777
Principal: No
```

---

# 4. Información laboral

Esta será una de las secciones principales del expediente.

### Datos laborales

- Código interno del colaborador
- Fecha de ingreso
- Estado del colaborador
- Puesto
- Departamento / área
- Jefatura inmediata
- Sede / ubicación
- Tipo de contratación
- Jornada laboral
- Horario
- Salario base
- Moneda
- Forma de pago
- Banco
- Cuenta IBAN

### Estado del colaborador

Se recomienda manejar un catálogo:

- Activo
- Vacaciones
- Incapacidad
- Permiso
- Suspensión
- Licencia
- Inactivo
- Pensionado
- Renuncia
- Despedido

### Tipo de contratación

- Tiempo indefinido
- Plazo fijo
- Medio tiempo
- Servicios profesionales
- Otro

### Sugerencias

No almacenar Departamento, Puesto, Sede o Jefatura como texto libre.

Crear catálogos independientes:

```text
Departamentos
Puestos
Sedes
Jefaturas
Tipos de contratación
Jornadas laborales
Horarios
```

Esto facilitará los reportes y evitará inconsistencias.

---

# 5. Información contractual

La información contractual debe manejarse independientemente de la información laboral actual.

Esto permitirá conservar el historial de contratos y modificaciones.

### Datos del contrato

- Tipo de contrato
- Número de contrato
- Fecha de inicio
- Fecha de finalización
- Puesto contratado
- Departamento
- Salario pactado
- Jornada
- Horario
- Periodo de prueba
- Estado del contrato
- Documento del contrato
- Observaciones

### Documentos relacionados

- Contrato
- Adendas
- Modificaciones
- Renovaciones
- Otros documentos contractuales

### Sugerencia

Un colaborador puede tener varios contratos a lo largo de su permanencia en la cooperativa.

Por lo tanto:

```text
Colaborador
    └── Contratos
          ├── Contrato 001
          ├── Adenda 001
          ├── Renovación
          └── Contrato 002
```

No se debe sobrescribir el contrato anterior.

---

# 6. Información académica y profesional

Esta sección debe permitir registrar múltiples estudios y certificaciones.

### Formación académica

- Nivel académico
- Profesión
- Especialidad
- Institución educativa
- Título obtenido
- Fecha de graduación
- Documento de respaldo

### Colegiatura profesional

- Colegio profesional
- Número de colegiado
- Fecha de incorporación
- Estado
- Fecha de vencimiento
- Documento de respaldo

### Certificaciones

- Nombre de certificación
- Institución certificadora
- Fecha de emisión
- Fecha de vencimiento
- Estado
- Documento

### Cursos y capacitaciones

- Nombre del curso
- Institución
- Fecha
- Duración
- Modalidad
- Certificado
- Documento de respaldo

### Sugerencia

Utilizar tablas relacionadas en lugar de crear campos como:

```text
Título 1
Título 2
Título 3
Certificación 1
Certificación 2
```

La estructura debe permitir agregar registros ilimitados.

---

# 7. Información administrativa y bancaria

### Información bancaria

- Banco
- Tipo de cuenta
- Cuenta bancaria
- IBAN
- Moneda
- Estado

### Información administrativa

- Número de asegurado CCSS
- Información tributaria necesaria
- Forma de pago
- Fecha de pago
- Observaciones administrativas

### Sugerencia

Los datos bancarios y administrativos deberían tener permisos de acceso más restrictivos que la información general del colaborador.

---

# 8. Documentos del expediente

El expediente debe contar con un repositorio documental.

### Tipos de documentos

- Cédula
- Fotografía
- Currículum
- Títulos
- Certificaciones
- Contrato
- Adendas
- Constancias
- Colegiatura
- Documentos bancarios
- Documentos administrativos
- Otros

### Información del documento

- Tipo de documento
- Nombre
- Fecha de emisión
- Fecha de vencimiento
- Estado
- Archivo
- Observaciones
- Usuario que lo cargó
- Fecha de carga

### Estados

- Vigente
- Por vencer
- Vencido
- En revisión
- No aplica

### Sugerencia importante

Implementar alertas automáticas para documentos próximos a vencer.

Ejemplo:

```text
🔴 Documento vencido
🟠 Vence en menos de 30 días
🟡 Vence en menos de 60 días
🟢 Vigente
```

---

# 9. Historial laboral

El sistema debe conservar todos los movimientos importantes realizados durante la permanencia del colaborador.

### Tipos de movimiento

- Ingreso
- Ascenso
- Cambio de puesto
- Cambio de departamento
- Traslado
- Aumento salarial
- Cambio de jornada
- Cambio de horario
- Permiso
- Suspensión
- Reingreso
- Salida

### Información

- Fecha
- Tipo de movimiento
- Puesto anterior
- Puesto nuevo
- Departamento anterior
- Departamento nuevo
- Salario anterior
- Salario nuevo
- Motivo
- Documento de respaldo
- Usuario que realizó el cambio
- Fecha y hora del registro

### Sugerencia

El historial no debe poder eliminarse fácilmente.

Los cambios deben quedar registrados para garantizar trazabilidad y auditoría.

---

# 10. Salidas de la cooperativa

Cuando un colaborador deja de trabajar para la cooperativa, no debería eliminarse del sistema.

### Información de salida

- Fecha de salida
- Tipo de salida
  - Renuncia
  - Despido
  - Jubilación
  - Finalización de contrato
  - Otro
- Motivo
- Último puesto
- Último salario
- Documento de respaldo
- Observaciones
- Usuario que registra la salida

El colaborador deberá pasar a estado:

```text
INACTIVO
```

pero su expediente debe permanecer disponible para consulta según los permisos correspondientes.

---

# 11. Auditoría

Cada expediente debe mantener información de auditoría.

### Datos

- Usuario que creó el expediente
- Fecha de creación
- Usuario que realizó la última modificación
- Fecha de última modificación
- Historial de modificaciones
- Usuario que realizó cada modificación
- Fecha y hora
- Acción realizada

### Ejemplo

```text
CAMBIO DE SALARIO

Anterior: ₡650.000
Nuevo: ₡700.000

Usuario: Administrador RRHH
Fecha: 18/08/2026
Motivo: Ascenso
```

---

# 12. Estructura general del expediente

La interfaz podría organizarse mediante pestañas:

```text
PERSONAL
│
├── Información personal
│
├── Contactos de emergencia
│
├── Información laboral
│
├── Contratos
│
├── Formación académica
│
├── Certificaciones
│
├── Información administrativa
│
├── Información bancaria
│
├── Documentos
│
├── Historial laboral
│
├── Salida
│
└── Auditoría
```

---

# 13. Panel resumen del colaborador

Al ingresar al expediente, sería conveniente mostrar un resumen antes de entrar a cada sección.

```text
┌─────────────────────────────────────────────┐
│ FOTO                                        │
│                                             │
│ Juan Pérez Rodríguez                        │
│ Cédula: 1-1111-1111                         │
│                                             │
│ Puesto: Analista Administrativo             │
│ Departamento: Administración                │
│ Jefatura: María Rodríguez                   │
│                                             │
│ Estado: ● ACTIVO                            │
│ Ingreso: 15/03/2024                         │
└─────────────────────────────────────────────┘
```

Y debajo:

```text
Contratos       2
Documentos     15
Certificaciones 4
Cursos          8
Movimientos     6
```

---

# 14. Relaciones con otros módulos

El expediente del colaborador debe ser una entidad central del sistema.

Posteriormente podrá relacionarse con:

```text
                    ┌───────────────┐
                    │ COLABORADOR   │
                    └───────┬───────┘
                            │
       ┌──────────┬─────────┼─────────┬──────────┐
       │          │         │         │          │
   Vacaciones  Permisos  Nómina  Capacitación  Evaluación
       │          │         │         │          │
       └──────────┴─────────┴─────────┴──────────┘
```

Esto evita duplicar la información del colaborador en cada módulo.

---

# 15. Recomendaciones de diseño del sistema

## 15.1 No crear un formulario único gigante

Aunque conceptualmente sea un único expediente, la interfaz debe dividirse en secciones.

Esto facilita:

- Captura de información.
- Edición.
- Lectura.
- Permisos.
- Mantenimiento.
- Experiencia del usuario.

---

## 15.2 Utilizar catálogos

Crear catálogos administrables para:

- Puestos
- Departamentos
- Sedes
- Tipos de contrato
- Estados laborales
- Jornadas
- Horarios
- Tipos de documentos
- Tipos de movimientos
- Tipos de salida
- Instituciones educativas
- Colegios profesionales

Esto permitirá que la cooperativa pueda modificar sus opciones sin necesidad de modificar el sistema.

---

## 15.3 Control de permisos

No todos los usuarios deberían poder visualizar toda la información.

Ejemplo:

```text
Administrador
    ↓
Acceso completo

Recursos Humanos
    ↓
Información personal + laboral + documentos

Jefatura
    ↓
Información laboral básica

Colaborador
    ↓
Su propio expediente

Auditor
    ↓
Consulta + historial + auditoría
```

La información bancaria y otros datos sensibles deberían tener restricciones adicionales.

---

# 16. Consideración importante para la base de datos

No debemos diseñar todo como una sola tabla `colaboradores`.

Una estructura inicial podría ser:

```text
colaboradores
├── datos_personales
├── contactos_emergencia
├── contratos
├── formacion_academica
├── certificaciones
├── cursos
├── documentos
├── movimientos_laborales
├── datos_bancarios
└── auditoria
```

Todas las tablas relacionadas deben utilizar el identificador único del colaborador.

---

# 17. Objetivo del módulo

El módulo de Personal debe convertirse en el **núcleo de información de los colaboradores de la cooperativa**.

El objetivo no es únicamente registrar empleados, sino construir un **expediente digital completo, histórico, auditable y conectado con los demás módulos del sistema**.

La información básica del colaborador se registra una sola vez y posteriormente es utilizada por los demás módulos.

```text
                    PERSONAL
                       │
                 COLABORADOR
                       │
       ┌───────────────┼────────────────┐
       │               │                │
   Información      Historial       Documentos
       │               │                │
       └───────────────┼────────────────┘
                       │
              ┌────────┴─────────┐
              │                  │
         Otros módulos      Reportes
```

**Principio fundamental:**  
> La información del colaborador debe registrarse una sola vez y reutilizarse en todo el sistema.