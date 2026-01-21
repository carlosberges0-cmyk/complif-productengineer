import { NextRequest, NextResponse } from 'next/server'
import { getAuditEvents } from '@/lib/dataService'

export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  const { caseId } = params

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 200))

  const events = getAuditEvents(caseId)

  return NextResponse.json(events)
}
