'use client';

import React from 'react';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ScrollableTabsList } from '@/components/ui/scrollable-tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface ContactInfo {
  email?: string;
  twitter?: string;
  website?: string;
  location?: string;
  region?: string;
  country?: string;
}

interface EventDetails {
  startDate?: string | number;
  endDate?: string | number;
  location?: string;
  tags?: string[];
}

interface InfoTabsProps {
  about?: string;
  contact?: ContactInfo;
  eventDetails?: EventDetails;
  className?: string;
}

export const InfoTabs: React.FC<InfoTabsProps> = ({ about, contact, eventDetails, className }) => {
  const { t } = useTranslation();

  // Helper functions for event details
  const formatDate = (date: string | number) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: string | number) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Don't render if there's no content
  if (!about && !contact && !eventDetails) {
    return null;
  }

  return (
    <Tabs defaultValue="about" className={className}>
      <ScrollableTabsList>
        <TabsTrigger value="about">{t('components.infoTabs.about')}</TabsTrigger>
        {eventDetails && (
          <TabsTrigger value="locationAndDate">
            {t('components.infoTabs.locationAndDate')}
          </TabsTrigger>
        )}
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

      {eventDetails && (
        <TabsContent value="locationAndDate" className="mt-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              {/* Time and Location side by side */}
              <div className="grid gap-4 md:grid-cols-2">
                {eventDetails.startDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatDate(eventDetails.startDate)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(eventDetails.startDate)}
                        {eventDetails.endDate && ` - ${formatTime(eventDetails.endDate)}`}
                      </p>
                    </div>
                  </div>
                )}

                {eventDetails.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t('components.infoTabs.labels.location')}</p>
                      <p className="text-sm text-muted-foreground">{eventDetails.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {eventDetails.tags &&
                Array.isArray(eventDetails.tags) &&
                eventDetails.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {eventDetails.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      )}

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
