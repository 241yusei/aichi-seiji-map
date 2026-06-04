/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静的生成（SSG）中心。`out/` に書き出す。
  output: "export",
  // 静的エクスポートでは next/image の最適化を無効化する。
  images: { unoptimized: true },
  // 各ページを `path/index.html` として出力し、ホスティング非依存にする。
  trailingSlash: true,
};

export default nextConfig;
