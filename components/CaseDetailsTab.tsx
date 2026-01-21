'use client'

import { useState, useEffect } from 'react'
import type { SVGProps } from 'react'
import styles from './CaseDetailsTab.module.css'
import CardStyles from './Card.module.css'

interface Document {
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
}

interface CaseDetailsTabProps {
  caseId: string
}

export default function CaseDetailsTab({ caseId }: CaseDetailsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedValidation, setExpandedValidation] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch(`/api/cases/${caseId}/documents`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) {
              setDocuments([])
              setLoading(false)
            }
            return
          }
          throw new Error('Error al cargar documentos')
        }
        return res.json()
      })
      .then((data) => {
        if (!cancelled) {
          setDocuments(data || [])
          if (data && data.length > 0) {
            setSelectedDocument(data[0])
          }
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDocuments([])
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [caseId])

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
      PENDING: 'Pendiente',
      REVIEW_REQUIRED: 'Revisión requerida',
    }
    return labels[status] || status
  }

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      APPROVED: styles.statusApproved,
      REJECTED: styles.statusRejected,
      PENDING: styles.statusPending,
      REVIEW_REQUIRED: styles.statusReview,
    }
    return classes[status] || styles.statusPending
  }

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      OCR: 'OCR',
      MANUAL: 'Manual',
      EXTERNAL_INTEGRATION: 'Integración externa',
    }
    return labels[source] || source
  }

  const getResultIcon = (result: string) => {
    const iconProps: SVGProps<SVGSVGElement> = {
      width: 20,
      height: 20,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
    }

    switch (result) {
      case 'ok':
        return (
          <svg {...iconProps} style={{ color: '#28a745' }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        )
      case 'warning':
        return (
          <svg {...iconProps} style={{ color: '#ffc107' }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )
      case 'fail':
        return (
          <svg {...iconProps} style={{ color: '#dc3545' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <div className={styles.loading}>Cargando documentos...</div>
  }

  if (documents.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No hay documentos disponibles para este caso.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.documentsList}>
        <div className={CardStyles.card}>
          <div className={CardStyles.cardHeader}>
            <h2 className={CardStyles.cardTitle}>Documentos del caso</h2>
          </div>
          <div className={CardStyles.cardContent}>
            {documents.map((doc) => (
              <button
                key={doc.id}
                className={`${styles.documentItem} ${
                  selectedDocument?.id === doc.id ? styles.selected : ''
                }`}
                onClick={() => setSelectedDocument(doc)}
              >
                <div className={styles.documentInfo}>
                  <div className={styles.documentName}>{doc.name}</div>
                  <div className={`${styles.documentStatus} ${getStatusClass(doc.status)}`}>
                    {getStatusLabel(doc.status)}
                  </div>
                </div>
                <div className={styles.documentMeta}>
                  <span className={styles.documentSource}>{getSourceLabel(doc.source)}</span>
                  <span className={styles.documentDate}>
                    {formatDate(doc.updatedAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedDocument && (
        <div className={styles.documentDetails}>
          <div className={CardStyles.card}>
            <div className={CardStyles.cardHeader}>
              <h2 className={CardStyles.cardTitle}>Vista del documento</h2>
            </div>
            <div className={CardStyles.cardContent}>
              <div className={styles.documentPreview}>
                <div className={styles.previewPlaceholder}>
                  <svg
                    width={48}
                    height={48}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <div className={styles.previewFileName}>{selectedDocument.fileName}</div>
                  <button className={styles.downloadButton}>Ver / Descargar</button>
                </div>
              </div>

              {Object.keys(selectedDocument.extractedFields).length > 0 && (
                <div className={styles.extractedFields}>
                  <h3 className={styles.sectionTitle}>Campos detectados / datos extraídos</h3>
                  <div className={styles.fieldsTable}>
                    <div className={styles.fieldsTableHeader}>
                      <div className={styles.fieldsTableCell}>Campo</div>
                      <div className={styles.fieldsTableCell}>Valor</div>
                    </div>
                    {Object.entries(selectedDocument.extractedFields).map(([key, value]) => (
                      <div key={key} className={styles.fieldsTableRow}>
                        <div className={styles.fieldsTableCell}>{key}</div>
                        <div className={styles.fieldsTableCell}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.fieldsSource}>Fuente: {getSourceLabel(selectedDocument.source)}</div>
                </div>
              )}
            </div>
          </div>

          <div className={CardStyles.card}>
            <div className={CardStyles.cardHeader}>
              <h2 className={CardStyles.cardTitle}>Validaciones aplicadas (detalle)</h2>
            </div>
            <div className={CardStyles.cardContent}>
              {selectedDocument.validations.length === 0 ? (
                <div className={styles.emptySection}>No hay validaciones para este documento.</div>
              ) : (
                <div className={styles.validationsList}>
                  {selectedDocument.validations.map((validation) => (
                    <div
                      key={validation.id}
                      className={`${styles.validationItem} ${styles[`validationResult${validation.result}`]}`}
                    >
                      <div className={styles.validationHeader}>
                        <span className={styles.validationIcon}>{getResultIcon(validation.result)}</span>
                        <div className={styles.validationInfo}>
                          <div className={styles.validationName}>{validation.name}</div>
                          <div className={styles.validationResult}>
                            {validation.result === 'ok' ? 'OK' : validation.result === 'warning' ? 'WARNING' : 'FAIL'}
                          </div>
                        </div>
                      </div>
                      <div className={styles.validationDetails}>
                        <div className={styles.validationField}>
                          <span className={styles.validationLabel}>Regla aplicada:</span>
                          <span className={styles.validationValue}>{validation.rule}</span>
                        </div>
                        <div className={styles.validationField}>
                          <span className={styles.validationLabel}>Evidencia:</span>
                          <span className={styles.validationValue}>{validation.evidence}</span>
                        </div>
                        <div className={styles.validationField}>
                          <span className={styles.validationLabel}>Impacto:</span>
                          <span className={styles.validationValue}>{validation.impact}</span>
                        </div>
                        {validation.details && (
                          <details className={styles.validationExpandable}>
                            <summary className={styles.validationSummary}>Ver detalle</summary>
                            <div className={styles.validationExpandableContent}>{validation.details}</div>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
