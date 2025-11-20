import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, Image as ImageIcon, FileUp } from 'lucide-react';

export interface UploadButtonProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  icon?: 'upload' | 'image' | 'file';
  onFileSelected?: (file: File | null) => void;
  onFilesSelected?: (files: File[]) => void;
  placeholder?: string;
}

export function UploadButton({
  accept,
  multiple,
  disabled,
  className,
  label = 'Choose file',
  icon = 'upload',
  onFileSelected,
  onFilesSelected,
  placeholder = 'No file chosen',
}: UploadButtonProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const file = files.length > 0 ? files[0] : null;

    onFilesSelected?.(files);
    onFileSelected?.(file);

    if (!files.length) {
      setFileName(null);
    } else if (files.length === 1) {
      setFileName(files[0].name);
    } else {
      setFileName(`${files.length} files selected`);
    }
  };

  const Icon = icon === 'image' ? ImageIcon : icon === 'file' ? FileUp : Upload;

  return (
    <div className={cn('relative inline-flex items-center gap-3', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
        className="absolute inset-0 h-0 w-0 opacity-0 pointer-events-none"
      />
      <Button type="button" variant="outline" onClick={handleClick} disabled={disabled} className="gap-2">
        <Icon className="h-4 w-4" /> {label}
      </Button>
      <span className="text-sm text-muted-foreground truncate max-w-[220px]">
        {fileName ?? placeholder}
      </span>
    </div>
  );
}
