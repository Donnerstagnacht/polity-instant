import * as React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import type { TFunction } from 'i18next';

import {
  CalendarIcon,
  ChevronRightIcon,
  Columns3Icon,
  FileCodeIcon,
  FilmIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  RadicalIcon,
  SquareIcon,
  TableIcon,
  TableOfContentsIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { type PlateEditor, useEditorRef } from 'platejs/react';
import { useTranslation } from 'react-i18next';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { insertBlock, insertInlineElement } from '@/components/kit-platejs/transforms.ts';

import { ToolbarButton, ToolbarMenuGroup } from '../ui/toolbar.tsx';

interface Group {
  group: string;
  items: Item[];
}

interface Item {
  icon: React.ReactNode;
  value: string;
  onSelect: (editor: PlateEditor, value: string) => void;
  focusEditor?: boolean;
  label?: string;
}

const groups = (t: TFunction): Group[] => [
  {
    group: t('plateJs.toolbar.groups.basicBlocks', 'Basic blocks'),
    items: [
      {
        icon: <PilcrowIcon />,
        label: t('plateJs.text', 'Paragraph'),
        value: KEYS.p,
      },
      {
        icon: <Heading1Icon />,
        label: t('plateJs.headings.heading1', 'Heading 1'),
        value: 'h1',
      },
      {
        icon: <Heading2Icon />,
        label: t('plateJs.headings.heading2', 'Heading 2'),
        value: 'h2',
      },
      {
        icon: <Heading3Icon />,
        label: t('plateJs.headings.heading3', 'Heading 3'),
        value: 'h3',
      },
      {
        icon: <TableIcon />,
        label: t('plateJs.toolbar.tableButton', 'Table'),
        value: KEYS.table,
      },
      {
        icon: <FileCodeIcon />,
        label: t('plateJs.code', 'Code'),
        value: KEYS.codeBlock,
      },
      {
        icon: <QuoteIcon />,
        label: t('plateJs.quote', 'Quote'),
        value: KEYS.blockquote,
      },
      {
        icon: <MinusIcon />,
        label: t('plateJs.toolbar.divider', 'Divider'),
        value: KEYS.hr,
      },
    ].map(item => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: t('plateJs.toolbar.groups.lists', 'Lists'),
    items: [
      {
        icon: <ListIcon />,
        label: t('plateJs.toolbar.bulletedList', 'Bulleted list'),
        value: KEYS.ul,
      },
      {
        icon: <ListOrderedIcon />,
        label: t('plateJs.toolbar.numberedList', 'Numbered list'),
        value: KEYS.ol,
      },
      {
        icon: <SquareIcon />,
        label: t('plateJs.toolbar.todoList', 'To-do list'),
        value: KEYS.listTodo,
      },
      {
        icon: <ChevronRightIcon />,
        label: t('plateJs.toolbar.toggleList', 'Toggle list'),
        value: KEYS.toggle,
      },
    ].map(item => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: t('plateJs.toolbar.groups.media', 'Media'),
    items: [
      {
        icon: <ImageIcon />,
        label: t('plateJs.toolbar.image', 'Image'),
        value: KEYS.img,
      },
      {
        icon: <FilmIcon />,
        label: t('plateJs.toolbar.embed', 'Embed'),
        value: KEYS.mediaEmbed,
      },
    ].map(item => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: t('plateJs.toolbar.groups.advancedBlocks', 'Advanced blocks'),
    items: [
      {
        icon: <TableOfContentsIcon />,
        label: t('plateJs.toolbar.tableOfContents.title', 'Table of contents'),
        value: KEYS.toc,
      },
      {
        icon: <Columns3Icon />,
        label: t('plateJs.layout.threeColumns', '3 columns'),
        value: 'action_three_columns',
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: t('plateJs.toolbar.equation', 'Equation'),
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
    group: t('plateJs.toolbar.groups.inline', 'Inline'),
    items: [
      {
        icon: <Link2Icon />,
        label: t('plateJs.toolbar.link', 'Link'),
        value: KEYS.link,
      },
      {
        focusEditor: true,
        icon: <CalendarIcon />,
        label: t('plateJs.toolbar.date', 'Date'),
        value: KEYS.date,
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: t('plateJs.toolbar.inlineEquation', 'Inline Equation'),
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

export function InsertToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const groupsList = groups(t);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip={t('plateJs.toolbar.insert', 'Insert')} isDropdown>
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col overflow-y-auto"
        align="start"
      >
        {groupsList.map(({ group, items: nestedItems }) => (
          <ToolbarMenuGroup key={group} label={group}>
            {nestedItems.map(({ icon, label, value, onSelect }) => (
              <DropdownMenuItem
                key={value}
                className="min-w-[180px]"
                onSelect={() => {
                  onSelect(editor, value);
                  editor.tf.focus();
                }}
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </ToolbarMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
