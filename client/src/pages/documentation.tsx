import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Book, 
  FileText, 
  Code, 
  Globe, 
  Settings, 
  Database,
  MessageSquare,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Documentation() {
  const { toast } = useToast();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
    });
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Documentation</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive guides and API documentation for Wheels and Glass integration platform
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Wheels and Glass integration platform streamlines the auto glass replacement process from customer inquiry to job completion.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Core Features</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Squarespace form integration</li>
                    <li>• Omega EDI job creation</li>
                    <li>• VIN lookup & validation</li>
                    <li>• NAGS parts matching</li>
                    <li>• Square payment integration</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Data Flow</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Form submission → Webhook</li>
                    <li>• Field mapping & validation</li>
                    <li>• Omega EDI job creation</li>
                    <li>• Quote generation</li>
                    <li>• Payment link creation</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Communication</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• SMS messaging via Twilio</li>
                    <li>• Calendar invitations</li>
                    <li>• Appointment rescheduling</li>
                    <li>• Customer notifications</li>
                    <li>• Subcontractor coordination</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Architecture Diagram</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <div className="text-center text-gray-600">
                  <Code className="w-12 h-12 mx-auto mb-4" />
                  <p>Interactive architecture diagram coming soon</p>
                  <p className="text-sm mt-2">Shows data flow between Squarespace, Omega EDI, Square, and communication channels</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Initial Setup Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">1. Squarespace Configuration</h3>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Form Setup</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Create form with required fields (name, email, phone, vehicle details)</li>
                    <li>• Configure form submission webhook to point to this platform</li>
                    <li>• Test form submission and verify webhook delivery</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Webhook URL</h4>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white dark:bg-gray-800 rounded text-sm">
                      https://your-domain.com/api/webhook/squarespace
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard('https://your-domain.com/api/webhook/squarespace', 'Webhook URL')}
                    >
                      {copiedText === 'Webhook URL' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">2. Omega EDI Integration</h3>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">API Configuration</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Obtain Omega EDI API credentials</li>
                    <li>• Configure API endpoints in Settings → Integration</li>
                    <li>• Set up field mappings for job creation</li>
                    <li>• Test job creation with sample data</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">3. Payment Integration</h3>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Square Setup</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Create Square developer account</li>
                    <li>• Generate API keys (sandbox and production)</li>
                    <li>• Configure payment link generation</li>
                    <li>• Set up appointment booking integration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                API Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Webhook Endpoints</h3>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">POST</Badge>
                    <code className="text-sm">/api/webhook/squarespace</code>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Receives form submissions from Squarespace and processes them for Omega EDI integration
                  </p>
                  
                  <h4 className="font-medium mb-2">Request Body Example:</h4>
                  <div className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                    <pre>{`{
  "first-name": "John",
  "last-name": "Doe", 
  "email": "john@example.com",
  "mobile-phone": "555-0123",
  "location": "California | San Diego",
  "year": "2020",
  "make": "Toyota",
  "model": "Camry",
  "vin": "1HGBH41JXMN109186",
  "service-type": "Windshield Replacement"
}`}</pre>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">GET</Badge>
                    <code className="text-sm">/api/transactions</code>
                  </div>
                  <p className="text-sm text-gray-600">
                    Retrieves transaction history and processing status
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">GET</Badge>
                    <code className="text-sm">/api/dashboard/stats</code>
                  </div>
                  <p className="text-sm text-gray-600">
                    Returns dashboard statistics and system health metrics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Webhook Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold mb-2">Webhook Security</h3>
                <ul className="text-sm space-y-1">
                  <li>• All webhooks use HTTPS encryption</li>
                  <li>• Request signatures are verified</li>
                  <li>• Rate limiting is enforced</li>
                  <li>• Duplicate submissions are detected</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Supported Webhook Sources</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Squarespace Forms</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Direct integration with Squarespace form submissions
                    </p>
                    <Badge variant="outline">Primary Source</Badge>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Zapier Integration</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Alternative webhook delivery via Zapier automation
                    </p>
                    <Badge variant="outline">Optional</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Webhook Testing</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Use these tools to test webhook integration:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Test with Postman
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Test with curl
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Webhook.site Testing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Common Issues & Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Webhook Issues</h3>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-red-600 mb-2">❌ Webhook Not Receiving Data</h4>
                  <ul className="text-sm space-y-1 mb-3">
                    <li>• Check Squarespace form action URL</li>
                    <li>• Verify webhook endpoint is accessible</li>
                    <li>• Review firewall and security settings</li>
                    <li>• Check activity logs for failed requests</li>
                  </ul>
                  <Badge variant="destructive">High Priority</Badge>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-yellow-600 mb-2">⚠️ Field Mapping Errors</h4>
                  <ul className="text-sm space-y-1 mb-3">
                    <li>• Verify field names match Squarespace form</li>
                    <li>• Check required field mappings</li>
                    <li>• Review data transformation rules</li>
                    <li>• Test with sample data</li>
                  </ul>
                  <Badge variant="secondary">Medium Priority</Badge>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-green-600 mb-2">✅ Omega EDI Connection Issues</h4>
                  <ul className="text-sm space-y-1 mb-3">
                    <li>• Verify API credentials are correct</li>
                    <li>• Check API endpoint URLs</li>
                    <li>• Review rate limiting settings</li>
                    <li>• Test connection in Settings</li>
                  </ul>
                  <Badge variant="outline">Low Priority</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Debug Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Activity Logs</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      View detailed logs of all webhook processing
                    </p>
                    <Button size="sm" variant="outline">View Logs</Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Connection Testing</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Test API connections and verify credentials
                    </p>
                    <Button size="sm" variant="outline">Test Connections</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changelog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Version History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">v2.1.0</h3>
                    <Badge>Current</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">August 24, 2025</p>
                  <ul className="text-sm space-y-1">
                    <li>• Complete branding transformation to Wheels and Glass</li>
                    <li>• Enhanced quote form functionality with backend integration</li>
                    <li>• Added comprehensive analytics dashboard</li>
                    <li>• Fixed mobile responsiveness issues</li>
                    <li>• Improved zip code auto-detection</li>
                  </ul>
                </div>

                <div className="border-l-4 border-gray-300 pl-4">
                  <h3 className="font-semibold mb-2">v2.0.0</h3>
                  <p className="text-sm text-gray-600 mb-2">July 21, 2025</p>
                  <ul className="text-sm space-y-1">
                    <li>• Complete system architecture overhaul</li>
                    <li>• Added CRM functionality</li>
                    <li>• Implemented Twilio Flex integration</li>
                    <li>• Enhanced Omega EDI integration</li>
                    <li>• Added comprehensive error monitoring</li>
                  </ul>
                </div>

                <div className="border-l-4 border-gray-300 pl-4">
                  <h3 className="font-semibold mb-2">v1.5.0</h3>
                  <p className="text-sm text-gray-600 mb-2">July 20, 2025</p>
                  <ul className="text-sm space-y-1">
                    <li>• Initial Squarespace to Omega EDI integration</li>
                    <li>• Basic webhook processing</li>
                    <li>• Field mapping configuration</li>
                    <li>• Admin dashboard implementation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}