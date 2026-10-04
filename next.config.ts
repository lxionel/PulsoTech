import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const productionBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/PulsoTech";
if (productionBasePath && !/^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(productionBasePath)) {
  throw new Error("NEXT_PUBLIC_BASE_PATH debe estar vacío o ser una ruta como /PulsoTech.");
}

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? productionBasePath : "",
  trailingSlash: true,
  images: {
    qualities: [75, 100],
    unoptimized: true,
  },
  devIndicators: false,
};

export default nextConfig;
