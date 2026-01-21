'use client'

import { useState, useEffect } from 'react'
import { ExplainabilityData } from '@/types/explainability'
import styles from './ExplainabilityCard.module.css'

interface ExplainabilityCardProps {
  caseId: string
}

export default function ExplainabilityCard({ caseId }: ExplainabilityCardProps) {
  const [data, setData] = useState<ExplainabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['summary'])
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/cases/${caseId}/explainability`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) {
              setData(null)
              setLoading(false)
            }
            return
          }
          throw new Error('Error al cargar los datos')
        }
        return res.json()
      })
      .then((data) => {
        if (!cancelled) {
          setData(data)
          setError(null)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setData(null)
          setLoading(false)
        }
      })

    // Cleanup function para cancelar la petición si el componente se desmonta
    return () => {
      cancelled = true
    }
  }, [caseId])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const copySummary = () => {
    if (!data) return

    const summary = `RESUMEN DE CRITERIOS Y VALIDACIONES
Caso: ${data.caseId}
Estado: ${getStatusLabel(data.status)}
Última evaluación: ${new Date(data.lastEvaluationAt).toLocaleString('es-AR')}
Fuente: ${data.source}

VALIDACIONES AUTOMÁTICAS:
${data.validations
  .map(
    (v) =>
      `- ${v.name}: ${v.result === 'PASS' ? '✓' : v.result === 'WARN' ? '⚠' : '✗'} ${v.message}${v.rule ? ` (Regla: ${v.rule})` : ''}`
  )
  .join('\n')}

