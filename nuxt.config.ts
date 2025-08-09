// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxt/icon'
  ],
  css: ['~/assets/css/main.css'],
  
  // Vercel deployment configuration
  nitro: {
    preset: 'vercel-edge',
    experimental: {
      wasm: true
    }
  },
  
  runtimeConfig: {
    // Private keys (only available on server-side)
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    
    // Email configuration
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT || '587',
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    
    // Public keys (exposed to client-side)
    public: {
      appName: 'TenantX',
      appVersion: '2.0.0',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  },
  
  // Performance optimizations for free tier
  experimental: {
    payloadExtraction: false
  },
  
  // Optimize for serverless
  ssr: true,
  
  // Build optimizations
  build: {
    transpile: []
  }
})
