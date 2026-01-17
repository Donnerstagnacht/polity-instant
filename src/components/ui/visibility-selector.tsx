'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Info, Check, Globe, Lock, Users } from 'lucide-react';

type Visibility = 'public' | 'authenticated' | 'private';

interface VisibilityOption {
  value: Visibility;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const visibilityOptions: VisibilityOption[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can see this content',
    icon: <Globe className="h-4 w-4" />,
  },
  {
    value: 'authenticated',
    label: 'Authenticated',
    description: 'Only logged-in users can see this',
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only collaborators/members can see this',
    icon: <Lock className="h-4 w-4" />,
  },
];

interface VisibilitySelectorProps {
  value: Visibility;
  onChange: (value: Visibility) => void;
  label?: string;
  showTooltip?: boolean;
}

export function VisibilitySelector({
  value,
  onChange,
  label = 'Visibility',
  showTooltip = true,
}: VisibilitySelectorProps) {
  const selectedOption = visibilityOptions.find(opt => opt.value === value);

  const content = (
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
      <div className="grid grid-cols-3 gap-2">
        {visibilityOptions.map(option => (
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

  if (showTooltip) {
    return <TooltipProvider>{content}</TooltipProvider>;
  }

  return content;
}
