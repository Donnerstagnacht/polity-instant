'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageCircle, Sparkles } from 'lucide-react';
import { db } from '../../../db';

interface AriaKaiWelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AriaKaiWelcomeDialog({ open, onOpenChange }: AriaKaiWelcomeDialogProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { user } = db.useAuth();

  console.log('🎭 AriaKaiWelcomeDialog render:', { open, isNavigating });

  const handleClose = async () => {
    if (dontShowAgain && user?.id) {
      await db.transact(db.tx.$users[user.id].update({ assistantIntroduction: false }));
    }
    onOpenChange(false);
  };

  const handleShowLocation = async () => {
    console.log('🚀 Navigating to messages...');
    setIsNavigating(true);
    if (dontShowAgain && user?.id) {
      await db.transact(db.tx.$users[user.id].update({ assistantIntroduction: false }));
    }
    onOpenChange(false);
    router.push('/messages?openAriaKai=true');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                AK
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">Welcome to Polity!</DialogTitle>
              <DialogDescription className="mt-1 text-base">
                Meet Aria & Kai, your personal assistants
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-500" />
            <p className="text-sm text-muted-foreground">
              Hey! We're <span className="font-semibold text-foreground">Aria & Kai</span>, and
              we're here to help you navigate Polity and make the most of all its features.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
            <p className="text-sm text-muted-foreground">
              Whenever you need assistance, tips, or want to learn about groups, events, amendments,
              and more, just{' '}
              <span className="font-semibold text-foreground">
                find us in your message conversations
              </span>
              . We're always ready to help!
            </p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium">Quick Tip:</p>
            <p className="text-sm text-muted-foreground">
              We've already started a conversation with you. Click below to see where you can always
              find us!
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="dontShowAgain"
              checked={dontShowAgain}
              onCheckedChange={checked => setDontShowAgain(checked === true)}
            />
            <label
              htmlFor="dontShowAgain"
              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Don't show this message again
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            I'll find you later
          </Button>
          <Button onClick={handleShowLocation} disabled={isNavigating}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Show me my assistant location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
