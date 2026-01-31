import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Activity, 
  MessageSquare, 
  Settings, 
  FileText, 
  AlertTriangle,
  Menu,
  X,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Activity },
  { name: 'CRM', href: '/crm', icon: MessageSquare },
  { name: 'Operations', href: '/operations-center', icon: AlertTriangle },
  { name: 'Config', href: '/configuration', icon: Settings },
  { name: 'Logs', href: '/transaction-logs', icon: FileText },
];

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <h1 className="ml-2 text-sm font-semibold text-gray-900">Wheels and Glass</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="py-2">
              {navigation.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <div 
                      className={`flex items-center px-4 py-3 text-sm ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="pt-16">
        <div className="h-full">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex">
          {navigation.slice(0, 4).map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href} className="flex-1">
                <div className={`flex flex-col items-center py-2 px-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}