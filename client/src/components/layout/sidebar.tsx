import { Link, useLocation } from "wouter";
import { Layers, Activity, Settings, FileText, Database, AlertTriangle, Shield, Book, MessageSquare, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: Activity,
  },
  {
    name: "CRM & Communication",
    href: "/admin/crm",
    icon: MessageSquare,
  },
  {
    name: "Analytics & Operations",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Transaction Logs",
    href: "/admin/transaction-logs",
    icon: FileText,
  },
  {
    name: "Settings & Documentation",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: Shield,
  },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">Wheels and Glass</h1>
              <p className="text-xs text-gray-500">Integration Hub</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                  isActive 
                    ? "text-primary bg-blue-50" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}>
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Status Indicator */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">API Status</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-green"></div>
              <span className="ml-2 text-sm text-green-600">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
