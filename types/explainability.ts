export type ValidationResult = 'PASS' | 'WARN' | 'FAIL'

export type ExplainabilityStatus = 'OK' | 'REVIEW_REQUIRED' | 'VALIDATION_FAILED'

export type Source = 'OCR' | 'MANUAL' | 'EXTERNAL_INTEGRATION'

export type FlagSeverity = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Validation {
  id: string
  name: string
  result: ValidationResult
  message: string
  rule?: string
  evidence?: {
    field: string
    value: string
  }
}

export interface OCRField {
  field: string
  value: string
  confidence: number
}

export interface Flag {
  id: string
  severity: FlagSeverity
  title: string
  detail: string
  suggestedAction: string
}

export interface AutoDecision {
  decision: 'APPROVED' | 'REJECTED'
  rules: string[]
  evidence: string[]
}

export interface ExplainabilityData {
  caseId: string
  lastEvaluationAt: string
  source: Source
  status: ExplainabilityStatus
  autoDecision: AutoDecision | null
  validations: Validation[]
  ocrFields: OCRField[]
  flags: Flag[]
}
