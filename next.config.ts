import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Static export (GitHub Pages) has no image-optimization server, so the
  // default next/image loader is incompatible — serve images as-is.
  images: { unoptimized: true },
};

export default nextConfig;
