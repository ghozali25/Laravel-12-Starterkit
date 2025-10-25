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
        "relative rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden",
        colSpanClass,
        isDragging && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <div className="absolute bottom-1.5 right-1.5 z-10 flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-primary"
              >
                <Maximize2 className="h-3.5 w-3.5" />
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
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(id)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-primary cursor-grab"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </Button>
      </div>

      <div className="group">
        {children}
      </div>
    </div>
  );
}