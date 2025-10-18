import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/navigation/toggles/theme-toggle';
import { StateToggle } from '@/navigation/toggles/state-toggle';
import { LanguageToggle } from '@/navigation/toggles/language-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { NavigationType } from '@/navigation/types/navigation.types';
import { useEffect, useState } from 'react';
import { useNavigationStore } from '../state/navigation.store';

export const StateSwitcher: React.FC<{
  isMobile: boolean;
  navigationType: NavigationType;
}> = ({ isMobile, navigationType: navigationType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const isPrimary = navigationType === 'primary';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { navigationView, setNavigationView } = useNavigationStore();

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // Horizontal layout for asLabeledButtonList
  if (navigationView === 'asLabeledButtonList' && !isMobile) {
    return (
      <div className="flex items-center gap-3">
        <StateToggle currentState={navigationView} onStateChange={setNavigationView} size="small" />
        <div className="h-8 w-px bg-border"></div>
        <LanguageToggle size="small" />
        <div className="h-8 w-px bg-border"></div>
        <ThemeToggle size="small" />
      </div>
    );
  }

  // Mobile expandable variant - positioned based on priority
  if (['asButtonList', 'asLabeledButtonList'].includes(navigationView) && isMobile) {
    return (
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 hover:bg-accent"
            onMouseEnter={() => {
              if (hoverTimeout) {
                clearTimeout(hoverTimeout);
              }
              const timeout = setTimeout(() => {
                setIsDropdownOpen(true);
              }, 200);
              setHoverTimeout(timeout);
            }}
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={isPrimary ? 'top' : 'top'}
          align="end"
          className="p-1"
          style={{ width: 'max-content', minWidth: 'fit-content' }}
          sideOffset={5}
          onMouseEnter={() => {
            if (hoverTimeout) {
              clearTimeout(hoverTimeout);
            }
            setIsDropdownOpen(true);
          }}
          onMouseLeave={() => {
            if (hoverTimeout) {
              clearTimeout(hoverTimeout);
            }
            const timeout = setTimeout(() => {
              setIsDropdownOpen(false);
            }, 300);
            setHoverTimeout(timeout);
          }}
        >
          <div className="px-1 py-1">
            <ThemeToggle size="small" />
          </div>
          <DropdownMenuSeparator />
          <LanguageToggle size="small" variant="dropdown" />
          <DropdownMenuSeparator />
          <div className="p-1">
            <StateToggle
              currentState={navigationView}
              onStateChange={newState => {
                setNavigationView(newState);
                setIsDropdownOpen(false);
              }}
              size="small"
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Expandable variant for desktop asButtonList
  if (navigationView === 'asButtonList' && !isMobile) {
    return (
      <DropdownMenu open={isExpanded} onOpenChange={setIsExpanded}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onMouseEnter={() => {
              // Clear any existing timeout
              if (hoverTimeout) {
                clearTimeout(hoverTimeout);
              }
              // Set a new timeout to show the dropdown after a short delay
              const timeout = setTimeout(() => {
                setIsExpanded(true);
              }, 200);
              setHoverTimeout(timeout);
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={isPrimary ? 'right' : 'left'}
          align="start"
          className="p-1"
          style={{ width: 'max-content', minWidth: 'fit-content' }}
          sideOffset={5}
          onMouseEnter={() => {
            // Clear any existing timeout
            if (hoverTimeout) {
              clearTimeout(hoverTimeout);
            }
            setIsExpanded(true);
          }}
          onMouseLeave={() => {
            // Clear any existing timeout
            if (hoverTimeout) {
              clearTimeout(hoverTimeout);
            }
            const timeout = setTimeout(() => {
              setIsExpanded(false);
            }, 300);
            setHoverTimeout(timeout);
          }}
        >
          <div className="px-1 py-1">
            <ThemeToggle size="small" />
          </div>
          <DropdownMenuSeparator />
          <>
            <LanguageToggle size="small" variant="dropdown" />
            <DropdownMenuSeparator />
          </>
          <div className="p-1">
            <StateToggle
              currentState={navigationView}
              onStateChange={newState => {
                setNavigationView(newState);
                setIsExpanded(false);
              }}
              size="small"
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Overlay variant for asButton fullscreen
  if (navigationView === 'asButton') {
    return (
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 transform gap-2 rounded-full border bg-background/95 p-2 shadow-lg backdrop-blur-sm">
        <StateToggle currentState={navigationView} onStateChange={setNavigationView} />
        <>
          <div className="mx-1 w-px bg-border"></div>
          <LanguageToggle />
        </>
        <div className="mx-1 w-px bg-border"></div>
        <ThemeToggle size="default" />
      </div>
    );
  }
};
