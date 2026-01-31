import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Calendar,
  CheckCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle
} from 'lucide-react';

interface StatusPanelsProps {
  className?: string;
  onFilterChange?: (filter: string) => void;
  activeFilter?: string;
}

export function StatusPanels({ className, onFilterChange, activeFilter }: StatusPanelsProps) {
  // TODO: Connect to /api/dashboard/stats for real data
  const statusData = [
    {
      id: 'active',
      title: 'Active Jobs',
      value: 0,
      change: '-',
      trend: 'up',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      description: 'Currently in progress'
    },
    {
      id: 'pending',
      title: 'Pending',
      value: 0,
      change: '-',
      trend: 'up',
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
      description: 'Awaiting action'
    },
    {
      id: 'completed',
      title: 'Completed Today',
      value: 0,
      change: '-',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      description: 'Jobs finished today'
    },
    {
      id: 'scheduled',
      title: 'Scheduled',
      value: 0,
      change: '-',
      trend: 'up',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
      description: 'Upcoming appointments'
    }
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statusData.map((item) => {
            const Icon = item.icon;
            const TrendIcon = item.trend === 'up' ? TrendingUp : TrendingDown;
            const trendColor = item.trend === 'up' ? 'text-green-600' : 'text-red-600';
            const isActive = activeFilter === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onFilterChange?.(item.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  isActive ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${item.bgColor}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{item.title}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                      <span className={trendColor}>{item.change}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{item.value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
