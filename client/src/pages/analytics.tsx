import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityMonitor } from '@/components/dashboard/activity-monitor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  MapPin, 
  Car, 
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  MousePointer,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AnalyticsData {
  formSubmissions: FormSubmissionData[];
  conversionFunnel: ConversionStep[];
  popularLocations: LocationData[];
  serviceTypeBreakdown: ServiceTypeData[];
  timeBasedTrends: TimeSeriesData[];
  userJourney: UserJourneyData[];
  deviceBreakdown: DeviceData[];
  bounceRates: BounceRateData[];
}

interface FormSubmissionData {
  id: string;
  date: string;
  location: string;
  serviceType: string;
  vehicleYear: string;
  vehicleMake: string;
  status: 'pending' | 'quoted' | 'completed' | 'cancelled';
  source: 'direct' | 'organic' | 'referral';
  deviceType: 'desktop' | 'mobile' | 'tablet';
  completionTime: number; // seconds
}

interface ConversionStep {
  step: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
}

interface LocationData {
  location: string;
  count: number;
  percentage: number;
}

interface ServiceTypeData {
  serviceType: string;
  count: number;
  percentage: number;
  avgCompletionTime: number;
}

interface TimeSeriesData {
  date: string;
  submissions: number;
  quotes: number;
  completions: number;
}

interface UserJourneyData {
  step: string;
  avgTimeSpent: number;
  dropoffRate: number;
}

interface DeviceData {
  device: string;
  sessions: number;
  conversionRate: number;
}

