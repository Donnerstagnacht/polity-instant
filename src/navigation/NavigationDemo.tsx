import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/navigation/toggles/theme-toggle';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import type { NavigationType, ScreenType } from './types/navigation.types';
import { useScreenStore } from '@/global-state/screen.store';

export default function NavigationDemo({
  onScreenTypeChange,
  onPriorityChange,
}: {
  onScreenTypeChange?: (screenType: ScreenType) => void;
  onPriorityChange?: (priority: NavigationType) => void;
}) {
  const { t } = useTranslation();
  const isMobile = useScreenStore(state => state.isMobileScreen);
  const [screenType, setScreenType] = useState<ScreenType>('automatic');
  const [actualScreen, setActualScreen] = useState<'mobile' | 'desktop'>('desktop');
  const [priority, setPriority] = useState<NavigationType>('combined');

  // Handle screen type changes
  const handleScreenTypeChange = (type: ScreenType) => {
    setScreenType(type);
    if (onScreenTypeChange) {
      onScreenTypeChange(type);
    }
  };

  // Handle priority changes
  const handlePriorityChange = (type: NavigationType) => {
    setPriority(type);
    if (onPriorityChange) {
      onPriorityChange(type);
    }
  };

  // Update actual screen type based on screenType selection and device
  useEffect(() => {
    if (screenType === 'automatic') {
      setActualScreen(isMobile ? 'mobile' : 'desktop');
    } else {
      setActualScreen(screenType);
    }
  }, [screenType, isMobile]);
  return (
    <div className="container mx-auto p-8">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('navigationDemo.title')}</CardTitle>
            <CardDescription>{t('navigationDemo.description')}</CardDescription>
          </div>
          <ThemeToggle />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 text-lg font-medium">{t('navigationDemo.screenType.title')}</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={screenType === 'mobile' ? 'default' : 'outline'}
                onClick={() => handleScreenTypeChange('mobile')}
              >
                {t('navigationDemo.screenType.mobile')}
              </Button>
              <Button
                variant={screenType === 'desktop' ? 'default' : 'outline'}
                onClick={() => handleScreenTypeChange('desktop')}
              >
                {t('navigationDemo.screenType.desktop')}
              </Button>
              <Button
                variant={screenType === 'automatic' ? 'default' : 'outline'}
                onClick={() => handleScreenTypeChange('automatic')}
              >
                {t('navigationDemo.screenType.automatic')}
              </Button>
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <Badge variant="outline" className="mr-2">
                {screenType}
              </Badge>
              <span>{t('navigationDemo.screenType.description')}</span>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="mb-3 text-lg font-medium">{t('navigationDemo.commandPalette.title')}</h3>
            <div>
              <Button
                variant="outline"
                className="w-full justify-start text-sm text-muted-foreground"
              >
                <Search className="mr-2 h-4 w-4" />
                <span>{t('navigationDemo.commandPalette.placeholder')}</span>
                <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="mb-3 text-lg font-medium">{t('navigationDemo.themeSettings.title')}</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('navigationDemo.themeSettings.description')}
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-medium">{t('navigationDemo.priority.title')}</h3>
            <div className="flex gap-2">
              <Button
                variant={priority === 'primary' ? 'default' : 'outline'}
                onClick={() => handlePriorityChange('primary')}
              >
                {t('navigationDemo.priority.primary')}
              </Button>
              <Button
                variant={priority === 'secondary' ? 'default' : 'outline'}
                onClick={() => handlePriorityChange('secondary')}
              >
                {t('navigationDemo.priority.secondary')}
              </Button>
              <Button
                variant={priority === 'combined' ? 'default' : 'outline'}
                onClick={() => handlePriorityChange('combined')}
              >
                {t('navigationDemo.priority.combined')}
              </Button>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="mb-3 text-lg font-medium">{t('navigationDemo.currentConfig.title')}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{t('navigationDemo.currentConfig.state')}: asButton</Badge>
              <Badge variant="secondary">
                {t('navigationDemo.currentConfig.priority')}: {priority}
              </Badge>
              <Badge variant="secondary">
                {t('navigationDemo.currentConfig.screen')}: {actualScreen}
              </Badge>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="mb-3 text-lg font-medium">{t('navigationDemo.stateSwitcher.title')}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>{t('navigationDemo.stateSwitcher.asButton.title')}</strong>
                {t('navigationDemo.stateSwitcher.asButton.description')}
              </p>
              <p>
                <strong>{t('navigationDemo.stateSwitcher.asButtonList.title')}</strong>
                {t('navigationDemo.stateSwitcher.asButtonList.description')}
              </p>
              <p>
                <strong>{t('navigationDemo.stateSwitcher.asLabeledButtonList.title')}</strong>
                {t('navigationDemo.stateSwitcher.asLabeledButtonList.description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>
                {t('navigationDemo.sampleContent.title')} {i + 1}
              </CardTitle>
              <CardDescription>{t('navigationDemo.sampleContent.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('navigationDemo.sampleContent.content')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
