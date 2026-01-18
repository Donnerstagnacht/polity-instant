import { MessageCircle, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";

interface AriaKaiStepProps {
  onNext: () => void;
  dontShowAgain: boolean;
  onDontShowAgainChange: (checked: boolean) => void;
}

export function AriaKaiStep({
  onNext,
  dontShowAgain,
  onDontShowAgainChange,
}: AriaKaiStepProps) {
  const { t } = useTranslation();

  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">
              AK
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-2xl">{t('onboarding.ariaKaiStep.title')}</CardTitle>
        <CardDescription className="text-base">
          {t('onboarding.ariaKaiStep.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                Hey! We're <span className="font-semibold text-foreground">Aria & Kai</span>, and
                we're here to help you navigate Polity and make the most of all its features.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <MessageCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                Whenever you need assistance, tips, or want to learn about groups, events, amendments,
                and more, just{' '}
                <span className="font-semibold text-foreground">
                  find us in your message conversations
                </span>
                . We're always ready to help!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">{t('onboarding.ariaKaiStep.quickTip')}</p>
          <p className="text-sm text-muted-foreground">
            {t('onboarding.ariaKaiStep.tipText')}
          </p>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="dont-show-again"
            checked={dontShowAgain}
            onCheckedChange={onDontShowAgainChange}
          />
          <label
            htmlFor="dont-show-again"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            {t('onboarding.ariaKaiStep.dontShowAgain')}
          </label>
        </div>

        <Button onClick={onNext} className="w-full" size="lg">
          {t('onboarding.ariaKaiStep.continue')}
        </Button>
      </CardContent>
    </Card>
  );
}
