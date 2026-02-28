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
} from '@/features/shared/ui/ui/dialog';
import { Button } from '@/features/shared/ui/ui/button';
import { Label } from '@/features/shared/ui/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/ui/select';
import { Link, Check } from 'lucide-react';
import { cn } from '@/features/shared/utils/utils';
import { useGroupState } from '@/zero/groups/useGroupState';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { useTranslation } from '@/features/shared/hooks/use-translation';
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

const RIGHTS_KEYS: { value: WithRight; labelKey: string; descKey: string }[] = [
  {
    value: 'informationRight',
    labelKey: 'common.network.rightInfo',
    descKey: 'common.network.rightInfoDesc',
  },
  {
    value: 'amendmentRight',
    labelKey: 'common.network.rightAmendment',
    descKey: 'common.network.rightAmendmentDesc',
  },
  {
    value: 'rightToSpeak',
    labelKey: 'common.network.rightSpeak',
    descKey: 'common.network.rightSpeakDesc',
  },
  {
    value: 'activeVotingRight',
    labelKey: 'common.network.rightActiveVoting',
    descKey: 'common.network.rightActiveVotingDesc',
  },
  {
    value: 'passiveVotingRight',
    labelKey: 'common.network.rightPassiveVoting',
    descKey: 'common.network.rightPassiveVotingDesc',
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
  const { createRelationship, deleteRelationship } = useGroupActions();
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
  const { searchResults: availableGroupsRaw } = useGroupState({ includeSearch: true });
  const availableGroups = (availableGroupsRaw || []).filter((g: any) => g.id !== currentGroupId);

  // Fetch existing relationships to Handle Syncing (avoid duplicates, handle removals)
  const shouldQuery = !allRelationships && !!selectedGroupId && open;
  
  // groups.hierarchy returns relationships for a group - filter for specific pair client-side
  const { relationships: hierarchyRaw } = useGroupState(
    { groupId: currentGroupId }
  );

  const isLoadingQuery = shouldQuery ? !hierarchyRaw : false;

  const relevantRelationships = allRelationships 
      ? allRelationships.filter(rel => 
          (rel.parentGroup?.id === currentGroupId && rel.childGroup?.id === selectedGroupId) ||
          (rel.parentGroup?.id === selectedGroupId && rel.childGroup?.id === currentGroupId)
        )
      : ((hierarchyRaw || []) as any[]).filter((rel: any) =>
          (rel.group_id === currentGroupId && rel.related_group_id === selectedGroupId) ||
          (rel.group_id === selectedGroupId && rel.related_group_id === currentGroupId)
        );

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
              const relationshipId = crypto.randomUUID();
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
                // Group relationship creation via raw zero.mutate (no dedicated mutator layer)
                transactions.push({
                  type: 'createRelationship' as const,
                  id: relationshipId,
                  data: relationshipData,
                  parentGroupId: selectedGroupId,
                  childGroupId: currentGroupId,
                });
              } else {
                transactions.push({
                  type: 'createRelationship' as const,
                  id: relationshipId,
                  data: relationshipData,
                  parentGroupId: currentGroupId,
                  childGroupId: selectedGroupId,
                });
              }
          }
      }

      // 2. Removals
      for (const rel of currentDirectionRels) {
          if (!selectedRights.has(rel.withRight as WithRight)) {
              // Remove this relationship
              // Group relationship deletion via raw zero.mutate
              transactions.push({
                type: 'deleteRelationship' as const,
                id: rel.id,
              });
          }
      }

      if (transactions.length > 0) {
          for (const tx of transactions) {
            if (tx.type === 'createRelationship') {
              await createRelationship({
                id: tx.id,
                group_id: tx.parentGroupId,
                related_group_id: tx.childGroupId,
                relationship_type: relationshipType,
                with_right: tx.data.withRight,
                status: tx.data.status,
                initiator_group_id: tx.data.initiatorGroupId,
              });
            } else if (tx.type === 'deleteRelationship') {
              await deleteRelationship({ id: tx.id });
            }
          }
          toast.success(isEditMode ? t('common.network.relationshipsUpdated') : t('common.network.relationshipsCreated'));
      } else {
          toast.info(t('common.network.noChanges'));
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
      toast.error(t('common.network.relationshipSaveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRelationshipLabel = () => {
    if (relationshipType === 'isParent') {
      return t('common.network.asParentGroup');
    } else {
      return t('common.network.asChildGroup');
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
          <DialogTitle>{isEditMode ? t('common.network.editRelationship') : t('common.network.linkGroupTitle')}</DialogTitle>
          <DialogDescription>
            {isEditMode 
                ? t('common.network.editRelationshipDescription', { groupName: availableGroups.find(g => g.id === selectedGroupId)?.name || 'Gruppe' })
                : t('common.network.linkGroupDescription', { groupName: currentGroupName })
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Group Selection */}
          <div className="grid gap-2">
            <Label htmlFor="group">{t('common.network.selectGroup')}</Label>
            <Select 
                value={selectedGroupId} 
                onValueChange={setSelectedGroupId}
                disabled={isEditMode}
            >
              <SelectTrigger id="group">
                <SelectValue placeholder={t('common.network.selectGroupPlaceholder')} />
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
            <Label htmlFor="relationshipType">{t('common.network.relationshipTypeLabel')}</Label>
            <Select
              value={relationshipType}
              onValueChange={value => setRelationshipType(value as RelationshipType)}
              disabled={isEditMode} 
            >
              <SelectTrigger id="relationshipType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="isParent">{t('common.network.asParentGroup')}</SelectItem>
                <SelectItem value="isChild">{t('common.network.asChildGroup')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{getRelationshipLabel()}</p>
          </div>

          {/* Rights Selection */}
          <div className="grid gap-3">
            <Label>{t('common.network.selectRights')}</Label>
            <div className="grid gap-2">
              {RIGHTS_KEYS.map(right => (
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
                    <div className="font-medium">{t(right.labelKey)}</div>
                    <div className="text-sm text-muted-foreground">{t(right.descKey)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            {t('common.actions.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedGroupId || isSubmitting || isLoadingQuery}
          >
            {isSubmitting
              ? t('common.network.saving')
              : isEditMode ? t('common.network.saveChanges') : t('common.actions.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
