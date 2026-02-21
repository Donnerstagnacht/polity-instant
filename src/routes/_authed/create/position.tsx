import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useGroupState } from '@/zero/groups/useGroupState'
import { useGroupActions } from '@/zero/groups/useGroupActions'
import { useAuth } from '@/providers/auth-provider'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authed/create/position')({
  component: CreatePositionPage,
})

function CreatePositionPage() {
  const { createPosition } = useGroupActions()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [term, setTerm] = useState('4')
  const [firstTermStart, setFirstTermStart] = useState('')
  const [groupId, setGroupId] = useState('')

  // Query groups the user is a member of
  const { userMemberships: groups } = useGroupState({ userId: user?.id })
  const userGroups = (groups ?? []).map((m: any) => m.group).filter(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!title.trim()) {
      toast.error('Position title is required')
      return
    }
    if (!groupId) {
      toast.error('Please select a group')
      return
    }
    const termNum = parseInt(term, 10)
    if (isNaN(termNum) || termNum < 1) {
      toast.error('Term must be at least 1 year')
      return
    }
    if (!firstTermStart) {
      toast.error('First term start date is required')
      return
    }

    try {
      const positionId = crypto.randomUUID()

      await createPosition({
        id: positionId,
        title: title.trim(),
        description: description.trim(),
        term: String(termNum),
        first_term_start: new Date(firstTermStart).getTime(),
        scheduled_revote_date: null,
        group_id: groupId,
        event_id: '',
      })

      navigate({ to: '/group/$id', params: { id: groupId } })
    } catch (error) {
      console.error('Failed to create position:', error)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Create Position</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="group" className="block text-sm font-medium">
            Group <span className="text-destructive">*</span>
          </label>
          <select
            id="group"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select a group…</option>
            {userGroups.map((g: any) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., President, Secretary, Treasurer"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Responsibilities and duties (optional)"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="term" className="block text-sm font-medium">
              Term (years) <span className="text-destructive">*</span>
            </label>
            <input
              id="term"
              type="number"
              min="1"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="firstTermStart" className="block text-sm font-medium">
              First Term Start <span className="text-destructive">*</span>
            </label>
            <input
              id="firstTermStart"
              type="date"
              value={firstTermStart}
              onChange={(e) => setFirstTermStart(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
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
            Create Position
          </button>
        </div>
      </form>
    </div>
  )
}
