# Complif - Panel de Criterios y Validaciones

## Descripción

Feature implementado: **"Panel de Criterios y Validaciones"** (Explainability Panel) para la plataforma Complif (backoffice de analistas de compliance).

Este panel permite a los analistas entender el "por qué" de las decisiones y estados de los casos, mostrando:
- Validaciones automáticas ejecutadas y sus resultados
- Datos clave detectados por OCR
- Señales que requieren revisión manual
- Justificación de decisiones automáticas (si aplica)

## Estructura del Proyecto

```
/
├── app/
│   ├── api/
│   │   └── cases/
│   │       └── [caseId]/
│   │           └── explainability/
│   │               └── route.ts          # Endpoint mock de la API
│   ├── cases/
│   │   └── [caseId]/
│   │       └── page.tsx                 # Página del caso
│   ├── layout.tsx
│   ├── page.tsx                          # Redirige a /cases/123
│   └── globals.css
├── components/
│   ├── CaseDashboard.tsx                 # Dashboard principal del caso
│   ├── CaseDashboard.module.css
│   ├── CaseHeader.tsx                    # Header de la aplicación
│   ├── CaseHeader.module.css
│   ├── CasesList.tsx                     # Lista de casos (columna izquierda) ⭐
│   ├── CasesList.module.css
│   ├── CaseDataCard.tsx                 # Card "Datos del caso"
│   ├── PendingCard.tsx                  # Card "Pendiente"
│   ├── TasksCard.tsx                    # Card "Tareas"
│   ├── ExplainabilityCard.tsx           # Card "Criterios y validaciones" ⭐
│   ├── ExplainabilityCard.module.css
│   └── Card.module.css                  # Estilos compartidos de cards
├── types/
│   ├── explainability.ts                 # Tipos TypeScript para explainability
│   └── case.ts                           # Tipos TypeScript para casos
└── package.json
```

## Estructura de la Interfaz

### Layout Principal

La aplicación tiene un layout de dos columnas:
- **Columna izquierda**: Lista de casos (`CasesList.tsx`)
  - Muestra todos los casos disponibles con nombre y estado
  - Al hacer click en un caso, se carga su información
  - Responsive: en mobile se muestra como lista horizontal scrollable

- **Columna derecha**: Contenido del caso seleccionado
  - Información del caso (nombre, estado, avatar)
  - Tabs de navegación (RESUMEN, DETALLES, HISTORIAL)
  - Cards con información del caso

### Ubicación de la Card

La card **"Criterios y validaciones"** se encuentra en:
- **Componente**: `components/ExplainabilityCard.tsx`
- **Vista**: Aparece en la pestaña "RESUMEN" del dashboard del caso
- **Ruta**: `/cases/[caseId]` (ejemplo: `/cases/100`)

La card se muestra junto a las otras tres cards existentes:
1. "Datos del caso"
2. "Pendiente"
3. **"Criterios y validaciones"** (nueva)
4. "Tareas"

## Endpoints de la API

### Obtener información de un caso
```
GET /api/cases/:caseId
```

Retorna información básica del caso (nombre, estado).

### Obtener criterios y validaciones
```
GET /api/cases/:caseId/explainability
```

### Implementación
- **Archivo**: `app/api/cases/[caseId]/explainability/route.ts`
- **Estado actual**: Mock data (listo para conectar con backend real)
- **Delay simulado**: 500ms para simular latencia de red

### Ejemplo de Response

```json
{
  "caseId": "123",
  "lastEvaluationAt": "2024-04-15T14:54:00Z",
  "source": "OCR",
  "status": "REVIEW_REQUIRED",
  "autoDecision": null,
  "validations": [
    {
      "id": "exp_date",
      "name": "Vigencia del documento",
      "result": "WARN",
      "message": "Vence en 14 días",
      "rule": "expiry_date > today && expiry_date <= today+30",
      "evidence": {
        "field": "expiry_date",
        "value": "2024-04-29"
      }
    }
  ],
  "ocrFields": [
    {
      "field": "CUIT",
      "value": "20-12345678-9",
      "confidence": 92
    }
  ],
  "flags": [
    {
      "id": "low_confidence",
      "severity": "MEDIUM",
      "title": "Confianza OCR moderada",
      "detail": "Campo 'Fecha de vencimiento' con confianza 78%",
      "suggestedAction": "Revisar visualmente el documento"
    }
  ]
}
```

### Campos del Response

- **caseId**: ID del caso
- **lastEvaluationAt**: Timestamp ISO de la última evaluación
- **source**: Fuente de los datos ("OCR", "MANUAL", "EXTERNAL_INTEGRATION")
- **status**: Estado general ("OK", "REVIEW_REQUIRED", "VALIDATION_FAILED")
- **autoDecision**: Objeto con decisión automática o `null` si requiere decisión manual
- **validations**: Array de validaciones automáticas con resultado (PASS/WARN/FAIL)
- **ocrFields**: Array de campos detectados por OCR con confianza
- **flags**: Array de señales que requieren revisión manual

## Funcionalidades Implementadas

### ✅ Secciones de la Card

1. **Resumen**
   - Badge de estado (OK / Revisión requerida / Falló validación)
   - Última evaluación (fecha-hora)
   - Fuente de datos
   - Botón "Copiar resumen para auditoría"

2. **Validaciones automáticas**
   - Lista de checks con iconos (✅ / ⚠️ / ❌)
   - Mensaje descriptivo
   - Expandible: "Ver detalle" muestra regla y evidencia

3. **Datos detectados (OCR)**
   - Tabla key-value con campo, valor y confianza
   - Highlight para confianza < 70%

4. **Señales / Flags para revisión**
   - Lista priorizada por severidad (LOW/MEDIUM/HIGH)
   - Recomendación de acción

5. **Justificación de decisión** (condicional)
   - Solo se muestra si `autoDecision != null`
   - Muestra decisión, reglas disparadas y evidencia

### ✅ Estados Manejados

- **Loading**: Muestra "Cargando..." mientras se obtienen los datos
- **Error**: Muestra mensaje de error si falla la petición
- **Empty**: Muestra "No hay validaciones disponibles para este caso" si no hay datos (404)

### ✅ Interacción

- Secciones expandibles/colapsables (accordion)
- Botón "Copiar resumen para auditoría" copia texto estructurado al portapapeles
- Diseño responsive (stack vertical en mobile)

## Estilos

La card mantiene el mismo look & feel que las cards existentes:
- Header oscuro (#34495e) con título en blanco
- Fondo blanco para el contenido
- Bordes suaves y sombras ligeras
- Spacing amplio y tipografía consistente

## Próximos Pasos (Para Producción)

1. **Conectar con Backend Real**
   - Reemplazar el mock en `app/api/cases/[caseId]/explainability/route.ts`
   - Conectar con base de datos o servicio de validaciones

2. **Tests**
   - Unit tests para `ExplainabilityCard`
   - E2E tests para el flujo completo
   - Tests del endpoint API

3. **Mejoras de UX**
   - Loading skeleton en lugar de texto "Cargando..."
   - Animaciones suaves para expand/collapse
   - Tooltips para explicar términos técnicos

4. **Optimizaciones**
   - Cache de datos de explainability
   - Paginación si hay muchas validaciones/flags
   - Filtros y búsqueda dentro de la card

## Cómo Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:3000 (redirige a /cases/123)
```

## Stack Tecnológico

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **CSS Modules** (para estilos scoped)
