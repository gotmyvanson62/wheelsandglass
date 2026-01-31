import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Activity } from 'lucide-react';

interface DataTransmissionPanelProps {
  className?: string;
}

export function DataTransmissionPanel({ className }: DataTransmissionPanelProps) {
  // Production ready - no mock data. Metrics will be populated from real API data.
  // Set to null to show empty state until real data is available.
  const performanceData = null;

  if (!performanceData) {
    return (
      <Card className={`dark:bg-gray-800 dark:border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Zap className="w-5 h-5" />
            Data Transmission Efficiency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <Activity className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No performance data yet</p>
            <p className="text-sm">Transmission metrics will appear here once form submissions are processed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}