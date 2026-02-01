import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { ActivityMonitor } from '@/components/dashboard/activity-monitor';
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  RotateCcw,
  TrendingUp,
  Activity,
  BarChart3,
  CheckCircle,
  FileText,
  DollarSign,
  Target,
  MapPin
} from 'lucide-react';
import { HDCoverageMap } from '@/components/coverage/hd-coverage-map';

export default function AnalyticsOperations() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, navigate] = useLocation();

  // Fetch dashboard stats
  const { data: dashboardData, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    retry: false,
  });

  const recentActivity = (dashboardData as any)?.recentActivity || [];

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch().finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

  // Extract stats with fallbacks
  const stats = (dashboardData as any)?.stats || {
    totalJobs: 0,
    pendingJobs: 0,
    completedJobs: 0,
    revenue: 0,
    total: 0,
    success: 0,
    failed: 0,
    pending: 0,
    todayAppointments: 0,
    weeklyAppointments: 0,
  };

  const retryStats = (dashboardData as any)?.retryStats || {
    totalRetries: 0,
    autoRecovered: 0,
    successRate: 0,
    avgRetryTime: 0,
  };

  const conversionStats = (dashboardData as any)?.conversionStats || {
    formSubmissions: 0,
    jobsScheduled: 0,
    jobsCompleted: 0,
    invoicesPaid: 0,
    totalRevenue: 0,
  };

  // Calculate metrics
  const systemHealth = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 100;
  const conversionRate = conversionStats.formSubmissions > 0
    ? ((conversionStats.invoicesPaid / conversionStats.formSubmissions) * 100).toFixed(1)
    : '0';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">Unable to load analytics data</p>
          <Button onClick={handleRefresh} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics & Operations</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor performance, analytics, and system health</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="system-health" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            System Health
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-600">{systemHealth}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">System Health</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-blue-600">{stats.totalJobs}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-purple-600">{conversionRate}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold text-orange-600">{retryStats.successRate}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Omega EDI Connection</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Square Payments API</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">VIN Lookup Service</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">NAGS Parts Database</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Job Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Jobs</span>
                  <Badge variant="outline">{stats.pendingJobs}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed Jobs</span>
                  <Badge variant="outline">{stats.completedJobs}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Today's Appointments</span>
                  <Badge variant="outline">{stats.todayAppointments}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weekly Appointments</span>
                  <Badge variant="outline">{stats.weeklyAppointments}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Activity */}
          <ActivityMonitor
            activities={recentActivity}
            onViewAll={() => navigate('/admin/transaction-logs')}
          />

          {/* Revenue Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${(stats.revenue / 100).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {conversionStats.formSubmissions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Form Submissions</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {conversionStats.jobsCompleted}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Jobs Completed</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {conversionStats.invoicesPaid}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Invoices Paid</div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border dark:border-gray-700 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {conversionStats.formSubmissions > 0
                      ? ((conversionStats.jobsScheduled / conversionStats.formSubmissions) * 100).toFixed(1)
                      : '0'}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Submission → Scheduled</div>
                </div>
                <div className="text-center p-4 border dark:border-gray-700 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">
                    {conversionStats.jobsScheduled > 0
                      ? ((conversionStats.jobsCompleted / conversionStats.jobsScheduled) * 100).toFixed(1)
                      : '0'}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Scheduled → Completed</div>
                </div>
                <div className="text-center p-4 border dark:border-gray-700 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {conversionStats.jobsCompleted > 0
                      ? ((conversionStats.invoicesPaid / conversionStats.jobsCompleted) * 100).toFixed(1)
                      : '0'}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completed → Paid</div>
                </div>
                <div className="text-center p-4 border dark:border-gray-700 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{conversionRate}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overall Pipeline</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Coverage - Interactive HD Map */}
          <HDCoverageMap showSummaryCards={true} />
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system-health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-blue-600">
                  {retryStats.avgRetryTime > 0 ? `${retryStats.avgRetryTime}ms` : '-'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Processing Time</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-600">
                  {stats.total > 0 ? `${retryStats.successRate}%` : '-'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <RotateCcw className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold text-yellow-600">{retryStats.autoRecovered}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Auto Recovered</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Failed Requests</div>
              </CardContent>
            </Card>
          </div>

          {/* Processing Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.total === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                  <Activity className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No processing data yet</p>
                  <p className="text-sm">Pipeline metrics will appear here once form submissions are processed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Form Reception</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[20%]"></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-16">-</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">VIN Lookup</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[35%]"></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-16">-</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">NAGS Parts Matching</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[25%]"></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-16">-</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Portal Rendering</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 w-[5%]"></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-16">-</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Retry Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Error Recovery Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                  <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{retryStats.totalRetries}</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">In Queue</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{retryStats.autoRecovered}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Recovered</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{retryStats.successRate}%</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
