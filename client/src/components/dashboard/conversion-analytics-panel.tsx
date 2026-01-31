import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface ConversionAnalyticsPanelProps {
  className?: string;
}

export function ConversionAnalyticsPanel({ className }: ConversionAnalyticsPanelProps) {
  // TODO: Replace with actual API call to /api/analytics/conversion
  // const { data: conversionData } = useQuery({ queryKey: ['/api/analytics/conversion'] });
  const conversionData = null; // Set to null to show empty state until API is connected

  // Show empty state when no data
  if (!conversionData) {
    return (
      <Card className={`dark:bg-gray-800 dark:border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <TrendingUp className="w-5 h-5" />
            Conversion Rate Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No analytics data yet</p>
            <p className="text-sm">Conversion metrics will appear here once form submissions are received.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const conversionSteps = [
    { label: 'Form Submissions', value: conversionData.formSubmissions, rate: 100 },
    { label: 'Portal Visits', value: conversionData.portalVisits, rate: conversionData.formSubmissions > 0 ? (conversionData.portalVisits / conversionData.formSubmissions * 100).toFixed(1) : 0 },
    { label: 'Square Bookings', value: conversionData.squareBookings, rate: conversionData.formSubmissions > 0 ? (conversionData.squareBookings / conversionData.formSubmissions * 100).toFixed(1) : 0 },
    { label: 'Payments Completed', value: conversionData.paymentsCompleted, rate: conversionData.formSubmissions > 0 ? (conversionData.paymentsCompleted / conversionData.formSubmissions * 100).toFixed(1) : 0 }
  ];

  return (
    <Card className={`dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <TrendingUp className="w-5 h-5" />
          Conversion Rate Analytics
          <Badge variant="secondary" className="ml-auto">
            {conversionData.trend || '-'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {conversionData.conversionRate}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Overall Conversion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${conversionData.averageRevenue}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Avg Revenue</div>
            </div>
          </div>

          <div className="space-y-3">
            {conversionSteps.map((step, index) => (
              <div key={step.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm dark:text-gray-200">{step.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium dark:text-gray-100">{step.value}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({step.rate}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}