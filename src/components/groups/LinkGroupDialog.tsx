'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link, Check } from 'lucide-react';
import { cn } from '@/utils/utils';
import db from '../../../db';
import { id } from '@instantdb/react';

interface LinkGroupDialogProps {
  currentGroupId: string;
  currentGroupName: string;
}

type RelationshipType = 'isParent' | 'isChild';
type WithRight =
  | 'informationRight'
  | 'amendmentRight'
  | 'rightToSpeak'
  | 'activeVotingRight'
  | 'passiveVotingRight';

const RIGHTS: { value: WithRight; label: string; description: string }[] = [
  {
    value: 'informationRight',
    label: 'Informationsrecht',
    description: 'Recht auf Information und Einsicht',
  },
  {
    value: 'amendmentRight',
    label: 'Antragsrecht',
    description: 'Recht, Anträge zu stellen',
  },
  {
    value: 'rightToSpeak',
    label: 'Rederecht',
    description: 'Recht, in Sitzungen zu sprechen',
  },
  {
    value: 'activeVotingRight',
    label: 'Aktives Stimmrecht',
    description: 'Recht, an Abstimmungen teilzunehmen',
  },
  {
    value: 'passiveVotingRight',
    label: 'Passives Stimmrecht',
    description: 'Recht, gewählt zu werden',
  },
];

export function LinkGroupDialog({ currentGroupId, currentGroupName }: LinkGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('isParent');
  const [selectedRights, setSelectedRights] = useState<Set<WithRight>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all groups except the current one
  const { data: groupsData } = db.useQuery({
    groups: {
      $: {
        where: {
          id: { $ne: currentGroupId },
        },
      },
    },
  });

  const availableGroups = groupsData?.groups || [];

  const toggleRight = (right: WithRight) => {
    const newRights = new Set(selectedRights);
    if (newRights.has(right)) {
      newRights.delete(right);
    } else {
      newRights.add(right);
    }
    setSelectedRights(newRights);
  };

  const handleSubmit = async () => {
    if (!selectedGroupId || selectedRights.size === 0) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const transactions = [];

      // Create one relationship for each selected right
      for (const right of selectedRights) {
        const relationshipId = id();
        const relationshipData: any = {
          relationshipType,
          withRight: right,
          createdAt: now,
          updatedAt: now,
        };

        // Link the parent and child groups based on relationship type
        if (relationshipType === 'isParent') {
          // Selected group is parent, current group is child
          transactions.push(
            db.tx.groupRelationships[relationshipId]
              .update(relationshipData)
              .link({ parentGroup: selectedGroupId, childGroup: currentGroupId })
          );
        } else {
          // Current group is parent, selected group is child
          transactions.push(
            db.tx.groupRelationships[relationshipId]
              .update(relationshipData)
              .link({ parentGroup: currentGroupId, childGroup: selectedGroupId })
          );
        }
      }

      await db.transact(transactions);

      // Reset form and close dialog
      setSelectedGroupId('');
      setRelationshipType('isParent');
      setSelectedRights(new Set());
      setOpen(false);
    } catch (error) {
      console.error('Error creating group relationships:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRelationshipLabel = () => {
    if (relationshipType === 'isParent') {
      return 'Als übergeordnete Gruppe';
    } else {
      return 'Als untergeordnete Gruppe';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Link className="mr-2 h-4 w-4" />
          Gruppe verknüpfen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gruppe verknüpfen</DialogTitle>
          <DialogDescription>
            Verknüpfen Sie "{currentGroupName}" mit einer anderen Gruppe und wählen Sie die Rechte
            aus, die übertragen werden sollen.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Group Selection */}
          <div className="grid gap-2">
            <Label htmlFor="group">Gruppe auswählen</Label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger id="group">
                <SelectValue placeholder="Gruppe auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {availableGroups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Relationship Type */}
          <div className="grid gap-2">
            <Label htmlFor="relationshipType">Beziehungstyp</Label>
            <Select
              value={relationshipType}
              onValueChange={value => setRelationshipType(value as RelationshipType)}
            >
              <SelectTrigger id="relationshipType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="isParent">Als übergeordnete Gruppe</SelectItem>
                <SelectItem value="isChild">Als untergeordnete Gruppe</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{getRelationshipLabel()}</p>
          </div>

          {/* Rights Selection */}
          <div className="grid gap-3">
            <Label>Rechte auswählen (mehrere möglich)</Label>
            <div className="grid gap-2">
              {RIGHTS.map(right => (
                <button
                  key={right.value}
                  type="button"
                  onClick={() => toggleRight(right.value)}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent',
                    selectedRights.has(right.value) && 'border-primary bg-primary/5'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                      selectedRights.has(right.value)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground'
                    )}
                  >
                    {selectedRights.has(right.value) && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{right.label}</div>
                    <div className="text-sm text-muted-foreground">{right.description}</div>
                  </div>
                </button>
              ))}
            </div>
            {selectedRights.size > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedRights.size} {selectedRights.size === 1 ? 'Recht' : 'Rechte'} ausgewählt
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedGroupId || selectedRights.size === 0 || isSubmitting}
          >
            {isSubmitting
              ? 'Wird verknüpft...'
              : `${selectedRights.size} ${selectedRights.size === 1 ? 'Beziehung' : 'Beziehungen'} erstellen`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
