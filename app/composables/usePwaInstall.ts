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
  // iOS legacy flag + standard display-mode check
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
  const displayStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: minimal-ui)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
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
