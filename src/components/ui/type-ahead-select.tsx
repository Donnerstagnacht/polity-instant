'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/utils';

interface TypeAheadSelectProps<T> {
  items: T[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchKeys: (keyof T)[];
  renderItem: (item: T) => React.ReactNode;
  renderSelected?: (item: T) => React.ReactNode;
  getItemId: (item: T) => string;
  className?: string;
  label?: string;
}

export function TypeAheadSelect<T>({
  items,
  value,
  onChange,
  placeholder = 'Search...',
  searchKeys,
  renderItem,
  renderSelected,
  getItemId,
  className,
  label,
}: TypeAheadSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find(item => getItemId(item) === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items based on search term
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;

    return searchKeys.some(key => {
      const value = item[key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  });

  const handleSelect = (item: T) => {
    onChange(getItemId(item));
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && <label className="mb-2 block text-sm font-medium">{label}</label>}

      {/* Selected Item Display or Search Input */}
      {selectedItem && !isOpen ? (
        <div className="relative">
          {renderSelected ? (
            renderSelected(selectedItem)
          ) : (
            <Card
              className="cursor-pointer p-4 transition-colors hover:bg-accent"
              onClick={() => setIsOpen(true)}
            >
              {renderItem(selectedItem)}
            </Card>
          )}
          <button
            onClick={handleClear}
            className="absolute right-2 top-2 rounded-full p-1 hover:bg-destructive/10 hover:text-destructive"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="pl-10"
          />
        </div>
      )}

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-96 w-full overflow-y-auto rounded-md border bg-popover shadow-lg">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No items found</div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredItems.map(item => (
                <button
                  key={getItemId(item)}
                  onClick={() => handleSelect(item)}
                  className="w-full rounded-md text-left transition-colors hover:bg-accent"
                >
                  {renderItem(item)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
