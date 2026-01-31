import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface ConversionAnalyticsPanelProps {
  className?: string;
}

export function ConversionAnalyticsPanel({ className }: ConversionAnalyticsPanelProps) {
  // TODO: Replace with actual API call to /api/analytics/conversion
  // When API is connected, implement data fetching and display logic

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
