'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';

interface SubscriptionStatusProps {
  userId: string;
}

interface SubscriptionData {
  hasSubscription: boolean;
  subscription: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    interval: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
  allSubscriptions: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    interval: string;
    createdAt: string;
    canceledAt: string | null;
  }[];
  payments: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    paidAt: string | null;
  }[];
}

export function SubscriptionStatus({ userId }: SubscriptionStatusProps) {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      try {
        setIsLoading(true);

        const response = await fetch('/api/stripe/subscription-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[SubscriptionStatus] Error response:', errorText);
          throw new Error('Failed to fetch subscription status');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('[SubscriptionStatus] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchSubscriptionStatus();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Loading subscription information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Failed to load subscription data</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>You don't have an active subscription yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Subscribe to support the platform and get access to exclusive features!
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeSubscription = data.subscription;
  const subscriptions = data.allSubscriptions || [];
  const payments = (data.payments || []).slice(0, 10); // Limit to last 10 payments

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      active: { label: 'Active', variant: 'default' },
      canceled: { label: 'Canceled', variant: 'destructive' },
      past_due: { label: 'Past Due', variant: 'destructive' },
      unpaid: { label: 'Unpaid', variant: 'destructive' },
      incomplete: { label: 'Incomplete', variant: 'outline' },
      trialing: { label: 'Trial', variant: 'secondary' },
    };

    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const portalData = await response.json();
      if (portalData.url) {
        window.location.href = portalData.url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </div>
            {activeSubscription && (
              <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Manage
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {formatCurrency(activeSubscription.amount, activeSubscription.currency)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{activeSubscription.interval}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Next billing:{' '}
                    {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(activeSubscription.status)}
              </div>
              {activeSubscription.cancelAtPeriodEnd && (
                <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/20">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Your subscription will cancel on{' '}
                    {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ) : subscriptions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You previously had a subscription that is now{' '}
                {getStatusBadge(subscriptions[0].status)}
              </p>
              <p className="text-xs text-muted-foreground">
                Last active: {new Date(subscriptions[0].createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No subscription found</p>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Your recent payments and invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {getPaymentStatusIcon(payment.status)}
                    <div>
                      <p className="text-sm font-medium">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.paidAt
                          ? formatDistanceToNow(new Date(payment.paidAt), { addSuffix: true })
                          : new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={payment.status === 'paid' ? 'default' : 'destructive'}>
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Subscriptions History */}
      {subscriptions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription History</CardTitle>
            <CardDescription>All your previous subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptions.slice(1).map((subscription: any) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {formatCurrency(subscription.amount, subscription.currency)}
                      <span className="text-muted-foreground">/{subscription.interval}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(subscription.createdAt).toLocaleDateString()} -{' '}
                      {subscription.canceledAt
                        ? new Date(subscription.canceledAt).toLocaleDateString()
                        : 'Present'}
                    </p>
                  </div>
                  {getStatusBadge(subscription.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
