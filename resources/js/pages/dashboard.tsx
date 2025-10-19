import React, { useState, useEffect, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Plus, Users, HardDrive, Activity, LineChart, BarChart, PieChart, Radar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogDescription } from '@/components/ui/dialog'; // Import DialogDescription

// Widget Components and their Props interfaces
import MonthlyActivityChart, { MonthlyActivityChartProps } from '@/components/dashboard-widgets/MonthlyActivityChart';
import MonthlyTrendsChart, { MonthlyTrendsChartProps } from '@/components/dashboard-widgets/MonthlyTrendsChart';
import UserRolesPieChart, { UserRolesPieChartProps } from '@/components/dashboard-widgets/UserRolesPieChart';
import ResourceUsageAreaChart, { ResourceUsageAreaChartProps } from '@/components/dashboard-widgets/ResourceUsageAreaChart';
import PerformanceMetricsRadialChart, { PerformanceMetricsRadialChartProps } from '@/components/dashboard-widgets/PerformanceMetricsRadialChart';
import SummaryCard, { SummaryCardProps } from '@/components/dashboard-widgets/SummaryCard';
import DashboardWidgetWrapper from '@/components/dashboard-widgets/DashboardWidgetWrapper';

// Define a base interface for configurable props
interface ConfigurableProp {
  key: string;
  label: string;
  type: 'select' | 'text' | 'number';
  options?: { value: string; label: string }[];
  dataOptions?: string[]; // For data-driven selects (e.g., available columns)
}

// Define a generic widget definition
interface WidgetDefinition<P> {
  component: React.ComponentType<P>;
  label: string;
  getInitialProps: (t: (key: string) => string) => P;
  configurableProps?: ConfigurableProp[];
  defaultColSpan: number;
  icon: React.ReactNode; // Icon for the add widget dialog
}

// Update WidgetComponentsMap
type WidgetComponentsMap = {
  [key: string]: WidgetDefinition<any>;
};

// Dummy data for charts (in a real app, this would come from an API)
const dummyChartData = [
  { name: 'Jan', Users: 50, Backups: 10, Files: 100, CPU: 60, Memory: 70 },
  { name: 'Feb', Users: 120, Backups: 25, Files: 150, CPU: 65, Memory: 75 },
  { name: 'Mar', Users: 80, Backups: 15, Files: 120, CPU: 70, Memory: 80 },
  { name: 'Apr', Users: 150, Backups: 30, Files: 200, CPU: 75, Memory: 85 },
  { name: 'May', Users: 90, Backups: 20, Files: 130, CPU: 80, Memory: 90 },
  { name: 'Jun', Users: 170, Backups: 35, Files: 220, CPU: 85, Memory: 95 },
];

const dummyPieData = [
  { name: 'Admin', value: 20, color: '#fbbf24' },
  { name: 'User', value: 80, color: '#a78bfa' },
];

const dummyRadialData = [
  { name: 'CPU Usage', value: 85, fill: '#8884d8' },
  { name: 'Memory Usage', value: 70, fill: '#83a6ed' },
  { name: 'Disk I/O', value: 60, fill: '#8dd1e1' },
];

