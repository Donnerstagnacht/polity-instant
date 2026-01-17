'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { VideoUpload } from '@/components/shared/VideoUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import db, { tx } from '../../../../db/db';
import type { WorkflowStatus } from '@db/rbac/workflow-constants';
import {
  WORKFLOW_STATUS_METADATA,
  COLLABORATOR_SELECTABLE_STATUSES,
  isEventPhase,
} from '@db/rbac/workflow-constants';

interface AmendmentEditContentProps {
  amendmentId: string;
  amendment: any;
  collaborators: any[];
  currentUserId: string;
  isLoading: boolean;
}

export function AmendmentEditContent({
  amendmentId,
  amendment,
  collaborators,
  currentUserId,
  isLoading,
}: AmendmentEditContentProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    code: '',
    imageURL: '',
    videoURL: '',
    videoThumbnailURL: '',
    status: 'Drafting',
    workflowStatus: 'collaborative_editing' as WorkflowStatus,
    autoCloseVoting: false,
    date: '',
    supporters: 0,
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (amendment) {
      setFormData({
        title: amendment.title || '',
        subtitle: amendment.subtitle || '',
        code: amendment.code || '',
        imageURL: amendment.imageURL || '',
        videoURL: amendment.videoURL || '',
        videoThumbnailURL: amendment.videoThumbnailURL || '',
        status: amendment.status || 'Drafting',
        workflowStatus:
          (amendment.workflowStatus as WorkflowStatus) || 'collaborative_editing',
        autoCloseVoting: false, // Will be loaded from document settings
        date: amendment.date || new Date().toLocaleDateString(),
        supporters: amendment.supporters || 0,
        tags: Array.isArray(amendment.tags) ? amendment.tags : [],
      });
    }
  }, [amendment]);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!amendment) {
        toast.error('No amendment data to update');
        return;
      }

      await db.transact([
        tx.amendments[amendmentId].update({
          title: formData.title,
          subtitle: formData.subtitle,
          code: formData.code,
          imageURL: formData.imageURL,
          videoURL: formData.videoURL,
          videoThumbnailURL: formData.videoThumbnailURL,
          status: formData.status,
          workflowStatus: formData.workflowStatus,
          date: formData.date,
          supporters: formData.supporters,
          tags: formData.tags,
        }),
      ]);

      toast.success('Amendment updated successfully');

      setTimeout(() => {
        router.push(`/amendment/${amendmentId}`);
      }, 500);
    } catch (error) {
      toast.error('Failed to update amendment');
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading amendment data...</p>
      </div>
    );
  }

  if (!amendment) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold">Amendment not found</p>
          <p className="text-muted-foreground">No amendment data exists for this ID</p>
          <div className="mt-6">
            <Button onClick={() => router.push(`/`)} variant="default">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Amendment</h1>
        <p className="text-muted-foreground">Update amendment information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ImageUpload
          currentImage={formData.imageURL}
          onImageChange={(url: string) => setFormData({ ...formData, imageURL: url })}
          label="Amendment Image"
          description="Upload an amendment image or provide a URL"
        />

        <VideoUpload
          currentVideo={formData.videoURL}
          currentThumbnail={formData.videoThumbnailURL}
          onVideoChange={(url: string) => setFormData({ ...formData, videoURL: url })}
          label="Amendment Video"
          description="Upload a video file or provide a URL (max 100MB)"
        />

        {formData.videoURL && (
          <ImageUpload
            currentImage={formData.videoThumbnailURL}
            onImageChange={(url: string) =>
              setFormData({ ...formData, videoThumbnailURL: url })
            }
            label="Video Thumbnail"
            description="Upload a thumbnail image for the video (optional)"
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Amendment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Amendment title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Brief description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Amendment Code/Text</Label>
              <Textarea
                id="code"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="Enter the full amendment text..."
                rows={10}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & Metadata</CardTitle>
            <CardDescription>Track the amendment progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={value => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Drafting">Drafting</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Passed">Passed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                placeholder="e.g., March 15, 2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supporters">Supporters</Label>
              <Input
                id="supporters"
                type="number"
                min="0"
                value={formData.supporters}
                onChange={e =>
                  setFormData({ ...formData, supporters: parseInt(e.target.value, 10) || 0 })
                }
                placeholder="Number of supporters"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Einstellungen</CardTitle>
            <CardDescription>
              Konfigurieren Sie den Workflow-Status und Abstimmungseinstellungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workflowStatus">Workflow Status</Label>
              <Select
                value={formData.workflowStatus}
                onValueChange={value =>
                  setFormData({ ...formData, workflowStatus: value as WorkflowStatus })
                }
                disabled={isEventPhase(formData.workflowStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Workflow Status wählen" />
                </SelectTrigger>
                <SelectContent>
                  {COLLABORATOR_SELECTABLE_STATUSES.map(status => {
                    const config = WORKFLOW_STATUS_METADATA[status];
                    return (
                      <SelectItem key={status} value={status}>
                        {config.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {WORKFLOW_STATUS_METADATA[formData.workflowStatus].description}
              </p>
              {isEventPhase(formData.workflowStatus) && (
                <p className="text-xs text-amber-600">
                  ⚠️ Dieser Status wird durch Event-Organizers gesteuert und kann hier nicht
                  geändert werden.
                </p>
              )}
            </div>

            {formData.workflowStatus === 'internal_voting' && (
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoCloseVoting">Automatisches Schließen von Abstimmungen</Label>
                    <p className="text-xs text-muted-foreground">
                      Abstimmungen werden automatisch nach Ablauf des Zeitintervalls geschlossen
                    </p>
                  </div>
                  <Switch
                    id="autoCloseVoting"
                    checked={formData.autoCloseVoting}
                    onCheckedChange={checked =>
                      setFormData({ ...formData, autoCloseVoting: checked })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.autoCloseVoting
                    ? '✓ Abstimmungen werden automatisch geschlossen'
                    : '○ Abstimmungen erfordern manuelle Bestätigung durch Organizers'}
                </p>
              </div>
            )}

            {amendment?.currentEventId && (
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  📅 Amendment befindet sich in Event-Phase
                </p>
                <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                  Workflow wird durch Event {amendment.currentEventId} gesteuert
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Add tags to categorize this amendment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/amendment/${amendmentId}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
