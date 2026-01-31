import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Phone,
  Send,
  CheckCheck,
  Check,
  User,
  Wrench,
  MapPin,
  Clock
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'admin' | 'technician';
  senderName: string;
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

interface TechnicianInfo {
  name: string;
  specialty: string;
  status: 'available' | 'busy' | 'offline';
  city: string;
  phone?: string;
}

interface TechnicianMessagePanelProps {
  technician: TechnicianInfo;
  onClose: () => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function MessageBubble({ message }: { message: Message }) {
  const isOutgoing = message.sender === 'admin';
  const StatusIcon = message.status === 'read' ? CheckCheck : Check;

  return (
    <div className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} mb-3`}>
      {!isOutgoing && (
        <div className="flex items-center gap-2 mb-1 ml-1">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <Wrench className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{message.senderName}</span>
        </div>
      )}
      <div
        className={`max-w-[85%] px-3 py-2 ${
          isOutgoing
            ? 'bg-blue-500 text-white rounded-2xl rounded-br-md'
            : 'bg-green-100 dark:bg-green-900/50 text-green-900 dark:text-green-100 rounded-2xl rounded-bl-md'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
      <div className={`flex items-center gap-1 mt-1 ${isOutgoing ? 'mr-1' : 'ml-1'}`}>
        <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
        {isOutgoing && message.status && (
          <StatusIcon className={`w-3 h-3 ${message.status === 'read' ? 'text-blue-500' : 'text-gray-400'}`} />
        )}
      </div>
    </div>
  );
}

// Sample conversation data for demo
function getSampleMessages(technicianName: string): Message[] {
  return [
    {
      id: 'm1',
      sender: 'admin',
      senderName: 'You',
      content: `Hey ${technicianName.split(' ')[0]}, are you available for a job in your area?`,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'read',
    },
    {
      id: 'm2',
      sender: 'technician',
      senderName: technicianName,
      content: "Yes, I'm wrapping up my current job now. What do you have?",
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
    },
    {
      id: 'm3',
      sender: 'admin',
      senderName: 'You',
      content: 'Windshield replacement for a 2022 Tesla Model 3. Customer is at Downtown location.',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      status: 'read',
    },
    {
      id: 'm4',
      sender: 'technician',
      senderName: technicianName,
      content: "Perfect, I can be there in about 30 minutes. Do they need ADAS calibration?",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
    },
  ];
}

export function TechnicianMessagePanel({ technician, onClose }: TechnicianMessagePanelProps) {
  const [messages, setMessages] = useState<Message[]>(() => getSampleMessages(technician.name));
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const statusColors = {
    available: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-gray-400',
  };

  const statusLabels = {
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline',
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      sender: 'admin',
      senderName: 'You',
      content: messageInput,
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput('');

    // Simulate delivery status update
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'delivered' as const } : m))
      );
    }, 1000);

    // Simulate read status update
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'read' as const } : m))
      );
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Wrench className="w-5 h-5 text-green-600" />
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${statusColors[technician.status]}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{technician.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{technician.specialty}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    technician.status === 'available'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : technician.status === 'busy'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  {statusLabels[technician.status]}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Location and Phone */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {technician.city}
          </span>
          {technician.phone && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-green-600 hover:text-green-700">
              <Phone className="w-3 h-3 mr-1" />
              Call
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 text-sm"
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
