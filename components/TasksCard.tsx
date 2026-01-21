'use client'

import { useState } from 'react'
import styles from './Card.module.css'

interface Task {
  id: string
  titulo: string
  status: 'todo' | 'done'
  timestamp: string
}

interface TasksCardProps {
  caseStatus?: string
  tasks?: Task[]
}

export default function TasksCard({ caseStatus, tasks = [] }: TasksCardProps) {
  const isCaseClosed = caseStatus === 'Aprobado' || caseStatus === 'Rechazado'
  const title = isCaseClosed ? 'Historial de tareas' : 'Tareas'
  const [completedExpanded, setCompletedExpanded] = useState(false)

  const pendingTasks = tasks.filter((task) => task.status !== 'done')
  const completedTasks = tasks.filter((task) => task.status === 'done')

  // Si el caso está cerrado, mostrar solo tareas completadas directamente
  if (isCaseClosed) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{title}</h2>
        </div>
        <div className={styles.cardContent}>
          {completedTasks.length === 0 ? (
            <div className={styles.emptyTasks}>No hay tareas en el historial</div>
          ) : (
            <div className={styles.tasksList}>
              {completedTasks.map((task) => (
                <div key={task.id} className={styles.taskItem}>
                  <span className={styles.checkbox}>✓</span>
                  <div className={styles.taskContent}>
                    <div className={styles.taskTitle}>{task.titulo}</div>
                    <div className={styles.taskTimestamp}>
                      {new Date(task.timestamp).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Si el caso está abierto, mostrar secciones de Pendientes y Completadas
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{title}</h2>
      </div>
      <div className={styles.cardContent}>
        {/* Sección Pendientes */}
        <div className={styles.tasksSection}>
          <h3 className={styles.tasksSectionTitle}>Pendientes</h3>
          {pendingTasks.length === 0 ? (
            <div className={styles.emptyTasks}>No hay tareas pendientes</div>
          ) : (
            <div className={styles.tasksList}>
              {pendingTasks.map((task) => (
                <div key={task.id} className={styles.taskItem}>
                  <span className={styles.checkbox}>○</span>
                  <div className={styles.taskContent}>
                    <div className={styles.taskTitle}>{task.titulo}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección Completadas (colapsable) */}
        {completedTasks.length > 0 && (
          <div className={styles.tasksSection}>
            <button
              className={styles.tasksSectionHeader}
              onClick={() => setCompletedExpanded(!completedExpanded)}
            >
              <h3 className={styles.tasksSectionTitle}>Completadas ({completedTasks.length})</h3>
              <span className={styles.expandIcon}>{completedExpanded ? '▼' : '▶'}</span>
            </button>
            {completedExpanded && (
              <div className={styles.tasksList}>
                {completedTasks.map((task) => (
                  <div key={task.id} className={styles.taskItem}>
                    <span className={styles.checkbox}>✓</span>
                    <div className={styles.taskContent}>
                      <div className={styles.taskTitle}>{task.titulo}</div>
                      <div className={styles.taskTimestamp}>
                        {new Date(task.timestamp).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tasks.length === 0 && (
          <div className={styles.emptyTasks}>No hay tareas disponibles</div>
        )}
      </div>
    </div>
  )
}
