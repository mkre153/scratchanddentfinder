import { build } from 'velite'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // PARITY: All URLs end with trailing slash (matches scratchanddentfinder.com)
  trailingSlash: true,

  // Enable velite in webpack
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin())
    return config
  },
}

class VeliteWebpackPlugin {
  static started = false
  apply(/** @type {import('webpack').Compiler} */ compiler) {
    // Run velite on first build
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (VeliteWebpackPlugin.started) return
      VeliteWebpackPlugin.started = true
      const dev = compiler.options.mode === 'development'
      await build({ watch: dev, clean: !dev })
    })
  }
}

export default nextConfig
