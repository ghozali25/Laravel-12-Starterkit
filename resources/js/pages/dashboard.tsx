import React, { useState, useEffect, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Plus, Users, HardDrive, Activity, LineChart, BarChart, PieChart, Radar, Building2, Tags, Package, TrendingUp, ShieldCheck, Headphones, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react'; // Added ticket icons
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { iconMapper } from '@/lib/iconMapper'; // Import iconMapper

const notify = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
  const S: any = (window as any).Swal;
  if (!S) return;
  const toast = S.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2500, timerProgressBar: true });
  toast.fire({ icon: type, title: message });
};

// Widget Components and their Props interfaces
import MonthlyActivityChart, { MonthlyActivityChartProps } from '@/components/dashboard-widgets/MonthlyActivityChart';
import DailyActivityChart from '@/components/dashboard-widgets/DailyActivityChart';
import DailyTicketStatusStacked from '@/components/dashboard-widgets/DailyTicketStatusStacked';
import MonthlyTrendsChart, { MonthlyTrendsChartProps } from '@/components/dashboard-widgets/MonthlyTrendsChart';
import UserRolesPieChart, { UserRolesPieChartProps } from '@/components/dashboard-widgets/UserRolesPieChart';
import ResourceUsageAreaChart, { ResourceUsageAreaChartProps } from '@/components/dashboard-widgets/ResourceUsageAreaChart';
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
  totalEmployees: number; // Employees (non-admin)
  totalDivisions: number; // New
  totalAssetCategories: number; // New
  totalAssets: number; // New
  totalTickets: number; // New
  monthlyData: { name: string; Users: number; Backups: number; Assets: number }[]; // Updated
  userRoleDistribution: { name: string; value: number; color: string }[];
  assetCategoryDistribution: { name: string; value: number; color: string }[]; // New
  assetStatusDistribution: { name: string; value: number; color: string }[]; // New
  ticketStatusDistribution: { name: string; value: number; color: string }[]; // New
  ticketPriorityDistribution: { name: string; value: number; color: string }[]; // New
  ticketCategoryDistribution: { name: string; value: number; color: string }[]; // New
  dailyData?: Array<{ date: string; day: number; Users: number; Assets: number; Tickets: number; Backups: number }>;
  dailyTicketStatusData?: Array<{ date: string; day: number; open: number; in_progress: number; resolved: number; closed: number; cancelled: number }>;
}

// All data now comes from backend - no dummy data

// Helper function to calculate growth percentage based on monthly data
const calculateGrowth = (monthlyData: any[], key: string): number | undefined => {
  if (!monthlyData || monthlyData.length < 2) return undefined;
  
  const lastMonth = monthlyData[monthlyData.length - 1]?.[key] ?? 0;
  const prevMonth = monthlyData[monthlyData.length - 2]?.[key] ?? 0;
  
  if (prevMonth === 0) return lastMonth > 0 ? 100 : 0;
  return ((lastMonth - prevMonth) / prevMonth) * 100;
};

