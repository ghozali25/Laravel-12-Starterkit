import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Maximize2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { useTranslation } from '@/lib/i18n';
import { UniqueIdentifier } from '@dnd-kit/core'; // Import UniqueIdentifier

interface DashboardWidgetWrapperProps {
  id: UniqueIdentifier; // Changed from string to UniqueIdentifier
  children: React.ReactNode;
  onRemove: (id: UniqueIdentifier) => void; // Updated parameter type
  colSpan: number;
  onColSpanChange: (id: UniqueIdentifier, newColSpan: number) => void; // Updated parameter type
}

export default function DashboardWidgetWrapper({ id, children, onRemove, colSpan, onColSpanChange }: DashboardWidgetWrapperProps) {
  const { t } = useTranslation();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Notify charts to recalc when the wrapper size changes
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      window.dispatchEvent(new Event('resize'));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.8 : 1,
  };

  // Responsive column spans without dynamic class names (ensure Tailwind generates classes)
  const smSpan = Math.min(colSpan, 2);
  const lgSpan = Math.min(colSpan, 3);
  // On xl, dashboard uses 6 columns
  const xlSpan = Math.min(colSpan, 6);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative w-full min-w-0 rounded-2xl bg-transparent text-card-foreground overflow-visible",
        // base
        'col-span-1',
        // sm
        smSpan === 1 && 'sm:col-span-1',
        smSpan === 2 && 'sm:col-span-2',
        // lg
        lgSpan === 1 && 'lg:col-span-1',
        lgSpan === 2 && 'lg:col-span-2',
        lgSpan === 3 && 'lg:col-span-3',
        // xl
        xlSpan === 1 && 'xl:col-span-1',
        xlSpan === 2 && 'xl:col-span-2',
        xlSpan === 3 && 'xl:col-span-3',
        xlSpan === 4 && 'xl:col-span-4',
        xlSpan === 5 && 'xl:col-span-5',
        xlSpan === 6 && 'xl:col-span-6',
        
        isDragging && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <div className="absolute bottom-2 right-2 z-10 flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-5 sm:w-5 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(id)}
          >
            <X className="h-3 w-3" />
          </Button>

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
              <DropdownMenuItem onClick={() => onColSpanChange(id, 1)}>{t('1 Column')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onColSpanChange(id, 2)}>{t('2 Columns')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onColSpanChange(id, 3)}>{t('3 Columns')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onColSpanChange(id, 4)}>{t('4 Columns')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onColSpanChange(id, 5)}>{t('5 Columns')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onColSpanChange(id, 6)}>{t('6 Columns')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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

      <div ref={containerRef} className="h-full w-full min-w-0">
        {children}
      </div>
    </div>
  );
}