import { lazy, Suspense, createContext, useContext, useCallback } from 'react'
import { schema } from '@/zero/schema'
import { mutators } from '@/zero/mutators'
import { useAuth } from './auth-provider'
import { createClient } from '@/lib/supabase/client'

// Use React lazy to defer loading the ZeroProvider (client-side only)
const ZeroProvider = lazy(() =>
  import('@rocicorp/zero/react').then(mod => ({
    default: mod.ZeroProvider
  }))
)

const ZeroReadyContext = createContext(false)

export function useZeroReady() {
  return useContext(ZeroReadyContext)
}

export function ZeroAppProvider({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  const auth = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token
  }, [])

  if (loading || !session) {
    return (
      <ZeroReadyContext.Provider value={false}>
        {children}
      </ZeroReadyContext.Provider>
    )
  }

  const { user } = session

  return (
    <Suspense fallback={
      <ZeroReadyContext.Provider value={false}>
        {children}
      </ZeroReadyContext.Provider>
    }>
      <ZeroReadyContext.Provider value={true}>
        <ZeroProvider
          userID={user.id}
          context={{ userID: user.id, email: user.email! }}
          cacheURL={import.meta.env.VITE_ZERO_CACHE_URL!}
          queryURL={`${import.meta.env.VITE_APP_URL}/api/query`}
          mutateURL={`${import.meta.env.VITE_APP_URL}/api/mutate`}
          auth={auth}
          schema={schema}
          mutators={mutators}
        >
          {children}
        </ZeroProvider>
      </ZeroReadyContext.Provider>
    </Suspense>
  )
}
