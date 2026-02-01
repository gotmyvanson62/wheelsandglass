import { useQuery, useMutation } from "@tanstack/react-query";
import { ConversionAnalyticsPanel } from '@/components/dashboard/conversion-analytics-panel';
import { DataTransmissionPanel } from '@/components/dashboard/data-transmission-panel';
import { QuoteRequestsWidget } from '@/components/dashboard/quote-requests-widget';
import { Navbar } from '@/components/ui/navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusCards } from "@/components/dashboard/status-cards";

import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { JobRecordDialog } from "@/components/crm/job-record-dialog";

import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { TrendingUp, TrendingDown, ArrowRight, CheckCircle, Clock, XCircle, DollarSign, Calendar, User } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const { data: dashboardData, refetch: refetchDashboard } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions'],
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/test-omega-connection', 'POST');
      return response.json();
    },
    onSuccess: (data: { success: boolean; message: string }) => {
      toast({
        title: data.success ? "Connection successful" : "Connection failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Test failed",
        description: "Unable to test connection",
        variant: "destructive",
      });
    },
  });



  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchDashboard(),
        queryClient.invalidateQueries({ queryKey: ['/api/transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/activity-logs'] }),
      ]);
      toast({
        title: "Refreshed",
        description: "Dashboard data has been updated",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Unable to refresh dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTestConnection = () => {
    testConnectionMutation.mutate();
  };

  const openJobRecord = (jobId: string) => {
    setSelectedJobId(jobId);
    setJobDialogOpen(true);
  };



  const stats = (dashboardData as any)?.stats || { total: 0, success: 0, failed: 0, pending: 0 };
  const conversionStats = (dashboardData as any)?.conversionStats || {
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



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your auto glass service operations
        </p>
      </div>

      {/* Quick Stats Cards */}
      <StatusCards
        stats={stats}
        onCardClick={(filter) => {
          // Navigate to CRM with status filter
          window.location.href = `/admin/crm/jobs?status=${filter}`;
        }}
      />

      {/* Quote Requests */}
      <QuoteRequestsWidget />

      {/* Recent Transactions */}
      <div className="w-full">
        <TransactionsTable 
          transactions={Array.isArray(transactions) ? transactions : []}
          onViewDetails={(id) => window.location.href = `/admin/transaction-logs?id=${id}`}
          onOpenJobRecord={openJobRecord}
          onExport={() => {
            toast({
              title: "Export started",
              description: "Transaction export will download shortly",
            });
          }}
        />
      </div>

      {/* Job Record Dialog */}
      <JobRecordDialog 
        open={jobDialogOpen}
        onOpenChange={setJobDialogOpen}
        jobId={selectedJobId}
      />
    </div>
  );
}
