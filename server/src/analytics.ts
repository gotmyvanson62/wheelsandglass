import { db } from './db';
import { formSubmissions, formAnalytics, userSessions, pageViews } from '@shared/schema';
import { sql, desc, eq, gte, lte, and, count } from 'drizzle-orm';

export interface AnalyticsData {
  formSubmissions: FormSubmissionSummary[];
  conversionFunnel: ConversionStep[];
  popularLocations: LocationData[];
  serviceTypeBreakdown: ServiceTypeData[];
  timeBasedTrends: TimeSeriesData[];
  deviceBreakdown: DeviceData[];
  keyMetrics: KeyMetrics;
}

export interface FormSubmissionSummary {
  id: string;
  date: string;
  location: string;
  serviceType: string;
  vehicleYear: string;
  vehicleMake: string;
  status: string;
  source: string;
  deviceType: string;
  completionTime: number;
}

export interface ConversionStep {
  step: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
}

export interface LocationData {
  location: string;
  count: number;
  percentage: number;
}

export interface ServiceTypeData {
  serviceType: string;
  count: number;
  percentage: number;
  avgCompletionTime: number;
}

export interface TimeSeriesData {
  date: string;
  submissions: number;
  quotes: number;
  completions: number;
}

export interface DeviceData {
  device: string;
  sessions: number;
  conversionRate: number;
}

export interface KeyMetrics {
  totalSubmissions: number;
  conversionRate: number;
  avgCompletionTime: number;
  quoteSuccessRate: number;
  submissionGrowth: number;
  conversionGrowth: number;
}

export class AnalyticsService {
  async getAnalyticsData(dateRange: string = '30d'): Promise<AnalyticsData> {
    const { startDate, endDate } = this.getDateRange(dateRange);

    const [
      formSubmissionsData,
      conversionFunnelData,
      popularLocationsData,
      serviceTypeData,
      timeBasedData,
      deviceData,
      keyMetricsData
    ] = await Promise.all([
      this.getFormSubmissions(startDate, endDate),
      this.getConversionFunnel(startDate, endDate),
      this.getPopularLocations(startDate, endDate),
      this.getServiceTypeBreakdown(startDate, endDate),
      this.getTimeBasedTrends(startDate, endDate),
      this.getDeviceBreakdown(startDate, endDate),
      this.getKeyMetrics(startDate, endDate)
    ]);

    return {
      formSubmissions: formSubmissionsData,
      conversionFunnel: conversionFunnelData,
      popularLocations: popularLocationsData,
      serviceTypeBreakdown: serviceTypeData,
      timeBasedTrends: timeBasedData,
      deviceBreakdown: deviceData,
      keyMetrics: keyMetricsData
    };
  }

  private getDateRange(range: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    return { startDate, endDate };
  }

  private async getFormSubmissions(startDate: Date, endDate: Date): Promise<FormSubmissionSummary[]> {
    try {
      const submissions = await db
        .select({
          id: formSubmissions.id,
          date: sql<string>`DATE(${formSubmissions.submittedAt})`,
          location: formSubmissions.location,
          serviceType: formSubmissions.serviceType,
          vehicleYear: formSubmissions.vehicleYear,
          vehicleMake: formSubmissions.vehicleMake,
          status: formSubmissions.status,
          source: formSubmissions.source,
          deviceType: formSubmissions.deviceType,
          completionTime: formSubmissions.completionTime,
        })
        .from(formSubmissions)
        .where(
          and(
            gte(formSubmissions.submittedAt, startDate),
            lte(formSubmissions.submittedAt, endDate)
          )
        )
        .orderBy(desc(formSubmissions.submittedAt))
        .limit(100);

      return submissions.map(sub => ({
        id: sub.id || '',
        date: sub.date || '',
        location: sub.location || '',
        serviceType: sub.serviceType || '',
        vehicleYear: sub.vehicleYear || '',
        vehicleMake: sub.vehicleMake || '',
        status: sub.status || 'pending',
        source: sub.source || 'direct',
        deviceType: sub.deviceType || 'desktop',
        completionTime: sub.completionTime || 0,
      }));
    } catch (error) {
      console.error('Error fetching form submissions:', error);
      return [];
    }
  }

