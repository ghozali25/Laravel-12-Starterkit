import React, { useState, useEffect, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Plus, Users, HardDrive, Activity, LineChart, BarChart, PieChart, Radar, Building2, Tags, Package } from 'lucide-react'; // Added Building2, Tags, Package
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Widget Components and their Props interfaces
import MonthlyActivityChart, { MonthlyActivityChartProps } from '@/components/dashboard-widgets/MonthlyActivityChart';
import MonthlyTrendsChart, { MonthlyTrendsChartProps } from '@/components/dashboard-widgets/MonthlyTrendsChart';
import UserRolesPieChart, { UserRolesPieChartProps } from '@/components/dashboard-widgets/UserRolesPieChart';
import ResourceUsageAreaChart, { ResourceUsageAreaChartProps } from '@/components/dashboard-widgets/ResourceUsageAreaChart';
import PerformanceMetricsRadialChart, { PerformanceMetricsRadialChartProps } from '@/components/dashboard-widgets/PerformanceMetricsRadialChart';
import SummaryCard, { SummaryCardProps }
from '@/components/dashboard-widgets/SummaryCard';
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
  getInitialProps: (t: (key: string) => string, data: DashboardData) => P; // Updated to pass full DashboardData
  configurableProps?: ConfigurableProp[];
  defaultColSpan: number;
  icon: React.ReactNode; // Icon for the add widget dialog
}

// Update WidgetComponentsMap
type WidgetComponentsMap = {
  [key: string]: WidgetDefinition<any>;
};

// --- New: DashboardData interface to hold all fetched data ---
interface DashboardData {
  totalUsers: number;
  totalBackups: number;
  totalActivityLogs: number;
  totalDivisions: number; // New
  totalAssetCategories: number; // New
  totalAssets: number; // New
  monthlyData: { name: string; Users: number; Backups: number; Assets: number }[]; // Updated
  userRoleDistribution: { name: string; value: number; color: string }[];
  assetCategoryDistribution: { name: string; value: number; color: string }[]; // New
  assetStatusDistribution: { name: string; value: number; color: string }[]; // New
}

// Dummy data for PerformanceMetricsRadialChart (as it's harder to get real-time system metrics)
const dummyRadialData = [
  { name: 'CPU Usage', value: 85, fill: '#8884d8' },
  { name: 'Memory Usage', value: 70, fill: '#83a6ed' },
  { name: 'Disk I/O', value: 60, fill: '#8dd1e1' },
];

