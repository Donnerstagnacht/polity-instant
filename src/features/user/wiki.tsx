import { useState, useRef } from 'react';
import { StatsBar } from './ui-user/StatsBar';
import '@/styles/animations.css';
import { SocialBar } from './ui-user/SocialBar';
import { useUserWikiContentSearch } from './state/useUserWikiContentSearch';
import type { User } from './types/user.types';
import { USER } from './state/user.data';
import { BADGE_COLORS } from './state/badgeColors';
import { GRADIENTS } from './state/gradientColors';
import { UserInfoTabs } from './ui-user/UserInfoTabs';
import { StatementCarousel } from './ui-user/StatementCarousel';
import { UserWikiContentTabs } from './ui-user/UserWikiContentTabs';
import { UserWikiHeader } from './ui-user/UserWikiHeader';

// --- UserWiki utility functions moved to utils/userWiki.utils.ts ---
import {
  getStatusStyles,
  formatNumberWithUnit,
  getTagColor,
  getRoleBadgeColor,
  getBlogGradient,
} from './utils/userWiki.utils';

// TODO: Re-enable when props are implemented
// interface UserWikiProps {
//   userId?: string;
//   searchFilters?: {
//     blogs?: string;
//     groups?: string;
//     amendments?: string;
//   };
// }

export function UserWiki(/* _props?: UserWikiProps */) {
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(2.5); // Track the actual follower count
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationText, setAnimationText] = useState('');
  const animationRef = useRef<HTMLDivElement>(null);

  // Content search state and handler
  const { searchTerms, handleSearchChange } = useUserWikiContentSearch();

  const user: User = USER;

  // Function to handle follow/unfollow with animation
  const handleFollowClick = () => {
    // Toggle the following state
    setFollowing(prev => !prev);

    // Calculate the actual count (converting k to actual numbers)
    const actualFollowers = followerCount * 1000;

    // Update the follower count and show animation
    if (!following) {
      // When following (add a follower)
      setFollowerCount((actualFollowers + 1) / 1000);
      setAnimationText('+1');
      setShowAnimation(true);
    } else {
      // When unfollowing (remove a follower)
      setFollowerCount((actualFollowers - 1) / 1000);
      setAnimationText('-1');
      setShowAnimation(true);
    }

    // Hide animation after it completes
    setTimeout(() => setShowAnimation(false), 1000);
  };

  // Create a version of the stats array with the updated follower count
  const displayStats = user.stats.map(stat => {
    if (stat.label === 'Followers') {
      // For followers, use the follower count state
      const formatted = formatNumberWithUnit(followerCount * 1000);
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
    </>
  );
}
