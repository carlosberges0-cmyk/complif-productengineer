/**
 * Test básico para el componente ExplainabilityCard
 * 
 * Para ejecutar los tests, instalar las dependencias de testing:
 * npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
 * 
 * Y agregar al package.json:
 * "scripts": {
 *   "test": "jest"
 * }
 */

import { render, screen, waitFor } from '@testing-library/react'
import ExplainabilityCard from '@/components/ExplainabilityCard'

// Mock del fetch
global.fetch = jest.fn()

describe('ExplainabilityCard', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('debe mostrar loading inicialmente', () => {
    (fetch as jest.Mock).mockImplementation(() =>
      new Promise(() => {}) // Promise que nunca se resuelve
    )

    render(<ExplainabilityCard caseId="123" />)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('debe mostrar datos cuando la API responde correctamente', async () => {
    const mockData = {
      caseId: '123',
      lastEvaluationAt: '2024-04-15T14:54:00Z',
      source: 'OCR',
      status: 'REVIEW_REQUIRED',
      autoDecision: null,
      validations: [
        {
          id: 'exp_date',
          name: 'Vigencia del documento',
          result: 'WARN',
          message: 'Vence en 14 días',
        },
      ],
      ocrFields: [
        {
          field: 'CUIT',
          value: '20-12345678-9',
          confidence: 92,
        },
      ],
      flags: [],
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    render(<ExplainabilityCard caseId="123" />)

    await waitFor(() => {
      expect(screen.getByText('Criterios y validaciones')).toBeInTheDocument()
      expect(screen.getByText('Vigencia del documento')).toBeInTheDocument()
    })
  })

  it('debe mostrar mensaje cuando no hay datos (404)', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    render(<ExplainabilityCard caseId="123" />)

    await waitFor(() => {
      expect(
        screen.getByText('No hay validaciones disponibles para este caso.')
      ).toBeInTheDocument()
    })
  })

  it('debe mostrar error cuando falla la petición', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<ExplainabilityCard caseId="123" />)

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument()
    })
  })
})
