import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { smsTemplates } from '@/components/crm/omega-template-variables';
import { 
  MessageSquare, 
  Send, 
  Building2,
  ArrowRightLeft,
  User
} from 'lucide-react';

interface SMSConversation {
  id: string;
  customerPhone: string;
  customerName: string;
  jobId: string;
  status: 'active' | 'pending' | 'completed' | 'escalated';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isAutomated: boolean;
  flexAgent?: string;
  messages: SMSMessage[];
}

interface SMSMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: Date;
  source: 'omega' | 'twilio_flex' | 'system';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  templateUsed?: string;
  agentName?: string;
}

export function SMSMessagingPanel() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const { toast } = useToast();

  // Fetch SMS conversations
  const { data: conversations = [] } = useQuery<SMSConversation[]>({
    queryKey: ['/api/sms/conversations'],
    refetchInterval: 5000
  });

  // Fetch Twilio Flex status
  const { data: flexStatus = { connected: false, availableAgents: 0, queueLength: 0 } } = useQuery<{
    connected: boolean;
    availableAgents: number;
    queueLength: number;
  }>({
    queryKey: ['/api/flex/status']
  });

  // Send SMS mutation
  const sendSMSMutation = useMutation({
    mutationFn: async (data: { conversationId: string; message: string; template?: string; source: 'omega' | 'twilio_flex' }) => {
      return apiRequest(`/api/sms/send`, 'POST', data);
    },
    onSuccess: () => {
      setNewMessage('');
      setSelectedTemplate('');
      queryClient.invalidateQueries({ queryKey: ['/api/sms/conversations'] });
      toast({ title: "Message sent successfully" });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  });

  // Escalate to Flex mutation
  const escalateToFlexMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return apiRequest(`/api/flex/escalate/${conversationId}`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sms/conversations'] });
      toast({ title: "Conversation escalated to Flex agent" });
    }
  });

  const selectedConversationData = conversations.find((c: SMSConversation) => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim()) return;
    
    sendSMSMutation.mutate({
      conversationId: selectedConversation,
      message: newMessage,
      template: selectedTemplate,
      source: 'omega'
    });
  };

  const handleUseTemplate = (templateKey: string) => {
    const template = smsTemplates[templateKey as keyof typeof smsTemplates];
    if (template) {
      setNewMessage(template.template);
      setSelectedTemplate(templateKey);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
      {/* Conversation List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ArrowRightLeft className="w-4 h-4" />
            SMS Conversations
            <Badge variant={flexStatus.connected ? "default" : "destructive"} className="ml-auto text-xs">
              Flex {flexStatus.connected ? "On" : "Off"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.map((conversation: SMSConversation) => (
              <div
                key={conversation.id}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{conversation.customerName}</h4>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{conversation.customerPhone}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={conversation.status === 'active' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {conversation.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conversation.lastMessageTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {conversation.flexAgent && (
                  <div className="flex items-center gap-1 mt-2">
                    <User className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-600">{conversation.flexAgent}</span>
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="lg:col-span-2">
        {selectedConversationData ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">{selectedConversationData.customerName}</CardTitle>
                  <p className="text-xs text-gray-600">
                    Job #{selectedConversationData.jobId} • {selectedConversationData.customerPhone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedConversationData.status !== 'escalated' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => escalateToFlexMutation.mutate(selectedConversationData.id)}
                      disabled={escalateToFlexMutation.isPending}
                    >
                      <Building2 className="w-4 h-4 mr-1" />
                      Escalate
                    </Button>
                  )}
                  <Badge variant={selectedConversationData.isAutomated ? 'default' : 'secondary'}>
                    {selectedConversationData.isAutomated ? 'Auto' : 'Manual'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Messages */}
              <ScrollArea className="h-[350px] p-4">
                <div className="space-y-3">
                  {(selectedConversationData.messages || []).map((message: SMSMessage) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          message.direction === 'outbound'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <div className="flex items-center gap-1">
                            {message.source === 'omega' && <span>Ω</span>}
                            {message.source === 'twilio_flex' && <Building2 className="w-3 h-3" />}
                            {message.agentName && <span>{message.agentName}</span>}
                          </div>
                          <span className={message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4 space-y-3">
                <div className="flex gap-2">
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Choose template" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(smsTemplates).map(([key, template]) => (
                        <SelectItem key={key} value={key}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUseTemplate(selectedTemplate)}
                    >
                      Use Template
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendSMSMutation.isPending}
                    size="sm"
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="h-[500px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}