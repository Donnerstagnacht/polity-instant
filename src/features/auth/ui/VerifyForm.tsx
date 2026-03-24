'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/features/shared/ui/ui/button';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Alert, AlertDescription } from '@/features/shared/ui/ui/alert';
import { Loader2, Shield, ArrowLeft, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAuthStore } from '@/features/auth/auth.ts';
import { useAuthVerification } from '@/features/auth/hooks/useAuthVerification';

export function VerifyForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as Record<string, string>;
  const { requestMagicCode, error, clearError } = useAuthStore();
  const { isVerifying, verifyAndInitialize } = useAuthVerification();

  const email = searchParams.email || '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate({ to: '/auth' });
    }
  }, [email, navigate]);

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && value) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '');

    if (pastedText.length === 6) {
      const newCode = pastedText.split('');
      setCode(newCode);
      handleVerify(pastedText);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const verificationCode = codeToVerify || code.join('');
    if (verificationCode.length !== 6) {
      return;
    }

    console.log('🔐 Starting verification with Aria & Kai initialization');
    setVerificationError(null);

    const result = await verifyAndInitialize(email, verificationCode);

    if (result.success) {
      console.log('✅ Verification successful, isNewUser:', result.isNewUser);
      
      if (result.isNewUser) {
        // New user - set onboarding flag BEFORE navigating (TanStack Router strips unknown search params)
        console.log('🎉 Setting polity_onboarding in sessionStorage and navigating to /');
        sessionStorage.setItem('polity_onboarding', 'true');
        navigate({ to: '/' });
      } else {
        // Existing user - redirect to homepage
        console.log('✅ Existing user, redirecting to homepage');
        navigate({ to: '/' });
      }
    } else {
      console.log('❌ Verification failed:', result.error);
      setVerificationError(result.error || 'Verification failed');
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    clearError();

    const success = await requestMagicCode(email);
    setIsResending(false);

    if (success) {
      setCode(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  };

  const handleBackToEmail = () => {
    navigate({ to: '/auth' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Shield className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth.verify.title')}</CardTitle>
          <CardDescription>
            {t('auth.verify.description')} <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>{t('auth.verify.codeLabel')}</Label>
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={el => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="h-12 w-12 text-center text-lg font-semibold"
                  value={digit}
                  onChange={e => handleCodeChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isVerifying}
                />
              ))}
            </div>
          </div>

          {(error || verificationError) && (
            <Alert variant="destructive">
              <AlertDescription>{verificationError || error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => handleVerify()}
              className="w-full"
              disabled={isVerifying || code.some(digit => digit === '')}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.verify.verifying')}
                </>
              ) : (
                t('auth.verify.submit')
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBackToEmail}
                className="flex-1"
                disabled={isVerifying}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('auth.verify.back')}
              </Button>

              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={isVerifying || isResending}
                className="flex-1"
              >
                {isResending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}
                {t('auth.verify.resend')}
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>{t('auth.verify.footer.checkSpam')}</p>
            <p className="mt-1">
              {t('auth.verify.footer.devNote')}{' '}
              <code className="rounded bg-muted px-1">123456</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

