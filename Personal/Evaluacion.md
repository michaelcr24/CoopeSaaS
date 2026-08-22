# Módulo de Evaluación de Desempeño Configurable

## Objetivo

Diseñar un módulo de Evaluación de Desempeño totalmente configurable para que cada empresa pueda crear sus propias evaluaciones sin requerir cambios de desarrollo.

El sistema debe funcionar como un Constructor de Evaluaciones permitiendo definir metodología, participantes, competencias, objetivos, escalas, fórmulas, aprobaciones y resultados.

## Flujo General

```text
Crear Evaluación
↓
Definir Participantes
↓
Crear Secciones
↓
Crear Preguntas
↓
Configurar Escalas
↓
Configurar Cálculo
↓
Configurar Aprobaciones
↓
Publicar Evaluación
```

## Información General

- Nombre de la evaluación
- Descripción
- Período
- Fecha inicio
- Fecha finalización
- Estado (Borrador, Activa, Finalizada)

## Participantes

Las empresas son pequeñas (aproximadamente 10 empleados), por lo que los participantes se seleccionan individualmente.

### Tipos de evaluador

- Autoevaluación
- Jefe directo
- Compañeros
- Subordinados
- Evaluador adicional

Ejemplo:

```text
Empleado Evaluado: Juan Pérez

Evaluadores:
- Juan Pérez (Autoevaluación)
- María López (Jefe)
- Carlos Mora
- Ana Jiménez
```

## Secciones

Cada sección posee:

- Nombre
- Descripción
- Peso (%)
- Orden

Ejemplo:

```text
Competencias: 40%
Objetivos: 40%
Valores Organizacionales: 20%
```

La suma debe ser igual a 100%.

## Tipos de Pregunta

- Escala numérica
- Escala personalizada
- Texto libre
- Selección única
- Selección múltiple
- Porcentaje
- KPI

## Catálogo de Competencias

Campos:

- Nombre
- Descripción
- Indicadores
- Nivel esperado

## Catálogo de Objetivos

Campos:

- Nombre
- Meta
- Peso
- Resultado

## Escalas

### Escala 1-5

```text
1 = Muy Deficiente
2 = Deficiente
3 = Aceptable
4 = Bueno
5 = Excelente
```

### Escala Personalizada

Totalmente configurable por la empresa.

## Métodos de Cálculo

### Promedio Simple

```text
(P1 + P2 + P3) / Total
```

### Promedio Ponderado

```text
Competencias * 40%
+
Objetivos * 40%
+
Valores * 20%
```

### Fórmula Personalizada

```text
(Competencias * 0.5)
+
(Objetivos * 0.3)
+
(Valores * 0.2)
```

## Resultados

Ejemplo:

```text
0 - 59 = Deficiente
60 - 74 = Regular
75 - 89 = Bueno
90 - 100 = Excelente
```

## Flujo de Aprobación

### Básico

```text
Empleado
↓
Jefe
↓
RRHH
```

### Avanzado

```text
Empleado
↓
Supervisor
↓
Gerente
↓
RRHH
```

## Plan de Mejora

Campos:

- Acción
- Responsable
- Fecha compromiso
- Fecha seguimiento
- Estado

Estados:

- Pendiente
- En proceso
- Completado

## Diseño de la Pantalla

### Tab 1
Información General

### Tab 2
Participantes

### Tab 3
Secciones

### Tab 4
Preguntas

### Tab 5
Escalas

### Tab 6
Método de Cálculo

### Tab 7
Flujo de Aprobación

### Tab 8
Vista Previa

## Modelo de Datos

### EvaluationTemplate

```json
{
  "id":"",
  "nombre":"",
  "descripcion":"",
  "periodo":"",
  "fechaInicio":"",
  "fechaFin":"",
  "estado":"",
  "formulaCalculo":""
}
```

### EvaluationSection

```json
{
  "id":"",
  "templateId":"",
  "nombre":"",
  "peso":0,
  "orden":0
}
```

### EvaluationQuestion

```json
{
  "id":"",
  "sectionId":"",
  "texto":"",
  "tipo":"",
  "peso":0,
  "obligatoria":true
}
```

### EvaluationParticipant

```json
{
  "id":"",
  "empleadoEvaluado":"",
  "evaluador":"",
  "tipoEvaluador":""
}
```

## Recomendación

Construir el sistema como un motor configurable para soportar evaluaciones 90°, 180°, 270°, 360°, por competencias, KPI, OKR e híbridas sin modificar el código fuente.
