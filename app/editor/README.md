# Collaborative Editor Feature

## Overview

The collaborative editor at `/editor` allows users to create, edit, and collaborate on rich text documents in real-time.

## Features

### ✅ Implemented

1. **Document Management**

   - Create new documents with custom titles
   - Select from owned or collaborated documents
   - Delete documents (owner only)

2. **Rich Text Editing**

   - Full Plate.js editor with all formatting options
   - Headings, lists, tables, code blocks
   - Images, links, and media
   - Comments and suggestions support

3. **Real-time Collaboration**

   - Auto-save changes after 1 second
   - Live synchronization via InstantDB
   - See active collaborators
   - Cursor position tracking (basic)

4. **Permissions**
   - Owner: Full edit and delete access
   - Collaborators: Edit access (if `canEdit` is true)
   - Viewers: Read-only access

### 🚧 Coming Soon

1. **Enhanced Cursor Sync**

   - Full cursor position visualization
   - Selection highlights
   - Smooth animations

2. **Advanced Collaboration**

   - Operational transformation for conflict resolution
   - Real-time chat in document
   - @mentions
   - Activity feed

3. **Document Sharing**

   - Share dialog with user picker
   - Permission management UI
   - Public link generation
   - Invite via email

4. **Version History**

   - Track all revisions
   - Restore previous versions
   - Compare versions side-by-side

5. **Organization**
   - Folders and collections
   - Advanced search and filtering
   - Tags management
   - Favorites

## Usage

### Creating a Document

1. Navigate to `/editor`
2. Click "New Document" button
3. Enter a title
4. Press Enter or click "Create Document"
5. Start editing!

### Opening a Document

1. Use the document selector dropdown
2. Select any document you own or have access to
3. Document loads with full content
4. Edit and changes auto-save

### Collaborating

1. Share a document (via collaborators table in DB for now)
2. Multiple users can open the same document
3. See active users in the header
4. Changes sync automatically

## Technical Details

### Database Schema

- `documents`: Main document storage
- `documentCollaborators`: Access control
- `documentCursors`: Real-time cursor positions

### Auto-save

Changes are saved automatically 1 second after typing stops. You'll see an "Auto-saving..." indicator when this happens.

### Real-time Sync

The editor uses InstantDB's real-time queries to:

- Load document content
- Update on changes from other users
- Track active collaborators
- Sync cursor positions

## Testing

### Seed Data

Run `npm run seed` to create test documents:

- 2 documents for main test user (test@polity.app)
- 8 documents for other users
- Collaborator relationships
- Sample content

### Manual Testing

1. Log in as test@polity.app
2. Navigate to `/editor`
3. See 2 pre-created documents
4. Create a new document
5. Edit and verify auto-save
6. (Optional) Open in another browser to test real-time sync

## Keyboard Shortcuts

The Plate.js editor supports many shortcuts:

- **Bold**: Cmd/Ctrl + B
- **Italic**: Cmd/Ctrl + I
- **Underline**: Cmd/Ctrl + U
- **Code**: Cmd/Ctrl + E
- **Link**: Cmd/Ctrl + K
- **Heading 1**: Type `#` + Space
- **Heading 2**: Type `##` + Space
- **List**: Type `*` or `-` + Space
- **AI Menu**: Cmd/Ctrl + J or Space (in empty line)
- **Slash Command**: Type `/`

## Troubleshooting

### Changes not saving

- Check your internet connection
- Verify you're logged in
- Ensure you have edit permission

### Can't see other users

- Real-time cursor sync is basic in v1
- Check that other user is actually editing
- Refresh the page

### Document not loading

- Try refreshing the page
- Check browser console for errors
- Verify document still exists in database

## API Reference

### Component Props

```typescript
interface PlateEditorProps {
  initialValue?: any[]; // Initial Slate value
  onChange?: (value: any[]) => void; // Called on content change
  onSelectionChange?: (selection: any) => void; // Called on cursor move
  cursors?: Array<{
    // Other users' cursors
    id: string;
    name: string;
    color: string;
    position: any;
  }>;
}
```

### Database Queries

```typescript
// Get user's documents
const { data } = db.useQuery({
  documents: {
    $: {
      where: {
        or: [{ 'owner.id': userId }, { 'collaborators.user.id': userId }],
      },
    },
    owner: {},
    collaborators: { user: {} },
  },
});

// Get specific document with cursors
const { data } = db.useQuery({
  documents: {
    $: { where: { id: docId } },
    owner: {},
    collaborators: { user: {} },
    cursors: { user: {} },
  },
});
```

## Contributing

When adding features to the editor:

1. Update the schema if needed
2. Run schema push: `npx instant-cli push schema`
3. Update seed data in `scripts/seed.ts`
4. Test with `npm run seed`
5. Update this README

## Support

For issues or questions:

- Check the main documentation in `COLLABORATIVE_EDITOR_IMPLEMENTATION.md`
- Review the Plate.js docs: https://platejs.org
- Check InstantDB docs: https://instantdb.com/docs
