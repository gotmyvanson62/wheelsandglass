import { RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ title, subtitle, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-2xl font-semibold text-gray-900 truncate">{title}</h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1 truncate">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4 ml-3">
          {onRefresh && (
            <Button 
              variant="outline" 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''} ${window.innerWidth < 768 ? '' : 'mr-2'}`} />
              <span className="hidden md:inline">Refresh</span>
            </Button>
          )}
          <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
}
