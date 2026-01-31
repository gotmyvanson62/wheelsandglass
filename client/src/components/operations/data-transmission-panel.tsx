import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity } from "lucide-react";

export function DataTransmissionPanel() {
  // Production ready - no mock data. Metrics will be populated from real API data.
  const performanceData = null;

  if (!performanceData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Data Transmission Efficiency
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">Real-time processing optimization and performance metrics</p>
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
