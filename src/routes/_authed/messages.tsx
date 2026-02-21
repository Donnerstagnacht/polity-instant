import { createFileRoute } from '@tanstack/react-router'
import MessagesPage from '@/features/messages/MessagesPage'

export const Route = createFileRoute('/_authed/messages')({
  component: MessagesPage,
})
