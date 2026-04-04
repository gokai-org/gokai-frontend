import type {
  AdminCoupon,
  AdminCouponStatus,
  BackendCoupon,
} from "../types/coupons";

function deriveCouponStatus(vigency: string): AdminCouponStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const vigencyDate = new Date(vigency);
  vigencyDate.setHours(0, 0, 0, 0);

  if (vigencyDate < today) return "expired";
  return "active";
}

export function formatCouponDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;

  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatVigencyDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;

  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function toInputDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
}

export function mapBackendCouponToAdmin(coupon: BackendCoupon): AdminCoupon {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description ?? null,
    vigency: coupon.vigency,
    claimLimit: coupon.claim_limit,
    months: coupon.months,
    createdAt: formatCouponDate(coupon.created_at),
    status: deriveCouponStatus(coupon.vigency),
  };
}
