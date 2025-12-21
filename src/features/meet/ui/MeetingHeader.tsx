import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Globe, Lock } from 'lucide-react';
import { formatMeetingType } from '../utils/meetingFormatters';

interface MeetingHeaderProps {
  title: string;
  isPublic: boolean;
  owner: {
    id: string;
    name?: string;
    avatar?: string;
  };
  meetingType: string;
}

export function MeetingHeader({ title, isPublic, owner, meetingType }: MeetingHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <div className="mb-2 flex items-center justify-center gap-3">
        <h1 className="text-4xl font-bold">{title}</h1>
        {isPublic ? (
          <Badge variant="default">
            <Globe className="mr-1 h-3 w-3" />
            Public
          </Badge>
        ) : (
          <Badge variant="secondary">
            <Lock className="mr-1 h-3 w-3" />
            Private
          </Badge>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={owner?.avatar} />
          <AvatarFallback>{owner?.name?.[0]?.toUpperCase() || 'O'}</AvatarFallback>
        </Avatar>
        <div className="text-left">
          <p className="text-sm font-medium">Hosted by {owner?.name || 'Unknown'}</p>
          <p className="text-xs text-muted-foreground">{formatMeetingType(meetingType)}</p>
        </div>
      </div>
    </div>
  );
}
