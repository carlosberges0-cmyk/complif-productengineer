import { NextRequest, NextResponse } from 'next/server'
import { getCases } from '@/lib/dataService'

export async function GET(request: NextRequest) {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 200))

  const cases = getCases()
  return NextResponse.json(cases)
}
