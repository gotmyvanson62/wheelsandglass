import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { format, formatDistanceToNow } from 'date-fns';
import { PerformanceMetricsPanel } from '@/components/operations/performance-metrics-panel';
import { RetryLogicPanel } from '@/components/operations/retry-logic-panel';
import { 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  RotateCcw, 
  Search, 
  TrendingUp, 
  XCircle, 
  AlertCircle,
  Activity,
  BarChart3,
  Shield,
  Database
} from 'lucide-react';

export default function ErrorMonitor() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [errorTypeFilter, setErrorTypeFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  const { data: activityLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['/api/activity-logs'],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const retryTransactionMutation = useMutation({
    mutationFn: (id: number) => apiRequest('POST', `/api/transactions/${id}/retry`),
    onSuccess: () => {
      toast({
        title: "Retry initiated",
        description: "Transaction will be retried shortly",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: () => {
      toast({
        title: "Retry failed",
        description: "Unable to retry transaction",
        variant: "destructive",
      });
    },
  });

  // Filter failed transactions
  const failedTransactions = (transactions || [])
    .filter((t: any) => t.status === 'failed')
    .filter((t: any) => {
      if (!searchTerm) return true;
      return (
        t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.errorMessage && t.errorMessage.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });

  // Filter error logs
  const errorLogs = (activityLogs || [])
    .filter((log: any) => log.type === 'error')
    .filter((log: any) => {
      if (errorTypeFilter === "all") return true;
      
      if (errorTypeFilter === "validation" && log.message.toLowerCase().includes('validation')) return true;
      if (errorTypeFilter === "api" && log.message.toLowerCase().includes('api')) return true;
      if (errorTypeFilter === "connection" && log.message.toLowerCase().includes('connection')) return true;
      if (errorTypeFilter === "timeout" && log.message.toLowerCase().includes('timeout')) return true;
      
      return false;
    });

  // Error statistics
  const stats = dashboardStats?.stats || { total: 0, success: 0, failed: 0, pending: 0 };
  const totalRetries = failedTransactions.reduce((sum: number, t: any) => sum + (t.retryCount || 0), 0);
  const autoRecovered = Math.max(0, stats.success - failedTransactions.length);
  const recentErrors = errorLogs.filter((log: any) => {
    const logTime = new Date(log.timestamp);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return logTime > oneHourAgo;
  }).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/activity-logs'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] }),
      ]);
      toast({
        title: "Refreshed",
        description: "Error monitoring data has been updated",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Unable to refresh error data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetryTransaction = (id: number) => {
    retryTransactionMutation.mutate(id);
  };

  const handleRetryAllFailed = () => {
    failedTransactions.forEach((t: any) => {
      retryTransactionMutation.mutate(t.id);
    });
    toast({
      title: "Batch retry initiated",
      description: `Retrying ${failedTransactions.length} failed transactions`,
    });
  };

  const getErrorType = (errorMessage: string) => {
    const message = errorMessage.toLowerCase();
    if (message.includes('validation')) return 'Validation';
    if (message.includes('api')) return 'API';
    if (message.includes('connection') || message.includes('network')) return 'Connection';
    if (message.includes('timeout')) return 'Timeout';
    if (message.includes('authentication') || message.includes('unauthorized')) return 'Auth';
    return 'Unknown';
  };

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case 'Validation': return 'bg-yellow-100 text-yellow-800';
      case 'API': return 'bg-red-100 text-red-800';
      case 'Connection': return 'bg-orange-100 text-orange-800';
      case 'Timeout': return 'bg-purple-100 text-purple-800';
      case 'Auth': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
            
            {/* Error Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-600">Failed Requests</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.failed}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-red-600">
                      <span className="font-medium">{recentErrors}</span>
                      <span className="text-gray-500 ml-1">in last hour</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-accent" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-600">Total Retries</p>
                      <p className="text-2xl font-semibold text-gray-900">{totalRetries}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-yellow-600">
                      <span className="font-medium">{stats.pending}</span>
                      <span className="text-gray-500 ml-1">currently pending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-600">Auto-Recovery</p>
                      <p className="text-2xl font-semibold text-gray-900">{autoRecovered}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-green-600">
                      <span className="font-medium">Resolved</span>
                      <span className="text-gray-500 ml-1">automatically</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-blue-600">
                      <span className="font-medium">{stats.success}</span>
                      <span className="text-gray-500 ml-1">successful</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Error Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search by customer name, email, or error message..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={errorTypeFilter} onValueChange={setErrorTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Error Types</SelectItem>
                      <SelectItem value="validation">Validation Errors</SelectItem>
                      <SelectItem value="api">API Errors</SelectItem>
                      <SelectItem value="connection">Connection Errors</SelectItem>
                      <SelectItem value="timeout">Timeout Errors</SelectItem>
                    </SelectContent>
                  </Select>
                  {failedTransactions.length > 0 && (
                    <Button
                      onClick={handleRetryAllFailed}
                      disabled={retryTransactionMutation.isPending}
                      className="flex items-center"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retry All Failed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Failed Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Failed Transactions ({failedTransactions.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {transactionsLoading ? (
                  <div className="p-12 text-center text-gray-500">
                    Loading failed transactions...
                  </div>
                ) : failedTransactions.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Failed Transactions</h3>
                    <p className="text-gray-600">All transactions are processing successfully!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Failed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Error Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Error Message
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Retries
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {failedTransactions.map((transaction: any) => {
                          const errorType = getErrorType(transaction.errorMessage || '');
                          return (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(transaction.timestamp), 'MMM d, HH:mm')}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {transaction.customerName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {transaction.customerEmail}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={getErrorTypeColor(errorType)}>
                                  {errorType}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-md truncate" title={transaction.errorMessage}>
                                  {transaction.errorMessage || 'Unknown error'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {transaction.retryCount || 0} attempts
                                </div>
                                {transaction.lastRetry && (
                                  <div className="text-xs text-gray-500">
                                    Last: {formatDistanceToNow(new Date(transaction.lastRetry), { addSuffix: true })}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRetryTransaction(transaction.id)}
                                  disabled={retryTransactionMutation.isPending}
                                  className="flex items-center"
                                >
                                  <RotateCcw className="w-3 h-3 mr-1" />
                                  Retry
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Error Log History</CardTitle>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="p-8 text-center text-gray-500">
                    Loading error logs...
                  </div>
                ) : errorLogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No error logs found matching your criteria
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {errorLogs.map((log: any) => (
                      <div key={log.id} className="flex items-start space-x-3 p-3 border rounded">
                        <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-gray-900">{log.message}</p>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                              {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                            {log.transactionId && ` • Transaction #${log.transactionId}`}
                          </div>
                          {log.details && typeof log.details === 'object' && (
                            <div className="text-xs text-gray-400 mt-1 font-mono">
                              {JSON.stringify(log.details, null, 2).slice(0, 200)}
                              {JSON.stringify(log.details, null, 2).length > 200 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

    </div>
  );
}
