'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { db, tx, id } from '../../../db';
import { ARIA_KAI_USER_ID, ENTITY_DESCRIPTIONS, EntityTopic } from 'e2e/aria-kai';
import { Users, Calendar, FileEdit, BookOpen, Vote, Sparkles } from 'lucide-react';

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

const TOPIC_LABELS: Record<string, string> = {
  groups: 'Groups',
  events: 'Events',
  amendments: 'Amendments',
  blogs: 'Blogs',
  elections: 'Elections & Positions',
};

export function AriaKaiMessageActions({
  conversationId,
  currentUserId,
}: AriaKaiMessageActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Query user's tutorial step
  const { data: userData } = db.useQuery({
    $users: {
      $: {
        where: {
          id: currentUserId,
        },
      },
    },
  });

  const currentUser = userData?.$users?.[0];
  const tutorialStep = currentUser?.tutorialStep || 'welcome';

  const handleShowMeClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const messageId = id();
      const description = ENTITY_DESCRIPTIONS.overview;

      await db.transact([
        tx.messages[messageId].update({
          content: description.message,
          isRead: false,
          createdAt: new Date().toISOString(),
        }),
        tx.messages[messageId].link({
          conversation: conversationId,
          sender: ARIA_KAI_USER_ID,
        }),
        tx.conversations[conversationId].update({
          lastMessageAt: new Date().toISOString(),
        }),
        tx.$users[currentUserId].update({
          tutorialStep: 'overview',
        }),
      ]);
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
      const messageId = id();
      const description = ENTITY_DESCRIPTIONS[topic];

      await db.transact([
        tx.messages[messageId].update({
          content: `**${description.title}**\n\n${description.message}`,
          isRead: false,
          createdAt: new Date().toISOString(),
        }),
        tx.messages[messageId].link({
          conversation: conversationId,
          sender: ARIA_KAI_USER_ID,
        }),
        tx.conversations[conversationId].update({
          lastMessageAt: new Date().toISOString(),
        }),
        tx.$users[currentUserId].update({
          tutorialStep: topic,
        }),
      ]);
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
      {tutorialStep === 'welcome' && (
        <Button
          onClick={handleShowMeClick}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="min-w-[140px] flex-1 sm:flex-initial"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Show me
        </Button>
      )}

      {/* Show topic buttons if overview has been shown */}
      {tutorialStep !== 'welcome' && tutorialStep !== 'completed' && (
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
              <span className="ml-2">{TOPIC_LABELS[topic]}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
