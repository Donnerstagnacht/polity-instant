// FollowButton.tsx
import React from 'react';

interface FollowButtonProps {
  isFollowing: boolean;
  onClick: () => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ isFollowing, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: isFollowing ? '#eee' : '#007bff',
        color: isFollowing ? '#333' : '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};
