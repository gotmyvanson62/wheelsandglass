// RPJ (Revenue per Job) utility functions

export interface RpjContext {
  state: string;
  city?: string;
  service?: string;
}

export interface RpjConfig {
  rpjGlobal: number;
  rpjOverrides: {
    state?: Record<string, number>;
    city?: Record<string, number>;
    service?: Record<string, number>;
  };
}

export interface RevenueMetrics {
  rpj: number;
  revGoal: number;
  revActual: number;
  completion: number;
  gap: number;
  jobsNeeded: number;
  paced?: number;
  forecastDelta?: number;
}

// Resolve RPJ using most specific override (city+service → city → state → global)
export function resolveRPJ(context: RpjContext, config: RpjConfig): number {
  const { state, city, service } = context;
  const { rpjGlobal, rpjOverrides } = config;

  // Most specific: city + service combination
  if (city && service && rpjOverrides.city?.[`${city}_${service}`]) {
    return rpjOverrides.city[`${city}_${service}`];
  }

  // City override
  if (city && rpjOverrides.city?.[city]) {
    return rpjOverrides.city[city];
  }

  // Service override
  if (service && rpjOverrides.service?.[service]) {
    return rpjOverrides.service[service];
  }

  // State override
  if (rpjOverrides.state?.[state]) {
    return rpjOverrides.state[state];
  }

  // Global default
  return rpjGlobal;
}

// Calculate comprehensive revenue metrics
export function calculateRevenueMetrics(params: {
  jobsGoal: number;
  jobsActual: number;
  elapsedPct?: number;
  context: RpjContext;
  config: RpjConfig;
}): RevenueMetrics {
  const { jobsGoal, jobsActual, elapsedPct, context, config } = params;
  
  const rpj = resolveRPJ(context, config);
  const revGoal = jobsGoal * rpj;
  const revActual = jobsActual * rpj;
  const completion = revGoal > 0 ? revActual / revGoal : 0;
  const gap = Math.max(0, revGoal - revActual);
  const jobsNeeded = Math.ceil(gap / rpj);
  
  let paced: number | undefined;
  let forecastDelta: number | undefined;
  
  if (elapsedPct && elapsedPct > 0) {
    paced = revActual / elapsedPct;
    forecastDelta = paced - revGoal;
  }
  
  return {
    rpj,
    revGoal,
    revActual,
    completion,
    gap,
    jobsNeeded,
    paced,
    forecastDelta
  };
}

// Format currency (from cents to dollars)
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

// Get status color based on completion percentage
export function getRevenueStatus(completion: number): {
  label: string;
  color: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary';
} {
  if (completion >= 0.8) {
    return {
      label: 'On Track',
      color: 'text-green-600',
      variant: 'default'
    };
  } else if (completion >= 0.6) {
    return {
      label: 'Moderate',
      color: 'text-orange-600',
      variant: 'outline'
    };
  } else {
    return {
      label: 'Below Target',
      color: 'text-red-600',
      variant: 'destructive'
    };
  }
}

// Calculate elapsed percentage for different time periods
export function getElapsedPercentage(timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly'): number {
  const now = new Date();
  
  switch (timeframe) {
    case 'daily':
      // Percentage of day elapsed based on business hours (9 AM to 6 PM)
      const hour = now.getHours();
      const minute = now.getMinutes();
      const totalMinutesInBusinessDay = 9 * 60; // 9 hours * 60 minutes
      const businessStartHour = 9;
      
      if (hour < businessStartHour) return 0;
      if (hour >= 18) return 1;
      
      const elapsedMinutes = (hour - businessStartHour) * 60 + minute;
      return Math.min(elapsedMinutes / totalMinutesInBusinessDay, 1);
      
    case 'weekly':
      // Percentage of week elapsed (Monday = 1, Sunday = 0)
      const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday from 0 to 7
      const weekProgress = (dayOfWeek - 1) / 7;
      return Math.min(weekProgress + getElapsedPercentage('daily') / 7, 1);
      
    case 'monthly':
      // Percentage of month elapsed
      const dayOfMonth = now.getDate();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return Math.min((dayOfMonth - 1) / daysInMonth + getElapsedPercentage('daily') / daysInMonth, 1);
      
    case 'yearly':
      // Percentage of year elapsed
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const msInYear = 365 * 24 * 60 * 60 * 1000; // Approximate
      const msElapsed = now.getTime() - startOfYear.getTime();
      return Math.min(msElapsed / msInYear, 1);
      
    default:
      return 0;
  }
}