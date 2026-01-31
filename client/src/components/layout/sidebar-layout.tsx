import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import {
  Activity,
  MessageSquare,
  Shield,
  Settings,
  FileText,
  Database,
  AlertTriangle,
  Book,
  Menu,
  X,
  BarChart3,
  Car,
  Calendar,
  Users,
  Package,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  
  // Check if mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for sidebar close events from dialogs
  React.useEffect(() => {
    const handleCloseSidebar = () => {
      setIsSidebarOpen(false);
    };
    
    window.addEventListener('closeSidebar', handleCloseSidebar);
    return () => window.removeEventListener('closeSidebar', handleCloseSidebar);
  }, []);

  const navigation = [
    {
      name: 'Dashboard',
      mobileShort: 'Home',
      href: '/admin/dashboard',
      icon: Activity,
      description: 'Overview & Monitoring'
    },
    {
      name: 'CRM & Communication',
      mobileShort: 'CRM',
      href: '/admin/crm',
      icon: MessageSquare,
      description: 'Customer Management'
    },
    {
      name: 'Analytics & Operations',
      mobileShort: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Analytics & System Operations'
    },
    {
      name: 'Transaction Logs',
      mobileShort: 'Logs',
      href: '/admin/transaction-logs',
      icon: FileText,
      description: 'Transaction History'
    },
    {
      name: 'Settings & Documentation',
      mobileShort: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'Configuration & Docs'
    },
    {
      name: 'User Management',
      mobileShort: 'Users',
      href: '/admin/users',
      icon: Shield,
      description: 'Admin Users & Settings'
    }
  ];

  // TODO: Connect to /api/dashboard/stats for real data
  const quickStats = [
    { label: 'Active Jobs', value: '0', color: 'bg-blue-500' },
    { label: 'Pending', value: '0', color: 'bg-yellow-500' },
    { label: 'Completed Today', value: '0', color: 'bg-green-500' }
  ];

  // On mobile, show simple layout without complex sidebar
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Quick Navigation Header - Mobile */}
        <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 h-12 transition-colors">
          <div className="flex items-center justify-between px-3 h-full">
            <Link to="/" className="flex items-center text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" data-testid="mobile-quick-nav-home">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Car className="w-3.5 h-3.5 text-white" />
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-1"
                title={resolvedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {resolvedTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1"
                data-testid="mobile-menu-button"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Page Header */}
        <div className="pt-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 transition-colors">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-medium text-gray-900 dark:text-gray-100">Express Auto Glass</h1>
            <span className="text-xs text-gray-500 dark:text-gray-400">Admin Portal</span>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)}>
            <div className="fixed top-0 left-0 w-64 h-full bg-white dark:bg-gray-800 shadow-lg transition-colors" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Navigation</h2>
                  <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {/* Quick link to public site */}
                  <Link href="/">
                    <div className="flex items-center p-3 rounded-lg text-sm w-full text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
                         onClick={() => setIsSidebarOpen(false)}
                         data-testid="mobile-nav-home">
                      <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                        <Car className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">Public Website</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Go to main website</div>
                      </div>
                    </div>
                  </Link>

                  <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>

                  {navigation.map((item) => {
                    const isActive = location === item.href;
                    const Icon = item.icon;

                    return (
                      <Link key={item.name} href={item.href}>
                        <div
                          className={`flex items-center p-3 rounded-lg text-sm w-full ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                          }`}
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Mobile Content */}
        <div className="p-2 bg-white dark:bg-gray-900 min-h-screen transition-colors">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 w-full transition-colors">
      {/* Quick Navigation Header - Desktop */}
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 h-12 transition-colors">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" data-testid="quick-nav-home">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Car className="w-3.5 h-3.5 text-white" />
              </div>
            </Link>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Portal</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/admin/dashboard" className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" data-testid="quick-nav-dashboard">
              Dashboard
            </Link>
            <Link to="/admin/crm" className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" data-testid="quick-nav-crm">
              CRM
            </Link>
            <Link to="/admin/analytics" className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" data-testid="quick-nav-analytics">
              Analytics
            </Link>
            <Link to="/admin/transaction-logs" className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" data-testid="quick-nav-logs">
              Logs
            </Link>
            <Link to="/admin/settings" className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" data-testid="quick-nav-settings">
              Settings
            </Link>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              title={resolvedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {resolvedTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex pt-12">
        {/* Desktop Sidebar */}
        <div className={`
          ${isSidebarOpen ? 'w-64' : 'w-16'}
          transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen flex-shrink-0
        `}>
          {/* Header */}
          <div className={`${isSidebarOpen ? 'p-3 md:p-4' : 'p-2'} border-b border-gray-200 dark:border-gray-700`}>
            <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
              {isSidebarOpen && (
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-wide">Express Auto Glass</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`${isSidebarOpen ? 'p-2' : 'p-1 w-8 h-8'} ${!isSidebarOpen ? 'mx-auto' : ''}`}
              >
                {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          {isSidebarOpen && (
            <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 md:mb-3">Quick Stats</h3>
              <div className="space-y-1 md:space-y-2">
                {quickStats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${stat.color}`} />
                      <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                    </div>
                    <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className={`flex-1 ${isSidebarOpen ? 'p-2 md:p-4' : 'p-1'}`}>
            <div className={`${isSidebarOpen ? 'space-y-1 md:space-y-2' : 'space-y-3'}`}>
              {navigation.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <div className={`flex items-center rounded-lg transition-colors cursor-pointer ${
                      isSidebarOpen
                        ? 'gap-1.5 md:gap-3 px-1.5 md:px-3 py-1 md:py-2'
                        : 'justify-center w-10 h-10 mx-auto'
                    } ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                        : 'text-gray-600 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}>
                      <Icon className={`${isSidebarOpen ? 'w-4 h-4 md:w-5 md:h-5' : 'w-5 h-5'} flex-shrink-0`} />
                      {isSidebarOpen && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs md:text-sm font-medium">
                              <span className="md:hidden">{item.mobileShort || item.name}</span>
                              <span className="hidden md:inline">{item.name}</span>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight break-words">{item.description}</p>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Help Section */}
          {isSidebarOpen && (
            <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700">
              <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-2 md:p-3">
                  <div className="flex items-start gap-1.5 md:gap-2">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                      <Car className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-medium text-emerald-900 dark:text-emerald-300">Need Help?</h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 md:mt-1">
                        Check docs for integration guides.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors">
          {/* Mobile Menu Button - Always visible on mobile */}
          <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2"
              >
                <Menu className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Express Auto Glass</span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {navigation.find(item => item.href === location)?.name || 'Dashboard'}
            </span>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-white dark:bg-gray-900 transition-colors">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}