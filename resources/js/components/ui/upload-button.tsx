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
  placeholder = 'No file chosen',
}: UploadButtonProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
    onFileSelected?.(file);
    setFileName(file ? file.name : null);
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
