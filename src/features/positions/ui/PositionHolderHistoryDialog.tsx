'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { History, User, Calendar, TrendingUp, UserX, Award, UserCheck, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface PositionHolderHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: any;
}

const getReasonIcon = (reason: string) => {
  switch (reason) {
    case 'elected':
      return <Award className="h-4 w-4" />;
    case 'appointed':
      return <UserCheck className="h-4 w-4" />;
    case 'resigned':
      return <UserX className="h-4 w-4" />;
    case 'removed':
      return <UserX className="h-4 w-4" />;
    case 'term_ended':
      return <Clock className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

const getReasonLabel = (reason: string) => {
  switch (reason) {
    case 'elected':
      return 'Elected';
    case 'appointed':
      return 'Appointed';
    case 'resigned':
      return 'Resigned';
    case 'removed':
      return 'Removed';
    case 'term_ended':
      return 'Term Ended';
    default:
      return reason;
  }
};

const getReasonColor = (reason: string) => {
  switch (reason) {
    case 'elected':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'appointed':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'resigned':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'removed':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'term_ended':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

export function PositionHolderHistoryDialog({
  open,
  onOpenChange,
  position,
}: PositionHolderHistoryDialogProps) {
  // Sort history by startDate (most recent first)
  const sortedHistory = [...(position?.holderHistory || [])].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const currentHolder = position?.currentHolder;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Position History: {position?.title}
          </DialogTitle>
          <DialogDescription>
            Complete record of all holders for this position
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Holder Section */}
          {currentHolder && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary">
                    <AvatarImage src={currentHolder.imageURL} />
                    <AvatarFallback>
                      {currentHolder.fullName?.[0] || currentHolder.handle?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {currentHolder.fullName || currentHolder.handle}
                          </span>
                          <Badge className="bg-primary">Current Holder</Badge>
                        </div>
                        {currentHolder.handle && (
                          <div className="text-sm text-muted-foreground">
                            @{currentHolder.handle}
                          </div>
                        )}
                      </div>
                    </div>
                    {sortedHistory.length > 0 && sortedHistory[0]?.holder?.id === currentHolder.id && (
                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          {getReasonIcon(sortedHistory[0].reason)}
                          <span className="text-muted-foreground">
                            {getReasonLabel(sortedHistory[0].reason)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span className="text-muted-foreground">
                            Since {format(new Date(sortedHistory[0].startDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(sortedHistory[0].startDate), { addSuffix: false })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* History Timeline */}
          {sortedHistory.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                History Timeline
              </h4>
              <div className="relative space-y-4 before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
                {sortedHistory.map((entry: any, index: number) => {
                  const isActive = !entry.endDate;
                  const duration = entry.endDate
                    ? formatDistanceToNow(new Date(entry.startDate), {
                        addSuffix: false,
                      }) + ' - ' + formatDistanceToNow(new Date(entry.endDate), {
                        addSuffix: false,
                      })
                    : formatDistanceToNow(new Date(entry.startDate), { addSuffix: false });

                  return (
                    <div key={entry.id} className="relative flex gap-4 pl-0">
                      {/* Timeline dot */}
                      <div
                        className={`relative z-10 mt-1.5 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                          isActive
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background'
                        }`}
                      >
                        {entry.holder ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={entry.holder.imageURL} />
                            <AvatarFallback>
                              {entry.holder.fullName?.[0] || entry.holder.handle?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>

                      {/* Entry content */}
                      <Card className={`flex-1 ${isActive ? 'border-primary/30' : ''}`}>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-semibold">
                                  {entry.holder?.fullName || entry.holder?.handle || 'Unknown'}
                                </div>
                                {entry.holder?.handle && (
                                  <div className="text-sm text-muted-foreground">
                                    @{entry.holder.handle}
                                  </div>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className={getReasonColor(entry.reason)}
                              >
                                <span className="mr-1">{getReasonIcon(entry.reason)}</span>
                                {getReasonLabel(entry.reason)}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                  {format(new Date(entry.startDate), 'MMM d, yyyy')}
                                  {entry.endDate && (
                                    <> → {format(new Date(entry.endDate), 'MMM d, yyyy')}</>
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{duration}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <History className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No history records found for this position.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
