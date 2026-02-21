import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAgendaState } from '@/zero/agendas/useAgendaState'
import { useAgendaActions } from '@/zero/agendas/useAgendaActions'
import { useAuth } from '@/providers/auth-provider'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authed/create/election-candidate')({
  component: CreateElectionCandidatePage,
})

function CreateElectionCandidatePage() {
  const { addCandidate } = useAgendaActions()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [electionId, setElectionId] = useState('')
  const [statement, setStatement] = useState('')

  // Query pending elections the user can join
  const { pendingElections: elections } = useAgendaState({ includePendingElections: true })
  const availableElections = elections ?? []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!electionId) {
      toast.error('Please select an election')
      return
    }

    try {
      const candidateId = crypto.randomUUID()

      await addCandidate({
        id: candidateId,
        name: '',
        description: statement.trim(),
        election_id: electionId,
        user_id: user.id,
        status: 'pending',
        order_index: 0,
        image_url: '',
      })

      navigate({ to: '/create' })
    } catch (error) {
      console.error('Failed to register as candidate:', error)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Register as Election Candidate</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="election" className="block text-sm font-medium">
            Election <span className="text-destructive">*</span>
          </label>
          <select
            id="election"
            value={electionId}
            onChange={(e) => setElectionId(e.target.value)}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select an election…</option>
            {availableElections.map((el: any) => (
              <option key={el.id} value={el.id}>
                {el.title}
                {el.position?.group ? ` (${el.position.group.name})` : ''}
              </option>
            ))}
          </select>
          {availableElections.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending elections available.</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="statement" className="block text-sm font-medium">Candidate Statement</label>
          <textarea
            id="statement"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="Why should people vote for you? (optional)"
            rows={5}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate({ to: '/create' })}
            className="rounded-md border border-input px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Register as Candidate
          </button>
        </div>
      </form>
    </div>
  )
}
