'use client';

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/features/shared/ui/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Search, X } from 'lucide-react';
import { cn } from '@/features/shared/utils/utils';
import { useTypeaheadSearch } from '@/features/shared/hooks/useTypeaheadSearch';
import { TypeaheadDropdown } from './TypeaheadDropdown';
import { getEntityIcon } from '@/features/shared/logic/entityCardHelpers';
import { ENTITY_COLORS } from '@/features/shared/utils/entity-colors';
import type { TypeaheadItem, EntityType } from '@/features/shared/logic/typeaheadHelpers';

interface TypeaheadSearchProps {
  entityTypes?: EntityType[];
  value?: string;
  onChange: (item: TypeaheadItem | null) => void;
  placeholder?: string;
  multiple?: boolean;
  renderItem?: (item: TypeaheadItem) => React.ReactNode;
  filterFn?: (item: TypeaheadItem) => boolean;
  /** When provided, these items are used instead of the internal search hook results. */
  items?: TypeaheadItem[];
  className?: string;
  label?: string;
  /** Render dropdown inline instead of via portal. Use inside dialogs where portals escape the focus trap. */
  disablePortal?: boolean;
}

export function TypeaheadSearch({
  entityTypes = [],
  value,
  onChange,
  placeholder = 'Search...',
  filterFn,
  items: externalItems,
  className,
  label,
  disablePortal = false,
}: TypeaheadSearchProps) {
  const { query, setQuery, results: hookResults } = useTypeaheadSearch({ entityTypes });
  const baseResults = externalItems ?? hookResults;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const dropdownPortalRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  // When using external items, filter locally by query
  const queryFilteredResults = externalItems
    ? baseResults.filter(item => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          (item.secondaryLabel?.toLowerCase().includes(q) ?? false)
        );
      })
    : baseResults;

  const filteredResults = filterFn ? queryFilteredResults.filter(filterFn) : queryFilteredResults;

  // Find selected item for display
  const selectedItem = value ? baseResults.find(r => r.id === value) : null;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideContainer = containerRef.current?.contains(target);
      const clickedInsideDropdown = dropdownPortalRef.current?.contains(target);

      if (!clickedInsideContainer && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recompute portal position whenever the dropdown opens or the window scrolls/resizes
  useLayoutEffect(() => {
    if (!isOpen || disablePortal) return;
    const update = () => {
      const el = inputWrapperRef.current ?? containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (item: TypeaheadItem) => {
      onChange(item);
      setIsOpen(false);
      setQuery('');
      setSelectedIndex(0);
    },
    [onChange, setQuery],
  );

  const handleClear = useCallback(() => {
    onChange(null);
    setQuery('');
  }, [onChange, setQuery]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          setIsOpen(true);
          return;
        }
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredResults[selectedIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    },
    [isOpen, filteredResults, selectedIndex, handleSelect],
  );

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && <label className="mb-2 block text-sm font-medium">{label}</label>}

      {/* Selected item display or search input */}
      {selectedItem && !isOpen ? (
        <div className="relative flex items-center gap-2 rounded-md border bg-background px-3 py-2">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage src={selectedItem.avatar ?? undefined} />
            <AvatarFallback className="text-[10px]">
              {(() => { const Icon = getEntityIcon(selectedItem.entityType); return <Icon className="h-3 w-3" />; })()}
            </AvatarFallback>
          </Avatar>
          <span className="flex-1 truncate text-sm font-medium">{selectedItem.label}</span>
          {(() => {
            const colors = ENTITY_COLORS[selectedItem.entityType as keyof typeof ENTITY_COLORS];
            return (
              <Badge variant="outline" className={cn('shrink-0 text-[10px]', colors?.badgeBg)}>
                {selectedItem.entityType}
              </Badge>
            );
          })()}
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full p-1 hover:bg-destructive/10 hover:text-destructive"
            aria-label="Clear selection"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div ref={inputWrapperRef} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
      )}

      {/* Dropdown — inline when disablePortal is set (e.g. inside dialogs), otherwise via portal */}
      {isOpen && (externalItems ? true : query.trim().length > 0) && (
        disablePortal ? (
          <div
            ref={dropdownPortalRef}
            className="absolute left-0 right-0 top-full z-[9999] mt-1"
          >
            <TypeaheadDropdown
              results={filteredResults.slice(0, 20)}
              query={query}
              selectedIndex={selectedIndex}
              onSelect={handleSelect}
              onHoverIndex={setSelectedIndex}
            />
          </div>
        ) : (
          createPortal(
            <div
              ref={dropdownPortalRef}
              data-typeahead-portal
              style={{
                position: 'absolute',
                top: dropdownStyle.top,
                left: dropdownStyle.left,
                width: dropdownStyle.width,
                zIndex: 9999,
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <TypeaheadDropdown
                results={filteredResults.slice(0, 20)}
                query={query}
                selectedIndex={selectedIndex}
                onSelect={handleSelect}
                onHoverIndex={setSelectedIndex}
              />
            </div>,
            document.body,
          )
        )
      )}
    </div>
  );
}
