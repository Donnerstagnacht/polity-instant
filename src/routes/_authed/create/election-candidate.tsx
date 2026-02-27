import { createFileRoute } from '@tanstack/react-router'
import { CreateFormShell } from '@/features/create/ui/CreateFormShell'
import { useCreateElectionCandidateForm } from '@/features/create/hooks/useCreateElectionCandidateForm'

export const Route = createFileRoute('/_authed/create/election-candidate')({
  component: CreateElectionCandidatePage,
})

function CreateElectionCandidatePage() {
  const config = useCreateElectionCandidateForm()
  return <CreateFormShell config={config} />
}
