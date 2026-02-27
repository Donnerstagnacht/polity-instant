import { createFileRoute, notFound } from '@tanstack/react-router'

export const Route = createFileRoute('/$')({
  loader: () => { throw notFound() },
})
