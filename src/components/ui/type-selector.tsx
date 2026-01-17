'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Check, MessageSquare, Mic, Vote, Users } from 'lucide-react';

type AgendaItemType = 'election' | 'vote' | 'speech' | 'discussion';

interface TypeOption {
  value: AgendaItemType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const typeOptions: TypeOption[] = [
  {
    value: 'discussion',
    label: 'Discussion',
    description: 'Open discussion or Q&A session',
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    value: 'speech',
    label: 'Speech',
    description: 'Presentation or address',
    icon: <Mic className="h-4 w-4" />,
  },
  {
    value: 'election',
    label: 'Election',
    description: 'Vote for positions or candidates',
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: 'vote',
    label: 'Vote',
    description: 'Vote on a proposal or amendment',
    icon: <Vote className="h-4 w-4" />,
  },
];

interface TypeSelectorProps {
  value: AgendaItemType;
  onChange: (value: AgendaItemType) => void;
  label?: string;
  showTooltip?: boolean;
}

export function TypeSelector({
  value,
  onChange,
  label = 'Type',
  showTooltip = true,
}: TypeSelectorProps) {
  const selectedOption = typeOptions.find(opt => opt.value === value);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        {showTooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 cursor-help text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{selectedOption?.description}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {typeOptions.map(option => (
          <Button
            key={option.value}
            type="button"
            variant={value === option.value ? 'default' : 'outline'}
            onClick={() => onChange(option.value)}
            className="flex items-center gap-2"
          >
            {value === option.value ? <Check className="h-4 w-4" /> : option.icon}
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
