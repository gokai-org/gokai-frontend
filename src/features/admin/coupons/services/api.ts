import { apiFetch } from "@/shared/lib/api/client";
import type {
  BackendCoupon,
  CreateCouponRequest,
  UpdateCouponRequest,
} from "../types/coupons";

export async function getAdminCoupons(): Promise<BackendCoupon[]> {
  return apiFetch<BackendCoupon[]>("/admin/api/coupons", { method: "GET" });
}

export async function createAdminCoupon(
  payload: CreateCouponRequest,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/admin/api/coupons", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCoupon(
  id: string,
  payload: UpdateCouponRequest,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/admin/api/coupons/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminCoupon(
  id: string,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/admin/api/coupons/${id}`, {
    method: "DELETE",
  });
}
