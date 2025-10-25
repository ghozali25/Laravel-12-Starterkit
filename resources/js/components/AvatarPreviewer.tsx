import React, { useEffect, useState } from 'react';
import ImagePreviewDialog from '@/components/ImagePreviewDialog';

interface Props {
  src: string | null;
  alt?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AvatarPreviewer({ src, alt = 'image', open, onOpenChange }: Props) {
  const [ready, setReady] = useState(false);
  const [Previewer, setPreviewer] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod: any = await import('react-image-previewer');
        if (!mounted) return;
        // Some libs export default, others named
        setPreviewer(mod.default ?? mod.Previewer ?? mod);
        setReady(true);
      } catch {
        setReady(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!src) return null;

  // Fallback to existing dialog if library not ready
  if (!ready || !Previewer) {
    return <ImagePreviewDialog src={src} alt={alt} open={open} onOpenChange={onOpenChange} />;
  }

  // Determine theme from document
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <>
      {open && (
        <Previewer
          images={[src]}
          isOpen={open}
          onClose={() => onOpenChange(false)}
          theme={isDark ? 'dark' : 'light'}
        />
      )}
    </>
  );
}
