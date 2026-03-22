import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/providers/auth-provider'
import { useElectionActions } from '@/zero/elections/useElectionActions'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { toast } from 'sonner'
import { Textarea } from '@/features/shared/ui/ui/textarea'
import { Label } from '@/features/shared/ui/ui/label'
import { ImageUpload } from '@/features/file-upload/ui/ImageUpload.tsx'
import { ElectionSearchInput } from '../ui/inputs/ElectionSearchInput'
import { CreateSummaryStep } from '../ui/CreateSummaryStep'
import type { CreateFormConfig } from '../types/create-form.types'

export function useCreateElectionCandidateForm(): CreateFormConfig {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addCandidate } = useElectionActions()

  const [candidateId] = useState(() => crypto.randomUUID())
  const [electionId, setElectionId] = useState('')
  const [statement, setStatement] = useState('')
  const [imageURL, setImageURL] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!user) return
    setIsSubmitting(true)
    try {
      await addCandidate({
        id: candidateId,
        name: '',
        description: statement.trim(),
        election_id: electionId,
        user_id: user.id,
        status: 'pending',
        order_index: 0,
        image_url: imageURL,
      })
      toast.success(t('pages.create.success.created'))
      navigate({ to: '/create' })
    } catch {
      toast.error(t('pages.create.error.createFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const config = useMemo((): CreateFormConfig => ({
    entityType: 'election',
    title: 'pages.create.electionCandidate.title',
    isSubmitting,
    onSubmit: handleSubmit,
    steps: [
      {
        label: t('pages.create.electionCandidate.electionLabel'),
        isValid: () => !!electionId,
        content: (
          <ElectionSearchInput
            value={electionId}
            onChange={setElectionId}
            label={t('pages.create.electionCandidate.electionLabel')}
            placeholder={t('pages.create.electionCandidate.electionPlaceholder')}
          />
        ),
      },
      {
        label: t('pages.create.electionCandidate.descriptionLabel'),
        isValid: () => true,
        optional: true,
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('pages.create.electionCandidate.descriptionLabel')}</Label>
              <p className="text-muted-foreground text-xs">{t('pages.create.electionCandidate.tips.description')}</p>
              <Textarea
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder={t('pages.create.electionCandidate.descriptionPlaceholder')}
                rows={5}
              />
            </div>
            <ImageUpload
              currentImage={imageURL}
              onImageChange={setImageURL}
              entityType="election-candidates"
              entityId={candidateId}
              label={t('pages.create.electionCandidate.imageUrlLabel')}
              description={t('pages.create.electionCandidate.imageUrlOptional')}
            />
          </div>
        ),
      },
      {
        label: t('pages.create.common.review'),
        isValid: () => !!electionId,
        content: (
          <CreateSummaryStep
            entityType="election"
            badge={t('pages.create.electionCandidate.reviewBadge')}
            title={electionId ? 'Election Candidate' : t('pages.create.common.notSelected')}
            subtitle={statement || undefined}
            fields={[
              ...(statement ? [{ label: t('pages.create.electionCandidate.descriptionLabel'), value: statement }] : []),
              ...(imageURL ? [{ label: t('pages.create.electionCandidate.image'), value: 'Attached' }] : []),
            ]}
          />
        ),
      },
    ],
  }), [electionId, statement, imageURL, candidateId, isSubmitting, t])

  return config
}
