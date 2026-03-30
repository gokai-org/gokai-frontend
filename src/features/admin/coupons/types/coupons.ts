export type AdminCouponStatus = "active" | "expired" | "depleted";

export interface BackendCoupon {
  id: string;
  code: string;
  description?: string | null;
  vigency: string;
  claim_limit: number;
  months: number;
  created_at: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  description: string | null;
  vigency: string;
  claimLimit: number;
  months: number;
  createdAt: string;
  status: AdminCouponStatus;
}

export interface CreateCouponRequest {
  code: string;
  description?: string;
  claimLimit: number;
  months: number;
  vigency: string;
}

export interface UpdateCouponRequest {
  code: string;
  description?: string;
  claimLimit: number;
  months: number;
  vigency: string;
}
