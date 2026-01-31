import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ClipboardList,
  Car,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  Search,
  Filter,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw
} from 'lucide-react';
import { format, isValid } from 'date-fns';

interface QuoteSubmission {
  id: number;
  timestamp: string;
  firstName: string;
  lastName: string;
  mobilePhone: string;
  email: string;
  location: string;
  zipCode: string;
  serviceType: string;
  privacyTinted: string | null;
  year: string | null;
  make: string | null;
  model: string | null;
  vin: string | null;
  notes: string | null;
  selectedWindows: string[];
  uploadedFiles: Array<{ name: string; size: number; type: string }>;
  status: string;
  processedAt: string | null;
}

interface QuotesTabProps {
  onOpenJobRecord?: (jobId: string) => void;
}

function formatDate(dateValue: any, formatStr: string, fallback: string = '--'): string {
  if (!dateValue) return fallback;
  const date = new Date(dateValue);
  if (!isValid(date)) return fallback;
  try {
    return format(date, formatStr);
  } catch {
    return fallback;
  }
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className: string }> = {
    submitted: { variant: 'default', label: 'New', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    processed: { variant: 'secondary', label: 'Processed', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    quoted: { variant: 'secondary', label: 'Quoted', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
    converted: { variant: 'default', label: 'Converted', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    archived: { variant: 'outline', label: 'Archived', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
  };

  const config = statusConfig[status] || statusConfig.submitted;
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}

function getPaymentBadge(status: string) {
  // Map quote status to payment status
  const paymentMap: Record<string, { label: string; className: string }> = {
    submitted: { label: 'Pending', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
    processed: { label: 'Pending', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
    quoted: { label: 'Estimate', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    converted: { label: 'Invoiced', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    archived: { label: '--', className: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' }
  };

  const config = paymentMap[status] || paymentMap.submitted;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

function getEstimatedAmount(quote: QuoteSubmission): string {
  // Estimate based on service type and number of windows
  const windowCount = quote.selectedWindows?.length || 1;
  const serviceMultiplier: Record<string, number> = {
    'Windshield Replacement': 285,
    'Windshield Repair': 125,
    'Side Window': 195,
    'Rear Window': 245,
    'Sunroof': 325,
    'default': 275
  };

  const basePrice = serviceMultiplier[quote.serviceType] || serviceMultiplier.default;
  const total = basePrice * windowCount;

  return `$${total.toFixed(2)}`;
}

export function QuotesTab({ onOpenJobRecord }: QuotesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<QuoteSubmission | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch quote submissions
  const { data: quotesData, isLoading, refetch } = useQuery<{
    submissions: QuoteSubmission[];
    total: number;
  }>({
    queryKey: ['/api/quote/submissions'],
  });

  // Fetch quote stats
  const { data: statsData } = useQuery<{
    total: number;
    submitted: number;
    processed: number;
    quoted: number;
    converted: number;
    last24Hours: number;
    last7Days: number;
  }>({
    queryKey: ['/api/quote/stats'],
  });

  const quotes = quotesData?.submissions || [];
  const stats = statsData || { total: 0, submitted: 0, processed: 0, quoted: 0, converted: 0, last24Hours: 0, last7Days: 0 };

  // Filter quotes
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = searchTerm === '' ||
      `${quote.firstName} ${quote.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.vin && quote.vin.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openQuoteDetails = (quote: QuoteSubmission) => {
    setSelectedQuote(quote);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">New Quotes</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.submitted}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last 24 Hours</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.last24Hours}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Converted</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.converted}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Quotes</p>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or VIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] dark:bg-gray-900 dark:border-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">New</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetch()} className="dark:border-gray-700">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <ClipboardList className="w-5 h-5" />
            Quote Requests ({filteredQuotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">Loading quotes...</p>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">No quote requests found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Quote requests from the public form will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700 text-left text-xs text-gray-500 dark:text-gray-400">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium hidden md:table-cell">Vehicle</th>
                    <th className="pb-3 font-medium hidden lg:table-cell">Location</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Payment</th>
                    <th className="pb-3 font-medium text-right">Est. Amount</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {filteredQuotes.map((quote) => (
                    <tr
                      key={quote.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={() => openQuoteDetails(quote)}
                    >
                      <td className="py-3">
                        <div className="text-sm font-medium dark:text-gray-200">
                          {formatDate(quote.timestamp, 'MMM d')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(quote.timestamp, 'h:mm a')}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {quote.firstName} {quote.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {quote.mobilePhone}
                        </div>
                      </td>
                      <td className="py-3 hidden md:table-cell">
                        <div className="text-sm">
                          {quote.year && quote.make && quote.model
                            ? `${quote.year} ${quote.make} ${quote.model}`
                            : 'Not specified'}
                        </div>
                        {quote.vin && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {quote.vin.slice(-8)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 hidden lg:table-cell">
                        <div className="text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {quote.location}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{quote.zipCode}</div>
                      </td>
                      <td className="py-3">
                        {getStatusBadge(quote.status)}
                      </td>
                      <td className="py-3 hidden sm:table-cell">
                        {getPaymentBadge(quote.status)}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {getEstimatedAmount(quote)}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuoteDetails(quote);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Quote Request Details
            </DialogTitle>
          </DialogHeader>

          {selectedQuote && (
            <div className="space-y-6">
              {/* Status and Date */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedQuote.status)}
                <span className="text-sm text-gray-500">
                  Submitted {formatDate(selectedQuote.timestamp, 'MMM d, yyyy h:mm a')}
                </span>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-medium dark:text-gray-200">{selectedQuote.firstName} {selectedQuote.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium dark:text-gray-200">{selectedQuote.mobilePhone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium dark:text-gray-200">{selectedQuote.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-medium dark:text-gray-200">{selectedQuote.location}, {selectedQuote.zipCode}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Vehicle Information
                </h4>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Year</p>
                    <p className="font-medium dark:text-gray-200">{selectedQuote.year || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Make</p>
                    <p className="font-medium dark:text-gray-200">{selectedQuote.make || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Model</p>
                    <p className="font-medium dark:text-gray-200">{selectedQuote.model || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">VIN</p>
                    <p className="font-medium font-mono text-sm dark:text-gray-200">{selectedQuote.vin || 'Not provided'}</p>
                  </div>
                  {selectedQuote.privacyTinted && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Privacy Tinted</p>
                      <p className="font-medium dark:text-gray-200">{selectedQuote.privacyTinted}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Service Details
                </h4>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Service Type</p>
                    <p className="font-medium dark:text-gray-200">{selectedQuote.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Selected Windows</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedQuote.selectedWindows?.map((window, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {window}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {selectedQuote.notes && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                      <p className="text-sm dark:text-gray-200">{selectedQuote.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Implement convert to job functionality
                    console.log('Convert to job:', selectedQuote.id);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Convert to Job
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
