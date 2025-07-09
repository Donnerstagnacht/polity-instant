import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MessageSquare, Instagram, Facebook, Ghost, Twitter } from 'lucide-react';
import { SocialItem } from './SocialItem';

export interface SocialMediaLinks {
  whatsapp?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  snapchat?: string;
}

interface SocialBarProps {
  socialMedia: SocialMediaLinks;
}

export const SocialBar: React.FC<SocialBarProps> = ({ socialMedia }) => (
  <div className="mb-8 flex justify-center space-x-6 py-2">
    <TooltipProvider>
      {socialMedia.whatsapp && (
        <SocialItem
          href={socialMedia.whatsapp}
          label="WhatsApp"
          icon={<MessageSquare size={24} />}
          className="text-green-500 transition-transform duration-200 hover:scale-110 hover:text-green-600"
        />
      )}
      {socialMedia.instagram && (
        <SocialItem
          href={socialMedia.instagram}
          label="Instagram"
          icon={<Instagram size={24} />}
          className="text-pink-500 transition-transform duration-200 hover:scale-110 hover:text-pink-600"
        />
      )}
      {socialMedia.twitter && (
        <SocialItem
          href={socialMedia.twitter}
          label="X (Twitter)"
          icon={<Twitter size={24} />}
          className="text-gray-800 transition-transform duration-200 hover:scale-110 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-400"
        />
      )}
      {socialMedia.facebook && (
        <SocialItem
          href={socialMedia.facebook}
          label="Facebook"
          icon={<Facebook size={24} />}
          className="text-blue-600 transition-transform duration-200 hover:scale-110 hover:text-blue-700"
        />
      )}
      {socialMedia.snapchat && (
        <SocialItem
          href={socialMedia.snapchat}
          label="Snapchat"
          icon={<Ghost size={24} />}
          className="text-yellow-400 transition-transform duration-200 hover:scale-110 hover:text-yellow-500"
        />
      )}
    </TooltipProvider>
  </div>
);
