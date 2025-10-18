# TanStack Router to Next.js Migration Summary

This document outlines the migration from TanStack Router to Next.js App Router.

## What's Been Done ✅

### 1. Package.json Updates

- ✅ Removed TanStack Router dependencies (`@tanstack/react-router`, `@tanstack/react-router-devtools`, `@tanstack/router-plugin`)
- ✅ Added Next.js dependencies (`next`, `@types/node`, `eslint-config-next`, `postcss`)
- ✅ Updated Tailwind CSS to v3 compatible version
- ✅ Updated build scripts to use Next.js commands

### 2. Configuration Files

- ✅ Created `next.config.mjs` with webpack configuration
- ✅ Created `postcss.config.js` for Tailwind CSS
- ✅ Updated `tsconfig.json` for Next.js
- ✅ Created `next-env.d.ts` for Next.js types
- ✅ Updated `tailwind.config.js` for Next.js compatibility

### 3. App Directory Structure

- ✅ Created `app/` directory with Next.js App Router structure
- ✅ Created `app/layout.tsx` (root layout)
- ✅ Created `app/client-layout.tsx` (client-side layout with navigation)
- ✅ Created `app/globals.css` with existing styles
- ✅ Created basic pages: `page.tsx`, `dashboard/page.tsx`, `projects/page.tsx`, `settings/page.tsx`

### 4. User Route with Search Parameters

- ✅ Created `app/user/[id]/page.tsx` with URL search parameters support
- ✅ Updated `UserWiki` component to accept new props structure
- ✅ Preserved search parameters functionality (`blogs`, `groups`, `amendments`)

### 5. i18n Setup

- ✅ Copied i18n configuration to `app/i18n/`
- ✅ Maintained existing translation structure

### 6. Cleanup

- ✅ Removed `vite.config.ts`
- ✅ Removed `src/main.tsx`
- ✅ Removed `src/routeTree.gen.ts`
- ✅ Removed `index.html`

## What Still Needs to Be Done ❌

### 1. Navigation System Updates

The navigation system still uses TanStack Router hooks and needs to be updated:

**Files to Update:**

- `src/navigation/state/useNavigation.tsx` - Replace `useRouter` from TanStack with Next.js
- `src/navigation/command-dialog.tsx` - Update router usage
- `src/navigation/nav-items/nav-item-list.tsx` - Update router usage
- `src/navigation/nav-items/nav-items-authenticated.tsx` - Remove TanStack router types

### 2. Route Components Migration

All route components in `src/routes/` need to be converted to Next.js pages:

**Priority Routes:**

- `src/routes/calendar.tsx` → `app/calendar/page.tsx`
- `src/routes/settings.tsx` → `app/settings/page.tsx` (already created basic version)
- `src/routes/projects.tsx` → `app/projects/page.tsx` (already created basic version)
- `src/routes/notifications.tsx` → `app/notifications/page.tsx`
- `src/routes/messages.tsx` → `app/messages/page.tsx`
- `src/routes/files.tsx` → `app/files/page.tsx`
- `src/routes/flow.tsx` → `app/flow/page.tsx`
- `src/routes/groups.tsx` → `app/groups/page.tsx`
- `src/routes/home.tsx` → `app/home/page.tsx`

**User Sub-routes:**

- `src/routes/user/$id/room.tsx` → `app/user/[id]/room/page.tsx`
- `src/routes/user/$id/network.tsx` → `app/user/[id]/network/page.tsx`
- All settings sub-routes in `src/routes/user/$id/settings/`

**Dashboard Sub-routes:**

- All routes in `src/routes/dashboard/`

**Projects Sub-routes:**

- All routes in `src/routes/projects/`

### 3. Link Component Updates

Replace all TanStack Router `Link` components with Next.js `Link`:

- `src/routes/projects.tsx`
- `src/routes/index.tsx` (this content should be moved to `app/page.tsx`)
- Any other components using TanStack Router Link

### 4. Navigation Hooks and Utilities

Update navigation-related code:

- Replace `useRouter()` from TanStack with `useRouter()` from `next/navigation`
- Replace `useNavigate()` with Next.js navigation methods
- Update any route matching logic

### 5. Search Parameters Handling

While basic search parameters are set up for the user route, ensure all components that use search parameters are updated:

- Components using `useSearch()` from TanStack Router
- Components using `useParams()` from TanStack Router

## Migration Commands

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Next Steps for Developer

1. **Update Navigation System**: Start with `src/navigation/state/useNavigation.tsx`
2. **Convert Route Components**: Begin with high-priority routes
3. **Test Search Parameters**: Ensure user route search params work correctly
4. **Update Link Components**: Replace all TanStack Router Links
5. **Test Build**: Ensure everything builds without errors

## Important Notes

- ✅ **Search Parameters Preserved**: The user route maintains URL search parameter functionality
- ✅ **Styling Preserved**: All existing Tailwind CSS and component styles are maintained
- ✅ **State Management**: Zustand and other state management is unchanged
- ✅ **Component Library**: All PlateJS, Radix UI, and other components remain unchanged
- ✅ **i18n**: Internationalization setup is preserved
