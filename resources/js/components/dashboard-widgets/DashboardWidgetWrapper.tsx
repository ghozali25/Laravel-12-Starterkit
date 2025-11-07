import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/lib/i18n';
import { UniqueIdentifier } from '@dnd-kit/core';

interface DashboardWidgetWrapperProps {
  id: UniqueIdentifier;
  children: React.ReactNode;
  onRemove: (id: UniqueIdentifier) => void;
  colSpan: number;
  onColSpanChange: (id: UniqueIdentifier, newColSpan: number) => void;
}

export default function DashboardWidgetWrapper({
  id,
  children,
  onRemove,
  colSpan,
  onColSpanChange,
}: DashboardWidgetWrapperProps) {
  const { t } = useTranslation();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const startPosRef = React.useRef<{ startY: number; startH: number } | null>(null);
  const [height, setHeight] = React.useState<number>(320);
  const [isResizing, setIsResizing] = React.useState(false);

  // DnD Sortable logic
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  // Resize observer supaya chart re-render saat ukuran berubah
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return;
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      // Trigger resize event agar Chart.js dan komponen responsif ikut menyesuaikan
      window.dispatchEvent(new Event('resize'));
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Style saat drag
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.8 : 1,
    gridColumn: `span ${Math.min(colSpan, 6)}`, // kolom dinamis aman dari purge
    height: `${Math.max(200, height)}px`,
  } as React.CSSProperties;

  const onResizeMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    setIsResizing(true);
    startPosRef.current = { startY: e.clientY, startH: el.getBoundingClientRect().height };

    const onMove = (ev: MouseEvent) => {
      if (!startPosRef.current) return;
      const dy = ev.clientY - startPosRef.current.startY;
      const next = Math.max(200, Math.round(startPosRef.current.startH + dy));
      setHeight(next);
    };
    const onUp = () => {
      setIsResizing(false);
      startPosRef.current = null;
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('resize'));
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative w-full min-w-0 rounded-2xl bg-transparent text-card-foreground overflow-visible',
        isDragging && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Tombol kontrol kanan bawah */}
      <div className="absolute bottom-2 right-2 z-10 flex items-center justify-center gap-1">
        {/* Tombol hapus widget */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-5 sm:w-5 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(id)}
        >
          <X className="h-3 w-3" />
        </Button>

        {/* Dropdown ubah ukuran kolom */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-5 sm:w-5 text-muted-foreground hover:text-primary"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <DropdownMenuItem key={n} onClick={() => onColSpanChange(id, n)}>
                {t(`${n} Column${n > 1 ? 's' : ''}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tombol drag handle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-5 sm:w-5 text-muted-foreground hover:text-primary cursor-grab"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-3 w-3" />
        </Button>
      </div>
      
      <div
        onMouseDown={onResizeMouseDown}
        className={cn(
          'absolute right-10 bottom-2 h-4 w-4 rounded-sm bg-muted hover:bg-muted/70 cursor-ns-resize border border-border',
          isResizing && 'bg-primary/40'
        )}
        title={t('Drag to resize height')}
      />

      {/* Isi widget */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[200px] min-w-0 p-2"
      >
        {children}
      </div>
    </div>
  );
}
