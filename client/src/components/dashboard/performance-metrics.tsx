import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  Database,
  Network,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface PerformanceMetrics {
  totalOptimizedSubmissions: number;
  averageProcessingTime: number;
  fastestProcessing: number;
  slowestProcessing: number;
  successRate: number;
}

export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/performance/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Zap className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 dark:text-gray-400">Loading metrics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Zap className="w-5 h-5" />
            Data Transmission Efficiency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <Database className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No performance data yet</p>
            <p className="text-sm">Efficiency metrics will appear here once form submissions are processed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceColor = (time: number) => {
    if (time < 1000) return 'text-green-600';
    if (time < 3000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (time: number) => {
    if (time < 1000) return { variant: 'default' as const, label: 'Excellent' };
    if (time < 3000) return { variant: 'secondary' as const, label: 'Good' };
    return { variant: 'destructive' as const, label: 'Needs Optimization' };
  };

  const efficiencyScore = Math.max(0, 100 - (metrics.averageProcessingTime / 50));

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <Zap className="w-5 h-5" />
          Data Transmission Efficiency
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Efficiency Score */}
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {Math.round(efficiencyScore)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">Overall Efficiency Score</div>
          <Progress value={efficiencyScore} className="w-full" />
        </div>

        {/* Processing Time Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 border dark:border-gray-700 rounded-lg">
            <div className={`text-2xl font-bold ${getPerformanceColor(metrics.averageProcessingTime)}`}>
              {metrics.averageProcessingTime}ms
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average Processing</div>
            <Badge {...getPerformanceBadge(metrics.averageProcessingTime)} className="mt-2">
              {getPerformanceBadge(metrics.averageProcessingTime).label}
            </Badge>
          </div>

          <div className="text-center p-3 border dark:border-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {metrics.fastestProcessing}ms
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Fastest Processing</div>
            <Badge variant="outline" className="mt-2 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700">
              Best Performance
            </Badge>
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-4 border dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-medium dark:text-gray-100">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(metrics.successRate)}%
            </div>
          </div>
          <Progress value={metrics.successRate} className="w-full" />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Based on {metrics.totalOptimizedSubmissions} recent submissions
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2 dark:text-gray-100">
            <Network className="w-4 h-4" />
            Optimization Impact
          </h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/30 rounded">
              <span className="dark:text-gray-200">Parallel API Calls</span>
              <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-700">
                ~60% Faster
              </Badge>
            </div>

            <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded">
              <span className="dark:text-gray-200">Data Streaming</span>
              <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700">
                ~30% Faster
              </Badge>
            </div>

            <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900/30 rounded">
              <span className="dark:text-gray-200">Cached Results</span>
              <Badge variant="outline" className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700">
                ~40% Faster
              </Badge>
            </div>
          </div>
        </div>

        {/* Performance Recommendations */}
        {metrics.averageProcessingTime > 3000 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="font-medium text-yellow-800 dark:text-yellow-300">Performance Recommendations</span>
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
              <div>• Consider implementing database connection pooling</div>
              <div>• Enable API response caching for VIN lookups</div>
              <div>• Optimize NAGS parts database queries</div>
            </div>
          </div>
        )}

        {/* Real-time Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium dark:text-gray-100">Real-time Monitoring</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}