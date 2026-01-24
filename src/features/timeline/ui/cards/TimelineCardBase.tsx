'use client';

import { ReactNode, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CARD_RADIUS, getCardShadowClasses } from '../../utils/gradient-assignment';
import {
  ContentType,
  CONTENT_TYPE_CONFIG,
  getContentTypeGradient,
} from '../../constants/content-type-config';
import { type LucideIcon } from 'lucide-react';

export interface TimelineCardBaseProps {
  contentType: ContentType;
  className?: string;
  children: ReactNode;
  elevated?: boolean;
  onClick?: () => void;
  /** URL to navigate to when card is clicked (supports left-click and right-click open in new tab) */
  href?: string;
}

/**
 * Base card wrapper for all timeline cards
 * Provides consistent styling, shadows, and hover effects
 * When href is provided, the card becomes clickable with:
 * - Left-click: Navigate using Next.js router
 * - Middle-click or Ctrl+click: Open in new tab
 * Uses div instead of Link to avoid nested anchor issues
 */
export function TimelineCardBase({
  contentType,
  className,
  children,
  elevated = false,
  onClick,
  href,
}: TimelineCardBaseProps) {
  const router = useRouter();
  const shadowClasses = getCardShadowClasses(elevated);

  const cardStyles = cn(
    'block overflow-hidden border border-gray-100 dark:border-gray-800',
    'bg-card text-card-foreground',
    CARD_RADIUS.card,
    shadowClasses,
    'transform transition-all duration-200',
    'hover:-translate-y-1',
    (onClick || href) && 'cursor-pointer',
    className
  );

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    // If user clicked on an interactive element inside, don't navigate
    const target = e.target as HTMLElement;
    if (e.defaultPrevented) {
      return;
    }
    const interactive = target.closest(
      'a, button, [role="button"], input, select, textarea, label'
    );
    if (interactive && interactive !== e.currentTarget) {
      return;
    }

    if (onClick) {
      onClick();
    }

    if (href) {
      // Ctrl+click or Cmd+click opens in new tab
      if (e.ctrlKey || e.metaKey) {
        window.open(href, '_blank');
        return;
      }

      // Use Next.js routing for standard left click
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <div
      className={cardStyles}
      onClick={handleClick}
      role={href ? 'link' : onClick ? 'button' : undefined}
      tabIndex={href || onClick ? 0 : undefined}
      onKeyDown={e => {
        if (href && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          router.push(href);
        }
        if (!href && onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={href ? `Open ${contentType}` : undefined}
    >
      {children}
    </div>
  );
}

export interface TimelineCardHeaderProps {
  contentType: ContentType;
  title: string;
  subtitle?: string;
  /** URL for the subtitle link (e.g., group page) */
  subtitleHref?: string;
  badge?: ReactNode;
  showIcon?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Header component for timeline cards with gradient background
 */
export function TimelineCardHeader({
  contentType,
  title,
  subtitle,
  subtitleHref,
  badge,
  showIcon = true,
  className,
  children,
}: TimelineCardHeaderProps) {
  const config = CONTENT_TYPE_CONFIG[contentType];
  const gradient = getContentTypeGradient(contentType);
  const Icon = config.icon;
  const router = useRouter();

  const handleSubtitleClick = (e: MouseEvent<HTMLSpanElement>) => {
    if (!subtitleHref) return;
    e.stopPropagation();

    // Ctrl+click or Cmd+click opens in new tab
    if (e.ctrlKey || e.metaKey) {
      window.open(subtitleHref, '_blank');
    } else {
      router.push(subtitleHref);
    }
  };

  return (
    <div className={cn('p-4', gradient, className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {showIcon && <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', config.accentColor)} />}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold leading-tight">{title}</h3>
            {subtitle &&
              (subtitleHref ? (
                <span
                  onClick={handleSubtitleClick}
                  onAuxClick={e => {
                    if (e.button === 1) {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(subtitleHref, '_blank');
                    }
                  }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(subtitleHref);
                    }
                  }}
                  className="mt-0.5 block cursor-pointer truncate text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  {subtitle}
                </span>
              ) : (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
              ))}
          </div>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

export interface TimelineCardContentProps {
  className?: string;
  children: ReactNode;
}

/**
 * Content area for timeline cards
 */
export function TimelineCardContent({ className, children }: TimelineCardContentProps) {
  return <div className={cn('p-4 pt-3', className)}>{children}</div>;
}

export interface TimelineCardActionsProps {
  className?: string;
  children: ReactNode;
}

/**
 * Action bar for timeline cards
 */
export function TimelineCardActions({ className, children }: TimelineCardActionsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2 px-4 pb-4 pt-2', className)}>
      {children}
    </div>
  );
}

export interface TimelineCardActionButtonProps {
  icon?: LucideIcon;
  label: string;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'default';
  className?: string;
  disabled?: boolean;
}

/**
 * Standard action button for timeline cards
 */
export function TimelineCardActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'outline',
  size = 'sm',
  className,
  disabled,
}: TimelineCardActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn('flex items-center gap-1.5', className)}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span className="text-xs">{label}</span>
    </Button>
  );
}

export interface TimelineCardStatsProps {
  stats: Array<{
    icon?: LucideIcon;
    label: string;
    value: string | number;
  }>;
  className?: string;
}

/**
 * Stats row for timeline cards
 */
export function TimelineCardStats({ stats, className }: TimelineCardStatsProps) {
  return (
    <div className={cn('flex items-center gap-4 text-xs text-muted-foreground', className)}>
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-1">
          {stat.icon && <stat.icon className="h-3.5 w-3.5" />}
          <span className="font-medium">{stat.value}</span>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

export interface TimelineCardBadgeProps {
  label: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  icon?: LucideIcon;
  className?: string;
}

/**
 * Status/type badge for timeline cards
 */
export function TimelineCardBadge({
  label,
  variant = 'outline',
  icon: Icon,
  className,
}: TimelineCardBadgeProps) {
  return (
    <Badge variant={variant} className={cn('flex-shrink-0 text-xs', className)}>
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  );
}
