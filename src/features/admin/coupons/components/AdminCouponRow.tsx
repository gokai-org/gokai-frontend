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
  active: "bg-emerald-50 text-emerald-700",
  expired: "bg-rose-50 text-rose-700",
  depleted: "bg-amber-50 text-amber-700",
};

interface AdminCouponRowProps {
  coupon: AdminCoupon;
  onViewCoupon: (coupon: AdminCoupon) => void;
}

function AdminCouponRowBase({ coupon, onViewCoupon }: AdminCouponRowProps) {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-[#993331]/[0.03] transition-colors">
      <td className="px-2.5 py-2.5 text-xs font-semibold text-gray-700 sm:px-3 sm:text-sm lg:px-4">
        <p className="max-w-[120px] truncate sm:max-w-[140px]" title={coupon.id}>
          {coupon.id.slice(0, 8)}...
        </p>
      </td>

      <td className="px-2.5 py-2.5 sm:px-3 lg:px-4">
        <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold tracking-wider text-gray-800 uppercase">
          {coupon.code}
        </span>
      </td>

      <td className="px-2.5 py-2.5 text-xs text-gray-600 sm:px-3 sm:text-sm lg:px-4">
        <p className="line-clamp-1 max-w-[180px] sm:max-w-[240px]" title={coupon.description ?? ""}>
          {coupon.description || "—"}
        </p>
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 text-xs text-gray-700 sm:px-3 sm:text-sm lg:px-4">
        {coupon.months} {coupon.months === 1 ? "mes" : "meses"}
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 text-xs text-gray-700 sm:px-3 sm:text-sm lg:px-4">
        {coupon.claimLimit}
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 text-xs text-gray-500 sm:px-3 sm:text-sm lg:px-4">
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

      <td className="whitespace-nowrap px-2.5 py-2.5 text-xs text-gray-500 sm:px-3 sm:text-sm lg:px-4">
        {coupon.createdAt}
      </td>

      <td className="whitespace-nowrap px-2.5 py-2.5 text-center sm:px-3 lg:px-4">
        <button
          type="button"
          onClick={() => onViewCoupon(coupon)}
          className="inline-flex items-center justify-center rounded-lg border border-[#993331]/25 bg-[#993331]/5 px-2.5 py-1 text-[11px] font-semibold text-[#993331] transition-colors hover:bg-[#993331]/10 sm:px-3 sm:py-1.5 sm:text-xs"
        >
          Ver cupon
        </button>
      </td>
    </tr>
  );
}

export const AdminCouponRow = memo(AdminCouponRowBase);
