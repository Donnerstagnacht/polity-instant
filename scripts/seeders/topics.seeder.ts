import { id, tx } from '@instantdb/admin';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { batchTransact } from '../helpers/transaction.helpers';

/**
 * Topic definitions for the Pinterest-style timeline filtering system.
 * Each topic has a category, display color, icon name, and description.
 */
const TOPIC_DEFINITIONS = [
  {
    tag: 'transport',
    category: 'transport',
    color: '#3B82F6',
    bgColor: 'bg-blue-100',
    icon: 'Bus',
    description: 'Public transit, bike lanes, roads, and mobility solutions',
  },
  {
    tag: 'budget',
    category: 'budget',
    color: '#F59E0B',
    bgColor: 'bg-amber-100',
    icon: 'Coins',
    description: 'Municipal budgets, tax allocation, and fiscal policy',
  },
  {
    tag: 'climate',
    category: 'climate',
    color: '#10B981',
    bgColor: 'bg-emerald-100',
    icon: 'Leaf',
    description: 'Climate action, emissions reduction, and sustainability',
  },
  {
    tag: 'healthcare',
    category: 'healthcare',
    color: '#EF4444',
    bgColor: 'bg-red-100',
    icon: 'Heart',
    description: 'Public health, hospitals, and medical services',
  },
  {
    tag: 'education',
    category: 'education',
    color: '#8B5CF6',
    bgColor: 'bg-violet-100',
    icon: 'GraduationCap',
    description: 'Schools, universities, and educational policy',
  },
  {
    tag: 'housing',
    category: 'housing',
    color: '#F97316',
    bgColor: 'bg-orange-100',
    icon: 'Home',
    description: 'Affordable housing, zoning, and residential development',
  },
  {
    tag: 'urban',
    category: 'urban',
    color: '#6366F1',
    bgColor: 'bg-indigo-100',
    icon: 'Building2',
    description: 'Urban planning, city development, and infrastructure',
  },
  {
    tag: 'governance',
    category: 'governance',
    color: '#1F2937',
    bgColor: 'bg-gray-100',
    icon: 'Landmark',
    description: 'Government structure, elections, and civic participation',
  },
  {
    tag: 'environment',
    category: 'environment',
    color: '#22C55E',
    bgColor: 'bg-green-100',
    icon: 'TreeDeciduous',
    description: 'Parks, nature conservation, and environmental protection',
  },
  {
    tag: 'economy',
    category: 'economy',
    color: '#0EA5E9',
    bgColor: 'bg-sky-100',
    icon: 'Briefcase',
    description: 'Local business, jobs, and economic development',
  },
  {
    tag: 'social',
    category: 'social',
    color: '#EC4899',
    bgColor: 'bg-pink-100',
    icon: 'Users',
    description: 'Social services, community programs, and welfare',
  },
  {
    tag: 'justice',
    category: 'justice',
    color: '#7C3AED',
    bgColor: 'bg-purple-100',
    icon: 'Scale',
    description: 'Legal reform, equity, and civil rights',
  },
  {
    tag: 'events',
    category: 'events',
    color: '#14B8A6',
    bgColor: 'bg-teal-100',
    icon: 'Calendar',
    description: 'Community events, meetings, and gatherings',
  },
  {
    tag: 'international',
    category: 'international',
    color: '#0891B2',
    bgColor: 'bg-cyan-100',
    icon: 'Globe',
    description: 'International relations and global issues',
  },
];

export const topicsSeeder: EntitySeeder = {
  name: 'topics',
  dependencies: [], // No dependencies - topics are standalone

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding topics (hashtags with categories)...');
    const { db } = context;
    const transactions = [];
    const hashtagIds: string[] = [];

    for (const topic of TOPIC_DEFINITIONS) {
      const topicId = id();
      hashtagIds.push(topicId);

      transactions.push(
        tx.hashtags[topicId].update({
          createdAt: new Date().getTime(),
          tag: topic.tag,
          category: topic.category,
          color: topic.color,
          bgColor: topic.bgColor,
          icon: topic.icon,
          description: topic.description,
          postCount: 0,
        })
      );
    }

    await batchTransact(db, transactions);

    console.log(`✅ Created ${hashtagIds.length} topic hashtags`);

    return {
      ...context,
      hashtagIds,
    };
  },
};

export default topicsSeeder;
