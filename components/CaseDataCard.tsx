import styles from './Card.module.css'

interface CaseDataCardProps {
  caseData?: {
    validacionIdentidad: 'PASS' | 'WARN' | 'FAIL'
    origenFondos: 'PASS' | 'WARN' | 'FAIL'
    matrizRiesgo: 'PASS' | 'WARN' | 'FAIL'
  }
}

export default function CaseDataCard({ caseData }: CaseDataCardProps) {
  const data = caseData || {
    validacionIdentidad: 'PASS' as const,
    origenFondos: 'WARN' as const,
    matrizRiesgo: 'PASS' as const,
  }

  const getIcon = (result: 'PASS' | 'WARN' | 'FAIL') => {
    if (result === 'PASS') {
      return (
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )
    }
    if (result === 'WARN') {
      return (
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      )
    }
    return (
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Datos del caso</h2>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.dataItem}>
          <span className={styles.icon}>{getIcon(data.validacionIdentidad)}</span>
          <span className={styles.label}>Validación de identidad</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.icon}>{getIcon(data.origenFondos)}</span>
          <span className={styles.label}>Origen de fondos</span>
        </div>
        <div className={styles.dataItem}>
          <span className={styles.icon}>{getIcon(data.matrizRiesgo)}</span>
          <span className={styles.label}>Matriz de riesgo</span>
        </div>
      </div>
    </div>
  )
}
