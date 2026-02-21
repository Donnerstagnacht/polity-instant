import { lazy, Suspense, createContext, useContext, useMemo } from 'react'
import { schema } from '@/zero/schema'
import { mutators } from '@/zero/mutators'
import { useAuth } from './auth-provider'

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

  const zeroContext = useMemo(
    () => session ? { userID: session.user.id, email: session.user.email! } : null,
    [session?.user?.id, session?.user?.email]
  )

  if (loading || !session || !zeroContext) {
    return (
      <ZeroReadyContext.Provider value={false}>
        {children}
      </ZeroReadyContext.Provider>
    )
  }

  return (
    <Suspense fallback={
      <ZeroReadyContext.Provider value={false}>
        {children}
      </ZeroReadyContext.Provider>
    }>
      <ZeroReadyContext.Provider value={true}>
        <ZeroProvider
          userID={session.user.id}
          context={zeroContext}
          cacheURL={import.meta.env.VITE_ZERO_CACHE_URL!}
          queryURL={`${import.meta.env.VITE_APP_URL}/api/query`}
          mutateURL={`${import.meta.env.VITE_APP_URL}/api/mutate`}
          auth={session.access_token}
          schema={schema}
          mutators={mutators}
        >
          {children}
        </ZeroProvider>
      </ZeroReadyContext.Provider>
    </Suspense>
  )
}
