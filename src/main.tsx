import '@fontsource-variable/nunito'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { SessionProvider } from './lib/session.tsx'
import { keepAudioUnlocked } from './lib/sound.ts'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1 } } })
keepAudioUnlocked()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <App />
      </SessionProvider>
    </QueryClientProvider>
  </StrictMode>,
)
