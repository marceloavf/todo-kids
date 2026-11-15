import { defineConfig } from '@playwright/test'

const PORT = 4319

export default defineConfig({
  testDir: 'e2e',
  // Not `*.spec.ts`: Vitest's default glob would pick those up.
  testMatch: '*.e2e.ts',
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}/`,
    // The system Chrome; no Playwright browser download.
    channel: 'chrome',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    locale: 'pt-BR',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run build && npx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
