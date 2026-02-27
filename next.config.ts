import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/LabourDemandPWA",
  assetPrefix: "/LabourDemandPWA/",
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
};

export default nextConfig;
