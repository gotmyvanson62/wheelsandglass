import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FlexCommunicationPanel } from '@/components/dashboard/flex-communication-panel';
import { SMSMessagingPanel } from '@/components/crm/sms-messaging-panel';
import { StatusPanels } from '@/components/crm/status-panels';
import { JobRecordDialog } from '@/components/crm/job-record-dialog';
import { QuotesTab } from '@/components/crm/quotes-tab';
import { JobsList } from '@/components/crm/jobs-list';
import { CustomerProfileDialog } from '@/components/crm/customer-profile-dialog';
import { IOSMessageThread } from '@/components/crm/ios-message-thread';
import { ContactsDirectory } from '@/components/crm/contacts-directory';
import { TeamTable } from '@/components/crm/team-table';
import { Navbar } from '@/components/ui/navbar';
import {
  MessageSquare,
  Phone,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  UserPlus,
  ChevronDown,
  MapPin,
  Building,
  Navigation,
  ClipboardList,
  Car,
  Eye,
  Mail,
  Plus
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactStats {
  totalContacts: number;
  activeConversations: number;
  pendingResponses: number;
  completedJobs: number;
  averageResponseTime: number;
  conversionRate: number;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  status: 'active' | 'inactive' | 'pending';
  lastContact: Date;
  totalJobs: number;
  tags: string[];
  category: 'technician' | 'customer' | 'distributor';
  specialties?: string[];
  serviceAreas?: string[];
}

export default function CRM() {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute('/admin/crm/:tab');

  // Valid tab values
  const validTabs = ['quotes', 'jobs', 'communications', 'schedule', 'team', 'contacts'];

  // Get tab from URL or default to quotes
  const activeTab = validTabs.includes(params?.tab || '') ? params?.tab! : 'quotes';

  // Redirect bare /admin/crm to /admin/crm/quotes
  useEffect(() => {
    if (location === '/admin/crm' || location === '/admin/crm/') {
      setLocation('/admin/crm/quotes', { replace: true });
    }
  }, [location, setLocation]);

  // Handle tab change by navigating to new URL
  const handleTabChange = (tab: string) => {
    setLocation(`/admin/crm/${tab}`);
  };

  // Get status filter from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const statusFilter = urlParams.get('status');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [distributorOpen, setDistributorOpen] = useState(false);
  const [selectedPipelineStage, setSelectedPipelineStage] = useState<string | null>(statusFilter);

  // Effect to handle URL parameter changes
  useEffect(() => {
    if (statusFilter && statusFilter !== 'all') {
      setSelectedPipelineStage(statusFilter);
      // Show status dialog when coming from dashboard
      setStatusOpen(true);
    }
  }, [statusFilter]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [jobsStatusFilter, setJobsStatusFilter] = useState<string | undefined>(undefined);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerProfileOpen, setCustomerProfileOpen] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);

  // Pipeline data - populated from API when available
  const pipelineData = {
    'quotes-to-work-orders': [] as { id: string; customer: string; vehicle: string; service: string; amount: string; date: string; status: string; }[],
    'work-orders-to-invoice': [] as { id: string; customer: string; vehicle: string; service: string; amount: string; date: string; status: string; }[],
    'invoice-to-payment': [] as { id: string; customer: string; vehicle: string; service: string; amount: string; date: string; status: string; }[]
  };

  // Fetch dashboard data for conversion stats
  const { data: dashboardData } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Fetch appointments for the current week
  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return { start: startOfWeek.toISOString(), end: endOfWeek.toISOString() };
  };
  const weekDates = getWeekDates();

  const { data: appointmentsData } = useQuery({
    queryKey: ['/api/appointments', weekDates.start, weekDates.end],
    queryFn: async () => {
      const response = await fetch(`/api/appointments?start=${weekDates.start}&end=${weekDates.end}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    },
  });

  const appointments = (appointmentsData as any)?.data || [];

  // Group appointments by day of week
  const appointmentsByDay = appointments.reduce((acc: Record<string, any[]>, apt: any) => {
    const date = new Date(apt.scheduledDate || apt.requestedDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getDay()];
    if (!acc[dayName]) acc[dayName] = [];
    acc[dayName].push(apt);
    return acc;
  }, {});

  const conversionStats = (dashboardData as any)?.stats || {
    formSubmissions: 0,
    jobsScheduled: 0,
    jobsCompleted: 0,
    invoicesPaid: 0,
    totalRevenue: 0,
  };

  // Calculate conversion rates
  const conversionRates = {
    submissionToScheduled: conversionStats.formSubmissions > 0 
      ? (conversionStats.jobsScheduled / conversionStats.formSubmissions * 100).toFixed(1)
      : '0',
    scheduledToCompleted: conversionStats.jobsScheduled > 0
      ? (conversionStats.jobsCompleted / conversionStats.jobsScheduled * 100).toFixed(1)
      : '0',
    completedToPaid: conversionStats.jobsCompleted > 0
      ? (conversionStats.invoicesPaid / conversionStats.jobsCompleted * 100).toFixed(1)
      : '0',
    overallConversion: conversionStats.formSubmissions > 0
      ? (conversionStats.invoicesPaid / conversionStats.formSubmissions * 100).toFixed(1)
      : '0',
  };

  // Function to open job record
  const openJobRecord = (jobId: string) => {
    setSelectedJobId(jobId);
    setJobDialogOpen(true);
  };

  // Function to open customer profile with full history
  const openCustomerProfile = (customerId: number) => {
    setSelectedCustomerId(customerId);
    setCustomerProfileOpen(true);
  };

  // Stats - populated from API when available
  const stats: ContactStats = {
    totalContacts: 0,
    activeConversations: 0,
    pendingResponses: 0,
    completedJobs: 0,
    averageResponseTime: 0,
    conversionRate: 0
  };

  // Contacts - populated from API
  const recentContacts: Contact[] = [];

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 border-gray-200 dark:border-gray-700';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 max-w-full overflow-x-hidden">

      {/* Header with Add Contact Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CRM & Communication</h1>
        <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Contact</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <input type="text" placeholder="John" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <input type="text" placeholder="Doe" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option value="customer">Customer</option>
                  <option value="technician">Technician</option>
                  <option value="distributor">Distributor</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input type="email" placeholder="john.doe@example.com" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input type="tel" placeholder="(555) 123-4567" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company (Optional)</label>
                <input type="text" placeholder="Company name" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setAddContactOpen(false)}>Cancel</Button>
                <Button onClick={() => setAddContactOpen(false)}>Add Contact</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* CRM Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="quotes" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Quotes</span>
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Contacts</span>
          </TabsTrigger>
        </TabsList>



        {/* Quotes Tab - Quote Submissions from Public Form */}
        <TabsContent value="quotes" className="space-y-6">
          <QuotesTab onOpenJobRecord={openJobRecord} />
        </TabsContent>

        {/* Jobs Tab - Unified Dashboard */}
        <TabsContent value="jobs" className="space-y-6">
          {/* Quick Actions Row - styled to match Contacts menu interface */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Dialog open={calendarOpen} onOpenChange={(open) => {
                  setCalendarOpen(open);
                  // Auto-close sidebar on mobile when dialog opens
                  if (open && window.innerWidth < 768) {
                    const event = new CustomEvent('closeSidebar');
                    window.dispatchEvent(event);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 min-w-[180px] justify-start h-10 px-4 border rounded-lg bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700" variant="outline">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      View Calendar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-auto" aria-describedby="calendar-description">
                    <DialogHeader>
                      <DialogTitle>Weekly Schedule & Appointment Details</DialogTitle>
                      <p id="calendar-description" className="text-sm text-gray-600 dark:text-gray-400">Detailed view of scheduled appointments with technician and service information</p>
                    </DialogHeader>
                    
                    {/* Weekly Schedule with Enhanced Details */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-7 gap-3">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <div key={day} className="space-y-2">
                            <div className="font-medium text-center p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">{day}</div>
                            <div className="space-y-2 min-h-[200px]">
                              <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-xs">
                                No appointments
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary Statistics */}
                      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">0</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Appointments</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">0</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Active Technicians</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">0</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Distributors</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">0</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Service Areas</div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={statusOpen} onOpenChange={(open) => {
                  setStatusOpen(open);
                  if (open && window.innerWidth < 768) {
                    const event = new CustomEvent('closeSidebar');
                    window.dispatchEvent(event);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 min-w-[180px] justify-start h-10 px-4 border rounded-lg bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700" variant="outline">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                      Status of Hour
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-[95vw] md:w-auto" aria-describedby="status-description">
                    <DialogHeader>
                      <DialogTitle>Current Hour Status</DialogTitle>
                      <p id="status-description" className="text-sm text-gray-600 dark:text-gray-400">Real-time status of technicians and upcoming appointments</p>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Active Now ({new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })})</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              <p className="text-sm">No active technicians</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Next Hour</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              <p className="text-sm">No upcoming appointments</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={reportsOpen} onOpenChange={(open) => {
                  setReportsOpen(open);
                  if (open && window.innerWidth < 768) {
                    const event = new CustomEvent('closeSidebar');
                    window.dispatchEvent(event);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 min-w-[180px] justify-start h-10 px-4 border rounded-lg bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700" variant="outline">
                      <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                      View Reports
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-[95vw] md:w-auto" aria-describedby="reports-description">
                    <DialogHeader>
                      <DialogTitle>Business Reports</DialogTitle>
                      <p id="reports-description" className="text-sm text-gray-600 dark:text-gray-400">Open invoices and rescheduled appointments overview</p>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Open Invoices</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              <p className="text-sm">No open invoices</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Rescheduled Appointments</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              <p className="text-sm">No rescheduled appointments</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={distributorOpen} onOpenChange={(open) => {
                  setDistributorOpen(open);
                  if (open && window.innerWidth < 768) {
                    const event = new CustomEvent('closeSidebar');
                    window.dispatchEvent(event);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 min-w-[180px] justify-start h-10 px-4 border rounded-lg bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700" variant="outline">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      Contact Distributor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-[95vw] md:w-auto" aria-describedby="distributor-description">
                    <DialogHeader>
                      <DialogTitle>Distributor Contacts</DialogTitle>
                      <p id="distributor-description" className="text-sm text-gray-600 dark:text-gray-400">Contact information for glass distributors and dealer networks</p>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Primary Distributors</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              <p className="text-sm">No distributors configured</p>
                              <p className="text-xs mt-1">Add distributors in the Contacts tab</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Dealer Networks</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              <p className="text-sm">No dealer networks configured</p>
                              <p className="text-xs mt-1">Add dealers in the Contacts tab</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Job Pipeline Section - Full Width at Top */}
          <Card>
            <CardHeader>
              <CardTitle>Job Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quotes to Work Orders */}
                <div
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-4 rounded-lg border transition-colors"
                  onClick={() => setSelectedPipelineStage(selectedPipelineStage === 'quotes-to-work-orders' ? null : 'quotes-to-work-orders')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Quotes → Work Orders</span>
                    <span className="text-lg font-bold text-gray-400">0%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full transition-all" style={{width: '0%'}}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">No pending quotes</div>
                </div>

                {/* Work Orders to Invoice */}
                <div
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-4 rounded-lg border transition-colors"
                  onClick={() => setSelectedPipelineStage(selectedPipelineStage === 'work-orders-to-invoice' ? null : 'work-orders-to-invoice')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Work Orders → Invoice</span>
                    <span className="text-lg font-bold text-gray-400">0%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div className="bg-green-600 h-3 rounded-full transition-all" style={{width: '0%'}}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">No work orders ready</div>
                </div>

                {/* Invoice to Payment */}
                <div
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-4 rounded-lg border transition-colors"
                  onClick={() => setSelectedPipelineStage(selectedPipelineStage === 'invoice-to-payment' ? null : 'invoice-to-payment')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Invoice → Payment</span>
                    <span className="text-lg font-bold text-gray-400">0%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div className="bg-purple-600 h-3 rounded-full transition-all" style={{width: '0%'}}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">No invoices pending</div>
                </div>
              </div>

              {/* Drill-down Table */}
              {selectedPipelineStage && pipelineData[selectedPipelineStage as keyof typeof pipelineData] && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-medium mb-3 text-sm">
                    {selectedPipelineStage === 'quotes-to-work-orders' && 'Pending Quotes'}
                    {selectedPipelineStage === 'work-orders-to-invoice' && 'Work Orders Ready to Invoice'}
                    {selectedPipelineStage === 'invoice-to-payment' && 'Outstanding Invoices'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {pipelineData[selectedPipelineStage as keyof typeof pipelineData].map((record) => (
                      <div
                        key={record.id}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => openJobRecord(record.id)}
                      >
                        <div className="font-medium text-blue-600 hover:text-blue-800">{record.id}</div>
                        <div className="text-gray-900 dark:text-gray-100">{record.customer}</div>
                        <div className="text-gray-500 text-xs mt-1">{record.vehicle}</div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-medium">{record.amount}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              record.status === 'Overdue' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                              record.status === 'Payment Pending' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              record.status === 'Work Complete' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                              'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}
                          >
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats + All Jobs Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar: Quick Stats */}
            <div className="lg:col-span-1">
              <StatusPanels
                onFilterChange={(filter) => setJobsStatusFilter(filter === jobsStatusFilter ? undefined : filter)}
                activeFilter={jobsStatusFilter}
              />
            </div>

            {/* Main Content: Jobs List with Filters */}
            <div className="lg:col-span-3">
              <JobsList
                statusFilter={jobsStatusFilter}
                onOpenJob={openJobRecord}
              />
            </div>
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          {/* Weekly Schedule - Clean Format */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clean view: What • Where • Who • When</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Weekdays - Dynamic from API */}
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((dayName) => {
                  const dayAppointments = appointmentsByDay[dayName] || [];
                  return (
                    <div key={dayName} className="border rounded-lg p-4">
                      <div className="font-medium text-lg mb-3 text-gray-900 dark:text-gray-100 border-b dark:border-gray-700 pb-2">
                        {dayName}
                        {dayAppointments.length > 0 && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800">{dayAppointments.length}</Badge>
                        )}
                      </div>
                      {dayAppointments.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                          No appointments scheduled
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dayAppointments.map((apt: any) => (
                            <div key={apt.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-xs text-gray-500 uppercase">What</div>
                                <div className="font-medium">{apt.serviceType || 'Service'}</div>
                                <div className="text-gray-600 dark:text-gray-400">{apt.customerName}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 uppercase">Where</div>
                                <div className="font-medium flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {apt.serviceAddress?.split(',')[0] || 'TBD'}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 uppercase">Who</div>
                                <div className="font-medium">{apt.technicianId ? `Tech #${apt.technicianId}` : 'Unassigned'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 uppercase">When</div>
                                <div className="font-medium">{apt.requestedTime || 'TBD'}</div>
                                <Badge className={apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                  {apt.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Weekend Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="font-medium text-lg mb-2 text-gray-900 dark:text-gray-100">Saturday</div>
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      {(appointmentsByDay['Saturday'] || []).length > 0
                        ? `${appointmentsByDay['Saturday'].length} appointment(s)`
                        : 'Weekend - No service'}
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="font-medium text-lg mb-2 text-gray-900 dark:text-gray-100">Sunday</div>
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      {(appointmentsByDay['Sunday'] || []).length > 0
                        ? `${appointmentsByDay['Sunday'].length} appointment(s)`
                        : 'Weekend - No service'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Calendar</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">Full month view with all scheduled appointments</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">December 2025</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                </div>
                
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2">{day}</div>
                  ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const dayNumber = i - 6; // Adjust for month start
                    const isCurrentMonth = dayNumber > 0 && dayNumber <= 31;

                    return (
                      <div key={i} className={`
                        aspect-square border rounded-lg p-1 text-xs
                        ${isCurrentMonth ? 'bg-white hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}
                        border-gray-200 dark:border-gray-700
                      `}>
                        {isCurrentMonth && (
                          <div className="font-medium">{dayNumber}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Legend and Information */}
                <div className="border-t pt-4 space-y-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <div className="font-medium mb-2">Calendar Format:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>• <strong>Time - Customer Name</strong></div>
                      <div>• <strong>Vehicle Model • Technician</strong></div>
                      <div>• <strong>Service Type • Location</strong></div>
                      <div>• <strong>All appointments use standard scheduling</strong></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-gray-600 dark:text-gray-400">
                    <div><strong>Distributors:</strong> Mygrant Glass, Pilkington, PGW Industries, Dealer Parts</div>
                    <div><strong>Services:</strong> Windshield, Side Window, Rear Glass</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <TeamTable
            onMessage={(member) => console.log('Message:', member.name)}
            onCall={(member) => member.phone && window.open(`tel:${member.phone}`)}
          />
        </TabsContent>

        {/* Communications Tab - iOS-style Messaging */}
        <TabsContent value="communications">
          <IOSMessageThread />
        </TabsContent>

        {/* Contacts Tab - Unified Directory */}
        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <ContactsDirectory
                onViewContact={(contact) => {
                  if (contact.type === 'customer') {
                    openCustomerProfile(contact.id);
                  }
                }}
                onMessageContact={(contact) => {
                  // Handle messaging - could open a message dialog or navigate to chat
                  console.log('Message contact:', contact);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Response Rate</span>
                    <span className="font-semibold">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Average Response Time</span>
                    <span className="font-semibold">{stats.averageResponseTime} minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Job Acceptance Rate</span>
                    <span className="font-semibold">{stats.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Active Contractors</span>
                    <span className="font-semibold">23</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Messages Sent</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Messages This Week</span>
                    <span className="font-semibold">89</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Jobs Assigned</span>
                    <span className="font-semibold">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Jobs Completed</span>
                    <span className="font-semibold">{stats.completedJobs}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Job Record Dialog */}
      <JobRecordDialog
        open={jobDialogOpen}
        onOpenChange={setJobDialogOpen}
        jobId={selectedJobId}
      />

      {/* Customer Profile Dialog - Shows full quote/appointment/transaction history */}
      <CustomerProfileDialog
        open={customerProfileOpen}
        onOpenChange={setCustomerProfileOpen}
        customerId={selectedCustomerId}
      />
    </div>
  );
}