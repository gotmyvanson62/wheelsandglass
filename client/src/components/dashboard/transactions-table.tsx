import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Transaction } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";

interface TransactionsTableProps {
  transactions: Transaction[];
  onViewDetails?: (id: number) => void;
  onRetry?: (id: number) => void;
  onExport?: () => void;
  onOpenJobRecord?: (jobId: string) => void;
}

export function TransactionsTable({ transactions, onViewDetails, onRetry, onExport, onOpenJobRecord }: TransactionsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Transform API transactions to display format
  const enhancedTransactions = transactions.map(t => ({
    id: t.id,
    timestamp: new Date(t.createdAt || Date.now()),
    customer: t.customerName || 'Unknown',
    vehicle: `${t.vehicleYear || ''} ${t.vehicleMake || ''} ${t.vehicleModel || ''}`.trim() || 'No vehicle info',
    service: t.damageDescription || 'Auto Glass Service',
    status: t.paymentStatus === 'paid' ? 'collected' : t.status === 'success' ? 'completed' : t.status === 'pending' ? 'scheduled' : 'pending',
    omegaJobId: t.omegaJobId || `WO-${t.id}`,
    contractedAmount: t.finalPrice ? parseFloat(t.finalPrice) / 100 : 0,
    collectedAmount: t.paymentStatus === 'paid' ? (t.finalPrice ? parseFloat(t.finalPrice) / 100 : 0) : 0,
    paymentMethod: t.paymentStatus || 'Pending',
    technician: 'Technician',
    location: 'Service Location'
  }));

  const filteredTransactions = statusFilter === "all"
    ? enhancedTransactions
    : enhancedTransactions.filter(t => t.status === statusFilter);

  // Calculate totals for business metrics (will be 0 when no data)
  const businessMetrics = {
    totalContracted: enhancedTransactions.reduce((sum, t) => sum + t.contractedAmount, 0),
    totalCollected: enhancedTransactions.reduce((sum, t) => sum + t.collectedAmount, 0),
    pendingCollection: enhancedTransactions.reduce((sum, t) => sum + (t.contractedAmount - t.collectedAmount), 0),
    collectionRate: enhancedTransactions.reduce((sum, t) => sum + t.contractedAmount, 0) > 0
      ? (enhancedTransactions.reduce((sum, t) => sum + t.collectedAmount, 0) / enhancedTransactions.reduce((sum, t) => sum + t.contractedAmount, 0) * 100).toFixed(1)
      : '0'
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'collected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Collected</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
      case 'partial':
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="w-3 h-3 mr-1" />Partial</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCollectionStatus = (contracted: number, collected: number) => {
    const percentage = contracted > 0 ? (collected / contracted) * 100 : 0;
    if (percentage === 100) {
      return { icon: <TrendingUp className="w-4 h-4 text-green-600" />, color: "text-green-600" };
    } else if (percentage > 50) {
      return { icon: <TrendingUp className="w-4 h-4 text-orange-600" />, color: "text-orange-600" };
    } else if (percentage > 0) {
      return { icon: <TrendingDown className="w-4 h-4 text-red-600" />, color: "text-red-600" };
    } else {
      return { icon: <AlertCircle className="w-4 h-4 text-gray-400" />, color: "text-gray-400" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Business Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Contracted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${businessMetrics.totalContracted.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">${businessMetrics.totalCollected.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Collection</p>
                <p className="text-2xl font-bold text-red-600">${businessMetrics.pendingCollection.toLocaleString()}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{businessMetrics.collectionRate}%</p>
              </div>
              <TrendingUp className={`w-8 h-8 ${businessMetrics.collectionRate >= '70' ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Transactions Table */}
      <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Transactions & Revenue Activity</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              {onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                >
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="md:hidden">
            {filteredTransactions.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No transactions found
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((transaction) => {
                  const collectionStatus = getCollectionStatus(transaction.contractedAmount, transaction.collectedAmount);
                  const collectionPercentage = transaction.contractedAmount > 0
                    ? (transaction.collectedAmount / transaction.contractedAmount * 100)
                    : 0;

                  return (
                    <div key={transaction.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => onOpenJobRecord?.(transaction.omegaJobId)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-base"
                        >
                          {transaction.omegaJobId}
                        </button>
                        {getStatusBadge(transaction.status)}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-base text-gray-900 dark:text-gray-100">{transaction.customer}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.vehicle}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.service}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Contracted</p>
                            <p className="font-medium text-green-600">${transaction.contractedAmount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Collected</p>
                            <p className="font-medium text-blue-600">${transaction.collectedAmount.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Collection Health</span>
                            <span className={`font-medium ${collectionStatus.color}`}>
                              {collectionPercentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                collectionPercentage >= 90 ? 'bg-green-500' :
                                collectionPercentage >= 70 ? 'bg-yellow-500' :
                                collectionPercentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(collectionPercentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>{transaction.technician} • {transaction.location}</p>
                          <p>{format(transaction.timestamp, 'MMM d, h:mm a')}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Job & Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer & Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Revenue Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Collection Health
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Technician & Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const collectionStatus = getCollectionStatus(transaction.contractedAmount, transaction.collectedAmount);
                    const collectionPercentage = transaction.contractedAmount > 0
                      ? ((transaction.collectedAmount / transaction.contractedAmount) * 100).toFixed(0)
                      : '0';

                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <button
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer hover:underline"
                                onClick={() => onOpenJobRecord?.(transaction.omegaJobId)}
                              >
                                {transaction.omegaJobId}
                              </button>
                              {getStatusBadge(transaction.status)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{transaction.service}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">{format(transaction.timestamp, 'MMM d, h:mm a')}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.customer}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{transaction.vehicle}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">{transaction.paymentMethod}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              ${transaction.contractedAmount.toLocaleString()} contracted
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              ${transaction.collectedAmount.toLocaleString()} collected
                            </div>
                            <div className="text-sm font-medium text-red-600">
                              ${(transaction.contractedAmount - transaction.collectedAmount).toLocaleString()} pending
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {collectionStatus.icon}
                            <div className="space-y-1">
                              <div className={`text-sm font-medium ${collectionStatus.color}`}>
                                {collectionPercentage}% collected
                              </div>
                              <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    collectionPercentage === '100' ? 'bg-green-500' :
                                    parseInt(collectionPercentage) > 50 ? 'bg-orange-500' :
                                    parseInt(collectionPercentage) > 0 ? 'bg-red-500' : 'bg-gray-400'
                                  }`}
                                  style={{ width: `${collectionPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.technician}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{transaction.location}</div>
                            {onViewDetails && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewDetails(transaction.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto"
                              >
                                View Details
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
          </table>
        </div>
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredTransactions.length} transactions with ${businessMetrics.totalContracted.toLocaleString()} total contracted value
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
