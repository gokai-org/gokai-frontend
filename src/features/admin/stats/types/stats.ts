export interface AdminMonthlyMetric {
  month: string;
  value: number;
}

export interface AdminStatsResponse {
  newUsers: AdminMonthlyMetric[];
  newSubscriptions: AdminMonthlyMetric[];
  canceledSubscriptions: AdminMonthlyMetric[];
  couponsRedeemed: AdminMonthlyMetric[];
  practiceMinutes: AdminMonthlyMetric[];
  chatbotTokens: AdminMonthlyMetric[];
}

export type AdminStatsSeriesKey = keyof AdminStatsResponse;

export interface AdminStatsTimelinePoint {
  month: string;
  monthLabel: string;
  fullMonthLabel: string;
  newUsers: number;
  newSubscriptions: number;
  canceledSubscriptions: number;
  couponsRedeemed: number;
  practiceMinutes: number;
  chatbotTokens: number;
  netSubscriptions: number;
  subscriptionConversion: number;
  cancellationPressure: number;
  couponPressure: number;
  newUsersIndex: number;
  newSubscriptionsIndex: number;
  canceledSubscriptionsIndex: number;
  couponsRedeemedIndex: number;
  practiceMinutesIndex: number;
  chatbotTokensIndex: number;
}

export interface AdminStatSnapshot {
  current: number;
  previous: number | null;
  total: number;
  trend: number | null;
}