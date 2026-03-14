import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/providers/auth-provider'
import { useBlogActions } from '@/zero/blogs/useBlogActions'
import { useCommonState, useCommonActions } from '@/zero/common'
import { useGroupState } from '@/zero/groups/useGroupState'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { toast } from 'sonner'
import { Input } from '@/features/shared/ui/ui/input'
import { Label } from '@/features/shared/ui/ui/label'
import { VisibilityInput } from '../ui/inputs/VisibilityInput'
import { HashtagEditor } from '@/features/shared/ui/ui/hashtag-editor'
import { ImageUpload } from '@/features/file-upload/ui/ImageUpload.tsx'
import { CreateSummaryStep } from '../ui/CreateSummaryStep'
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent'
import { TypeaheadSearch } from '@/features/shared/ui/typeahead'
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers'
import type { CreateFormConfig } from '../types/create-form.types'

export function useCreateBlogForm(): CreateFormConfig {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createBlogFull } = useBlogActions()
  const commonActions = useCommonActions()
  const { allHashtags } = useCommonState({ loadAllHashtags: true })
  const { currentUserMembershipsWithGroups } = useGroupState({
    includeCurrentUserMembershipsWithGroups: true,
  })

  const memberGroupIds = useMemo(
    () => new Set(currentUserMembershipsWithGroups.map((m) => m.group_id)),
    [currentUserMembershipsWithGroups],
  )

  const [blogId] = useState(() => crypto.randomUUID())
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [visibility, setVisibility] = useState<'public' | 'authenticated' | 'private'>('public')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [imageURL, setImageURL] = useState('')
  const [groupId, setGroupId] = useState<string | null>(null)
  const [groupName, setGroupName] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!user?.id || !title.trim()) return
    setIsSubmitting(true)

    try {
      const ownerRoleId = crypto.randomUUID()
      const writerRoleId = crypto.randomUUID()
      const bloggerId = crypto.randomUUID()
      const ownerManageBlogsId = crypto.randomUUID()
      const ownerManageBloggersId = crypto.randomUUID()
      const writerUpdateRightId = crypto.randomUUID()

      await createBlogFull({
        blog: {
          id: blogId,
          title: title.trim(),
          description: '',
          content: null,
          date,
          image_url: imageURL,
          is_public: visibility === 'public',
          visibility,
          like_count: 0,
          comment_count: 0,
          upvotes: 0,
          downvotes: 0,
          editing_mode: '',
          discussions: null,
          group_id: groupId,
        },
        roles: [
          {
            id: ownerRoleId,
            name: 'Owner',
            description: 'Blog owner with full permissions',
            scope: 'blog',
            group_id: null,
            event_id: null,
            amendment_id: null,
            blog_id: blogId,
            sort_order: 1,
          },
          {
            id: writerRoleId,
            name: 'Writer',
            description: 'Blog writer with edit access',
            scope: 'blog',
            group_id: null,
            event_id: null,
            amendment_id: null,
            blog_id: blogId,
            sort_order: 0,
          },
        ],
        actionRights: [
          {
            id: ownerManageBlogsId,
            resource: 'blogs',
            action: 'manage',
            role_id: ownerRoleId,
            group_id: null,
            event_id: null,
            amendment_id: null,
            blog_id: blogId,
          },
          {
            id: ownerManageBloggersId,
            resource: 'blogBloggers',
            action: 'manage',
            role_id: ownerRoleId,
            group_id: null,
            event_id: null,
            amendment_id: null,
            blog_id: blogId,
          },
          {
            id: writerUpdateRightId,
            resource: 'blogs',
            action: 'update',
            role_id: writerRoleId,
            group_id: null,
            event_id: null,
            amendment_id: null,
            blog_id: blogId,
          },
        ],
        entry: {
          id: bloggerId,
          blog_id: blogId,
          user_id: user.id,
          role_id: ownerRoleId,
          status: 'member',
          visibility,
        },
      })

      if (hashtags.length > 0) {
        await commonActions.syncEntityHashtags('blog', blogId, hashtags, [], allHashtags ?? [])
      }

      if (visibility === 'public') {
        await createTimelineEvent({
          data: {
            eventType: 'created',
            entityType: 'blog',
            entityId: blogId,
            actorId: user.id,
            title: `New blog post: ${title.trim()}`,
            description: 'A new blog post has been published',
          },
        })
      }

      toast.success(t('pages.create.success.created'))
      if (groupId) {
        navigate({ to: '/group/$id/blog/$entryId', params: { id: groupId, entryId: blogId } })
      } else {
        navigate({ to: '/user/$id/blog/$entryId', params: { id: user.id, entryId: blogId } })
      }
    } catch {
      toast.error(t('pages.create.error.createFailed'))
      setIsSubmitting(false)
    }
  }

  const config = useMemo(
    (): CreateFormConfig => ({
      entityType: 'blog',
      title: 'pages.create.blog.title',
      isSubmitting,
      onSubmit: handleSubmit,
      steps: [
        {
          label: t('pages.create.blog.basicInfo'),
          isValid: () => !!title.trim(),
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {t('pages.create.blog.titleLabel')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <p className="text-muted-foreground text-xs">{t('pages.create.blog.tips.title')}</p>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('pages.create.blog.titlePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.blog.dateLabel')}</Label>
                <p className="text-muted-foreground text-xs">{t('pages.create.blog.tips.date')}</p>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <ImageUpload
                currentImage={imageURL}
                onImageChange={(url: string) => setImageURL(url)}
                entityType="blogs"
                entityId={blogId}
                label={t('pages.create.blog.coverImage')}
                description={t('pages.create.blog.coverImageDescription')}
              />
              <div className="space-y-2">
                <Label>{t('pages.create.blog.attachTo', 'Attach to group (optional)')}</Label>
                <TypeaheadSearch
                  entityTypes={['group']}
                  value={groupId ?? undefined}
                  onChange={(item: TypeaheadItem | null) => {
                    setGroupId(item?.id ?? null)
                    setGroupName(item?.label ?? '')
                  }}
                  placeholder={t('pages.create.blog.groupPlaceholder', 'Search groups...')}
                  filterFn={(item) => memberGroupIds.has(item.id)}
                />
              </div>
            </div>
          ),
        },
        {
          label: t('pages.create.blog.visibilityAndTags'),
          isValid: () => true,
          optional: true,
          content: (
            <div className="space-y-4">
              <VisibilityInput value={visibility} onChange={setVisibility} />
              <HashtagEditor
                value={hashtags}
                onChange={setHashtags}
                placeholder={t('pages.create.blog.hashtagPlaceholder')}
              />
            </div>
          ),
        },
        {
          label: t('pages.create.common.review'),
          isValid: () => !!title.trim(),
          content: (
            <CreateSummaryStep
              entityType="blog"
              badge={t('pages.create.blog.reviewBadge')}
              title={title || t('pages.create.blog.titlePlaceholder')}
              hashtags={hashtags.length > 0 ? hashtags : undefined}
              fields={[
                { label: t('pages.create.blog.dateLabel'), value: date },
                {
                  label: t('pages.create.common.visibility'),
                  value: visibility,
                },
                ...(groupName ? [{ label: t('pages.create.blog.attachTo', 'Attach to group'), value: groupName }] : []),
              ]}
            />
          ),
        },
      ],
    }),
    [title, date, visibility, hashtags, imageURL, isSubmitting, blogId, groupId, groupName, t, memberGroupIds],
  )

  return config
}
