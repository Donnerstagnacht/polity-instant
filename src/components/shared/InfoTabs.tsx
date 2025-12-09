'use client';

import React from 'react';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ScrollableTabsList } from '@/components/ui/scrollable-tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';

interface ContactInfo {
  email?: string;
  twitter?: string;
  website?: string;
  location?: string;
  region?: string;
  country?: string;
}

interface InfoTabsProps {
  about?: string;
  contact?: ContactInfo;
  className?: string;
}

export const InfoTabs: React.FC<InfoTabsProps> = ({ about, contact, className }) => {
  const { t } = useTranslation();

  // Don't render if there's no content
  if (!about && !contact) {
    return null;
  }

  return (
    <Tabs defaultValue="about" className={className}>
      <ScrollableTabsList>
        <TabsTrigger value="about">{t('components.infoTabs.about')}</TabsTrigger>
        <TabsTrigger value="contact">{t('components.infoTabs.contact')}</TabsTrigger>
      </ScrollableTabsList>

      <TabsContent value="about" className="mt-4">
        <Card>
          <CardContent className="pt-6">
            {about ? (
              <p>{about}</p>
            ) : (
              <p className="text-muted-foreground">{t('components.infoTabs.noInformation')}</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contact" className="mt-4">
        <Card>
          <CardContent className="space-y-2 pt-6">
            {contact?.email && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t('components.infoTabs.labels.email')}:</span>
                <span>{contact.email}</span>
              </div>
            )}
            {contact?.twitter && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t('components.infoTabs.labels.twitter')}:</span>
                <span>{contact.twitter}</span>
              </div>
            )}
            {contact?.website && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t('components.infoTabs.labels.website')}:</span>
                <span>{contact.website}</span>
              </div>
            )}
            {contact?.location && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t('components.infoTabs.labels.location')}:</span>
                <span>{contact.location}</span>
              </div>
            )}
            {contact?.region && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t('components.infoTabs.labels.region')}:</span>
                <span>{contact.region}</span>
              </div>
            )}
            {contact?.country && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t('components.infoTabs.labels.country')}:</span>
                <span>{contact.country}</span>
              </div>
            )}
            {!contact?.email &&
              !contact?.twitter &&
              !contact?.website &&
              !contact?.location &&
              !contact?.region &&
              !contact?.country && (
                <p className="text-muted-foreground">{t('components.infoTabs.noContact')}</p>
              )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
