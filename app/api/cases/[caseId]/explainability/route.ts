import { NextRequest, NextResponse } from 'next/server'
import { getExplainabilityData } from '@/lib/dataService'

export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  const { caseId } = params

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500))

  const explainabilityData = getExplainabilityData(caseId)

  if (!explainabilityData) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  return NextResponse.json(explainabilityData)
}
