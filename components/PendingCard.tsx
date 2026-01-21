import styles from './Card.module.css'

interface PendingRequirement {
  id: string
  docType: string
  reason: string
  dueDate?: string | null
}

interface ValidationIssue {
  id: string
  ruleName: string
  severity: 'alta' | 'media' | 'baja'
  message: string
}

interface PendingCardProps {
  pendingRequirements?: PendingRequirement[]
  validationIssues?: ValidationIssue[]
}

const iconMap: Record<string, JSX.Element> = {
  bank: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="7" width="20" height="14" rx="2"></rect>
      <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"></path>
      <path d="M6 21V11h12v10"></path>
    </svg>
  ),
  location: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  document: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
    </svg>
  ),
  money: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  ),
  risk: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    </svg>
  ),
  phone: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  ),
  review: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
  ),
  approval: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  compliance: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 11l3 3L22 4"></path>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
  ),
}

const getIconForDocType = (docType: string): JSX.Element => {
  const typeLower = docType.toLowerCase()
  if (typeLower.includes('banco') || typeLower.includes('cuenta') || typeLower.includes('extracto')) {
    return iconMap.bank
  }
  if (typeLower.includes('dirección') || typeLower.includes('domicilio')) {
    return iconMap.location
  }
  if (typeLower.includes('identidad') || typeLower.includes('dni') || typeLower.includes('documento')) {
    return iconMap.document
  }
  if (typeLower.includes('fondos') || typeLower.includes('dinero')) {
    return iconMap.money
  }
  return iconMap.document
}

const getSeverityIcon = (severity: string): JSX.Element => {
  if (severity === 'alta') {
    return iconMap.risk
  }
  return iconMap.review
}

export default function PendingCard({
  pendingRequirements = [],
  validationIssues = [],
}: PendingCardProps) {
  const allPendingItems = [
    ...pendingRequirements.map((req) => ({
      id: req.id,
      type: 'requirement' as const,
      title: req.docType,
      detail: req.reason,
      dueDate: req.dueDate,
      icon: getIconForDocType(req.docType),
    })),
    ...validationIssues.map((issue) => ({
      id: issue.id,
      type: 'validation' as const,
      title: issue.ruleName,
      detail: issue.message,
      severity: issue.severity,
      icon: getSeverityIcon(issue.severity),
    })),
  ]

  const pendingCount = allPendingItems.length

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>
          Pendientes {pendingCount > 0 && `(${pendingCount})`}
        </h2>
      </div>
      <div className={styles.cardContent}>
        {allPendingItems.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Sin pendientes</p>
          </div>
        ) : (
          allPendingItems.map((item) => (
            <div key={item.id} className={styles.pendingItem}>
              <div className={styles.pendingHeader}>
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.pendingBadge}>Pendiente</span>
              </div>
              <div className={styles.pendingContent}>
                <div className={styles.pendingTitle}>{item.title}</div>
                {item.detail && (
                  <div className={styles.pendingDetail}>{item.detail}</div>
                )}
                {item.type === 'requirement' && item.dueDate && (
                  <div className={styles.pendingDueDate}>
                    Vence: {new Date(item.dueDate).toLocaleDateString('es-AR')}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