const widgetComponents: WidgetComponentsMap = {
  SummaryCardUsers: {
    component: SummaryCard,
    label: 'Summary Card (Employees)',
    getInitialProps: (t, data) => ({ 
      label: t('Employees'), 
      value: data?.totalEmployees ?? 0, 
      iconName: 'Users',
      growth: calculateGrowth(data?.monthlyData ?? [], 'Users'),
      showGrowth: true
    }),
    defaultColSpan: 1,
    icon: <Users className="h-5 w-5" />,
  },
  DailyTicketStatusStacked: {
    component: DailyTicketStatusStacked,
    label: 'Daily Ticket Status (This Month)',
    getInitialProps: (t, data) => ({
      data: data?.dailyTicketStatusData ?? [],
      iconName: 'BarChart',
      title: t('Daily Ticket Status (This Month)'),
    }),
    defaultColSpan: 3,
    icon: <Headphones className="h-5 w-5" />,
  },
  DailyActivityChart: {
    component: DailyActivityChart,
    label: 'Daily Activity (This Month)',
    getInitialProps: (t, data) => ({
      data: data?.dailyData ?? [],
      iconName: 'Activity',
      title: t('Daily Activity (This Month)'),
      series: [
        { key: 'Tickets', type: 'bar', color: '#3b82f6' },
        { key: 'Users', type: 'line', color: '#22c55e' }, // Users = Employees (non-admin)
        //{ key: 'Assets', type: 'line', color: '#a78bfa' },
        //{ key: 'Backups', type: 'line', color: '#f59e0b' },
      ],
    }),
    defaultColSpan: 3,
    icon: <Activity className="h-5 w-5" />,
  },
  SummaryCardDivisions: { // New Summary Card
    component: SummaryCard,
    label: 'Summary Card (Divisions)',
    getInitialProps: (t, data) => ({ 
      label: t('Total Divisions'), 
      value: data?.totalDivisions ?? 0, 
      iconName: 'Building2', 
      growth: calculateGrowth(data?.monthlyData ?? [], 'Divisions'),
      showGrowth: true 
    }),
    defaultColSpan: 1,
    icon: <Building2 className="h-5 w-5" />,
  },
  SummaryCardAssetCategories: { // New Summary Card
    component: SummaryCard,
    label: 'Summary Card (Asset Categories)',
    getInitialProps: (t, data) => ({ 
      label: t('Total Asset Categories'), 
      value: data?.totalAssetCategories ?? 0, 
      iconName: 'Tags', 
      growth: calculateGrowth(data?.monthlyData ?? [], 'AssetCategories'),
      showGrowth: true 
    }),
    defaultColSpan: 1,
    icon: <Tags className="h-5 w-5" />,
  },
  SummaryCardTotalAssets: { // New Summary Card
    component: SummaryCard,
    label: 'Summary Card (Total Assets)',
    getInitialProps: (t, data) => ({ 
      label: t('Total Assets'), 
      value: data?.totalAssets ?? 0, 
      iconName: 'Package',
      growth: calculateGrowth(data?.monthlyData ?? [], 'Assets'),
      showGrowth: true
    }),
    defaultColSpan: 1,
    icon: <Package className="h-5 w-5" />,
  },
  SummaryCardTotalTickets: { // New Summary Card for Tickets
    component: SummaryCard,
    label: 'Summary Card (Total Tickets)',
    getInitialProps: (t, data) => ({ 
      label: t('Total Tickets'), 
      value: data?.totalTickets ?? 0, 
      iconName: 'Headphones',
      growth: calculateGrowth(data?.monthlyData ?? [], 'Tickets'),
      showGrowth: true
    }),
    defaultColSpan: 1,
    icon: <Headphones className="h-5 w-5" />,
  },
  MonthlyActivityChart: {
    component: MonthlyActivityChart,
    label: 'Employees (Monthly Total)',
    getInitialProps: (t, data) => ({
      data: data?.monthlyData ?? [],
      iconName: 'BarChart',
      xAxisDataKey: 'name',
      yAxisDataKey1: 'Users',
      yAxisDataKey2: '',
    }),
    configurableProps: [
      { key: 'xAxisDataKey', label: 'X-Axis Data Key', type: 'select', dataOptions: ['name'] }, // 'name' is the month
      { key: 'yAxisDataKey1', label: 'Y-Axis Data Key 1', type: 'select', dataOptions: ['Users', 'UsersGrowth', 'Assets'] },
      { key: 'yAxisDataKey2', label: 'Y-Axis Data Key 2', type: 'select', dataOptions: ['', 'Users', 'Assets'] },
    ],
    defaultColSpan: 3, // Adjusted for 6-column layout
    icon: <BarChart className="h-5 w-5" />,
  },
  MonthlyTrendsChart: {
    component: MonthlyTrendsChart,
    label: 'Monthly Trends Chart',
    getInitialProps: (t, data) => ({
      data: data?.monthlyData ?? [],
      iconName: 'LineChart',
      xAxisDataKey: 'name',
      yAxisDataKey1: 'Users',
      yAxisDataKey2: 'Backups',
    }),
    configurableProps: [
      { key: 'xAxisDataKey', label: 'X-Axis Data Key', type: 'select', dataOptions: ['name'] },
      { key: 'yAxisDataKey1', label: 'Y-Axis Data Key 1', type: 'select', dataOptions: ['Users', 'Backups', 'Assets'] },
      { key: 'yAxisDataKey2', label: 'Y-Axis Data Key 2', type: 'select', dataOptions: ['Users', 'Backups', 'Assets'] },
    ],
    defaultColSpan: 3, // Adjusted for 6-column layout
    icon: <LineChart className="h-5 w-5" />,
  },
  UserRolesPieChart: {
    component: UserRolesPieChart,
    label: 'User Roles Pie Chart',
    getInitialProps: (t, data) => ({ data: data?.userRoleDistribution ?? [], title: t('User Roles'), iconName: 'ShieldCheck' }), // Pass title and icon
    defaultColSpan: 2, // Adjusted for 6-column layout
    icon: <PieChart className="h-5 w-5" />,
  },
  AssetCategoryDistributionPieChart: { // New Pie Chart
    component: UserRolesPieChart, // Reusing UserRolesPieChart as it's generic enough
    label: 'Asset Category Distribution',
    getInitialProps: (t, data) => ({ data: data?.assetCategoryDistribution ?? [], title: t('Asset Category Distribution'), iconName: 'Tags' }), // Pass title and icon
    defaultColSpan: 2, // Adjusted for 6-column layout
    icon: <PieChart className="h-5 w-5" />,
  },
  AssetStatusDistributionPieChart: { // New Pie Chart
    component: UserRolesPieChart, // Reusing UserRolesPieChart
    label: 'Asset Status Distribution',
    getInitialProps: (t, data) => ({ data: data?.assetStatusDistribution ?? [], title: t('Asset Status Distribution'), iconName: 'Package' }), // Pass title and icon
    defaultColSpan: 2, // Adjusted for 6-column layout
    icon: <PieChart className="h-5 w-5" />,
  },
  TicketStatusDistributionPieChart: { // New Pie Chart for Ticket Status
    component: UserRolesPieChart, // Reusing UserRolesPieChart
    label: 'Ticket Status Distribution',
    getInitialProps: (t, data) => ({ data: data?.ticketStatusDistribution ?? [], title: t('Ticket Status Distribution'), iconName: 'Headphones' }),
    defaultColSpan: 2,
    icon: <PieChart className="h-5 w-5" />,
  },
  TicketPriorityDistributionPieChart: { // New Pie Chart for Ticket Priority
    component: UserRolesPieChart, // Reusing UserRolesPieChart
    label: 'Ticket Priority Distribution',
    getInitialProps: (t, data) => ({ data: data?.ticketPriorityDistribution ?? [], title: t('Ticket Priority Distribution'), iconName: 'AlertTriangle' }),
    defaultColSpan: 2,
    icon: <PieChart className="h-5 w-5" />,
  },
  TicketCategoryDistributionPieChart: { // New Pie Chart for Ticket Category
    component: UserRolesPieChart, // Reusing UserRolesPieChart
    label: 'Ticket Category Distribution',
    getInitialProps: (t, data) => ({ data: data?.ticketCategoryDistribution ?? [], title: t('Ticket Category Distribution'), iconName: 'Tags' }),
    defaultColSpan: 2,
    icon: <PieChart className="h-5 w-5" />,
  },
  ResourceUsageAreaChart: {
    component: ResourceUsageAreaChart,
    label: 'Resource Usage Area Chart',
    getInitialProps: (t, data) => ({
      data: data?.monthlyData?.map(d => ({ month: d.name, users: d.Users, backups: d.Backups, assets: d.Assets })) ?? [], // Updated
      iconName: 'Insights',
      xAxisDataKey: 'month',
      yAxisDataKey1: 'users',
      yAxisDataKey2: 'backups',
    }),
    configurableProps: [
      { key: 'xAxisDataKey', label: 'X-Axis Data Key', type: 'select', dataOptions: ['month'] },
      { key: 'yAxisDataKey1', label: 'Y-Axis Data Key 1', type: 'select', dataOptions: ['users', 'backups', 'assets'] }, // Updated
      { key: 'yAxisDataKey2', label: 'Y-Axis Data Key 2', type: 'select', dataOptions: ['users', 'backups', 'assets'] }, // Updated
    ],
    defaultColSpan: 3, // Adjusted for 6-column layout
    // Fix: use a valid React component for icon prop (was <insights /> which is invalid)
    icon: <TrendingUp className="h-5 w-5" />,
  },
  // Removed PerformanceMetricsRadialChart - was using dummy data
  // All widgets now use real data from backend
};

