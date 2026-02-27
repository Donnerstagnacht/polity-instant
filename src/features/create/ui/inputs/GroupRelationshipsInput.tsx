import { useState, useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TypeAheadSelect } from '@/components/ui/type-ahead-select'
import { GroupSelectCard } from '@/components/ui/entity-select-cards'
import { useAllGroups } from '@/zero/groups/useGroupState'
import { X, Check, Link as LinkIcon } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { toast } from 'sonner'

type RelationshipType = 'isParent' | 'isChild'

type WithRight =
  | 'informationRight'
  | 'amendmentRight'
  | 'rightToSpeak'
  | 'activeVotingRight'
  | 'passiveVotingRight'

export interface GroupLink {
  groupId: string
  groupName: string
  relationshipType: RelationshipType
  rights: WithRight[]
}

interface GroupRelationshipsInputProps {
  value: GroupLink[]
  onChange: (links: GroupLink[]) => void
}

const RIGHT_KEYS: WithRight[] = [
  'informationRight',
  'amendmentRight',
  'rightToSpeak',
  'activeVotingRight',
  'passiveVotingRight',
]

export function GroupRelationshipsInput({ value, onChange }: GroupRelationshipsInputProps) {
  const { t } = useTranslation()
  const { groups } = useAllGroups()
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('isParent')
  const [selectedRights, setSelectedRights] = useState<Set<WithRight>>(new Set())

  const availableGroups = useMemo(
    () => groups.filter((g: any) => !value.some((link) => link.groupId === g.id)),
    [groups, value],
  )

  const toggleRight = (right: WithRight) => {
    const next = new Set(selectedRights)
    if (next.has(right)) next.delete(right)
    else next.add(right)
    setSelectedRights(next)
  }

  const handleAdd = () => {
    if (!selectedGroupId || selectedRights.size === 0) {
      toast.error(t('pages.create.group.selectGroupAndRights'))
      return
    }
    const group = groups.find((g: any) => g.id === selectedGroupId)
    if (!group) return

    const existing = value.find((link) => link.groupId === selectedGroupId)
    if (existing) {
      onChange(
        value.map((link) =>
          link.groupId === selectedGroupId
            ? { ...link, rights: Array.from(selectedRights), relationshipType }
            : link,
        ),
      )
      toast.info(t('pages.create.group.groupAlreadyLinked'))
    } else {
      onChange([
        ...value,
        {
          groupId: selectedGroupId,
          groupName: (group as any).name,
          relationshipType,
          rights: Array.from(selectedRights),
        },
      ])
    }

    setSelectedGroupId('')
    setSelectedRights(new Set())
  }

  const handleRemove = (groupId: string) => {
    onChange(value.filter((link) => link.groupId !== groupId))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{t('pages.create.group.linkGroupsOptional')}</Label>
        <Badge variant="secondary">
          {value.length} {t('pages.create.group.linked')}
        </Badge>
      </div>
      <p className="text-muted-foreground text-sm">{t('pages.create.group.requestRelationships')}</p>

      {/* Group search */}
      <div className="space-y-2">
        <Label>{t('pages.create.group.selectGroup')}</Label>
        <TypeAheadSelect
          items={availableGroups}
          value={selectedGroupId}
          onChange={setSelectedGroupId}
          placeholder={t('pages.create.group.searchGroups')}
          searchKeys={['name', 'description']}
          renderItem={(group: any) => <GroupSelectCard group={group} />}
          getItemId={(group: any) => group.id}
        />
      </div>

      {/* Relationship type & rights (only when group selected) */}
      {selectedGroupId && (
        <>
          <div className="space-y-2">
            <Label>{t('pages.create.group.relationshipType')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={relationshipType === 'isParent' ? 'default' : 'outline'}
                onClick={() => setRelationshipType('isParent')}
              >
                {t('pages.create.group.theyAreParent')}
              </Button>
              <Button
                type="button"
                variant={relationshipType === 'isChild' ? 'default' : 'outline'}
                onClick={() => setRelationshipType('isChild')}
              >
                {t('pages.create.group.theyAreChild')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('pages.create.group.selectRights')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {RIGHT_KEYS.map((right) => (
                <Button
                  key={right}
                  type="button"
                  variant={selectedRights.has(right) ? 'default' : 'outline'}
                  onClick={() => toggleRight(right)}
                  className="h-auto justify-start py-3"
                >
                  {selectedRights.has(right) && <Check className="mr-2 h-4 w-4" />}
                  <span className="text-sm">{t(`pages.create.group.rights.${right}`)}</span>
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAdd}
            disabled={selectedRights.size === 0}
            className="w-full"
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            {t('pages.create.group.addGroupLink')}
          </Button>
        </>
      )}

      {/* Linked groups list */}
      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          <Label className="text-sm">{t('pages.create.group.linkedGroups')}</Label>
          <div className="space-y-2">
            {value.map((link) => (
              <Card key={link.groupId} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium">{link.groupName}</span>
                      <Badge variant="outline" className="text-xs">
                        {link.relationshipType === 'isParent'
                          ? t('pages.create.group.parent')
                          : t('pages.create.group.child')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {link.rights.map((right) => (
                        <Badge key={right} variant="secondary" className="text-xs">
                          {t(`pages.create.group.rights.${right}`)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(link.groupId)}
                    className="hover:bg-destructive/10 hover:text-destructive rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
