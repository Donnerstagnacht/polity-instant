import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/providers/auth-provider'
import { useStatementMutations } from '@/features/statements/hooks/useStatementMutations'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authed/create/statement')({
  component: CreateStatementPage,
})

function CreateStatementPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { createStatement, isLoading } = useStatementMutations()

  const [text, setText] = useState('')
  const [tag, setTag] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'authenticated' | 'private'>('public')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!text.trim()) {
      toast.error('Statement text is required')
      return
    }
    if (!tag.trim()) {
      toast.error('A tag is required')
      return
    }

    const result = await createStatement(user.id, text.trim(), tag.trim(), visibility)
    if (result.success) {
      navigate({ to: '/profile' })
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Create Statement</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="text" className="block text-sm font-medium">
            Statement <span className="text-destructive">*</span>
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your statement…"
            rows={5}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="tag" className="block text-sm font-medium">
            Tag <span className="text-destructive">*</span>
          </label>
          <input
            id="tag"
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g., policy, economy, environment"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="visibility" className="block text-sm font-medium">Visibility</label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as any)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="public">Public</option>
            <option value="authenticated">Authenticated users only</option>
            <option value="private">Private</option>
          </select>
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
            disabled={isLoading}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            {isLoading ? 'Creating…' : 'Create Statement'}
          </button>
        </div>
      </form>
    </div>
  )
}
