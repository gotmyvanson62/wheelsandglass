import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, ArrowRight, Clock, User, Car } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface QuoteSubmission {
  id: number;
  timestamp: string;
  firstName: string;
  lastName: string;
  email: string;
  serviceType: string;
  year: string | null;
  make: string | null;
  model: string | null;
  status: string;
}

export function QuoteRequestsWidget() {
  // Fetch quote stats
  const { data: statsData } = useQuery<{
    total: number;
    submitted: number;
    last24Hours: number;
  }>({
    queryKey: ['/api/quote/stats'],
  });

  // Fetch recent quotes
  const { data: quotesData } = useQuery<{
    submissions: QuoteSubmission[];
  }>({
    queryKey: ['/api/quote/submissions', { limit: 5 }],
  });

  const stats = statsData || { total: 0, submitted: 0, last24Hours: 0 };
  const recentQuotes = quotesData?.submissions?.slice(0, 5) || [];

  const navigateToCRM = () => {
    window.location.href = '/admin/crm?tab=quotes';
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 cursor-pointer" onClick={navigateToCRM}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 dark:text-gray-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            Quote Requests
          </div>
          {stats.submitted > 0 && (
            <Badge className="bg-blue-500 hover:bg-blue-600">
              {stats.submitted} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Quick Stats */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-green-600 dark:text-green-400">{stats.last24Hours}</span> in last 24h
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold dark:text-gray-200">{stats.total}</span> total
            </span>
          </div>
        </div>

        {/* Recent Quotes List */}
        {recentQuotes.length === 0 ? (
          <div className="text-center py-4">
            <ClipboardList className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No quote requests yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Requests from the public form will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentQuotes.map((quote) => (
              <div
                key={quote.id}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-gray-200">
                      {quote.firstName} {quote.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {quote.year && quote.make ? (
                        <span className="flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          {quote.year} {quote.make}
                        </span>
                      ) : (
                        <span>{quote.serviceType}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(quote.timestamp, 'MMM d')}
                  </p>
                  <Badge
                    variant={quote.status === 'submitted' ? 'default' : 'secondary'}
                    className={`text-xs ${
                      quote.status === 'submitted'
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : ''
                    }`}
                  >
                    {quote.status === 'submitted' ? 'New' : quote.status}
                  </Badge>
                </div>
              </div>
            ))}

            {/* View All Link */}
            <Button
              variant="ghost"
              className="w-full mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              onClick={(e) => {
                e.stopPropagation();
                navigateToCRM();
              }}
            >
              View All Quotes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
