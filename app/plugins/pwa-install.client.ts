// Capture the `beforeinstallprompt` event as early as possible.
// If we wait for a component's onMounted (e.g. InstallPwaButton), Chrome may
// have already fired the event and we'd miss it — the install button would
// never appear. Running at plugin init guarantees the listener is attached
// before the browser decides to prompt.
import { usePwaInstall } from '~/composables/usePwaInstall'

export default defineNuxtPlugin(() => {
  const { init } = usePwaInstall()
  init()
})
