/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignora verificações de tipo durante o build
  typescript: {
    // Ignorar erros de verificação de tipo durante o build para produção
    ignoreBuildErrors: true,
  },
  // Ignora erros de lint durante o build
  eslint: {
    // Ignorar erros de lint durante o build para produção
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 