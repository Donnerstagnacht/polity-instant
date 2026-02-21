import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/providers/auth-provider'
import { AmendmentEditContent } from '@/features/amendments/ui/AmendmentEditContent'

export const Route = createFileRoute('/_authed/create/amendment')({
  component: CreateAmendmentPage,
})

function CreateAmendmentPage() {
  const [amendmentId] = useState(() => crypto.randomUUID())
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <AmendmentEditContent
      amendmentId={amendmentId}
      amendment={undefined}
      collaborators={[]}
      currentUserId={user?.id || ''}
      isLoading={false}
    />
  )
}
