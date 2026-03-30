"use client";

import { memo } from "react";
import { formatVigencyDate } from "../utils/couponMappers";
import type { AdminCoupon, AdminCouponStatus } from "../types/coupons";

const statusLabel: Record<AdminCouponStatus, string> = {
  active: "Activo",
  expired: "Expirado",
  depleted: "Agotado",
};

const statusTone: Record<AdminCouponStatus, string> = {
  active: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
  expired: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400",
  depleted: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
};

interface AdminCouponRowProps {
  coupon: AdminCoupon;
  onViewCoupon: (coupon: AdminCoupon) => void;
}

function AdminCouponRowBase({ coupon, onViewCoupon }: AdminCouponRowProps) {
  return (
    <tr className="border-b border-border-subtle last:border-0 hover:bg-accent/[0.03] transition-colors">
      <td className="px-2.5 py-2.5 text-xs font-semibold text-content-secondary sm:px-3 sm:text-sm lg:px-4">
        <p className="max-w-[120px] truncate sm:max-w-[140px]" title={coupon.id}>
          {coupon.id.slice(0, 8)}...
        </p>
      </td>

      <td className="px-2.5 py-2.5 sm:px-3 lg:px-4">
        <span className="inline-flex rounded-lg bg-surface-tertiary px-2.5 py-1 text-xs font-bold tracking-wider text-content-primary uppercase">
          {coupon.code}
        </span>
      </td>

      <td className="px-2.5 py-2.5 text-xs text-content-secondary sm:px-3 sm:text-sm lg:px-4">
        <p className="line-clamp-1 max-w-[180px] sm:max-w-[240px]" title={coupon.description ?? ""}>
          {coupon.description || "—"}
        </p>
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 text-xs text-content-secondary sm:px-3 sm:text-sm lg:px-4">
        {coupon.months} {coupon.months === 1 ? "mes" : "meses"}
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 text-xs text-content-secondary sm:px-3 sm:text-sm lg:px-4">
        {coupon.claimLimit}
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 text-xs text-content-tertiary sm:px-3 sm:text-sm lg:px-4">
        {formatVigencyDate(coupon.vigency)}
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 sm:px-3 lg:px-4">
        <span
          className={[
            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs",
            statusTone[coupon.status],
          ].join(" ")}
        >
          {statusLabel[coupon.status]}
        </span>
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 text-xs text-content-tertiary sm:px-3 sm:text-sm lg:px-4">
        {coupon.createdAt}
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 text-center sm:px-3 lg:px-4">
        <button
          type="button"
          onClick={() => onViewCoupon(coupon)}
          className="inline-flex items-center justify-center rounded-lg border border-accent/25 bg-accent/5 px-2.5 py-1 text-[11px] font-semibold text-accent transition-colors hover:bg-accent/10 sm:px-3 sm:py-1.5 sm:text-xs"
        >
          Ver cupon
        </button>
      </td>
    </tr>
  );
}

export const AdminCouponRow = memo(AdminCouponRowBase);
