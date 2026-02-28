import { useState } from 'react';
import { PageWrapper } from '@/layout/page-wrapper';
import { Card } from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Button } from '@/features/shared/ui/ui/button';
import { Label } from '@/features/shared/ui/ui/label';
import { Textarea } from '@/features/shared/ui/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/features/shared/ui/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/ui/dialog';
import { Input } from '@/features/shared/ui/ui/input';
import { useStatementDetail } from '@/features/statements/hooks/useStatementDetail';
import { VoteButtons } from '@/features/shared/ui/voting/VoteButtons';
import { StatementTextRenderer } from './StatementTextRenderer';
import { StatementMediaDisplay } from './StatementMediaDisplay';
import { StatementSurvey } from './StatementSurvey';
import { ShareButton } from '@/features/shared/ui/action-buttons/ShareButton';
import { CommentThread } from '@/features/shared/ui/comments';
import { VisibilityInput } from '@/features/create/ui/inputs/VisibilityInput';
import { MediaUpload } from '@/features/file-upload/ui/MediaUpload';
import { extractHashtagTags } from '@/zero/common/hashtagHelpers';
import { Link } from '@tanstack/react-router';
import {
  MessageSquare,
  Trash2,
  Pencil,
  Users,
  User,
} from 'lucide-react';
import { formatDistanceToNow, differenceInMinutes, format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface StatementDetailProps {
  statementId: string;
}

export function StatementDetail({ statementId }: StatementDetailProps) {
  const { t } = useTranslation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editText, setEditText] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editVisibility, setEditVisibility] = useState<'public' | 'authenticated' | 'private'>('public');
  const [editSurveyQuestion, setEditSurveyQuestion] = useState('');
  const [editSurveyOptions, setEditSurveyOptions] = useState<string[]>(['', '']);
  const [editSurveyDuration, setEditSurveyDuration] = useState(24);
  const {
    statement,
    isLoading,
    userId,
    isOwner,
    computedUpvotes,
    computedDownvotes,
    currentVoteValue,
    handleVote,
    survey,
    handleSurveyVote,
    handleSurveyRetract,
    handleSaveSurvey,
    handleDeleteSurvey,
    handleDelete,
    isEditOpen,
    handleEditOpen,
    handleEditClose,
    handleUpdate,
    comments,
    handleAddComment,
    handleCommentVote,
    computedCommentCount,
  } = useStatementDetail({ id: statementId });

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{t('features.statements.detail.loading')}</p>
        </div>
      </PageWrapper>
    );
  }

  if (!statement) {
    return (
      <PageWrapper>
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">{t('features.statements.detail.notFound')}</h1>
          <p className="text-muted-foreground">
            {t('features.statements.detail.notFoundDescription')}
          </p>
        </div>
      </PageWrapper>
    );
  }

  const author = (statement as any).user;
  const group = (statement as any).group;
  const hashtags = extractHashtagTags((statement as any).statement_hashtags);
  const authorName =
    author
      ? `${author.first_name ?? ''} ${author.last_name ?? ''}`.trim() || author.handle || 'Unknown'
      : 'Unknown';

  const locale = t('locale') === 'de' ? de : enUS;
  const createdAt = (statement as any).created_at ? new Date((statement as any).created_at) : null;
  const timeDisplay = (() => {
    if (!createdAt) return null;
    const minutesAgo = differenceInMinutes(new Date(), createdAt);
    if (minutesAgo < 30) return formatDistanceToNow(createdAt, { addSuffix: true, locale });
    return format(createdAt, 'PPp', { locale });
  })();

  return (
    <PageWrapper>
      <div className="mx-auto max-w-3xl">
        {/* Reddit-style layout: vote column + content */}
        <Card>
          <div className="flex">
            {/* Vote column */}
            <div className="bg-muted/30 flex flex-col items-center px-2 py-4">
              <VoteButtons
                upvotes={computedUpvotes}
                downvotes={computedDownvotes}
                userVote={currentVoteValue}
                onVote={handleVote}
              />
            </div>

            {/* Main content */}
            <div className="flex-1 p-4">
              {/* Meta line */}
              <div className="text-muted-foreground mb-2 flex flex-wrap items-center gap-1.5 text-xs">
                {group && (
                  <Link
                    to="/group/$id"
                    params={{ id: group.id }}
                    className="font-semibold text-foreground hover:underline flex items-center gap-1"
                  >
                    <Avatar className="h-4 w-4 shrink-0">
                      <AvatarImage src={group.image_url} />
                      <AvatarFallback className="text-[8px]">
                        <Users className="h-2.5 w-2.5" />
                      </AvatarFallback>
                    </Avatar>
                    {group.name}
                  </Link>
                )}
                {group && <span>·</span>}
                <span className="flex items-center gap-1">
                  <Avatar className="h-4 w-4 shrink-0">
                    <AvatarImage src={author?.avatar} />
                    <AvatarFallback className="text-[8px]">
                      <User className="h-2.5 w-2.5" />
                    </AvatarFallback>
                  </Avatar>
                  {t('features.statements.view.by', { author: authorName })}
                </span>
                {timeDisplay && (
                  <>
                    <span>·</span>
                    <span>{timeDisplay}</span>
                  </>
                )}
              </div>

              {/* Statement text */}
              <div className="mb-3 text-lg leading-relaxed">
                <StatementTextRenderer text={statement.text} />
              </div>

              {/* Media */}
              <StatementMediaDisplay
                imageUrl={statement.image_url}
                videoUrl={statement.video_url}
                className="mb-3"
              />

              {/* Survey */}
              {survey && (
                <StatementSurvey
                  survey={survey}
                  userId={userId}
                  onVote={handleSurveyVote}
                  onRetract={handleSurveyRetract}
                  className="mb-3"
                />
              )}

              {/* Hashtags */}
              {hashtags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {hashtags.map((tag) => (
                    <Link key={tag} to="/search" search={{ hashtag: tag }}>
                      <Badge variant="secondary" className="cursor-pointer text-xs hover:bg-secondary/80">
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}

              {/* Action bar */}
              <div className="border-t pt-2">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    {computedCommentCount} {t('features.statements.comments.title')}
                  </Button>

                  <ShareButton
                    url={`${typeof window !== 'undefined' ? window.location.origin : ''}/statement/${statementId}`}
                    title={statement.text.substring(0, 60)}
                    variant="ghost"
                    size="sm"
                  />

                  {isOwner && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground text-xs"
                        onClick={() => {
                          setEditText(statement.text ?? '');
                          setEditImageUrl(statement.image_url ?? '');
                          setEditVideoUrl(statement.video_url ?? '');
                          setEditVisibility((statement as any).visibility ?? 'public');
                          setEditSurveyQuestion(survey?.question ?? '');
                          setEditSurveyOptions(
                            survey?.options?.length
                              ? survey.options.map((o: any) => o.label)
                              : ['', '']
                          );
                          setEditSurveyDuration(24);
                          handleEditOpen();
                        }}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        {t('features.statements.actions.edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive text-xs"
                        onClick={() => setDeleteOpen(true)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        {t('features.statements.actions.delete')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Comments Section */}
        <div className="mt-6">
          <CommentThread
            comments={comments}
            currentUserId={userId}
            onAddComment={handleAddComment}
            onVote={handleCommentVote}
            hideHeader
          />
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('features.statements.actions.deleteConfirmTitle', 'Delete statement?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('features.statements.actions.deleteConfirmDescription', 'This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                setDeleteOpen(false);
                await handleDelete();
              }}
            >
              {t('common.actions.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) handleEditClose(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('features.statements.actions.edit', 'Edit Statement')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('features.statements.form.text', 'Text')}</Label>
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value.slice(0, 280))}
                rows={4}
                maxLength={280}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">{t('features.statements.charsRemaining', { count: 280 - editText.length })}</p>
            </div>

            <MediaUpload
              currentImage={editImageUrl || undefined}
              onImageChange={setEditImageUrl}
              currentVideo={editVideoUrl || undefined}
              onVideoChange={setEditVideoUrl}
              entityType="statement"
              entityId={statementId}
            />

            <VisibilityInput
              value={editVisibility}
              onChange={setEditVisibility}
            />

            {/* Survey editing */}
            <div className="space-y-2 rounded-lg border p-4">
              <Label className="text-base font-semibold">{t('features.statements.survey.addSurvey', 'Survey (optional)')}</Label>
              <Input
                value={editSurveyQuestion}
                onChange={(e) => setEditSurveyQuestion(e.target.value)}
                placeholder={t('features.statements.survey.question', 'Survey question')}
              />
              {editSurveyOptions.map((opt, idx) => (
                <Input
                  key={idx}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...editSurveyOptions];
                    newOpts[idx] = e.target.value;
                    setEditSurveyOptions(newOpts);
                  }}
                  placeholder={`${t('features.statements.survey.option', 'Option')} ${idx + 1}`}
                />
              ))}
              {editSurveyOptions.length < 4 && (
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setEditSurveyOptions([...editSurveyOptions, ''])}
                >
                  + {t('features.statements.survey.addOption', 'Add option')}
                </button>
              )}
              <div className="space-y-2">
                <Label>{t('features.statements.survey.duration', 'Duration (hours)')}</Label>
                <Input
                  type="number"
                  min={1}
                  max={168}
                  value={editSurveyDuration}
                  onChange={(e) => setEditSurveyDuration(Number(e.target.value))}
                />
              </div>
              {survey && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    await handleDeleteSurvey();
                    setEditSurveyQuestion('');
                    setEditSurveyOptions(['', '']);
                  }}
                >
                  {t('features.statements.survey.remove', 'Remove Survey')}
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditClose}>
              {t('common.actions.cancel', 'Cancel')}
            </Button>
            <Button
              disabled={!editText.trim()}
              onClick={async () => {
                await handleUpdate(editText.trim(), {
                  imageUrl: editImageUrl || null,
                  videoUrl: editVideoUrl || null,
                  visibility: editVisibility,
                });
                // Save survey if question and >=2 options provided
                const validOptions = editSurveyOptions.filter(o => o.trim());
                if (editSurveyQuestion.trim() && validOptions.length >= 2) {
                  await handleSaveSurvey(editSurveyQuestion, editSurveyOptions, editSurveyDuration);
                }
              }}
            >
              {t('common.actions.save', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
