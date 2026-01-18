'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Video, Loader2 } from 'lucide-react';
import { cn } from '@/utils/utils';
import { useUploadFile } from '@/hooks/use-upload-file';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';

interface VideoUploadProps {
  currentVideo?: string;
  currentThumbnail?: string;
  onVideoChange: (videoUrl: string) => void;
  label?: string;
  description?: string;
  className?: string;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  currentVideo,
  currentThumbnail,
  onVideoChange,
  label = 'Video',
  description = 'Upload a video file',
  className,
}) => {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string>(currentVideo || '');
  const [videoUrl, setVideoUrl] = useState<string>(currentVideo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, progress } = useUploadFile();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's a video file
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file');
        return;
      }

      // Check file size (limit to 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast.error('Video file size must be less than 100MB');
        return;
      }

      try {
        // Upload to InstantDB
        const uploadResult = await uploadFile(file);
        if (uploadResult?.url) {
          setPreviewUrl(uploadResult.url);
          setVideoUrl(uploadResult.url);
          onVideoChange(uploadResult.url);
          toast.success('Video uploaded successfully');
        }
      } catch (error) {
        console.error('Error uploading video:', error);
        toast.error('Failed to upload video');
      }
    }
  };

  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    setPreviewUrl(url);
    onVideoChange(url);
  };

  const handleRemoveVideo = () => {
    setPreviewUrl('');
    setVideoUrl('');
    onVideoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-sm">
            <p className="font-medium">{label}</p>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {/* Video Preview */}
          {previewUrl && (
            <div className="relative">
              <video
                controls
                preload="metadata"
                poster={currentThumbnail || undefined}
                className="w-full rounded-lg"
                src={previewUrl}
                style={{ maxHeight: '400px' }}
                onLoadedMetadata={e => {
                  const video = e.currentTarget;
                  // Only set currentTime if no poster is provided
                  if (!currentThumbnail) {
                    video.currentTime = 0.1;
                  }
                }}
              >
                Your browser does not support the video tag.
              </video>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handleRemoveVideo}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.actions.uploading')} {progress}%
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  {t('common.actions.uploadVideo')}
                </>
              )}
            </Button>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('common.labels.orProvideUrl')}</label>
            <input
              type="url"
              value={videoUrl}
              onChange={e => handleUrlChange(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isUploading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
