"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getAdminCoupons } from "../services/api";
import { mapBackendCouponToAdmin } from "../utils/couponMappers";
import type { AdminCoupon, AdminCouponStatus } from "../types/coupons";

export type CouponStatusFilter = "all" | AdminCouponStatus;

function normalize(text: string) {
  return text.trim().toLowerCase();
}

export function useAdminCoupons() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CouponStatusFilter>("all");
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const mountedRef = useRef(false);

  const loadCoupons = useCallback(async (silent = false) => {
    if (!mountedRef.current) return;

    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const raw = await getAdminCoupons();
      const mapped = raw.map(mapBackendCouponToAdmin);

      if (!mountedRef.current) return;

      setCoupons(mapped);
      setLastUpdatedAt(Date.now());
    } catch (err) {
      if (!mountedRef.current) return;

      if (!silent) {
        setCoupons([]);
      }

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar cupones desde backend",
      );
    } finally {
      if (!mountedRef.current) return;

      if (silent) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadCoupons(false);

    return () => {
      mountedRef.current = false;
    };
  }, [loadCoupons]);

  useEffect(() => {
    const POLLING_INTERVAL_MS = 30000;

    const timer = window.setInterval(() => {
      void loadCoupons(true);
    }, POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [loadCoupons]);

  useEffect(() => {
    const onFocus = () => {
      void loadCoupons(true);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadCoupons(true);
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [loadCoupons]);

  const reloadCoupons = useCallback(async () => {
    await loadCoupons(true);
  }, [loadCoupons]);

  const summary = useMemo(() => {
    return {
      total: coupons.length,
      active: coupons.filter((c) => c.status === "active").length,
      expired: coupons.filter((c) => c.status === "expired").length,
    };
  }, [coupons]);

  const searchableCoupons = useMemo(
    () =>
      coupons.map((coupon) => ({
        coupon,
        searchable: normalize(
          [
            coupon.id,
            coupon.code,
            coupon.description ?? "",
            String(coupon.months),
            String(coupon.claimLimit),
          ].join(" "),
        ),
      })),
    [coupons],
  );

  const filteredCoupons = useMemo(() => {
    const q = normalize(deferredQuery);

    return searchableCoupons
      .filter(({ coupon, searchable }) => {
        const matchStatus =
          statusFilter === "all" ? true : coupon.status === statusFilter;
        const matchQuery = q ? searchable.includes(q) : true;

        return matchStatus && matchQuery;
      })
      .map(({ coupon }) => coupon);
  }, [deferredQuery, searchableCoupons, statusFilter]);

  function replaceCoupon(updated: AdminCoupon) {
    setCoupons((prev) =>
      prev.map((coupon) => (coupon.id === updated.id ? updated : coupon)),
    );
  }

  function removeCoupon(id: string) {
    setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
  }

  function addCoupon(coupon: AdminCoupon) {
    setCoupons((prev) => [coupon, ...prev]);
  }

  return {
    query,
    setQuery,
    loading,
    isRefreshing,
    lastUpdatedAt,
    error,
    statusFilter,
    setStatusFilter,
    summary,
    filteredCoupons,
    allCoupons: coupons,
    reloadCoupons,
    replaceCoupon,
    removeCoupon,
    addCoupon,
  };
}
