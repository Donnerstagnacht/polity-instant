import { createFileRoute } from '@tanstack/react-router'
import { useGroupEventsPage } from '@/features/groups/hooks/useGroupEventsPage'
import { SharedCalendarHeader } from '@/features/events/ui/calendar/SharedCalendarHeader'
import { CalendarViewContainer } from '@/features/events/ui/calendar/CalendarViewContainer'
import { CalendarSearchFilter } from '@/features/events/ui/calendar/CalendarSearchFilter'

export const Route = createFileRoute('/_authed/group/$id/events')({
  component: GroupEventsPage,
})

function GroupEventsPage() {
  const { id } = Route.useParams()
  const gp = useGroupEventsPage(id)

  return (
    <div>
      <SharedCalendarHeader
        viewMode={gp.viewMode}
        setViewMode={gp.setViewMode}
        currentViewTitle={gp.currentViewTitle}
        onPrevious={gp.goToPrevious}
        onNext={gp.goToNext}
        onToday={gp.goToToday}
        title={gp.t('features.calendar.title')}
      />

      <CalendarSearchFilter
        searchQuery={gp.searchQuery}
        onSearchChange={gp.setSearchQuery}
        dateFilter={gp.dateFilter}
        onDateFilterChange={gp.setDateFilter}
      />

      <CalendarViewContainer
        viewMode={gp.viewMode}
        selectedDate={gp.selectedDate}
        events={gp.filteredEvents}
        allEvents={gp.events}
        onDateSelect={gp.setSelectedDate}
      />
    </div>
  )
}