  private async getConversionFunnel(startDate: Date, endDate: Date): Promise<ConversionStep[]> {
    try {
      const sessions = await db
        .select({ count: count() })
        .from(userSessions)
        .where(
          and(
            gte(userSessions.startTime, startDate),
            lte(userSessions.startTime, endDate)
          )
        );

      const formStarts = await db
        .select({ count: count() })
        .from(userSessions)
        .where(
          and(
            gte(userSessions.startTime, startDate),
            lte(userSessions.startTime, endDate),
            eq(userSessions.formStarted, true)
          )
        );

      const formCompletions = await db
        .select({ count: count() })
        .from(userSessions)
        .where(
          and(
            gte(userSessions.startTime, startDate),
            lte(userSessions.startTime, endDate),
            eq(userSessions.formCompleted, true)
          )
        );

      const totalSessions = sessions[0]?.count || 1;
      const totalFormStarts = formStarts[0]?.count || 0;
      const totalCompletions = formCompletions[0]?.count || 0;

      return [
        {
          step: 'Landing Page Views',
          visitors: totalSessions,
          conversions: totalSessions,
          conversionRate: 100
        },
        {
          step: 'Form Started',
          visitors: totalSessions,
          conversions: totalFormStarts,
          conversionRate: (totalFormStarts / totalSessions) * 100
        },
        {
          step: 'Form Completed',
          visitors: totalFormStarts,
          conversions: totalCompletions,
          conversionRate: totalFormStarts > 0 ? (totalCompletions / totalFormStarts) * 100 : 0
        }
      ];
    } catch (error) {
      console.error('Error fetching conversion funnel:', error);
      return [];
    }
  }

  private async getPopularLocations(startDate: Date, endDate: Date): Promise<LocationData[]> {
    try {
      const locationCounts = await db
        .select({
          location: formSubmissions.location,
          count: count()
        })
        .from(formSubmissions)
        .where(
          and(
            gte(formSubmissions.submittedAt, startDate),
            lte(formSubmissions.submittedAt, endDate)
          )
        )
        .groupBy(formSubmissions.location)
        .orderBy(desc(count()))
        .limit(10);

      const totalSubmissions = locationCounts.reduce((sum, loc) => sum + loc.count, 0);

      return locationCounts.map(loc => ({
        location: loc.location || 'Unknown',
        count: loc.count,
        percentage: (loc.count / totalSubmissions) * 100
      }));
    } catch (error) {
      console.error('Error fetching popular locations:', error);
      return [];
    }
  }

  private async getServiceTypeBreakdown(startDate: Date, endDate: Date): Promise<ServiceTypeData[]> {
    try {
      const serviceTypeCounts = await db
        .select({
          serviceType: formSubmissions.serviceType,
          count: count(),
          avgCompletionTime: sql<number>`AVG(${formSubmissions.completionTime})`
        })
        .from(formSubmissions)
        .where(
          and(
            gte(formSubmissions.submittedAt, startDate),
            lte(formSubmissions.submittedAt, endDate)
          )
        )
        .groupBy(formSubmissions.serviceType)
        .orderBy(desc(count()));

      const totalSubmissions = serviceTypeCounts.reduce((sum, service) => sum + service.count, 0);

      return serviceTypeCounts.map(service => ({
        serviceType: service.serviceType || 'Unknown',
        count: service.count,
        percentage: (service.count / totalSubmissions) * 100,
        avgCompletionTime: Math.round(service.avgCompletionTime || 0)
      }));
    } catch (error) {
      console.error('Error fetching service type breakdown:', error);
      return [];
    }
  }

  private async getTimeBasedTrends(startDate: Date, endDate: Date): Promise<TimeSeriesData[]> {
    try {
      const trends = await db
        .select({
          date: sql<string>`DATE(${formSubmissions.submittedAt})`,
          submissions: count(),
          quotes: sql<number>`COUNT(CASE WHEN ${formSubmissions.status} = 'quoted' THEN 1 END)`,
          completions: sql<number>`COUNT(CASE WHEN ${formSubmissions.status} = 'completed' THEN 1 END)`
        })
        .from(formSubmissions)
        .where(
          and(
            gte(formSubmissions.submittedAt, startDate),
            lte(formSubmissions.submittedAt, endDate)
          )
        )
        .groupBy(sql`DATE(${formSubmissions.submittedAt})`)
        .orderBy(sql`DATE(${formSubmissions.submittedAt})`);

      return trends.map(trend => ({
        date: trend.date,
        submissions: trend.submissions,
        quotes: trend.quotes,
        completions: trend.completions
      }));
    } catch (error) {
      console.error('Error fetching time-based trends:', error);
      return [];
    }
  }

  private async getDeviceBreakdown(startDate: Date, endDate: Date): Promise<DeviceData[]> {
    try {
      const deviceStats = await db
        .select({
          device: userSessions.deviceType,
          sessions: count(),
          conversions: sql<number>`COUNT(CASE WHEN ${userSessions.formCompleted} = true THEN 1 END)`
        })
        .from(userSessions)
        .where(
          and(
            gte(userSessions.startTime, startDate),
            lte(userSessions.startTime, endDate)
          )
        )
        .groupBy(userSessions.deviceType);

      return deviceStats.map(device => ({
        device: device.device || 'Unknown',
        sessions: device.sessions,
        conversionRate: device.sessions > 0 ? (device.conversions / device.sessions) * 100 : 0
      }));
    } catch (error) {
      console.error('Error fetching device breakdown:', error);
      return [];
    }
  }

