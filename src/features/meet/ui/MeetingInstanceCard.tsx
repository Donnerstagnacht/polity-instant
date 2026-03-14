import { Button } from '@/features/shared/ui/ui/button'
import { Badge } from '@/features/shared/ui/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar'
import { Clock, Users, Trash2, Video } from 'lucide-react'
import { cn } from '@/features/shared/utils/utils'
import { formatTime } from '@/features/meet/logic/date-helpers.ts'
import type { MeetingInstance } from '../hooks/useMeetPage'

interface MeetingInstanceCardProps {
  instance: MeetingInstance
  isOwner: boolean
  onBook: (instance: MeetingInstance) => void
  onCancel: (instance: MeetingInstance) => void
  onDelete: (eventId: string) => void
}

export function MeetingInstanceCard({
  instance,
  isOwner,
  onBook,
  onCancel,
  onDelete,
}: MeetingInstanceCardProps) {
  const isPast = instance.endDate < Date.now()
  const isFull = instance.bookingCount >= instance.maxBookings
  const isAvailable = instance.isBookable && !isPast && !isFull
  const canBook = !isOwner && isAvailable && !instance.isBookedByMe
  const canCancel = !isOwner && instance.isBookedByMe && !isPast

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-colors',
        isPast && 'opacity-50',
        instance.isBookedByMe && 'border-green-500/50 bg-green-500/5',
        canBook && 'hover:border-primary hover:bg-accent',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{instance.title}</h4>
            {instance.meetingType === 'public-meeting' && (
              <Badge variant="secondary">
                <Users className="mr-1 h-3 w-3" />
                Public
              </Badge>
            )}
            {instance.isBookedByMe && (
              <Badge className="bg-green-500/15 text-green-700 dark:text-green-400">
                Booked
              </Badge>
            )}
            {isFull && !instance.isBookedByMe && (
              <Badge variant="outline">Fully Booked</Badge>
            )}
            {isPast && <Badge variant="secondary">Past</Badge>}
          </div>

          {instance.description && (
            <p className="text-sm text-muted-foreground">{instance.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            {formatTime(instance.startDate)} - {formatTime(instance.endDate)}
          </div>

          {instance.streamUrl && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Video className="h-4 w-4" />
              Video call available
            </div>
          )}

          {/* Show booking participants */}
          {instance.bookingCount > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex -space-x-2">
                {instance.participants
                  .filter(p => p.user_id !== instance.creator?.id)
                  .filter(p => {
                    if (instance.instanceDate === null) {
                      return !p.instance_date || p.instance_date === 0
                    }
                    return p.instance_date === instance.instanceDate
                  })
                  .slice(0, 5)
                  .map(p => (
                    <Avatar key={p.id} className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={p.user?.avatar ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {p.user?.first_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {instance.bookingCount} attending
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {canBook && (
            <Button size="sm" onClick={() => onBook(instance)}>
              Book
            </Button>
          )}
          {canCancel && (
            <Button size="sm" variant="outline" onClick={() => onCancel(instance)}>
              Cancel
            </Button>
          )}
          {isOwner && !isPast && !instance.isRecurringInstance && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(instance.parentEventId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
