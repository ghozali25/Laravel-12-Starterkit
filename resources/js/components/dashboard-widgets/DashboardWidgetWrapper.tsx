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

interface DashboardWidgetWrapperProps {
  id: string;
  children: React.ReactNode;
  onRemove: (id: string) => void;
  colSpan: number;
  onColSpanChange: (id: string, newColSpan: number) => void;
}

export default function DashboardWidgetWrapper({ id, children, onRemove, colSpan, onColSpanChange }: DashboardWidgetWrapperProps) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.8 : 1,
  };

  const colSpanClass = `lg:col-span-${colSpan}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative rounded-lg border bg-card text-card-foreground shadow-sm",
        colSpanClass,
        isDragging && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onColSpanChange(id, 1)}>
              {t('1 Column')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onColSpanChange(id, 2)}>
              {t('2 Columns')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onColSpanChange(id, 3)}>
              {t('3 Columns')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(id)}
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-primary cursor-grab"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </div>
      <div className="group">
        {children}
      </div>
    </div>
  );
}