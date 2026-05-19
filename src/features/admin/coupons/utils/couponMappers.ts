import type {
  AdminCoupon,
  AdminCouponStatus,
  BackendCoupon,
} from "../types/coupons";
import {
  formatBackendCalendarDate,
  isBackendCalendarDateOnOrAfterToday,
  toBackendCalendarInputDate,
} from "@/shared/lib/backendCalendarDate";

function deriveCouponStatus(vigency: string): AdminCouponStatus {
  return isBackendCalendarDateOnOrAfterToday(vigency) ? "active" : "expired";
}

export function formatCouponDate(isoDate: string): string {
  return formatBackendCalendarDate(isoDate, "short") ?? isoDate;
}

export function formatVigencyDate(isoDate: string): string {
  return formatBackendCalendarDate(isoDate, "short") ?? isoDate;
}

export function toInputDate(isoDate: string): string {
  return toBackendCalendarInputDate(isoDate);
}

export function mapBackendCouponToAdmin(coupon: BackendCoupon): AdminCoupon {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description ?? null,
    vigency: coupon.vigency,
    claimLimit: coupon.claim_limit,
    redemptions: coupon.redemptions,
    months: coupon.months,
    createdAt: formatCouponDate(coupon.created_at),
    status: deriveCouponStatus(coupon.vigency),
  };
}
