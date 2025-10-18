import * as React from 'react';

import type { PlateEditor, PlateElementProps } from 'platejs/react';

import { AIChatPlugin } from '@platejs/ai/react';
import { useTranslation } from 'react-i18next';
import {
  CalendarIcon,
  ChevronRightIcon,
  Code2,
  Columns3Icon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  LightbulbIcon,
  ListIcon,
  ListOrdered,
  PilcrowIcon,
  Quote,
  RadicalIcon,
  SparklesIcon,
  Square,
  Table,
  TableOfContentsIcon,
} from 'lucide-react';
import { type TComboboxInputElement, KEYS } from 'platejs';
import { PlateElement } from 'platejs/react';

import { insertBlock, insertInlineElement } from '@/components/kit-platejs/transforms.ts';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
} from '../ui/inline-combobox.tsx';

type Group = {
  group: string;
  items: {
    icon: React.ReactNode;
    value: string;
    onSelect: (editor: PlateEditor, value: string) => void;
    className?: string;
    focusEditor?: boolean;
    keywords?: string[];
    label?: string;
  }[];
};

const groups: Group[] = [
  {
    group: 'ai',
    items: [
      {
        focusEditor: false,
        icon: <SparklesIcon />,
        value: 'AI',
        onSelect: editor => {
          editor.getApi(AIChatPlugin).aiChat.show();
        },
      },
    ],
  },
  {
    group: 'basicBlocks',
    items: [
      {
        icon: <PilcrowIcon />,
        keywords: ['paragraph'],
        value: KEYS.p,
      },
      {
        icon: <Heading1Icon />,
        keywords: ['title', 'h1'],
        value: KEYS.h1,
      },
      {
        icon: <Heading2Icon />,
        keywords: ['subtitle', 'h2'],
        value: KEYS.h2,
      },
      {
        icon: <Heading3Icon />,
        keywords: ['subtitle', 'h3'],
        value: KEYS.h3,
      },
      {
        icon: <ListIcon />,
        keywords: ['unordered', 'ul', '-'],
        value: KEYS.ul,
      },
      {
        icon: <ListOrdered />,
        keywords: ['ordered', 'ol', '1'],
        value: KEYS.ol,
      },
      {
        icon: <Square />,
        keywords: ['checklist', 'task', 'checkbox', '[]'],
        value: KEYS.listTodo,
      },
      {
        icon: <ChevronRightIcon />,
        keywords: ['collapsible', 'expandable'],
        value: KEYS.toggle,
      },
      {
        icon: <Code2 />,
        keywords: ['```'],
        value: KEYS.codeBlock,
      },
      {
        icon: <Table />,
        value: KEYS.table,
      },
      {
        icon: <Quote />,
        keywords: ['citation', 'blockquote', 'quote', '>'],
        value: KEYS.blockquote,
      },
      {
        description: 'Insert a highlighted block.',
        icon: <LightbulbIcon />,
        keywords: ['note'],
        value: KEYS.callout,
      },
    ].map(item => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'advancedBlocks',
    items: [
      {
        icon: <TableOfContentsIcon />,
        keywords: ['toc'],
        value: KEYS.toc,
      },
      {
        icon: <Columns3Icon />,
        value: 'action_three_columns',
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        value: KEYS.equation,
      },
    ].map(item => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: 'inline',
    items: [
      {
        focusEditor: true,
        icon: <CalendarIcon />,
        keywords: ['time'],
        value: KEYS.date,
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        value: KEYS.inlineEquation,
      },
    ].map(item => ({
      ...item,
      onSelect: (editor, value) => {
        insertInlineElement(editor, value);
      },
    })),
  },
];

export function SlashInputElement(props: PlateElementProps<TComboboxInputElement>) {
  const { editor, element } = props;
  const { t } = useTranslation();

  return (
    <PlateElement {...props} as="span">
      <InlineCombobox element={element} trigger="/">
        <InlineComboboxInput />

        <InlineComboboxContent>
          <InlineComboboxEmpty>{t('commandDialog.noResults')}</InlineComboboxEmpty>

          {groups.map(({ group, items }) => {
            // Map group names to their translation keys
            const getGroupTranslationKey = (groupName: string) => {
              switch (groupName) {
                case 'basicBlocks':
                  return 'plateJs.toolbar.groups.basicBlocks';
                case 'lists':
                  return 'plateJs.toolbar.groups.lists';
                case 'media':
                  return 'plateJs.toolbar.groups.media';
                case 'advancedBlocks':
                  return 'plateJs.toolbar.groups.advancedBlocks';
                case 'inline':
                  return 'plateJs.toolbar.groups.inline';
                case 'ai':
                  return 'plateJs.toolbar.groups.ai';
                default:
                  return 'plateJs.toolbar.groups.basicBlocks'; // fallback
              }
            };

            return (
              <InlineComboboxGroup key={group}>
                <InlineComboboxGroupLabel>
                  {t(getGroupTranslationKey(group))}
                </InlineComboboxGroupLabel>

                {items.map(({ focusEditor, icon, keywords, label, value, onSelect }) => {
                  // Get translated label based on the value
                  let translatedLabel = label;
                  if (value === 'AI') translatedLabel = t('plateJs.toolbar.askAI');
                  else if (value === KEYS.p) translatedLabel = t('plateJs.text');
                  else if (value === KEYS.h1) translatedLabel = t('plateJs.headings.heading1');
                  else if (value === KEYS.h2) translatedLabel = t('plateJs.headings.heading2');
                  else if (value === KEYS.h3) translatedLabel = t('plateJs.headings.heading3');
                  else if (value === KEYS.ul) translatedLabel = t('plateJs.lists.bulleted');
                  else if (value === KEYS.ol) translatedLabel = t('plateJs.lists.numbered');
                  else if (value === KEYS.listTodo) translatedLabel = t('plateJs.lists.todo');
                  else if (value === KEYS.toggle) translatedLabel = t('plateJs.lists.toggle');
                  else if (value === KEYS.codeBlock) translatedLabel = t('plateJs.code');
                  else if (value === KEYS.table) translatedLabel = t('plateJs.toolbar.tableButton');
                  else if (value === KEYS.blockquote) translatedLabel = t('plateJs.quote');
                  else if (value === KEYS.callout) translatedLabel = t('plateJs.layout.callout');
                  else if (value === KEYS.toc)
                    translatedLabel = t('plateJs.toolbar.tableOfContents.title');
                  else if (value === 'action_three_columns')
                    translatedLabel = t('plateJs.layout.threeColumns');
                  else if (value === KEYS.equation)
                    translatedLabel = t('plateJs.equation.newEquation');
                  else if (value === KEYS.date) translatedLabel = t('plateJs.toolbar.date');
                  else if (value === KEYS.inlineEquation)
                    translatedLabel = t('plateJs.toolbar.inlineEquation');

                  return (
                    <InlineComboboxItem
                      key={value}
                      value={value}
                      onClick={() => onSelect(editor, value)}
                      label={translatedLabel}
                      focusEditor={focusEditor}
                      group={group}
                      keywords={keywords}
                    >
                      <div className="mr-2 text-muted-foreground">{icon}</div>
                      {translatedLabel ?? value}
                    </InlineComboboxItem>
                  );
                })}
              </InlineComboboxGroup>
            );
          })}
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </PlateElement>
  );
}
