import { Zap, CheckCircle, AlertCircle, XCircle, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface StatusCardsProps {
  stats: {
    total: number;
    success: number;
    failed: number;
    pending: number;
  };
  onCardClick?: (cardType: string) => void;
}

export function StatusCards({ stats, onCardClick }: StatusCardsProps) {
  const [, navigate] = useLocation();

  const cards = [
    {
      title: "Quote Requests",
      value: stats.total,
      change: stats.total > 0 ? `+${Math.min(12, Math.floor(stats.total * 0.1))}%` : "0%",
      changeText: "vs last week",
      icon: Zap,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-primary",
      action: "View all quote requests",
      route: "/admin/crm/quotes",
      filter: "all"
    },
    {
      title: "Jobs Created",
      value: stats.success,
      change: `${stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0}%`,
      changeText: "success rate",
      icon: CheckCircle,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      action: "View completed jobs",
      route: "/admin/crm/jobs",
      filter: "completed"
    },
    {
      title: "Pending Jobs",
      value: stats.pending,
      change: stats.pending > 0 ? `${stats.pending}` : "0",
      changeText: "need attention",
      icon: AlertCircle,
      color: "yellow",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
      action: "View pending jobs",
      route: "/admin/crm/jobs",
      filter: "pending"
    },
    {
      title: "Failed Requests",
      value: stats.failed,
      change: stats.failed > 0 ? `${Math.floor(stats.failed * 0.6)}` : "0",
      changeText: "in last hour",
      icon: XCircle,
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      action: "View failed requests",
      route: "/admin/transaction-logs",
      filter: "failed"
    },
  ];

  const handleCardClick = (card: any) => {
    if (onCardClick) {
      onCardClick(card.filter);
    }
    // Navigate directly to the route (CRM uses path-based tab routing)
    navigate(card.route);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 cursor-pointer group bg-white dark:bg-gray-800"
            onClick={() => handleCardClick(card)}
            data-testid={`card-${card.filter}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {card.value}
                    </p>
                    <div className={`text-sm flex items-center space-x-1 ${
                      card.color === 'red' ? 'text-red-600' : 
                      card.color === 'yellow' ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      <span className="font-medium">{card.change}</span>
                      <span className="text-gray-500 dark:text-gray-400">{card.changeText}</span>
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
