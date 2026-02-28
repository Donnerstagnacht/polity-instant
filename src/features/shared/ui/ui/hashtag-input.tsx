'use client';

import { useState, useRef, useEffect } from 'react';
import { Label } from '@/features/shared/ui/ui/label.tsx';
import { Input } from '@/features/shared/ui/ui/input.tsx';
import { Button } from '@/features/shared/ui/ui/button.tsx';
import { X, Hash } from 'lucide-react';
import { getHashtagGradient } from '@/features/timeline/logic/gradient-assignment.ts';

interface HashtagInputProps {
  value: string[];
  onChange: (hashtags: string[]) => void;
  label?: string;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
}

export function HashtagInput({
  value,
  onChange,
  label = 'Hashtags',
  placeholder = 'Add a hashtag',
  maxTags,
  suggestions = [],
}: HashtagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = inputValue.trim().replace(/^#/, '');
  const filteredSuggestions = trimmed
    ? suggestions.filter(s => s.toLowerCase().includes(trimmed.toLowerCase()) && !value.includes(s))
    : suggestions.filter(s => !value.includes(s));

  const addHashtag = (tag?: string) => {
    const tagToAdd = tag ?? trimmed;
    if (tagToAdd && !value.includes(tagToAdd)) {
      if (!maxTags || value.length < maxTags) {
        onChange([...value, tagToAdd]);
        setInputValue('');
        setShowSuggestions(false);
        setSelectedIndex(0);
      }
    }
  };

  const removeHashtag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredSuggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        addHashtag(filteredSuggestions[selectedIndex]);
        return;
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      addHashtag();
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor="hashtag-input">{label}</Label>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(tag => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm text-white ${getHashtagGradient(tag)}`}
            >
              <Hash className="h-3 w-3" />
              {tag}
              <button
                type="button"
                onClick={() => removeHashtag(tag)}
                className="ml-1 rounded-full hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Hash className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            id="hashtag-input"
            placeholder={placeholder}
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            className="pl-9"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="bg-popover absolute z-50 mt-1 w-full rounded-md border p-1 shadow-md">
              {filteredSuggestions.slice(0, 8).map((suggestion, idx) => (
                <button
                  key={suggestion}
                  type="button"
                  className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
                    idx === selectedIndex
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  }`}
                  onMouseDown={e => {
                    e.preventDefault();
                    addHashtag(suggestion);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <Hash className="text-muted-foreground h-3 w-3" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button type="button" variant="secondary" onClick={() => addHashtag()}>
          Add
        </Button>
      </div>
      {maxTags && (
        <p className="text-muted-foreground text-xs">
          {value.length}/{maxTags} hashtags
        </p>
      )}
    </div>
  );
}
