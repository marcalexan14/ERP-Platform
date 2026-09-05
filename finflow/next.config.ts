import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default 1MB is too small for receipt photos/PDFs attached to expenses.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
