import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, ShieldCheck } from "lucide-react";

interface ErrorStats {
  failed: number;
  retrying: number;
  recovered: number;
}

interface ErrorPanelProps {
  errorStats: ErrorStats;
  onRetryFailed?: () => void;
}

export function ErrorPanel({ errorStats, onRetryFailed }: ErrorPanelProps) {
  const errorSections = [
    {
      title: "Failed Requests",
      value: errorStats.failed,
      icon: AlertTriangle,
      color: "red",
      bgColor: "bg-red-100 dark:bg-red-900/40",
      textColor: "text-red-500 dark:text-red-400",
      action: onRetryFailed && errorStats.failed > 0 ? "Retry All Failed" : null,
    },
    {
      title: "Retry Queue",
      value: errorStats.retrying,
      icon: Clock,
      color: "yellow",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
      textColor: "text-yellow-500 dark:text-yellow-400",
      subtitle: "Next attempt in 2m",
    },
    {
      title: "Auto-Recovery",
      value: errorStats.recovered,
      icon: ShieldCheck,
      color: "blue",
      bgColor: "bg-blue-100 dark:bg-blue-900/40",
      textColor: "text-primary dark:text-blue-400",
      subtitle: "Resolved automatically",
    },
  ];

  return (
    <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">Error Handling & Retry Logic</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">Automated error recovery and manual intervention tools</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {errorSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="text-center">
                <div className={`w-12 h-12 ${section.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-6 h-6 ${section.textColor}`} />
                </div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{section.title}</h4>
                <p className={`text-2xl font-semibold ${section.textColor} mb-2`}>{section.value}</p>

                {section.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRetryFailed}
                    className="text-primary hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {section.action}
                  </Button>
                )}

                {section.subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{section.subtitle}</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
