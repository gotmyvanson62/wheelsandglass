import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  ClipboardList,
  Clock,
  Car,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface CustomerProfileDialogProps {
  customerId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatCurrency(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return '$0.00';
  return `$${(cents / 100).toFixed(2)}`;
}

export function CustomerProfileDialog({ customerId, open, onOpenChange }: CustomerProfileDialogProps) {
  // Fetch customer profile with history
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['/api/customers', customerId, 'history'],
    queryFn: async () => {
      if (!customerId) return null;
      const response = await fetch(`/api/customers/${customerId}/history`);
      if (!response.ok) throw new Error('Failed to fetch customer profile');
      return response.json();
    },
    enabled: !!customerId && open,
  });

  const customer = profileData?.customer;
  const history = profileData?.history;

  const getQuoteStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case 'processed':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'quoted':
        return <Badge className="bg-purple-100 text-purple-800">Quoted</Badge>;
      case 'converted':
        return <Badge className="bg-green-100 text-green-800">Converted</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAppointmentStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Profile
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-600">Failed to load customer profile</p>
          </div>
        )}

        {customer && (
          <div className="space-y-6">
            {/* Customer Info Card */}
            <Card className="dark:bg-gray-800">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold dark:text-gray-100">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <Badge variant="outline">{customer.accountType || 'Individual'}</Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span>{customer.primaryEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span>{customer.primaryPhone}</span>
                      </div>
                      {(customer.address || customer.city) && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {[customer.address, customer.city, customer.state, customer.postalCode]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 text-center">
                      <DollarSign className="w-6 h-6 mx-auto text-emerald-600 mb-1" />
                      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-500">Total Spent</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                      <FileText className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {customer.totalJobs || 0}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-500">Total Jobs</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                      <ClipboardList className="w-6 h-6 mx-auto text-purple-600 mb-1" />
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                        {history?.quotes?.length || 0}
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-500">Quote Requests</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                      <Calendar className="w-6 h-6 mx-auto text-orange-600 mb-1" />
                      <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                        {history?.appointments?.length || 0}
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-500">Appointments</div>
                    </div>
                  </div>
                </div>

                {customer.lastJobDate && (
                  <div className="mt-4 pt-4 border-t dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Last service: {formatDate(customer.lastJobDate, 'MMMM d, yyyy')}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* History Tabs */}
            <Tabs defaultValue="quotes" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="quotes">
                  Quote Requests ({history?.quotes?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="appointments">
                  Appointments ({history?.appointments?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="transactions">
                  Transactions ({history?.transactions?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* Quotes History - Essential for warranty/insurance claims */}
              <TabsContent value="quotes" className="mt-4">
                <Card className="dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Quote Request History
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                        (For warranty & insurance claims)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {history?.quotes?.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No quote requests found
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {history?.quotes?.map((quote: any) => (
                          <div
                            key={quote.id}
                            className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium dark:text-gray-100">
                                  {quote.serviceType}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                                  <Car className="w-4 h-4" />
                                  {[quote.year, quote.make, quote.model].filter(Boolean).join(' ') || 'Vehicle not specified'}
                                </div>
                                {quote.vin && (
                                  <div className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-1">
                                    VIN: {quote.vin}
                                  </div>
                                )}
                                {quote.selectedWindows && (
                                  <div className="flex gap-1 mt-2">
                                    {(Array.isArray(quote.selectedWindows) ? quote.selectedWindows : []).map((window: string) => (
                                      <Badge key={window} variant="outline" className="text-xs">
                                        {window}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                {getQuoteStatusBadge(quote.status)}
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  {formatDate(quote.timestamp, 'MMM d, yyyy h:mm a')}
                                </div>
                              </div>
                            </div>
                            {quote.notes && (
                              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                {quote.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appointments History */}
              <TabsContent value="appointments" className="mt-4">
                <Card className="dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Appointment History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {history?.appointments?.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No appointments found
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {history?.appointments?.map((appointment: any) => (
                          <div
                            key={appointment.id}
                            className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium dark:text-gray-100">
                                  {appointment.requestedDate} at {appointment.requestedTime}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                                  <MapPin className="w-4 h-4" />
                                  {appointment.serviceAddress}
                                </div>
                                {appointment.technicianId && (
                                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Technician: {appointment.technicianId}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                {getAppointmentStatusBadge(appointment.status)}
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  Created: {formatDate(appointment.createdAt, 'MMM d, yyyy')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transactions History */}
              <TabsContent value="transactions" className="mt-4">
                <Card className="dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Transaction History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {history?.transactions?.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No transactions found
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {history?.transactions?.map((transaction: any) => (
                          <div
                            key={transaction.id}
                            className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium dark:text-gray-100 flex items-center gap-2">
                                  <Car className="w-4 h-4" />
                                  {[transaction.vehicleYear, transaction.vehicleMake, transaction.vehicleModel]
                                    .filter(Boolean)
                                    .join(' ') || 'Service'}
                                </div>
                                {transaction.omegaJobId && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Job ID: {transaction.omegaJobId}
                                  </div>
                                )}
                                {transaction.damageDescription && (
                                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                    {transaction.damageDescription}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                {getTransactionStatusBadge(transaction.status)}
                                {transaction.finalPrice && (
                                  <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {formatCurrency(transaction.finalPrice)}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {formatDate(transaction.timestamp, 'MMM d, yyyy h:mm a')}
                                </div>
                              </div>
                            </div>
                            {transaction.errorMessage && (
                              <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                {transaction.errorMessage}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
