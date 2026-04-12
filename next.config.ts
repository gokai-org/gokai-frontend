import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	outputFileTracingRoot: path.resolve(__dirname),
	experimental: {
		turbopackPluginRuntimeStrategy: "workerThreads",
		memoryBasedWorkersCount: true,
	},
};

export default nextConfig;
