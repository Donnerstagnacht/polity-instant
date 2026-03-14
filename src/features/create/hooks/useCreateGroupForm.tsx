import { useState, useMemo, useCallback } from 'react'
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
import { UserSearchInput } from '../ui/inputs/UserSearchInput'
import { useGroupActions } from '@/zero/groups/useGroupActions'
import { useEventActions } from '@/zero/events/useEventActions'
import { useCommonState, useCommonActions } from '@/zero/common'
import { useAllGroups } from '@/zero/groups/useGroupState'
import { useUserState } from '@/zero/users/useUserState'
import { useAuth } from '@/providers/auth-provider'
import { TypeaheadSearch } from '@/features/shared/ui/typeahead/TypeaheadSearch'
import { toTypeaheadItems } from '@/features/shared/ui/typeahead/toTypeaheadItems'
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers'
import { RIGHT_TYPES } from '@/features/network/ui/RightFilters'
import { Badge } from '@/features/shared/ui/ui/badge'
import { Button } from '@/features/shared/ui/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card'
import { Switch } from '@/features/shared/ui/ui/switch'
import { Checkbox } from '@/features/shared/ui/ui/checkbox'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/shared/ui/ui/accordion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/shared/ui/ui/table'
import { cn } from '@/features/shared/utils/utils.ts'
import { matchInviteCsvUsers, type InviteCsvMatchResult } from '../logic/groupInviteCsv'
import { X, Upload, Link2, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import type { CreateFormConfig } from '../types/create-form.types'

type GroupType = 'base' | 'hierarchical'

interface LinkedGroup {
  groupId: string
  groupName: string
  type: 'parent' | 'child'
  rights: string[]
}

interface CsvInviteSummary extends InviteCsvMatchResult {
  matchedNames: string[]
}

function getRelationshipBadgeClasses(type: LinkedGroup['type']) {
  return type === 'parent'
    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
    : 'border-sky-300 bg-sky-50 text-sky-800'
}

function getRightBadgeClasses(right: string) {
  switch (right) {
    case 'informationRight':
      return 'border-blue-200 bg-blue-50 text-blue-800'
    case 'amendmentRight':
      return 'border-amber-200 bg-amber-50 text-amber-800'
    case 'rightToSpeak':
      return 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800'
    case 'activeVotingRight':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    case 'passiveVotingRight':
      return 'border-violet-200 bg-violet-50 text-violet-800'
    default:
      return 'border-muted bg-muted/50 text-foreground'
  }
}

export function useCreateGroupForm(): CreateFormConfig {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createGroup, inviteMember, createRelationship } = useGroupActions()
  const { createEvent } = useEventActions()
  const commonActions = useCommonActions()
  const { groups: allGroups } = useAllGroups()
  const { allUsers } = useUserState({ includeAllUsers: true })

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

  // Invite members state
  const [invitedUserIds, setInvitedUserIds] = useState<string[]>([])
  const [csvInviteSummary, setCsvInviteSummary] = useState<CsvInviteSummary | null>(null)

  // Link groups state
  const [linkedGroups, setLinkedGroups] = useState<LinkedGroup[]>([])
  const [linkGroupId, setLinkGroupId] = useState('')
  const [linkType, setLinkType] = useState<'parent' | 'child'>('parent')
  const [linkRights, setLinkRights] = useState<Set<string>>(new Set())

  // Constitutional event state
  const [createConstitutionalEvent, setCreateConstitutionalEvent] = useState(false)
  const [eventName, setEventName] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [eventStartDate, setEventStartDate] = useState('')
  const [eventStartTime, setEventStartTime] = useState('')

  const { allHashtags } = useCommonState({ loadAllHashtags: true })

  const handleCsvUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      if (!text) return

      const result = matchInviteCsvUsers(text, allUsers, { excludeUserId: user?.id })

      if (result.missingColumns) {
        setCsvInviteSummary(null)
        toast.error(t('pages.create.group.csvMissingColumns'))
        return
      }

      if (
        result.matchedUsers.length === 0 &&
        result.notFoundNames.length === 0 &&
        result.ambiguousNames.length === 0 &&
        result.invalidRows.length === 0
      ) {
        setCsvInviteSummary(null)
        toast.error(t('pages.create.group.csvEmpty'))
        return
      }

      if (result.matchedUsers.length > 0) {
        setInvitedUserIds(prev => {
          const next = new Set(prev)
          for (const matchedUser of result.matchedUsers) {
            next.add(matchedUser.id)
          }
          return [...next]
        })
      }

      const matchedNames = result.matchedUsers.map(userEntry => userEntry.name)
      setCsvInviteSummary({
        ...result,
        matchedNames,
      })

      if (result.matchedUsers.length > 0) {
        toast.success(t('pages.create.group.csvMatchedUsers', { count: result.matchedUsers.length }))
      }

      if (result.notFoundNames.length > 0 || result.ambiguousNames.length > 0 || result.invalidRows.length > 0) {
        toast.info(t('pages.create.group.csvReviewSummary'))
      }
    }
    reader.readAsText(file)
    // Reset input so same file can be re-uploaded
    e.target.value = ''
  }, [allUsers, t, user?.id])

  const handleAddLinkedGroup = useCallback(() => {
    if (!linkGroupId || linkRights.size === 0) {
      toast.error(t('pages.create.group.selectGroupAndRights'))
      return
    }
    const existing = linkedGroups.find(g => g.groupId === linkGroupId)
    if (existing) {
      toast.info(t('pages.create.group.groupAlreadyLinked'))
      setLinkedGroups(prev => prev.map(g =>
        g.groupId === linkGroupId ? { ...g, type: linkType, rights: [...linkRights] } : g
      ))
    } else {
      const group = allGroups.find(g => g.id === linkGroupId)
      setLinkedGroups(prev => [...prev, {
        groupId: linkGroupId,
        groupName: group?.name ?? linkGroupId,
        type: linkType,
        rights: [...linkRights],
      }])
    }
    setLinkGroupId('')
    setLinkRights(new Set())
  }, [linkGroupId, linkType, linkRights, linkedGroups, allGroups, t])

  const handleRemoveLinkedGroup = useCallback((gId: string) => {
    setLinkedGroups(prev => prev.filter(g => g.groupId !== gId))
  }, [])

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
      if (hashtags.length > 0) {
        await commonActions.syncEntityHashtags('group', groupId, hashtags, [], allHashtags ?? [])
      }

      // Invite members
      for (const userId of invitedUserIds) {
        await inviteMember({
          id: crypto.randomUUID(),
          user_id: userId,
          group_id: groupId,
          role_id: null,
          visibility: '',
          status: 'invited',
        })
      }

      // Create group relationships
      for (const link of linkedGroups) {
        const isParent = link.type === 'parent'
        for (const right of link.rights) {
          await createRelationship({
            id: crypto.randomUUID(),
            group_id: isParent ? link.groupId : groupId,
            related_group_id: isParent ? groupId : link.groupId,
            relationship_type: link.type,
            with_right: right,
            status: 'pending',
            initiator_group_id: groupId,
          })
        }
      }

      // Create constitutional event
      if (createConstitutionalEvent && eventName.trim() && user?.id) {
        const startTimestamp = eventStartDate
          ? new Date(`${eventStartDate}T${eventStartTime || '00:00'}`).getTime()
          : null
        await createEvent({
          id: crypto.randomUUID(),
          title: eventName.trim(),
          event_type: 'general_assembly',
          group_id: groupId,
          creator_id: user.id,
          is_public: visibility === 'public',
          visibility,
          location_name: eventLocation || null,
          start_date: startTimestamp,
          invited_user_ids: invitedUserIds,
        })
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
                <p className="text-muted-foreground text-xs">{t('pages.create.group.tips.name')}</p>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('pages.create.group.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.group.descriptionLabel')}</Label>
                <p className="text-muted-foreground text-xs">{t('pages.create.group.tips.description')}</p>
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
                <p className="text-muted-foreground text-xs">{t('pages.create.group.tips.location')}</p>
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
        // Step 4: Invite Members
        {
          label: t('pages.create.group.inviteMembers'),
          isValid: () => true,
          optional: true,
          content: (
            <div className="space-y-4">
              <p className="text-muted-foreground text-xs">{t('pages.create.group.tips.inviteMembers')}</p>
              <UserSearchInput
                value={invitedUserIds}
                onChange={setInvitedUserIds}
                label={t('pages.create.group.searchUsers')}
                placeholder={t('pages.create.group.searchUsers')}
                excludeUserId={user?.id}
                multi
              />
              <Card className="border-dashed bg-muted/20 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                    {t('pages.create.group.csvGuideTitle')}
                  </CardTitle>
                  <CardDescription>
                    {t('pages.create.group.csvGuideDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="csv-format" className="border-none">
                      <AccordionTrigger className="rounded-md px-3 py-2 text-sm hover:no-underline hover:bg-muted/50">
                        {t('pages.create.group.csvGuideTrigger')}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 px-1 pt-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('pages.create.group.csvColumnFirstName')}</TableHead>
                              <TableHead>{t('pages.create.group.csvColumnLastName')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Ada</TableCell>
                              <TableCell>Lovelace</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Grace</TableCell>
                              <TableCell>Hopper</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <p className="text-muted-foreground text-xs">
                          {t('pages.create.group.csvGuideFootnote')}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="csv-upload"
                  className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                >
                  <Upload className="h-4 w-4" />
                  {t('pages.create.group.inviteMembersOptional')} (CSV)
                </Label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleCsvUpload}
                />
              </div>
              {csvInviteSummary && (
                <Card className="border-muted bg-background shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t('pages.create.group.csvSummaryTitle')}</CardTitle>
                    <CardDescription>{t('pages.create.group.csvSummaryDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50">
                        {t('pages.create.group.csvFoundCount', { count: csvInviteSummary.matchedNames.length })}
                      </Badge>
                      <Badge className="border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-50">
                        {t('pages.create.group.csvNotFoundCount', { count: csvInviteSummary.notFoundNames.length })}
                      </Badge>
                      {csvInviteSummary.ambiguousNames.length > 0 && (
                        <Badge className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
                          {t('pages.create.group.csvAmbiguousCount', { count: csvInviteSummary.ambiguousNames.length })}
                        </Badge>
                      )}
                    </div>

                    {csvInviteSummary.matchedNames.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-emerald-700">
                          {t('pages.create.group.csvFoundNames')}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {csvInviteSummary.matchedNames.map(name => (
                            <Badge key={name} className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {csvInviteSummary.notFoundNames.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-rose-700">
                          {t('pages.create.group.csvNotFoundNames')}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {csvInviteSummary.notFoundNames.map(name => (
                            <Badge key={name} className="border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-50">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {csvInviteSummary.ambiguousNames.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-amber-700">
                          {t('pages.create.group.csvAmbiguousNames')}
                        </Label>
                        <div className="space-y-2">
                          {csvInviteSummary.ambiguousNames.map(entry => (
                            <div key={entry.fullName} className="rounded-md border border-amber-200 bg-amber-50/60 p-3">
                              <div className="text-sm font-medium text-amber-900">{entry.fullName}</div>
                              <div className="text-xs text-amber-800">
                                {t('pages.create.group.csvAmbiguousCandidates', {
                                  candidates: entry.candidates.map(candidate => candidate.name).join(', '),
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {csvInviteSummary.invalidRows.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-amber-700">
                          {t('pages.create.group.csvInvalidRows')}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {csvInviteSummary.invalidRows.map(row => (
                            <Badge key={row} className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
                              {row}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              {invitedUserIds.length > 0 && (
                <p className="text-muted-foreground text-sm">
                  {invitedUserIds.length} {t('pages.create.group.invited')}
                </p>
              )}
            </div>
          ),
        },
        // Step 5: Link Groups
        {
          label: t('pages.create.group.linkGroups'),
          isValid: () => true,
          optional: true,
          content: (
            <div className="space-y-4">
              <p className="text-muted-foreground text-xs">{t('pages.create.group.tips.linkGroups')}</p>
              <div className="space-y-3">
                <Label>{t('pages.create.group.selectGroup')}</Label>
                <TypeaheadSearch
                  items={toTypeaheadItems(
                    allGroups.filter((g: any) => g.id !== groupId),
                    'group',
                    (g: any) => g.name || 'Group',
                    (g: any) => g.description?.substring(0, 60),
                  )}
                  value={linkGroupId}
                  onChange={(item: TypeaheadItem | null) => setLinkGroupId(item?.id ?? '')}
                  placeholder={t('pages.create.group.searchGroups')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.group.relationshipType')}</Label>
                <RadioGroup value={linkType} onValueChange={(v) => setLinkType(v as 'parent' | 'child')}>
                  <div className="flex gap-4">
                    <Label htmlFor="link-parent" className="flex cursor-pointer items-center gap-2">
                      <RadioGroupItem value="parent" id="link-parent" />
                      {t('pages.create.group.theyAreParent')}
                    </Label>
                    <Label htmlFor="link-child" className="flex cursor-pointer items-center gap-2">
                      <RadioGroupItem value="child" id="link-child" />
                      {t('pages.create.group.theyAreChild')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>{t('pages.create.group.selectRights')}</Label>
                <div className="flex flex-wrap gap-3">
                  {RIGHT_TYPES.map(right => (
                    <Label key={right} htmlFor={`right-${right}`} className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox
                        id={`right-${right}`}
                        checked={linkRights.has(right)}
                        onCheckedChange={(checked) => {
                          setLinkRights(prev => {
                            const next = new Set(prev)
                            if (checked) next.add(right)
                            else next.delete(right)
                            return next
                          })
                        }}
                      />
                      {t(`pages.create.group.rights.${right}`)}
                    </Label>
                  ))}
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLinkedGroup} disabled={!linkGroupId || linkRights.size === 0}>
                <Link2 className="mr-1 h-4 w-4" />
                {t('pages.create.group.addGroupLink')}
              </Button>
              {linkedGroups.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">{t('pages.create.group.linkedGroups')}</Label>
                  {linkedGroups.map(lg => (
                    <div key={lg.groupId} className="flex items-start gap-3 rounded-md border p-3">
                      <Badge className={cn('border text-xs hover:opacity-100', getRelationshipBadgeClasses(lg.type))}>
                        {lg.type === 'parent' ? t('pages.create.group.parent') : t('pages.create.group.child')}
                      </Badge>
                      <div className="min-w-0 flex-1 space-y-2">
                        <span className="block text-sm font-medium">{lg.groupName}</span>
                        <div className="flex flex-wrap gap-2">
                          {lg.rights.map(right => (
                            <Badge
                              key={right}
                              className={cn('border text-xs hover:opacity-100', getRightBadgeClasses(right))}
                            >
                              {t(`pages.create.group.rights.${right}`)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleRemoveLinkedGroup(lg.groupId)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
        },
        // Step 6: Constitutional Event
        {
          label: t('pages.create.group.createConstitutionalEvent'),
          isValid: () => true,
          optional: true,
          content: (
            <div className="space-y-4">
              <p className="text-muted-foreground text-xs">{t('pages.create.group.tips.constitutionalEvent')}</p>
              <div className="flex items-center gap-3">
                <Switch
                  checked={createConstitutionalEvent}
                  onCheckedChange={setCreateConstitutionalEvent}
                />
                <Label>{t('pages.create.group.optionalGeneralAssembly')}</Label>
              </div>
              {createConstitutionalEvent && (
                <div className="space-y-4 rounded-md border p-4">
                  <p className="text-muted-foreground text-xs">{t('pages.create.group.eventTypeDescription')}</p>
                  <div className="space-y-2">
                    <Label>{t('pages.create.group.eventName')}</Label>
                    <Input
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder={t('pages.create.group.eventNamePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('pages.create.group.eventLocation')}</Label>
                    <Input
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder={t('pages.create.group.eventLocationPlaceholder')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('pages.create.group.eventStartDate')}</Label>
                      <Input type="date" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('pages.create.group.eventStartTime')}</Label>
                      <Input type="time" value={eventStartTime} onChange={(e) => setEventStartTime(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
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
                ...(invitedUserIds.length > 0 ? [{ label: t('pages.create.group.invitedMembersLabel'), value: `${invitedUserIds.length} ${t('pages.create.group.invited')}` }] : []),
                ...(linkedGroups.length > 0 ? [{ label: t('pages.create.group.groupLinksLabel'), value: linkedGroups.map(g => `${g.groupName} (${g.type})`).join(', ') }] : []),
                ...(createConstitutionalEvent && eventName ? [{ label: t('pages.create.group.constitutionalEventLabel'), value: eventName }] : []),
              ]}
            />
          ),
        },
      ],
    }),
    [name, description, location, region, country, imageURL, hashtags, visibility, groupType, isSubmitting, groupId, t, invitedUserIds, linkedGroups, linkGroupId, linkType, linkRights, allGroups, createConstitutionalEvent, eventName, eventLocation, eventStartDate, eventStartTime, user],
  )

  return config
}
