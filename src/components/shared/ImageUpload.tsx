'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { cn } from '@/utils/utils';
import { useTranslation } from '@/hooks/use-translation';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  label?: string;
  description?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  label = 'User Image',
  description = 'Upload a user image or provide a URL',
  className,
}) => {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '');
  const [imageUrl, setImageUrl] = useState<string>(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
    onImageChange(url);
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setImageUrl('');
    onImageChange('');
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

          {/* Image Preview */}
          {previewUrl && (
            <div className="relative">
              <img src={previewUrl} alt="Preview" className="h-48 w-full rounded-lg object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handleRemoveImage}
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
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              {t('common.actions.uploadImage')}
            </Button>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('common.labels.orProvideUrl')}</label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => handleUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
