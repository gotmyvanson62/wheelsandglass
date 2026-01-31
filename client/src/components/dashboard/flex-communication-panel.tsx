import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Send,
  User,
  Car,
  MapPin,
  Calendar
} from 'lucide-react';

interface FlexConversation {
  id: string;
  jobRequestId: number;
  subcontractorName: string;
  subcontractorPhone: string;
  status: 'pending' | 'accepted' | 'rejected' | 'rescheduled';
  lastMessage: string;
  lastMessageTime: Date;
  customerInfo: {
    name: string;
    phone: string;
    vehicle: string;
    location: string;
  };
  messages: FlexMessage[];
}

interface FlexMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  templateUsed?: string;
}

interface ActiveJob {
  id: number;
  customerName: string;
  vehicleInfo: string;
  serviceLocation: string;
  status: 'pending_contractor' | 'assigned' | 'in_progress' | 'completed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedContractor?: string;
  createdAt: Date;
}

export function FlexCommunicationPanel() {
  const [activeTab, setActiveTab] = useState('conversations');
  const [conversations, setConversations] = useState<FlexConversation[]>([]);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load conversations and active jobs
  useEffect(() => {
    loadFlexData();
    const interval = setInterval(loadFlexData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadFlexData = async () => {
    try {
      // Load Flex conversations
      const conversationsRes = await fetch('/api/flex/conversations');
      if (conversationsRes.ok) {
        const conversationsData = await conversationsRes.json();
        setConversations(conversationsData);
      }

      // Load active jobs
      const jobsRes = await fetch('/api/flex/active-jobs');
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setActiveJobs(jobsData);
      }
    } catch (error) {
      console.error('Failed to load Flex data:', error);
    }
  };

  const sendMessage = async (conversationId: string, message: string) => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/flex/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: message.trim()
        })
      });

      if (response.ok) {
        setNewMessage('');
        await loadFlexData(); // Refresh conversations
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const createJobRequest = async (jobId: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/flex/create-job-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });

      if (response.ok) {
        await loadFlexData();
      }
    } catch (error) {
      console.error('Failed to create job request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'rescheduled': return <RotateCcw className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <Card className="h-[600px] flex flex-col dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <MessageSquare className="w-5 h-5" />
          Twilio Flex Communication Hub
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conversations">
              SMS Conversations ({conversations.length})
            </TabsTrigger>
            <TabsTrigger value="jobs">
              Active Jobs ({activeJobs.length})
            </TabsTrigger>
            <TabsTrigger value="templates">
              Omega Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="flex-1 flex gap-4 mt-4">
            {/* Conversations List */}
            <div className="w-1/3 border-r dark:border-gray-700 pr-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedConversation === conv.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-600'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="font-medium text-sm dark:text-gray-200">{conv.subcontractorName}</span>
                        </div>
                        {getStatusIcon(conv.status)}
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          <span>{conv.customerInfo.vehicle}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{conv.customerInfo.location}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                        {conv.lastMessage}
                      </div>

                      <Badge className="mt-1 text-xs" variant={conv.status === 'pending' ? 'default' : 'secondary'}>
                        Job #{conv.jobRequestId}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Selected Conversation */}
            <div className="flex-1 flex flex-col">
              {selectedConv ? (
                <>
                  {/* Conversation Header */}
                  <div className="border-b dark:border-gray-700 pb-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium dark:text-gray-100">{selectedConv.subcontractorName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedConv.subcontractorPhone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedConv.status)}
                        <Badge>Job #{selectedConv.jobRequestId}</Badge>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Customer:</span>
                        <p className="dark:text-gray-200">{selectedConv.customerInfo.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Vehicle:</span>
                        <p className="dark:text-gray-200">{selectedConv.customerInfo.vehicle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 mb-4">
                    <div className="space-y-3">
                      {selectedConv.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                            message.direction === 'outbound'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-75">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                              {message.templateUsed && (
                                <Badge className="text-xs" variant="outline">
                                  {message.templateUsed}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(selectedConv.id, newMessage);
                        }
                      }}
                    />
                    <Button
                      onClick={() => sendMessage(selectedConv.id, newMessage)}
                      disabled={loading || !newMessage.trim()}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Select a conversation to view messages
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="flex-1">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {activeJobs.map((job) => (
                  <Card key={job.id} className="p-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(job.priority)}`} />
                        <h4 className="font-medium dark:text-gray-100">Job #{job.id}</h4>
                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">{job.status.replace('_', ' ')}</Badge>
                      </div>

                      {job.status === 'pending_contractor' && (
                        <Button
                          size="sm"
                          onClick={() => createJobRequest(job.id)}
                          disabled={loading}
                        >
                          Send to Contractors
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Customer:</span>
                        <p className="dark:text-gray-200">{job.customerName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Vehicle:</span>
                        <p className="dark:text-gray-200">{job.vehicleInfo}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Location:</span>
                        <p className="dark:text-gray-200">{job.serviceLocation}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Created:</span>
                        <p className="dark:text-gray-200">{job.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>

                    {job.assignedContractor && (
                      <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/30 rounded border border-green-200 dark:border-green-700">
                        <span className="text-sm text-green-700 dark:text-green-400">
                          Assigned to: {job.assignedContractor}
                        </span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="templates" className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                <h4 className="font-medium mb-3 dark:text-gray-100">Omega EDI Templates</h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 border dark:border-gray-700 rounded">
                    <div className="font-medium text-blue-600 dark:text-blue-400">Job Assignment</div>
                    <div className="text-gray-600 dark:text-gray-400 mt-1">
                      OMEGA_JOB_REQ_001 - Contractor job assignment with vehicle details
                    </div>
                  </div>
                  <div className="p-3 border dark:border-gray-700 rounded">
                    <div className="font-medium text-green-600 dark:text-green-400">Acceptance Confirmation</div>
                    <div className="text-gray-600 dark:text-gray-400 mt-1">
                      OMEGA_CONF_ACC_001 - Job acceptance confirmation
                    </div>
                  </div>
                  <div className="p-3 border dark:border-gray-700 rounded">
                    <div className="font-medium text-red-600 dark:text-red-400">Rejection Confirmation</div>
                    <div className="text-gray-600 dark:text-gray-400 mt-1">
                      OMEGA_CONF_REJ_001 - Job rejection confirmation
                    </div>
                  </div>
                  <div className="p-3 border dark:border-gray-700 rounded">
                    <div className="font-medium text-yellow-600 dark:text-yellow-400">Reschedule Request</div>
                    <div className="text-gray-600 dark:text-gray-400 mt-1">
                      OMEGA_CONF_RESC_001 - Reschedule request confirmation
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                <h4 className="font-medium mb-3 dark:text-gray-100">Template Variables</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>{`{{contractor_name}}`} - Subcontractor name</div>
                  <div>{`{{job_id}}`} - Unique job identifier</div>
                  <div>{`{{customer_name}}`} - Customer name</div>
                  <div>{`{{customer_phone}}`} - Customer phone</div>
                  <div>{`{{vehicle_info}}`} - Year, make, model</div>
                  <div>{`{{service_location}}`} - Service address</div>
                  <div>{`{{preferred_date}}`} - Requested date</div>
                  <div>{`{{preferred_time}}`} - Requested time</div>
                  <div>{`{{estimated_duration}}`} - Job duration</div>
                  <div>{`{{damage_description}}`} - Service details</div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}