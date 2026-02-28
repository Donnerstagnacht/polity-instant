import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import type { TElement } from 'platejs';

import { DropdownMenuItemIndicator } from '@radix-ui/react-dropdown-menu';
import {
  CheckIcon,
  ChevronRightIcon,
  Columns3Icon,
  FileCodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  QuoteIcon,
  SquareIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorRef, useSelectionFragmentProp } from 'platejs/react';
import { useTranslation } from 'react-i18next'; // Add this import

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/features/shared/ui/ui/dropdown-menu.tsx';
import { getBlockType, setBlockType } from '@/features/shared/ui/kit-platejs/transforms.ts';

import { ToolbarButton, ToolbarMenuGroup } from '@/features/shared/ui/ui/toolbar.tsx';
import { useMemo, useState } from 'react';

// Create base items without translations
const createTurnIntoItems = (t: (key: string, fallback: string) => string) => [
  {
    icon: <PilcrowIcon />,
    keywords: ['paragraph'],
    label: t('plateJs.text', 'Text'),
    value: KEYS.p,
  },
  {
    icon: <Heading1Icon />,
    keywords: ['title', 'h1'],
    label: t('plateJs.headings.heading1', 'Heading 1'),
    value: 'h1',
  },
  {
    icon: <Heading2Icon />,
    keywords: ['subtitle', 'h2'],
    label: t('plateJs.headings.heading2', 'Heading 2'),
    value: 'h2',
  },
  {
    icon: <Heading3Icon />,
    keywords: ['subtitle', 'h3'],
    label: t('plateJs.headings.heading3', 'Heading 3'),
    value: 'h3',
  },
  {
    icon: <ListIcon />,
    keywords: ['unordered', 'ul', '-'],
    label: t('plateJs.lists.bulleted', 'Bulleted list'),
    value: KEYS.ul,
  },
  {
    icon: <ListOrderedIcon />,
    keywords: ['ordered', 'ol', '1'],
    label: t('plateJs.lists.numbered', 'Numbered list'),
    value: KEYS.ol,
  },
  {
    icon: <SquareIcon />,
    keywords: ['checklist', 'task', 'checkbox', '[]'],
    label: t('plateJs.lists.todo', 'To-do list'),
    value: KEYS.listTodo,
  },
  {
    icon: <ChevronRightIcon />,
    keywords: ['collapsible', 'expandable'],
    label: t('plateJs.lists.toggle', 'Toggle list'),
    value: KEYS.toggle,
  },
  {
    icon: <FileCodeIcon />,
    keywords: ['```'],
    label: t('plateJs.code', 'Code'),
    value: KEYS.codeBlock,
  },
  {
    icon: <QuoteIcon />,
    keywords: ['citation', 'blockquote', '>'],
    label: t('plateJs.quote', 'Quote'),
    value: KEYS.blockquote,
  },
  {
    icon: <Columns3Icon />,
    label: t('plateJs.layout.threeColumns', '3 columns'),
    value: 'action_three_columns',
  },
];

// Custom hook to get translated turn into items
const useTranslatedTurnIntoItems = () => {
  const { t } = useTranslation();
  return useMemo(() => createTurnIntoItems(t), [t]);
};

export function TurnIntoToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const turnIntoItems = useTranslatedTurnIntoItems();

  const value = useSelectionFragmentProp({
    defaultValue: KEYS.p,
    getProp: node => getBlockType(node as TElement),
  });
  const selectedItem = useMemo(
    () => turnIntoItems.find(item => item.value === (value ?? KEYS.p)) ?? turnIntoItems[0],
    [value, turnIntoItems]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          className="min-w-[125px]"
          pressed={open}
          tooltip={t('plateJs.toolbar.turnInto', 'Turn into')}
          isDropdown
        >
          {selectedItem.label}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="ignore-click-outside/toolbar min-w-0"
        onCloseAutoFocus={e => {
          e.preventDefault();
          editor.tf.focus();
        }}
        align="start"
      >
        <ToolbarMenuGroup
          value={value}
          onValueChange={type => {
            setBlockType(editor, type);
          }}
          label={t('plateJs.toolbar.turnInto', 'Turn into')}
        >
          {turnIntoItems.map(({ icon, label, value: itemValue }) => (
            <DropdownMenuRadioItem
              key={itemValue}
              className="min-w-[180px] pl-2 *:first:[span]:hidden"
              value={itemValue}
            >
              <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
                <DropdownMenuItemIndicator>
                  <CheckIcon />
                </DropdownMenuItemIndicator>
              </span>
              {icon}
              {label}
            </DropdownMenuRadioItem>
          ))}
        </ToolbarMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
