import path from "node:path";
import type { NextConfig } from "next";

function firstNonEmpty(...values: Array<string | undefined>) {
	for (const value of values) {
		const trimmed = value?.trim();
		if (trimmed) {
			return trimmed;
		}
	}

	return "";
}

const notificationsApiOrigin = firstNonEmpty(
	process.env.GOKAI_NOTIFICATIONS_API_BASE,
	process.env.GOKAI_NOTIFICATIONS_API_URL,
	process.env.NOTIFICATIONS_API_BASE,
	process.env.NOTIFICATIONS_API_URL,
	process.env.GOKAI_NOTIFICATION_API_BASE,
	process.env.GOKAI_NOTIFICATION_API_URL,
);

const nextConfig: NextConfig = {
	distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
	outputFileTracingRoot: path.resolve(__dirname),
	async rewrites() {
		if (!notificationsApiOrigin || notificationsApiOrigin.startsWith("/")) {
			return [];
		}

		return [
			{
				source: "/_services/notifications/:path*",
				destination: `${notificationsApiOrigin.replace(/\/$/, "")}/:path*`,
			},
		];
	},
};

export default nextConfig;
