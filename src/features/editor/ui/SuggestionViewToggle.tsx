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
import { Layers, Filter, Check } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import type { TDiscussion } from '../types';

interface SuggestionViewToggleProps {
  discussions: TDiscussion[];
  selectedCrId: string | null;
  onSelectedCrIdChange: (crId: string | null) => void;
}

export function SuggestionViewToggle({
  discussions,
  selectedCrId,
  onSelectedCrIdChange,
}: SuggestionViewToggleProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Get unique CRs from discussions that have a crId
  const crOptions = discussions
    .filter((d): d is TDiscussion & { crId: string } => !!d.crId)
    .map(d => ({
      crId: d.crId,
      title: d.title || d.crId,
      userId: d.userId,
    }));

  const isFiltered = selectedCrId !== null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isFiltered ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          {isFiltered ? <Filter className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
          {isFiltered ? selectedCrId : t('features.editor.suggestionView.allSuggestions')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <Command>
          <CommandInput placeholder={t('features.editor.suggestionView.searchPlaceholder')} />
          <CommandList>
            <CommandEmpty>{t('features.editor.suggestionView.noResults')}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onSelectedCrIdChange(null);
                  setOpen(false);
                }}
              >
                <Layers className="mr-2 h-4 w-4" />
                {t('features.editor.suggestionView.allSuggestions')}
                {selectedCrId === null && <Check className="ml-auto h-4 w-4" />}
              </CommandItem>
              {crOptions.map(option => (
                <CommandItem
                  key={option.crId}
                  onSelect={() => {
                    onSelectedCrIdChange(option.crId);
                    setOpen(false);
                  }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-mono text-sm">{option.crId}</span>
                    {option.title !== option.crId && (
                      <span className="text-xs text-muted-foreground">{option.title}</span>
                    )}
                  </div>
                  {selectedCrId === option.crId && <Check className="ml-auto h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
