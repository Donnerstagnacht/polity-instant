import { BaseAlignKit } from './align-base-kit.tsx';
import { BaseBasicBlocksKit } from './basic-blocks-base-kit.tsx';
import { BaseBasicMarksKit } from './basic-marks-base-kit.tsx';
import { BaseCalloutKit } from './callout-base-kit.tsx';
import { BaseCodeBlockKit } from './code-block-base-kit.tsx';
import { BaseColumnKit } from './column-base-kit.tsx';
import { BaseCommentKit } from './comment-base-kit.tsx';
import { BaseDateKit } from './date-base-kit.tsx';
import { BaseFontKit } from './font-base-kit.tsx';
import { BaseLineHeightKit } from './line-height-base-kit.tsx';
import { BaseLinkKit } from './link-base-kit.tsx';
import { BaseListKit } from './list-base-kit.tsx';
import { MarkdownKit } from './markdown-kit.tsx';
import { BaseMathKit } from './math-base-kit.tsx';
import { BaseMediaKit } from './media-base-kit.tsx';
import { BaseMentionKit } from './mention-base-kit.tsx';
import { BaseSuggestionKit } from './suggestion-base-kit.tsx';
import { BaseTableKit } from './table-base-kit.tsx';
import { BaseTocKit } from './toc-base-kit.tsx';
import { BaseToggleKit } from './toggle-base-kit.tsx';

export const BaseEditorKit = [
  ...BaseBasicBlocksKit,
  ...BaseCodeBlockKit,
  ...BaseTableKit,
  ...BaseToggleKit,
  ...BaseTocKit,
  ...BaseMediaKit,
  ...BaseCalloutKit,
  ...BaseColumnKit,
  ...BaseMathKit,
  ...BaseDateKit,
  ...BaseLinkKit,
  ...BaseMentionKit,
  ...BaseBasicMarksKit,
  ...BaseFontKit,
  ...BaseListKit,
  ...BaseAlignKit,
  ...BaseLineHeightKit,
  ...BaseCommentKit,
  ...BaseSuggestionKit,
  ...MarkdownKit,
];
