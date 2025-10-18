# Instant Database Setup for Polity

This directory contains the Instant database configuration for the Polity application.

## Files

- `instant.schema.ts` - TypeScript schema definition with entities and relationships
- `instant.perms.ts` - Permission rules for data access control
- `db.ts` - Main database client and query/mutation helpers
- `schema-for-dashboard.json` - JSON schema format for copy/paste into Instant Dashboard

## Installation

First, install the Instant React package:

```bash
npm install @instantdb/react
```

## Environment Setup

Add your Instant app ID to your environment variables:

```bash
# .env.local
NEXT_PUBLIC_INSTANT_APP_ID=869f3247-fd73-44fe-9b5f-caa541352f89
```

## Schema Overview

### Entities

1. **$users** - User profiles and authentication
   - email, name, avatar, bio, handle
   - isActive, createdAt, updatedAt, lastSeenAt
2. **magicCodes** - Passwordless authentication codes
   - email, code, createdAt, expiresAt, usedAt
3. **groups** - User groups/communities
   - name, description, isPublic, memberCount
   - createdAt, updatedAt
4. **groupMemberships** - Many-to-many user-group relationships
   - role (owner/admin/member), joinedAt
5. **$files** - File storage (built-in Instant entity)
   - path, url

### Relationships

- Users can own multiple groups
- Users can be members of multiple groups through memberships
- Groups have many memberships
- Built-in user linking for guest/primary user relationships

## Permission Rules

- **Default**: Deny all access unless explicitly allowed
- **Users**: Can view others, update/delete only their own profile
- **Magic Codes**: Anyone can create, no one can view (security)
- **Groups**: Public groups visible to all, private groups only to members
- **Memberships**: Users can join/leave, owners can manage all members
- **Files**: Authenticated users can create/view

## Usage

```typescript
import db, { queries, mutations } from '@/lib/instant/db';

// Get current user
const { user, isLoading } = queries.users.me();

// Get public groups
const { data: groups } = queries.groups.public();

// Create a new group
await mutations.groups.create(userId, {
  name: 'My Group',
  description: 'A great group',
  isPublic: true,
});
```

## Development Workflow

### Option 1: Using TypeScript Schema (Recommended)

1. **Define Schema**: Modify `instant.schema.ts` to add/change entities
2. **Set Permissions**: Update `instant.perms.ts` for access control
3. **Push to Instant**: Use the Instant CLI to apply changes
4. **Update Helpers**: Add new queries/mutations to `db.ts` as needed

### Option 2: Using Dashboard

1. **Copy Schema**: Copy contents from `schema-for-dashboard.json`
2. **Paste in Dashboard**: Go to Instant Dashboard → Schema tab
3. **Set Permissions**: Copy from `instant.perms.ts` and apply in Dashboard
4. **Update Code**: Modify `db.ts` for new queries/mutations

## CLI Commands

If using the Instant CLI:

```bash
# Push schema changes
instant-cli push-schema --app-id 869f3247-fd73-44fe-9b5f-caa541352f89

# Push permission changes
instant-cli push-perms --app-id 869f3247-fd73-44fe-9b5f-caa541352f89
```

## Security Notes

- Magic codes expire after 15 minutes
- Permissions are enforced at the database level
- File uploads should implement additional validation
- Rate limiting should be implemented for magic code creation
- Production apps should validate magic codes server-side
