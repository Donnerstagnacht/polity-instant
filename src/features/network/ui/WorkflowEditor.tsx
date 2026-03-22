'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/ui/dialog'
import { Button } from '@/features/shared/ui/ui/button'
import { Input } from '@/features/shared/ui/ui/input'
import { Label } from '@/features/shared/ui/ui/label'
import { Card, CardContent } from '@/features/shared/ui/ui/card'
import { Plus, Trash2, GripVertical, ArrowRight, Pencil, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/ui/select'
import { formatWorkflowStepSequence, isWorkflowCircular, sortWorkflowSteps } from '../logic/workflowHelpers'
import type { WorkflowWithStepsRow } from '@/zero/network/queries'
import { Badge } from '@/features/shared/ui/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/features/shared/ui/ui/alert-dialog'

interface AvailableGroup {
  id: string
  name: string | null
}

interface DraftStep {
  group_id: string
  label: string | null
}

interface WorkflowEditorProps {
  workflows: WorkflowWithStepsRow[]
  isLoading: boolean
  isEditorOpen: boolean
  editingWorkflow: WorkflowWithStepsRow | null
  draftName: string
  setDraftName: (name: string) => void
  draftDescription: string
  setDraftDescription: (description: string) => void
  draftSteps: DraftStep[]
  availableGroups: AvailableGroup[]
  onOpenNew: () => void
  onOpenEdit: (workflow: WorkflowWithStepsRow) => void
  onClose: () => void
  onAddStep: (groupId: string, label: string | null) => void
  onRemoveStep: (index: number) => void
  onMoveStep: (fromIndex: number, toIndex: number) => void
  onSave: () => void
  onDelete: (workflowId: string) => void
}

export function WorkflowEditor({
  workflows,
  isLoading,
  isEditorOpen,
  editingWorkflow,
  draftName,
  setDraftName,
  draftDescription,
  setDraftDescription,
  draftSteps,
  availableGroups,
  onOpenNew,
  onOpenEdit,
  onClose,
  onAddStep,
  onRemoveStep,
  onMoveStep,
  onSave,
  onDelete,
}: WorkflowEditorProps) {
  const { t } = useTranslation()
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')

  const getGroupName = (groupId: string) => {
    return availableGroups.find(g => g.id === groupId)?.name ?? groupId
  }

  return (
    <div className="space-y-4">
      {/* Workflow list */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {t('features.network.workflows.title', 'Workflows')}
        </h3>
        <Button variant="outline" size="sm" onClick={onOpenNew}>
          <Plus className="mr-2 h-4 w-4" />
          {t('features.network.workflows.create', 'New Workflow')}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">
          {t('common.loading', 'Loading...')}
        </p>
      ) : workflows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t('features.network.workflows.empty', 'No workflows defined yet.')}
        </p>
      ) : (
        <div className="space-y-3">
          {workflows.map(workflow => {
            const sorted = sortWorkflowSteps(workflow.steps)
            return (
            <Card key={workflow.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{workflow.name ?? 'Untitled'}</span>
                      {isWorkflowCircular(workflow) && (
                        <Badge variant="secondary">
                          {t('features.network.workflows.circular', 'Circular')}
                        </Badge>
                      )}
                      <Badge variant="outline">{workflow.steps.length} steps</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onOpenEdit(workflow)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('features.network.workflows.deleteConfirm', 'Delete workflow?')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t(
                              'features.network.workflows.deleteDescription',
                              'This will permanently delete this workflow and all its steps.'
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t('common.cancel', 'Cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(workflow.id)}>
                            {t('common.delete', 'Delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {/* Inline flow chart */}
                {sorted.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1">
                    {sorted.map((step, index) => (
                      <span key={step.id} className="flex items-center gap-1">
                        <span className="inline-flex items-center rounded-md border bg-card px-2.5 py-1 text-xs font-medium shadow-sm">
                          <span className="text-muted-foreground mr-1.5 text-[10px]">{index + 1}</span>
                          {step.group?.name ?? step.label ?? 'Unknown'}
                        </span>
                        {index < sorted.length - 1 && (
                          <ChevronRight className="text-muted-foreground h-3.5 w-3.5 flex-shrink-0" />
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            )
          })}
        </div>
      )}

      {/* Editor dialog */}
      <Dialog open={isEditorOpen} onOpenChange={open => { if (!open) onClose() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingWorkflow
                ? t('features.network.workflows.edit', 'Edit Workflow')
                : t('features.network.workflows.create', 'New Workflow')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'features.network.workflows.editorDescription',
                'Define the ordered sequence of groups in this workflow. Groups can repeat to model circular processes.'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('common.name', 'Name')}</Label>
              <Input
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                placeholder={t('features.network.workflows.namePlaceholder', 'e.g. Legislative Reading Process')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('common.description', 'Description')}</Label>
              <Input
                value={draftDescription}
                onChange={e => setDraftDescription(e.target.value)}
                placeholder={t('features.network.workflows.descriptionPlaceholder', 'Optional description...')}
              />
            </div>

            {/* Steps list */}
            <div className="space-y-2">
              <Label>{t('features.network.workflows.steps', 'Steps')}</Label>
              {draftSteps.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t('features.network.workflows.noSteps', 'Add groups to define the workflow sequence.')}
                </p>
              ) : (
                <div className="space-y-2">
                  {draftSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <GripVertical className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                      <span className="text-muted-foreground text-sm font-medium">{index + 1}.</span>
                      <span className="flex-1 text-sm">{getGroupName(step.group_id)}</span>
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onMoveStep(index, index - 1)}
                        >
                          ↑
                        </Button>
                      )}
                      {index < draftSteps.length - 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onMoveStep(index, index + 1)}
                        >
                          ↓
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onRemoveStep(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add step */}
              <div className="flex items-center gap-2 pt-2">
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t('features.network.workflows.selectGroup', 'Select group...')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name ?? group.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!selectedGroupId}
                  onClick={() => {
                    if (selectedGroupId) {
                      onAddStep(selectedGroupId, null)
                      setSelectedGroupId('')
                    }
                  }}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  {t('common.add', 'Add')}
                </Button>
              </div>
            </div>

            {/* Preview */}
            {draftSteps.length >= 2 && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-muted-foreground mb-1 text-xs font-medium">
                  {t('features.network.workflows.preview', 'Preview')}
                </p>
                <div className="flex flex-wrap items-center gap-1">
                  {draftSteps.map((step, index) => (
                    <span key={index} className="flex items-center gap-1">
                      <span className="text-sm font-medium">{getGroupName(step.group_id)}</span>
                      {index < draftSteps.length - 1 && (
                        <ArrowRight className="text-muted-foreground h-3 w-3" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={onSave} disabled={draftSteps.length < 2}>
              {editingWorkflow
                ? t('common.save', 'Save')
                : t('features.network.workflows.create', 'New Workflow')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
