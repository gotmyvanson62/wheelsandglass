import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  X,
  Car,
  MapPin,
  User,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';

interface Job {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicle: {
    year: string;
    make: string;
    model: string;
    vin: string;
  };
  service: string;
  status: 'active' | 'pending' | 'completed' | 'scheduled' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'partial' | 'invoiced';
  location: string;
  installer: string;
  scheduledDate: string;
  amount: number;
  createdAt: string;
}

interface JobsListProps {
  statusFilter?: string;
  onOpenJob: (jobId: string) => void;
}

// Jobs data - production ready (empty until real data added from API)
const mockJobs: Job[] = [];

// Filter options - locations and installers should be populated from API
const locations = ['All Locations'];
const installers = ['All Installers', 'Unassigned'];
const paymentStatuses = ['All Payment Status', 'paid', 'unpaid', 'partial', 'invoiced'];

export function JobsList({ statusFilter, onOpenJob }: JobsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [installerFilter, setInstallerFilter] = useState('All Installers');
  const [paymentFilter, setPaymentFilter] = useState('All Payment Status');
  const [dateFilter, setDateFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');

  const filteredJobs = useMemo(() => {
    return mockJobs.filter(job => {
      // Status filter from Quick Stats
      if (statusFilter && statusFilter !== 'all') {
        if (job.status !== statusFilter) return false;
      }

      // Search query (VIN, phone, email, job ID, customer name)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          job.id.toLowerCase().includes(query) ||
          job.customerName.toLowerCase().includes(query) ||
          job.customerEmail.toLowerCase().includes(query) ||
          job.customerPhone.includes(query) ||
          job.vehicle.vin.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Location filter
      if (locationFilter !== 'All Locations' && job.location !== locationFilter) {
        return false;
      }

      // Installer filter
      if (installerFilter !== 'All Installers' && job.installer !== installerFilter) {
        return false;
      }

      // Payment status filter
      if (paymentFilter !== 'All Payment Status' && job.paymentStatus !== paymentFilter) {
        return false;
      }

      // Date filter
      if (dateFilter && job.scheduledDate !== dateFilter) {
        return false;
      }

      // Vehicle filter (year/make/model)
      if (vehicleFilter) {
        const vFilter = vehicleFilter.toLowerCase();
        const vehicleString = `${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}`.toLowerCase();
        if (!vehicleString.includes(vFilter)) return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter, locationFilter, installerFilter, paymentFilter, dateFilter, vehicleFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setLocationFilter('All Locations');
    setInstallerFilter('All Installers');
    setPaymentFilter('All Payment Status');
    setDateFilter('');
    setVehicleFilter('');
  };

  const hasActiveFilters = searchQuery || locationFilter !== 'All Locations' ||
    installerFilter !== 'All Installers' || paymentFilter !== 'All Payment Status' ||
    dateFilter || vehicleFilter;

  const getStatusBadge = (status: Job['status']) => {
    const styles = {
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      scheduled: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return <Badge className={styles[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getPaymentBadge = (status: Job['paymentStatus']) => {
    const styles = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      partial: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      invoiced: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return <Badge variant="outline" className={styles[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg">All Jobs</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search VIN, phone, email, job ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Location</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="h-9">
                    <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Installer</Label>
                <Select value={installerFilter} onValueChange={setInstallerFilter}>
                  <SelectTrigger className="h-9">
                    <User className="w-3 h-3 mr-1 text-gray-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {installers.map(inst => (
                      <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Payment Status</Label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="h-9">
                    <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.map(ps => (
                      <SelectItem key={ps} value={ps}>{ps === 'All Payment Status' ? ps : ps.charAt(0).toUpperCase() + ps.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Scheduled Date</Label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Vehicle (Year/Make/Model)</Label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <Input
                    placeholder="e.g. 2022 Toyota"
                    value={vehicleFilter}
                    onChange={(e) => setVehicleFilter(e.target.value)}
                    className="h-9 pl-8"
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-gray-500">{filteredJobs.length} jobs found</span>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Results count when filters applied but panel closed */}
        {hasActiveFilters && !showFilters && (
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">{filteredJobs.length} jobs found</span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          </div>
        )}

        {/* Jobs Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs text-gray-500 dark:text-gray-400">
                <th className="pb-3 font-medium">Job ID</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium hidden md:table-cell">Vehicle</th>
                <th className="pb-3 font-medium hidden lg:table-cell">Location</th>
                <th className="pb-3 font-medium hidden lg:table-cell">Installer</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Payment</th>
                <th className="pb-3 font-medium text-right">Amount</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredJobs.map(job => (
                <tr
                  key={job.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => onOpenJob(job.id)}
                >
                  <td className="py-3">
                    <span className="font-medium text-blue-600 hover:text-blue-800">{job.id}</span>
                  </td>
                  <td className="py-3">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{job.customerName}</div>
                      <div className="text-xs text-gray-500">{job.customerPhone}</div>
                    </div>
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    <div className="text-sm">
                      {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">{job.vehicle.vin.slice(-8)}</div>
                  </td>
                  <td className="py-3 hidden lg:table-cell text-sm">{job.location}</td>
                  <td className="py-3 hidden lg:table-cell text-sm">{job.installer}</td>
                  <td className="py-3">{getStatusBadge(job.status)}</td>
                  <td className="py-3 hidden sm:table-cell">{getPaymentBadge(job.paymentStatus)}</td>
                  <td className="py-3 text-right font-medium">${(job.amount / 100).toFixed(2)}</td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onOpenJob(job.id); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No jobs found matching your criteria</p>
            <Button variant="link" onClick={clearFilters} className="mt-2">
              Clear filters to see all jobs
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
