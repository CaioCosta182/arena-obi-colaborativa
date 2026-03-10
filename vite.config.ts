import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Atualiza o app automaticamente quando houver nova versão
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Arena OBI Colaborativa',
        short_name: 'Arena OBI',
        description: 'Plataforma de Pair Programming Gamificada para a Olimpíada Brasileira de Informática',
        theme_color: '#2563eb', // Azul do Tailwind
        background_color: '#f8fafc', // Fundo Slate-50
        display: 'standalone', // Faz abrir em tela cheia, parecendo um programa nativo (.exe / .apk)
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // A MAGIA ACONTECE AQUI: Guarda TUDO (js, css, html, json do banco de dados) para rodar offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}']
      }
    })
  ],
})
