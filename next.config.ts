import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/pt-BR", destination: "/", permanent: true },
      { source: "/pt-BR/:path*", destination: "/:path*", permanent: true },
      { source: "/login", destination: "/", permanent: true },
      { source: "/login/:path*", destination: "/", permanent: true },
      { source: "/dashboard", destination: "/", permanent: true },
      { source: "/dashboard/:path*", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
