import {
  CalendarIcon,
  CheckCircle2Icon,
  EyeIcon,
  GavelIcon,
  PenIcon,
  PencilLineIcon,
  Vote,
  XCircleIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useTranslation } from '@/features/shared/hooks/use-translation';
import { cn } from '@/features/shared/utils/utils.ts';
import {
  type EditingMode,
  EDITING_MODE_METADATA,
  SELECTABLE_MODES,
  normalizeEditingMode,
} from '@/zero/rbac/workflow-constants';

import { Badge } from './badge.tsx';
import { DropdownMenuRadioGroup, DropdownMenuRadioItem } from './dropdown-menu.tsx';

export type SelectableEditingMode = Exclude<EditingMode, 'passed' | 'rejected'>;

type Translate = (
  key: string,
  paramsOrFallback?: string | Record<string, string | number | undefined | null>,
  fallback?: string
) => string;

interface EditingModeOption {
  colorClass: string;
  description: string;
  Icon: LucideIcon;
  label: string;
  value: EditingMode;
}

const MODE_ICON_MAP: Record<EditingMode, LucideIcon> = {
  edit: PenIcon,
  view: EyeIcon,
  suggest_internal: PencilLineIcon,
  suggest_event: CalendarIcon,
  vote_internal: Vote,
  vote_event: GavelIcon,
  passed: CheckCircle2Icon,
  rejected: XCircleIcon,
};

const MODE_LABEL_KEYS: Record<EditingMode, { fallback: string; key: string }> = {
  edit: {
    key: 'features.amendments.workflow.collaborativeEditing',
    fallback: 'Collaborative Editing',
  },
  view: {
    key: 'features.amendments.workflow.viewing',
    fallback: 'Viewing',
  },
  suggest_internal: {
    key: 'features.amendments.workflow.internalSuggesting',
    fallback: 'Internal Suggesting',
  },
  suggest_event: {
    key: 'features.amendments.workflow.eventSuggesting',
    fallback: 'Event Suggesting',
  },
  vote_internal: {
    key: 'features.amendments.workflow.internalVoting',
    fallback: 'Internal Voting',
  },
  vote_event: {
    key: 'features.amendments.workflow.eventVoting',
    fallback: 'Event Voting',
  },
  passed: {
    key: 'features.amendments.workflow.passed',
    fallback: 'Passed',
  },
  rejected: {
    key: 'features.amendments.workflow.rejected',
    fallback: 'Rejected',
  },
};

export function getEditingModeOption(
  mode: EditingMode | string | null | undefined,
  t: Translate
): EditingModeOption {
  const value = normalizeEditingMode(mode);
  const metadata = EDITING_MODE_METADATA[value];
  const labelConfig = MODE_LABEL_KEYS[value];

  return {
    colorClass: metadata.color,
    description: metadata.description,
    Icon: MODE_ICON_MAP[value],
    label: t(labelConfig.key, labelConfig.fallback),
    value,
  };
}

export function getSelectableEditingModeOptions(t: Translate): EditingModeOption[] {
  return SELECTABLE_MODES.map(mode => getEditingModeOption(mode, t));
}

export function EditingModeBadge({
  className,
  mode,
  showIcon = false,
  variant = 'secondary',
}: {
  className?: string;
  mode: EditingMode | string | null | undefined;
  showIcon?: boolean;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}) {
  const { t } = useTranslation();
  const option = getEditingModeOption(mode, t);

  return (
    <Badge variant={variant} className={cn(showIcon && 'gap-1.5', className)}>
      {showIcon ? <option.Icon className="h-3.5 w-3.5" /> : null}
      {option.label}
    </Badge>
  );
}

export function EditingModeMenuItems({
  disabled = false,
  modes = SELECTABLE_MODES as SelectableEditingMode[],
  onValueChange,
  showDescriptions = true,
  value,
}: {
  disabled?: boolean;
  modes?: SelectableEditingMode[];
  onValueChange: (value: SelectableEditingMode) => void;
  showDescriptions?: boolean;
  value: SelectableEditingMode;
}) {
  const { t } = useTranslation();
  const options = modes.map(mode => getEditingModeOption(mode, t));

  return (
    <DropdownMenuRadioGroup
      value={value}
      onValueChange={nextValue => onValueChange(nextValue as SelectableEditingMode)}
    >
      {options.map(option => (
        <DropdownMenuRadioItem
          key={option.value}
          value={option.value}
          disabled={disabled}
          className="items-start gap-3 pl-8"
        >
          <div className={cn('mt-1 h-2.5 w-2.5 rounded-full', option.colorClass)} />
          <option.Icon className="mt-0.5 h-4 w-4" />
          <div className="flex-1">
            <div className="font-medium">{option.label}</div>
            {showDescriptions ? (
              <p className="text-muted-foreground text-xs">{option.description}</p>
            ) : null}
          </div>
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}