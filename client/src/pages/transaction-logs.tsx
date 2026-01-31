import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Search, Download, RotateCcw, AlertCircle } from "lucide-react";
import { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { useLocation } from "wouter";
import { formatDate } from "@/lib/date-utils";

// Error Boundary to catch runtime errors
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TransactionLogs Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

function TransactionLogsContent() {
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Get filter from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const urlFilter = urlParams.get('filter');
  
  const [statusFilter, setStatusFilter] = useState(urlFilter || "all");
  const [searchTerm, setSearchTerm] = useState("");

  // Effect to handle URL parameter changes
  useEffect(() => {
    if (urlFilter) {
      setStatusFilter(urlFilter === 'failed' ? 'error' : urlFilter);
    }
  }, [urlFilter]);

  const { data: transactions, isLoading, error: transactionsError } = useQuery({
    queryKey: ['/api/transactions'],
  });

  const { data: activityLogs, error: activityLogsError } = useQuery({
    queryKey: ['/api/activity-logs'],
  });

  const retryTransactionMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/transactions/${id}/retry`, 'POST'),
    onSuccess: () => {
      toast({
        title: "Retry initiated",
        description: "Transaction will be retried shortly",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: () => {
      toast({
        title: "Retry failed",
        description: "Unable to retry transaction",
        variant: "destructive",
      });
    },
  });

  const filteredTransactions = Array.isArray(transactions) ? transactions.filter((transaction: any) => {
    const statusMatch = statusFilter === "all" || transaction.status === statusFilter;
    const searchMatch = searchTerm === "" || 
      transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.omegaJobId && transaction.omegaJobId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return statusMatch && searchMatch;
  }) : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Customer Name', 'Email', 'Phone', 'Vehicle', 'Status', 'Omega Job ID', 'Error Message'],
      ...filteredTransactions.map((t: any) => [
        formatDate(t.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        t.customerName || '',
        t.customerEmail || '',
        t.customerPhone || '',
        [t.vehicleYear, t.vehicleMake, t.vehicleModel].filter(Boolean).join(' '),
        t.status,
        t.omegaJobId || '',
        t.errorMessage || ''
      ])
    ].map(row => row.map((cell: any) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export completed",
      description: "Transaction data has been downloaded",
    });
  };

  return (
    <div className="space-y-6">
            
            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle>Filter & Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search by customer name, email, or job ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleExport} className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Transaction History ({filteredTransactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {transactionsError ? (
                  <div className="p-12 text-center text-red-500">
                    <p className="font-medium">Failed to load transactions</p>
                    <p className="text-sm mt-2">{transactionsError instanceof Error ? transactionsError.message : 'Unknown error'}</p>
                  </div>
                ) : isLoading ? (
                  <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                    Loading transactions...
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                    No transactions found matching your criteria
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Timestamp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Vehicle Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Omega Job ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Error Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredTransactions.map((transaction: any) => (
                          <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {formatDate(transaction.timestamp, 'MMM d, yyyy HH:mm')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {transaction.customerName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {transaction.customerEmail}
                              </div>
                              {transaction.customerPhone && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {transaction.customerPhone}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                              <div>
                                {[transaction.vehicleYear, transaction.vehicleMake, transaction.vehicleModel]
                                  .filter(Boolean)
                                  .join(' ') || '--'}
                              </div>
                              {transaction.vehicleVin && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                  VIN: {transaction.vehicleVin}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(transaction.status)}
                              {transaction.retryCount > 0 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Retry {transaction.retryCount}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                                {transaction.omegaJobId || '--'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {transaction.errorMessage && (
                                <div className="text-sm text-red-600 max-w-xs truncate" title={transaction.errorMessage}>
                                  {transaction.errorMessage}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {transaction.status === 'failed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => retryTransactionMutation.mutate(transaction.id)}
                                  disabled={retryTransactionMutation.isPending}
                                >
                                  <RotateCcw className="w-3 h-3 mr-1" />
                                  Retry
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(activityLogs) ? activityLogs.map((log: any) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{log.message}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(log.timestamp, 'MMM d, yyyy HH:mm:ss')}
                          {log.transactionId && ` • Transaction #${log.transactionId}`}
                        </div>
                      </div>
                    </div>
                  )) : null}

                  {activityLogsError && (
                    <div className="text-center text-red-500 dark:text-red-400 py-8">
                      <p className="font-medium">Failed to load activity logs</p>
                      <p className="text-sm mt-2">{activityLogsError instanceof Error ? activityLogsError.message : 'Unknown error'}</p>
                    </div>
                  )}

                  {!activityLogsError && (!activityLogs || !Array.isArray(activityLogs) || activityLogs.length === 0) && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No recent activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

    </div>
  );
}

// Wrap with error boundary
export default function TransactionLogs() {
  return (
    <ErrorBoundary>
      <TransactionLogsContent />
    </ErrorBoundary>
  );
}
