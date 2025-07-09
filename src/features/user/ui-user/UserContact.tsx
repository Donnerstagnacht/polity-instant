import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface UserContactProps {
  contact: {
    email: string;
    twitter: string;
    website: string;
    location: string;
  };
}

export const UserContact: React.FC<UserContactProps> = ({ contact }) => (
  <Card>
    <CardContent className="space-y-2 pt-6">
      <div className="flex items-center gap-2">
        <span className="font-semibold">Email:</span>
        <span>{contact.email}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">Twitter:</span>
        <span>{contact.twitter}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">Website:</span>
        <span>{contact.website}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">Location:</span>
        <span>{contact.location}</span>
      </div>
    </CardContent>
  </Card>
);
