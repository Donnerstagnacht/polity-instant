import { Laptop, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/i18n/i18n.types';
import { useThemeStore } from '@/global-state/theme.store';
import { useTranslation } from '@/hooks/use-translation';
import type { Size } from '@/navigation/types/navigation.types';

const ThemeButton = ({
  theme,
  currentTheme,
  onClick,
  icon: Icon,
  title,
  size = 'default',
}: {
  theme: string;
  currentTheme: string;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  size?: Size;
}) => {
  const isActive = currentTheme === theme;

  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      size="icon"
      className={cn('h-8 w-8', size === 'small' && 'h-6 w-6')}
      onClick={onClick}
      title={title}
    >
      <Icon className={cn('h-4 w-4', size === 'small' && 'h-3 w-3')} />
    </Button>
  );
};

export function ThemeToggle({ size = 'default', className }: { size?: Size; className?: string }) {
  const theme = useThemeStore(state => state.theme);
  const setTheme = useThemeStore(state => state.setTheme);
  const isMounted = useThemeStore(state => state.isMounted);
  const { t } = useTranslation();

  // Set the actual theme or placeholder for SSR
  const currentTheme = isMounted ? theme || 'system' : 'system';

  return (
    <div className={cn('flex gap-1', className)}>
      <ThemeButton
        theme="light"
        currentTheme={currentTheme}
        onClick={() => setTheme('light')}
        icon={Sun}
        title={t('navigation.toggles.theme.light')}
        size={size}
      />
      <ThemeButton
        theme="dark"
        currentTheme={currentTheme}
        onClick={() => setTheme('dark')}
        icon={Moon}
        title={t('navigation.toggles.theme.dark')}
        size={size}
      />
      <ThemeButton
        theme="system"
        currentTheme={currentTheme}
        onClick={() => setTheme('system')}
        icon={Laptop}
        title={t('navigation.toggles.theme.system')}
        size={size}
      />
    </div>
  );
}
