import React from 'react';
import { WikiAvatar } from './WikiAvatar';
import { WikiSubscribeButton } from './WikiSubscribeButton';

interface UserWikiHeaderProps {
  name: string;
  avatar: string;
  subtitle: string;
  subscribed: boolean;
  onSubscribeClick: () => void;
  showSubscribeButton?: boolean;
}

export const UserWikiHeader: React.FC<UserWikiHeaderProps> = ({
  name,
  avatar,
  subtitle,
  subscribed,
  onSubscribeClick,
  showSubscribeButton = true,
}) => (
  <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:items-start">
    <WikiAvatar name={name} avatar={avatar} className="h-24 w-24 md:h-32 md:w-32" />
    <div className="flex-1 text-center md:text-left">
      <h1 className="text-2xl font-bold md:text-4xl">{name}</h1>
      <p className="mt-1 text-muted-foreground">{subtitle}</p>
    </div>
    {showSubscribeButton && (
      <WikiSubscribeButton
        subscribed={subscribed}
        onClick={onSubscribeClick}
        className="mt-2 md:mt-0"
      />
    )}
  </div>
);
