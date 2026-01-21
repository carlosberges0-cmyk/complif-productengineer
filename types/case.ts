export type CaseStatus = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'EN_REVISION'

export interface Case {
  id: string
  name: string
  status: CaseStatus
}
