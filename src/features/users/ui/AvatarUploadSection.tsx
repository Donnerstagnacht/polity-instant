import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';

interface AvatarUploadSectionProps {
  avatar: string;
  userName: string;
  isUploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AvatarUploadSection({
  avatar,
  userName,
  isUploading,
  onUpload,
}: AvatarUploadSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Picture</CardTitle>
        <CardDescription>Update your user picture</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatar} alt={userName} />
            <AvatarFallback>{userName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <Label
            htmlFor="avatar-upload"
            className="flex cursor-pointer items-center gap-2 text-sm font-medium"
          >
            <Button type="button" variant="outline" size="sm" asChild>
              <span>
                <Camera className="mr-2 h-4 w-4" />
                Change Avatar
              </span>
            </Button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={onUpload}
              disabled={isUploading}
              className="hidden"
            />
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or GIF. Max size 5MB.</p>
        </div>
      </CardContent>
    </Card>
  );
}
