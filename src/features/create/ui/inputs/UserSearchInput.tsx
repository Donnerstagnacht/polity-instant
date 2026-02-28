import { useState, useMemo } from 'react'
import { TypeAheadSelect } from '@/features/shared/ui/ui/type-ahead-select'
import { useUserState } from '@/zero/users/useUserState'
import { Label } from '@/features/shared/ui/ui/label'
import { Badge } from '@/features/shared/ui/ui/badge'
import { Button } from '@/features/shared/ui/ui/button'
import { X, Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/features/shared/ui/ui/card'

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

function UserCard({ user }: { user: any }) {
  return (
    <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 transition-all hover:shadow-md dark:from-blue-900/40 dark:to-indigo-900/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            {user.first_name} {user.last_name}
          </CardTitle>
          <Badge variant="outline" className="flex-shrink-0">
            <Users className="mr-1 h-3 w-3" />
            User
          </Badge>
        </div>
        {user.handle && (
          <CardDescription className="text-xs">@{user.handle}</CardDescription>
        )}
      </CardHeader>
    </Card>
  )
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
      users = users.filter((u: any) => u.id !== excludeUserId)
    }
    if (multi) {
      users = users.filter((u: any) => !value.includes(u.id))
    }
    return users
  }, [allUsers, excludeUserId, value, multi])

  const selectedUsers = useMemo(() => {
    if (!allUsers) return []
    return value.map((id) => allUsers.find((u: any) => u.id === id)).filter(Boolean)
  }, [allUsers, value])

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
      <TypeAheadSelect
        items={filteredUsers}
        value={multi ? '' : singleValue}
        onChange={handleSelect}
        placeholder={placeholder}
        searchKeys={['first_name', 'last_name', 'handle', 'email'] as any}
        renderItem={(user: any) => <UserCard user={user} />}
        getItemId={(user: any) => user.id}
      />

      {/* Selected users list */}
      {multi && selectedUsers.length > 0 && (
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">
            {selectedUsers.length} selected
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user: any) => (
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
