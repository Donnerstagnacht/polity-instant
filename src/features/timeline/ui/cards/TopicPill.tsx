'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/utils';

export interface TopicPillProps {
  topic: string;
  variant?:
    | 'default'
    | 'climate'
    | 'urban'
    | 'transport'
    | 'budget'
    | 'education'
    | 'health'
    | 'housing';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

/**
 * Topic color configuration
 * Soft, pastel colors that complement the gradient cards
 */
const TOPIC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  climate: {
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
  },
  urban: {
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  transport: {
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
  },
  budget: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/40',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  education: {
    bg: 'bg-purple-100 dark:bg-purple-900/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
  },
  health: {
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
  housing: {
    bg: 'bg-teal-100 dark:bg-teal-900/40',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800',
  },
  default: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700',
  },
};

/**
 * Map common topic names to color variants
 */
function getTopicVariant(topic: string): keyof typeof TOPIC_COLORS {
  const normalizedTopic = topic.toLowerCase();

  if (
    normalizedTopic.includes('climate') ||
    normalizedTopic.includes('environment') ||
    normalizedTopic.includes('green')
  ) {
    return 'climate';
  }
  if (
    normalizedTopic.includes('urban') ||
    normalizedTopic.includes('city') ||
    normalizedTopic.includes('planning')
  ) {
    return 'urban';
  }
  if (
    normalizedTopic.includes('transport') ||
    normalizedTopic.includes('traffic') ||
    normalizedTopic.includes('mobility')
  ) {
    return 'transport';
  }
  if (
    normalizedTopic.includes('budget') ||
    normalizedTopic.includes('finance') ||
    normalizedTopic.includes('money')
  ) {
    return 'budget';
  }
  if (
    normalizedTopic.includes('education') ||
    normalizedTopic.includes('school') ||
    normalizedTopic.includes('learning')
  ) {
    return 'education';
  }
  if (
    normalizedTopic.includes('health') ||
    normalizedTopic.includes('medical') ||
    normalizedTopic.includes('care')
  ) {
    return 'health';
  }
  if (
    normalizedTopic.includes('housing') ||
    normalizedTopic.includes('home') ||
    normalizedTopic.includes('rent')
  ) {
    return 'housing';
  }

  return 'default';
}

/**
 * TopicPill - A tag/pill component for displaying topics on timeline cards
 * Uses soft, pastel colors that complement the gradient card design
 */
export function TopicPill({ topic, variant, size = 'sm', className, onClick }: TopicPillProps) {
  const colorVariant = variant || getTopicVariant(topic);
  const colors = TOPIC_COLORS[colorVariant] || TOPIC_COLORS.default;

  return (
    <Badge
      variant="outline"
      className={cn(
        'border font-medium transition-colors',
        colors.bg,
        colors.text,
        colors.border,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
      onClick={onClick}
    >
      {topic}
    </Badge>
  );
}

/**
 * TopicPillList - A helper component to display multiple topic pills
 */
export function TopicPillList({
  topics,
  maxDisplay = 3,
  size = 'sm',
  className,
}: {
  topics: string[];
  maxDisplay?: number;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const displayedTopics = topics.slice(0, maxDisplay);
  const remainingCount = topics.length - maxDisplay;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {displayedTopics.map((topic, index) => (
        <TopicPill key={`${topic}-${index}`} topic={topic} size={size} />
      ))}
      {remainingCount > 0 && (
        <Badge
          variant="secondary"
          className={cn('font-medium', size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm')}
        >
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
