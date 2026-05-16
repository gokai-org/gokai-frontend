import type { Notice, NoticeCategory } from "@/features/notices/types";

const NOTICE_STORAGE_KEY_PREFIX = "gokai-notices";
const NOTICE_STORAGE_EVENT = "gokai:notices-updated";

type BackendNoticeType =
	| "daily_review"
	| "general_announcement"
	| "general_notice"
	| "streak_reminder"
	| "theme_released";

type NoticeUpdateOptions = {
	markRead?: boolean;
};

function getStorageKey(userId: string) {
	return `${NOTICE_STORAGE_KEY_PREFIX}:${userId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function asString(value: unknown) {
	return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readLocalizedText(value: unknown) {
	if (typeof value === "string") {
		return asString(value);
	}

	if (!isRecord(value)) {
		return null;
	}

	return asString(value.es) ?? asString(value.en) ?? asString(value.default);
}

function toIsoDate(value: unknown) {
	if (typeof value === "number" && Number.isFinite(value)) {
		return new Date(value).toISOString();
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	const raw = asString(value);

	if (!raw) {
		return new Date().toISOString();
	}

	const parsed = new Date(raw);
	return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function normalizeActionHref(value: unknown) {
	const raw = asString(value);

	if (!raw) {
		return undefined;
	}

	if (raw.startsWith("/")) {
		return raw;
	}

	try {
		const url = new URL(raw);
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return raw;
	}
}

function getBackendType(value: unknown): BackendNoticeType | null {
	const type = asString(value);

	switch (type) {
		case "daily_review":
		case "general_announcement":
		case "general_notice":
		case "streak_reminder":
		case "theme_released":
			return type;
		default:
			return null;
	}
}

function mapBackendTypeToCategory(type: BackendNoticeType | null): NoticeCategory {
	switch (type) {
		case "daily_review":
			return "review";
		case "streak_reminder":
			return "streak";
		case "theme_released":
			return "lesson";
		case "general_announcement":
		case "general_notice":
		default:
			return "system";
	}
}

function getDefaultActionHref(type: BackendNoticeType | null) {
	switch (type) {
		case "daily_review":
			return "/dashboard/reviews";
		case "streak_reminder":
			return "/dashboard/statistics";
		case "theme_released":
			return "/dashboard/lessons";
		case "general_announcement":
		case "general_notice":
		default:
			return "/dashboard/notices";
	}
}

function getActionLabel(type: BackendNoticeType | null) {
	switch (type) {
		case "daily_review":
			return "Ir a repasar";
		case "streak_reminder":
			return "Ver mi racha";
		case "theme_released":
			return "Explorar lección";
		case "general_announcement":
		case "general_notice":
		default:
			return "Abrir aviso";
	}
}

function sortNotices(notices: Notice[]) {
	return [...notices].sort((left, right) => {
		if (left.pinned !== right.pinned) {
			return left.pinned ? -1 : 1;
		}

		return (
			new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
		);
	});
}

function isNotice(value: unknown): value is Notice {
	return (
		isRecord(value) &&
		Boolean(asString(value.id)) &&
		Boolean(asString(value.title)) &&
		Boolean(asString(value.description)) &&
		Boolean(asString(value.createdAt)) &&
		typeof value.read === "boolean" &&
		typeof value.pinned === "boolean"
	);
}

function dispatchNoticesUpdated(userId: string) {
	if (typeof window === "undefined") {
		return;
	}

	window.dispatchEvent(
		new CustomEvent(NOTICE_STORAGE_EVENT, { detail: { userId } }),
	);
}

export function readStoredNotices(userId: string) {
	if (typeof window === "undefined") {
		return [] as Notice[];
	}

	try {
		const raw = window.localStorage.getItem(getStorageKey(userId));

		if (!raw) {
			return [] as Notice[];
		}

		const parsed = JSON.parse(raw) as unknown;

		if (!Array.isArray(parsed)) {
			return [] as Notice[];
		}

		return sortNotices(parsed.filter(isNotice));
	} catch {
		return [] as Notice[];
	}
}

export function writeStoredNotices(userId: string, notices: Notice[]) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(
		getStorageKey(userId),
		JSON.stringify(sortNotices(notices)),
	);
	dispatchNoticesUpdated(userId);
}

export function updateStoredNotices(
	userId: string,
	updater: (current: Notice[]) => Notice[],
) {
	const next = updater(readStoredNotices(userId));
	writeStoredNotices(userId, next);
	return next;
}

export function subscribeToStoredNotices(
	userId: string,
	onChange: (notices: Notice[]) => void,
) {
	if (typeof window === "undefined") {
		return () => {};
	}

	const handleCustomEvent = (event: Event) => {
		const detail = (event as CustomEvent<{ userId?: string }>).detail;

		if (detail?.userId === userId) {
			onChange(readStoredNotices(userId));
		}
	};

	const handleStorage = (event: StorageEvent) => {
		if (event.key === getStorageKey(userId)) {
			onChange(readStoredNotices(userId));
		}
	};

	window.addEventListener(NOTICE_STORAGE_EVENT, handleCustomEvent);
	window.addEventListener("storage", handleStorage);

	return () => {
		window.removeEventListener(NOTICE_STORAGE_EVENT, handleCustomEvent);
		window.removeEventListener("storage", handleStorage);
	};
}

export function mapOneSignalEventToNotice(event: unknown): Notice | null {
	const payload = isRecord(event)
		? isRecord(event.notification)
			? event.notification
			: event
		: null;

	if (!payload) {
		return null;
	}

	const data = isRecord(payload.additionalData)
		? payload.additionalData
		: isRecord(payload.data)
			? payload.data
			: {};

	const backendType =
		getBackendType(data.type) ?? getBackendType(payload.type) ?? null;
	const title =
		asString(payload.title) ??
		readLocalizedText(payload.headings) ??
		"Notificación";
	const description =
		asString(payload.body) ??
		readLocalizedText(payload.contents) ??
		asString(data.message) ??
		"Tienes una nueva notificación.";
	const createdAt = toIsoDate(
		payload.sentAt ?? payload.createdAt ?? data.sentAt ?? Date.now(),
	);
	const actionHref =
		normalizeActionHref(payload.launchURL) ??
		normalizeActionHref(payload.url) ??
		normalizeActionHref(data.url) ??
		getDefaultActionHref(backendType);
	const id =
		asString(payload.notificationId) ??
		asString(payload.id) ??
		`${backendType ?? "notice"}:${title}:${createdAt}`;

	return {
		id,
		title,
		description,
		category: mapBackendTypeToCategory(backendType),
		read: false,
		pinned: false,
		createdAt,
		actionLabel: actionHref ? getActionLabel(backendType) : undefined,
		actionHref,
	};
}

export function upsertIncomingNotice(
	userId: string,
	incoming: Notice,
	options: NoticeUpdateOptions = {},
) {
	return updateStoredNotices(userId, (current) => {
		const existing = current.find((notice) => notice.id === incoming.id);
		const merged: Notice = {
			...existing,
			...incoming,
			read:
				(existing?.read ?? false) ||
				incoming.read ||
				Boolean(options.markRead),
			pinned: existing?.pinned ?? incoming.pinned,
		};

		return [
			merged,
			...current.filter((notice) => notice.id !== incoming.id),
		];
	});
}

export function toggleStoredNoticeRead(userId: string, noticeId: string) {
	return updateStoredNotices(userId, (current) =>
		current.map((notice) =>
			notice.id === noticeId ? { ...notice, read: !notice.read } : notice,
		),
	);
}

export function toggleStoredNoticePin(userId: string, noticeId: string) {
	return updateStoredNotices(userId, (current) =>
		current.map((notice) =>
			notice.id === noticeId ? { ...notice, pinned: !notice.pinned } : notice,
		),
	);
}

export function deleteStoredNotice(userId: string, noticeId: string) {
	return updateStoredNotices(userId, (current) =>
		current.filter((notice) => notice.id !== noticeId),
	);
}

export function markAllStoredNoticesRead(userId: string) {
	return updateStoredNotices(userId, (current) =>
		current.map((notice) => ({ ...notice, read: true })),
	);
}

export function clearStoredReadNotices(userId: string) {
	return updateStoredNotices(userId, (current) =>
		current.filter((notice) => !notice.read),
	);
}
