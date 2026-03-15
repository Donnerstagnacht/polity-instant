import '@/styles/animations.css';
import { SocialBar } from '@/features/users/ui/SocialBar';
import { useNavigate } from '@tanstack/react-router';
import { Mail } from 'lucide-react';
import { Button } from '@/features/shared/ui/ui/button';
import { useUserWikiContentSearch } from './state/useUserWikiContentSearch';
import { InfoTabs } from '@/features/shared/ui/wiki/InfoTabs.tsx';
import { StatementCarousel } from '@/features/users/ui/StatementCarousel';
import { UserWikiContentTabs } from '@/features/users/ui/UserWikiContentTabs';
import { useUserData } from './hooks/useUserData';
import { useSubscribeUser } from '@/features/payments/hooks/useSubscribeUser';
import { useAuth } from '@/providers/auth-provider';
import { HashtagDisplay } from '@/features/shared/ui/ui/hashtag-display';
import { StatsBar } from '@/features/shared/ui/ui/StatsBar';
import { ActionBar } from '@/features/shared/ui/ui/ActionBar';
import { SubscribeButton } from 'src/features/shared/ui/action-buttons';
import { ShareButton } from '@/features/shared/ui/action-buttons/ShareButton.tsx';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useMemo } from 'react';

interface UserWikiProps {
  userId?: string;
  searchFilters?: {
    blogs?: string;
    groups?: string;
    amendments?: string;
  };
}

export function UserWiki(_props: UserWikiProps) {
  // Props available: _props.userId, _props.searchFilters
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Content search state and handler
  const { searchTerms, handleSearchChange } = useUserWikiContentSearch();

  // Get the current logged-in user if no userId is provided
  const { user: authUser } = useAuth();
  const userIdToFetch = _props.userId || authUser?.id;

  // Fetch user data from Zero
  const { user: dbUser, isLoading, error } = useUserData(userIdToFetch);

  // Subscribe/unsubscribe functionality
  const {
    isSubscribed: subscribed,
    subscriberCount,
    toggleSubscribe,
    isLoading: subscribeLoading,
  } = useSubscribeUser(userIdToFetch);

  const isOwnUser = authUser?.id === userIdToFetch;

  // Derived values from zero row
  const fullName = useMemo(
    () => [dbUser?.first_name, dbUser?.last_name].filter(Boolean).join(' '),
    [dbUser?.first_name, dbUser?.last_name],
  );

  const hashtags = useMemo(
    () =>
      (dbUser?.user_hashtags ?? [])
        .map((j) => j.hashtag)
        .filter((h): h is NonNullable<typeof h> => !!h?.id && !!h?.tag),
    [dbUser?.user_hashtags],
  );

  const collabCount = useMemo(
    () =>
      (dbUser?.amendment_collaborations ?? []).filter(
        (c) => c.status === 'admin' || c.status === 'collaborator',
      ).length,
    [dbUser?.amendment_collaborations],
  );

  return (
    <>
      {isLoading && (
        <div>
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading user...</div>
          </div>
        </div>
      )}

      {error && (
        <div>
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-red-500">Error loading user: {error}</div>
          </div>
        </div>
      )}

      {!isLoading && !error && !dbUser && (
        <div>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-semibold">User Not Found</h2>
              <p className="text-muted-foreground">This user hasn't been created yet.</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && dbUser && (
        <div>
          {/* Header with centered title and subtitle */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold">{fullName}</h1>
            {dbUser.bio && <p className="text-muted-foreground">{dbUser.bio}</p>}
          </div>

          {/* User Image */}
          {dbUser.avatar && (
            <div className="mb-8">
              <img
                src={dbUser.avatar}
                alt={fullName}
                className="mx-auto h-64 w-full max-w-4xl rounded-lg object-cover shadow-lg"
              />
            </div>
          )}

          {/* Stats Bar */}
          <StatsBar
            stats={[
              { value: subscriberCount, labelKey: 'components.labels.subscribers' },
              { value: dbUser.group_count ?? dbUser.group_memberships?.length ?? 0, labelKey: 'components.labels.groups' },
              {
                value: dbUser.amendment_count ?? collabCount,
                labelKey: 'components.labels.amendments',
              },
            ]}
          />

          {/* Action Bar */}
          {!isOwnUser && (
            <ActionBar>
              <SubscribeButton
                entityType="user"
                entityId={userIdToFetch || ''}
                isSubscribed={subscribed}
                onToggleSubscribe={toggleSubscribe}
                isLoading={subscribeLoading}
              />
              <Button
                variant="outline"
                onClick={() =>
                  navigate({ to:
                    `/messages?userId=${encodeURIComponent(dbUser.id || '')}&name=${encodeURIComponent(fullName || '')}` })
                }
              >
                <Mail className="h-4 w-4" />
                <span>{t('features.timeline.cards.message')}</span>
              </Button>
              <ShareButton
                url={`/user/${userIdToFetch}`}
                title={fullName || 'User'}
                description={dbUser.about || ''}
              />
            </ActionBar>
          )}

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div className="mb-6">
              <HashtagDisplay hashtags={hashtags} centered />
            </div>
          )}

          <SocialBar socialMedia={{ twitter: dbUser.x ?? undefined }} />

          <InfoTabs
            about={dbUser.about ?? undefined}
            contact={{
              email: dbUser.email || '',
              twitter: dbUser.x || '',
              website: dbUser.website || '',
              location: dbUser.location || '',
            }}
            className="mb-12"
          />

          <StatementCarousel
            statements={dbUser.statements ?? []}
            authorName={fullName || t('common.labels.unspecifiedUser')}
            authorTitle={dbUser.bio ?? undefined}
            authorAvatar={dbUser.avatar ?? undefined}
          />

          <UserWikiContentTabs
            user={dbUser}
            authorName={fullName}
            authorAvatar={dbUser.avatar ?? ''}
            searchTerms={searchTerms}
            handleSearchChange={handleSearchChange}
          />
        </div>
      )}
    </>
  );
}
