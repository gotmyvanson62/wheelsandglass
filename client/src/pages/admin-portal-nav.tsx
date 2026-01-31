import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Shield, Database, Bell, BarChart3 } from 'lucide-react';

export default function AdminPortalNav() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Wheels and Glass - Integration Platform</h1>
          <p className="text-gray-600 mb-6">
            Squarespace to Omega EDI Integration Hub
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Admin Dashboard */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Admin Portal Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Access the admin dashboard for integration monitoring and real-time notifications.
              </p>
              <Button 
                asChild 
                className="w-full"
              >
                <a href="/admin/login">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Access Admin Dashboard
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Direct Dashboard */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Direct Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Access the main dashboard with CRM, Operations, Analytics, and Documentation sections.
              </p>
              <Button 
                asChild 
                variant="outline"
                className="w-full"
              >
                <a href="/admin/dashboard">
                  <Database className="w-4 h-4 mr-2" />
                  Main Dashboard
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Notification Test */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Notification System Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Simple test page to verify routing and components work correctly.
              </p>
              <Button 
                asChild 
                variant="outline"
                className="w-full"
              >
                <a href="/admin/test-simple">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Components
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Check system health and integration status for monitoring.
              </p>
              <Button 
                asChild 
                variant="outline"
                className="w-full"
              >
                <a href="/health" target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Health Status
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">System Overview</h3>
              <p className="text-gray-600 text-sm">
                This platform manages the integration between Squarespace form submissions and Omega EDI 
                for Wheels and Glass business operations. It includes real-time failure monitoring, 
                WebSocket notifications, and comprehensive transaction tracking.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}