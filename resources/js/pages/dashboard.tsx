import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Plus, Users, HardDrive, Activity } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Widget Components and their Props interfaces
import MonthlyActivityChart, { MonthlyActivityChartProps } from '@/components/dashboard-widgets/MonthlyActivityChart';
import MonthlyTrendsChart, { MonthlyTrendsChartProps } from '@/components/dashboard-widgets/MonthlyTrendsChart';
import UserRolesPieChart, { UserRolesPieChartProps } from '@/components/dashboard-widgets/UserRolesPieChart';
import ResourceUsageAreaChart, { ResourceUsageAreaChartProps } from '@/components/dashboard-widgets/ResourceUsageAreaChart';
import PerformanceMetricsRadialChart, { PerformanceMetricsRadialChartProps } from '@/components/dashboard-widgets/PerformanceMetricsRadialChart';
import SummaryCard, { SummaryCardProps } from '@/components/dashboard-widgets/SummaryCard';
import DashboardWidgetWrapper from '@/components/dashboard-widgets/DashboardWidgetWrapper';

// Define a type for each widget's entry in widgetComponents
type WidgetComponentEntry<P> = {
  component: React.ComponentType<P>;
  defaultProps: P;
};

// Define the overall type for widgetComponents using a mapped type
type WidgetComponentsMap = {
  SummaryCardUsers: WidgetComponentEntry<SummaryCardProps>;
  SummaryCardBackups: WidgetComponentEntry<SummaryCardProps>;
  SummaryCardActivityLogs: WidgetComponentEntry<SummaryCardProps>;
  MonthlyActivityChart: WidgetComponentEntry<MonthlyActivityChartProps>;
  MonthlyTrendsChart: WidgetComponentEntry<MonthlyTrendsChartProps>;
  UserRolesPieChart: WidgetComponentEntry<UserRolesPieChartProps>;
  ResourceUsageAreaChart: WidgetComponentEntry<ResourceUsageAreaChartProps>;
  PerformanceMetricsRadialChart: WidgetComponentEntry<PerformanceMetricsRadialChartProps>;
};

// Define available widget types and their components with strong typing
const widgetComponents: WidgetComponentsMap = {
  SummaryCardUsers: { component: SummaryCard, defaultProps: { label: 'Users', value: 420, icon: <Users className="h-4 w-4 text-muted-foreground" /> } },
  SummaryCardBackups: { component: SummaryCard, defaultProps: { label: 'Backups', value: 80, icon: <HardDrive className="h-4 w-4 text-muted-foreground" /> } },
  SummaryCardActivityLogs: { component: SummaryCard, defaultProps: { label: 'Activity Logs', value: 1570, icon: <Activity className="h-4 w-4 text-muted-foreground" /> } },
  MonthlyActivityChart: { component: MonthlyActivityChart, defaultProps: { data: [ { name: 'Jan', Users: 50, Backups: 10 }, { name: 'Feb', Users: 120, Backups: 25 }, { name: 'Mar', Users: 80, Backups: 15 }, { name: 'Apr', Users: 150, Backups: 30 }, { name: 'May', Users: 90, Backups: 20 }, { name: 'Jun', Users: 170, Backups: 35 }, ] } },
  MonthlyTrendsChart: { component: MonthlyTrendsChart, defaultProps: { data: [ { name: 'Jan', Users: 50, Backups: 10 }, { name: 'Feb', Users: 120, Backups: 25 }, { name: 'Mar', Users: 80, Backups: 15 }, { name: 'Apr', Users: 150, Backups: 30 }, { name: 'May', Users: 90, Backups: 20 }, { name: 'Jun', Users: 170, Backups: 35 }, ] } },
  UserRolesPieChart: { component: UserRolesPieChart, defaultProps: { data: [ { name: 'Admin', value: 20, color: '#fbbf24' }, { name: 'User', value: 80, color: '#a78bfa' }, ] } },
  ResourceUsageAreaChart: { component: ResourceUsageAreaChart, defaultProps: { data: [ { month: 'Jan', users: 400, backups: 100 }, { month: 'Feb', users: 300, backups: 150 }, { month: 'Mar', users: 500, backups: 200 }, { month: 'Apr', users: 700, backups: 250 }, ] } },
  PerformanceMetricsRadialChart: { component: PerformanceMetricsRadialChart, defaultProps: { data: [ { name: 'A', value: 100, fill: '#8884d8' }, { name: 'B', value: 80, fill: '#83a6ed' }, { name: 'C', value: 50, fill: '#8dd1e1' }, ] } },
};

// Type for a widget instance on the dashboard using a discriminated union
type DashboardWidget = {
  [K in keyof WidgetComponentsMap]: {
    id: string;
    type: K;
    props: WidgetComponentsMap[K]['defaultProps'];
    colSpan: number; // Add colSpan property
  };
}[keyof WidgetComponentsMap];


