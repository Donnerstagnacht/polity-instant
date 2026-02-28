import { BaseCommentPlugin } from '@platejs/comment';

import { CommentLeafStatic } from '@/features/shared/ui/ui-platejs/comment-node-static.tsx';

export const BaseCommentKit = [BaseCommentPlugin.withComponent(CommentLeafStatic)];
