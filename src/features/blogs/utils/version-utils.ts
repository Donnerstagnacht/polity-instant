import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export type VersionCreationType =
  | 'manual'
  | 'suggestion_added'
  | 'suggestion_accepted'
  | 'suggestion_declined';

interface CreateVersionParams {
  blogId: string;
  userId: string;
  content: any[];
  creationType: VersionCreationType;
  title?: string;
}

/**
 * Creates a new version of a blog document
 * Automatically generates version number and title based on type
 */
export async function createBlogVersion({
  blogId,
  userId,
  content,
  creationType,
  title,
}: CreateVersionParams): Promise<void> {
  // Query existing versions to determine next version number
  const { data: versionsData } = await supabase
    .from('document_version')
    .select('version_number')
    .eq('blog_id', blogId);

  const versions = versionsData ?? [];
  const nextVersionNumber =
    versions.length > 0
      ? Math.max(...versions.map((v: any) => v.version_number)) + 1
      : 1;

  // Generate title based on creation type if not provided
  const versionTitle = title || getDefaultVersionTitle(creationType);

  const versionId = crypto.randomUUID();
  await supabase.from('document_version').insert({
    id: versionId,
    version_number: nextVersionNumber,
    title: versionTitle,
    content,
    created_at: Date.now(),
    creation_type: creationType,
    blog_id: blogId,
    creator_id: userId,
  });
}

/**
 * Generates a default title based on the creation type
 * Note: These are fallback titles - translations should be used in UI
 */
function getDefaultVersionTitle(creationType: VersionCreationType): string {
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  switch (creationType) {
    case 'manual':
      return `Manual save - ${timestamp}`;
    case 'suggestion_added':
      return `Suggestion added - ${timestamp}`;
    case 'suggestion_accepted':
      return `Suggestion accepted - ${timestamp}`;
    case 'suggestion_declined':
      return `Suggestion declined - ${timestamp}`;
    default:
      return `Auto-save - ${timestamp}`;
  }
}

/**
 * Get the latest version number for a blog
 */
export async function getLatestVersionNumber(blogId: string): Promise<number> {
  try {
    const { data: versionsData } = await supabase
      .from('document_version')
      .select('version_number')
      .eq('blog_id', blogId);

    const versions = versionsData ?? [];
    if (versions.length === 0) return 0;

    return Math.max(...versions.map((v: any) => v.version_number));
  } catch (error) {
    console.error('Failed to get latest version number:', error);
    return 0;
  }
}
