'use client'

import { useState, useEffect } from 'react'
import { Case, CaseStatus } from '@/types/case'
import { getStatusLabel } from '@/lib/dataService'
import styles from './CasesList.module.css'

interface CasesListProps {
  selectedCaseId: string | null
  onCaseSelect: (caseId: string) => void
}

export default function CasesList({ selectedCaseId, onCaseSelect }: CasesListProps) {
  const [cases, setCases] = useState<Case[]>([])

  useEffect(() => {
    // Cargar casos desde el API
    fetch('/api/cases')
      .then((res) => res.json())
      .then((data) => {
        setCases(data)
      })
      .catch(() => {
        setCases([])
      })
  }, [])

  const getStatusClass = (status: CaseStatus) => {
    const classes: Record<CaseStatus, string> = {
      PENDIENTE: styles.statusPending,
      APROBADO: styles.statusApproved,
      RECHAZADO: styles.statusRejected,
      EN_REVISION: styles.statusReview,
    }
    return classes[status]
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Casos</h2>
        <span className={styles.count}>{cases.length}</span>
      </div>
      <div className={styles.list}>
        {cases.map((caseItem) => (
          <button
            key={caseItem.id}
            className={`${styles.caseItem} ${
              selectedCaseId === caseItem.id ? styles.selected : ''
            }`}
            onClick={() => onCaseSelect(caseItem.id)}
          >
            <div className={styles.caseInfo}>
              <div className={styles.caseName}>{caseItem.name}</div>
              <div className={`${styles.statusBadge} ${getStatusClass(caseItem.status)}`}>
                {getStatusLabel(caseItem.status)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