interface BounceRateData {
  page: string;
  visits: number;
  bounces: number;
  bounceRate: number;
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, navigate] = useLocation();

  const { data: analyticsData, refetch } = useQuery({
    queryKey: ['/api/analytics', dateRange],
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const recentActivity = (dashboardData as any)?.recentActivity || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const exportData = () => {
    // Implementation for data export
    console.log('Exporting analytics data...');
  };

  // Mock data for demonstration
  const mockFormSubmissions: FormSubmissionData[] = [
    {
      id: '1',
      date: '2025-01-20',
      location: 'California | Los Angeles',
      serviceType: 'Glass Replacement',
      vehicleYear: '2023',
      vehicleMake: 'Toyota',
      status: 'completed',
      source: 'organic',
      deviceType: 'mobile',
      completionTime: 180
    },
    {
      id: '2',
      date: '2025-01-19',
      location: 'California | San Diego',
      serviceType: 'Rock Chip Repair',
      vehicleYear: '2021',
      vehicleMake: 'Honda',
      status: 'quoted',
      source: 'direct',
      deviceType: 'desktop',
      completionTime: 145
    },
    // Add more mock data as needed
  ];

  const conversionFunnelData: ConversionStep[] = [
    { step: 'Landing Page Views', visitors: 1250, conversions: 1250, conversionRate: 100 },
    { step: 'Form Started', visitors: 1250, conversions: 386, conversionRate: 30.9 },
    { step: 'Service Selected', visitors: 386, conversions: 298, conversionRate: 77.2 },
    { step: 'Vehicle Info Added', visitors: 298, conversions: 234, conversionRate: 78.5 },
    { step: 'Form Completed', visitors: 234, conversions: 187, conversionRate: 79.9 },
    { step: 'Quote Received', visitors: 187, conversions: 156, conversionRate: 83.4 },
  ];

  const locationData: LocationData[] = [
    { location: 'California | Los Angeles', count: 45, percentage: 24.1 },
    { location: 'California | San Diego', count: 38, percentage: 20.3 },
    { location: 'California | San Francisco', count: 29, percentage: 15.5 },
    { location: 'Texas | Houston', count: 22, percentage: 11.8 },
    { location: 'Florida | Miami', count: 18, percentage: 9.6 },
    { location: 'New York | Manhattan', count: 15, percentage: 8.0 },
    { location: 'Others', count: 20, percentage: 10.7 },
  ];

  const serviceTypeData: ServiceTypeData[] = [
    { serviceType: 'Glass Replacement', count: 89, percentage: 47.6, avgCompletionTime: 165 },
    { serviceType: 'Rock Chip Repair', count: 42, percentage: 22.5, avgCompletionTime: 95 },
    { serviceType: 'Power Window Motor/Regulator Service', count: 28, percentage: 15.0, avgCompletionTime: 140 },
    { serviceType: 'Side Mirror Replacement', count: 18, percentage: 9.6, avgCompletionTime: 120 },
    { serviceType: 'Others', count: 10, percentage: 5.3, avgCompletionTime: 135 },
  ];

  const timeSeriesData: TimeSeriesData[] = [
    { date: '2025-01-15', submissions: 12, quotes: 9, completions: 7 },
    { date: '2025-01-16', submissions: 15, quotes: 12, completions: 8 },
    { date: '2025-01-17', submissions: 18, quotes: 14, completions: 11 },
    { date: '2025-01-18', submissions: 22, quotes: 18, completions: 13 },
    { date: '2025-01-19', submissions: 25, quotes: 21, completions: 16 },
    { date: '2025-01-20', submissions: 19, quotes: 15, completions: 12 },
    { date: '2025-01-21', submissions: 16, quotes: 13, completions: 9 },
  ];

  const deviceData: DeviceData[] = [
    { device: 'Mobile', sessions: 156, conversionRate: 15.4 },
    { device: 'Desktop', sessions: 89, conversionRate: 22.5 },
    { device: 'Tablet', sessions: 23, conversionRate: 18.7 },
  ];

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Form submission trends and conversion insights</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32" data-testid="select-date-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" onClick={exportData} data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">187</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5%
              </span>
              from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.0%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2.1%
              </span>
              from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2m 45s</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                -8.2%
              </span>
              from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quote Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">83.4%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5.7%
              </span>
              from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity */}
      <ActivityMonitor
        activities={recentActivity}
        onViewAll={() => navigate('/admin/transaction-logs')}
      />

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-4">
        {/* Mobile: Stacked tabs */}
        <div className="md:hidden space-y-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="trends" className="text-xs">Trends</TabsTrigger>
            <TabsTrigger value="funnel" className="text-xs">Convert</TabsTrigger>
            <TabsTrigger value="locations" className="text-xs">Locations</TabsTrigger>
          </TabsList>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="services" className="text-xs">Services</TabsTrigger>
            <TabsTrigger value="devices" className="text-xs">Devices</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Desktop: Single row */}
        <div className="hidden md:block">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="funnel">Conversion</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submission Trends</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily form submissions, quotes, and completions</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="submissions" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="quotes" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="completions" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">User journey from landing to quote completion</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnelData.map((step, index) => (
                  <div key={step.step} className="flex items-center space-x-4">
                    <div className="w-32 text-sm font-medium">{step.step}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{step.conversions.toLocaleString()} conversions</span>
                        <span className="text-sm font-medium">{step.conversionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${step.conversionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Locations</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Form submissions by location</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={locationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {locationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} submissions`, props.payload.location]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Breakdown by region</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {locationData.map((location, index) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="text-sm font-medium">{location.location}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{location.count}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{location.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Type Breakdown</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">Popular services and completion times</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={serviceTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="serviceType" angle={-45} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Submissions" />
                  <Bar yAxisId="right" dataKey="avgCompletionTime" fill="#10b981" name="Avg. Completion Time (s)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sessions by device type</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, sessions }) => `${device} (${sessions})`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sessions"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Performance</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversion rates by device</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceData.map((device, index) => (
                    <div key={device.device} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{device.device}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{device.conversionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(device.conversionRate / Math.max(...deviceData.map(d => d.conversionRate))) * 100}%`,
                            backgroundColor: colors[index % colors.length]
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{device.sessions} sessions</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}