import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Search, Plus, Edit, Calendar, Phone, Mail, Car, FileText, Clock, Users, CheckCircle, X, Building, DollarSign, Tag, AlertCircle, Paperclip, MapPin, Database, BarChart3, UserPlus, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function OmegaAdminPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobFilter, setJobFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch Omega jobs from real API
  const { data: omegaJobs, isLoading } = useQuery({
    queryKey: ['/api/omega/jobs'],
  });

  // Fetch technicians/installers from real API
  const { data: technicians } = useQuery({
    queryKey: ['/api/omega/technicians'],
  });

  const updateJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      return apiRequest(`/api/omega/jobs/${jobData.id}`, 'PATCH', jobData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/omega/jobs'] });
      toast({ title: "Job updated successfully" });
    }
  });

  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      return apiRequest('/api/omega/jobs', 'POST', jobData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/omega/jobs'] });
      setIsCreateJobOpen(false);
      toast({ title: "Job created successfully" });
    }
  });

  const sendCalendarInvitation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest('/api/send-calendar-invitation', 'POST', { omegaJobId: jobId });
    },
    onSuccess: () => {
      toast({ title: "Calendar invitation sent" });
    }
  });

  const filteredJobs = (Array.isArray(omegaJobs) ? omegaJobs : []).filter((job: any) =>
    job.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.vehicle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Quote': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Standard': return 'bg-blue-100 text-blue-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeJobs = filteredJobs.filter((job: any) => job.status !== 'Completed' && job.status !== 'Cancelled');

  const handleRefresh = () => {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['/api/omega/jobs'] });
    queryClient.invalidateQueries({ queryKey: ['/api/omega/technicians'] });
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">


      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600">
        <span>Jobs</span>
        <span className="mx-2">›</span>
        <span>Management</span>
      </div>

      {/* Status Cards */}
      <div className="flex items-center gap-4">
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <span className="font-bold">{activeJobs.length}</span>
          <span>Active Jobs</span>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <span className="font-bold">{Array.isArray(technicians) ? technicians.length : 0}</span>
          <span>Technicians</span>
        </div>
        <div className="ml-auto">
          <Dialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create New Job
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input id="customerName" placeholder="Enter customer name" />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input id="customerEmail" type="email" placeholder="customer@email.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleYear">Vehicle Year</Label>
                  <Input id="vehicleYear" placeholder="2020" />
                </div>
                <div>
                  <Label htmlFor="vehicleMake">Make</Label>
                  <Input id="vehicleMake" placeholder="Honda" />
                </div>
              </div>
              <div>
                <Label htmlFor="vehicleModel">Model</Label>
                <Input id="vehicleModel" placeholder="Civic" />
              </div>
              <div>
                <Label htmlFor="serviceType">Service Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="windshield">Windshield Replacement</SelectItem>
                    <SelectItem value="side-window">Side Window</SelectItem>
                    <SelectItem value="rear-window">Rear Window</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateJobOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsCreateJobOpen(false)}>Create Job</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Search Bar - Above Tabs */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search jobs by customer, job ID, or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="quotes" value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="quotes" className="text-xs md:text-sm">Jobs</TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs md:text-sm">Schedule</TabsTrigger>
          <TabsTrigger value="technicians" className="text-xs md:text-sm">Team</TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs md:text-sm">Inventory</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs md:text-sm">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-6">Jobs Management</h2>
            
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Open Quotes</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-sm text-gray-600">Work Orders</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-orange-600">3</div>
                <div className="text-sm text-gray-600">Ready to Invoice</div>
              </Card>
            </div>

            {/* Job List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-500">No jobs found.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredJobs.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium">{job.jobNumber} - {job.customerName}</div>
                      <div className="text-sm text-gray-600">
                        {job.vehicleYear} {job.vehicleMake} {job.vehicleModel} • {job.serviceType} • ${job.estimatedCost}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getPriorityColor(job.priority)}`}>
                        {job.priority}
                      </Badge>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Today's Schedule</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium">9:00 AM - Mike Johnson</div>
                        <div className="text-sm text-gray-600">Windshield - John Smith</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <div className="font-medium">2:00 PM - David Wilson</div>
                        <div className="text-sm text-gray-600">Side Glass - Sarah Davis</div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Technician Availability</h3>
                  <div className="space-y-3">
                    {(Array.isArray(technicians) ? technicians : []).map((tech: any) => (
                      <div key={tech.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{tech.name}</div>
                          <div className="text-sm text-gray-600">Quote: QO-{1000 + parseInt(tech.id)} • {tech.location}</div>
                          <div className="text-xs text-gray-500">Confirmed availability for work order conversion</div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 mb-1">
                            Confirmed
                          </Badge>
                          <div className="text-xs text-gray-500">Within service area</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {(Array.isArray(technicians) ? technicians : []).map((tech: any) => (
                  <Card key={tech.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{tech.name}</h3>
                        <Badge className={tech.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {tech.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div><strong>Specialties:</strong> {tech.specialties.join(', ')}</div>
                        <div><strong>Current Jobs:</strong> {tech.currentJobs}/{tech.weeklyCapacity}</div>
                        <div><strong>Location:</strong> {tech.location}</div>
                        <div><strong>Contact:</strong> {tech.phone}</div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Assign Job</Button>
                        <Button size="sm" variant="outline">View Schedule</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parts & Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <div className="text-2xl font-bold text-blue-600">245</div>
                  <div className="text-sm text-gray-600">Parts in Stock</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold text-orange-600">12</div>
                  <div className="text-sm text-gray-600">Low Stock Items</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-sm text-gray-600">Pending Orders</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <div className="text-sm text-gray-600">Out of Stock</div>
                </Card>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">FW02717GBYN - Windshield (Solar)</div>
                    <div className="text-sm text-gray-600">Honda Civic 2020-2023 • SKU: FW02717GBYN</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">$438.60</div>
                      <div className="text-sm text-gray-600">Qty: 15</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">SG01234 - Side Glass</div>
                    <div className="text-sm text-gray-600">Toyota Camry 2018-2022 • SKU: SG01234</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">$185.00</div>
                      <div className="text-sm text-gray-600">Qty: 3</div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">HAH000448 - Adhesive (Fast-Cure)</div>
                    <div className="text-sm text-gray-600">Urethane Adhesive • SKU: HAH000448</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">$48.00</div>
                      <div className="text-sm text-gray-600">Qty: 0</div>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-2xl font-bold text-blue-600">158</div>
              <div className="text-sm text-gray-600">Total Jobs This Month</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-600">$45,230</div>
              <div className="text-sm text-gray-600">Revenue This Month</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-orange-600">2.3h</div>
              <div className="text-sm text-gray-600">Avg Processing Time</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-purple-600">94%</div>
              <div className="text-sm text-gray-600">Customer Satisfaction</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Open Quotes</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div className="w-3/5 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">12</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Work Orders</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div className="w-2/5 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div className="w-4/5 h-2 bg-gray-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">24</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technician Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Mike Johnson</div>
                      <div className="text-sm text-gray-600">23 jobs completed • 4.8★</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">98% Efficiency</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">David Wilson</div>
                      <div className="text-sm text-gray-600">31 jobs completed • 4.9★</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">96% Efficiency</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Tom Anderson</div>
                      <div className="text-sm text-gray-600">18 jobs completed • 4.7★</div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">94% Efficiency</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium">Job QO-1001 completed by Mike Johnson</div>
                    <div className="text-sm text-gray-600">2 hours ago • Customer: John Smith</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium">New quote created for Sarah Davis</div>
                    <div className="text-sm text-gray-600">4 hours ago • 2019 Toyota Camry side window</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium">Inventory alert: Low stock on FW02717GBYN</div>
                    <div className="text-sm text-gray-600">6 hours ago • Only 3 units remaining</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Job Dialog */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Job {selectedJob.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select defaultValue={selectedJob.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quote">Quote</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedJob(null)}>Cancel</Button>
                <Button onClick={() => setSelectedJob(null)}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
