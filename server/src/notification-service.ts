import { db } from './db.js';
import { notifications, type InsertNotification, type Notification } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { WebSocket } from 'ws';

// Active WebSocket connections for real-time notifications
const activeConnections = new Set<WebSocket>();

export class NotificationService {
  // Add a WebSocket connection to receive real-time notifications
  static addConnection(ws: WebSocket) {
    activeConnections.add(ws);
    console.log(`[Notifications] Connection added. Total: ${activeConnections.size}`);
    
    // Remove connection when it closes
    ws.on('close', () => {
      activeConnections.delete(ws);
      console.log(`[Notifications] Connection removed. Total: ${activeConnections.size}`);
    });
  }

  // Create a new notification and broadcast it
  static async createNotification(data: Omit<InsertNotification, 'id' | 'createdAt'>): Promise<Notification> {
    try {
      // Insert into database
      const [notification] = await db
        .insert(notifications)
        .values({
          ...data,
          createdAt: new Date(),
        })
        .returning();

      console.log(`[Notifications] Created: ${notification.type} - ${notification.title}`);

      // Broadcast to all connected clients
      this.broadcastNotification(notification);

      return notification;
    } catch (error) {
      console.error('[Notifications] Failed to create notification:', error);
      throw error;
    }
  }

  // Broadcast notification to all connected WebSocket clients
  static broadcastNotification(notification: Notification) {
    const message = JSON.stringify({
      type: 'notification',
      notification: {
        ...notification,
        timestamp: notification.createdAt,
      },
    });

    activeConnections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
        } catch (error) {
          console.error('[Notifications] Failed to send to client:', error);
          activeConnections.delete(ws);
        }
      }
    });

    console.log(`[Notifications] Broadcasted to ${activeConnections.size} clients`);
  }

  // Get recent notifications
  static async getRecentNotifications(limit: number = 50): Promise<Notification[]> {
    try {
      return await db
        .select()
        .from(notifications)
        .orderBy(desc(notifications.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('[Notifications] Failed to fetch notifications:', error);
      return [];
    }
  }

  // Get unresolved notifications
  static async getUnresolvedNotifications(): Promise<Notification[]> {
    try {
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.resolved, false))
        .orderBy(desc(notifications.createdAt));
    } catch (error) {
      console.error('[Notifications] Failed to fetch unresolved notifications:', error);
      return [];
    }
  }

  // Mark notification as resolved
  static async resolveNotification(notificationId: string, resolvedBy?: string): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy,
        })
        .where(eq(notifications.id, notificationId));

      // Broadcast update to all clients
      const updateMessage = JSON.stringify({
        type: 'notification_update',
        notificationId,
        updates: {
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy,
        },
      });

      activeConnections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(updateMessage);
          } catch (error) {
            console.error('[Notifications] Failed to send update to client:', error);
            activeConnections.delete(ws);
          }
        }
      });

      console.log(`[Notifications] Resolved notification: ${notificationId}`);
    } catch (error) {
      console.error('[Notifications] Failed to resolve notification:', error);
      throw error;
    }
  }

  // Helper methods for common notification types
  static async notifyOmegaEdiFailure(details: {
    endpoint?: string;
    error: string;
    transactionId?: string;
    context?: Record<string, any>;
  }) {
    return this.createNotification({
      type: 'omega_edi_failure',
      severity: 'error',
      title: 'Omega EDI Integration Failed',
      message: `Failed to communicate with Omega EDI: ${details.error}`,
      details: details.context,
      source: details.endpoint,
      transactionId: details.transactionId,
    });
  }

  static async notifySquareApiFailure(details: {
    endpoint?: string;
    error: string;
    transactionId?: string;
    context?: Record<string, any>;
  }) {
    return this.createNotification({
      type: 'square_api_failure',
      severity: 'error',
      title: 'Square API Integration Failed',
      message: `Square API error: ${details.error}`,
      details: details.context,
      source: details.endpoint,
      transactionId: details.transactionId,
    });
  }

  static async notifyWebhookFailure(details: {
    source: string;
    error: string;
    retryCount?: number;
    context?: Record<string, any>;
  }) {
    return this.createNotification({
      type: 'webhook_failure',
      severity: details.retryCount && details.retryCount > 3 ? 'critical' : 'warning',
      title: 'Webhook Processing Failed',
      message: `Webhook from ${details.source} failed: ${details.error}`,
      details: details.context,
      source: details.source,
    });
  }

  static async notifyVinLookupFailure(details: {
    vin: string;
    error: string;
    transactionId?: string;
  }) {
    return this.createNotification({
      type: 'vin_lookup_failure',
      severity: 'warning',
      title: 'VIN Lookup Failed',
      message: `Could not identify vehicle with VIN ${details.vin}: ${details.error}`,
      details: { vin: details.vin },
      transactionId: details.transactionId,
    });
  }

  static async notifySystemError(details: {
    component: string;
    error: string;
    severity?: 'warning' | 'error' | 'critical';
    context?: Record<string, any>;
  }) {
    return this.createNotification({
      type: 'system_error',
      severity: details.severity || 'error',
      title: `System Error in ${details.component}`,
      message: details.error,
      details: details.context,
      source: details.component,
    });
  }
}