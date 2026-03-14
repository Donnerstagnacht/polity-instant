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

  // Fetch user data from Instant DB
  const { user: dbUser, isLoading, error } = useUserData(userIdToFetch);

  // Subscribe/unsubscribe functionality
  const {
    isSubscribed: subscribed,
    subscriberCount,
    toggleSubscribe,
    isLoading: subscribeLoading,
  } = useSubscribeUser(userIdToFetch);

  const isOwnUser = authUser?.id === userIdToFetch;
  const groupsStat = dbUser?.stats?.find((stat) => stat.label === 'Groups')?.value ?? dbUser?.groups?.length ?? 0;
  const amendmentsStat = dbUser?.stats?.find((stat) => stat.label === 'Amendments')?.value ?? dbUser?.amendmentCollaborationsCount ?? 0;

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
            <h1 className="text-4xl font-bold">{dbUser.name}</h1>
            {dbUser.subtitle && <p className="text-muted-foreground">{dbUser.subtitle}</p>}
          </div>

          {/* User Image */}
          {dbUser.avatar && (
            <div className="mb-8">
              <img
                src={dbUser.avatar}
                alt={dbUser.name}
                className="mx-auto h-64 w-full max-w-4xl rounded-lg object-cover shadow-lg"
              />
            </div>
          )}

          {/* Stats Bar */}
          <StatsBar
            stats={[
              { value: subscriberCount, labelKey: 'components.labels.subscribers' },
              { value: groupsStat, labelKey: 'components.labels.groups' },
              {
                value: amendmentsStat,
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
                    `/messages?userId=${encodeURIComponent(dbUser.id || '')}&name=${encodeURIComponent(dbUser.name || '')}` })
                }
              >
                <Mail className="h-4 w-4" />
                <span>{t('features.timeline.cards.message')}</span>
              </Button>
              <ShareButton
                url={`/user/${userIdToFetch}`}
                title={dbUser.name || 'User'}
                description={dbUser.about || ''}
              />
            </ActionBar>
          )}

          {/* Hashtags */}
          {dbUser.hashtags && dbUser.hashtags.length > 0 && (
            <div className="mb-6">
              <HashtagDisplay hashtags={dbUser.hashtags} centered />
            </div>
          )}

          <SocialBar socialMedia={dbUser.socialMedia} />

          <InfoTabs about={dbUser.about} contact={dbUser.contact} className="mb-12" />

          <StatementCarousel
            statements={dbUser.statements}
            authorName={dbUser.name || t('common.unknownUser')}
            authorTitle={dbUser.subtitle}
            authorAvatar={dbUser.avatar}
          />

          <UserWikiContentTabs
            user={dbUser}
            searchTerms={searchTerms}
            handleSearchChange={handleSearchChange}
          />
        </div>
      )}
    </>
  );
}
