import { Badge } from '../../components/ui/badge.tsx';
import { Button } from '../../components/ui/button.tsx';
import { cn } from '@/i18n/i18n.types.ts';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover.tsx';
import type { NavigationItem, NavigationView } from '@/navigation/types/navigation.types.tsx';
import { iconMap } from '@/navigation/nav-items/icon-map.tsx';
import React, { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { isItemActive } from './nav-helpers.ts';

export function NavItemList({
  navigationItems,
  isMobile,
  isPrimary,
  navigationView,
}: {
  navigationItems: NavigationItem[];
  isMobile: boolean;
  isPrimary: boolean;
  navigationView: NavigationView;
}) {
  const router = useRouter();
  const currentRoute = router?.state?.location?.pathname ?? 'home';
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (navigationView === 'asButton') {
    return (
      <div className="scrollbar-hide max-h-[70vh] overflow-y-auto">
        <div className="grid w-full auto-rows-max grid-cols-2 gap-8 p-4 sm:grid-cols-3 md:grid-cols-4">
          {/* Use different layout for fewer items */}
          {navigationItems.length <= 4 ? (
            <div className="col-span-full flex flex-wrap justify-center gap-8">
              {navigationItems.map(item => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    'hover:bg-accent relative h-24 w-24 flex-shrink-0 flex-col gap-2',
                    isItemActive(item, currentRoute, isPrimary) &&
                      'bg-accent text-accent-foreground'
                  )}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    setHoveredItem(null); // Reset hover state after click
                  }}
                >
                  {React.createElement(iconMap[item.icon], {
                    className: cn(
                      'h-8 w-8',
                      isItemActive(item, currentRoute, isPrimary) && 'text-primary'
                    ),
                  })}
                  <span className="text-sm">{item.label}</span>
                  {item.badge && (
                    <Badge
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0"
                      variant="default"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          ) : (
            // Original layout for 5+ items
            navigationItems.map(item => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  'hover:bg-accent relative h-24 w-24 flex-shrink-0 flex-col gap-2',
                  isItemActive(item, currentRoute, isPrimary) && 'bg-accent text-accent-foreground'
                )}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setHoveredItem(null); // Reset hover state after click
                }}
              >
                {React.createElement(iconMap[item.icon], {
                  className: cn(
                    'h-8 w-8',
                    isItemActive(item, currentRoute, isPrimary) && 'text-primary'
                  ),
                })}
                <span className="text-sm">{item.label}</span>
                {item.badge && (
                  <Badge
                    className="absolute top-2 right-4 flex h-5 w-5 items-center justify-center p-0"
                    variant="default"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))
          )}
        </div>
      </div>
    );
  }

  // asButtonList variant - Mobile: Horizontal scrolling buttons with popovers
  if (navigationView === 'asButtonList' && isMobile) {
    return (
      <div className="scrollbar-hide flex-1 overflow-x-auto">
        <div className="flex min-w-max items-center justify-center gap-1 px-2">
          {navigationItems.map(item => (
            <Popover key={item.id} open={hoveredItem === item.id}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'hover:bg-accent relative h-12 w-12 flex-shrink-0',
                    isItemActive(item, currentRoute, isPrimary) &&
                      'bg-accent text-accent-foreground'
                  )}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    setHoveredItem(null); // Reset hover state after click
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onTouchStart={() => setHoveredItem(item.id)}
                  onTouchEnd={() => setHoveredItem(null)}
                >
                  {React.createElement(iconMap[item.icon], {
                    className: cn(
                      'h-5 w-5',
                      isItemActive(item, currentRoute, isPrimary) && 'text-primary'
                    ),
                  })}
                  {item.badge && (
                    <Badge
                      className="absolute -top-0 -right-1 flex h-5 w-5 items-center justify-center p-0"
                      variant="default"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-auto p-2" sideOffset={8}>
                <span className="text-sm font-medium">{item.label}</span>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </div>
    );
  }

  // asButtonList variant - Desktop: Vertical sidebar with icon buttons and popovers
  if (navigationView === 'asButtonList' && !isMobile) {
    return (
      <div className={cn('flex flex-col items-center gap-2')}>
        {navigationItems.map(item => (
          <Popover key={item.id} open={hoveredItem === item.id}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'hover:bg-accent relative h-12 w-12 flex-shrink-0',
                  isItemActive(item, currentRoute, isPrimary) && 'bg-accent text-accent-foreground'
                )}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setHoveredItem(null); // Reset hover state after click
                }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {React.createElement(iconMap[item.icon], {
                  className: cn(
                    'h-5 w-5',
                    isItemActive(item, currentRoute, isPrimary) && 'text-primary'
                  ),
                })}
                {item.badge && (
                  <Badge
                    className="absolute -top-0 -right-1 flex h-5 w-5 items-center justify-center p-0"
                    variant="default"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side={isPrimary ? 'right' : 'left'}
              className="w-auto p-2"
              sideOffset={8}
            >
              <span className="text-sm font-medium">{item.label}</span>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    );
  }

  // asLabeledButtonList variant - Mobile: Horizontal scrolling buttons with labels
  if (navigationView === 'asLabeledButtonList' && isMobile) {
    return (
      <div className="scrollbar-hide flex-1 overflow-x-auto">
        <div className="flex min-w-max items-center justify-center gap-1 px-2">
          {navigationItems.map(item => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                'hover:bg-accent flex h-16 min-w-16 flex-shrink-0 flex-col gap-1 px-2',
                isItemActive(item, currentRoute, isPrimary) && 'bg-accent text-accent-foreground'
              )}
              onClick={() => {
                if (item.onClick) item.onClick();
                setHoveredItem(null); // Reset hover state after click
              }}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="relative">
                {' '}
                {React.createElement(iconMap[item.icon], {
                  className: cn(
                    'h-5 w-5 flex-shrink-0',
                    isItemActive(item, currentRoute, isPrimary) && 'text-primary'
                  ),
                })}
                {item.badge && (
                  <Badge
                    className="absolute -top-3 -right-5 flex h-5 w-5 items-center justify-center p-0"
                    variant="default"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-center text-xs leading-tight whitespace-nowrap">
                {item.label}
              </span>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // asLabeledButtonList variant - Desktop: Full sidebar with icons and labels
  if (navigationView === 'asLabeledButtonList' && !isMobile) {
    return (
      <div className="flex flex-col gap-2">
        {navigationItems.map(item => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              'h-12 flex-shrink-0 justify-start gap-3 px-3',
              isItemActive(item, currentRoute, isPrimary) && 'bg-accent text-accent-foreground'
            )}
            onClick={() => {
              if (item.onClick) item.onClick();
              setHoveredItem(null); // Reset hover state after click
            }}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {React.createElement(iconMap[item.icon], {
              className: cn(
                'h-5 w-5',
                isItemActive(item, currentRoute, isPrimary) && 'text-primary'
              ),
            })}
            <span>{item.label}</span>
            {item.badge && (
              <Badge className="ml-auto" variant="default">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    );
  }

  return null;
}
