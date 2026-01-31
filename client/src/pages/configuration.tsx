import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  TestTube,
  Copy,
  Edit,
  Save,
  X,
  ExternalLink,
  Book,
  Workflow
} from "lucide-react";

export default function Configuration() {
  const { toast } = useToast();
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

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
  });

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(fullWebhookUrl);
    toast({
      title: "Copied to clipboard",
      description: "Webhook URL has been copied",
    });
  };

  const handleEditConfig = (key: string, value: string) => {
    setEditingConfig(key);
    setConfigValues({ ...configValues, [key]: value });
  };

  const handleSaveConfig = (key: string) => {
    updateConfigMutation.mutate({ key, value: configValues[key] });
  };

  const handleCancelEdit = () => {
    setEditingConfig(null);
    setConfigValues({});
  };

  return (
    <div className="space-y-4 lg:space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Configuration</h1>
        <p className="text-gray-600">Manage system settings, integrations, and API configurations</p>
      </div>

      <Tabs defaultValue="integration">
        <div className="mb-6">
          {/* Mobile: Dropdown-style selector */}
          <div className="md:hidden">
            <TabsList className="grid grid-cols-2 gap-1">
              <TabsTrigger value="integration" className="flex items-center gap-1 text-xs">
                <Link className="w-3 h-3" />
                Setup
              </TabsTrigger>
              <TabsTrigger value="credentials" className="flex items-center gap-1 text-xs">
                <Key className="w-3 h-3" />
                Keys
              </TabsTrigger>
            </TabsList>
            <TabsList className="grid grid-cols-2 gap-1 mt-1">
              <TabsTrigger value="mappings" className="flex items-center gap-1 text-xs">
                <Database className="w-3 h-3" />
                Fields
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center gap-1 text-xs">
                <TestTube className="w-3 h-3" />
                Test
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Desktop: Single row tabs */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="integration" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Integration
              </TabsTrigger>
              <TabsTrigger value="credentials" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Credentials
              </TabsTrigger>
              <TabsTrigger value="mappings" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Mappings
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Testing
              </TabsTrigger>
            </TabsList>
          </div>
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
                </div>
              </div>

              {/* Omega EDI Integration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Omega EDI Integration</h3>
                    <p className="text-sm text-gray-600">Auto glass ERP system connection</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>

              {/* Square Integration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Square Integration</h3>
                    <p className="text-sm text-gray-600">Payment processing and appointments</p>
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
                  <div key={mapping.id} className="border rounded-lg p-3 lg:p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 lg:gap-4">
                      <div>
                        <Label className="text-sm font-medium">Squarespace Field</Label>
                        <div className="font-mono text-sm bg-gray-50 p-2 rounded border mt-1">
                          {mapping.squarespaceField}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Omega EDI Field</Label>
                        <div className="font-mono text-sm bg-gray-50 p-2 rounded border mt-1">
                          {mapping.omegaField}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Transform Rule</Label>
                        <div className="text-sm bg-gray-50 p-2 rounded border mt-1">
                          {mapping.transformRule || 'None'}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Label className="text-sm font-medium">Required</Label>
                        <Badge variant={mapping.isRequired ? "default" : "secondary"} className="ml-2">
                          {mapping.isRequired ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                System Testing
              </CardTitle>
              <p className="text-gray-600">Test integrations and system functionality</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Test Squarespace Webhook
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Test Omega EDI Connection
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Test Square Integration
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Test VIN Lookup Service
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}