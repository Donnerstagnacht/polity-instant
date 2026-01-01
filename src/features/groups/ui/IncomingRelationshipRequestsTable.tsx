/**
 * Incoming Relationship Requests Table Component
 *
 * Displays pending incoming relationship requests for group admins to approve or reject.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, Trash2, Network } from 'lucide-react';
import { formatRights } from '@/components/shared/RightFilters';

interface GroupedRequest {
  group: any;
  rights: string[];
  rels: any[];
  type: 'parent' | 'child';
}

interface IncomingRelationshipRequestsTableProps {
  requests: GroupedRequest[];
  onAccept: (relationships: any[]) => void;
  onReject: (relationships: any[]) => void;
}

export function IncomingRelationshipRequestsTable({
  requests,
  onAccept,
  onReject,
}: IncomingRelationshipRequestsTableProps) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Incoming Relationship Requests ({requests.length})
        </CardTitle>
        <CardDescription>Review and approve relationship requests from other groups</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead>Relationship Type</TableHead>
              <TableHead>Rights</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => {
              const createdAt = req.rels[0]?.createdAt
                ? new Date(req.rels[0].createdAt).toLocaleDateString()
                : 'N/A';

              return (
                <TableRow key={req.group.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{req.group.name}</div>
                      {req.group.description && (
                        <div className="text-sm text-muted-foreground">
                          {req.group.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={req.type === 'parent' ? 'default' : 'secondary'}>
                      {req.type === 'parent' ? 'Parent Group' : 'Child Group'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(req.rights)).map((r: string) => (
                        <Badge key={r} variant="outline" className="text-xs">
                          {formatRights([r])}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onAccept(req.rels)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReject(req.rels)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="ml-2">Reject</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
