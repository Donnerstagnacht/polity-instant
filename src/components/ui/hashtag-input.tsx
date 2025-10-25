'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Hash } from 'lucide-react';

interface HashtagInputProps {
  value: string[];
  onChange: (hashtags: string[]) => void;
  label?: string;
  placeholder?: string;
  maxTags?: number;
}

export function HashtagInput({
  value,
  onChange,
  label = 'Hashtags',
  placeholder = 'Add a hashtag',
  maxTags,
}: HashtagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addHashtag = () => {
    const trimmed = inputValue.trim().replace(/^#/, ''); // Remove leading # if present
    if (trimmed && !value.includes(trimmed)) {
      if (!maxTags || value.length < maxTags) {
        onChange([...value, trimmed]);
        setInputValue('');
      }
    }
  };

  const removeHashtag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHashtag();
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag on backspace if input is empty
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="hashtag-input">{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="hashtag-input"
            placeholder={placeholder}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
        <Button type="button" variant="secondary" onClick={addHashtag}>
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
            >
              <Hash className="h-3 w-3" />
              {tag}
              <button
                type="button"
                onClick={() => removeHashtag(tag)}
                className="ml-1 rounded-full hover:bg-primary/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxTags} hashtags
        </p>
      )}
    </div>
  );
}
