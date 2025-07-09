import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAbout } from './UserAbout';
import { UserContact } from './UserContact';

interface UserInfoTabsProps {
  about: string;
  contact: {
    email: string;
    twitter: string;
    website: string;
    location: string;
  };
}

export const UserInfoTabs: React.FC<UserInfoTabsProps> = ({ about, contact }) => (
  <Tabs defaultValue="about" className="mb-12">
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="about">About</TabsTrigger>
      <TabsTrigger value="contact">Contact</TabsTrigger>
    </TabsList>
    <TabsContent value="about" className="mt-4">
      <UserAbout about={about} />
    </TabsContent>
    <TabsContent value="contact" className="mt-4">
      <UserContact contact={contact} />
    </TabsContent>
  </Tabs>
);
