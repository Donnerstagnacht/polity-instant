'use client';

import { useState } from 'react';
import { Button } from '@/features/shared/ui/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/features/shared/ui/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/features/shared/ui/ui/command';
import { ToggleGroup, ToggleGroupItem } from '@/features/shared/ui/ui/toggle-group';
import { Checkbox } from '@/features/shared/ui/ui/checkbox';
import { Layers, Filter, Check } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import type { TDiscussion } from '../types';

type FilterMode = 'select' | 'choice';

interface SuggestionViewToggleProps {
  discussions: TDiscussion[];
  selectedCrIds: Set<string> | null;
  onSelectedCrIdsChange: (crIds: Set<string> | null) => void;
}

export function SuggestionViewToggle({
  discussions,
  selectedCrIds,
  onSelectedCrIdsChange,
}: SuggestionViewToggleProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('select');

  // Get unique CRs from discussions that have a crId
  const crOptions = discussions
    .filter((d): d is TDiscussion & { crId: string } => !!d.crId)
    .map(d => ({
      crId: d.crId,
      title: d.title || d.crId,
      userId: d.userId,
    }));

  const isFiltered = selectedCrIds !== null;

  // Derive button label
  const buttonLabel = (() => {
    if (!isFiltered) return t('features.editor.suggestionView.allSuggestions');
    if (selectedCrIds.size === 1) {
      const [singleCr] = selectedCrIds;
      return singleCr;
    }
    return t('features.editor.suggestionView.nSelected', { count: selectedCrIds.size });
  })();

  // Handle mode toggle transitions
  const handleModeChange = (newMode: string) => {
    if (!newMode) return; // ToggleGroup can fire empty when deselecting
    const mode = newMode as FilterMode;
    if (mode === filterMode) return;

    if (mode === 'select') {
      // Choice → Select: if exactly one ticked, keep it; otherwise revert to all
      if (selectedCrIds && selectedCrIds.size === 1) {
        // keep as-is
      } else {
        onSelectedCrIdsChange(null);
      }
    } else {
      // Select → Choice: if one CR was selected, start Choice with that one ticked
      // if "all" was selected, start with no filter (null)
    }
    setFilterMode(mode);
  };

  // Select mode: pick one CR (or all)
  const handleSelectCr = (crId: string | null) => {
    if (crId === null) {
      onSelectedCrIdsChange(null);
    } else {
      onSelectedCrIdsChange(new Set([crId]));
    }
    setOpen(false);
  };

  // Choice mode: toggle a CR in/out of the set
  const handleToggleCr = (crId: string) => {
    const current = selectedCrIds ? new Set(selectedCrIds) : new Set<string>();
    if (current.has(crId)) {
      current.delete(crId);
    } else {
      current.add(crId);
    }
    // When all unchecked, show all
    onSelectedCrIdsChange(current.size === 0 ? null : current);
  };

  // Choice mode: select all / deselect all
  const handleSelectAll = () => {
    const allCrIds = new Set(crOptions.map(o => o.crId));
    onSelectedCrIdsChange(allCrIds);
  };

  const handleDeselectAll = () => {
    onSelectedCrIdsChange(null);
  };

  const allSelected = selectedCrIds !== null && crOptions.length > 0 && crOptions.every(o => selectedCrIds.has(o.crId));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isFiltered ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          {isFiltered ? <Filter className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
          {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        {/* Mode toggle */}
        <div className="border-b px-3 py-2">
          <ToggleGroup
            type="single"
            value={filterMode}
            onValueChange={handleModeChange}
            size="sm"
            className="w-full"
          >
            <ToggleGroupItem value="select" className="flex-1 text-xs">
              {t('features.editor.suggestionView.selectMode')}
            </ToggleGroupItem>
            <ToggleGroupItem value="choice" className="flex-1 text-xs">
              {t('features.editor.suggestionView.choiceMode')}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {filterMode === 'select' ? (
          /* Select mode: radio-style list */
          <Command>
            <CommandInput placeholder={t('features.editor.suggestionView.searchPlaceholder')} />
            <CommandList>
              <CommandEmpty>{t('features.editor.suggestionView.noResults')}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => handleSelectCr(null)}
                >
                  <Layers className="mr-2 h-4 w-4" />
                  {t('features.editor.suggestionView.allSuggestions')}
                  {selectedCrIds === null && <Check className="ml-auto h-4 w-4" />}
                </CommandItem>
                {crOptions.map(option => (
                  <CommandItem
                    key={option.crId}
                    onSelect={() => handleSelectCr(option.crId)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-mono text-sm">{option.crId}</span>
                      {option.title !== option.crId && (
                        <span className="text-xs text-muted-foreground">{option.title}</span>
                      )}
                    </div>
                    {selectedCrIds?.has(option.crId) && <Check className="ml-auto h-4 w-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : (
          /* Choice mode: checkbox list */
          <Command>
            <CommandInput placeholder={t('features.editor.suggestionView.searchPlaceholder')} />
            <CommandList>
              <CommandEmpty>{t('features.editor.suggestionView.noResults')}</CommandEmpty>
              <CommandGroup>
                {/* Select All / Deselect All */}
                <CommandItem
                  onSelect={allSelected ? handleDeselectAll : handleSelectAll}
                >
                  <Checkbox
                    checked={allSelected}
                    className="mr-2"
                    tabIndex={-1}
                  />
                  {allSelected
                    ? t('features.editor.suggestionView.deselectAll')
                    : t('features.editor.suggestionView.selectAll')}
                </CommandItem>
                {crOptions.map(option => {
                  const isChecked = selectedCrIds?.has(option.crId) ?? false;
                  return (
                    <CommandItem
                      key={option.crId}
                      onSelect={() => handleToggleCr(option.crId)}
                    >
                      <Checkbox
                        checked={isChecked}
                        className="mr-2"
                        tabIndex={-1}
                      />
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">{option.crId}</span>
                        {option.title !== option.crId && (
                          <span className="text-xs text-muted-foreground">{option.title}</span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