const widgetComponents: WidgetComponentsMap = {
  SummaryCardUsers: {
    component: SummaryCard,
    label: 'Summary Card (Users)',
    getInitialProps: (t, data) => ({ label: t('Users'), value: data?.totalUsers ?? 0, iconName: 'Users' }),
    defaultColSpan: 1,
    icon: <Users className="h-5 w-5" />,
  },
  SummaryCardBackups: {
    component: SummaryCard,
    label: 'Summary Card (Backups)',
    getInitialProps: (t, data) => ({ label: t('Backups'), value: data?.totalBackups ?? 0, iconName: 'HardDrive' }),
    defaultColSpan: 1,
    icon: <HardDrive className="h-5 w-5" />,
  },
  SummaryCardActivityLogs: {
    component: SummaryCard,
    label: 'Summary Card (Activity Logs)',
    getInitialProps: (t, data) => ({ label: t('Activity Logs'), value: data?.totalActivityLogs ?? 0, iconName: 'Activity' }),
    defaultColSpan: 1,
    icon: <Activity className="h-5 w-5" />,
  },
  SummaryCardDivisions: { // New Summary Card
    component: SummaryCard,
    label: 'Summary Card (Divisions)',
    getInitialProps: (t, data) => ({ label: t('Divisions'), value: data?.totalDivisions ?? 0, iconName: 'Building2' }),
    defaultColSpan: 1,
    icon: <Building2 className="h-5 w-5" />,
  },
  SummaryCardAssetCategories: { // New Summary Card
    component: SummaryCard,
    label: 'Summary Card (Asset Categories)',
    getInitialProps: (t, data) => ({ label: t('Asset Categories'), value: data?.totalAssetCategories ?? 0, iconName: 'Tags' }),
    defaultColSpan: 1,
    icon: <Tags className="h-5 w-5" />,
  },
  SummaryCardTotalAssets: { // New Summary Card
    component: SummaryCard,
    label: 'Summary Card (Total Assets)',
    getInitialProps: (t, data) => ({ label: t('Assets'), value: data?.totalAssets ?? 0, iconName: 'Package' }),
    defaultColSpan: 1,
    icon: <Package className="h-5 w-5" />,
  },
  MonthlyActivityChart: {
    component: MonthlyActivityChart,
    label: 'Monthly Activity Chart',
    getInitialProps: (t, data) => ({
      data: data?.monthlyData ?? [],
      xAxisDataKey: 'name',
      yAxisDataKey1: 'Users',
      yAxisDataKey2: 'Backups',
    }),
    configurableProps: [
      { key: 'xAxisDataKey', label: 'X-Axis Data Key', type: 'select', dataOptions: ['name'] }, // 'name' is the month
      { key: 'yAxisDataKey1', label: 'Y-Axis Data Key 1', type: 'select', dataOptions: ['Users', 'Backups', 'Assets'] },
      { key: 'yAxisDataKey2', label: 'Y-Axis Data Key 2', type: 'select', dataOptions: ['Users', 'Backups', 'Assets'] },
    ],
    defaultColSpan: 2,
    icon: <BarChart className="h-5 w-5" />,
  },
  MonthlyTrendsChart: {
    component: MonthlyTrendsChart,
    label: 'Monthly Trends Chart',
    getInitialProps: (t, data) => ({
      data: data?.monthlyData ?? [],
      xAxisDataKey: 'name',
      yAxisDataKey1: 'Users',
      yAxisDataKey2: 'Backups',
    }),
    configurableProps: [
      { key: 'xAxisDataKey', label: 'X-Axis Data Key', type: 'select', dataOptions: ['name'] },
      { key: 'yAxisDataKey1', label: 'Y-Axis Data Key 1', type: 'select', dataOptions: ['Users', 'Backups', 'Assets'] },
      { key: 'yAxisDataKey2', label: 'Y-Axis Data Key 2', type: 'select', dataOptions: ['Users', 'Backups', 'Assets'] },
    ],
    defaultColSpan: 2,
    icon: <LineChart className="h-5 w-5" />,
  },
  UserRolesPieChart: {
    component: UserRolesPieChart,
    label: 'User Roles Pie Chart',
    getInitialProps: (t, data) => ({ data: data?.userRoleDistribution ?? [], title: t('User Roles') }), // Pass title
    defaultColSpan: 1,
    icon: <PieChart className="h-5 w-5" />,
  },
  AssetCategoryDistributionPieChart: { // New Pie Chart
    component: UserRolesPieChart, // Reusing UserRolesPieChart as it's generic enough
    label: 'Asset Category Distribution',
    getInitialProps: (t, data) => ({ data: data?.assetCategoryDistribution ?? [], title: t('Asset Category Distribution') }), // Pass title
    defaultColSpan: 1,
    icon: <PieChart className="h-5 w-5" />,
  },
  AssetStatusDistributionPieChart: { // New Pie Chart
    component: UserRolesPieChart, // Reusing UserRolesPieChart
    label: 'Asset Status Distribution',
    getInitialProps: (t, data) => ({ data: data?.assetStatusDistribution ?? [], title: t('Asset Status Distribution') }), // Pass title
    defaultColSpan: 1,
    icon: <PieChart className="h-5 w-5" />,
  },
  ResourceUsageAreaChart: {
    component: ResourceUsageAreaChart,
    label: 'Resource Usage Area Chart',
    getInitialProps: (t, data) => ({
      data: data?.monthlyData?.map(d => ({ month: d.name, users: d.Users, backups: d.Backups, assets: d.Assets })) ?? [], // Updated
      xAxisDataKey: 'month',
      yAxisDataKey1: 'users',
      yAxisDataKey2: 'backups',
    }),
    configurableProps: [
      { key: 'xAxisDataKey', label: 'X-Axis Data Key', type: 'select', dataOptions: ['month'] },
      { key: 'yAxisDataKey1', label: 'Y-Axis Data Key 1', type: 'select', dataOptions: ['users', 'backups', 'assets'] }, // Updated
      { key: 'yAxisDataKey2', label: 'Y-Axis Data Key 2', type: 'select', dataOptions: ['users', 'backups', 'assets'] }, // Updated
    ],
    defaultColSpan: 2,
    icon: <Radar className="h-5 w-5" />,
  },
  PerformanceMetricsRadialChart: {
    component: PerformanceMetricsRadialChart,
    label: 'Performance Metrics Radial Chart',
    getInitialProps: (t, data) => ({ data: dummyRadialData }), // Still dummy as real-time system metrics are complex
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

interface DashboardProps extends DashboardData { // Extend with DashboardData
  initialWidgets: DashboardWidget[];
}

export default function Dashboard(props: DashboardProps) { // Receive props directly
  const { initialWidgets, totalUsers, totalBackups, totalActivityLogs, monthlyData, userRoleDistribution, totalDivisions, totalAssetCategories, totalAssets, assetCategoryDistribution, assetStatusDistribution } = props;
  const { t, locale } = useTranslation();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
  const [selectedWidgetTypeToAdd, setSelectedWidgetTypeToAdd] = useState<keyof WidgetComponentsMap | null>(null);
  const [newWidgetProps, setNewWidgetProps] = useState<Record<string, any>>({});

  // Log all incoming props for debugging
  console.log('Dashboard Props:', props);

  // Combine all dashboard data into a single object for easier passing to getInitialProps
  const dashboardData: DashboardData = {
    totalUsers: totalUsers ?? 0,
    totalBackups: totalBackups ?? 0,
    totalActivityLogs: totalActivityLogs ?? 0,
    totalDivisions: totalDivisions ?? 0, // New
    totalAssetCategories: totalAssetCategories ?? 0, // New
    totalAssets: totalAssets ?? 0, // New
    monthlyData: monthlyData ?? [],
    userRoleDistribution: userRoleDistribution ?? [],
    assetCategoryDistribution: assetCategoryDistribution ?? [], // New
    assetStatusDistribution: assetStatusDistribution ?? [], // New
  };

  // Log the constructed dashboardData
  console.log('Constructed Dashboard Data:', dashboardData);

  // Initialize widgets from backend or default if empty
  useEffect(() => {
    console.log('useEffect: initialWidgets changed', initialWidgets);
    if (Array.isArray(initialWidgets) && initialWidgets.length > 0) {
      // Re-initialize props for existing widgets to ensure they use fresh data and translations
      const reinitializedWidgets = initialWidgets.map(widget => {
        const widgetDef = widgetComponents[widget.type];
        if (widgetDef) {
          return {
            ...widget,
            props: widgetDef.getInitialProps(t, dashboardData),
          };
        }
        return widget;
      });
      setWidgets(reinitializedWidgets);
    } else {
      // Default widgets if none are saved
      setWidgets([
        { id: 'summary-users', type: 'SummaryCardUsers', props: widgetComponents.SummaryCardUsers.getInitialProps(t, dashboardData), colSpan: 1 },
        { id: 'summary-backups', type: 'SummaryCardBackups', props: widgetComponents.SummaryCardBackups.getInitialProps(t, dashboardData), colSpan: 1 },
        { id: 'summary-activity', type: 'SummaryCardActivityLogs', props: widgetComponents.SummaryCardActivityLogs.getInitialProps(t, dashboardData), colSpan: 1 },
        { id: 'monthly-activity', type: 'MonthlyActivityChart', props: widgetComponents.MonthlyActivityChart.getInitialProps(t, dashboardData), colSpan: 2 },
        { id: 'user-roles', type: 'UserRolesPieChart', props: widgetComponents.UserRolesPieChart.getInitialProps(t, dashboardData), colSpan: 1 },
      ]);
    }
  }, [initialWidgets, t,
    totalUsers, totalBackups, totalActivityLogs, monthlyData, userRoleDistribution, // Add data dependencies
    totalDivisions, totalAssetCategories, totalAssets, assetCategoryDistribution, assetStatusDistribution // New data dependencies
  ]);

  // Save layout to backend
  const saveLayout = useCallback((currentWidgets: DashboardWidget[]) => {
    console.log('saveLayout called with widgets:', currentWidgets);
    const widgetsToSave = currentWidgets.map(widget => ({
      ...widget,
      id: String(widget.id), // Ensure ID is string for backend
    }));
    router.post(route('dashboard.save-widgets'), { widgets_data: widgetsToSave }, {
      preserveScroll: true,
      preserveState: true,
    });
  }, []); // No dependencies needed if `t` and `dashboardData` are not used directly here

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setWidgets((items) => {
      const newItems = arrayMove(items, items.findIndex((item) => item.id === active.id), items.findIndex((item) => item.id === over.id));
      saveLayout(newItems);
      return newItems;
    });
  };

  const handleRemoveWidget = (id: UniqueIdentifier) => {
    setWidgets((prevWidgets) => {
      const newWidgets = prevWidgets.filter((widget) => widget.id !== id);
      saveLayout(newWidgets);
      return newWidgets;
    });
    toast.success(t('Widget removed successfully!'));
  };

  const handleColSpanChange = (id: UniqueIdentifier, newColSpan: number) => {
    setWidgets((prevWidgets) => {
      const newWidgets = prevWidgets.map((widget) =>
        widget.id === id ? { ...widget, colSpan: newColSpan } : widget
      );
      saveLayout(newWidgets);
      return newWidgets;
    });
    toast.success(t('Widget size updated!'));
  };

  const handleAddWidget = () => {
    if (!selectedWidgetTypeToAdd) return;

    const widgetDef = widgetComponents[selectedWidgetTypeToAdd];
    const newId = `${selectedWidgetTypeToAdd}-${Date.now()}`;
    
    const initialProps = widgetDef.getInitialProps(t, dashboardData); // Pass dashboardData here

    const finalProps = { ...initialProps, ...newWidgetProps };

    const newWidget: DashboardWidget = {
      id: newId,
      type: selectedWidgetTypeToAdd as keyof WidgetComponentsMap,
      props: finalProps,
      colSpan: widgetDef.defaultColSpan,
    };

    setWidgets((prevWidgets) => {
      const newWidgets = [...prevWidgets, newWidget];
      saveLayout(newWidgets);
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