'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Input } from '@/features/shared/ui/ui/input';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { cn } from '@/features/shared/utils/utils';

interface VotePasswordInputProps {
  onSubmit: (password: string) => void;
  error?: string | null;
  isLoading?: boolean;
  className?: string;
}

/**
 * 4-digit PIN input that auto-submits when all 4 digits are entered.
 */
export function VotePasswordInput({ onSubmit, error, isLoading, className }: VotePasswordInputProps) {
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Clear on error
  useEffect(() => {
    if (error) {
      setDigits(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  }, [error]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (isLoading) return;

      // Only allow single digit
      const digit = value.replace(/\D/g, '').slice(-1);

      setDigits((prev) => {
        const next = [...prev];
        next[index] = digit;

        // Auto-submit when all 4 digits are entered
        if (digit && index === 3 && next.every((d) => d !== '')) {
          // Use setTimeout to let React update state first
          setTimeout(() => onSubmit(next.join('')), 0);
        }

        return next;
      });

      // Move focus to next input
      if (digit && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [isLoading, onSubmit],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      if (isLoading) return;

      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
      if (pasted.length === 0) return;

      const newDigits = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setDigits(newDigits);

      if (pasted.length === 4) {
        setTimeout(() => onSubmit(newDigits.join('')), 0);
      } else {
        inputRefs.current[pasted.length]?.focus();
      }
    },
    [digits, isLoading, onSubmit],
  );

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-center text-sm text-muted-foreground">
        {t('features.events.voting.enterPin', 'Enter your 4-digit voting PIN')}
      </p>
      <div className="flex justify-center gap-3" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <Input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isLoading}
            className={cn(
              'h-14 w-14 text-center text-2xl',
              error && 'border-destructive',
            )}
            autoComplete="off"
          />
        ))}
      </div>
      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
