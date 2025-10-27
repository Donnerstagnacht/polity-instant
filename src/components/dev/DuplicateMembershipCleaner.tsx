'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import db, { tx } from '../../../db';

/**
 * Temporary utility component to clean up duplicate memberships
 * Add this to any page and navigate to it to see and clean duplicates
 */
export function DuplicateMembershipCleaner() {
  const { user } = db.useAuth();
  const userId = user?.id || 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7';
  const groupId = 'f6f136ee-2c23-43c9-acd3-eb0ac355d197';

  // Query memberships for this specific user/group
  const { data, isLoading } = db.useQuery({
    groupMemberships: {
      $: {
        where: {
          'user.id': userId,
          'group.id': groupId,
        },
      },
      group: {},
    },
  });

  const memberships = data?.groupMemberships || [];

  const handleDelete = async (membershipId: string) => {
    if (confirm('Are you sure you want to delete this membership?')) {
      try {
        await db.transact([tx.groupMemberships[membershipId].delete()]);
        alert('Membership deleted successfully!');
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete membership: ' + error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Duplicate Membership Cleaner</CardTitle>
        <CardDescription>
          Found {memberships.length} membership(s) for user {userId.substring(0, 8)}... in group{' '}
          {groupId.substring(0, 8)}...
        </CardDescription>
      </CardHeader>
      <CardContent>
        {memberships.length === 0 && (
          <p className="text-muted-foreground">No memberships found for this combination.</p>
        )}

        {memberships.length === 1 && (
          <div className="text-green-600">
            ✅ No duplicates! You have exactly one membership as expected.
          </div>
        )}

        {memberships.length > 1 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
              ⚠️ Found {memberships.length} memberships. You should only have one!
            </div>

            <div className="space-y-3">
              {memberships.map((m: any) => {
                const isAdmin = m.status === 'admin' || m.role === 'admin';
                const shouldKeep = isAdmin;

                return (
                  <div
                    key={m.id}
                    className={`rounded-lg border p-4 ${shouldKeep ? 'border-green-500 bg-green-50' : 'border-red-300 bg-red-50'}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold">
                        {shouldKeep ? '✓ Keep This' : '✗ Delete This'}
                      </span>
                      {!shouldKeep && (
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(m.id)}>
                          Delete
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Status:</span> {m.status}
                      </div>
                      <div>
                        <span className="font-medium">Role:</span> {m.role}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">ID:</span>{' '}
                        <code className="text-xs">{m.id}</code>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(m.createdAt).toLocaleString()}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Group:</span> {m.group?.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
