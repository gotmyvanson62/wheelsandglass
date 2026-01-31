import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ConfigurationPanelProps {
  onEditMapping?: () => void;
  onTestConnection?: () => void;
}

export function ConfigurationPanel({ onEditMapping, onTestConnection }: ConfigurationPanelProps) {
  const { toast } = useToast();
  
  const { data: configurations } = useQuery({
    queryKey: ['/api/configurations'],
  });

  const { data: fieldMappings } = useQuery({
    queryKey: ['/api/field-mappings'],
  });

  const webhookEndpoint = Array.isArray(configurations) 
    ? configurations.find((c: any) => c.key === 'webhook_endpoint')?.value || '/api/webhooks/squarespace'
    : '/api/webhooks/squarespace';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullWebhookUrl = `${baseUrl}${webhookEndpoint}`;

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

  const sampleMappings = Array.isArray(fieldMappings) ? fieldMappings.slice(0, 3) : [];

  return (
    <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">Integration Configuration</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">Manage your Squarespace and Omega EDI connections</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Zapier Configuration */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Zapier Webhook Endpoint</h4>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400">
              Active
            </Badge>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <code className="text-sm text-gray-700 dark:text-gray-300 font-mono break-all flex-1">
                {fullWebhookUrl}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyWebhookUrl}
                className="ml-2 text-primary hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Copy
              </Button>
            </div>
          </div>
        </div>

        {/* Omega EDI API Configuration */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Omega EDI API</h4>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400">
              Connected
            </Badge>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base URL</label>
              <Input
                value="https://app.omegaedi.com/api/2.0/"
                readOnly
                className="bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key Status</label>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Environment variable configured</span>
                {onTestConnection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onTestConnection}
                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Test Connection
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Field Mapping */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Field Mapping Configuration</h4>
          <div className="space-y-2">
            {sampleMappings.map((mapping: any) => (
              <div key={mapping.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900 rounded border dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {mapping.squarespaceField.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{mapping.omegaField}</span>
              </div>
            ))}
          </div>
          {onEditMapping && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditMapping}
              className="mt-3 text-primary hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Edit Mapping Rules
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
