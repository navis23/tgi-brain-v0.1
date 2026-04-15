// Cross-platform PWA install affordance.
// - Chromium (desktop + Android): capture `beforeinstallprompt`, call prompt() on user gesture.
// - iOS Safari: no programmatic prompt exists; show manual "Add to Home Screen" hint instead.
// - Installed (standalone): hide everything.

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Module-level singletons so every consumer sees the same state.
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const isStandalone = ref(false)
const isIos = ref(false)
const initialized = ref(false)

const checkStandalone = () => {
  if (typeof window === 'undefined') return false
  // iOS legacy flag + standard display-mode check.
  // Only match `standalone` — `minimal-ui` and `fullscreen` can spuriously
  // match regular browser tabs on some Chrome builds (observed on macOS),
  // which would hide the install button inside a normal tab.
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
  const displayStandalone = window.matchMedia('(display-mode: standalone)').matches
  return iosStandalone || displayStandalone
}

const detectIos = () => {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  const isIphoneOrIpad = /iPad|iPhone|iPod/.test(ua)
  // iPad on iPadOS 13+ reports as MacIntel with touch support
  const isIpadOS = ua.includes('Macintosh') && 'ontouchend' in document
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
  return (isIphoneOrIpad || isIpadOS) && isSafari
}

export const usePwaInstall = () => {
  const init = () => {
    if (initialized.value || typeof window === 'undefined') return
    initialized.value = true

    isStandalone.value = checkStandalone()
    isIos.value = detectIos()

    // Pick up a prompt that was captured by the inline <head> script before
    // the JS bundle loaded. Chrome fires `beforeinstallprompt` very early —
    // often before any framework code runs — so the inline script is the only
    // reliable way to catch it. We collect the stashed value here and delete
    // it from window to avoid leaking a reference.
    const w = window as Window & { __pwaPrompt?: BeforeInstallPromptEvent }
    if (w.__pwaPrompt) {
      deferredPrompt.value = w.__pwaPrompt
      delete w.__pwaPrompt
    }

    // Also keep listening for future fires (e.g. after the user dismisses and
    // Chrome re-evaluates installability, or in browsers that fire it later).
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e as BeforeInstallPromptEvent
    })

    window.addEventListener('appinstalled', () => {
      deferredPrompt.value = null
      isStandalone.value = true
    })

    // React to display-mode changes (rare but handle it)
    const mq = window.matchMedia('(display-mode: standalone)')
    mq.addEventListener?.('change', (e) => {
      if (e.matches) isStandalone.value = true
    })

    // Expose state on window for debugging installability from DevTools.
    // Inspect via: __pwaDebug.deferredPrompt / isStandalone / isIos
    ;(window as Window & { __pwaDebug?: unknown }).__pwaDebug = {
      get deferredPrompt() { return deferredPrompt.value },
      get isStandalone() { return isStandalone.value },
      get isIos() { return isIos.value },
    }
  }

  // Can we show any install UI? (Chromium prompt available, OR iOS manual hint, AND not installed)
  const canInstall = computed(() => {
    if (isStandalone.value) return false
    return !!deferredPrompt.value || isIos.value
  })

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'ios-manual' | 'unavailable'> => {
    if (isStandalone.value) return 'unavailable'
    if (deferredPrompt.value) {
      try {
        await deferredPrompt.value.prompt()
        const choice = await deferredPrompt.value.userChoice
        deferredPrompt.value = null
        return choice.outcome
      } catch {
        return 'unavailable'
      }
    }
    if (isIos.value) return 'ios-manual'
    return 'unavailable'
  }

  return {
    init,
    canInstall,
    isStandalone: readonly(isStandalone),
    isIos: readonly(isIos),
    hasNativePrompt: computed(() => !!deferredPrompt.value),
    promptInstall,
  }
}
