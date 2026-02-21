import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface SocialItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  className?: string;
}

export const SocialItem: React.FC<SocialItemProps> = ({ href, label, icon, className }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {icon}
        <span className="sr-only">{label}</span>
      </a>
    </TooltipTrigger>
    <TooltipContent>
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
);
