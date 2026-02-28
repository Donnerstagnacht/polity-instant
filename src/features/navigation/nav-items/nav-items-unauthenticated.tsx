import type { NavigationItem } from '@/features/navigation/types/navigation.types.tsx';

// TanStack Router navigate function type
type NavigateFn = (opts: { to: string }) => void;

// This function factory creates unauthenticated navigation items with router integration
export const createNavItemsUnauthenticated = (
  navigate: NavigateFn,
  t?: (key: string) => string // Optional translation function
): NavigationItem[] => {
  return [
    {
      id: 'home',
      icon: 'Home',
      label: t ? t('navigation.primary.home') : 'Home',
      href: '/',
      onClick: () => navigate({ to: '/' }),
    },
    {
      id: 'features',
      icon: 'Sparkles',
      label: t ? t('navigation.primary.features') : 'Features',
      href: '/features',
      onClick: () => navigate({ to: '/features' }),
    },
    {
      id: 'solutions',
      icon: 'Target',
      label: t ? t('navigation.primary.solutions') : 'Solutions',
      href: '/solutions',
      onClick: () => navigate({ to: '/solutions' }),
    },
    {
      id: 'pricing',
      icon: 'CreditCard',
      label: t ? t('navigation.primary.pricing') : 'Pricing',
      href: '/pricing',
      onClick: () => navigate({ to: '/pricing' }),
    },
    {
      id: 'support',
      icon: 'Heart',
      label: t ? t('navigation.primary.support') : 'Support',
      href: '/support',
      onClick: () => navigate({ to: '/support' }),
    },
    {
      id: 'auth',
      icon: 'User',
      label: 'Login',
      href: '/auth',
      onClick: () => navigate({ to: '/auth' }),
    },
  ];
};

// Backward compatibility - static version for contexts where hooks can't be used
export const navItemsUnauthenticated: NavigationItem[] = [
  { id: 'home', icon: 'Home', label: 'Home', href: '/' },
  { id: 'features', icon: 'Sparkles', label: 'Features', href: '/features' },
  { id: 'solutions', icon: 'Target', label: 'Solutions', href: '/solutions' },
  { id: 'pricing', icon: 'CreditCard', label: 'Pricing', href: '/pricing' },
  { id: 'support', icon: 'Heart', label: 'Support', href: '/support' },
  { id: 'auth', icon: 'User', label: 'Login', href: '/auth' },
];
