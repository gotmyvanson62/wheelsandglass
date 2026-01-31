import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Message interface
interface Message {
  id: string;
  conversationId: string;
  sender: 'admin' | 'technician' | 'customer';
  senderName: string;
  senderId?: number;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

// Conversation interface
interface Conversation {
  id: string;
  participantType: 'technician' | 'customer';
  participantId: number;
  participantName: string;
  participantPhone?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  messages: Message[];
}

// In-memory message store (will be replaced with database/Twilio integration)
const conversationsStore: Map<string, Conversation> = new Map();
let currentMessageId = 1;

// Generate conversation ID
function generateConversationId(type: string, participantId: number): string {
  return `${type}-${participantId}`;
}

// Get or create conversation
function getOrCreateConversation(
  type: 'technician' | 'customer',
  participantId: number,
  participantName: string,
  participantPhone?: string
): Conversation {
  const id = generateConversationId(type, participantId);

  if (!conversationsStore.has(id)) {
    const conversation: Conversation = {
      id,
      participantType: type,
      participantId,
      participantName,
      participantPhone,
      unreadCount: 0,
      messages: []
    };
    conversationsStore.set(id, conversation);
  }

  return conversationsStore.get(id)!;
}

/**
 * GET /api/messages/technician/:id
 * Get conversation history with a technician (protected)
 */
router.get('/technician/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const technicianId = parseInt(req.params.id);

    if (isNaN(technicianId)) {
      return res.status(400).json({ error: 'Invalid technician ID' });
    }

    const conversationId = generateConversationId('technician', technicianId);
    const conversation = conversationsStore.get(conversationId);

    if (!conversation) {
      // Return empty conversation structure
      return res.json({
        conversationId,
        participantType: 'technician',
        participantId: technicianId,
        messages: [],
        unreadCount: 0
      });
    }

    res.json({
      conversationId: conversation.id,
      participantType: conversation.participantType,
      participantId: conversation.participantId,
      participantName: conversation.participantName,
      participantPhone: conversation.participantPhone,
      messages: conversation.messages,
      unreadCount: conversation.unreadCount
    });

  } catch (error) {
    console.error('Error fetching technician messages:', error);
    res.status(500).json({
      error: 'Failed to fetch messages',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/messages/technician/:id
 * Send a message to a technician (protected)
 */
router.post('/technician/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const technicianId = parseInt(req.params.id);

    if (isNaN(technicianId)) {
      return res.status(400).json({ error: 'Invalid technician ID' });
    }

    const messageSchema = z.object({
      content: z.string().min(1, 'Message content is required'),
      technicianName: z.string().optional(),
      technicianPhone: z.string().optional()
    });

    const validationResult = messageSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const { content, technicianName, technicianPhone } = validationResult.data;

    // Get or create conversation
    const conversation = getOrCreateConversation(
      'technician',
      technicianId,
      technicianName || `Technician #${technicianId}`,
      technicianPhone
    );

    // Create the message
    const message: Message = {
      id: `msg-${currentMessageId++}`,
      conversationId: conversation.id,
      sender: 'admin',
      senderName: 'Admin',
      content,
      timestamp: new Date(),
      status: 'sent'
    };

    conversation.messages.push(message);
    conversation.lastMessage = content;
    conversation.lastMessageTime = message.timestamp;

    // Simulate delivery status update after 1 second
    setTimeout(() => {
      message.status = 'delivered';
    }, 1000);

    // Simulate read status update after 2 seconds
    setTimeout(() => {
      message.status = 'read';
    }, 2000);

    // Log the activity
    await storage.createActivityLog({
      type: 'message_sent',
      message: `Message sent to technician ${conversation.participantName}`,
      details: {
        technicianId,
        messageId: message.id,
        contentPreview: content.substring(0, 50)
      }
    });

    // In production, this would integrate with Twilio SMS API
    // await twilioService.sendSMS(technicianPhone, content);

    res.json({
      success: true,
      message,
      conversationId: conversation.id
    });

  } catch (error) {
    console.error('Error sending message to technician:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/messages/technician/:id/simulate-reply
 * Simulate a technician reply (for demo purposes) (protected)
 */
router.post('/technician/:id/simulate-reply', authMiddleware, async (req: Request, res: Response) => {
  try {
    const technicianId = parseInt(req.params.id);

    if (isNaN(technicianId)) {
      return res.status(400).json({ error: 'Invalid technician ID' });
    }

    const conversationId = generateConversationId('technician', technicianId);
    const conversation = conversationsStore.get(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const replySchema = z.object({
      content: z.string().min(1, 'Reply content is required')
    });

    const validationResult = replySchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const { content } = validationResult.data;

    // Create technician reply message
    const message: Message = {
      id: `msg-${currentMessageId++}`,
      conversationId: conversation.id,
      sender: 'technician',
      senderName: conversation.participantName,
      senderId: technicianId,
      content,
      timestamp: new Date(),
      status: 'delivered'
    };

    conversation.messages.push(message);
    conversation.lastMessage = content;
    conversation.lastMessageTime = message.timestamp;
    conversation.unreadCount++;

    res.json({
      success: true,
      message,
      conversationId: conversation.id
    });

  } catch (error) {
    console.error('Error simulating technician reply:', error);
    res.status(500).json({
      error: 'Failed to simulate reply',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /api/messages/technician/:id/read
 * Mark all messages in a conversation as read (protected)
 */
router.patch('/technician/:id/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const technicianId = parseInt(req.params.id);

    if (isNaN(technicianId)) {
      return res.status(400).json({ error: 'Invalid technician ID' });
    }

    const conversationId = generateConversationId('technician', technicianId);
    const conversation = conversationsStore.get(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Mark all messages as read
    conversation.messages.forEach(msg => {
      if (msg.sender !== 'admin') {
        msg.status = 'read';
      }
    });
    conversation.unreadCount = 0;

    res.json({
      success: true,
      conversationId: conversation.id
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      error: 'Failed to mark messages as read',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/messages/conversations
 * Get all conversations (for messaging hub) (protected)
 */
router.get('/conversations', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    let conversations = Array.from(conversationsStore.values());

    if (type && typeof type === 'string') {
      conversations = conversations.filter(c => c.participantType === type);
    }

    // Sort by last message time (most recent first)
    conversations.sort((a, b) => {
      const timeA = a.lastMessageTime?.getTime() || 0;
      const timeB = b.lastMessageTime?.getTime() || 0;
      return timeB - timeA;
    });

    res.json({
      conversations: conversations.map(c => ({
        id: c.id,
        participantType: c.participantType,
        participantId: c.participantId,
        participantName: c.participantName,
        lastMessage: c.lastMessage,
        lastMessageTime: c.lastMessageTime,
        unreadCount: c.unreadCount,
        messageCount: c.messages.length
      })),
      total: conversations.length
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      error: 'Failed to fetch conversations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
