'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/shared/ui/ui/tabs';
import { ImageUpload } from './ImageUpload';
import { VideoUpload } from './VideoUpload';

interface MediaUploadProps {
  currentImage?: string;
  onImageChange: (url: string) => void;
  currentVideo?: string;
  onVideoChange: (url: string) => void;
  entityType: string;
  entityId: string;
  imageLabel?: string;
  imageDescription?: string;
  videoLabel?: string;
  videoDescription?: string;
  className?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  currentImage,
  onImageChange,
  currentVideo,
  onVideoChange,
  entityType,
  entityId,
  imageLabel,
  imageDescription,
  videoLabel,
  videoDescription,
  className,
}) => {
  return (
    <Tabs defaultValue="image" className={className}>
      <TabsList className="w-full">
        <TabsTrigger value="image" className="flex-1">Image</TabsTrigger>
        <TabsTrigger value="video" className="flex-1">Video</TabsTrigger>
      </TabsList>
      <TabsContent value="image">
        <ImageUpload
          currentImage={currentImage}
          onImageChange={onImageChange}
          entityType={entityType}
          entityId={entityId}
          label={imageLabel}
          description={imageDescription}
        />
      </TabsContent>
      <TabsContent value="video">
        <VideoUpload
          currentVideo={currentVideo}
          onVideoChange={onVideoChange}
          label={videoLabel}
          description={videoDescription}
        />
      </TabsContent>
    </Tabs>
  );
};
