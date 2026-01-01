/**
 * Outgoing Relationship Requests Table Component
 *
 * Displays pending outgoing relationship requests that can be withdrawn.
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
import { Trash2, Send } from 'lucide-react';
import { formatRights } from '@/components/shared/RightFilters';

interface GroupedRequest {
  group: any;
  rights: string[];
  rels: any[];
  type: 'parent' | 'child';
}

interface OutgoingRelationshipRequestsTableProps {
  requests: GroupedRequest[];
  onCancel: (relationships: any[]) => void;
}

export function OutgoingRelationshipRequestsTable({
  requests,
  onCancel,
}: OutgoingRelationshipRequestsTableProps) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Outgoing Relationship Requests ({requests.length})
        </CardTitle>
        <CardDescription>
          Relationship requests sent to other groups awaiting approval
        </CardDescription>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancel(req.rels)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-2">Cancel Request</span>
                    </Button>
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
