import { Link, useLocation } from 'wouter';
import { Settings, BarChart3, Users, ClipboardList, Monitor } from 'lucide-react';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className = "" }: NavbarProps) {
  const [location] = useLocation();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Monitor },
    { href: '/crm', label: 'CRM', icon: Users },
    { href: '/jobs', label: 'Jobs', icon: ClipboardList },
    { href: '/operations', label: 'Operations', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className={`flex items-center space-x-6 bg-gray-50 dark:bg-gray-900 px-6 py-3 border-b ${className}`}>
      <div className="flex items-center">
        <img 
          src="/assets/express-auto-glass-logo.png" 
          alt="Express Auto Glass" 
          className="h-8 w-auto"
        />
      </div>
      
      <div className="flex space-x-4 ml-8">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <a 
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === href 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}