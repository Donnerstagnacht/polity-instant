/**
 * VersionComparisonView Component
 *
 * Displays a side-by-side comparison of the original version (when group
 * added their support) and the current version after changes were accepted.
 */

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/use-translation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, FileText, ArrowRight } from 'lucide-react';

interface ChangeRequest {
  id: string;
  title: string;
  description: string;
}

interface VersionComparisonViewProps {
  originalVersion: any;
  currentVersion: any;
  changeRequest?: ChangeRequest | null;
}

export function VersionComparisonView({
  originalVersion,
  currentVersion,
  changeRequest,
}: VersionComparisonViewProps) {
  const { t } = useTranslation();

  // Extract text from Plate.js document format
  const extractText = (content: any): string => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content.map(extractText).join('\n');
    }
    if (content.text) return content.text;
    if (content.children) return extractText(content.children);
    return '';
  };

  const originalText = useMemo(() => extractText(originalVersion), [originalVersion]);
  const currentText = useMemo(() => extractText(currentVersion), [currentVersion]);

  // Simple diff highlighting - in production, use a proper diff library
  const hasChanges = originalText !== currentText;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {t('features.amendments.supportConfirmation.comparison.title')}
          </CardTitle>
          {hasChanges && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {t('features.amendments.supportConfirmation.comparison.hasChanges')}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {changeRequest && (
          <div className="mb-4 rounded-lg bg-muted p-3">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              {changeRequest.title}
            </div>
            <p className="text-sm text-muted-foreground">{changeRequest.description}</p>
          </div>
        )}

        <Tabs defaultValue="side-by-side" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="side-by-side">
              {t('features.amendments.supportConfirmation.comparison.sideBySide')}
            </TabsTrigger>
            <TabsTrigger value="original">
              {t('features.amendments.supportConfirmation.comparison.original')}
            </TabsTrigger>
            <TabsTrigger value="current">
              {t('features.amendments.supportConfirmation.comparison.current')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="side-by-side">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Badge variant="outline">
                    {t('features.amendments.supportConfirmation.comparison.originalLabel')}
                  </Badge>
                </div>
                <ScrollArea className="h-64 w-full rounded-md border p-4">
                  <div className="whitespace-pre-wrap font-mono text-sm">
                    {originalText || (
                      <span className="italic text-muted-foreground">
                        {t('features.amendments.supportConfirmation.comparison.empty')}
                      </span>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  <Badge variant="outline">
                    {t('features.amendments.supportConfirmation.comparison.currentLabel')}
                  </Badge>
                </div>
                <ScrollArea className="h-64 w-full rounded-md border p-4">
                  <div className="whitespace-pre-wrap font-mono text-sm">
                    {currentText || (
                      <span className="italic text-muted-foreground">
                        {t('features.amendments.supportConfirmation.comparison.empty')}
                      </span>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="original">
            <ScrollArea className="h-80 w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap font-mono text-sm">
                {originalText || (
                  <span className="italic text-muted-foreground">
                    {t('features.amendments.supportConfirmation.comparison.empty')}
                  </span>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="current">
            <ScrollArea className="h-80 w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap font-mono text-sm">
                {currentText || (
                  <span className="italic text-muted-foreground">
                    {t('features.amendments.supportConfirmation.comparison.empty')}
                  </span>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
