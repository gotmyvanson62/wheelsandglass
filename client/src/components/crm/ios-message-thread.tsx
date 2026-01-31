import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  Phone,
  Mail,
  Users,
  MapPin,
  Clock,
  CheckCheck,
  Check,
  Send,
  ArrowLeft,
  User,
  Wrench,
  MoreVertical,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { TechnicianMessagePanel } from '../coverage/technician-message-panel';

interface Message {
  id: string;
  sender: 'customer' | 'admin' | 'installer';
  senderName: string;
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

interface Installer {
  id: string;
  name: string;
  role: string;
  phone: string;
  availability: string;
  status: 'available' | 'busy' | 'offline';
  location: string;
  specialties: string[];
}

interface ConversationThread {
  id: string;
  workOrderId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    vehicle: string;
    location: string;
  };
  assignedInstaller?: Installer;
  availableInstallers: Installer[];
  messages: Message[];
  status: 'active' | 'pending' | 'resolved';
  serviceType: string;
  lastActivity: Date;
}

// Conversations data - production ready (empty until real data from API)
const sampleConversations: ConversationThread[] = [];

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

interface MessageBubbleProps {
  message: Message;
  showTimestamp?: boolean;
}

function MessageBubble({ message, showTimestamp = false }: MessageBubbleProps) {
  const isOutgoing = message.sender === 'admin';
  const isInstaller = message.sender === 'installer';

  const bubbleStyles = {
    customer: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md',
    admin: 'bg-blue-500 text-white rounded-2xl rounded-br-md',
    installer: 'bg-green-100 dark:bg-green-900/50 text-green-900 dark:text-green-100 rounded-2xl rounded-bl-md',
  };

  const StatusIcon = message.status === 'read' ? CheckCheck : Check;

  return (
    <div className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} mb-3`}>
      {!isOutgoing && (
        <div className="flex items-center gap-2 mb-1 ml-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isInstaller ? 'bg-green-500' : 'bg-gray-400'}`}>
            {isInstaller ? <Wrench className="w-3 h-3 text-white" /> : <User className="w-3 h-3 text-white" />}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{message.senderName}</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-2 ${bubbleStyles[message.sender]}`}
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

interface InstallerCardProps {
  installer: Installer;
  isAssigned?: boolean;
  onMessage?: () => void;
  onCall?: () => void;
  onAssign?: () => void;
}

function InstallerCard({ installer, isAssigned, onMessage, onCall, onAssign }: InstallerCardProps) {
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

  return (
    <div className={`p-3 rounded-lg border ${isAssigned ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAssigned ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
            <Wrench className={`w-5 h-5 ${isAssigned ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'}`} />
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${statusColors[installer.status]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{installer.name}</span>
            {isAssigned && <Badge className="bg-green-500 text-white text-xs">Assigned</Badge>}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{installer.role}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{installer.availability}</span>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${
                installer.status === 'available'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : installer.status === 'busy'
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}
            >
              {statusLabels[installer.status]}
            </Badge>
          </div>
          {installer.location && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <MapPin className="w-3 h-3" />
              <span>{installer.location}</span>
            </div>
          )}
        </div>
      </div>
      {/* Actions */}
      <div className="mt-3 space-y-2">
        {/* Message and Call row */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className={`flex-1 text-xs h-8 ${isAssigned ? 'border-green-500 text-green-600 hover:bg-green-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            onClick={onMessage}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Message
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`h-8 w-8 p-0 ${isAssigned ? 'border-green-500 text-green-600 hover:bg-green-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            onClick={onCall}
          >
            <Phone className="w-3 h-3" />
          </Button>
        </div>
        {/* Assign button for non-assigned installers */}
        {!isAssigned && (
          <Button
            size="sm"
            className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onAssign}
          >
            <UserCheck className="w-3 h-3 mr-1" />
            Assign to Job
          </Button>
        )}
      </div>
    </div>
  );
}

interface ConversationListItemProps {
  conversation: ConversationThread;
  isActive: boolean;
  onClick: () => void;
}

function ConversationListItem({ conversation, isActive, onClick }: ConversationListItemProps) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const statusColors = {
    active: 'border-l-blue-500',
    pending: 'border-l-yellow-500',
    resolved: 'border-l-green-500',
  };

  return (
    <div
      className={`p-3 border-l-4 cursor-pointer transition-colors ${statusColors[conversation.status]} ${
        isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
          {conversation.customer.name}
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
          {formatTimeAgo(conversation.lastActivity)}
        </span>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        {conversation.workOrderId} • {conversation.serviceType}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
        {lastMessage?.content}
      </div>
      {conversation.status === 'pending' && (
        <Badge className="mt-2 bg-yellow-100 text-yellow-800 text-xs">Needs Response</Badge>
      )}
    </div>
  );
}

export function IOSMessageThread() {
  const [conversations, setConversations] = useState<ConversationThread[]>(sampleConversations);
  const [activeConversation, setActiveConversation] = useState<ConversationThread | null>(conversations[0]);
  const [messageInput, setMessageInput] = useState('');
  const [showConversationList, setShowConversationList] = useState(true);
  const [messagingInstaller, setMessagingInstaller] = useState<Installer | null>(null);
  const [assigningInstaller, setAssigningInstaller] = useState<Installer | null>(null);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversation) return;
    // In real app, this would send the message via API
    setMessageInput('');
  };

  const handleMessageInstaller = (installer: Installer) => {
    setMessagingInstaller(installer);
  };

  const handleCallInstaller = (installer: Installer) => {
    // In real app, initiate call
    window.open(`tel:${installer.phone}`, '_self');
  };

  const handleAssignInstaller = (installer: Installer) => {
    if (!activeConversation) return;

    // Update the conversation with the new assigned installer
    const updatedConversation: ConversationThread = {
      ...activeConversation,
      assignedInstaller: installer,
      // Move current assigned installer to available if exists
      availableInstallers: activeConversation.assignedInstaller
        ? [activeConversation.assignedInstaller, ...activeConversation.availableInstallers.filter(i => i.id !== installer.id)]
        : activeConversation.availableInstallers.filter(i => i.id !== installer.id),
    };

    // Update conversations list
    setConversations(prev => prev.map(c => c.id === activeConversation.id ? updatedConversation : c));
    setActiveConversation(updatedConversation);
    setAssigningInstaller(null);
  };

  const handleReassignJob = () => {
    if (!activeConversation?.assignedInstaller) return;

    // Move assigned installer to available
    const updatedConversation: ConversationThread = {
      ...activeConversation,
      assignedInstaller: undefined,
      availableInstallers: [activeConversation.assignedInstaller, ...activeConversation.availableInstallers],
    };

    setConversations(prev => prev.map(c => c.id === activeConversation.id ? updatedConversation : c));
    setActiveConversation(updatedConversation);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[700px]">
      {/* Conversation List - Hidden on mobile when viewing a thread */}
      <Card className={`lg:w-80 flex-shrink-0 ${!showConversationList && activeConversation ? 'hidden lg:flex' : 'flex'} flex-col`}>
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0 divide-y dark:divide-gray-700">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs">Messages will appear here.</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                isActive={activeConversation?.id === conv.id}
                onClick={() => {
                  setActiveConversation(conv);
                  setShowConversationList(false);
                }}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Active Thread */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-w-0">
          {/* Message Thread */}
          <Card className="flex-1 flex flex-col min-w-0">
            {/* Thread Header */}
            <CardHeader className="pb-2 border-b dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden -ml-2"
                  onClick={() => setShowConversationList(true)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {activeConversation.customer.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {activeConversation.workOrderId}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {activeConversation.customer.vehicle} • {activeConversation.serviceType}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-auto p-4 space-y-1">
              {activeConversation.messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showTimestamp={index === 0 || activeConversation.messages[index - 1].sender !== message.sender}
                />
              ))}
            </CardContent>

            {/* Message Input */}
            <div className="p-3 border-t dark:border-gray-700 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSendMessage} disabled={!messageInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {/* Quick CTAs */}
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Phone className="w-3 h-3 mr-1" />
                  Call Customer
                </Button>
                <Button size="sm" variant="outline" className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Mail className="w-3 h-3 mr-1" />
                  Email Customer
                </Button>
              </div>
            </div>
          </Card>

          {/* Installer Panel */}
          <Card className="lg:w-72 flex-shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Service Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location Info */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                <div className="font-medium text-gray-900 dark:text-gray-100">{activeConversation.customer.location}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activeConversation.customer.phone}
                </div>
              </div>

              {/* Assigned Installer */}
              {activeConversation.assignedInstaller ? (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    Assigned Installer
                  </h4>
                  <InstallerCard
                    installer={activeConversation.assignedInstaller}
                    isAssigned
                    onMessage={() => handleMessageInstaller(activeConversation.assignedInstaller!)}
                    onCall={() => handleCallInstaller(activeConversation.assignedInstaller!)}
                  />
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2 font-medium text-yellow-800 dark:text-yellow-200 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    No Installer Assigned
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Select an available installer below to assign this job.
                  </p>
                </div>
              )}

              {/* Assignment Confirmation */}
              {assigningInstaller && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="font-medium text-blue-800 dark:text-blue-200 text-sm mb-2">
                    Assign {assigningInstaller.name}?
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                    {assigningInstaller.role} • {assigningInstaller.availability}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleAssignInstaller(assigningInstaller)}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => setAssigningInstaller(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Available Installers */}
              {activeConversation.availableInstallers.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {activeConversation.assignedInstaller ? 'Available Alternatives' : 'Available Installers'}
                  </h4>
                  <div className="space-y-2">
                    {activeConversation.availableInstallers.map((installer) => (
                      <InstallerCard
                        key={installer.id}
                        installer={installer}
                        onAssign={() => setAssigningInstaller(installer)}
                        onMessage={() => handleMessageInstaller(installer)}
                        onCall={() => handleCallInstaller(installer)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Installer Action */}
              {activeConversation.assignedInstaller && (
                <Button
                  variant="outline"
                  className="w-full text-xs text-orange-600 border-orange-500 hover:bg-orange-50"
                  onClick={handleReassignJob}
                >
                  <Users className="w-3 h-3 mr-1" />
                  Reassign Job
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a conversation to view messages</p>
          </div>
        </Card>
      )}

      {/* Installer Messaging Panel */}
      {messagingInstaller && (
        <TechnicianMessagePanel
          technician={{
            name: messagingInstaller.name,
            specialty: messagingInstaller.role,
            status: messagingInstaller.status,
            city: messagingInstaller.location,
            phone: messagingInstaller.phone,
          }}
          onClose={() => setMessagingInstaller(null)}
        />
      )}
    </div>
  );
}
