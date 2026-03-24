'use client';

import { useState } from 'react';
import { Button } from '@/features/shared/ui/ui/button.tsx';
import { useUserState } from '@/zero/users/useUserState.ts';
import { useUserActions } from '@/zero/users/useUserActions.ts';
import { useMessageActions } from '@/zero/messages/useMessageActions.ts';
import { ENTITY_DESCRIPTIONS, type EntityTopic } from '@/features/auth/constants.ts';
import { Users, Calendar, FileEdit, BookOpen, Vote, Sparkles } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation.ts';

interface AriaKaiMessageActionsProps {
  conversationId: string;
  currentUserId: string;
}

const TOPIC_ICONS: Record<string, React.ReactNode> = {
  groups: <Users className="h-4 w-4" />,
  events: <Calendar className="h-4 w-4" />,
  amendments: <FileEdit className="h-4 w-4" />,
  blogs: <BookOpen className="h-4 w-4" />,
  elections: <Vote className="h-4 w-4" />,
};

const TOPIC_STEP_MAP: Record<string, number> = {
  groups: 2,
  events: 3,
  amendments: 4,
  blogs: 5,
  elections: 6,
};

const TOPIC_LABEL_KEYS: Record<string, string> = {
  groups: 'components.ariaKaiActions.groups',
  events: 'components.ariaKaiActions.events',
  amendments: 'components.ariaKaiActions.amendments',
  blogs: 'components.ariaKaiActions.blogs',
  elections: 'components.ariaKaiActions.elections',
};

export function AriaKaiMessageActions({
  conversationId,
  currentUserId,
}: AriaKaiMessageActionsProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useMessageActions();
  const { updateProfile } = useUserActions();

  // Query user's tutorial step
  const { user: currentUser } = useUserState({ userId: currentUserId });
  const tutorialStep = currentUser?.tutorial_step ?? 0;

  const handleShowMeClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const messageId = crypto.randomUUID();
      const description = ENTITY_DESCRIPTIONS.overview;

      await sendMessage({
        id: messageId,
        conversation_id: conversationId,
        content: description.message,
        deleted_at: 0,
      });
      await updateProfile({
        id: currentUserId,
        tutorial_step: 1, // 'overview'
      });
    } catch (error) {
      console.error('Failed to send Aria & Kai message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicClick = async (topic: EntityTopic) => {
    if (isLoading || topic === 'overview') return;

    setIsLoading(true);
    try {
      const messageId = crypto.randomUUID();
      const description = ENTITY_DESCRIPTIONS[topic];

      await sendMessage({
        id: messageId,
        conversation_id: conversationId,
        content: `**${description.title}**\n\n${description.message}`,
        deleted_at: 0,
      });
      // Map topic to the corresponding tutorial step
      await updateProfile({
        id: currentUserId,
        tutorial_step: TOPIC_STEP_MAP[topic] ?? 2,
      });
    } catch (error) {
      console.error('Failed to send Aria & Kai message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const topics: EntityTopic[] = ['groups', 'events', 'amendments', 'blogs', 'elections'];

  return (
    <div className="mt-3 space-y-2">
      {/* Show "Show me" button if tutorial hasn't started */}
      {tutorialStep === 0 && (
        <Button
          onClick={handleShowMeClick}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="min-w-[140px] flex-1 sm:flex-initial"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {t('components.ariaKaiActions.showMe')}
        </Button>
      )}

      {/* Show topic buttons if overview has been shown */}
      {tutorialStep > 0 && (
        <div className="flex flex-wrap gap-2">
          {topics.map(topic => (
            <Button
              key={topic}
              onClick={() => handleTopicClick(topic)}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="min-w-[140px] flex-1 sm:flex-initial"
            >
              {TOPIC_ICONS[topic]}
              <span className="ml-2">{t(TOPIC_LABEL_KEYS[topic])}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