${data.autoDecision ? `DECISIÓN AUTOMÁTICA: ${data.autoDecision.decision}\nReglas disparadas:\n${data.autoDecision.rules.map((r) => `- ${r}`).join('\n')}` : 'Este caso requiere decisión manual del analista.'}
`

    navigator.clipboard.writeText(summary)
    alert('Resumen copiado al portapapeles')
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      OK: 'OK',
      REVIEW_REQUIRED: 'Revisión requerida',
      VALIDATION_FAILED: 'Falló validación',
    }
    return labels[status] || status
  }

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      OK: styles.statusOk,
      REVIEW_REQUIRED: styles.statusReview,
      VALIDATION_FAILED: styles.statusFailed,
    }
    return classes[status] || styles.statusOk
  }

  const getResultIcon = (result: string) => {
    if (result === 'PASS') {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.resultIcon}
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )
    }
    if (result === 'WARN') {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.resultIcon}
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      )
    }
    if (result === 'FAIL') {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.resultIcon}
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      )
    }
    return null
  }

  const getRuleExplanation = (rule: string, result: string, evidence?: { field: string; value: string }) => {
    // Generar explicación basada en la regla y el resultado
    if (rule.includes('expiry_date')) {
      if (result === 'WARN') {
        return 'Se verificó que la fecha de vencimiento del documento está próxima a vencer (dentro de los próximos 30 días).'
      }
      if (result === 'FAIL') {
        return 'El documento ha vencido y no es válido para su uso.'
      }
      return 'Se verificó que la fecha de vencimiento del documento es válida.'
    }
    if (rule.includes('holder') || rule.includes('ownership')) {
      return 'Se validó que el titular del documento coincide con los datos registrados del cliente.'
    }
    if (rule.includes('cuit')) {
      return 'Se verificó el formato y la consistencia del CUIT con los datos del documento.'
    }
    if (rule.includes('required_fields')) {
      return 'Se validó la presencia de todos los campos obligatorios en el documento.'
    }
    if (result === 'PASS') {
      return 'La validación se ejecutó correctamente y cumplió con todos los criterios establecidos.'
    }
    if (result === 'WARN') {
      return 'La validación detectó una condición que requiere atención, pero no impide el procesamiento.'
    }
    if (result === 'FAIL') {
      return 'La validación no se cumplió y requiere acción correctiva antes de continuar.'
    }
    return 'Se ejecutó la validación según los criterios definidos.'
  }

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Criterios y validaciones utilizadas</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.loading}>Cargando...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Criterios y validaciones utilizadas</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.error}>Error: {error}</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Criterios y validaciones utilizadas</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.empty}>
            No hay validaciones disponibles para este caso.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Criterios y validaciones utilizadas</h2>
      </div>
      <div className={styles.cardContent}>
        {/* Resumen */}
        <div className={styles.section}>
          <button
            className={styles.sectionHeader}
            onClick={() => toggleSection('summary')}
          >
            <span className={styles.sectionTitle}>Resumen</span>
            <span className={styles.expandIcon}>
              {expandedSections.has('summary') ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.has('summary') && (
            <div className={styles.sectionContent}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Estado:</span>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(data.status)}`}>
                  {getStatusLabel(data.status)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Última evaluación:</span>
                <span className={styles.summaryValue}>
                  {new Date(data.lastEvaluationAt).toLocaleString('es-AR')}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Fuente:</span>
                <span className={styles.summaryValue}>{data.source}</span>
              </div>
              <button className={styles.copyButton} onClick={copySummary}>
                📋 Copiar resumen para auditoría
              </button>
            </div>
          )}
        </div>

        {/* Validaciones automáticas */}
        <div className={styles.section}>
          <button
            className={styles.sectionHeader}
            onClick={() => toggleSection('validations')}
          >
            <span className={styles.sectionTitle}>Validaciones automáticas</span>
            <span className={styles.expandIcon}>
              {expandedSections.has('validations') ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.has('validations') && (
            <div className={styles.sectionContent}>
              {data.validations.length === 0 ? (
                <div className={styles.emptySection}>
                  No hay validaciones disponibles.
                </div>
              ) : (
                <div className={styles.validationsList}>
                  {data.validations.map((validation) => (
                    <div key={validation.id} className={styles.validationItem} data-result={validation.result}>
                      <div className={styles.validationHeader}>
                        <span className={styles.validationIcon}>
                          {getResultIcon(validation.result)}
                        </span>
                        <span className={styles.validationName}>
                          {validation.name}
                        </span>
                      </div>
                      <div className={styles.validationMessage}>
                        {validation.message}
                      </div>
                      {validation.rule && (
                        <details className={styles.validationDetails}>
                          <summary className={styles.detailsSummary}>
                            Ver detalle
                          </summary>
                          <div className={styles.detailsContent}>
                            <div className={styles.detailSection}>
                              <div className={styles.detailLabel}>Regla aplicada:</div>
                              <div className={styles.detailValue}>{validation.rule}</div>
                              <div className={styles.ruleExplanation}>
                                {getRuleExplanation(validation.rule, validation.result, validation.evidence)}
                              </div>
                            </div>
                            {validation.evidence && (
                              <div className={styles.detailSection}>
                                <div className={styles.detailLabel}>Evidencia:</div>
                                <div className={styles.detailValue}>
                                  <span className={styles.evidenceField}>{validation.evidence.field}</span>
                                  <span className={styles.evidenceEquals}> = </span>
                                  <span className={styles.evidenceValue}>{validation.evidence.value}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Datos detectados (OCR) */}
        <div className={styles.section}>
          <button
            className={styles.sectionHeader}
            onClick={() => toggleSection('ocr')}
          >
            <span className={styles.sectionTitle}>Datos detectados (OCR)</span>
            <span className={styles.expandIcon}>
              {expandedSections.has('ocr') ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.has('ocr') && (
            <div className={styles.sectionContent}>
              {data.ocrFields.length === 0 ? (
                <div className={styles.emptySection}>
                  No hay datos OCR disponibles.
                </div>
              ) : (
                <div className={styles.ocrTable}>
                  <div className={styles.ocrTableHeader}>
                    <div className={styles.ocrTableCell}>Campo</div>
                    <div className={styles.ocrTableCell}>Valor</div>
                  </div>
                  {data.ocrFields.map((field, index) => (
                    <div key={index} className={styles.ocrTableRow}>
                      <div className={styles.ocrTableCell}>{field.field}</div>
                      <div className={styles.ocrTableCell}>{field.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Justificación de decisión */}
        {data.autoDecision && (
          <div className={styles.section}>
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection('decision')}
            >
              <span className={styles.sectionTitle}>
                Justificación de decisión
              </span>
              <span className={styles.expandIcon}>
                {expandedSections.has('decision') ? '▼' : '▶'}
              </span>
            </button>
            {expandedSections.has('decision') && (
              <div className={styles.sectionContent}>
                <div className={styles.decisionInfo}>
                  <div className={styles.decisionStatus}>
                    Decisión automática:{' '}
                    {data.autoDecision.decision === 'APPROVED' ? (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Aprobado
                      </>
                    ) : (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        Rechazado
                      </>
                    )}
                  </div>
                  <div className={styles.decisionRules}>
                    <strong>Reglas disparadas:</strong>
                    <ul className={styles.rulesList}>
                      {data.autoDecision.rules.map((rule, index) => (
                        <li key={index}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                  {data.autoDecision.evidence.length > 0 && (
                    <div className={styles.decisionEvidence}>
                      <strong>Evidencia:</strong>
                      <ul className={styles.evidenceList}>
                        {data.autoDecision.evidence.map((evidence, index) => (
                          <li key={index}>{evidence}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!data.autoDecision && (
          <div className={styles.manualDecision}>
            Este caso requiere decisión manual del analista.
          </div>
        )}
      </div>
    </div>
  )
}
