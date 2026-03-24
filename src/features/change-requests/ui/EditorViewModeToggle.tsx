'use client';

import { useState } from 'react';
import { Button } from '@/features/shared/ui/ui/button';
import { Badge } from '@/features/shared/ui/ui/badge';
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
import { Eye, Layers, Check } from 'lucide-react';
import { cn } from '@/features/shared/utils/utils';

export type EditorViewMode = 'all' | 'single';

interface ChangeRequestOption {
  id: string;
  crId: string;
  title: string;
  type: string;
}

interface EditorViewModeToggleProps {
  mode: EditorViewMode;
  onModeChange: (mode: EditorViewMode) => void;
  selectedCRId: string | null;
  onSelectedCRChange: (crId: string | null) => void;
  changeRequests: ChangeRequestOption[];
}

export function EditorViewModeToggle({
  mode,
  onModeChange,
  selectedCRId,
  onSelectedCRChange,
  changeRequests,
}: EditorViewModeToggleProps) {
  const [open, setOpen] = useState(false);

  const selectedCR = changeRequests.find((cr) => cr.id === selectedCRId);

  const handleModeToggle = () => {
    if (mode === 'all') {
      onModeChange('single');
      // Auto-select first CR if none selected
      if (!selectedCRId && changeRequests.length > 0) {
        onSelectedCRChange(changeRequests[0].id);
      }
    } else {
      onModeChange('all');
      onSelectedCRChange(null);
    }
  };

  const handleSelectCR = (crId: string) => {
    onSelectedCRChange(crId);
    onModeChange('single');
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={mode === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={handleModeToggle}
        className="gap-1.5"
      >
        {mode === 'all' ? (
          <>
            <Layers className="h-3.5 w-3.5" />
            All Suggestions
          </>
        ) : (
          <>
            <Eye className="h-3.5 w-3.5" />
            Single Suggestion
          </>
        )}
      </Button>

      {mode === 'single' && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              {selectedCR ? (
                <>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {selectedCR.crId}
                  </Badge>
                  <span className="max-w-[150px] truncate">{selectedCR.title}</span>
                </>
              ) : (
                'Select CR...'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search change requests..." />
              <CommandList>
                <CommandEmpty>No change requests found.</CommandEmpty>
                <CommandGroup>
                  {changeRequests.map((cr) => (
                    <CommandItem
                      key={cr.id}
                      value={`${cr.crId} ${cr.title}`}
                      onSelect={() => handleSelectCR(cr.id)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedCRId === cr.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <Badge variant="secondary" className="mr-2 font-mono text-xs">
                        {cr.crId}
                      </Badge>
                      <span className="truncate">{cr.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
