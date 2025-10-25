import { useState, useRef } from 'react';
import { StatsBar } from '@/features/user/ui/StatsBar';
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
import { useFollowUser } from './hooks/useFollowUser';
import { useAuthStore } from '@/features/auth/auth.ts';
import { SeedUserDataButton } from './ui/SeedUserDataButton';

// --- UserWiki utility functions moved to utils/userWiki.utils.ts ---
import {
  getStatusStyles,
  formatNumberWithUnit,
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

  // Follow/unfollow functionality
  const { isFollowing: following, followerCount, toggleFollow } = useFollowUser(userIdToFetch);

  // Function to handle follow/unfollow with animation
  const handleFollowClick = async () => {
    const wasFollowing = following;

    // Toggle the follow state
    await toggleFollow();

    // Show animation
    setAnimationText(wasFollowing ? '-1' : '+1');
    setShowAnimation(true);

    // Hide animation after it completes
    setTimeout(() => setShowAnimation(false), 1000);
  };

  // Create a version of the stats array with the updated follower count
  const displayStats =
    dbUser?.stats.map(stat => {
      if (stat.label === 'Followers') {
        // For followers, use the actual follower count from the database
        const formatted = formatNumberWithUnit(followerCount);
        return { ...stat, value: formatted.value, unit: formatted.unit };
      } else if (stat.value >= 1000) {
        // For other stats that are >= 1000, also apply the formatting
        const formatted = formatNumberWithUnit(stat.value);
        return { ...stat, value: formatted.value, unit: formatted.unit };
      }
      return stat;
    }) || [];

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
            following={following}
            onFollowClick={handleFollowClick}
          />

          <StatsBar
            stats={displayStats}
            showAnimation={showAnimation}
            animationText={animationText}
            animationRef={animationRef}
          />

          <SocialBar socialMedia={dbUser.socialMedia} />

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
