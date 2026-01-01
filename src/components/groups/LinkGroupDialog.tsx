'use client';

import { useState, useEffect } from 'react';
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
import db from '../../../db/db';
import { id } from '@instantdb/react';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from 'sonner';

interface LinkGroupDialogProps {
  currentGroupId: string;
  currentGroupName: string;
  // Edit mode props
  initialTargetGroupId?: string;
  initialRelationshipType?: 'parent' | 'child'; // 'parent' means target is parent
  initialRights?: string[];
  trigger?: React.ReactNode;
  // Optimistic/Parent Data
  allRelationships?: any[];
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

export function LinkGroupDialog({ 
  currentGroupId, 
  currentGroupName,
  initialTargetGroupId,
  initialRelationshipType,
  initialRights,
  trigger,
  allRelationships
}: LinkGroupDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  
  const isEditMode = !!initialTargetGroupId;

  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialTargetGroupId || '');
  // Map 'parent' -> 'isParent', 'child' -> 'isChild'
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(
      initialRelationshipType === 'parent' ? 'isParent' : 
      initialRelationshipType === 'child' ? 'isChild' : 'isParent'
  );
  
  const [selectedRights, setSelectedRights] = useState<Set<WithRight>>(
      initialRights ? new Set(initialRights as WithRight[]) : new Set()
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all groups (needed for name info if not passed, and for selector)
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

  // Fetch existing relationships to Handle Syncing (avoid duplicates, handle removals)
  const shouldQuery = !allRelationships && !!selectedGroupId && open;
  
  const queryResult = db.useQuery(
      shouldQuery ? {
        groupRelationships: {
            parentGroup: {},
            childGroup: {},
            $: {
                where: {
                   or: [
                       { 'parentGroup.id': currentGroupId, 'childGroup.id': selectedGroupId },
                       { 'parentGroup.id': selectedGroupId, 'childGroup.id': currentGroupId }
                   ]
                }
            }
        }
      } : null
  );

  const existingRelsData = queryResult?.data;
  const isLoadingQuery = shouldQuery ? (queryResult?.isLoading ?? true) : false;

  const relevantRelationships = allRelationships 
      ? allRelationships.filter(rel => 
          (rel.parentGroup?.id === currentGroupId && rel.childGroup?.id === selectedGroupId) ||
          (rel.parentGroup?.id === selectedGroupId && rel.childGroup?.id === currentGroupId)
        )
      : (existingRelsData?.groupRelationships || []);

  // Reset state when opening/closing or props change
  useEffect(() => {
     if (open) {
         if (isEditMode && initialTargetGroupId) {
             setSelectedGroupId(initialTargetGroupId);
             setRelationshipType(initialRelationshipType === 'parent' ? 'isParent' : 'isChild');
             setSelectedRights(initialRights ? new Set(initialRights as WithRight[]) : new Set());
         }
     }
  }, [open, isEditMode, initialTargetGroupId, initialRelationshipType, initialRights]);


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
    if (!selectedGroupId) return; // Rights can be empty if we want to remove all? Assume valid to have 0 rights (removes relationship)

    setIsSubmitting(true);
    try {
      const now = new Date();
      const transactions = [];

      // Logic:
      // 1. Identify which rights are currently active in DB for this specific direction (Parent/Child configuration)
      // 2. Add missing rights
      // 3. Remove unchecked rights

      // Filter existing relationships to match the CURRENT direction selection
      const currentDirectionRels = relevantRelationships.filter((rel: any) => {
          if (relationshipType === 'isParent') {
              // Selected is Parent, Current is Child
              return rel.parentGroup?.id === selectedGroupId && rel.childGroup?.id === currentGroupId;
          } else {
               // Current is Parent, Selected is Child
               return rel.parentGroup?.id === currentGroupId && rel.childGroup?.id === selectedGroupId;
          }
      });
      
      const existingRightsSet = new Set(currentDirectionRels.map((r: any) => r.withRight));

      // 1. Additions
      for (const right of selectedRights) {
          if (!existingRightsSet.has(right)) {
              // Create new
              const relationshipId = id();
              const relationshipData: any = {
                relationshipType, // This string is stored in DB? Or just used for structure? Seeder uses 'isParent'/'isChild' string? Let's check. 
                // Seeder uses 'groupRelationships' entries, usually just link. 
                // Wait, schemas usually don't have 'relationshipType' string field if structure defines it.
                // Checking previous `GroupNetworkFlow` code, it reads `rel.withRight`.
                // Converting `relationshipType` state to DB structure:
                // If isParent: parent=Selected, child=Current
                // If isChild: parent=Current, child=Selected
                // The DB object usually stores `withRight`.
                withRight: right,
                createdAt: now,
                updatedAt: now,
                status: 'requested', 
                initiatorGroupId: currentGroupId,
              };

              if (relationshipType === 'isParent') {
                transactions.push(
                  db.tx.groupRelationships[relationshipId]
                    .update(relationshipData)
                    .link({ parentGroup: selectedGroupId, childGroup: currentGroupId })
                );
              } else {
                transactions.push(
                  db.tx.groupRelationships[relationshipId]
                    .update(relationshipData)
                    .link({ parentGroup: currentGroupId, childGroup: selectedGroupId })
                );
              }
          }
      }

      // 2. Removals
      for (const rel of currentDirectionRels) {
          if (!selectedRights.has(rel.withRight as WithRight)) {
              // Remove this relationship
              transactions.push(db.tx.groupRelationships[rel.id].delete());
          }
      }

      if (transactions.length > 0) {
          await db.transact(transactions);
          toast.success(isEditMode ? 'Beziehungen aktualisiert.' : 'Beziehungen erstellt.');
      } else {
          toast.info('Keine Änderungen vorgenommen.');
      }

      if (!isEditMode) {
        // Reset only if create mode
        setSelectedGroupId('');
        setRelationshipType('isParent');
        setSelectedRights(new Set());
      }
      setOpen(false);

    } catch (error) {
      console.error('Error managing group relationships:', error);
      toast.error('Fehler beim Speichern der Beziehungen.');
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

  console.log('LinkGroupDialog Debug:', {
    selectedGroupId,
    isSubmitting,
    isLoadingQuery,
    shouldQuery,
    allRelationships: !!allRelationships,
    buttonDisabled: !selectedGroupId || isSubmitting || isLoadingQuery
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
            <Button variant="outline">
            <Link className="mr-2 h-4 w-4" />
            {t('components.actionBar.linkGroup')}
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Beziehung bearbeiten' : 'Gruppe verknüpfen'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
                ? `Rechte für "${availableGroups.find(g => g.id === selectedGroupId)?.name || 'Gruppe'}" verwalten.`
                : `Verknüpfen Sie "${currentGroupName}" mit einer anderen Gruppe.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Group Selection */}
          <div className="grid gap-2">
            <Label htmlFor="group">Gruppe auswählen</Label>
            <Select 
                value={selectedGroupId} 
                onValueChange={setSelectedGroupId}
                disabled={isEditMode}
            >
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
              disabled={isEditMode} 
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
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedGroupId || isSubmitting || isLoadingQuery}
          >
            {isSubmitting
              ? 'Speichern...'
              : isEditMode ? 'Änderungen speichern' : 'Erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
