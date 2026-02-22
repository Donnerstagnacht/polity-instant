# Architecture Conventions

This document describes the layered architecture used across the Polity codebase.
The goal is a clean separation between **data access**, **business logic**, and **UI rendering**
so that each layer can be tested, reused, and changed independently.

---

## Layer Overview

```
┌─────────────────────────────────────────────────────────────┐
│  UI Layer (rendering only)                                  │
│  src/features/*/ui/*.tsx          — presentational components│
│  src/features/*/<Page>.tsx        — thin shell (hook + JSX) │
│  src/components/ui/*              — shadcn primitives        │
└───────────────────────┬─────────────────────────────────────┘
                        │ props / return values from hooks
┌───────────────────────┴─────────────────────────────────────┐
│  Logic Layer (business rules + UI state)                    │
│  src/features/*/logic/*.ts        — pure functions          │
│  src/features/*/hooks/*.ts        — composition & UI state  │
└───────────────────────┬─────────────────────────────────────┘
                        │ calls zero facade hooks
┌───────────────────────┴─────────────────────────────────────┐
│  Data Layer (Zero sync engine)                              │
│  src/zero/*/schema.ts             — Zod validation schemas  │
│  src/zero/*/table.ts              — table definitions       │
│  src/zero/*/queries.ts            — all defineQuery()       │
│  src/zero/*/mutators.ts           — all defineMutator()     │
│  src/zero/*/useXxxState.ts        — reactive read hooks     │
│  src/zero/*/useXxxActions.ts      — write hooks + toasts    │
└─────────────────────────────────────────────────────────────┘
```

---

## `src/zero/*/` — Data Layer

The data layer is the **single source of truth** for all database interactions.

### Files per module

| File               | Purpose                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| `table.ts`         | Zero table definitions                                                                                    |
| `schema.ts`        | Zod schemas for mutator argument validation                                                               |
| `queries.ts`       | All `defineQuery()` entries — the **only** place query shapes are declared                                |
| `mutators.ts`      | All `defineMutator()` entries                                                                             |
| `useXxxState.ts`   | Reactive read hooks that wrap queries and return derived state. Also contains focused single-query hooks. |
| `useXxxActions.ts` | Write hooks that wrap mutators, include toasts and error handling                                         |
| `index.ts`         | Barrel re-exports                                                                                         |

### Rules

1. **All query shapes live in `queries.ts`.** Hooks in `useXxxState.ts` consume
   queries via `useQuery(queries.<module>.<name>({...}))`. They never construct inline
   `zero.query.*` chains.

2. **`useZero()` should not appear in `useXxxState.ts`.** If a hook needs the Zero instance for a query,
   the query should be added to `queries.ts` first.

3. **Toasts stay in `useXxxActions.ts`.** Every mutation wrapper provides user feedback via
   `toast.success()` / `toast.error()` and `useTranslation()`. This keeps toast logic
   centralized per domain.

4. **No cross-domain imports within the data layer.** `src/zero/groups/` must not import from
   `src/zero/events/`. Cross-domain composition happens in the Logic Layer (feature hooks).

