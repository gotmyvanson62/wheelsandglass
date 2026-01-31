import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";

export default function OmegaJobs() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: () => 
      fetch('/api/transactions').then(res => res.json()).catch(() => []),
  });

  // Filter for successful transactions with Omega job IDs
  const omegaJobs = (transactions || [])
    .filter((t: any) => t.status === 'success' && t.omegaJobId)
    .filter((t: any) => {
      if (!searchTerm) return true;
      return (
        t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.omegaJobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const handleViewInOmega = (jobId: string) => {
    // This would typically open the Omega EDI interface
    // For now, we'll just show a message
    window.open(`https://app.omegaedi.com/jobs/${jobId}`, '_blank');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">

        
        <main className="flex-1 overflow-auto p-3 md:p-6 custom-scrollbar">
          <div className="space-y-4 md:space-y-6">
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                    </div>
                    <div className="ml-3 md:ml-4">
                      <p className="text-xs md:text-sm font-medium text-gray-600">Total Jobs Created</p>
                      <p className="text-xl md:text-2xl font-semibold text-gray-900">{omegaJobs.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Badge className="w-5 h-5 bg-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Quote Status</p>
                      <p className="text-2xl font-semibold text-gray-900">{omegaJobs.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {transactions?.length > 0 
                          ? Math.round((omegaJobs.length / transactions.length) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-base md:text-lg">Search Jobs</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by customer name, job ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm md:text-base"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Jobs Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Omega EDI Jobs ({omegaJobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-12 text-center text-gray-500">
                    Loading jobs...
                  </div>
                ) : omegaJobs.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    {transactions?.length === 0 
                      ? "No transactions found"
                      : "No successful jobs found matching your search"
                    }
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Job ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Vehicle
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {omegaJobs.map((job: any) => (
                          <tr key={job.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono text-sm font-medium text-gray-900">
                                {job.omegaJobId}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(new Date(job.timestamp), 'MMM d, yyyy HH:mm')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {job.customerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {job.customerEmail}
                              </div>
                              {job.customerPhone && (
                                <div className="text-sm text-gray-500">
                                  {job.customerPhone}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div>
                                {[job.vehicleYear, job.vehicleMake, job.vehicleModel]
                                  .filter(Boolean)
                                  .join(' ') || '--'}
                              </div>
                              {job.vehicleVin && (
                                <div className="text-xs text-gray-500 font-mono">
                                  VIN: {job.vehicleVin}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-blue-100 text-blue-800">
                                Quote
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewInOmega(job.omegaJobId)}
                                className="flex items-center"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View in Omega
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

            {/* Job Details Preview */}
            {omegaJobs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {omegaJobs.slice(0, 3).map((job: any) => (
                      <div key={job.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm font-medium">
                            {job.omegaJobId}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(job.timestamp), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>{job.customerName}</strong> - {job.customerEmail}
                        </div>
                        {job.damageDescription && (
                          <div className="text-sm text-gray-600 mt-2">
                            <strong>Description:</strong> {job.damageDescription}
                          </div>
                        )}
                        {job.policyNumber && (
                          <div className="text-sm text-gray-600">
                            <strong>Policy:</strong> {job.policyNumber}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
