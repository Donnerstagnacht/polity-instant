import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EventEdit } from '@/features/events/ui/EventEdit'

export const Route = createFileRoute('/_authed/create/event')({
  component: CreateEventPage,
})

function CreateEventPage() {
  const [eventId] = useState(() => crypto.randomUUID())

  return <EventEdit eventId={eventId} mode="create" />
}
