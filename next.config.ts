import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixa a raiz no diretório do frontend (há outro lockfile na raiz do repo).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
