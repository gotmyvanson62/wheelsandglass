import { ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
          {item.href && !item.active ? (
            <Link href={item.href}>
              <span className="hover:text-gray-900 cursor-pointer">{item.label}</span>
            </Link>
          ) : (
            <span className={item.active ? 'text-gray-900 font-medium' : 'text-gray-600'}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}