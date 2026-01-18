import { db, tx, id } from '@db/db';

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
  const { data: versionsData } = await db.queryOnce({
    documentVersions: {
      $: {
        where: { 'blog.id': blogId },
      },
    },
  });

  const versions = versionsData?.documentVersions || [];
  const nextVersionNumber =
    versions.length > 0 ? Math.max(...versions.map((v: any) => v.versionNumber)) + 1 : 1;

  // Generate title based on creation type if not provided
  const versionTitle = title || getDefaultVersionTitle(creationType);

  const versionId = id();
  await db.transact([
    tx.documentVersions[versionId]
      .update({
        versionNumber: nextVersionNumber,
        title: versionTitle,
        content: content,
        createdAt: Date.now(),
        creationType,
      })
      .link({ blog: blogId, creator: userId }),
  ]);
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
    const { data: versionsData } = await db.queryOnce({
      documentVersions: {
        $: {
          where: { 'blog.id': blogId },
        },
      },
    });

    const versions = versionsData?.documentVersions || [];
    if (versions.length === 0) return 0;

    return Math.max(...versions.map((v: any) => v.versionNumber));
  } catch (error) {
    console.error('Failed to get latest version number:', error);
    return 0;
  }
}
