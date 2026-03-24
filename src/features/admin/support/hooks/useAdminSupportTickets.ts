"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getAdminSupportTickets } from "../services/api";
import {
  flattenGroupedSupportTickets,
  mapBackendTicketToAdminTicket,
} from "../utils/supportTicketMappers";
import type {
  AdminTicketCategory,
  AdminSupportTicket,
  AdminTicketStatus,
} from "../types/tickets";

export type SupportStatusFilter = "all" | AdminTicketStatus;
export type SupportCategoryFilter = "all" | AdminTicketCategory;

function normalize(text: string) {
  return text.trim().toLowerCase();
}

export function useAdminSupportTickets() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportStatusFilter>("all");
  const [categoryFilter, setCategoryFilter] =
    useState<SupportCategoryFilter>("all");
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const mountedRef = useRef(false);

  const loadTickets = useCallback(async (silent = false) => {
    if (!mountedRef.current) return;

    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const grouped = await getAdminSupportTickets();
      const flat = flattenGroupedSupportTickets(grouped);
      const mapped = flat.map(mapBackendTicketToAdminTicket);

      if (!mountedRef.current) return;

      setTickets(mapped);
      setLastUpdatedAt(Date.now());
    } catch (err) {
      if (!mountedRef.current) return;

      if (!silent) {
        setTickets([]);
      }

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar tickets desde backend",
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
    void loadTickets(false);

    return () => {
      mountedRef.current = false;
    };
  }, [loadTickets]);

  useEffect(() => {
    const POLLING_INTERVAL_MS = 15000;

    const timer = window.setInterval(() => {
      void loadTickets(true);
    }, POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [loadTickets]);

  useEffect(() => {
    const onFocus = () => {
      void loadTickets(true);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadTickets(true);
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [loadTickets]);

  const reloadTickets = useCallback(async () => {
    await loadTickets(true);
  }, [loadTickets]);

  const summary = useMemo(() => {
    const source = tickets;

    return {
      total: source.length,
      open: source.filter((x) => x.status === "open").length,
      inProgress: source.filter((x) => x.status === "in_progress").length,
      resolved: source.filter((x) => x.status === "resolved").length,
      closed: source.filter((x) => x.status === "closed").length,
    };
  }, [tickets]);

  const searchableTickets = useMemo(
    () =>
      tickets.map((ticket) => ({
        ticket,
        searchable: normalize(
          [
            ticket.id,
            ticket.name,
            ticket.email,
            ticket.subject,
            ticket.message,
            ticket.note ?? "",
          ].join(" "),
        ),
      })),
    [tickets],
  );

  const filteredTickets = useMemo(() => {
    const q = normalize(deferredQuery);

    return searchableTickets
      .filter(({ ticket, searchable }) => {
        const matchStatus =
          statusFilter === "all" ? true : ticket.status === statusFilter;
        const matchCategory =
          categoryFilter === "all" ? true : ticket.category === categoryFilter;
        const matchQuery = q ? searchable.includes(q) : true;

        return matchStatus && matchCategory && matchQuery;
      })
      .map(({ ticket }) => ticket);
  }, [categoryFilter, deferredQuery, searchableTickets, statusFilter]);

  function replaceTicket(updated: AdminSupportTicket) {
    setTickets((prev) =>
      prev.map((ticket) => (ticket.id === updated.id ? updated : ticket)),
    );
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
    categoryFilter,
    setCategoryFilter,
    summary,
    filteredTickets,
    allTickets: tickets,
    reloadTickets,
    replaceTicket,
  };
}
