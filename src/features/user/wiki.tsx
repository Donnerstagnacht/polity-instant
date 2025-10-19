import { useState, useRef } from 'react';
import { StatsBar } from '@/features/user/ui/StatsBar';
import '@/styles/animations.css';
import { SocialBar } from '@/features/user/ui/SocialBar';
import { useUserWikiContentSearch } from './state/useUserWikiContentSearch';
import type { User } from './types/user.types';
import { USER } from './state/user.data';
import { BADGE_COLORS } from './state/badgeColors';
import { GRADIENTS } from './state/gradientColors';
import { UserInfoTabs } from '@/features/user/ui/UserInfoTabs';
import { StatementCarousel } from '@/features/user/ui/StatementCarousel';
import { UserWikiContentTabs } from '@/features/user/ui/UserWikiContentTabs';
import { UserWikiHeader } from '@/features/user/ui/UserWikiHeader';
import { useUserData } from './hooks/useUserData';
import { useFollowUser } from './hooks/useFollowUser';
import { useAuthStore } from '@/features/auth/auth.ts';

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

  // Fallback to mock data if no database user is found (for development)
  const user: User = dbUser || USER;

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
  const displayStats = user.stats.map(stat => {
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
  });

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

      {!isLoading && !error && (
        <div className="container mx-auto max-w-6xl p-4">
          <UserWikiHeader
            name={user.name}
            avatar={user.avatar}
            subtitle={user.subtitle}
            following={following}
            onFollowClick={handleFollowClick}
          />

          <StatsBar
            stats={displayStats}
            showAnimation={showAnimation}
            animationText={animationText}
            animationRef={animationRef}
          />

          <SocialBar socialMedia={user.socialMedia} />

          <UserInfoTabs about={user.about} contact={user.contact} />

          <StatementCarousel
            statements={user.statements}
            getTagColor={(tag: string) => getTagColor(tag, BADGE_COLORS)}
          />

          <UserWikiContentTabs
            user={user}
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
