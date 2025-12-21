'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Share2,
  MessageSquare,
  Instagram,
  Facebook,
  Twitter,
  Check,
  Copy,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ConversationSelectorDialog } from './ConversationSelectorDialog';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ShareButton({
  url,
  title,
  // description is only used for encoding, but not needed as a variable
  variant = 'outline',
  size = 'default',
  className = '',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? window.location.origin + url : url;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('The link has been copied to your clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy the link to your clipboard.');
    }
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing via URL
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    if (platform === 'instagram') {
      toast.info('Please share manually on Instagram.');
      return;
    }
    window.open(shareLinks[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
    setIsOpen(false);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[280px]">
          <div className="p-2">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Share via</div>

            <DropdownMenuItem
              onClick={() => {
                setConversationDialogOpen(true);
                setIsOpen(false);
              }}
              className="cursor-pointer"
            >
              <Send className="mr-2 h-4 w-4 text-primary" />
              <span>Polity</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="cursor-pointer">
              <MessageSquare className="mr-2 h-4 w-4 text-green-500" />
              <span>WhatsApp</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleShare('twitter')} className="cursor-pointer">
              <Twitter className="mr-2 h-4 w-4 text-gray-800 dark:text-gray-300" />
              <span>X (Twitter)</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleShare('facebook')} className="cursor-pointer">
              <Facebook className="mr-2 h-4 w-4 text-blue-600" />
              <span>Facebook</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleShare('instagram')} className="cursor-pointer">
              <Instagram className="mr-2 h-4 w-4 text-pink-500" />
              <span>Instagram</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <div className="mb-1 mt-2 text-xs font-medium text-muted-foreground">Copy link</div>
            <div className="flex items-center gap-2">
              <Input
                value={fullUrl}
                readOnly
                className="h-8 flex-1 text-xs"
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={handleCopyUrl}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConversationSelectorDialog
        open={conversationDialogOpen}
        onOpenChange={setConversationDialogOpen}
        shareUrl={url}
        shareTitle={title}
      />
    </>
  );
}
