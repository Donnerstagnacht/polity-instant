import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils.ts';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import type { Language } from '@/global-state/language.store';
import type { Size } from '@/navigation/types/navigation.types';
import { useState } from 'react';

export function LanguageToggle({
  size = 'default',
  className,
  side = 'top',
  sideOffset = 8,
  variant = 'popover',
}: {
  size?: Size;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  variant?: 'popover' | 'dropdown';
}) {
  const [isLanguagePopoverOpen, setIsLanguagePopoverOpen] = useState(false);
  const { t, language, changeLanguage } = useTranslation();

  // Helper function to render the language display
  const renderLanguageDisplay = (lang: Language) => {
    return (
      <span className="flex items-center gap-2">
        <span className={cn('text-base', size === 'small' && 'text-sm')}>
          {lang === 'en' ? '🇺🇸' : '🇩🇪'}
        </span>
        <span className={cn('text-sm', size === 'small' && 'text-xs')}>
          {lang === 'en'
            ? t('navigation.toggles.language.english')
            : t('navigation.toggles.language.german')}
        </span>
      </span>
    );
  };

  // Custom language setter with toast notification and i18n integration
  const handleLanguageChange = (lang: Language) => {
    // Change the language using our custom hook
    changeLanguage(lang);

    // Show notification
    toast.success(
      lang === 'en'
        ? t('navigation.toggles.language.changeSuccess')
        : 'Sprache geändert zu Deutsch',
      {
        description:
          lang === 'en'
            ? t('navigation.toggles.language.changeDescription')
            : 'Ihre Spracheinstellung wurde zu Deutsch aktualisiert.',
        icon: lang === 'en' ? '🇺🇸' : '🇩🇪',
      }
    );
  };

  // If dropdown variant is selected, return the dropdown submenu version
  if (variant === 'dropdown') {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <p>{renderLanguageDisplay(language)}</p>
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
              {renderLanguageDisplay('en')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLanguageChange('de')}>
              {renderLanguageDisplay('de')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              {t('navigation.toggles.language.moreLanguages')}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    );
  }

  // Default popover variant
  return (
    <Popover open={isLanguagePopoverOpen} onOpenChange={setIsLanguagePopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', size === 'small' && 'h-6 w-6', className)}
          title={t('navigation.toggles.language.title')}
          onMouseEnter={() => setIsLanguagePopoverOpen(true)}
        >
          <span className={cn('text-sm', size === 'small' && 'text-xs')}>
            {language === 'en' ? '🇺🇸' : '🇩🇪'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-1"
        side={side}
        sideOffset={sideOffset}
        onMouseLeave={() => setIsLanguagePopoverOpen(false)}
      >
        <div className="flex flex-col gap-1">
          <Button
            variant={language === 'en' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 justify-start gap-2"
            onClick={() => {
              handleLanguageChange('en');
              setIsLanguagePopoverOpen(false);
            }}
          >
            <span className="text-base">🇺🇸</span>
            <span className="text-sm">English</span>
          </Button>
          <Button
            variant={language === 'de' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 justify-start gap-2"
            onClick={() => {
              handleLanguageChange('de');
              setIsLanguagePopoverOpen(false);
            }}
          >
            <span className="text-base">🇩🇪</span>
            <span className="text-sm">Deutsch</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
