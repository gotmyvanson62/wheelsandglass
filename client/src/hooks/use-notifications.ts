import { useState, useEffect, useRef } from 'react';

// Local interface matching the notification structure
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

interface WebSocketMessage {
  type: 'notification' | 'notification_update';
  notification?: Notification & { timestamp: Date };
  notificationId?: string;
  updates?: {
    resolved?: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
  };
}

export interface NotificationHookReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  resolveNotification: (notificationId: string) => Promise<void>;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export function useNotifications(): NotificationHookReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;
    
    console.log('[Notifications] Connecting to:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[Notifications] WebSocket connected');
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Clear any pending reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        if (message.type === 'notification' && message.notification) {
          console.log('[Notifications] Received:', message.notification.title);
          setNotifications(prev => [message.notification!, ...prev]);
        } else if (message.type === 'notification_update') {
          setNotifications(prev => 
            prev.map(n => 
              n.id === message.notificationId 
                ? { ...n, ...message.updates }
                : n
            )
          );
        }
      } catch (error) {
        console.error('[Notifications] Failed to parse message:', error);
      }
    };

    ws.onclose = () => {
      console.log('[Notifications] WebSocket disconnected');
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      // Attempt to reconnect after a delay
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('[Notifications] Attempting to reconnect...');
        connectWebSocket();
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error('[Notifications] WebSocket error:', error);
      setConnectionStatus('error');
    };
  };

  // Load initial notifications from API
  const loadInitialNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/unresolved', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('[Notifications] Failed to load initial notifications:', error);
    }
  };

  useEffect(() => {
    loadInitialNotifications();
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const markAsRead = (notificationId: string) => {
    setReadNotifications(prev => new Set([...prev, notificationId]));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(new Set(allIds));
  };

  const resolveNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ resolvedBy: 'admin' }),
      });

      if (!response.ok) {
        throw new Error('Failed to resolve notification');
      }

      // The WebSocket will handle updating the notification state
    } catch (error) {
      console.error('[Notifications] Failed to resolve notification:', error);
      throw error;
    }
  };

  const unreadCount = notifications.filter(n => 
    !n.resolved && !Array.from(readNotifications).includes(n.id)
  ).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    resolveNotification,
    isConnected,
    connectionStatus,
  };
}