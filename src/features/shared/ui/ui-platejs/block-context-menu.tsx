import * as React from 'react';

import { AIChatPlugin } from '@platejs/ai/react';
import {
  BLOCK_CONTEXT_MENU_ID,
  BlockMenuPlugin,
  BlockSelectionPlugin,
} from '@platejs/selection/react';
import { KEYS } from 'platejs';
import { useEditorPlugin, usePlateState } from 'platejs/react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/features/shared/ui/ui/context-menu.tsx';
import { useIsTouchDevice } from '@/features/shared/hooks/use-is-touch-device.ts';
import { useTranslation } from 'react-i18next';

type Value = 'askAI' | null;

export function BlockContextMenu({ children }: { children: React.ReactNode }) {
  const { api, editor } = useEditorPlugin(BlockMenuPlugin);
  const [value, setValue] = React.useState<Value>(null);
  const isTouch = useIsTouchDevice();
  const [readOnly] = usePlateState('readOnly');
  const { t } = useTranslation();

  const handleTurnInto = React.useCallback(
    (type: string) => {
      editor
        .getApi(BlockSelectionPlugin)
        .blockSelection.getNodes()
        .forEach(([node, path]) => {
          if (node[KEYS.listType]) {
            editor.tf.unsetNodes([KEYS.listType, 'indent'], {
              at: path,
            });
          }

          editor.tf.toggleBlock(type, { at: path });
        });
    },
    [editor]
  );

  const handleAlign = React.useCallback(
    (align: 'center' | 'left' | 'right') => {
      editor.getTransforms(BlockSelectionPlugin).blockSelection.setNodes({ align });
    },
    [editor]
  );

  if (isTouch) {
    return children;
  }

  return (
    <ContextMenu
      onOpenChange={open => {
        if (!open) {
          // prevent unselect the block selection
          setTimeout(() => {
            api.blockMenu.hide();
          }, 0);
        }
      }}
      modal={false}
    >
      <ContextMenuTrigger
        asChild
        onContextMenu={event => {
          const dataset = (event.target as HTMLElement).dataset;

          const disabled = dataset?.slateEditor === 'true' || readOnly;

          if (disabled) return event.preventDefault();

          api.blockMenu.show(BLOCK_CONTEXT_MENU_ID, {
            x: event.clientX,
            y: event.clientY,
          });
        }}
      >
        <div className="w-full">{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent
        className="w-64"
        onCloseAutoFocus={e => {
          e.preventDefault();
          editor.getApi(BlockSelectionPlugin).blockSelection.focus();

          if (value === 'askAI') {
            editor.getApi(AIChatPlugin).aiChat.show();
          }

          setValue(null);
        }}
      >
        <ContextMenuGroup>
          <ContextMenuItem
            onClick={() => {
              setValue('askAI');
            }}
          >
            {t('plateJs.blockContextMenu.askAI', 'Ask AI')}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              editor.getTransforms(BlockSelectionPlugin).blockSelection.removeNodes();
              editor.tf.focus();
            }}
          >
            {t('plateJs.blockContextMenu.delete', 'Delete')}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              editor.getTransforms(BlockSelectionPlugin).blockSelection.duplicate();
            }}
          >
            {t('plateJs.blockContextMenu.duplicate', 'Duplicate')}
            {/* <ContextMenuShortcut>⌘ + D</ContextMenuShortcut> */}
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              {t('plateJs.blockContextMenu.turnInto', 'Turn into')}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem onClick={() => handleTurnInto(KEYS.p)}>
                {t('plateJs.blockContextMenu.paragraph', 'Paragraph')}
              </ContextMenuItem>

              <ContextMenuItem onClick={() => handleTurnInto(KEYS.h1)}>
                {t('plateJs.headings.heading1')}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleTurnInto(KEYS.h2)}>
                {t('plateJs.blockContextMenu.heading2', 'Heading 2')}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleTurnInto(KEYS.h3)}>
                {t('plateJs.blockContextMenu.heading3', 'Heading 3')}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleTurnInto(KEYS.blockquote)}>
                {t('plateJs.blockContextMenu.blockquote', 'Blockquote')}
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>

        <ContextMenuGroup>
          <ContextMenuItem
            onClick={() => editor.getTransforms(BlockSelectionPlugin).blockSelection.setIndent(1)}
          >
            {t('plateJs.blockContextMenu.indent', 'Indent')}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => editor.getTransforms(BlockSelectionPlugin).blockSelection.setIndent(-1)}
          >
            {t('plateJs.blockContextMenu.outdent', 'Outdent')}
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              {t('plateJs.blockContextMenu.align', 'Align')}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem onClick={() => handleAlign('left')}>
                {t('plateJs.blockContextMenu.alignLeft', 'Left')}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleAlign('center')}>
                {t('plateJs.blockContextMenu.alignCenter', 'Center')}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleAlign('right')}>
                {t('plateJs.blockContextMenu.alignRight', 'Right')}
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