export default function Dashboard() {
  const { t } = useTranslation();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);

  // Initialize with default widgets if none are saved (or for demonstration)
  useEffect(() => {
    if (widgets.length === 0) {
      setWidgets([
        { id: 'summary-users', type: 'SummaryCardUsers', props: { label: t('Users'), value: 420, icon: <Users className="h-4 w-4 text-muted-foreground" /> }, colSpan: 1 },
        { id: 'summary-backups', type: 'SummaryCardBackups', props: { label: t('Backups'), value: 80, icon: <HardDrive className="h-4 w-4 text-muted-foreground" /> }, colSpan: 1 },
        { id: 'summary-activity', type: 'SummaryCardActivityLogs', props: { label: t('Activity Logs'), value: 1570, icon: <Activity className="h-4 w-4 text-muted-foreground" /> }, colSpan: 1 } ,
        { id: 'monthly-activity', type: 'MonthlyActivityChart', props: widgetComponents.MonthlyActivityChart.defaultProps, colSpan: 2 },
        { id: 'user-roles', type: 'UserRolesPieChart', props: widgetComponents.UserRolesPieChart.defaultProps, colSpan: 1 },
        { id: 'monthly-trends', type: 'MonthlyTrendsChart', props: widgetComponents.MonthlyTrendsChart.defaultProps, colSpan: 2 },
        { id: 'resource-usage', type: 'ResourceUsageAreaChart', props: widgetComponents.ResourceUsageAreaChart.defaultProps, colSpan: 2 },
        { id: 'performance-metrics', type: 'PerformanceMetricsRadialChart', props: widgetComponents.PerformanceMetricsRadialChart.defaultProps, colSpan: 1 },
      ]);
    }
  }, [t]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setWidgets((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets((prevWidgets) => prevWidgets.filter((widget) => widget.id !== id));
    toast.success(t('Widget removed successfully!'));
  };

  const handleColSpanChange = (id: string, newColSpan: number) => {
    setWidgets((prevWidgets) =>
      prevWidgets.map((widget) =>
        widget.id === id ? { ...widget, colSpan: newColSpan } : widget
      )
    );
    toast.success(t('Widget size updated!'));
  };

  // Make handleAddWidget generic to correctly infer the type
  const handleAddWidget = <T extends keyof WidgetComponentsMap>(widgetType: T) => {
    const newId = `${widgetType}-${Date.now()}`; // Unique ID for the new widget instance
    const defaultColSpan = (widgetType.includes('SummaryCard') || widgetType.includes('PieChart') || widgetType.includes('RadialChart')) ? 1 : 2; // Default colSpan based on widget type
    const newWidget: { id: string; type: T; props: WidgetComponentsMap[T]['defaultProps']; colSpan: number } = {
      id: newId,
      type: widgetType,
      props: widgetComponents[widgetType].defaultProps,
      colSpan: defaultColSpan,
    };
    setWidgets((prevWidgets) => [...prevWidgets, newWidget as DashboardWidget]); // Cast to DashboardWidget
    setIsAddWidgetDialogOpen(false);
    toast.success(t('Widget added successfully!'));
  };

  const renderWidgetComponent = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'SummaryCardUsers':
      case 'SummaryCardBackups':
      case 'SummaryCardActivityLogs':
        return <SummaryCard {...widget.props} />;
      case 'MonthlyActivityChart':
        return <MonthlyActivityChart {...widget.props} />;
      case 'MonthlyTrendsChart':
        return <MonthlyTrendsChart {...widget.props} />;
      case 'UserRolesPieChart':
        return <UserRolesPieChart {...widget.props} />;
      case 'ResourceUsageAreaChart':
        return <ResourceUsageAreaChart {...widget.props} />;
      case 'PerformanceMetricsRadialChart':
        return <PerformanceMetricsRadialChart {...widget.props} />;
      default:
        // This case should ideally not be reached with a discriminated union
        // but is good for robustness.
        console.warn(`Unknown widget type: ${widget.type}`);
        return null;
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Dashboard'), href: '/dashboard' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('Dashboard')} />
      <div className="flex flex-col gap-6 p-4">
        <div className="flex justify-end">
          <Dialog open={isAddWidgetDialogOpen} onOpenChange={setIsAddWidgetDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('Add Widget')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('Select Widget to Add')}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto">
                {/* Iterate over keys to maintain type safety */}
                {Object.keys(widgetComponents).map((type) => {
                  const widgetType = type as keyof WidgetComponentsMap; // Explicitly cast the key
                  // No need to destructure component and defaultProps here, as we only need the type for handleAddWidget
                  return (
                    <div key={widgetType} className="flex items-center justify-between p-3 border rounded-md">
                      <Label htmlFor={widgetType} className="flex-1 cursor-pointer">
                        {widgetType.replace(/([A-Z])/g, ' $1').trim()} {/* Basic formatting for display */}
                      </Label>
                      <Button size="sm" onClick={() => handleAddWidget(widgetType)}>
                        {t('Add')}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {widgets.map((widget) => (
                <DashboardWidgetWrapper
                  key={widget.id}
                  id={widget.id}
                  colSpan={widget.colSpan}
                  onRemove={handleRemoveWidget}
                  onColSpanChange={handleColSpanChange}
                >
                  {renderWidgetComponent(widget)}
                </DashboardWidgetWrapper>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </AppLayout>
  );
}