5. **Zero tables, Zod schemas, and Supabase schemas must stay in sync.** The three schema
   layers represent the same data model and must always match:

   | Layer                  | Location                 | Defines                                                        |
   | ---------------------- | ------------------------ | -------------------------------------------------------------- |
   | Supabase SQL schemas   | `supabase/schemas/*.sql` | Authoritative database tables, columns, types, and constraints |
   | Zero table definitions | `src/zero/*/table.ts`    | Client-side table shape used by the Zero sync engine           |
   | Zod validation schemas | `src/zero/*/schema.ts`   | Runtime validation for mutator arguments                       |

   When a column is added, renamed, removed, or its type changes, **all three layers must be
   updated in the same change**. A mismatch between any two layers (e.g. a column present in
   SQL but missing from `table.ts`, or a Zod schema allowing a field the database doesn't have)
   is considered a bug.

---

## `src/features/*/logic/` — Pure Logic

Plain TypeScript functions with **no React dependency**.

### When to use

- Computations derived from data (e.g. `computeTodoStats(todos, userId)`)
- Data transformations (e.g. `groupRelationshipsByGroup(relationships, type)`)
- Formatting helpers (e.g. `formatRight(right)`)
- Validation logic

### Rules

1. **No hooks, no `use` prefix.** These are plain functions, not React hooks.
2. **No side effects.** No toasts, no API calls, no mutations.
3. **Easily testable.** Every function should be testable with plain unit tests —
   pass data in, assert the return value.

---

## `src/features/*/hooks/` — UI State & Composition Hooks

React hooks that bridge the data layer and the UI layer.

### Two categories

#### 1. Page composition hooks (`useXxxPage.ts`)

One per page component. Aggregates all data fetching, business logic handlers, and local UI state
for a single page.

```ts
// src/features/todos/hooks/useTodosPage.ts
export function useTodosPage() {
  // data
  const { allTodos } = useTodoState({});
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  // derived
  const statusCounts = useMemo(() => computeTodoStats(...), [...]);
  // handlers
  const handleToggleComplete = async (todo: Todo) => { ... };

  return { viewMode, setViewMode, statusCounts, handleToggleComplete, ... };
}
```

#### 2. UI-state hooks (filters, local form state)

Manage local component state that doesn't belong in the data layer.

```ts
// src/features/todos/hooks/useTodoFilters.ts
export function useTodoFilters(todos, userId) {
  const [searchQuery, setSearchQuery] = useState('');
  // ... filtering and sorting logic
  return { searchQuery, setSearchQuery, filteredTodos, ... };
}
```

### Orchestration hooks

Only create an orchestration hook when it **composes multiple data-layer hooks with real
business logic** — for example, creating an entity AND a timeline event AND a notification
in a single operation.

```ts
// src/features/todos/hooks/useTodoMutations.ts  ← qualifies (composes 3 action hooks)
export function useTodoMutations() {
  const todoActions = useTodoActions();
  const commonActions = useCommonActions();
  const notificationActions = useNotificationActions();
  // ...orchestration logic...
}
```

**Do NOT create orchestration hooks** that just re-export a single zero hook.
If a hook adds no logic beyond what the zero hook already provides, delete it
and have callers use the zero hook directly.

```ts
// ❌ Bad — trivial wrapper, adds no value
export function useUserTodos(userId?: string) {
  const state = useTodoState({ userId });
  return { todos: state.userTodos, isLoading: state.isLoading };
}

// ✅ Good — callers use the zero hook directly
import { useTodoState } from '@/zero/todos/useTodoState';
const { userTodos, isLoading } = useTodoState({ userId });
```

---

## `src/features/*/ui/` — Presentational Components

Pure rendering components that receive data and callbacks via **props**.

### Rules

1. **No `useZero()`, no `useQuery()`, no direct zero imports.**
2. **No business logic.** Formatting for display is fine; computing derived
   business state is not.
3. **Receive everything they need via props** — or from a composition hook
   called by the parent page component.

---

## Page Components (`src/features/*/<Page>.tsx`)

Thin shells that connect a composition hook to JSX.

### Pattern

```tsx
export function TodosPage() {
  const { t } = useTranslation();
  const { user, viewMode, setViewMode, filteredTodos, ... } = useTodosPage();

  if (!user) return <LoadingState />;

  return (
    <>
      <TodosHeader viewMode={viewMode} setViewMode={setViewMode} />
      {/* ...rendering only, no useState, no business logic... */}
    </>
  );
}
```

### What belongs here

- The `useXxxPage()` call
- `useTranslation()` for i18n
- Conditional rendering (loading, empty, error states)
- JSX composition of `ui/` components

### What does NOT belong here

- `useState` for non-trivial state (move to the composition hook)
- Business logic functions like `handleToggleComplete` (move to the composition hook)
- Direct data hook calls like `useTodoState()` (move to the composition hook)

---

## Decision Checklist

When adding new code, ask:

| Question                                                | Answer | Put it in                                 |
| ------------------------------------------------------- | ------ | ----------------------------------------- |
| Does it define a query shape?                           | Yes    | `src/zero/*/queries.ts`                   |
| Does it define a mutation?                              | Yes    | `src/zero/*/mutators.ts`                  |
| Does it wrap a query with `useQuery()`?                 | Yes    | `src/zero/*/useXxxState.ts`               |
| Does it wrap a mutation with `zero.mutate()`?           | Yes    | `src/zero/*/useXxxActions.ts`             |
| Is it a pure computation with no React?                 | Yes    | `src/features/*/logic/*.ts`               |
| Does it compose multiple zero hooks with orchestration? | Yes    | `src/features/*/hooks/useXxxMutations.ts` |
| Does it manage local UI state (filters, modals)?        | Yes    | `src/features/*/hooks/*.ts`               |
| Does it aggregate everything for a page?                | Yes    | `src/features/*/hooks/useXxxPage.ts`      |
| Does it render JSX?                                     | Yes    | `src/features/*/ui/*.tsx` or `<Page>.tsx` |

---

## File Naming

| Pattern              | Example               | Layer                 |
| -------------------- | --------------------- | --------------------- |
| `computeXxx.ts`      | `computeTodoStats.ts` | Pure logic            |
| `xxxHelpers.ts`      | `groupWikiHelpers.ts` | Pure logic            |
| `useXxxPage.ts`      | `useTodosPage.ts`     | Page composition hook |
| `useXxxFilters.ts`   | `useTodoFilters.ts`   | UI-state hook         |
| `useXxxMutations.ts` | `useTodoMutations.ts` | Orchestration hook    |
| `useXxxState.ts`     | `useTodoState.ts`     | Data layer read hook  |
| `useXxxActions.ts`   | `useTodoActions.ts`   | Data layer write hook |

---

## Folder Structure per Feature

```
src/features/<feature>/
├── logic/                      # Pure functions (no React)
│   ├── computeXxxStats.ts
│   └── xxxHelpers.ts
├── hooks/                      # React hooks (composition + UI state)
│   ├── useXxxPage.ts           # Page composition hook
│   ├── useXxxFilters.ts        # UI-state hook
│   └── useXxxMutations.ts      # Orchestration hook (only if needed)
├── ui/                         # Presentational components
│   ├── XxxHeader.tsx
│   ├── XxxFilters.tsx
│   └── XxxTabs.tsx
├── types/                      # TypeScript type definitions
│   └── xxx.types.ts
├── utils/                      # Feature-specific utilities
├── XxxPage.tsx                 # Thin page shell
└── XxxDetailPage.tsx           # Thin detail page shell
```