const widgetComponents: WidgetComponentsMap = {
  SummaryCardUsers: {
    component: SummaryCard,
    label: 'Summary Card (Users)',
    getInitialProps: (t) => ({ label: t('Users'), value: 420, iconName: 'Users' }), // Changed to iconName
    defaultColSpan: 1,
    icon: <Users className="h-5 w-5" />, // This icon is for the dialog
  },
  SummaryCardBackups: {
    component: SummaryCard,
    label: 'Summary Card (Backups)',
    getInitialProps: (t) => ({ label: t('Backups'), value: 80, iconName: 'HardDrive' }), // Changed to iconName
    defaultColSpan: 1,
    icon: <HardDrive className="h-5 w-5" />, // This icon is for the dialog
  },
  SummaryCardActivityLogs: {
    component: SummaryCard,
    label: 'Summary Card (Activity Logs)',
    getInitialProps: (t) => ({ label: t('Activity Logs'), value: 1570, iconName: 'Activity' }), // Changed to iconName
    defaultColSpan: 1,
    icon: <Activity className="h-5 w-5" />, // This icon is for the dialog
  },
  MonthlyActivityChart: {
    component: MonthlyActivityChart,
    label: 'Monthly Activity Chart',
    getInitialProps: (t) => ({
      data: dummyChartData,
      xAxisDataKey: 'name',
      yAxisDataKey1: 'Users',
      yAxisDataKey2: 'Backups',
    }),
    configurableProps: [
      { key: 'xAxisDataKey', label: 'X-Axis Data Key', type: 'select', dataOptions: Object.keys(dummyChartData[0] || {}) },
      { key: 'yAxisDataKey1', label: 'Y-Axis Data Key 1', type: 'select', dataOptions: Object.keys(dummyChartData[0] || {}) },
      { key: 'yAxisDataKey2', label: 'Y-Axis Data Key 2', type: 'select', dataOptions: Object.keys(dummyChartData[0] || {}) },
    ],
    defaultColSpan: 2,
    icon: <BarChart className="h-5 w-5" />,
  },
  MonthlyTrendsChart: {
    component: MonthlyTrendsChart,
    label: 'Monthly Trends Chart',
    getInitialProps: (t) => ({
      data: dummyChartData,
      xAxisDataKey: 'name',
      yAxisDataKey1: 'Users',
      yAxisDataKey2: 'Backups',
    }),
    configurableProps: [
      { key: 'xAxisDataKey', label: 'X-Axis Data Key', type: 'select', dataOptions: Object.keys(dummyChartData[0] || {}) },
      { key: 'yAxisDataKey1', label: 'Y-Axis Data Key 1', type: 'select', dataOptions: Object.keys(dummyChartData[0] || {}) },
      { key: 'yAxisDataKey2', label: 'Y-Axis Data Key 2', type: 'select', dataOptions: Object.keys(dummyChartData[0] || {}) },
    ],
    defaultColSpan: 2,
    icon: <LineChart className="h-5 w-5" />,
  },
  UserRolesPieChart: {
    component: UserRolesPieChart,
    label: 'User Roles Pie Chart',
    getInitialProps: (t) => ({ data: dummyPieData }),
    defaultColSpan: 1,
    icon: <PieChart className="h-5 w-5" />,
  },
  ResourceUsageAreaChart: {
    component: ResourceUsageAreaChart,
    label: 'Resource Usage Area Chart',
    getInitialProps: (t) => ({
      data: dummyChartData.map(d => ({ month: d.name, users: d.Users, backups: d.Backups })),
      xAxisDataKey: 'month',
      yAxisDataKey1: 'users',
      yAxisDataKey2: 'backups',
    }),
    configurableProps: [
      { key: 'xAxisDataKey', label: 'X-Axis Data Key', type: 'select', dataOptions: ['month', 'name'] },
      { key: 'yAxisDataKey1', label: 'Y-Axis Data Key 1', type: 'select', dataOptions: ['users', 'backups', 'Files', 'CPU', 'Memory'] },
      { key: 'yAxisDataKey2', label: 'Y-Axis Data Key 2', type: 'select', dataOptions: ['users', 'backups', 'Files', 'CPU', 'Memory'] },
    ],
    defaultColSpan: 2,
    icon: <Radar className="h-5 w-5" />,
  },
  PerformanceMetricsRadialChart: {
    component: PerformanceMetricsRadialChart,
    label: 'Performance Metrics Radial Chart',
    getInitialProps: (t) => ({ data: dummyRadialData }),
    defaultColSpan: 1,
    icon: <Radar className="h-5 w-5" />,
  },
};

// Type for a widget instance on the dashboard using a discriminated union
type DashboardWidget = {
  id: UniqueIdentifier;
  type: keyof WidgetComponentsMap;
  props: any; // Using 'any' for props to simplify, as specific props are handled by widgetComponents
  colSpan: number;
};

interface DashboardProps {
  initialWidgets: DashboardWidget[];
}

