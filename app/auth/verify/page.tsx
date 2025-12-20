'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, ArrowLeft, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/features/auth/auth.ts';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { db, tx, id } from '../../../db/db';
import { ARIA_KAI_USER_ID, ARIA_KAI_WELCOME_MESSAGE } from 'e2e/aria-kai';
import { AriaKaiWelcomeDialog } from '@/components/dialogs/AriaKaiWelcomeDialog';

function VerifyContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyMagicCode, requestMagicCode, isLoading, error, clearError } = useAuthStore();

  const email = searchParams.get('email') || '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push('/auth');
    }
  }, [email, router]);

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

    const success = await verifyMagicCode(email, verificationCode);

    if (success) {
      // Initialize first-time users with Aria & Kai conversation
      try {
        const { user } = useAuthStore.getState();

        if (user?.id) {
          // Check if user already has a handle
          const { data } = await db.queryOnce({
            $users: {
              $: { where: { id: user.id } },
            },
          });

          const userRecord = data?.$users?.[0];

          console.log('🔍 First-time user check:', {
            userId: user.id,
            hasHandle: !!userRecord?.handle,
            handle: userRecord?.handle,
            willShowDialog: !userRecord?.handle,
          });

          if (!userRecord?.handle) {
            const now = Date.now();
            const threeYearsAgo = now - 3 * 365 * 24 * 60 * 60 * 1000;
            const conversationId = id();
            const messageId = id();

            // First ensure Aria & Kai exists
            await db.transact([
              tx.$users[ARIA_KAI_USER_ID].update({
                name: 'Aria & Kai',
                handle: '@ariakai',
                subtitle: 'Your Personal Assistants',
                bio: 'Aria & Kai are your personal AI assistants dedicated to helping you get the most out of Polity.',
                createdAt: threeYearsAgo,
                updatedAt: threeYearsAgo,
                lastSeenAt: now,
                visibility: 'public',
              }),
            ]);

            // Generate random handle
            const adjectives = [
              'Quick',
              'Lazy',
              'Happy',
              'Sad',
              'Bright',
              'Dark',
              'Clever',
              'Bold',
              'Swift',
              'Calm',
            ];
            const nouns = [
              'Fox',
              'Dog',
              'Cat',
              'Bird',
              'Fish',
              'Mouse',
              'Lion',
              'Bear',
              'Wolf',
              'Eagle',
            ];
            const randomHandle = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 9000) + 1000}`;

            // Initialize user and create conversation
            await db.transact([
              tx.$users[user.id].update({
                handle: randomHandle,
                name: email.split('@')[0],
                updatedAt: now,
                lastSeenAt: now,
              }),
              tx.conversations[conversationId].update({
                lastMessageAt: now,
                createdAt: now,
                type: 'direct',
                status: 'accepted',
              }),
              tx.conversations[conversationId].link({
                requestedBy: ARIA_KAI_USER_ID,
              }),
              tx.conversationParticipants[id()]
                .update({
                  lastReadAt: null,
                  joinedAt: now,
                  leftAt: null,
                })
                .link({ user: user.id, conversation: conversationId }),
              tx.conversationParticipants[id()]
                .update({
                  lastReadAt: now,
                  joinedAt: now,
                  leftAt: null,
                })
                .link({ user: ARIA_KAI_USER_ID, conversation: conversationId }),
              tx.messages[messageId]
                .update({
                  content: ARIA_KAI_WELCOME_MESSAGE,
                  isRead: false,
                  createdAt: now,
                  updatedAt: null,
                  deletedAt: null,
                })
                .link({ conversation: conversationId, sender: ARIA_KAI_USER_ID }),
            ]);

            console.log('✅ Aria & Kai conversation created:', {
              conversationId,
              messageId,
              userId: user.id,
              ariaKaiId: ARIA_KAI_USER_ID,
            });

            // Show welcome dialog for new users
            console.log('🎉 Setting showWelcomeDialog to true');
            setShowWelcomeDialog(true);
          } else {
            // Existing user, redirect normally
            router.push('/');
          }
        }
      } catch (error) {
        console.error('❌ Error initializing user:', error);
        // Don't block login on initialization failure
        router.push('/');
      }
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
    router.push('/auth');
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
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => handleVerify()}
              className="w-full"
              disabled={isLoading || code.some(digit => digit === '')}
            >
              {isLoading ? (
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
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('auth.verify.back')}
              </Button>

              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={isLoading || isResending}
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

      {/* Welcome Dialog for new users */}
      <AriaKaiWelcomeDialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog} />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <AuthGuard requireAuth={false}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
            <Card className="w-full max-w-md">
              <CardContent className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </AuthGuard>
  );
}
