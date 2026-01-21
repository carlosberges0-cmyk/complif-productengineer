import casesData from '@/data/cases.json'
import caseDetailsData from '@/data/caseDetails.json'
import { Case, CaseStatus } from '@/types/case'
import { ExplainabilityData } from '@/types/explainability'

// Tipos para los datos JSON
interface CaseDataItem {
  id: string
  name: string
  status: CaseStatus
  caseData: {
    validacionIdentidad: 'PASS' | 'WARN' | 'FAIL'
    origenFondos: 'PASS' | 'WARN' | 'FAIL'
    matrizRiesgo: 'PASS' | 'WARN' | 'FAIL'
  }
  requiereDecisionManual: boolean
}

interface CaseDetail {
  criteriosResumen: {
    estadoCriterios: 'OK' | 'REVIEW_REQUIRED' | 'VALIDATION_FAILED'
    ultimaEvaluacion: string
    fuente: 'OCR' | 'MANUAL' | 'EXTERNAL_INTEGRATION'
  }
  validacionesAutomaticas: Array<{
    id: string
    titulo: string
    resultado: 'PASS' | 'WARN' | 'FAIL'
    descripcionCorta: string
    regla: string
    evidencia: {
      campo: string
      valor: string
    }
  }>
  ocr: Array<{
    campo: string
    valor: string
  }>
  pendingItems: Array<{
    id: string
    titulo: string
    icono: string
  }>
  pendientes?: Array<{
    id: string
    tipo: 'documento' | 'validacion' | 'decision'
    descripcion: string
    severidad: 'alta' | 'media' | 'baja'
    accionEsperada: string
    fechaLimite?: string
    bloqueaAprobacion: boolean
  }>
  pendingRequirements?: Array<{
    id: string
    docType: string
    reason: string
    dueDate?: string | null
  }>
  validationIssues?: Array<{
    id: string
    ruleName: string
    severity: 'alta' | 'media' | 'baja'
    message: string
  }>
  historialTareas: Array<{
    id: string
    titulo: string
    status: 'todo' | 'done'
    timestamp: string
    tipo?: 'automatica' | 'manual'
    accion?: string
    resultado?: 'ok' | 'warn' | 'fail' | 'pendiente'
    detalle?: string
    origen?: 'sistema' | 'analista'
    fecha?: string
    usuario?: string
  }>
  documentos?: Array<{
    id: string
    name: string
    status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'REVIEW_REQUIRED'
    uploadedAt: string
    updatedAt: string
    source: 'OCR' | 'MANUAL' | 'EXTERNAL_INTEGRATION'
    fileName: string
    extractedFields: Record<string, string>
    validations: Array<{
      id: string
      name: string
      result: 'ok' | 'warning' | 'fail'
      rule: string
      evidence: string
      impact: string
      details?: string
    }>
  }>
  auditEvents?: Array<{
    id: string
    timestamp: string
    type: string
    actor: 'system' | 'analyst' | 'client'
    summary: string
    details?: string
    relatedDocumentId?: string | null
  }>
}

// Helper para convertir CaseStatus a string legible
export function getStatusLabel(status: CaseStatus): string {
  const labels: Record<CaseStatus, string> = {
    PENDIENTE: 'Pendiente',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado',
    EN_REVISION: 'En revisión',
  }
  return labels[status]
}

// Obtener todos los casos
export function getCases(): Case[] {
  return (casesData as CaseDataItem[]).map((item) => ({
    id: item.id,
    name: item.name,
    status: item.status,
  }))
}

// Obtener un caso por ID con sus detalles
export function getCaseById(caseId: string): {
  case: Case
  status: string
  caseData: CaseDataItem['caseData']
  details: CaseDetail | null
  requiereDecisionManual: boolean
} | null {
  const caseItem = (casesData as CaseDataItem[]).find((c) => c.id === caseId)

  if (!caseItem) {
    return null
  }

  const details = (caseDetailsData as Record<string, CaseDetail>)[caseId] || null

  return {
    case: {
      id: caseItem.id,
      name: caseItem.name,
      status: caseItem.status,
    },
    status: getStatusLabel(caseItem.status),
    caseData: caseItem.caseData,
    details,
    requiereDecisionManual: caseItem.requiereDecisionManual,
  }
}

// Obtener datos de explainability para un caso
export function getExplainabilityData(caseId: string): ExplainabilityData | null {
  const caseData = getCaseById(caseId)

  if (!caseData || !caseData.details) {
    return null
  }

  const { criteriosResumen, validacionesAutomaticas, ocr } = caseData.details

  // Convertir validaciones al formato esperado
  const validations = validacionesAutomaticas.map((v) => ({
    id: v.id,
    name: v.titulo,
    result: v.resultado,
    message: v.descripcionCorta,
    rule: v.regla,
    evidence: {
      field: v.evidencia.campo,
      value: v.evidencia.valor,
    },
  }))

  // Convertir OCR al formato esperado (sin confidence ya que lo eliminamos)
  const ocrFields = ocr.map((field) => ({
    field: field.campo,
    value: field.valor,
    confidence: 0, // Mantenemos el campo por compatibilidad pero no lo usamos
  }))

  return {
    caseId,
    lastEvaluationAt: criteriosResumen.ultimaEvaluacion,
    source: criteriosResumen.fuente,
    status: criteriosResumen.estadoCriterios,
    autoDecision: caseData.requiereDecisionManual ? null : {
      decision: caseData.case.status === 'APROBADO' ? 'APPROVED' : 'REJECTED',
      rules: validations.map((v) => v.rule),
      evidence: ocr.map((o) => `${o.campo}: ${o.valor}`),
    },
    validations,
    ocrFields,
    flags: [], // Ya no usamos flags
  }
}

// Obtener items pendientes para un caso (compatibilidad con UI actual)
export function getPendingItems(caseId: string): CaseDetail['pendingItems'] {
  const caseData = getCaseById(caseId)
  return caseData?.details?.pendingItems || []
}

// Obtener pendientes extendidos para un caso
export function getPendientes(caseId: string): CaseDetail['pendientes'] {
  const caseData = getCaseById(caseId)
  return caseData?.details?.pendientes || []
}

// Obtener historial de tareas para un caso
export function getTasks(caseId: string): CaseDetail['historialTareas'] {
  const caseData = getCaseById(caseId)
  return caseData?.details?.historialTareas || []
}

// Obtener documentos para un caso
export function getDocuments(caseId: string): CaseDetail['documentos'] {
  const caseData = getCaseById(caseId)
  return caseData?.details?.documentos || []
}

// Obtener eventos de auditoría para un caso
export function getAuditEvents(caseId: string): CaseDetail['auditEvents'] {
  const caseData = getCaseById(caseId)
  return caseData?.details?.auditEvents || []
}

// Obtener requerimientos pendientes para un caso
export function getPendingRequirements(caseId: string): CaseDetail['pendingRequirements'] {
  const caseData = getCaseById(caseId)
  return caseData?.details?.pendingRequirements || []
}

// Obtener issues de validación para un caso
export function getValidationIssues(caseId: string): CaseDetail['validationIssues'] {
  const caseData = getCaseById(caseId)
  return caseData?.details?.validationIssues || []
}
