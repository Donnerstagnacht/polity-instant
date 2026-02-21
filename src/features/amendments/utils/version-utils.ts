import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export type VersionCreationType =
  | 'manual'
  | 'suggestion_added'
  | 'suggestion_accepted'
  | 'suggestion_declined';

interface CreateVersionParams {
  documentId: string;
  userId: string;
  content: any[];
  creationType: VersionCreationType;
  title?: string;
}

/**
 * Creates a new version of a document
 * Automatically generates version number and title based on type
 */
export async function createDocumentVersion({
  documentId,
  userId,
  content,
  creationType,
  title,
}: CreateVersionParams): Promise<void> {
  const { data: versions } = await supabase
    .from('document_version')
    .select('version_number')
    .eq('document_id', documentId);

  const versionList = versions || [];
  const nextVersionNumber =
    versionList.length > 0
      ? Math.max(...versionList.map((v: any) => v.version_number)) + 1
      : 1;

  const versionTitle = title || getDefaultVersionTitle(creationType);

  const versionId = crypto.randomUUID();
  await supabase.from('document_version').insert({
    id: versionId,
    version_number: nextVersionNumber,
    title: versionTitle,
    content,
    created_at: new Date().toISOString(),
    creation_type: creationType,
    document_id: documentId,
    creator_id: userId,
  });
}

/**
 * Generates a default title based on the creation type
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
 * Get the latest version number for a document
 */
export async function getLatestVersionNumber(documentId: string): Promise<number> {
  try {
    const { data: versions } = await supabase
      .from('document_version')
      .select('version_number')
      .eq('document_id', documentId);

    const versionList = versions || [];
    if (versionList.length === 0) return 0;

    return Math.max(...versionList.map((v: any) => v.version_number));
  } catch (error) {
    console.error('Failed to get latest version number:', error);
    return 0;
  }
}
