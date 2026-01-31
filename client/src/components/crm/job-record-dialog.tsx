import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  Archive,
  ArrowRight,
  Tag,
  Package
} from 'lucide-react';

interface JobRecord {
  id: string;
  jobNumber: string;
  customerId: string;
  // Job lifecycle stages: Lead -> Quote -> Work Order -> Invoice
  lifecycle: {
    leadId?: string;
    quoteId?: string;
    workOrderId: string;
    invoiceId?: string;
    currentStage: 'lead' | 'quote' | 'work_order' | 'invoice';
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  vehicle: {
    year: string;
    make: string;
    model: string;
    description: string;
    vin: string;
    licensePlate: string;
    odometer: string;
  };
  appointment: {
    date: string;
    time: string;
    type: string;
    status: string;
    completedDate?: string;
  };
  invoice: {
    items: Array<{
      sku: string;
      nagsPartId: string;
      description: string;
      listPrice: number;
      extendedPrice: number;
      discount: number;
      cost: number;
      quantity: number;
      totalPrice: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    grossMargin: number;
  };
  billing: {
    account: string;
    accountPhone: string;
    accountAddress: string;
    pricingProfile: string;
    poNumber?: string;
  };
  jobInfo: {
    csr: string;
    dispatcher?: string;
    biller?: string;
    salesRep?: string;
    location: string;
    campaign: string;
    status: string;
    tags: string[];
  };
  payments: Array<{
    amount: number;
    method: string;
    date: string;
    status: string;
  }>;
  notes: Array<{
    text: string;
    author: string;
    date: string;
    visibleToCustomer: boolean;
  }>;
}

interface JobRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string | null;
}

export function JobRecordDialog({ open, onOpenChange, jobId }: JobRecordDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  // Fetch job data dynamically via API
  const { data: apiJobRecord, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');
      const response = await fetch(`/api/job/${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch job');
      return response.json() as Promise<JobRecord>;
    },
    enabled: !!jobId && open,
  });

  // Use API data when available - no mock fallback for production
  const jobRecord = apiJobRecord;

  if (!jobId || !open) return null;
  
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center h-64">
            <span>Loading job record...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col justify-center items-center h-64 text-gray-500">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <span className="text-lg font-medium">Job not found</span>
            <span className="text-sm">Job record #{jobId} could not be loaded.</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!jobRecord) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col justify-center items-center h-64 text-gray-500">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <span className="text-lg font-medium">No job data</span>
            <span className="text-sm">Job record will appear here once created.</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        ref={dialogRef} 
        tabIndex={-1} 
        aria-labelledby="job-dialog-title" 
        aria-describedby="job-dialog-description"
        className="max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle id="job-dialog-title" className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Job #{jobRecord.jobNumber} - {jobRecord.customer.firstName} {jobRecord.customer.lastName}
          </DialogTitle>
          <DialogDescription id="job-dialog-description">
            Complete job record with customer information, vehicle details, billing, and appointment status from Omega EDI system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Lifecycle Tracker */}
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Job Lifecycle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {/* Lead */}
                <div className={`flex flex-col items-center ${jobRecord.lifecycle.currentStage === 'lead' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    jobRecord.lifecycle.leadId ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-1 font-medium">Lead</span>
                  {jobRecord.lifecycle.leadId && (
                    <span className="text-xs text-gray-500">{jobRecord.lifecycle.leadId}</span>
                  )}
                </div>

                <ArrowRight className="w-4 h-4 text-gray-400" />

                {/* Quote */}
                <div className={`flex flex-col items-center ${jobRecord.lifecycle.currentStage === 'quote' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    jobRecord.lifecycle.quoteId ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-1 font-medium">Quote</span>
                  {jobRecord.lifecycle.quoteId && (
                    <span className="text-xs text-gray-500">{jobRecord.lifecycle.quoteId}</span>
                  )}
                </div>

                <ArrowRight className="w-4 h-4 text-gray-400" />

                {/* Work Order */}
                <div className={`flex flex-col items-center ${jobRecord.lifecycle.currentStage === 'work_order' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    jobRecord.lifecycle.workOrderId ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-1 font-medium">Work Order</span>
                  <span className="text-xs text-blue-600 font-semibold">{jobRecord.lifecycle.workOrderId}</span>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-400" />

                {/* Invoice */}
                <div className={`flex flex-col items-center ${jobRecord.lifecycle.currentStage === 'invoice' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    jobRecord.lifecycle.invoiceId ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-1 font-medium">Invoice</span>
                  {jobRecord.lifecycle.invoiceId && (
                    <span className="text-xs text-gray-500">{jobRecord.lifecycle.invoiceId}</span>
                  )}
                </div>
              </div>
              <div className="text-center mt-3">
                <Badge variant="outline" className="text-xs">
                  Customer ID: {jobRecord.customerId}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Sale Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sale Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">CSR</label>
                  <div className="font-medium">{jobRecord.jobInfo.csr}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <div className="font-medium">{jobRecord.jobInfo.location}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Campaign</label>
                  <div className="font-medium">{jobRecord.jobInfo.campaign}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Job Status</label>
                  <Badge className="bg-gray-100 text-gray-800">{jobRecord.jobInfo.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing & Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Account</label>
                  <div className="font-medium">{jobRecord.billing.account}</div>
                  <div className="text-sm text-gray-600">{jobRecord.billing.accountPhone}</div>
                  <div className="text-sm text-gray-600">{jobRecord.billing.accountAddress}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Pricing Profile</label>
                  <div className="font-medium">{jobRecord.billing.pricingProfile}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <div className="font-medium">{jobRecord.customer.firstName} {jobRecord.customer.lastName}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {jobRecord.customer.phone}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {jobRecord.customer.email}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1" />
                    <div>
                      <div>{jobRecord.customer.address}</div>
                      <div>{jobRecord.customer.city}, {jobRecord.customer.state} {jobRecord.customer.postalCode}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Appointment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Appointment for {jobRecord.appointment.date} - {jobRecord.appointment.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">{jobRecord.appointment.status} - {jobRecord.appointment.completedDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5" />
                Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">License Plate</label>
                  <div className="font-medium">{jobRecord.vehicle.licensePlate}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">VIN</label>
                  <div className="font-medium font-mono text-sm">{jobRecord.vehicle.vin}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Year</label>
                  <div className="font-medium">{jobRecord.vehicle.year}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Make</label>
                  <div className="font-medium">{jobRecord.vehicle.make}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Model</label>
                  <div className="font-medium">{jobRecord.vehicle.model}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <div className="font-medium">{jobRecord.vehicle.description}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Invoice Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800">
                        <th className="text-left p-2">NAGS Part ID</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-right p-2">List Price</th>
                        <th className="text-right p-2">Extended</th>
                        <th className="text-right p-2">Discount</th>
                        <th className="text-right p-2">Qty</th>
                        <th className="text-right p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobRecord.invoice.items.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-2">
                            <code className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-mono">
                              {item.nagsPartId || item.sku}
                            </code>
                          </td>
                          <td className="p-2">{item.description}</td>
                          <td className="p-2 text-right">${item.listPrice.toFixed(2)}</td>
                          <td className="p-2 text-right">${item.extendedPrice.toFixed(2)}</td>
                          <td className="p-2 text-right">{item.discount.toFixed(2)}%</td>
                          <td className="p-2 text-right">{item.quantity.toFixed(0)}</td>
                          <td className="p-2 text-right font-medium">${item.totalPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <div className="space-y-2 text-right">
                    <div className="flex justify-between gap-8">
                      <span>Subtotal:</span>
                      <span className="font-medium">${jobRecord.invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-8">
                      <span>Tax:</span>
                      <span className="font-medium">${jobRecord.invoice.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-8 text-lg font-bold">
                      <span>Total:</span>
                      <span>${jobRecord.invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobRecord.payments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">${payment.amount.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">{payment.method}</div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800">{payment.status}</Badge>
                      <div className="text-sm text-gray-600">{payment.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobRecord.notes.map((note, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">{note.text}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {note.author} - {note.date} - {note.visibleToCustomer ? 'Visible to customer' : 'Internal only'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {jobRecord.jobInfo.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {jobRecord.jobInfo.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            Edit Job
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}