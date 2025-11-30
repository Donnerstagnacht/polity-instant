import '@/styles/animations.css';
import { SocialBar } from '@/features/user/ui/SocialBar';
import { useUserWikiContentSearch } from './state/useUserWikiContentSearch';
import { BADGE_COLORS } from './state/badgeColors';
import { GRADIENTS } from './state/gradientColors';
import { InfoTabs } from '@/components/shared/InfoTabs';
import { StatementCarousel } from '@/features/user/ui/StatementCarousel';
import { UserWikiContentTabs } from '@/features/user/ui/UserWikiContentTabs';
import { useUserData } from './hooks/useUserData';
import { useSubscribeUser } from './hooks/useSubscribeUser';
import { useAuthStore } from '@/features/auth/auth.ts';
import { SeedUserDataButton } from './ui/SeedUserDataButton';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { StatsBar } from '@/components/ui/StatsBar';
import { ActionBar } from '@/components/ui/ActionBar';
import { SubscribeButton } from '@/components/shared/action-buttons';
import { ShareButton } from '@/components/shared/ShareButton';

// --- UserWiki utility functions moved to utils/userWiki.utils.ts ---
import { getTagColor, getRoleBadgeColor, getBlogGradient } from './utils/userWiki.utils';

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

  // Content search state and handler
  const { searchTerms, handleSearchChange } = useUserWikiContentSearch();

  // Get the current logged-in user if no userId is provided
  const { user: authUser } = useAuthStore();
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

  return (
    <>
      {isLoading && (
        <div className="container mx-auto max-w-6xl p-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading user...</div>
          </div>
        </div>
      )}

      {error && (
        <div className="container mx-auto max-w-6xl p-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-red-500">Error loading user: {error}</div>
          </div>
        </div>
      )}

      {!isLoading && !error && !dbUser && (
        <div className="container mx-auto max-w-6xl p-4">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-semibold">User Not Found</h2>
              <p className="text-muted-foreground">This user hasn't been created yet.</p>
            </div>
            <SeedUserDataButton />
          </div>
        </div>
      )}

      {!isLoading && !error && dbUser && (
        <div className="container mx-auto max-w-6xl p-4">
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
              { value: dbUser.groups?.length || 0, labelKey: 'components.labels.groups' },
              {
                value: dbUser.amendmentCollaborationsCount || 0,
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
            getTagColor={(tag: string) => getTagColor(tag, BADGE_COLORS)}
          />

          <UserWikiContentTabs
            user={dbUser}
            searchTerms={searchTerms}
            handleSearchChange={handleSearchChange}
            getBlogGradient={(blogId: number) => getBlogGradient(blogId, GRADIENTS)}
            getRoleBadgeColor={getRoleBadgeColor}
          />
        </div>
      )}
    </>
  );
}
