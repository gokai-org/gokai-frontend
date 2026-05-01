import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	outputFileTracingRoot: path.resolve(__dirname),
	webpack: (config) => {
		config.resolve ??= {};
		config.resolve.alias ??= {};
		config.resolve.alias["react-is"] = path.resolve(
			__dirname,
			"src/shared/lib/reactIsShim.ts",
		);
		return config;
	},
};

export default nextConfig;
