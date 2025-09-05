// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // optional: kalau nanti pakai <Image> tanpa loader custom,
  // aktifkan ini untuk mencegah dynamic optimization di server
  // images: { unoptimized: true },
};

export default nextConfig;
