/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ZERO_CACHE_URL: string
  readonly VITE_APP_URL: string
  readonly VITE_PRESENCE_WS_URL: string
  readonly VITE_STRIPE_PRICE_RUNNING: string
  readonly VITE_STRIPE_PRICE_DEVELOPMENT: string
  readonly VITE_VAPID_PUBLIC_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
