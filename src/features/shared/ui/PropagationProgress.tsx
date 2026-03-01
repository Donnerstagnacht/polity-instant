import { Loader2 } from 'lucide-react'

interface PropagationProgressProps {
  message: string
}

/**
 * Animated overlay for long-running hierarchy operations
 * (e.g. propagating memberships after linking groups).
 */
export function PropagationProgress({ message }: PropagationProgressProps) {
  return (
    <div className="bg-background/80 absolute inset-0 z-50 flex items-center justify-center rounded-lg backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}
