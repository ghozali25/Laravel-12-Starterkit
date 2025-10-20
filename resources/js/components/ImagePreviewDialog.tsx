import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';

interface ImagePreviewDialogProps {
  src: string | null;
  alt: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImagePreviewDialog({ src, alt, open, onOpenChange }: ImagePreviewDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-semibold">{t('Image Preview')}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {src ? (
            <img src={src} alt={alt} className="max-w-full h-auto mx-auto rounded-md" />
          ) : (
            <div className="flex items-center justify-center h-48 bg-muted rounded-md text-muted-foreground">
              {t('No image available')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}