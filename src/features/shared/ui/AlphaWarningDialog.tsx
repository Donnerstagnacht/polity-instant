'use client';

import { useState } from 'react';
import { useTranslation } from '@/features/shared/hooks/use-translation.ts';
import { Badge } from '@/features/shared/ui/ui/badge.tsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/features/shared/ui/ui/alert-dialog.tsx';

export function AlphaWarningDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertDialogTitle>{t('common.alphaWarning.title')}</AlertDialogTitle>
            <Badge className="border-0 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 font-bold text-slate-950 shadow-sm">
              0.1
            </Badge>
          </div>
          <AlertDialogDescription>{t('common.alphaWarning.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setOpen(false)}>
            {t('common.alphaWarning.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
