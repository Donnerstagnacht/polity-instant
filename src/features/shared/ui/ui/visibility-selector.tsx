'use client';

import { Button } from '@/features/shared/ui/ui/button.tsx';
import { Label } from '@/features/shared/ui/ui/label.tsx';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/features/shared/ui/ui/tooltip.tsx';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { Info, Check, Globe, Lock, Users } from 'lucide-react';

type Visibility = 'public' | 'authenticated' | 'private';

interface VisibilityOption {
  value: Visibility;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface VisibilitySelectorProps {
  value: Visibility;
  onChange: (value: Visibility) => void;
  label?: string;
  showTooltip?: boolean;
}

export function VisibilitySelector({
  value,
  onChange,
  label,
  showTooltip = true,
}: VisibilitySelectorProps) {
  const { t } = useTranslation();
  const visibilityOptions: VisibilityOption[] = [
    {
      value: 'public',
      label: t('common.visibility.public'),
      description: t('common.visibility.descriptions.public'),
      icon: <Globe className="h-4 w-4" />,
    },
    {
      value: 'authenticated',
      label: t('common.visibility.authenticated'),
      description: t('common.visibility.descriptions.authenticated'),
      icon: <Users className="h-4 w-4" />,
    },
    {
      value: 'private',
      label: t('common.visibility.private'),
      description: t('common.visibility.descriptions.private'),
      icon: <Lock className="h-4 w-4" />,
    },
  ];
  const selectedOption = visibilityOptions.find(opt => opt.value === value);
  const resolvedLabel = label ?? t('common.visibility.label');

  const content = (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label>{resolvedLabel}</Label>
        {showTooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="text-muted-foreground h-4 w-4 cursor-help" />
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
