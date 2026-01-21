'use client'

import { useState, useEffect } from 'react'
import { getAuditEvents } from '@/lib/dataService'
import styles from './CaseHistoryTab.module.css'
import CardStyles from './Card.module.css'

interface AuditEvent {
  id: string
  timestamp: string
  type: string
  actor: 'system' | 'analyst' | 'client'
  summary: string
  details?: string
  relatedDocumentId?: string | null
}

interface CaseHistoryTabProps {
  caseId: string
}

export default function CaseHistoryTab({ caseId }: CaseHistoryTabProps) {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filterActor, setFilterActor] = useState<'all' | 'system' | 'analyst' | 'client'>('all')
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch(`/api/cases/${caseId}/audit`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) {
              setEvents([])
              setLoading(false)
            }
            return
          }
          throw new Error('Error al cargar eventos')
        }
        return res.json()
      })
      .then((data) => {
        if (!cancelled) {
          // Ordenar por fecha DESC (más reciente primero)
          const sortedEvents = (data || []).sort((a: AuditEvent, b: AuditEvent) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          })
          setEvents(sortedEvents)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEvents([])
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [caseId])

  const getActorLabel = (actor: string) => {
    const labels: Record<string, string> = {
      system: 'Sistema',
      analyst: 'Analista',
      client: 'Cliente',
    }
    return labels[actor] || actor
  }

  const getActorIcon = (actor: string) => {
    switch (actor) {
      case 'system':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        )
      case 'analyst':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        )
      case 'client':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        )
      default:
        return null
    }
  }

  const getEventTypeClass = (type: string) => {
    const typeLower = type.toLowerCase()
    if (typeLower.includes('aprobación') || typeLower.includes('aprobado')) {
      return styles.eventTypeApproval
    }
    if (typeLower.includes('rechazo') || typeLower.includes('rechazado')) {
      return styles.eventTypeRejection
    }
    if (typeLower.includes('documento')) {
      return styles.eventTypeDocument
    }
    if (typeLower.includes('validación')) {
      return styles.eventTypeValidation
    }
    if (typeLower.includes('ocr')) {
      return styles.eventTypeOCR
    }
    if (typeLower.includes('comentario')) {
      return styles.eventTypeComment
    }
    if (typeLower.includes('cambio')) {
      return styles.eventTypeStatusChange
    }
    return styles.eventTypeDefault
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
  }

  const filteredEvents =
    filterActor === 'all'
      ? events
      : events.filter((event) => event.actor === filterActor)

  const displayedEvents = showAll ? filteredEvents : filteredEvents.slice(0, 20)

  if (loading) {
    return <div className={styles.loading}>Cargando historial...</div>
  }

  if (events.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No hay eventos de auditoría disponibles para este caso.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={CardStyles.card}>
        <div className={CardStyles.cardHeader}>
          <h2 className={CardStyles.cardTitle}>Historial de auditoría</h2>
        </div>
        <div className={CardStyles.cardContent}>
          <div className={styles.filters}>
            <span className={styles.filterLabel}>Filtrar por actor:</span>
            <div className={styles.filterChips}>
              <button
                className={`${styles.filterChip} ${filterActor === 'all' ? styles.filterChipActive : ''}`}
                onClick={() => setFilterActor('all')}
              >
                Todos
              </button>
              <button
                className={`${styles.filterChip} ${filterActor === 'system' ? styles.filterChipActive : ''}`}
                onClick={() => setFilterActor('system')}
              >
                Sistema
              </button>
              <button
                className={`${styles.filterChip} ${filterActor === 'analyst' ? styles.filterChipActive : ''}`}
                onClick={() => setFilterActor('analyst')}
              >
                Analista
              </button>
              <button
                className={`${styles.filterChip} ${filterActor === 'client' ? styles.filterChipActive : ''}`}
                onClick={() => setFilterActor('client')}
              >
                Cliente
              </button>
            </div>
          </div>

          <div className={styles.timeline}>
            {displayedEvents.map((event, index) => {
              const { date, time } = formatDateTime(event.timestamp)
              const isExpanded = expandedEvent === event.id

              return (
                <div key={event.id} className={styles.timelineItem}>
                  <div className={styles.timelineMarker}>
                    <div className={`${styles.timelineDot} ${getEventTypeClass(event.type)}`}></div>
                    {index < displayedEvents.length - 1 && <div className={styles.timelineLine}></div>}
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <div className={styles.timelineMeta}>
                        <span className={styles.timelineDate}>{date}</span>
                        <span className={styles.timelineTime}>{time}</span>
                        <span className={`${styles.timelineType} ${getEventTypeClass(event.type)}`}>
                          {event.type}
                        </span>
                      </div>
                      <div className={styles.timelineActor}>
                        <span className={styles.timelineActorIcon}>{getActorIcon(event.actor)}</span>
                        <span className={styles.timelineActorLabel}>{getActorLabel(event.actor)}</span>
                      </div>
                    </div>
                    <div className={styles.timelineSummary}>{event.summary}</div>
                    {event.details && (
                      <details
                        className={styles.timelineDetails}
                        open={isExpanded}
                        onToggle={(e) => {
                          setExpandedEvent(e.currentTarget.open ? event.id : null)
                        }}
                      >
                        <summary className={styles.timelineDetailsSummary}>Ver detalle</summary>
                        <div className={styles.timelineDetailsContent}>
                          <div className={styles.timelineDetailsText}>{event.details}</div>
                          {event.relatedDocumentId && (
                            <div className={styles.timelineDetailsMeta}>
                              Documento relacionado: {event.relatedDocumentId}
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredEvents.length > 20 && !showAll && (
            <div className={styles.showMore}>
              <button className={styles.showMoreButton} onClick={() => setShowAll(true)}>
                Ver más ({filteredEvents.length - 20} eventos adicionales)
              </button>
            </div>
          )}

          {showAll && filteredEvents.length > 20 && (
            <div className={styles.showMore}>
              <button className={styles.showMoreButton} onClick={() => setShowAll(false)}>
                Ver menos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
