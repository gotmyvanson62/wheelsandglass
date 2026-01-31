import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Navigation() {
  const location = useLocation();

  const links = [
    { to: '/crm', label: 'CRM' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/operations', label: 'Operations' },
    { to: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary">Express Auto Glass</h1>
          </div>

          <div className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  location.pathname === link.to
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
