export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth check for login page
  if (to.path === '/login') return

  // Only run on client side
  if (import.meta.server) return

  const { user, initAuth, isLoading, isInitialized } = useAuth()

  // Initialize auth if not yet done
  if (!isInitialized.value) {
    await initAuth()
  }

  // Wait for loading to complete
  if (isLoading.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(isLoading, (val) => {
        if (!val) {
          unwatch()
          resolve()
        }
      })
    })
  }

  // Redirect to login if not authenticated
  if (!user.value) {
    return navigateTo('/login')
  }
})
