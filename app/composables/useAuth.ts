import type { User } from '@supabase/supabase-js'

const currentUser = ref<User | null>(null)
const isLoading = ref(true)
const isInitialized = ref(false)
let authSubscription: { unsubscribe: () => void } | null = null

export const useAuth = () => {
  const supabase = useSupabase()
  const router = useRouter()

  const initAuth = async () => {
    if (isInitialized.value) return
    isInitialized.value = true
    isLoading.value = true

    try {
      const { data: { session } } = await supabase.auth.getSession()
      currentUser.value = session?.user ?? null

      // Unsubscribe previous listener if any, then register new one
      authSubscription?.unsubscribe()
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        currentUser.value = session?.user ?? null
      })
      authSubscription = data.subscription
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      isLoading.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    currentUser.value = data.user
    return data
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    currentUser.value = null
    router.push('/login')
  }

  return {
    user: currentUser,
    isLoading,
    isInitialized,
    initAuth,
    signIn,
    signUp,
    signOut,
  }
}
