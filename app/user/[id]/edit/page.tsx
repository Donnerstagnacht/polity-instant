'use client';

import { use, useState, useEffect } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/auth.ts';
import { useUserData } from '@/features/user/hooks/useUserData';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';
import { useInstantUpload } from '@/hooks/use-instant-upload';
import { db, tx, id } from '../../../../db';
import { HashtagInput } from '@/components/ui/hashtag-input';
import { SubscriptionStatus } from '@/features/user/components/SubscriptionStatus';

const PRICE_IDS = {
  running: process.env.NEXT_PUBLIC_STRIPE_PRICE_RUNNING || '',
  development: process.env.NEXT_PUBLIC_STRIPE_PRICE_DEVELOPMENT || '',
} as const;

export default function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser } = useAuthStore();
  const { user: dbUser, userId: userId, isLoading, error } = useUserData(resolvedParams.id);

  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    about: '',
    email: '',
    twitter: '',
    website: '',
    location: '',
    avatar: '',
    hashtags: [] as string[],
  });

  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const { uploadFile, isUploading } = useInstantUpload();

  // Fetch active subscription from Stripe API
  useEffect(() => {
    async function fetchSubscription() {
      if (!authUser?.id) return;

      try {
        const response = await fetch('/api/stripe/subscription-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: authUser.id }),
        });

        if (response.ok) {
          const data = await response.json();
          setActiveSubscription(data.subscription);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      }
    }

    fetchSubscription();
  }, [authUser?.id]);

  // Show success/cancel message from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast.success('Subscription successful! Thank you for your support! 🎉');
      // Clear the query param immediately to prevent duplicate toasts
      router.replace(window.location.pathname, { scroll: false });
    } else if (canceled === 'true') {
      toast.info('Subscription canceled. You can subscribe anytime.');
      // Clear the query param immediately to prevent duplicate toasts
      router.replace(window.location.pathname, { scroll: false });
    }
  }, [searchParams, router]);

  // Initialize form data when user data loads
  useEffect(() => {
    if (dbUser) {
      setFormData({
        name: dbUser.name || '',
        subtitle: dbUser.subtitle || '',
        about: dbUser.about || '',
        email: dbUser.contact?.email || '',
        twitter: dbUser.contact?.twitter || '',
        website: dbUser.contact?.website || '',
        location: dbUser.contact?.location || '',
        avatar: dbUser.avatar || '',
        hashtags: [], // Will be populated separately from linked hashtags
      });
    }
  }, [dbUser]);

  const isAuthorized = authUser?.id === resolvedParams.id;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser?.id || !userId) return;

    try {
      // Upload to InstantDB Storage using user ID as path
      const avatarPath = `${authUser.id}/avatar`;
      const result = await uploadFile(avatarPath, file, {
        contentType: file.type,
      });

      // Link the uploaded file to the user
      if (result?.data?.id) {
        await db.transact([tx.$users[authUser.id].link({ avatarFile: result.data.id })]);

        toast.success('Avatar uploaded successfully');

        // The avatar URL will be automatically updated through the real-time query
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
      console.error('Avatar upload error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!dbUser) {
        toast.error('No user data to update');
        return;
      }

      if (!authUser?.id) {
        toast.error('Could not find user to update');
        return;
      }

      // Update the user in Instant DB
      const transactions = [
        tx.$users[authUser.id].update({
          name: formData.name,
          subtitle: formData.subtitle,
          about: formData.about,
          avatar: formData.avatar,
          contactEmail: formData.email,
          contactTwitter: formData.twitter,
          contactWebsite: formData.website,
          contactLocation: formData.location,
          updatedAt: new Date(),
        }),
      ];

      // Add hashtags
      formData.hashtags.forEach(tag => {
        const hashtagId = id();
        transactions.push(
          tx.hashtags[hashtagId].update({
            tag,
            createdAt: new Date(),
          }),
          tx.hashtags[hashtagId].link({ user: authUser?.id ?? '' })
        );
      });

      await db.transact(transactions);

      toast.success('User updated successfully');

      // Wait a moment for the DB to update, then navigate
      setTimeout(() => {
        router.push(`/user/${resolvedParams.id}`);
      }, 500);
    } catch (error) {
      toast.error('Failed to update user');
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    setIsCheckoutLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: authUser?.id }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        const errorMessage = data.error || 'Failed to create checkout session';
        toast.error(errorMessage);
        console.error('Checkout error:', data);
      }
    } catch (error) {
      toast.error('Checkout error');
      console.error('Checkout error:', error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleCustomAmount = async () => {
    const euros = Number(getCustomAmountValue());
    if (euros <= 0) return;

    setIsCheckoutLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: euros * 100, userId: authUser?.id }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        const errorMessage = data.error || 'Failed to create checkout session';
        toast.error(errorMessage);
        console.error('Checkout error:', data);
      }
    } catch (error) {
      toast.error('Checkout error');
      console.error('Checkout error:', error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!activeSubscription) return;

    setIsCheckoutLoading(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: activeSubscription.id }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Subscription canceled successfully');
        setActiveSubscription(null);
      } else {
        const errorMessage = data.error || 'Failed to cancel subscription';
        toast.error(errorMessage);
        console.error('Cancel error:', data);
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
      console.error('Cancel error:', error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

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

  // Helper to check if a plan is currently active
  const isPlanActive = (amount: number): boolean => {
    if (!activeSubscription) return false;
    return activeSubscription.amount === amount;
  };

  // Helper to check if user has a custom plan (not €2 or €10)
  const hasCustomPlan = (): boolean => {
    if (!activeSubscription) return false;
    return activeSubscription.amount !== 200 && activeSubscription.amount !== 1000;
  };

  // Helper to get the active plan amount (0 for free, otherwise the subscription amount)
  const getActivePlanAmount = (): number => {
    if (!activeSubscription) return 0; // Free plan
    return activeSubscription.amount;
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  // Check if user data exists after loading
  if (!dbUser) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg font-semibold">User not found</p>
              <p className="text-muted-foreground">No user data exists for this user yet</p>
              {error && <p className="mt-2 text-sm text-red-500">Error: {error}</p>}
              <div className="mt-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  You need to create a user first by clicking the "Seed User Data" button on the
                  user page
                </p>
                <Button onClick={() => router.push(`/user/${resolvedParams.id}`)} variant="default">
                  Go to User Page
                </Button>
              </div>
            </div>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  // Check authorization only after we have the data
  if (!isAuthorized) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg font-semibold text-red-500">Unauthorized</p>
              <p className="text-muted-foreground">You are not authorized to edit this user</p>
              <Button
                variant="outline"
                onClick={() => router.push(`/user/${resolvedParams.id}`)}
                className="mt-4"
              >
                View User
              </Button>
            </div>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper>
        <div className="container mx-auto max-w-4xl p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Edit User</h1>
            <p className="text-muted-foreground">Update your user information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle>User Picture</CardTitle>
                <CardDescription>Update your user picture</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.avatar} alt={formData.name} />
                    <AvatarFallback>{formData.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="avatar-upload"
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                  >
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <Camera className="mr-2 h-4 w-4" />
                        Change Avatar
                      </span>
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your public user information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g., Constitutional Law Expert"
                  />
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>Tell others about yourself</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="about">Bio</Label>
                  <Textarea
                    id="about"
                    value={formData.about}
                    onChange={e => setFormData({ ...formData, about: e.target.value })}
                    placeholder="Write a brief description about yourself..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How people can reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="@yourusername"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="text"
                    value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a valid URL (e.g., https://example.com)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hashtags */}
            <Card>
              <CardHeader>
                <CardTitle>Hashtags</CardTitle>
                <CardDescription>Add hashtags to help others find you</CardDescription>
              </CardHeader>
              <CardContent>
                <HashtagInput
                  value={formData.hashtags}
                  onChange={hashtags => setFormData({ ...formData, hashtags })}
                  placeholder="Add hashtags (e.g., developer, activist)"
                />
              </CardContent>
            </Card>

            {/* Subscription Management */}
            <SubscriptionStatus userId={resolvedParams.id} />

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
                      getActivePlanAmount() === 0
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="mb-2">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="font-semibold">Free</h3>
                        {getActivePlanAmount() === 0 && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold">€0</p>
                      <p className="text-xs text-muted-foreground">/month</p>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Full access to all features
                    </p>
                    <Button
                      type="button"
                      variant={getActivePlanAmount() === 0 ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                      onClick={() => getActivePlanAmount() !== 0 && handleCancelSubscription()}
                      disabled={isCheckoutLoading || getActivePlanAmount() === 0}
                    >
                      {isCheckoutLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : getActivePlanAmount() === 0 ? (
                        'Active'
                      ) : (
                        'Switch to Free'
                      )}
                    </Button>
                  </div>

                  {/* Running Costs - €2/month */}
                  <div
                    className={`rounded-lg border p-4 transition-shadow ${
                      isPlanActive(200)
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'hover:shadow-md'
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
                      onClick={() => !isPlanActive(200) && handleSubscribe(PRICE_IDS.running)}
                      disabled={isCheckoutLoading || !PRICE_IDS.running || isPlanActive(200)}
                    >
                      {isCheckoutLoading ? (
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
                      onClick={() => !isPlanActive(1000) && handleSubscribe(PRICE_IDS.development)}
                      disabled={isCheckoutLoading || !PRICE_IDS.development || isPlanActive(1000)}
                    >
                      {isCheckoutLoading ? (
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
                      hasCustomPlan() ? 'border-primary bg-primary/5 shadow-md' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="mb-2">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="font-semibold">Your Choice</h3>
                        {hasCustomPlan() && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="mb-1 flex items-baseline gap-1">
                        <span className="mr-1 text-2xl font-bold">€</span>
                        {hasCustomPlan() ? (
                          <span className="text-2xl font-bold">
                            {(activeSubscription.amount / 100).toFixed(0)}
                          </span>
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
                      variant={hasCustomPlan() ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                      onClick={handleCustomAmount}
                      disabled={
                        isCheckoutLoading || getCustomAmountValue() === '0' || hasCustomPlan()
                      }
                    >
                      {isCheckoutLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : hasCustomPlan() ? (
                        'Active'
                      ) : (
                        'Subscribe'
                      )}
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">
                    💡 All features remain free. Your contribution helps us keep the platform
                    running and build new features for everyone.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/user/${resolvedParams.id}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
