import { useState } from 'react';
import { Bell, AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/use-notifications';
import { formatDistance } from 'date-fns';
import type { Notification } from '@shared/schema';

const severityConfig = {
  info: { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-50', badgeColor: 'bg-blue-500' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-50', badgeColor: 'bg-yellow-500' },
  error: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-50', badgeColor: 'bg-red-500' },
  critical: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100', badgeColor: 'bg-red-600' },
};

function NotificationItem({ notification, onResolve, onMarkRead }: {
  notification: Notification;
  onResolve: (id: string) => Promise<void>;
  onMarkRead: (id: string) => void;
}) {
  const [isResolving, setIsResolving] = useState(false);
  const config = severityConfig[notification.severity as keyof typeof severityConfig];
  const Icon = config.icon;

  const handleResolve = async () => {
    if (notification.resolved) return;
    
    setIsResolving(true);
    try {
      await onResolve(notification.id);
      onMarkRead(notification.id);
    } catch (error) {
      console.error('Failed to resolve notification:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const timeAgo = notification.createdAt 
    ? formatDistance(new Date(notification.createdAt), new Date(), { addSuffix: true })
    : 'Unknown time';

  return (
    <div className={`p-3 border-l-4 ${config.bgColor} rounded-r-lg`} style={{ borderLeftColor: config.badgeColor.replace('bg-', '') === 'blue-500' ? '#3b82f6' : config.badgeColor.replace('bg-', '') === 'yellow-500' ? '#eab308' : '#ef4444' }}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <Icon className={`w-5 h-5 mt-0.5 ${config.color} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {notification.title}
              </h4>
              <Badge 
                variant="secondary" 
                className={`text-xs ${config.badgeColor} text-white`}
              >
                {notification.severity}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {notification.message}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{timeAgo}</span>
              {notification.source && (
                <span className="font-medium">{notification.source}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          {notification.resolved ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleResolve}
              disabled={isResolving}
              className="text-xs h-6 px-2"
            >
              {isResolving ? '...' : 'Resolve'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    resolveNotification,
    connectionStatus 
  } = useNotifications();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      // Mark all as read when opening
      setTimeout(() => markAllAsRead(), 500);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative h-9 w-9"
          data-testid="button-notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-gray-500 capitalize">
                  {connectionStatus}
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-3 p-3">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onResolve={resolveNotification}
                      onMarkRead={markAsRead}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}