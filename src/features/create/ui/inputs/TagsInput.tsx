import { useState } from 'react'
import { Label } from '@/features/shared/ui/ui/label'
import { Input } from '@/features/shared/ui/ui/input'
import { Button } from '@/features/shared/ui/ui/button'
import { Badge } from '@/features/shared/ui/ui/badge'
import { X, Plus } from 'lucide-react'

interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  label?: string
  placeholder?: string
  maxTags?: number
}

export function TagsInput({
  value,
  onChange,
  label = 'Tags',
  placeholder = 'Add a tag',
  maxTags = 20,
}: TagsInputProps) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const tag = input.trim().toLowerCase()
    if (tag && !value.includes(tag) && value.length < maxTags) {
      onChange([...value, tag])
      setInput('')
    }
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="icon" onClick={addTag} disabled={!input.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
