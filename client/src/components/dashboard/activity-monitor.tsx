import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

// Local ActivityLog interface
interface ActivityLog {
  id: number;
  type: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string | Date;
}

interface ActivityMonitorProps {
  activities: ActivityLog[];
  onViewAll?: () => void;
}

export function ActivityMonitor({ activities, onViewAll }: ActivityMonitorProps) {
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'job_created':
        return 'bg-green-500';
      case 'form_received':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      case 'retry':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getActivityMessage = (activity: ActivityLog) => {
    return activity.message;
  };

  const getActivityDetails = (activity: ActivityLog) => {
    const details = activity.details as any;
    const timestamp = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
    
    if (details?.omegaJobId) {
      return `Job ID: ${details.omegaJobId} • ${timestamp}`;
    }
    if (details?.source) {
      return `Source: ${details.source} • ${timestamp}`;
    }
    if (details?.retryCount) {
      return `Retry ${details.retryCount} • ${timestamp}`;
    }
    return timestamp;
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">Real-time Activity</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">Live monitoring of form submissions and job creation</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No recent activity
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100">{getActivityMessage(activity)}</p>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {getActivityDetails(activity)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {onViewAll && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={onViewAll}
            >
              View All Activity Logs →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
