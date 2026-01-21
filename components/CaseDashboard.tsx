'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CaseHeader from './CaseHeader'
import CasesList from './CasesList'
import CaseDataCard from './CaseDataCard'
import PendingCard from './PendingCard'
import TasksCard from './TasksCard'
import ExplainabilityCard from './ExplainabilityCard'
import CaseDetailsTab from './CaseDetailsTab'
import CaseHistoryTab from './CaseHistoryTab'
import { Case } from '@/types/case'
import styles from './CaseDashboard.module.css'

interface CaseDashboardProps {
  caseId: string
}

interface CaseDataResponse {
  case: Case
  status: string
  caseData?: {
    validacionIdentidad: 'PASS' | 'WARN' | 'FAIL'
    origenFondos: 'PASS' | 'WARN' | 'FAIL'
    matrizRiesgo: 'PASS' | 'WARN' | 'FAIL'
  }
  pendingItems?: Array<{
    id: string
    titulo: string
    icono: string
  }>
  tasks?: Array<{
    id: string
    titulo: string
    status: 'todo' | 'done'
    timestamp: string
  }>
  pendingRequirements?: Array<{
    id: string
    docType: string
    reason: string
    dueDate?: string
  }>
  validationIssues?: Array<{
    id: string
    ruleName: string
    severity: 'alta' | 'media' | 'baja'
    message: string
  }>
}

export default function CaseDashboard({ caseId }: CaseDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('RESUMEN')
  const [selectedCaseId, setSelectedCaseId] = useState<string>(caseId)
  const [caseData, setCaseData] = useState<CaseDataResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSelectedCaseId(caseId)
  }, [caseId])

  useEffect(() => {
    if (selectedCaseId) {
      let cancelled = false
      setLoading(true)
      
      fetch(`/api/cases/${selectedCaseId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Case not found')
          }
          return res.json()
        })
        .then((data) => {
          // Solo actualizar el estado si el componente no fue desmontado
          if (!cancelled) {
            // Validar que la respuesta tenga la estructura correcta
            if (data && data.case && data.case.name) {
              setCaseData(data)
            } else {
              setCaseData(null)
            }
            setLoading(false)
          }
        })
        .catch(() => {
          if (!cancelled) {
            setCaseData(null)
            setLoading(false)
          }
        })

      // Cleanup function para cancelar la petición si el componente se desmonta
      return () => {
        cancelled = true
      }
    }
  }, [selectedCaseId])

  const handleCaseSelect = (newCaseId: string) => {
    // Actualizar el estado primero
    setSelectedCaseId(newCaseId)
    // Luego navegar (esto causará que el componente se re-monte con el nuevo caseId)
    router.push(`/cases/${newCaseId}`)
  }

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      Pendiente: styles.statusPending,
      'En revisión': styles.statusReview,
      Aprobado: styles.statusApproved,
      Rechazado: styles.statusRejected,
    }
    return statusMap[status] || styles.statusPending
  }

  return (
    <div className={styles.container}>
      <CaseHeader />
      <div className={styles.mainLayout}>
        <CasesList selectedCaseId={selectedCaseId} onCaseSelect={handleCaseSelect} />
        <div className={styles.contentArea}>
          {loading ? (
            <div className={styles.loading}>Cargando caso...</div>
          ) : caseData && caseData.case && caseData.case.name ? (
            <>
              <div className={styles.caseInfo}>
                <div className={styles.caseProfile}>
                  <div className={styles.avatar}>
                    <svg
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className={styles.caseDetails}>
                    <h1 className={styles.caseName}>{caseData.case.name}</h1>
                    <div className={`${styles.statusBadge} ${getStatusBadgeClass(caseData.status)}`}>
                      {caseData.status !== 'Aprobado' && caseData.status !== 'Rechazado' && (
                        <span className={styles.clockIcon}>
                          <svg
                            width={14}
                            height={14}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </span>
                      )}
                      <span className={styles.pendingText}>{caseData.status}</span>
                    </div>
                  </div>
                </div>
                {caseData.status !== 'Aprobado' && caseData.status !== 'Rechazado' && (
                  <button className={styles.openButton}>Abierto</button>
                )}
              </div>

              <nav className={styles.tabs}>
                <button
                  className={`${styles.tab} ${activeTab === 'RESUMEN' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('RESUMEN')}
                >
                  RESUMEN
                </button>
                <button
                  className={`${styles.tab} ${activeTab === 'DETALLES' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('DETALLES')}
                >
                  DETALLES
                </button>
                <button
                  className={`${styles.tab} ${activeTab === 'HISTORIAL' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('HISTORIAL')}
                >
                  HISTORIAL
                </button>
              </nav>

              {activeTab === 'RESUMEN' && (
                <div className={styles.cardsGrid}>
                  <CaseDataCard caseData={caseData.caseData} />
                  {caseData.status !== 'Aprobado' && caseData.status !== 'Rechazado' && (
                    <PendingCard
                      pendingRequirements={caseData.pendingRequirements}
                      validationIssues={caseData.validationIssues}
                    />
                  )}
                  <ExplainabilityCard caseId={selectedCaseId} />
                  <TasksCard caseStatus={caseData.status} tasks={caseData.tasks} />
                </div>
              )}

              {activeTab === 'DETALLES' && <CaseDetailsTab caseId={selectedCaseId} />}

              {activeTab === 'HISTORIAL' && <CaseHistoryTab caseId={selectedCaseId} />}
            </>
          ) : (
            <div className={styles.error}>No se pudo cargar el caso</div>
          )}
        </div>
      </div>
    </div>
  )
}
