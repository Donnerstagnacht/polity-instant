import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { Input } from '@/features/shared/ui/ui/input'
import { Label } from '@/features/shared/ui/ui/label'
import { Textarea } from '@/features/shared/ui/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/features/shared/ui/ui/radio-group'
import { ImageUpload } from '@/features/file-upload/ui/ImageUpload.tsx'
import { HashtagEditor } from '@/features/shared/ui/ui/hashtag-editor'
import { VisibilityInput } from '../ui/inputs/VisibilityInput'
import { CreateSummaryStep } from '../ui/CreateSummaryStep'
import { useGroupActions } from '@/zero/groups/useGroupActions'
import { useCommonState, useCommonActions } from '@/zero/common'
import type { CreateFormConfig } from '../types/create-form.types'

type GroupType = 'base' | 'hierarchical'

export function useCreateGroupForm(): CreateFormConfig {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { createGroup, setupGroupAdminRoles } = useGroupActions()
  const commonActions = useCommonActions()

  const [groupId] = useState(() => crypto.randomUUID())
  const [groupType, setGroupType] = useState<GroupType>('base')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [region, setRegion] = useState('')
  const [country, setCountry] = useState('')
  const [imageURL, setImageURL] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [visibility, setVisibility] = useState<'public' | 'authenticated' | 'private'>('public')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { allHashtags } = useCommonState({ loadAllHashtags: true })

  const handleSubmit = async () => {
    if (!name.trim()) return
    setIsSubmitting(true)
    try {
      await createGroup({
        id: groupId,
        name: name.trim(),
        description: description || null,
        location: location || null,
        image_url: imageURL || null,
        x: null,
        youtube: null,
        linkedin: null,
        website: null,
        is_public: visibility === 'public',
        visibility,
        group_type: groupType,
        owner_id: null,
      })
      await setupGroupAdminRoles(groupId)

      if (hashtags.length > 0) {
        await commonActions.syncEntityHashtags('group', groupId, hashtags, [], allHashtags ?? [])
      }

      navigate({ to: `/group/${groupId}` })
    } catch {
      setIsSubmitting(false)
    }
  }

  const config = useMemo(
    (): CreateFormConfig => ({
      entityType: 'group',
      title: 'pages.create.group.title',
      isSubmitting,
      onSubmit: handleSubmit,
      steps: [
        {
          label: t('pages.create.group.basicInfo'),
          isValid: () => !!name.trim(),
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {t('pages.create.group.nameLabel')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('pages.create.group.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.group.descriptionLabel')}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('pages.create.group.descriptionPlaceholder')}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.group.groupType')}</Label>
                <RadioGroup value={groupType} onValueChange={(v) => setGroupType(v as GroupType)}>
                  <div className="space-y-2">
                    <Label
                      htmlFor="group-type-base"
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        groupType === 'base' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                    >
                      <RadioGroupItem value="base" id="group-type-base" className="mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">{t('pages.create.group.groupTypes.base')}</div>
                        <div className="text-muted-foreground text-xs">{t('pages.create.group.groupTypes.baseDesc')}</div>
                      </div>
                    </Label>
                    <Label
                      htmlFor="group-type-hierarchical"
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        groupType === 'hierarchical' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                    >
                      <RadioGroupItem value="hierarchical" id="group-type-hierarchical" className="mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">{t('pages.create.group.groupTypes.hierarchical')}</div>
                        <div className="text-muted-foreground text-xs">{t('pages.create.group.groupTypes.hierarchicalDesc')}</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          ),
        },
        {
          label: t('pages.create.group.locationLabel'),
          isValid: () => true,
          optional: true,
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('pages.create.group.locationLabel')}</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('pages.create.group.locationPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.group.regionLabel')}</Label>
                <Input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder={t('pages.create.group.regionPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.group.countryLabel')}</Label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={t('pages.create.group.countryPlaceholder')}
                />
              </div>
            </div>
          ),
        },
        {
          label: t('pages.create.group.imageAndTags'),
          isValid: () => true,
          optional: true,
          content: (
            <div className="space-y-4">
              <ImageUpload
                currentImage={imageURL}
                onImageChange={(url: string) => setImageURL(url)}
                entityType="groups"
                entityId={groupId}
                label={t('pages.create.group.imageLabel')}
                description={t('pages.create.group.imageDescription')}
              />
              <VisibilityInput value={visibility} onChange={setVisibility} />
              <HashtagEditor
                value={hashtags}
                onChange={setHashtags}
                placeholder={t('pages.create.group.hashtagPlaceholder')}
              />
            </div>
          ),
        },
        {
          label: t('pages.create.common.review'),
          isValid: () => !!name.trim(),
          content: (
            <CreateSummaryStep
              entityType="group"
              badge={t('pages.create.group.reviewBadge')}
              title={name || t('pages.create.group.namePlaceholder')}
              subtitle={description || undefined}
              hashtags={hashtags.length > 0 ? hashtags : undefined}
              fields={[
                { label: t('pages.create.group.groupType'), value: groupType === 'base' ? t('pages.create.group.groupTypes.base') : t('pages.create.group.groupTypes.hierarchical') },
                ...(location ? [{ label: t('pages.create.group.locationLabel'), value: location }] : []),
                ...(region ? [{ label: t('pages.create.group.regionLabel'), value: region }] : []),
                ...(country ? [{ label: t('pages.create.group.countryLabel'), value: country }] : []),
                { label: t('pages.create.common.visibility'), value: visibility },
              ]}
            />
          ),
        },
      ],
    }),
    [name, description, location, region, country, imageURL, hashtags, visibility, groupType, isSubmitting, groupId, t],
  )

  return config
}
