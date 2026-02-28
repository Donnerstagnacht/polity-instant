import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card.tsx'
import { Badge } from '@/features/shared/ui/ui/badge.tsx'

interface SummaryFieldProps {
  label: string
  value: React.ReactNode
}

export function SummaryField({ label, value }: SummaryFieldProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <strong>{label}:</strong>
      <span className="text-muted-foreground">{value}</span>
    </div>
  )
}

interface CreateReviewCardProps {
  badge: string
  secondaryBadge?: string
  title: string
  subtitle?: string
  hashtags?: string[]
  gradient?: string
  children: React.ReactNode
}

export function CreateReviewCard({
  badge,
  secondaryBadge,
  title,
  subtitle,
  hashtags,
  gradient = 'from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/50',
  children,
}: CreateReviewCardProps) {
  return (
    <Card
      className={`overflow-hidden border-2 bg-gradient-to-br ${gradient}`}
    >
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="default" className="text-xs">
            {badge}
          </Badge>
          {secondaryBadge && (
            <Badge variant="secondary" className="text-xs">
              {secondaryBadge}
            </Badge>
          )}
        </div>
        {hashtags && hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hashtags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        <CardTitle className="text-lg">{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  )
}
