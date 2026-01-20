import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/kid_math_game/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['star.svg', 'icon.svg'],
      manifest: {
        name: 'Math Adventure',
        short_name: 'Math Game',
        description: 'Fun math games for kids - addition, subtraction, patterns, and more!',
        theme_color: '#7dd3fc',
        background_color: '#7dd3fc',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      }
    })
  ],
})
