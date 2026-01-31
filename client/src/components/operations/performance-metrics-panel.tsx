import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Activity
} from 'lucide-react';

interface PerformanceMetrics {
  totalOptimizedSubmissions: number;
  averageProcessingTime: number;
  fastestProcessingTime: number;
  slowestProcessingTime: number;
  successRate: number;
  errorRate: number;
  optimizationImpact: {
    timeReduction: number;
    efficiencyGain: number;
    processingImprovement: string;
  };
}

export function PerformanceMetricsPanel() {
  const { data: metrics, isLoading } = useQuery<PerformanceMetrics>({
    queryKey: ['/api/performance/metrics'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading performance data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Processing Time</p>
                <p className="text-2xl font-bold text-green-600">{metrics.averageProcessingTime}ms</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Best: {metrics.fastestProcessingTime}ms
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.successRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Progress value={metrics.successRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Optimized Submissions</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.totalOptimizedSubmissions}</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Badge variant="default" className="text-xs">
                Live System
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-red-600">{metrics.errorRate}%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="mt-2">
              <Badge variant={metrics.errorRate < 5 ? "default" : "destructive"} className="text-xs">
                {metrics.errorRate < 5 ? "Healthy" : "Attention Required"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Time Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Time Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Form Reception to Customer Portal</span>
              <div className="flex items-center gap-2">
                <Progress value={20} className="w-24 h-2" />
                <span className="text-sm text-gray-600">~200ms</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">VIN Lookup + Vehicle Identification</span>
              <div className="flex items-center gap-2">
                <Progress value={35} className="w-24 h-2" />
                <span className="text-sm text-gray-600">~350ms</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">NAGS Parts Matching + Pricing</span>
              <div className="flex items-center gap-2">
                <Progress value={40} className="w-24 h-2" />
                <span className="text-sm text-gray-600">~400ms</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Customer Portal Rendering</span>
              <div className="flex items-center gap-2">
                <Progress value={5} className="w-24 h-2" />
                <span className="text-sm text-gray-600">~50ms</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Total Optimized Time:</strong> ~{metrics.averageProcessingTime}ms 
              (Previously 8-12 seconds with sequential processing)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}