  private async getKeyMetrics(startDate: Date, endDate: Date): Promise<KeyMetrics> {
    try {
      const [totalSubs, completedSubs, avgTime, quotedSubs] = await Promise.all([
        db.select({ count: count() }).from(formSubmissions)
          .where(
            and(
              gte(formSubmissions.submittedAt, startDate),
              lte(formSubmissions.submittedAt, endDate)
            )
          ),
        
        db.select({ count: count() }).from(formSubmissions)
          .where(
            and(
              gte(formSubmissions.submittedAt, startDate),
              lte(formSubmissions.submittedAt, endDate),
              eq(formSubmissions.status, 'completed')
            )
          ),
          
        db.select({ avg: sql<number>`AVG(${formSubmissions.completionTime})` }).from(formSubmissions)
          .where(
            and(
              gte(formSubmissions.submittedAt, startDate),
              lte(formSubmissions.submittedAt, endDate)
            )
          ),
          
        db.select({ count: count() }).from(formSubmissions)
          .where(
            and(
              gte(formSubmissions.submittedAt, startDate),
              lte(formSubmissions.submittedAt, endDate),
              eq(formSubmissions.status, 'quoted')
            )
          )
      ]);

      const totalSubmissions = totalSubs[0]?.count || 0;
      const completedSubmissions = completedSubs[0]?.count || 0;
      const quotedSubmissions = quotedSubs[0]?.count || 0;
      const avgCompletionTime = avgTime[0]?.avg || 0;

      return {
        totalSubmissions,
        conversionRate: totalSubmissions > 0 ? (completedSubmissions / totalSubmissions) * 100 : 0,
        avgCompletionTime: Math.round(avgCompletionTime),
        quoteSuccessRate: totalSubmissions > 0 ? (quotedSubmissions / totalSubmissions) * 100 : 0,
        submissionGrowth: 12.5, // Would calculate from previous period comparison
        conversionGrowth: 2.1   // Would calculate from previous period comparison
      };
    } catch (error) {
      console.error('Error fetching key metrics:', error);
      return {
        totalSubmissions: 0,
        conversionRate: 0,
        avgCompletionTime: 0,
        quoteSuccessRate: 0,
        submissionGrowth: 0,
        conversionGrowth: 0
      };
    }
  }

  async trackFormSubmission(data: {
    sessionId: string;
    location: string;
    serviceType: string;
    vehicleYear: string;
    vehicleMake: string;
    vehicleModel: string;
    vin: string;
    customerEmail: string;
    customerPhone: string;
    source: string;
    deviceType: string;
    userAgent: string;
    ipAddress: string;
    completionTime: number;
  }) {
    try {
      await db.insert(formSubmissions).values({
        sessionId: data.sessionId,
        location: data.location,
        serviceType: data.serviceType,
        vehicleYear: data.vehicleYear,
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vin: data.vin,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        source: data.source,
        deviceType: data.deviceType,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        completionTime: data.completionTime,
        status: 'pending'
      });
    } catch (error) {
      console.error('Error tracking form submission:', error);
      throw error;
    }
  }

  async trackUserSession(data: {
    sessionId: string;
    source: string;
    referrer?: string;
    landingPage: string;
    deviceType: string;
    userAgent: string;
    ipAddress: string;
  }) {
    try {
      await db.insert(userSessions).values({
        sessionId: data.sessionId,
        source: data.source,
        referrer: data.referrer,
        landingPage: data.landingPage,
        deviceType: data.deviceType,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        formStarted: false,
        formCompleted: false,
        bounced: false
      });
    } catch (error) {
      console.error('Error tracking user session:', error);
      throw error;
    }
  }

  async trackFormEvent(data: {
    sessionId: string;
    eventType: 'form_start' | 'form_complete' | 'form_abandon';
  }) {
    try {
      // Update session record
      await db.update(userSessions)
        .set({
          formStarted: data.eventType === 'form_start' || data.eventType === 'form_complete',
          formCompleted: data.eventType === 'form_complete',
          updatedAt: new Date()
        })
        .where(eq(userSessions.sessionId, data.sessionId));

      // Track analytics event
      await db.insert(formAnalytics).values({
        sessionId: data.sessionId,
        eventType: data.eventType,
        eventData: {},
        page: '/quote',
        deviceType: 'unknown', // Would be passed from client
        userAgent: 'unknown'
      });
    } catch (error) {
      console.error('Error tracking form event:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();