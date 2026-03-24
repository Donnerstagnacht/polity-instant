import type { SlateLeafProps, TSuggestionText } from 'platejs';

import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { SlateLeaf } from 'platejs';

import { cn } from '@/features/shared/utils/utils.ts';

export function SuggestionLeafStatic(props: SlateLeafProps<TSuggestionText>) {
  const { editor, leaf } = props;

  const dataList = editor.getApi(BaseSuggestionPlugin).suggestion.dataList(leaf);
  const hasRemove = dataList.some(data => data.type === 'remove');
  const diffOperation = { type: hasRemove ? 'delete' : 'insert' } as const;

  const Component = ({ delete: 'del', insert: 'ins', update: 'span' } as const)[diffOperation.type];

  return (
    <SlateLeaf
      {...props}
      as={Component}
      className={cn(
        'bg-emerald-100 text-emerald-700 no-underline transition-colors duration-200',
        hasRemove && 'bg-red-100 text-red-700 line-through'
      )}
    >
      {props.children}
    </SlateLeaf>
  );
}
