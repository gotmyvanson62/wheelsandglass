import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { smsTemplates } from '@/components/crm/omega-template-variables';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Building2,
  ArrowRightLeft,
  Zap,
  Settings
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

interface AutomationRule {
  id: string;
  trigger: 'job_created' | 'payment_received' | 'appointment_confirmed' | 'tech_dispatched' | 'service_complete';
  template: string;
  enabled: boolean;
  delay: number; // minutes
}

export function BidirectionalSMSInterface() {
  const [activeTab, setActiveTab] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const { toast } = useToast();

  // Fetch SMS conversations
  const { data: conversations = [], isLoading } = useQuery<SMSConversation[]>({
    queryKey: ['/api/sms/conversations'],
    refetchInterval: 5000 // Real-time updates every 5 seconds
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
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <ArrowRightLeft className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">SMS Communications</h1>
          <p className="text-sm text-gray-600">Bidirectional Omega EDI ↔ Twilio Flex messaging</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={flexStatus.connected ? "default" : "destructive"}>
            Flex {flexStatus.connected ? "Connected" : "Disconnected"}
          </Badge>
          <Badge variant="outline">
            {(conversations as SMSConversation[]).length} Active
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conversations" className="text-xs md:text-sm">
            <MessageSquare className="w-4 h-4 mr-1" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="automation" className="text-xs md:text-sm">
            <Zap className="w-4 h-4 mr-1" />
            Auto Rules
          </TabsTrigger>
          <TabsTrigger value="flex" className="text-xs md:text-sm">
            <Building2 className="w-4 h-4 mr-1" />
            Flex Hub
          </TabsTrigger>
        </TabsList>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
            {/* Conversation List */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Active Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {(conversations as SMSConversation[]).map((conversation: SMSConversation) => (
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
                            Escalate to Flex
                          </Button>
                        )}
                        <Badge variant={selectedConversationData.isAutomated ? 'default' : 'secondary'}>
                          {selectedConversationData.isAutomated ? 'Automated' : 'Manual'}
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
                  Select a conversation to view messages
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Automation Rules Tab */}
        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                SMS Automation Rules
              </CardTitle>
              <p className="text-sm text-gray-600">Configure automatic SMS triggers based on job status changes</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(smsTemplates).map(([key, template]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{template.name}</h4>
                    <p className="text-xs text-gray-600">{template.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Auto Send</Badge>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flex Hub Tab */}
        <TabsContent value="flex" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Twilio Flex Integration Hub
              </CardTitle>
              <p className="text-sm text-gray-600">Monitor and manage Flex agent interventions</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {(conversations as SMSConversation[]).filter((c: SMSConversation) => c.status === 'active').length}
                  </div>
                  <p className="text-sm text-gray-600">Active Chats</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {(conversations as SMSConversation[]).filter((c: SMSConversation) => c.status === 'escalated').length}
                  </div>
                  <p className="text-sm text-gray-600">Escalated to Flex</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {(conversations as SMSConversation[]).filter((c: SMSConversation) => c.isAutomated).length}
                  </div>
                  <p className="text-sm text-gray-600">Automated</p>
                </div>
              </div>
              
              <div className="border rounded p-4">
                <h4 className="font-medium mb-3">Flex Agent Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connection Status</span>
                    <Badge variant={flexStatus.connected ? "default" : "destructive"}>
                      {flexStatus.connected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Available Agents</span>
                    <span className="text-sm font-medium">{flexStatus.availableAgents || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Queue Length</span>
                    <span className="text-sm font-medium">{flexStatus.queueLength || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  );
}