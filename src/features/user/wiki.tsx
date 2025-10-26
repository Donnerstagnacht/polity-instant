import { useState, useRef } from 'react';
import '@/styles/animations.css';
import { SocialBar } from '@/features/user/ui/SocialBar';
import { useUserWikiContentSearch } from './state/useUserWikiContentSearch';
import { BADGE_COLORS } from './state/badgeColors';
import { GRADIENTS } from './state/gradientColors';
import { UserInfoTabs } from '@/features/user/ui/UserInfoTabs';
import { StatementCarousel } from '@/features/user/ui/StatementCarousel';
import { UserWikiContentTabs } from '@/features/user/ui/UserWikiContentTabs';
import { UserWikiHeader } from '@/features/user/ui/UserWikiHeader';
import { useUserData } from './hooks/useUserData';
import { useSubscribeUser } from './hooks/useSubscribeUser';
import { useAuthStore } from '@/features/auth/auth.ts';
import { SeedUserDataButton } from './ui/SeedUserDataButton';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { SubscriberStatsBar } from '@/components/ui/SubscriberStatsBar';

// --- UserWiki utility functions moved to utils/userWiki.utils.ts ---
import {
  getStatusStyles,
  getTagColor,
  getRoleBadgeColor,
  getBlogGradient,
} from './utils/userWiki.utils';

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
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationText, setAnimationText] = useState('');
  const animationRef = useRef<HTMLDivElement>(null);

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
  } = useSubscribeUser(userIdToFetch);

  // Check if this is the user's own profile
  const isOwnProfile = authUser?.id === userIdToFetch;

  // Function to handle subscribe/unsubscribe with animation
  const handleSubscribeClick = async () => {
    const wasSubscribed = subscribed;

    // Toggle the subscription state
    await toggleSubscribe();

    // Show animation
    setAnimationText(wasSubscribed ? '-1' : '+1');
    setShowAnimation(true);

    // Hide animation after it completes
    setTimeout(() => setShowAnimation(false), 1000);
  };

  return (
    <>
      {isLoading && (
        <div className="container mx-auto max-w-6xl p-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading user profile...</div>
          </div>
        </div>
      )}

      {error && (
        <div className="container mx-auto max-w-6xl p-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-red-500">Error loading profile: {error}</div>
          </div>
        </div>
      )}

      {!isLoading && !error && !dbUser && (
        <div className="container mx-auto max-w-6xl p-4">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-semibold">Profile Not Found</h2>
              <p className="text-muted-foreground">This user profile hasn't been created yet.</p>
            </div>
            <SeedUserDataButton />
          </div>
        </div>
      )}

      {!isLoading && !error && dbUser && (
        <div className="container mx-auto max-w-6xl p-4">
          <UserWikiHeader
            name={dbUser.name}
            avatar={dbUser.avatar}
            subtitle={dbUser.subtitle}
            subscribed={subscribed}
            onSubscribeClick={handleSubscribeClick}
            showSubscribeButton={!isOwnProfile}
          />

          <SubscriberStatsBar
            subscriberCount={subscriberCount}
            showAnimation={showAnimation}
            animationText={animationText}
            animationRef={animationRef}
          />

          <SocialBar socialMedia={dbUser.socialMedia} />

          {/* Hashtags */}
          {dbUser.hashtags && dbUser.hashtags.length > 0 && (
            <div className="mb-6">
              <HashtagDisplay hashtags={dbUser.hashtags} title="User Tags" />
            </div>
          )}

          <UserInfoTabs about={dbUser.about} contact={dbUser.contact} />

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
            getStatusStyles={getStatusStyles}
          />
        </div>
      )}
    </>
  );
}
