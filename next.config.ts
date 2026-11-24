import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_DbG5pZQNdk6x@ep-square-shadow-bj1rycnk-pooler.c-3.eu-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
    AUTH_SECRET:
      process.env.AUTH_SECRET ||
      "f6c8d7e9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9",
  },
};

export default nextConfig;
