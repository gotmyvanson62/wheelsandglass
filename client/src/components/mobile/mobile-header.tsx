import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const navigationItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/crm', label: 'CRM', icon: '👥' },
  { href: '/admin/analytics', label: 'Operations', icon: '⚙️' },
  { href: '/admin/settings', label: 'Config & Docs', icon: '🔧' },
];

export function MobileHeader() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mobile-header md:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src="/assets/express-auto-glass-logo.png" 
            alt="Wheels and Glass" 
            className="h-6 w-auto"
          />
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="touch-target">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex flex-col space-y-4 mt-6">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider px-3">
                Navigation
              </div>
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors touch-target ${
                      location === item.href
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}