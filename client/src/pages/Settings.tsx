import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Settings as SettingsIcon, 
  Book, 
  Database, 
  Globe, 
  Shield, 
  Bell,
  Save,
  RotateCcw,
  ExternalLink,
  Code,
  FileText,
  Webhook,
  Key,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Clock,
  Zap,
  Package,
  Car,
  CreditCard
} from 'lucide-react';

export default function SettingsDocumentation() {
  const { toast } = useToast();
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // URL-based routing for tabs and documentation sections
  const [location, setLocation] = useLocation();
  const [, params] = useRoute('/admin/settings/:tab/:section?');

  const validTabs = ['integrations', 'documentation'];
  const validSections = ['system-overview', 'setup-guide', 'webhook-docs', 'field-mapping', 'troubleshooting', 'changelog'];

  const activeTab = validTabs.includes(params?.tab || '') ? params?.tab! : 'integrations';
  const selectedDoc = validSections.includes(params?.section || '') ? params?.section! : 'system-overview';

  // Redirect bare /admin/settings to /admin/settings/integrations
  useEffect(() => {
    if (location === '/admin/settings' || location === '/admin/settings/') {
      setLocation('/admin/settings/integrations', { replace: true });
    }
  }, [location, setLocation]);

  const handleTabChange = (tab: string) => {
    if (tab === 'documentation') {
      setLocation('/admin/settings/documentation/system-overview');
    } else {
      setLocation(`/admin/settings/${tab}`);
    }
  };

  const handleDocSelect = (doc: string) => {
    setLocation(`/admin/settings/documentation/${doc}`);
  };

  // Fetch configurations
  const { data: configurations, isLoading: configLoading } = useQuery({
    queryKey: ['/api/configurations'],
  });

  // Fetch field mappings
  const { data: fieldMappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ['/api/field-mappings'],
  });

  const saveConfigMutation = useMutation({
    mutationFn: (config: any) => apiRequest('/api/configurations', 'POST', config),
    onSuccess: () => {
      toast({
        title: "Configuration saved",
        description: "Settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/configurations'] });
      setUnsavedChanges(false);
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Unable to save configuration",
        variant: "destructive",
      });
    },
  });

  const resetConfigMutation = useMutation({
    mutationFn: () => apiRequest('/api/configurations/reset', 'POST'),
    onSuccess: () => {
      toast({
        title: "Configuration reset",
        description: "Settings have been restored to defaults",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/configurations'] });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: (endpoint: string) => apiRequest(`/api/test-connection/${endpoint}`, 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: "Connection successful",
        description: `${data.service} is responding correctly`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection failed",
        description: error.message || "Unable to connect to service",
        variant: "destructive",
      });
    },
  });

  const handleSaveConfig = () => {
    // Implementation would collect form data and save
    saveConfigMutation.mutate({});
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard",
    });
  };

  const renderDocumentationContent = () => {
    switch (selectedDoc) {
      case 'setup-guide':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Setup Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Initial Setup</h4>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h5 className="font-medium">1. Configure API Keys</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Add your API keys to the Secrets tab in Replit:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                      <li>• <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">OMEGA_EDI_API_KEY</code> - Your Omega EDI API key</li>
                      <li>• <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">SQUARE_ACCESS_TOKEN</code> - Square API access token</li>
                      <li>• <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">TWILIO_ACCOUNT_SID</code> - Twilio account SID</li>
                      <li>• <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">TWILIO_AUTH_TOKEN</code> - Twilio auth token</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h5 className="font-medium">2. Configure Squarespace Webhook</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      In your Squarespace form settings, set the webhook URL to:
                    </p>
                    <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 text-sm">
                      https://wheelsandglass.com/api/webhook/squarespace
                    </code>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h5 className="font-medium">3. Test Integration</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Use the test endpoints in the API Reference tab to verify your setup is working correctly.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'webhook-docs':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Webhook Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Webhook Endpoints</h4>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">POST</Badge>
                      <code className="text-sm font-mono">/api/webhook/squarespace</code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Receives form submissions from Squarespace</p>
                    <div className="text-xs">
                      <p className="font-medium mb-1 dark:text-gray-200">Expected Headers:</p>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• Content-Type: application/json</li>
                        <li>• X-Squarespace-Signature: [webhook signature]</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">POST</Badge>
                      <code className="text-sm font-mono">/api/webhook/square</code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Handles Square payment notifications</p>
                    <div className="text-xs">
                      <p className="font-medium mb-1 dark:text-gray-200">Event Types:</p>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• payment.created</li>
                        <li>• payment.updated</li>
                        <li>• invoice.payment_made</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">POST</Badge>
                      <code className="text-sm font-mono">/api/webhook/twilio</code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Processes inbound SMS messages</p>
                    <div className="text-xs">
                      <p className="font-medium mb-1 dark:text-gray-200">SMS Commands:</p>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• "RESCHEDULE [new-date]" - Reschedule appointment</li>
                        <li>• "STATUS" - Get appointment status</li>
                        <li>• "CANCEL" - Cancel appointment</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'field-mapping':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Field Mapping Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Squarespace to Omega EDI Mapping</h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Squarespace Field</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Omega EDI Field</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Transformation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm"><code>first-name</code></td>
                        <td className="px-4 py-3 text-sm"><code>customer.firstName</code></td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Direct mapping</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm"><code>last-name</code></td>
                        <td className="px-4 py-3 text-sm"><code>customer.lastName</code></td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Direct mapping</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm"><code>phone-number</code></td>
                        <td className="px-4 py-3 text-sm"><code>customer.phone</code></td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Format normalization</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm"><code>vehicle-vin</code></td>
                        <td className="px-4 py-3 text-sm"><code>vehicle.vin</code></td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">VIN validation + lookup</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm"><code>service-location</code></td>
                        <td className="px-4 py-3 text-sm"><code>job.serviceLocation</code></td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Address parsing</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h5 className="font-medium mb-2 dark:text-gray-200">Custom Field Mapping</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You can configure custom field mappings in the Configuration tab. 
                    The system supports data transformations including format validation, 
                    normalization, and lookup operations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'troubleshooting':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Troubleshooting Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Common Issues</h4>
                
                <div className="space-y-4">
                  <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <h5 className="font-medium text-red-800 dark:text-red-300 mb-2">Webhook Not Receiving Data</h5>
                    <div className="text-sm text-red-700 dark:text-red-400 space-y-2">
                      <p>Check the following:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• Verify webhook URL is correct in Squarespace</li>
                        <li>• Check if webhook signature validation is failing</li>
                        <li>• Review Transaction Logs for failed webhook attempts</li>
                        <li>• Test webhook endpoint with curl or Postman</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Omega EDI API Errors</h5>
                    <div className="text-sm text-yellow-700 dark:text-yellow-400 space-y-2">
                      <p>Common solutions:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• Verify API key is correctly set in Secrets</li>
                        <li>• Check API rate limits and quotas</li>
                        <li>• Review field mapping for required vs optional fields</li>
                        <li>• Test connection in Configuration tab</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">VIN Lookup Failures</h5>
                    <div className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
                      <p>Troubleshooting steps:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• Validate VIN format (17 characters, alphanumeric)</li>
                        <li>• Check NHTSA API availability</li>
                        <li>• Review VIN decode results in logs</li>
                        <li>• Consider manual vehicle data entry as fallback</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Getting Help</h5>
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      <p>If you need additional support:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• Check the Activity Logs for detailed error messages</li>
                        <li>• Use the Analytics & Operations page for system health</li>
                        <li>• Review the Transaction Logs for specific job failures</li>
                        <li>• Contact support with job ID and error details</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'changelog':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                System Changelog
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">

                {/* January 2026 */}
                <div className="border-l-4 border-cyan-500 pl-6">
                  <h4 className="font-semibold text-lg mb-3">January 2026</h4>

                  <div className="space-y-4">
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-cyan-800 dark:text-cyan-300">v2.3.0 - CRM & Navigation Overhaul</h5>
                        <Badge variant="outline" className="text-xs">January 30, 2026</Badge>
                      </div>
                      <ul className="text-sm text-cyan-700 dark:text-cyan-400 space-y-1">
                        <li>✓ URL-based tab routing for CRM (/admin/crm/:tab) - shareable, bookmarkable links</li>
                        <li>✓ Unified Contacts Directory with type filtering (Customers, Technicians, Distributors)</li>
                        <li>✓ New /api/contacts endpoint aggregating all contact types</li>
                        <li>✓ Technician-only status filters (Active/Pending/Inactive hidden for customers)</li>
                        <li>✓ URL-based routing for Settings page with deep links to documentation sections</li>
                        <li>✓ HD Interactive Coverage Map with Starlink-style state drill-down</li>
                        <li>✓ iOS-style messaging interface for technician communications</li>
                        <li>✓ Technician messaging panel with slide-out conversation view</li>
                      </ul>
                    </div>

                    <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-teal-800 dark:text-teal-300">v2.2.0 - Data Architecture</h5>
                        <Badge variant="outline" className="text-xs">January 28, 2026</Badge>
                      </div>
                      <ul className="text-sm text-teal-700 dark:text-teal-400 space-y-1">
                        <li>✓ Backend API for technicians (/api/technicians) with location filtering</li>
                        <li>✓ Backend API for contacts (/api/contacts) with unified interface</li>
                        <li>✓ Backend API for messages (/api/messages) with conversation threading</li>
                        <li>✓ Technician data generation across 165+ cities in 15 states</li>
                        <li>✓ Real-time technician status updates and activity logging</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* August 2025 */}
                <div className="border-l-4 border-blue-500 pl-6">
                  <h4 className="font-semibold text-lg mb-3">August 2025</h4>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-blue-800 dark:text-blue-300">v2.1.0 - Navigation Consolidation</h5>
                        <Badge variant="outline" className="text-xs">August 24, 2025</Badge>
                      </div>
                      <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                        <li>✓ Consolidated navigation from 7+ sections to 6 focused areas</li>
                        <li>✓ Merged Configuration and Documentation into unified Settings & Documentation</li>
                        <li>✓ Combined Analytics and Operations into single Analytics & Operations page</li>
                        <li>✓ Fixed routing issues and sidebar navigation synchronization</li>
                        <li>✓ Improved mobile responsiveness and text display</li>
                        <li>✓ Added interactive documentation with working Quick Links</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-green-800 dark:text-green-300">v2.0.5 - Documentation Enhancement</h5>
                        <Badge variant="outline" className="text-xs">August 24, 2025</Badge>
                      </div>
                      <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                        <li>✓ Implemented comprehensive Setup Guide with step-by-step instructions</li>
                        <li>✓ Added detailed Webhook Documentation with endpoint specifications</li>
                        <li>✓ Created Field Mapping Guide with transformation details</li>
                        <li>✓ Built interactive Troubleshooting Guide with common solutions</li>
                        <li>✓ Added this Changelog for tracking system updates</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* July 2025 */}
                <div className="border-l-4 border-purple-500 pl-6">
                  <h4 className="font-semibold text-lg mb-3">July 2025</h4>
                  
                  <div className="space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-purple-800 dark:text-purple-300">v2.0.0 - Major Integration Overhaul</h5>
                        <Badge variant="outline" className="text-xs">July 21, 2025</Badge>
                      </div>
                      <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                        <li>✓ Complete Squarespace to Omega EDI integration</li>
                        <li>✓ VIN lookup and vehicle identification system</li>
                        <li>✓ Real-time pricing integration with Square Appointments</li>
                        <li>✓ SMS notification system via Twilio</li>
                        <li>✓ Comprehensive error monitoring and retry logic</li>
                        <li>✓ Admin portal with role-based authentication</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-yellow-800 dark:text-yellow-300">v1.5.0 - Customer Portal</h5>
                        <Badge variant="outline" className="text-xs">July 20, 2025</Badge>
                      </div>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                        <li>✓ Customer-facing portal for service requests</li>
                        <li>✓ Real-time job status tracking</li>
                        <li>✓ Mobile-optimized interface</li>
                        <li>✓ Integration with payment processing</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Initial Release */}
                <div className="border-l-4 border-gray-500 pl-6">
                  <h4 className="font-semibold text-lg mb-3">Initial Release</h4>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-800 dark:text-gray-200">v1.0.0 - Foundation</h5>
                      <Badge variant="outline" className="text-xs">July 2025</Badge>
                    </div>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>✓ Basic webhook processing infrastructure</li>
                      <li>✓ Database schema and storage layer</li>
                      <li>✓ Authentication system</li>
                      <li>✓ Core admin interface</li>
                      <li>✓ Transaction logging and monitoring</li>
                    </ul>
                  </div>
                </div>

                {/* Upcoming Features */}
                <div className="border-l-4 border-orange-500 pl-6">
                  <h4 className="font-semibold text-lg mb-3">Planned Features</h4>
                  
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-orange-800 dark:text-orange-300">Upcoming Enhancements</h5>
                      <Badge variant="outline" className="text-xs">In Development</Badge>
                    </div>
                    <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
                      <li>→ Advanced analytics and reporting dashboard</li>
                      <li>→ Automated subcontractor bidding system</li>
                      <li>→ Enhanced SMS workflow automation</li>
                      <li>→ Calendar integration for appointment scheduling</li>
                      <li>→ Multi-location support</li>
                      <li>→ API rate limiting and optimization</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  The Express Auto Glass Integration Hub streamlines the auto glass service process
                  from customer inquiry to job completion through automated workflows and integrations.
                </p>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Key Features:</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Automated Squarespace form processing</li>
                    <li>• VIN lookup and vehicle identification</li>
                    <li>• Real-time Omega EDI job creation</li>
                    <li>• Square payment processing integration</li>
                    <li>• SMS notification system via Twilio</li>
                    <li>• Comprehensive error monitoring and retry logic</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <h5 className="font-medium">Form Submission</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Customer submits Squarespace form with vehicle details</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <h5 className="font-medium">Data Processing</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">System performs VIN lookup and validates information</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <h5 className="font-medium">Job Creation</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Creates job in Omega EDI with customer and vehicle data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <div>
                      <h5 className="font-medium">Quote & Payment</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Generates quote and creates Square payment link</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        );
    }
  };

  if (configLoading || mappingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SettingsIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings & Documentation</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure integrations and view system documentation</p>
        </div>
        <div className="flex items-center gap-2">
          {unsavedChanges && (
            <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
              Unsaved changes
            </Badge>
          )}
          <Button
            onClick={handleSaveConfig}
            disabled={saveConfigMutation.isPending || !unsavedChanges}
            className="flex items-center gap-2"
            data-testid="button-save-settings"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Integrations & Configuration
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        {/* Integrations & Configuration Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* System Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>System Environment</Label>
                  <Select defaultValue="production">
                    <SelectTrigger data-testid="select-environment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Default Service Location</Label>
                  <Input 
                    placeholder="San Diego"
                    defaultValue="San Diego"
                    onChange={() => setUnsavedChanges(true)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enable detailed logging</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Workflow Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Workflow Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Process Webhooks</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Automatically process incoming form submissions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Generate Calendar Invites</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Send calendar invitations for appointments</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label>Default Appointment Duration (minutes)</Label>
                  <Select defaultValue="60">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Retention (Days)</Label>
                  <Select defaultValue="90">
                    <SelectTrigger data-testid="select-retention">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-cleanup Failed Transactions</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Remove old failed attempts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 hover:text-red-700"
                  onClick={() => resetConfigMutation.mutate()}
                  disabled={resetConfigMutation.isPending}
                  data-testid="button-reset-config"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* API Endpoints & Security Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* API Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Omega EDI Base URL</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="https://api.omegaedi.com"
                      defaultValue={(configurations as any)?.find((c: any) => c.key === 'omega_api_base_url')?.value || ''}
                      onChange={() => setUnsavedChanges(true)}
                      data-testid="input-omega-url"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => testConnectionMutation.mutate('omega')}
                      disabled={testConnectionMutation.isPending}
                      data-testid="button-test-omega"
                    >
                      Test
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Square API Base URL</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="https://connect.squareup.com"
                      defaultValue={(configurations as any)?.find((c: any) => c.key === 'square_api_base_url')?.value || ''}
                      onChange={() => setUnsavedChanges(true)}
                      data-testid="input-square-url"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => testConnectionMutation.mutate('square')}
                      disabled={testConnectionMutation.isPending}
                      data-testid="button-test-square"
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & API Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show API Keys</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Toggle visibility of sensitive data</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowApiKeys(!showApiKeys)}
                    data-testid="button-toggle-keys"
                  >
                    {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Webhook Secret</Label>
                  <div className="flex gap-2">
                    <Input 
                      type={showApiKeys ? "text" : "password"}
                      placeholder="••••••••••••••••"
                      value={showApiKeys ? "wh_secret_12345" : "••••••••••••••••"}
                      readOnly
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard("wh_secret_12345")}
                      data-testid="button-copy-webhook"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
                  <p>API Keys are stored securely in Replit Secrets:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• OMEGA_EDI_API_KEY</li>
                    <li>• SQUARE_ACCESS_TOKEN</li>
                    <li>• TWILIO_ACCOUNT_SID</li>
                    <li>• TWILIO_AUTH_TOKEN</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integration Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Squarespace Integration */}
            <Card className="flex flex-col h-full">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <Globe className="w-5 h-5 flex-shrink-0" />
                  <span>Squarespace</span>
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Form submission processing and customer data capture</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Webhook URL:</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard('https://wheels-and-glass.vercel.app/api/webhook/squarespace')}
                      data-testid="button-copy-squarespace-webhook"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded block break-all overflow-wrap-anywhere">
                    https://wheels-and-glass.vercel.app/api/webhook/squarespace
                  </code>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1 flex-shrink-0" />
                  <span>Last sync: 2 minutes ago</span>
                </div>
              </CardContent>
            </Card>

            {/* Omega EDI Integration */}
            <Card className="flex flex-col h-full">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <Database className="w-5 h-5 flex-shrink-0" />
                  <span>Omega EDI</span>
                  <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Configurable</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Auto glass ERP system for job management</p>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">API Endpoint</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://api.omegaedi.com"
                        className="text-xs min-w-0 flex-1"
                        defaultValue="https://api.omegaedi.com"
                        onChange={() => setUnsavedChanges(true)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0"
                        onClick={() => testConnectionMutation.mutate('omega')}
                        disabled={testConnectionMutation.isPending}
                      >
                        Test
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div className="flex items-center gap-1 flex-wrap">API Status: <Badge variant="outline" className="text-xs">Testing Available</Badge></div>
                    <div className="text-xs break-all">API Key: Set via Secrets tab (OMEGA_EDI_API_KEY)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Square Integration */}
            <Card className="flex flex-col h-full">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span>Square</span>
                  <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Configurable</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Payment processing and appointment booking</p>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Application ID</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="sq0idp-..."
                        className="text-xs min-w-0 flex-1"
                        defaultValue="sq0idp-dwithtjE1eL606Y7sp2x7w"
                        onChange={() => setUnsavedChanges(true)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0"
                        onClick={() => testConnectionMutation.mutate('square')}
                        disabled={testConnectionMutation.isPending}
                      >
                        Test
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Booking Service ID</Label>
                    <Input
                      placeholder="Service ID from Square Dashboard"
                      className="text-xs"
                      defaultValue="b797361a-90ce-4a01-b7a7-7e1c050ad61c"
                      onChange={() => setUnsavedChanges(true)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Location ID</Label>
                    <Input
                      placeholder="Location ID from Square Dashboard"
                      className="text-xs"
                      defaultValue="E7GCF80WM2V05"
                      onChange={() => setUnsavedChanges(true)}
                    />
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div className="flex items-center gap-1 flex-wrap">API Status: <Badge variant="outline" className="text-xs">Testing Available</Badge></div>
                    <div className="text-xs">Access Token: Set via Secrets tab</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Twilio Integration */}
            <Card className="flex flex-col h-full">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span>Twilio</span>
                  <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Configurable</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">SMS notifications and communication</p>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Phone Number</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="+1234567890"
                        className="text-xs min-w-0 flex-1"
                        defaultValue="+15551234567"
                        onChange={() => setUnsavedChanges(true)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0"
                        onClick={() => testConnectionMutation.mutate('twilio')}
                        disabled={testConnectionMutation.isPending}
                      >
                        Test
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div className="flex items-center gap-1 flex-wrap">SMS Status: <Badge variant="outline" className="text-xs">Testing Available</Badge></div>
                    <div className="text-xs">Account SID & Auth Token: Set via Secrets tab</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Reference Section */}
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">API Reference & Testing</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Webhook Endpoints */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="w-5 h-5" />
                    Webhook Endpoints
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">POST</Badge>
                        <code className="text-sm">/api/webhook/squarespace</code>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receives Squarespace form submissions</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">POST</Badge>
                        <code className="text-sm">/api/webhook/square</code>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Handles Square payment notifications</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">POST</Badge>
                        <code className="text-sm">/api/webhook/twilio</code>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Processes inbound SMS messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* API Examples */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Sample Request
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Squarespace Form Webhook:</p>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`{
  "customerName": "John Smith",
  "customerPhone": "+1-555-123-4567",
  "customerEmail": "john@example.com",
  "vehicleYear": "2023",
  "vehicleMake": "Toyota", 
  "vehicleModel": "Camry",
  "vehicleVin": "1NXBR32E25Z123456",
  "serviceType": "Glass Replacement",
  "location": "Los Angeles, CA",
  "notes": "Front windshield needs replacement"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Retry Configuration Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Retry Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Retry Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    Retry Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Maximum Retry Attempts</Label>
                    <Select defaultValue="3">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 attempt</SelectItem>
                        <SelectItem value="2">2 attempts</SelectItem>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Base Retry Delay</Label>
                    <Select defaultValue="1000">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500">500ms</SelectItem>
                        <SelectItem value="1000">1 second</SelectItem>
                        <SelectItem value="2000">2 seconds</SelectItem>
                        <SelectItem value="5000">5 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="exponential-backoff" defaultChecked />
                    <Label htmlFor="exponential-backoff">Enable Exponential Backoff</Label>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <p><strong>Exponential Backoff:</strong> Increases delay between retries (1s, 2s, 4s, 8s) to avoid overwhelming failed services.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Service-Specific Retry Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    Service-Specific Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Omega EDI
                      </Label>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Square Payments
                      </Label>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        VIN Lookup
                      </Label>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        NAGS Parts
                      </Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <Button 
                      onClick={() => {
                        setUnsavedChanges(true);
                        copyToClipboard("Retry configuration saved");
                      }} 
                      className="w-full"
                      data-testid="button-save-retry-config"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Retry Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Button
                    variant={selectedDoc === 'system-overview' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleDocSelect('system-overview')}
                    data-testid="link-system-overview"
                  >
                    <Book className="w-4 h-4 mr-2" />
                    System Overview
                  </Button>
                  <Button
                    variant={selectedDoc === 'setup-guide' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleDocSelect('setup-guide')}
                    data-testid="link-setup-guide"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Setup Guide
                  </Button>
                  <Button
                    variant={selectedDoc === 'webhook-docs' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleDocSelect('webhook-docs')}
                    data-testid="link-webhook-docs"
                  >
                    <Webhook className="w-4 h-4 mr-2" />
                    Webhook Documentation
                  </Button>
                  <Button
                    variant={selectedDoc === 'field-mapping' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleDocSelect('field-mapping')}
                    data-testid="link-field-mapping"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Field Mapping Guide
                  </Button>
                  <Button
                    variant={selectedDoc === 'troubleshooting' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleDocSelect('troubleshooting')}
                    data-testid="link-troubleshooting"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Troubleshooting
                  </Button>
                  <Button
                    variant={selectedDoc === 'changelog' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleDocSelect('changelog')}
                    data-testid="link-changelog"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Changelog
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Documentation Content */}
            <div className="lg:col-span-2 space-y-6">
              {renderDocumentationContent()}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}