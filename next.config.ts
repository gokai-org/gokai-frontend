import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // API Base URLs
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    GOKAI_USERS_API_BASE: process.env.GOKAI_USERS_API_BASE,
    GOKAI_CONTENT_API_BASE: process.env.GOKAI_CONTENT_API_BASE,
    
    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  },
};

export default nextConfig;
