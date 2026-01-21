import CaseDashboard from '@/components/CaseDashboard'

export default function CasePage({
  params,
}: {
  params: { caseId: string }
}) {
  return <CaseDashboard caseId={params.caseId} />
}