export default function Dashboard({ initialWidgets }: DashboardProps) {
  const { t, locale } = useTranslation();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
  const [selectedWidgetTypeToAdd, setSelectedWidgetTypeToAdd] = useState<keyof WidgetComponentsMap | null>(null);
  const [newWidgetProps, setNewWidgetProps] = useState<Record<string, any>>({});

  // Initialize widgets from backend or default if empty
  useEffect(() => {
    console.log('useEffect: initialWidgets changed', initialWidgets);
    if (Array.isArray(initialWidgets) && initialWidgets.length > 0) {
      setWidgets(initialWidgets);
    } else {
      // Default widgets if none are saved
      setWidgets([
        { id: 'summary-users', type: 'SummaryCardUsers', props: { label: t('Users'), value: 420, iconName: 'Users' }, colSpan: 1 },
        { id: 'summary-backups', type: 'SummaryCardBackups', props: { label: t('Backups'), value: 80, iconName: 'HardDrive' }, colSpan: 1 },
        { id: 'summary-activity', type: 'SummaryCardActivityLogs', props: { label: t('Activity Logs'), value: 1570, iconName: 'Activity' }, colSpan: 1 },
        { id: 'monthly-activity', type: 'MonthlyActivityChart', props: widgetComponents.MonthlyActivityChart.getInitialProps(t), colSpan: 2 },
        { id: 'user-roles', type: 'UserRolesPieChart', props: widgetComponents.UserRolesPieChart.getInitialProps(t), colSpan: 1 },
      ]);
    }
  }, [initialWidgets, t]);

  // Save layout to backend
  // Now accepts currentWidgets as an argument to ensure it uses the latest state
  const saveLayout = useCallback((currentWidgets: DashboardWidget[]) => {
    console.log('saveLayout called with widgets:', currentWidgets);
    const widgetsToSave = currentWidgets.map(widget => ({
      ...widget,
      id: String(widget.id), // Ensure ID is string for backend
    }));
    router.post(route('dashboard.save-widgets'), { widgets_data: widgetsToSave }, {
      // Removed onSuccess/onError toasts here, relying on backend flash messages
      preserveScroll: true,
      preserveState: true, // Crucial for maintaining DndContext state
    });
  }, [t]); // `t` is a dependency if used inside, otherwise empty array

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setWidgets((items) => {
      const newItems = arrayMove(items, items.findIndex((item) => item.id === active.id), items.findIndex((item) => item.id === over.id));
      saveLayout(newItems); // Pass the new state to saveLayout
      return newItems;
    });
  };

  const handleRemoveWidget = (id: UniqueIdentifier) => {
    setWidgets((prevWidgets) => {
      const newWidgets = prevWidgets.filter((widget) => widget.id !== id);
      saveLayout(newWidgets); // Pass the new state to saveLayout
      return newWidgets;
    });
    toast.success(t('Widget removed successfully!'));
  };

  const handleColSpanChange = (id: UniqueIdentifier, newColSpan: number) => {
    setWidgets((prevWidgets) => {
      const newWidgets = prevWidgets.map((widget) =>
        widget.id === id ? { ...widget, colSpan: newColSpan } : widget
      );
      saveLayout(newWidgets); // Pass the new state to saveLayout
      return newWidgets;
    });
    toast.success(t('Widget size updated!'));
  };

  const handleAddWidget = () => {
    if (!selectedWidgetTypeToAdd) return;

    const widgetDef = widgetComponents[selectedWidgetTypeToAdd];
    const newId = `${selectedWidgetTypeToAdd}-${Date.now()}`;
    
    const initialProps = widgetDef.getInitialProps(t);

    const finalProps = { ...initialProps, ...newWidgetProps };

    const newWidget: DashboardWidget = {
      id: newId,
      type: selectedWidgetTypeToAdd as keyof WidgetComponentsMap,
      props: finalProps,
      colSpan: widgetDef.defaultColSpan,
    };

    setWidgets((prevWidgets) => {
      const newWidgets = [...prevWidgets, newWidget];
      saveLayout(newWidgets); // Pass the new state to saveLayout
      return newWidgets;
    });

    setIsAddWidgetDialogOpen(false);
    setSelectedWidgetTypeToAdd(null);
    setNewWidgetProps({});
    toast.success(t('Widget added successfully!'));
  };

  const renderWidgetComponent = (widget: DashboardWidget) => {
    const WidgetComp = widgetComponents[widget.type]?.component;
    if (!WidgetComp) {
      console.warn(`Unknown widget type: ${widget.type}`);
      return null;
    }
    return <WidgetComp {...widget.props} />;
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Dashboard'), href: '/dashboard' },
  ];

  const currentConfigurableProps = selectedWidgetTypeToAdd
    ? widgetComponents[selectedWidgetTypeToAdd]?.configurableProps || []
    : [];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('Dashboard')} />
      <div className="flex flex-col gap-6 p-4">
        <div className="flex justify-end">
          <Dialog open={isAddWidgetDialogOpen} onOpenChange={(open) => {
            setIsAddWidgetDialogOpen(open);
            if (!open) {
              setSelectedWidgetTypeToAdd(null);
              setNewWidgetProps({});
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('Add Widget')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('Select Widget to Add')}</DialogTitle>
                {/* Added DialogDescription to fix accessibility warning */}
                <DialogDescription>{t('Choose a widget type and configure its properties.')}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto">
                <Label htmlFor="widget-type-select">{t('Widget Type')}</Label>
                <Select
                  value={selectedWidgetTypeToAdd as string || ''}
                  onValueChange={(value: keyof WidgetComponentsMap) => {
                    setSelectedWidgetTypeToAdd(value);
                    setNewWidgetProps({}); // Reset props when type changes
                  }}
                >
                  <SelectTrigger id="widget-type-select">
                    <SelectValue placeholder={t('Select a widget type')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(widgetComponents).map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {widgetComponents[type].icon}
                          {widgetComponents[type].label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedWidgetTypeToAdd && currentConfigurableProps.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h3 className="text-md font-semibold">{t('Configure Widget')}</h3>
                    {currentConfigurableProps.map((prop) => (
                      <div key={prop.key} className="space-y-1">
                        <Label htmlFor={prop.key}>{prop.label}</Label>
                        {prop.type === 'select' && prop.dataOptions ? (
                          <Select
                            value={newWidgetProps[prop.key] || ''}
                            onValueChange={(value) => setNewWidgetProps(prev => ({ ...prev, [prop.key]: value }))}
                          >
                            <SelectTrigger id={prop.key}>
                              <SelectValue placeholder={`Select ${prop.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {prop.dataOptions.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={prop.key}
                            type={prop.type}
                            value={newWidgetProps[prop.key] || ''}
                            onChange={(e) => setNewWidgetProps(prev => ({ ...prev, [prop.key]: e.target.value }))}
                            placeholder={`Enter ${prop.label.toLowerCase()}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleAddWidget}
                  disabled={!selectedWidgetTypeToAdd}
                  className="mt-4"
                >
                  {t('Add')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {widgets.map((widget) => (
                <DashboardWidgetWrapper
                  key={String(widget.id)}
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