import { MessageSquareTextIcon } from 'lucide-react';
import { useEditorRef } from 'platejs/react';
import { useTranslation } from 'react-i18next';

import { commentPlugin } from '@/features/shared/ui/kit-platejs/comment-kit.tsx';

import { ToolbarButton } from '@/features/shared/ui/ui/toolbar.tsx';

export function CommentToolbarButton() {
  const editor = useEditorRef();
  const { t } = useTranslation();

  return (
    <ToolbarButton
      onClick={() => {
        editor.getTransforms(commentPlugin).comment.setDraft();
      }}
      data-plate-prevent-overlay
      tooltip={t('plateJs.toolbar.comment', 'Comment')}
    >
      <MessageSquareTextIcon />
    </ToolbarButton>
  );
}
