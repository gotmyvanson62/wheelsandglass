import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ConversionAnalyticsPanelProps {
  conversionStats: {
    formSubmissions: number;
    jobsScheduled: number;
    jobsCompleted: number;
    invoicesPaid: number;
    totalRevenue: number;
  };
  conversionRates: {
    submissionToScheduled: string;
    scheduledToCompleted: string;
    completedToPaid: string;
    overallConversion: string;
  };
}

export function ConversionAnalyticsPanel({ conversionStats, conversionRates }: ConversionAnalyticsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Conversion Rate Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{conversionRates.submissionToScheduled}%</div>
            <div className="text-sm text-gray-600 mt-1">Submission → Scheduled</div>
            <div className="text-xs text-gray-500 mt-2">
              {conversionStats.jobsScheduled} of {conversionStats.formSubmissions} submitted
            </div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">{conversionRates.scheduledToCompleted}%</div>
            <div className="text-sm text-gray-600 mt-1">Scheduled → Completed</div>
            <div className="text-xs text-gray-500 mt-2">
              {conversionStats.jobsCompleted} of {conversionStats.jobsScheduled} scheduled
            </div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-3xl font-bold text-green-600">{conversionRates.completedToPaid}%</div>
            <div className="text-sm text-gray-600 mt-1">Completed → Paid</div>
            <div className="text-xs text-gray-500 mt-2">
              {conversionStats.invoicesPaid} of {conversionStats.jobsCompleted} completed
            </div>
          </div>
          
          <div className="text-center p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="text-3xl font-bold text-purple-600">{conversionRates.overallConversion}%</div>
            <div className="text-sm text-gray-600 mt-1">Overall Pipeline</div>
            <div className="text-xs text-gray-500 mt-2">
              End-to-end conversion rate
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Total Revenue Generated</h4>
              <p className="text-2xl font-bold text-green-600">${conversionStats.totalRevenue?.toLocaleString() || '0'}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Average Job Value</div>
              <div className="text-lg font-semibold text-gray-900">
                ${conversionStats.invoicesPaid > 0 
                  ? Math.round(conversionStats.totalRevenue / conversionStats.invoicesPaid).toLocaleString() 
                  : '0'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}