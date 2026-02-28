import React from 'react';
import { Card, CardContent } from '@/features/shared/ui/ui/card';

interface UserAboutProps {
  about: string;
}

export const UserAbout: React.FC<UserAboutProps> = ({ about }) => (
  <Card>
    <CardContent className="pt-6">
      <p>{about}</p>
    </CardContent>
  </Card>
);
