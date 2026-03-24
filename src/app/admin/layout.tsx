import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function normalizeProfile(value?: string): "admin" | "user" | null {
	if (!value) return null;

	const normalized = value.trim().toLowerCase();
	if (normalized === "admin" || normalized === "user") return normalized;

	return null;
}

function getProfileFromToken(token?: string): "admin" | "user" | null {
	if (!token) return null;

	try {
		const parts = token.split(".");
		if (parts.length !== 3) return null;

		const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
		return normalizeProfile(payload?.profile ?? payload?.role);
	} catch {
		return null;
	}
}

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const store = await cookies();
	const token = store.get("gokai_token")?.value;

	if (!token) {
		redirect("/auth/login?from=/admin/dashboard");
	}

	const cookieProfile = normalizeProfile(store.get("gokai_profile")?.value);
	const tokenProfile = getProfileFromToken(token);
	const profile = tokenProfile ?? cookieProfile;

	if (profile !== "admin") {
		redirect("/dashboard/graph");
	}

	return children;
}
