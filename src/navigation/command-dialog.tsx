import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { getIconComponent } from '@/navigation/nav-items/icon-map';
import { getShortcutForItem } from '@/navigation/nav-keyboard/keyboard-navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  useCommandDialogShortcut,
  useNavigationKeyboard,
} from '@/navigation/nav-keyboard/use-navigation-keyboard';
import { navItemsAuthenticated } from '@/navigation/nav-items/nav-items-authenticated';
import { useNavigationStore } from '@/navigation/state/navigation.store';
import type { NavigationItem } from '@/navigation/types/navigation.types';
import { useAuth } from '@/providers/auth-provider';

export function NavigationCommandDialog({
  primaryNavItems,
  secondaryNavItems,
}: {
  primaryNavItems: NavigationItem[];
  secondaryNavItems: NavigationItem[] | null;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  useCommandDialogShortcut(setOpen, open);
  const { user } = useAuth();
  const authenticated = !!user;
  const userId = user?.id;

  const { setNavigationType } = useNavigationStore();

  useNavigationKeyboard({
    isActive: true,
    onNavigate: (navId: string) => {
      const navItems = [...primaryNavItems, ...(secondaryNavItems || [])];
      const navItem = navItems.find(navItem => navItem.id === navId);
      if (navItem) {
        // Navigate to the appropriate route
        if (navItem.onClick) {
          navItem.onClick();
        } else {
          const route = navId === 'home' ? '/' : `/${navId}`;
          navigate({ to: route });
        }

        // Toggle priority based on navigation item if it exists in both
        const inPrimary = primaryNavItems.some(primaryNavItem => primaryNavItem.id === navItem.id);
        const inSecondary = secondaryNavItems
          ? secondaryNavItems.some(secondaryNavItem => secondaryNavItem.id === navItem.id)
          : false;

        if (inPrimary && !inSecondary) {
          setNavigationType('primary');
        } else if (inSecondary && !inPrimary) {
          setNavigationType('secondary');
        }

        setOpen(false);
      }
    },
    onThemeToggle: () => setOpen(false),
    onKeyboardShortcutsOpen: () => setOpen(false),
    onClose: () => setOpen(false),
    items: [...primaryNavItems, ...(secondaryNavItems || [])],
  });

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t('navigation.commandDialog.placeholder')} />
      <CommandList>
        <CommandEmpty>{t('navigation.commandDialog.noResults')}</CommandEmpty>
        <CommandGroup heading={t('navigation.commandDialog.groups.primaryNavigation')}>
          {primaryNavItems.map(item => {
            const IconComponent = getIconComponent(item.icon);
            return (
              <CommandItem
                key={item.id}
                onSelect={() => {
                  // Navigate to the appropriate route
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    const route = item.id === 'home' ? '/' : `/${item.id}`;
                    navigate({ to: route });
                  }
                  setOpen(false);
                }}
              >
                <div className="flex items-center">
                  <IconComponent className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge className="ml-2" variant="secondary">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <CommandShortcut>{getShortcutForItem(item.id).display}</CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>

        {authenticated && userId && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t('navigation.commandDialog.groups.userNavigation', 'User Navigation')}>
              {navItemsAuthenticated(navigate)
                .getUserSecondaryNavItems(userId, true)
                .map((item: NavigationItem) => {
                  const IconComponent = getIconComponent(item.icon);
                  return (
                    <CommandItem
                      key={item.id}
                      onSelect={() => {
                        // Navigate to the appropriate route
                        if (item.onClick) {
                          item.onClick();
                        } else if (item.href) {
                          navigate({ to: item.href });
                        }
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center">
                        <IconComponent className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge className="ml-2" variant="secondary">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <CommandShortcut>{getShortcutForItem(item.id).display}</CommandShortcut>
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
