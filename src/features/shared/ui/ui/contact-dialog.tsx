import { useState } from 'react'
import { Mail, ExternalLink } from 'lucide-react'
import { Button } from '@/features/shared/ui/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/features/shared/ui/ui/dialog.tsx'
import { useTranslation } from '@/features/shared/hooks/use-translation.ts'

const GITHUB_ISSUES_URL = 'https://github.com/Donnerstagnacht/polity-instant/issues'
const CONTACT_EMAIL = 'polity.live@gmail.com'

interface ContactDialogProps {
  children: React.ReactNode
}

export function ContactDialog({ children }: ContactDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('common.contactDialog.title')}</DialogTitle>
          <DialogDescription>{t('common.contactDialog.description')}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Button variant="outline" className="w-full justify-start gap-3" asChild>
            <a href={`mailto:${CONTACT_EMAIL}`}>
              <Mail className="h-4 w-4 shrink-0" />
              <div className="text-left">
                <div className="text-sm font-medium">{t('common.contactDialog.email')}</div>
                <div className="text-xs text-muted-foreground">{CONTACT_EMAIL}</div>
              </div>
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start gap-3" asChild>
            <a href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 shrink-0" />
              <div className="text-left">
                <div className="text-sm font-medium">{t('common.contactDialog.github')}</div>
                <div className="text-xs text-muted-foreground">github.com/Donnerstagnacht/polity-instant</div>
              </div>
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
