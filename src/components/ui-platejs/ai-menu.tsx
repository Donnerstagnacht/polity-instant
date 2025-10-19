import * as React from 'react';

import { AIChatPlugin, AIPlugin, useEditorChat, useLastAssistantMessage } from '@platejs/ai/react';
import { BlockSelectionPlugin, useIsSelecting } from '@platejs/selection/react';
import { Command as CommandPrimitive } from 'cmdk';
import {
  Album,
  BadgeHelp,
  BookOpenCheck,
  Check,
  CornerUpLeft,
  FeatherIcon,
  ListEnd,
  ListMinus,
  ListPlus,
  Loader2Icon,
  PauseIcon,
  PenLine,
  SmileIcon,
  Wand,
  X,
} from 'lucide-react';
import { type NodeEntry, type SlateEditor, isHotkey, NodeApi } from 'platejs';
import { useEditorPlugin, useHotkeys, usePluginOption } from 'platejs/react';
import { type PlateEditor, useEditorRef } from 'platejs/react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command.tsx';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover.tsx';
import { cn } from '@/utils/utils.ts';
import { useChat } from '@/components/kit-platejs/use-chat.ts';

import { AIChatEditor } from './ai-chat-editor.tsx';

export function AIMenu() {
  const { t } = useTranslation();
  const { api, editor } = useEditorPlugin(AIChatPlugin);
  const open = usePluginOption(AIChatPlugin, 'open');
  const mode = usePluginOption(AIChatPlugin, 'mode');
  const streaming = usePluginOption(AIChatPlugin, 'streaming');
  const isSelecting = useIsSelecting();

  const [value, setValue] = React.useState('');

  const chat = useChat();

  const { input, messages, setInput, status } = chat;
  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(null);

  const content = useLastAssistantMessage()?.content;

  React.useEffect(() => {
    if (streaming) {
      const anchor = api.aiChat.node({ anchor: true });
      setTimeout(() => {
        if (anchor?.[0]) {
          const anchorDom = editor.api.toDOMNode(anchor[0]);
          if (anchorDom) setAnchorElement(anchorDom);
        }
      }, 0);
    }
  }, [streaming, api.aiChat, editor]);

  const setOpen = (open: boolean) => {
    if (open) {
      api.aiChat.show();
    } else {
      api.aiChat.hide();
    }
  };

  const show = (anchorElement: HTMLElement) => {
    setAnchorElement(anchorElement);
    setOpen(true);
  };

  useEditorChat({
    chat,
    onOpenBlockSelection: (blocks: NodeEntry[]) => {
      const lastBlock = blocks.at(-1)?.[0];
      if (lastBlock) {
        const dom = editor.api.toDOMNode(lastBlock);
        if (dom) show(dom);
      }
    },
    onOpenChange: open => {
      if (!open) {
        setAnchorElement(null);
        setInput('');
      }
    },
    onOpenCursor: () => {
      const block = editor.api.block({ highest: true });
      if (!block) return;

      const [ancestor] = block;

      if (!editor.api.isAt({ end: true }) && !editor.api.isEmpty(ancestor)) {
        editor.getApi(BlockSelectionPlugin).blockSelection.set(ancestor.id as string);
      }

      const dom = editor.api.toDOMNode(ancestor);
      if (dom) show(dom);
    },
    onOpenSelection: () => {
      const lastBlock = editor.api.blocks().at(-1)?.[0];
      if (lastBlock) {
        const dom = editor.api.toDOMNode(lastBlock);
        if (dom) show(dom);
      }
    },
  });

  useHotkeys('esc', () => {
    api.aiChat.stop();

    // remove when you implement the route /api/ai/command
    chat._abortFakeStream();
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  if (isLoading && mode === 'insert') {
    return null;
  }

  if (!anchorElement) return null;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor virtualRef={{ current: anchorElement }} />

      <PopoverContent
        className="border-none bg-transparent p-0 shadow-none"
        style={{
          width: anchorElement?.offsetWidth,
        }}
        onEscapeKeyDown={e => {
          e.preventDefault();

          api.aiChat.hide();
        }}
        align="center"
        side="bottom"
      >
        <Command
          className="w-full rounded-lg border shadow-md"
          value={value}
          onValueChange={setValue}
        >
          {mode === 'chat' && isSelecting && content && <AIChatEditor content={content} />}

          {isLoading ? (
            <div className="flex grow select-none items-center gap-2 p-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              {messages.length > 1 ? t('plateJs.ai.menu.editing') : t('plateJs.ai.menu.thinking')}
            </div>
          ) : (
            <CommandPrimitive.Input
              className={cn(
                'flex h-9 w-full min-w-0 border-input bg-transparent px-3 py-1 text-base outline-none transition-[color,box-shadow] placeholder:text-muted-foreground md:text-sm dark:bg-input/30',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                'border-b focus-visible:ring-transparent'
              )}
              value={input}
              onKeyDown={e => {
                if (isHotkey('backspace')(e) && input.length === 0) {
                  e.preventDefault();
                  api.aiChat.hide();
                }
                if (isHotkey('enter')(e) && !e.shiftKey && !value) {
                  e.preventDefault();
                  void api.aiChat.submit();
                }
              }}
              onValueChange={setInput}
              placeholder={t('plateJs.ai.menu.placeholder')}
              data-plate-focus
              autoFocus
            />
          )}

          {!isLoading && (
            <CommandList>
              <AIMenuItems setValue={setValue} />
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type EditorChatState =
  | 'cursorCommand'
  | 'cursorSuggestion'
  | 'selectionCommand'
  | 'selectionSuggestion';

export const AIMenuItems = ({ setValue }: { setValue: (value: string) => void }) => {
  const { t } = useTranslation();
  const editor = useEditorRef();
  const { messages } = usePluginOption(AIChatPlugin, 'chat');
  const aiEditor = usePluginOption(AIChatPlugin, 'aiEditor');
  const isSelecting = useIsSelecting();

  const aiChatItems = {
    accept: {
      icon: <Check />,
      label: t('plateJs.ai.menu.accept'),
      value: 'accept',
      onSelect: ({ editor }) => {
        editor.getTransforms(AIChatPlugin).aiChat.accept();
        editor.tf.focus({ edge: 'end' });
      },
    },
    continueWrite: {
      icon: <PenLine />,
      label: t('plateJs.ai.menu.continueWriting'),
      value: 'continueWrite',
      onSelect: ({ editor }) => {
        const ancestorNode = editor.api.block({ highest: true });

        if (!ancestorNode) return;

        const isEmpty = NodeApi.string(ancestorNode[0]).trim().length === 0;

        void editor.getApi(AIChatPlugin).aiChat.submit({
          mode: 'insert',
          prompt: isEmpty
            ? `<Document>
{editor}
</Document>
Start writing a new paragraph AFTER <Document> ONLY ONE SENTENCE`
            : 'Continue writing AFTER <Block> ONLY ONE SENTENCE. DONT REPEAT THE TEXT.',
        });
      },
    },
    discard: {
      icon: <X />,
      label: t('plateJs.ai.menu.discard'),
      shortcut: 'Escape',
      value: 'discard',
      onSelect: ({ editor }) => {
        editor.getTransforms(AIPlugin).ai.undo();
        editor.getApi(AIChatPlugin).aiChat.hide();
      },
    },
    emojify: {
      icon: <SmileIcon />,
      label: t('plateJs.ai.menu.emojify'),
      value: 'emojify',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: 'Emojify',
        });
      },
    },
    explain: {
      icon: <BadgeHelp />,
      label: t('plateJs.ai.menu.explain'),
      value: 'explain',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: {
            default: 'Explain {editor}',
            selecting: 'Explain',
          },
        });
      },
    },
    fixSpelling: {
      icon: <Check />,
      label: t('plateJs.ai.menu.fixSpelling'),
      value: 'fixSpelling',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: 'Fix spelling and grammar',
        });
      },
    },
    generateMarkdownSample: {
      icon: <BookOpenCheck />,
      label: t('plateJs.ai.menu.generateMarkdownSample'),
      value: 'generateMarkdownSample',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: 'Generate a markdown sample',
        });
      },
    },
    generateMdxSample: {
      icon: <BookOpenCheck />,
      label: t('plateJs.ai.menu.generateMdxSample'),
      value: 'generateMdxSample',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: 'Generate a mdx sample',
        });
      },
    },
    improveWriting: {
      icon: <Wand />,
      label: t('plateJs.ai.menu.improveWriting'),
      value: 'improveWriting',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: 'Improve the writing',
        });
      },
    },
    insertBelow: {
      icon: <ListEnd />,
      label: t('plateJs.ai.menu.insertBelow'),
      value: 'insertBelow',
      onSelect: ({ aiEditor, editor }) => {
        void editor.getTransforms(AIChatPlugin).aiChat.insertBelow(aiEditor);
      },
    },
    makeLonger: {
      icon: <ListPlus />,
      label: t('plateJs.ai.menu.makeLonger'),
      value: 'makeLonger',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: 'Make longer',
        });
      },
    },
    makeShorter: {
      icon: <ListMinus />,
      label: t('plateJs.ai.menu.makeShorter'),
      value: 'makeShorter',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: 'Make shorter',
        });
      },
    },
    replace: {
      icon: <Check />,
      label: t('plateJs.ai.menu.replaceSelection'),
      value: 'replace',
      onSelect: ({ aiEditor, editor }) => {
        void editor.getTransforms(AIChatPlugin).aiChat.replaceSelection(aiEditor);
      },
    },
    simplifyLanguage: {
      icon: <FeatherIcon />,
      label: t('plateJs.ai.menu.simplifyLanguage'),
      value: 'simplifyLanguage',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          prompt: 'Simplify the language',
        });
      },
    },
    summarize: {
      icon: <Album />,
      label: t('plateJs.ai.menu.addSummary'),
      value: 'summarize',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.submit({
          mode: 'insert',
          prompt: {
            default: 'Summarize {editor}',
            selecting: 'Summarize',
          },
        });
      },
    },
    tryAgain: {
      icon: <CornerUpLeft />,
      label: t('plateJs.ai.menu.tryAgain'),
      value: 'tryAgain',
      onSelect: ({ editor }) => {
        void editor.getApi(AIChatPlugin).aiChat.reload();
      },
    },
  } satisfies Record<
    string,
    {
      icon: React.ReactNode;
      label: string;
      value: string;
      component?: React.ComponentType<{ menuState: EditorChatState }>;
      filterItems?: boolean;
      items?: { label: string; value: string }[];
      shortcut?: string;
      onSelect?: ({ aiEditor, editor }: { aiEditor: SlateEditor; editor: PlateEditor }) => void;
    }
  >;

  const menuStateItems: Record<
    EditorChatState,
    {
      items: (typeof aiChatItems)[keyof typeof aiChatItems][];
      heading?: string;
    }[]
  > = {
    cursorCommand: [
      {
        items: [
          aiChatItems.generateMdxSample,
          aiChatItems.generateMarkdownSample,
          aiChatItems.continueWrite,
          aiChatItems.summarize,
          aiChatItems.explain,
        ],
      },
    ],
    cursorSuggestion: [
      {
        items: [aiChatItems.accept, aiChatItems.discard, aiChatItems.tryAgain],
      },
    ],
    selectionCommand: [
      {
        items: [
          aiChatItems.improveWriting,
          aiChatItems.emojify,
          aiChatItems.makeLonger,
          aiChatItems.makeShorter,
          aiChatItems.fixSpelling,
          aiChatItems.simplifyLanguage,
        ],
      },
    ],
    selectionSuggestion: [
      {
        items: [
          aiChatItems.replace,
          aiChatItems.insertBelow,
          aiChatItems.discard,
          aiChatItems.tryAgain,
        ],
      },
    ],
  };

  const menuState = React.useMemo(() => {
    if (messages && messages.length > 0) {
      return isSelecting ? 'selectionSuggestion' : 'cursorSuggestion';
    }

    return isSelecting ? 'selectionCommand' : 'cursorCommand';
  }, [isSelecting, messages]);

  const menuGroups = React.useMemo(() => {
    const items = menuStateItems[menuState];

    return items;
  }, [menuState]);

  React.useEffect(() => {
    if (menuGroups.length > 0 && menuGroups[0].items.length > 0) {
      setValue(menuGroups[0].items[0].value);
    }
  }, [menuGroups, setValue]);

  if (!aiEditor) return null;

  return (
    <>
      {menuGroups.map((group, index) => (
        <CommandGroup key={index} heading={group.heading}>
          {group.items.map(menuItem => (
            <CommandItem
              key={menuItem.value}
              className="[&_svg]:text-muted-foreground"
              value={menuItem.value}
              onSelect={() => {
                menuItem.onSelect?.({
                  aiEditor,
                  editor: editor,
                });
              }}
            >
              {menuItem.icon}
              <span>{menuItem.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  );
};

export function AILoadingBar() {
  const { t } = useTranslation();
  const chat = usePluginOption(AIChatPlugin, 'chat');
  const mode = usePluginOption(AIChatPlugin, 'mode');

  const { status } = chat;

  const { api } = useEditorPlugin(AIChatPlugin);

  const isLoading = status === 'streaming' || status === 'submitted';

  const visible = isLoading && mode === 'insert';

  if (!visible) return null;

  return (
    <div
      className={cn(
        'absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-md border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground shadow-md transition-all duration-300'
      )}
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      <span>
        {status === 'submitted' ? t('plateJs.ai.menu.thinking') : t('plateJs.ai.menu.writing')}
      </span>
      <Button
        size="sm"
        variant="ghost"
        className="flex items-center gap-1 text-xs"
        onClick={() => api.aiChat.stop()}
      >
        <PauseIcon className="h-4 w-4" />
        {t('plateJs.ai.menu.stop')}
        <kbd className="ml-1 rounded bg-border px-1 font-mono text-[10px] text-muted-foreground shadow-sm">
          Esc
        </kbd>
      </Button>
    </div>
  );
}
