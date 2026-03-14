import { useState, useMemo } from 'react'
import { TypeaheadSearch } from '@/features/shared/ui/typeahead/TypeaheadSearch'
import { toTypeaheadItems } from '@/features/shared/ui/typeahead/toTypeaheadItems'
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers'
import { useUserState } from '@/zero/users/useUserState'
import { Label } from '@/features/shared/ui/ui/label'
import { Badge } from '@/features/shared/ui/ui/badge'
import { Button } from '@/features/shared/ui/ui/button'
import { X, Users } from 'lucide-react'

interface UserSearchInputProps {
  value: string[]
  onChange: (userIds: string[]) => void
  label?: string
  placeholder?: string
  /** User ID to exclude (usually the current user) */
  excludeUserId?: string
  /** Allow selecting multiple users */
  multi?: boolean
}

export function UserSearchInput({
  value,
  onChange,
  label,
  placeholder = 'Search users by name or handle...',
  excludeUserId,
  multi = true,
}: UserSearchInputProps) {
  const { allUsers } = useUserState({ includeAllUsers: true })
  const [singleValue, setSingleValue] = useState('')

  const filteredUsers = useMemo(() => {
    let users = allUsers ?? []
    if (excludeUserId) {
      users = users.filter((u) => u.id !== excludeUserId)
    }
    if (multi) {
      users = users.filter((u) => !value.includes(u.id))
    }
    return users
  }, [allUsers, excludeUserId, value, multi])

  const selectedUsers = useMemo(() => {
    if (!allUsers) return []
    return value.map((id) => allUsers.find((u) => u.id === id)).filter((u): u is NonNullable<typeof u> => Boolean(u))
  }, [allUsers, value])

  const items = useMemo(
    () =>
      toTypeaheadItems(
        filteredUsers,
        'user',
        (u) => `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'User',
        (u) => u.handle ? `@${u.handle}` : u.email,
        (u) => u.avatar,
      ),
    [filteredUsers],
  )

  const handleSelect = (userId: string) => {
    if (multi) {
      if (!value.includes(userId)) {
        onChange([...value, userId])
      }
    } else {
      onChange([userId])
      setSingleValue(userId)
    }
  }

  const handleRemove = (userId: string) => {
    onChange(value.filter((id) => id !== userId))
  }

  return (
    <div className="space-y-3">
      {label && <Label className="mb-2 block">{label}</Label>}
      <TypeaheadSearch
        items={items}
        value={multi ? '' : singleValue}
        onChange={(item: TypeaheadItem | null) => {
          if (item) handleSelect(item.id)
        }}
        placeholder={placeholder}
      />

      {/* Selected users list */}
      {multi && selectedUsers.length > 0 && (
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">
            {selectedUsers.length} selected
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <Badge key={user.id} variant="secondary" className="gap-1 py-1">
                {user.first_name} {user.last_name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => handleRemove(user.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
