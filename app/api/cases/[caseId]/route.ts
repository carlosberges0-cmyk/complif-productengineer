import { NextRequest, NextResponse } from 'next/server'
import { getCaseById, getPendingItems, getTasks, getPendingRequirements, getValidationIssues } from '@/lib/dataService'

export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  const { caseId } = params

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 300))

  const caseData = getCaseById(caseId)

  if (!caseData) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  // Retornar case, status y datos adicionales
  return NextResponse.json({
    case: caseData.case,
    status: caseData.status,
    caseData: caseData.caseData,
    pendingItems: getPendingItems(caseId),
    tasks: getTasks(caseId),
    pendingRequirements: getPendingRequirements(caseId),
    validationIssues: getValidationIssues(caseId),
  })
}
