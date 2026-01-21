import { NextRequest, NextResponse } from 'next/server'
import { getDocuments } from '@/lib/dataService'

export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  const { caseId } = params

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 200))

  const documents = getDocuments(caseId)

  return NextResponse.json(documents)
}
