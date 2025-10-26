'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/utils/utils';
import { Calendar, FileText, Radio } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface EventNavProps {
  eventId: string;
  className?: string;
}

export function EventNav({ eventId, className }: EventNavProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      label: t('navigation.secondary.event.overview'),
      href: `/event/${eventId}`,
      icon: FileText,
      description: 'Event details and wiki',
    },
    {
      label: t('navigation.secondary.event.agenda'),
      href: `/event/${eventId}/agenda`,
      icon: Calendar,
      description: 'Event agenda and voting items',
    },
    {
      label: t('navigation.secondary.event.stream'),
      href: `/event/${eventId}/stream`,
      icon: Radio,
      description: 'Live event stream with speaker list',
    },
  ];

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <nav className={cn('border-b bg-background', className)}>
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-2 border-b-2 border-transparent px-1 py-4 text-sm font-medium text-muted-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn('border-b bg-background', className)}>
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors hover:text-foreground',
                  isActive
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
