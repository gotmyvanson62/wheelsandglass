import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Phone,
  Mail,
  MessageSquare,
  User,
  Wrench,
  Building2,
  MapPin,
  Star,
  FileText,
  ShoppingCart,
  Loader2,
  Plus
} from 'lucide-react';

interface UnifiedContact {
  id: number;
  type: 'customer' | 'technician' | 'distributor';
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'active' | 'pending' | 'inactive';
  city?: string;
  state?: string;
  specialty?: string;
  accountType?: string;
  totalSpent?: number;
  totalJobs?: number;
  rating?: number;
}

interface ContactsDirectoryProps {
  onMessageContact?: (contact: UnifiedContact) => void;
  onViewContact?: (contact: UnifiedContact) => void;
}

export function ContactsDirectory({ onMessageContact, onViewContact }: ContactsDirectoryProps) {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<UnifiedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
  });

  // Debounced search
  const [searchInput, setSearchInput] = useState('');

  // Add Contact Dialog State
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addingContact, setAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({
    type: 'technician' as 'customer' | 'technician' | 'distributor',
    name: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    state: '',
    specialty: ''
  });

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.type) {
      toast({
        title: "Error",
        description: "Name and type are required",
        variant: "destructive"
      });
      return;
    }

    setAddingContact(true);
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact)
      });

      if (!response.ok) {
        throw new Error('Failed to create contact');
      }

      toast({
        title: "Success",
        description: `${newContact.type.charAt(0).toUpperCase() + newContact.type.slice(1)} added successfully`
      });

      setShowAddDialog(false);
      setNewContact({
        type: 'technician',
        name: '',
        email: '',
        phone: '',
        company: '',
        city: '',
        state: '',
        specialty: ''
      });
      // Refresh contacts
      fetchContacts();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAddingContact(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/contacts?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <User className="w-4 h-4" />;
      case 'technician':
        return <Wrench className="w-4 h-4" />;
      case 'distributor':
        return <Building2 className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'customer':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700';
      case 'technician':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700';
      case 'distributor':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-700';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
    }
  };

  const renderContactDetails = (contact: UnifiedContact) => {
    switch (contact.type) {
      case 'customer':
        return (
          <div className="text-sm text-gray-500">
            {contact.accountType && (
              <span className="capitalize">{contact.accountType} Account</span>
            )}
            {contact.totalSpent !== undefined && contact.totalSpent > 0 && (
              <span className="ml-2">${contact.totalSpent.toLocaleString()} total</span>
            )}
            {contact.totalJobs !== undefined && contact.totalJobs > 0 && (
              <span className="ml-2">{contact.totalJobs} jobs</span>
            )}
          </div>
        );
      case 'technician':
        return (
          <div className="text-sm text-gray-500 flex items-center gap-2">
            {contact.specialty && <span>{contact.specialty}</span>}
            {contact.city && contact.state && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {contact.city}, {contact.state}
              </span>
            )}
            {contact.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                {contact.rating}
              </span>
            )}
          </div>
        );
      case 'distributor':
        return (
          <div className="text-sm text-gray-500">
            {contact.company && <span>{contact.company}</span>}
          </div>
        );
      default:
        return null;
    }
  };

  const renderContactActions = (contact: UnifiedContact) => {
    const baseActions = (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => onViewContact?.(contact)}
        >
          <FileText className="w-4 h-4 mr-1" />
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => onMessageContact?.(contact)}
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          Message
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => window.location.href = `tel:${contact.phone}`}
        >
          <Phone className="w-4 h-4" />
        </Button>
      </>
    );

    if (contact.type === 'distributor') {
      return (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => onViewContact?.(contact)}
          >
            <FileText className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-purple-600"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Order
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.location.href = `tel:${contact.phone}`}
          >
            <Phone className="w-4 h-4" />
          </Button>
        </>
      );
    }

    return baseActions;
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contacts Directory</h2>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Contact
        </Button>
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Add a new technician, customer, or distributor to your contacts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="contact-type">Contact Type *</Label>
              <Select
                value={newContact.type}
                onValueChange={(value: 'customer' | 'technician' | 'distributor') =>
                  setNewContact(c => ({ ...c, type: value }))
                }
              >
                <SelectTrigger id="contact-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-name">Name *</Label>
              <Input
                id="contact-name"
                value={newContact.name}
                onChange={(e) => setNewContact(c => ({ ...c, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact(c => ({ ...c, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(c => ({ ...c, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-company">Company</Label>
              <Input
                id="contact-company"
                value={newContact.company}
                onChange={(e) => setNewContact(c => ({ ...c, company: e.target.value }))}
                placeholder="Company name"
              />
            </div>
            {newContact.type === 'technician' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contact-city">City</Label>
                    <Input
                      id="contact-city"
                      value={newContact.city}
                      onChange={(e) => setNewContact(c => ({ ...c, city: e.target.value }))}
                      placeholder="City"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-state">State</Label>
                    <Input
                      id="contact-state"
                      value={newContact.state}
                      onChange={(e) => setNewContact(c => ({ ...c, state: e.target.value }))}
                      placeholder="State"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact-specialty">Specialty</Label>
                  <Select
                    value={newContact.specialty}
                    onValueChange={(value) => setNewContact(c => ({ ...c, specialty: value }))}
                  >
                    <SelectTrigger id="contact-specialty">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Glass Replacement">Glass Replacement</SelectItem>
                      <SelectItem value="Chip/Crack Repair">Chip/Crack Repair</SelectItem>
                      <SelectItem value="ADAS Calibration">ADAS Calibration</SelectItem>
                      <SelectItem value="Window Tinting">Window Tinting</SelectItem>
                      <SelectItem value="All Services">All Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={addingContact}>
              {addingContact ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Contact'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search contacts by name, email, or phone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Type Filters */}
        <div className="flex gap-1 border rounded-lg p-1 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          {[
            { value: 'all', label: 'All Types' },
            { value: 'customer', label: 'Customers' },
            { value: 'technician', label: 'Technicians' },
            { value: 'distributor', label: 'Distributors' }
          ].map(({ value, label }) => (
            <Button
              key={value}
              variant={filters.type === value ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setFilters(f => ({
                ...f,
                type: value,
                // Reset status to 'all' when switching away from technicians
                status: value === 'technician' ? f.status : 'all'
              }))}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Status Filters - Only show when Technicians is selected */}
        {filters.type === 'technician' && (
          <div className="flex gap-1 border rounded-lg p-1 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            {[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending' },
              { value: 'inactive', label: 'Inactive' }
            ].map(({ value, label }) => (
              <Button
                key={value}
                variant={filters.status === value ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setFilters(f => ({ ...f, status: value }))}
              >
                {label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        {loading ? 'Loading...' : `${contacts.length} contacts found`}
      </div>

      {/* Contact List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading contacts...</span>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-red-500">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={fetchContacts}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : contacts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No contacts found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          contacts.map(contact => (
            <Card
              key={`${contact.type}-${contact.id}`}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Type Icon */}
                      <span className={`p-1.5 rounded-full ${getTypeBadgeColor(contact.type)}`}>
                        {getTypeIcon(contact.type)}
                      </span>

                      {/* Name */}
                      <h3 className="font-medium text-gray-900 truncate">
                        {contact.name}
                      </h3>

                      {/* Type Badge */}
                      <Badge
                        variant="outline"
                        className={`text-xs ${getTypeBadgeColor(contact.type)}`}
                      >
                        {contact.type.toUpperCase()}
                      </Badge>

                      {/* Status Badge - Only show for technicians */}
                      {contact.type === 'technician' && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusBadgeColor(contact.status)}`}
                        >
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </Badge>
                      )}
                    </div>

                    {/* Contact Details */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </a>
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </a>
                    </div>

                    {/* Type-specific details */}
                    {renderContactDetails(contact)}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {renderContactActions(contact)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
