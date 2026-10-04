import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/ferramentas/redirecionar", destination: "/ferramentas/extra", permanent: true },
      { source: "/ferramentas/alocacao", destination: "/ferramentas/orcamento", permanent: true },
      { source: "/ferramentas/mix", destination: "/ferramentas/divisao", permanent: true },
      { source: "/ferramentas/folga", destination: "/ferramentas/renda", permanent: true },
    ];
  },
};

export default nextConfig;