// Type for a widget instance on the dashboard using a discriminated union
type DashboardWidget = {
  id: UniqueIdentifier;
  type: keyof WidgetComponentsMap;
  props: any; // Using 'any' for props to simplify, as specific props are handled by widgetComponents
  colSpan: number;
};

interface DashboardProps extends DashboardData {
  initialWidgets: DashboardWidget[];
}

export default function Dashboard(props: DashboardProps) {
  const {
    initialWidgets,
    totalUsers,
    totalEmployees,
    monthlyData,
    userRoleDistribution,
    totalDivisions,
    totalAssetCategories,
    totalAssets,
    assetCategoryDistribution,
    assetStatusDistribution,
    totalTickets,
    ticketStatusDistribution,
    ticketPriorityDistribution,
    ticketCategoryDistribution,
    dailyData,
    dailyTicketStatusData,
  } = props;

  const { t, locale } = useTranslation();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
  const [selectedWidgetTypeToAdd, setSelectedWidgetTypeToAdd] = useState<keyof WidgetComponentsMap | null>(null);
  const [newWidgetProps, setNewWidgetProps] = useState<Record<string, any>>({});

  // Combine all dashboard data into a single object for easier passing to getInitialProps
  const dashboardData: DashboardData = {
    totalUsers: totalUsers ?? 0,
    totalEmployees: totalEmployees ?? 0,
    totalDivisions: totalDivisions ?? 0,
    totalAssetCategories: totalAssetCategories ?? 0,
    totalAssets: totalAssets ?? 0,
    totalTickets: totalTickets ?? 0,
    monthlyData: monthlyData ?? [],
    userRoleDistribution: userRoleDistribution ?? [],
    assetCategoryDistribution: assetCategoryDistribution ?? [],
    assetStatusDistribution: assetStatusDistribution ?? [],
    ticketStatusDistribution: ticketStatusDistribution ?? [],
    ticketPriorityDistribution: ticketPriorityDistribution ?? [],
    ticketCategoryDistribution: ticketCategoryDistribution ?? [],
    dailyData: dailyData ?? [],
    dailyTicketStatusData: dailyTicketStatusData ?? [],
  };

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
        { id: 'summary-divisions', type: 'SummaryCardDivisions', props: widgetComponents.SummaryCardDivisions.getInitialProps(t, dashboardData), colSpan: 1 },
        { id: 'summary-asset-categories', type: 'SummaryCardAssetCategories', props: widgetComponents.SummaryCardAssetCategories.getInitialProps(t, dashboardData), colSpan: 1 },
        { id: 'summary-total-assets', type: 'SummaryCardTotalAssets', props: widgetComponents.SummaryCardTotalAssets.getInitialProps(t, dashboardData), colSpan: 1 },
        { id: 'daily-activity', type: 'DailyActivityChart', props: widgetComponents.DailyActivityChart.getInitialProps(t, dashboardData), colSpan: 3 },
        { id: 'monthly-activity', type: 'MonthlyActivityChart', props: widgetComponents.MonthlyActivityChart.getInitialProps(t, dashboardData), colSpan: 3 },
        { id: 'daily-ticket-status', type: 'DailyTicketStatusStacked', props: widgetComponents.DailyTicketStatusStacked.getInitialProps(t, dashboardData), colSpan: 3 },
        { id: 'user-roles', type: 'UserRolesPieChart', props: widgetComponents.UserRolesPieChart.getInitialProps(t, dashboardData), colSpan: 2 },
        { id: 'ticket-status-distribution', type: 'TicketStatusDistributionPieChart', props: widgetComponents.TicketStatusDistributionPieChart.getInitialProps(t, dashboardData), colSpan: 2 },
        { id: 'ticket-priority-distribution', type: 'TicketPriorityDistributionPieChart', props: widgetComponents.TicketPriorityDistributionPieChart.getInitialProps(t, dashboardData), colSpan: 2 },
        { id: 'ticket-category-distribution', type: 'TicketCategoryDistributionPieChart', props: widgetComponents.TicketCategoryDistributionPieChart.getInitialProps(t, dashboardData), colSpan: 2 },
      ]);
    }
  }, [initialWidgets, t,
    totalUsers, totalEmployees, monthlyData, userRoleDistribution, // Add data dependencies
    totalDivisions, totalAssetCategories, totalAssets, assetCategoryDistribution, assetStatusDistribution, // New data dependencies
    totalTickets, // Ticket data dependencies
    ticketStatusDistribution, ticketPriorityDistribution, ticketCategoryDistribution // Ticket chart dependencies
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
      // Force Chart.js responsive canvases to recalc after layout change
      if (typeof window !== 'undefined') {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
      }
      return newItems;
    });
  };

  const handleRemoveWidget = (id: UniqueIdentifier) => {
    setWidgets((prevWidgets) => {
      const newWidgets = prevWidgets.filter((widget) => widget.id !== id);
      saveLayout(newWidgets);
      if (typeof window !== 'undefined') {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
      }
      return newWidgets;
    });
    notify('success', t('Widget removed successfully!'));
  };

  const handleColSpanChange = (id: UniqueIdentifier, newColSpan: number) => {
    setWidgets((prevWidgets) => {
      const newWidgets = prevWidgets.map((widget) =>
        widget.id === id ? { ...widget, colSpan: newColSpan } : widget
      );
      saveLayout(newWidgets);
      if (typeof window !== 'undefined') {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
      }
      return newWidgets;
    });
    notify('success', t('Widget size updated!'));
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
      if (typeof window !== 'undefined') {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
      }
      return newWidgets;
    });

    setIsAddWidgetDialogOpen(false);
    setSelectedWidgetTypeToAdd(null);
    setNewWidgetProps({});
    notify('success', t('Widget added successfully!'));
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
      <div className="flex flex-col gap-6">
        <div className="flex justify-end mt-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 grid-flow-row-dense items-start gap-3 md:gap-4 min-w-0">
              {widgets.map((widget) => {
                const content = renderWidgetComponent(widget);
                if (!content) return null;
                return (
                  <DashboardWidgetWrapper
                    key={`${String(widget.id)}-${widget.colSpan}`}
                    id={widget.id}
                    colSpan={widget.colSpan}
                    onRemove={handleRemoveWidget}
                    onColSpanChange={handleColSpanChange}
                  >
                    {content}
                  </DashboardWidgetWrapper>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </AppLayout>
  );
}
