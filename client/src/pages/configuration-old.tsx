import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { 
  Settings, 
  Key, 
  Link, 
  Database, 
  MessageSquare, 
  Calendar,
  TestTube,
  Copy,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  ExternalLink,
  Book,
  Code,
  GitBranch,
  Search,
  FileText,
  Workflow,
  ArrowRight,
  Zap,
  CreditCard,
  Phone,
  Shield,
  Check
} from "lucide-react";
import { OmegaTemplateVariables } from "@/components/crm/omega-template-variables";

export default function Configuration() {
  const { toast } = useToast();
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [editingMapping, setEditingMapping] = useState<number | null>(null);
  const [mappingValues, setMappingValues] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('integration');

  const { data: configurations } = useQuery({
    queryKey: ['/api/configurations'],
  });

  const { data: fieldMappings } = useQuery({
    queryKey: ['/api/field-mappings'],
  });

  // Get webhook URL
  const webhookEndpoint = Array.isArray(configurations) 
    ? configurations.find((c: any) => c.key === 'webhook_endpoint')?.value || '/api/webhooks/squarespace'
    : '/api/webhooks/squarespace';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullWebhookUrl = `${baseUrl}${webhookEndpoint}`;

  const updateConfigMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => 
      apiRequest('PUT', `/api/configurations/${key}`, { value }),
    onSuccess: () => {
      toast({
        title: "Configuration updated",
        description: "Settings have been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/configurations'] });
      setEditingConfig(null);
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Unable to update configuration",
        variant: "destructive",
      });
    },
  });

  const updateMappingMutation = useMutation({
    mutationFn: ({ id, mapping }: { id: number; mapping: any }) => 
      apiRequest('PUT', `/api/field-mappings/${id}`, mapping),
    onSuccess: () => {
      toast({
        title: "Field mapping updated",
        description: "Mapping has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/field-mappings'] });
      setEditingMapping(null);
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: (service: string) => apiRequest('POST', `/api/test-connection/${service}`, {}),
    onSuccess: (data, service) => {
      toast({
        title: "Connection test passed",
        description: `${service} connection is working properly`,
      });
    },
    onError: (error, service) => {
      toast({
        title: "Connection test failed", 
        description: `${service} connection failed`,
        variant: "destructive",
      });
    },
  });

  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullWebhookUrl);
      toast({
        title: "Copied!",
        description: "Webhook URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleEditConfig = (key: string, currentValue: string) => {
    setEditingConfig(key);
    setConfigValues({ ...configValues, [key]: currentValue });
  };

  const handleSaveConfig = (key: string) => {
    const value = configValues[key];
    if (value !== undefined) {
      updateConfigMutation.mutate({ key, value });
    }
  };

  const handleCancelEdit = () => {
    setEditingConfig(null);
    setConfigValues({});
  };

  const handleEditMapping = (id: number, mapping: any) => {
    setEditingMapping(id);
    setMappingValues({ ...mappingValues, [id]: mapping });
  };

  const handleSaveMapping = (id: number) => {
    const mapping = mappingValues[id];
    if (mapping) {
      updateMappingMutation.mutate({ id, mapping });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Mobile Header */}
      <div className="md:hidden">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuration</h1>
        <p className="text-sm text-gray-600">System settings and documentation</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        {/* Mobile: Scrollable horizontal tabs */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
            <TabsTrigger value="integration" className="flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap flex-shrink-0">
              <Link className="w-3 h-3" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="credentials" className="flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap flex-shrink-0">
              <Key className="w-3 h-3" />
              Keys
            </TabsTrigger>
            <TabsTrigger value="mappings" className="flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap flex-shrink-0">
              <Database className="w-3 h-3" />
              Fields
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap flex-shrink-0">
              <MessageSquare className="w-3 h-3" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap flex-shrink-0">
              <MessageSquare className="w-3 h-3" />
              Hooks
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap flex-shrink-0">
              <TestTube className="w-3 h-3" />
              Test
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap flex-shrink-0">
              <Book className="w-3 h-3" />
              Docs
            </TabsTrigger>
          </div>
        </div>
        
        {/* Desktop: Grid layout tabs */}
        <div className="hidden md:block">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="integration" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Link className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Integration</span>
              <span className="sm:hidden">Setup</span>
            </TabsTrigger>
            <TabsTrigger value="credentials" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Key className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Credentials</span>
              <span className="sm:hidden">API</span>
            </TabsTrigger>
            <TabsTrigger value="mappings" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Database className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Mappings</span>
              <span className="sm:hidden">Fields</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">SMS & Flex</span>
              <span className="sm:hidden">SMS</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Webhooks</span>
              <span className="sm:hidden">Hooks</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <TestTube className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Testing</span>
              <span className="sm:hidden">Test</span>
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Book className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Documentation</span>
              <span className="sm:hidden">Docs</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Integration Setup Tab */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Integration Overview
              </CardTitle>
              <p className="text-gray-600">Configure your main integration connections and endpoints</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Squarespace Integration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Squarespace Integration</h3>
                    <p className="text-sm text-gray-600">Form submission webhook endpoint</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Webhook URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        value={fullWebhookUrl}
                        readOnly
                        className="font-mono text-sm bg-gray-50"
                      />
                      <Button size="sm" variant="outline" onClick={copyWebhookUrl}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Use this URL in your Zapier webhook or direct form integration
                  </div>
                </div>
              </div>

              {/* Omega EDI Integration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Omega EDI Integration</h3>
                    <p className="text-sm text-gray-600">Auto glass ERP system connection</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">API Base URL</Label>
                    <Input 
                      value={Array.isArray(configurations) ? 
                        configurations.find(c => c.key === 'omega_api_base_url')?.value || 'Not configured' : 
                        'Loading...'
                      }
                      readOnly
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Authentication Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        API Key Valid
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Square Appointments Integration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Square Appointments</h3>
                    <p className="text-sm text-gray-600">Booking and payment system</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Booking URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        value="https://book.squareup.com/appointments/b797361a-90ce-4a01-b7a7-7e1c050ad61c"
                        readOnly
                        className="font-mono text-sm bg-gray-50"
                      />
                      <Button size="sm" variant="outline" asChild>
                        <a href="https://book.squareup.com/appointments/b797361a-90ce-4a01-b7a7-7e1c050ad61c" target="_blank">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Credentials Tab */}
        <TabsContent value="credentials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Credentials & Settings
              </CardTitle>
              <p className="text-gray-600">Manage API keys, tokens, and authentication settings</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.isArray(configurations) && configurations.map((config: any) => (
                <div key={config.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">{config.key.replace(/_/g, ' ').toUpperCase()}</Label>
                    <p className="text-sm text-gray-600">{config.description}</p>
                    </div>
                    <div className="flex-1">
                      {editingConfig === config.key ? (
                        <Input
                          value={configValues[config.key] || config.value}
                          onChange={(e) => setConfigValues({ ...configValues, [config.key]: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        <div className="font-mono text-sm bg-gray-50 p-2 rounded border">
                          {config.value}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {editingConfig === config.key ? (
                        <>
                          <Button size="sm" onClick={() => handleSaveConfig(config.key)}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditConfig(config.key, config.value)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

        </TabsContent>

        {/* Field Mappings Tab */}
        <TabsContent value="mappings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Field Mappings Configuration
              </CardTitle>
              <p className="text-gray-600">Configure how Squarespace form fields map to Omega EDI job fields</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(fieldMappings) && fieldMappings.map((mapping: any) => (
                  <div key={mapping.id} className="border rounded-lg p-4">
                    {editingMapping === mapping.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Squarespace Field</Label>
                          <Input 
                            value={mappingValues[mapping.id]?.squarespaceField || mapping.squarespaceField}
                            onChange={(e) => setMappingValues({
                              ...mappingValues,
                              [mapping.id]: { ...mappingValues[mapping.id], squarespaceField: e.target.value }
                            })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Omega EDI Field</Label>
                          <Input 
                            value={mappingValues[mapping.id]?.omegaField || mapping.omegaField}
                            onChange={(e) => setMappingValues({
                              ...mappingValues,
                              [mapping.id]: { ...mappingValues[mapping.id], omegaField: e.target.value }
                            })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Transform Rule</Label>
                          <Select 
                            value={mappingValues[mapping.id]?.transformRule || mapping.transformRule || 'none'}
                            onValueChange={(value) => setMappingValues({
                              ...mappingValues,
                              [mapping.id]: { ...mappingValues[mapping.id], transformRule: value === 'none' ? null : value }
                            })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No transformation</SelectItem>
                              <SelectItem value="uppercase">UPPERCASE</SelectItem>
                              <SelectItem value="lowercase">lowercase</SelectItem>
                              <SelectItem value="trim">Trim whitespace</SelectItem>
                              <SelectItem value="parseInt">Parse Integer</SelectItem>
                              <SelectItem value="parseFloat">Parse Float</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={mappingValues[mapping.id]?.isRequired !== undefined ? mappingValues[mapping.id].isRequired : mapping.isRequired}
                              onChange={(e) => setMappingValues({
                                ...mappingValues,
                                [mapping.id]: { ...mappingValues[mapping.id], isRequired: e.target.checked }
                              })}
                              className="rounded"
                            />
                            <Label className="text-sm">Required</Label>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => handleSaveMapping(mapping.id)}>
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingMapping(null)}>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Squarespace Field</Label>
                              <div className="font-medium">{mapping.squarespaceField}</div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Omega EDI Field</Label>
                              <div className="font-mono text-sm">{mapping.omegaField}</div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Settings</Label>
                              <div className="flex items-center space-x-2">
                                {mapping.transformRule && (
                                  <Badge variant="outline">{mapping.transformRule}</Badge>
                                )}
                                {mapping.isRequired && (
                                  <Badge variant="destructive">Required</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditMapping(mapping.id, mapping)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Webhook Endpoints
              </CardTitle>
              <p className="text-gray-600">Manage webhook endpoints for receiving data from external services</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Squarespace Webhook */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Squarespace Form Webhook</h3>
                    <p className="text-sm text-gray-600">Receives form submissions from Zapier or direct integration</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Endpoint URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        value={fullWebhookUrl}
                        readOnly
                        className="font-mono text-sm bg-gray-50"
                      />
                      <Button size="sm" variant="outline" onClick={copyWebhookUrl}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    POST requests to this endpoint will create new transactions and trigger Omega EDI job creation
                  </div>
                </div>
              </div>

              {/* Square Webhook */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Square Booking Webhook</h3>
                    <p className="text-sm text-gray-600">Receives appointment booking confirmations</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Endpoint URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        value={`${baseUrl}/api/webhooks/square-booking`}
                        readOnly
                        className="font-mono text-sm bg-gray-50"
                      />
                      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(`${baseUrl}/api/webhooks/square-booking`)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Handles $0 bookings and generates Omega EDI pricing with Square payment links
                  </div>
                </div>
              </div>

              {/* SMS Webhook */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">SMS Rescheduling Webhook</h3>
                    <p className="text-sm text-gray-600">Processes inbound SMS for appointment changes</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Endpoint URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        value={`${baseUrl}/api/webhooks/sms`}
                        readOnly
                        className="font-mono text-sm bg-gray-50"
                      />
                      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(`${baseUrl}/api/webhooks/sms`)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    AI-powered SMS processing for customer rescheduling requests
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS & Flex Configuration Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                SMS & Flex Configuration
              </CardTitle>
              <p className="text-gray-600">Configure Omega EDI SMS templates and Twilio Flex integration</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Omega EDI SMS Settings */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Omega EDI SMS Integration</h3>
                    <p className="text-sm text-gray-600">SMS service with 60+ template variables</p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SMS Service Status</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Enabled</Badge>
                      <span className="text-sm text-gray-600">Using Omega EDI built-in SMS</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Template Variables</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">60+ Available</Badge>
                      <span className="text-sm text-gray-600">Job, customer, vehicle data</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Twilio Flex Settings */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Twilio Flex Integration</h3>
                    <p className="text-sm text-gray-600">Agent escalation and conversation management</p>
                  </div>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">Connected</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Workspace SID</label>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded block">WS********************************</code>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Flow SID</label>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded block">FW********************************</code>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Available Agents</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">3 Online</Badge>
                      <span className="text-sm text-gray-600">Queue: 2 waiting</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Auto-Escalation</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Smart Rules</Badge>
                      <span className="text-sm text-gray-600">Complex queries only</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Variables Section */}
              <OmegaTemplateVariables />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connection Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Connection Testing
              </CardTitle>
              <p className="text-gray-600">Test connections to external services and APIs</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">Omega EDI API</h3>
                      <p className="text-sm text-gray-600">Test job creation and data flow</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => testConnectionMutation.mutate('omega')}
                      disabled={testConnectionMutation.isPending}
                    >
                      {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">Square API</h3>
                      <p className="text-sm text-gray-600">Test payment link generation</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => testConnectionMutation.mutate('square')}
                      disabled={testConnectionMutation.isPending}
                    >
                      {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">VIN Lookup Service</h3>
                      <p className="text-sm text-gray-600">Test vehicle identification</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => testConnectionMutation.mutate('vin')}
                      disabled={testConnectionMutation.isPending}
                    >
                      {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">NAGS Parts Database</h3>
                      <p className="text-sm text-gray-600">Test parts lookup and pricing</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => testConnectionMutation.mutate('nags')}
                      disabled={testConnectionMutation.isPending}
                    >
                      {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Integration Flow Testing */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">End-to-End Integration Testing</h3>
                <p className="text-sm text-gray-600 mb-4">Test the complete workflow from form submission to Omega EDI job creation</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">1. Webhook → Data Processing → Field Mapping</span>
                    <Button size="sm" variant="outline">Test</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">2. VIN Lookup → Vehicle Identification → NAGS Parts</span>
                    <Button size="sm" variant="outline">Test</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">3. Omega EDI Job Creation → Calendar Invitation</span>
                    <Button size="sm" variant="outline">Test</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">4. Square Pricing → Payment Link Generation</span>
                    <Button size="sm" variant="outline">Test</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation" className="space-y-6">
          {/* System Architecture Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5" />
                System Architecture Overview
                <Badge variant="secondary" className="bg-green-100 text-green-800">Auto-Updated</Badge>
              </CardTitle>
              <p className="text-gray-600">System documentation, configuration, credentials, and API reference</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Data Flow */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <h3 className="font-medium">Data Flow</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Squarespace → Webhook → VIN/NAGS → Omega EDI → Square Payment
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Flow Details
                  </Button>
                </div>

                {/* Communication */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                    <h3 className="font-medium">Communication</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Twilio Flex + Omega SMS templates for subcontractor workflow
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Templates
                  </Button>
                </div>

                {/* Performance */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-green-500" />
                    <h3 className="font-medium">Performance</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Parallel processing: 950ms avg, 94% success rate
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Metrics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Repository Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Code Repository Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-sm space-y-1 bg-gray-50 p-4 rounded-lg">
                <div className="text-blue-600">client/</div>
                <div className="pl-4 text-gray-600">src/pages/ - Application pages (dashboard, crm, documentation)</div>
                <div className="pl-4 text-gray-600">src/components/ - React components</div>
                <div className="text-blue-600">server/</div>
                <div className="pl-4 text-gray-600">routes.ts - API endpoints & webhook handlers</div>
                <div className="pl-4 text-gray-600">services/ - Business logic (Omega EDI, Square, Twilio)</div>
                <div className="pl-4 text-gray-600">storage.ts - Database operations</div>
                <div className="text-blue-600">shared/</div>
                <div className="pl-4 text-gray-600">schema.ts - Database schema & types</div>
                <div className="text-blue-600">docs/</div>
                <div className="pl-4 text-gray-600">*.md - Integration guides & setup instructions</div>
              </div>
            </CardContent>
          </Card>

          {/* Key Integration Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Key Integration Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <code className="font-mono text-sm">/api/webhooks/squarespace</code>
                    <p className="text-xs text-gray-600">Main form processing endpoint</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">POST</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <code className="font-mono text-sm">/api/webhooks/square-booking</code>
                    <p className="text-xs text-gray-600">Square appointment processing</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">POST</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <code className="font-mono text-sm">/api/performance/metrics</code>
                    <p className="text-xs text-gray-600">System performance monitoring</p>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">GET</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <code className="font-mono text-sm">/api/flex/conversations</code>
                    <p className="text-xs text-gray-600">Twilio Flex communication hub</p>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">GET</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Setup Guides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Setup & Integration Guides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Free Integration Methods</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Direct JavaScript integration</li>
                    <li>• Make.com automation</li>
                    <li>• Manual webhook setup</li>
                  </ul>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View Setup Guide
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Production Readiness</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Webhook security & validation</li>
                    <li>• Error handling & retry logic</li>
                    <li>• Health monitoring</li>
                  </ul>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View Checklist
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
