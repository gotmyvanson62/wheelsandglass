import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Zap,
  Activity,
  RotateCcw
} from 'lucide-react';

interface RetryAttempt {
  id: string;
  transactionId: string;
  attemptNumber: number;
  timestamp: Date;
  status: 'pending' | 'success' | 'failed' | 'retry_scheduled';
  errorMessage?: string;
  nextRetryAt?: Date;
  service: 'omega_edi' | 'square_payments' | 'vin_lookup' | 'nags_parts';
}

interface RetryConfiguration {
  maxRetries: number;
  baseDelayMs: number;
  exponentialBackoff: boolean;
  retryIntervals: number[];
  enabledServices: string[];
}

export function RetryLogicPanel() {
  const [selectedService, setSelectedService] = useState<string>('all');
  const { toast } = useToast();

  const { data: retryAttempts = [], isLoading: attemptsLoading } = useQuery<RetryAttempt[]>({
    queryKey: ['/api/retry-attempts'],
    refetchInterval: 10000
  });

  const { data: retryConfig } = useQuery<RetryConfiguration>({
    queryKey: ['/api/retry-configuration']
  });

  const { data: retryStats } = useQuery<{
    totalRetries: number;
    successfulRetries: number;
    failedRetries: number;
    averageRetryTime: number;
  }>({
    queryKey: ['/api/retry-stats'],
    refetchInterval: 30000
  });

  const manualRetryMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return apiRequest(`/api/transactions/${transactionId}/retry`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/retry-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/retry-stats'] });
      toast({ title: "Manual retry initiated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to initiate manual retry", variant: "destructive" });
    }
  });

  const getStatusColor = (status: RetryAttempt['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'retry_scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceIcon = (service: RetryAttempt['service']) => {
    switch (service) {
      case 'omega_edi': return <Activity className="w-4 h-4" />;
      case 'square_payments': return <CheckCircle className="w-4 h-4" />;
      case 'vin_lookup': return <RefreshCw className="w-4 h-4" />;
      case 'nags_parts': return <Zap className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredAttempts = selectedService === 'all' 
    ? retryAttempts 
    : retryAttempts.filter(attempt => attempt.service === selectedService);

  return (
    <div className="space-y-6">
      {/* Retry Statistics */}
      {retryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Retries</p>
                  <p className="text-2xl font-bold">{retryStats.totalRetries}</p>
                </div>
                <RefreshCw className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {retryStats.totalRetries > 0 
                      ? Math.round((retryStats.successfulRetries / retryStats.totalRetries) * 100)
                      : 0}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed Retries</p>
                  <p className="text-2xl font-bold text-red-600">{retryStats.failedRetries}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Retry Time</p>
                  <p className="text-2xl font-bold text-blue-600">{retryStats.averageRetryTime}s</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="attempts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attempts">Retry Attempts</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="analysis">Error Analysis</TabsTrigger>
        </TabsList>

        {/* Retry Attempts Tab */}
        <TabsContent value="attempts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Retry Attempts Log
                </CardTitle>
                <div className="flex items-center gap-2">
                  <select 
                    value={selectedService} 
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="all">All Services</option>
                    <option value="omega_edi">Omega EDI</option>
                    <option value="square_payments">Square Payments</option>
                    <option value="vin_lookup">VIN Lookup</option>
                    <option value="nags_parts">NAGS Parts</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredAttempts.map((attempt) => (
                    <div key={attempt.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getServiceIcon(attempt.service)}
                            <span className="font-medium text-sm">
                              {attempt.service.replace('_', ' ').toUpperCase()}
                            </span>
                            <Badge className={getStatusColor(attempt.status)}>
                              {attempt.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Attempt #{attempt.attemptNumber}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            Transaction ID: {attempt.transactionId}
                          </p>
                          
                          {attempt.errorMessage && (
                            <p className="text-sm text-red-600 mb-2">
                              Error: {attempt.errorMessage}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              {new Date(attempt.timestamp).toLocaleString()}
                            </span>
                            {attempt.nextRetryAt && (
                              <span>
                                Next retry: {new Date(attempt.nextRetryAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {(attempt.status === 'failed' || attempt.status === 'retry_scheduled') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => manualRetryMutation.mutate(attempt.transactionId)}
                            disabled={manualRetryMutation.isPending}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Retry Now
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredAttempts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No retry attempts found for the selected filter.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retry Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {retryConfig && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Max Retries</label>
                      <p className="text-lg font-semibold">{retryConfig.maxRetries}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Base Delay</label>
                      <p className="text-lg font-semibold">{retryConfig.baseDelayMs}ms</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Exponential Backoff</label>
                      <Badge variant={retryConfig.exponentialBackoff ? "default" : "outline"}>
                        {retryConfig.exponentialBackoff ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Retry Intervals</label>
                    <div className="flex gap-2 flex-wrap">
                      {retryConfig.retryIntervals.map((interval, index) => (
                        <Badge key={index} variant="outline">
                          Attempt {index + 1}: {interval}s
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Enabled Services</label>
                    <div className="flex gap-2 flex-wrap">
                      {retryConfig.enabledServices.map((service) => (
                        <Badge key={service} variant="default">
                          {service.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Error Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Pattern Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Most Common Errors</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Network Timeout (Omega EDI)</span>
                      <Badge variant="outline">34% of errors</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Rate Limit Exceeded (VIN API)</span>
                      <Badge variant="outline">28% of errors</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Invalid Payment Data (Square)</span>
                      <Badge variant="outline">21% of errors</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Recovery Success Rate by Service</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Omega EDI</span>
                        <span>94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>VIN Lookup</span>
                        <span>87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Square Payments</span>
                        <span>96%</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
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