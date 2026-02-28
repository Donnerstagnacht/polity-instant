# Shared Typeahead Search Component

Reusable typeahead search component for selecting users, groups, amendments, and events across the codebase.

## Usage

```tsx
import { TypeaheadSearch } from '@/features/shared/ui/typeahead';

function MyComponent() {
  const [selectedId, setSelectedId] = useState<string>('');

  return (
    <TypeaheadSearch
      entityTypes={['user', 'group']}
      value={selectedId}
      onChange={item => setSelectedId(item?.id ?? '')}
      placeholder="Search users or groups..."
      label="Assign to"
    />
  );
}
```

## Props

| Prop          | Type                                              | Description                   |
| ------------- | ------------------------------------------------- | ----------------------------- |
| `entityTypes` | `('user' \| 'group' \| 'amendment' \| 'event')[]` | Which entity types to search  |
| `value`       | `string?`                                         | Currently selected item ID    |
| `onChange`    | `(item: TypeaheadItem \| null) => void`           | Called when selection changes |
| `placeholder` | `string?`                                         | Input placeholder text        |
| `filterFn`    | `(item: TypeaheadItem) => boolean`                | Custom filter function        |
| `className`   | `string?`                                         | Additional CSS classes        |
| `label`       | `string?`                                         | Form label text               |

## Architecture

```
TypeaheadSearch.tsx       - Main component (input + dropdown)
├── TypeaheadDropdown.tsx - Dropdown container (grouped by entity type)
│   └── TypeaheadResultCard.tsx - Individual result row
├── useTypeaheadSearch.ts - Hook: query state, filtering, sorting
│   └── useTypeaheadData.ts - Hook: data fetching from Zero
├── typeaheadHelpers.ts   - Pure functions: filter, sort, group, highlight
└── entityCardHelpers.ts  - Pure functions: icons, gradients, labels
```

## Adding New Entity Types

1. Add to `EntityType` union in `typeaheadHelpers.ts`
2. Add data source in `useTypeaheadData.ts` (import the relevant `useXxxState`)
3. Add label in `ENTITY_TYPE_LABELS` map in `TypeaheadDropdown.tsx`
4. Add icon mapping in `entityCardHelpers.ts`

## Integration with Mentions (@)

The `@` mention system in the Plate editor uses the same data hooks. Wire `useTypeaheadData` as the data source for mention suggestions.
