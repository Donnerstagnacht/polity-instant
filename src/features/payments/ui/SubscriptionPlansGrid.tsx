import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const PRICE_IDS = {
  running: process.env.NEXT_PUBLIC_STRIPE_PRICE_RUNNING || '',
  development: process.env.NEXT_PUBLIC_STRIPE_PRICE_DEVELOPMENT || '',
} as const;

interface SubscriptionPlansGridProps {
  activeAmount: number;
  isLoading: boolean;
  onSubscribe: (priceId: string) => void;
  onCustomAmount: (euros: number) => void;
  onCancel: () => void;
  isPlanActive: (amount: number) => boolean;
  hasCustomPlan: boolean;
}

export function SubscriptionPlansGrid({
  activeAmount,
  isLoading,
  onSubscribe,
  onCustomAmount,
  onCancel,
  isPlanActive,
  hasCustomPlan,
}: SubscriptionPlansGridProps) {
  const [customAmount, setCustomAmount] = useState('');

  const getCustomAmountValue = (): string => {
    return customAmount || '0';
  };

  const handleAmountChange = (value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    if (value === '') {
      // Backspace - remove last digit
      setCustomAmount(customAmount.slice(0, -1));
    } else {
      // Add digit to the end (max 3 digits = 999€)
      if (customAmount.length < 3) {
        setCustomAmount(customAmount + value);
      }
    }
  };

  const handleCustomSubmit = () => {
    const euros = Number(getCustomAmountValue());
    if (euros > 0) {
      onCustomAmount(euros);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscribe to Support Polity</CardTitle>
        <CardDescription>
          Help us keep the platform running and growing with a monthly contribution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Free Plan - €0/month */}
          <div
            className={`rounded-lg border p-4 transition-shadow ${
              activeAmount === 0 ? 'border-primary bg-primary/5 shadow-md' : 'hover:shadow-md'
            }`}
          >
            <div className="mb-2">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-semibold">Free</h3>
                {activeAmount === 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Current
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold">€0</p>
              <p className="text-xs text-muted-foreground">/month</p>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">Full access to all features</p>
            <Button
              type="button"
              variant={activeAmount === 0 ? 'default' : 'outline'}
              size="sm"
              className="w-full"
              onClick={() => activeAmount !== 0 && onCancel()}
              disabled={isLoading || activeAmount === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : activeAmount === 0 ? (
                'Active'
              ) : (
                'Switch to Free'
              )}
            </Button>
          </div>

          {/* Running Costs - €2/month */}
          <div
            className={`rounded-lg border p-4 transition-shadow ${
              isPlanActive(200) ? 'border-primary bg-primary/5 shadow-md' : 'hover:shadow-md'
            }`}
          >
            <div className="mb-2">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-semibold">Running Costs</h3>
                {isPlanActive(200) && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Current
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold">€2</p>
              <p className="text-xs text-muted-foreground">/month</p>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Cover server costs and infrastructure
            </p>
            <Button
              type="button"
              variant={isPlanActive(200) ? 'default' : 'outline'}
              size="sm"
              className="w-full"
              onClick={() => !isPlanActive(200) && onSubscribe(PRICE_IDS.running)}
              disabled={isLoading || !PRICE_IDS.running || isPlanActive(200)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isPlanActive(200) ? (
                'Active'
              ) : (
                'Subscribe'
              )}
            </Button>
          </div>

          {/* Development - €10/month */}
          <div
            className={`rounded-lg border p-4 transition-shadow ${
              isPlanActive(1000)
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-primary shadow-md hover:shadow-lg'
            }`}
          >
            <div className="mb-2">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-semibold">Development</h3>
                {isPlanActive(1000) ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Current
                  </span>
                ) : (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold">€10</p>
              <p className="text-xs text-muted-foreground">/month</p>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Fund new features and improvements
            </p>
            <Button
              type="button"
              size="sm"
              className="w-full"
              variant={isPlanActive(1000) ? 'default' : undefined}
              onClick={() => !isPlanActive(1000) && onSubscribe(PRICE_IDS.development)}
              disabled={isLoading || !PRICE_IDS.development || isPlanActive(1000)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isPlanActive(1000) ? (
                'Active'
              ) : (
                'Subscribe'
              )}
            </Button>
          </div>

          {/* Custom Amount */}
          <div
            className={`rounded-lg border p-4 transition-shadow ${
              hasCustomPlan ? 'border-primary bg-primary/5 shadow-md' : 'hover:shadow-md'
            }`}
          >
            <div className="mb-2">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-semibold">Your Choice</h3>
                {hasCustomPlan && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Current
                  </span>
                )}
              </div>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="mr-1 text-2xl font-bold">€</span>
                {hasCustomPlan ? (
                  <span className="text-2xl font-bold">{(activeAmount / 100).toFixed(0)}</span>
                ) : (
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    value={customAmount}
                    onChange={e => handleAmountChange(e.target.value.slice(-1))}
                    onKeyDown={e => {
                      if (e.key === 'Backspace') {
                        e.preventDefault();
                        handleAmountChange('');
                      }
                    }}
                    placeholder="0"
                    className="h-10 w-20"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground">/month</p>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Voluntary amount to support the platform
            </p>
            <Button
              type="button"
              variant={hasCustomPlan ? 'default' : 'outline'}
              size="sm"
              className="w-full"
              onClick={handleCustomSubmit}
              disabled={isLoading || getCustomAmountValue() === '0' || hasCustomPlan}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : hasCustomPlan ? (
                'Active'
              ) : (
                'Subscribe'
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">
            💡 All features remain free. Your contribution helps us keep the platform running and
            build new features for everyone.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
