<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden" data-layout="auth">
    <!-- Animated background -->
    <div class="absolute inset-0 bg-brain-950">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-entity-tgi/10 rounded-full blur-3xl animate-pulse" />
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-entity-drc/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-entity-enterbiner/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s" />
    </div>

    <!-- Login Card -->
    <div class="relative z-10 w-full max-w-md mx-4">
      <div class="bg-brain-900/60 backdrop-blur-2xl border border-brain-700/50 rounded-2xl p-8 shadow-2xl">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-entity-tgi to-entity-drc flex items-center justify-center mx-auto mb-4 shadow-lg shadow-entity-tgi/30">
            <Icon name="lucide:brain" class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-brain-50 tracking-tight">TGI BRAIN</h1>
          <p class="text-sm text-brain-400 mt-1">Conglomerate Knowledge System</p>
        </div>

        <!-- Toggle -->
        <div class="flex bg-brain-800/60 rounded-xl p-1 mb-6">
          <button
            @click="isSignUp = false"
            class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
            :class="!isSignUp ? 'bg-brain-700 text-brain-50 shadow-sm' : 'text-brain-400 hover:text-brain-300'"
          >
            Sign In
          </button>
          <button
            @click="isSignUp = true"
            class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
            :class="isSignUp ? 'bg-brain-700 text-brain-50 shadow-sm' : 'text-brain-400 hover:text-brain-300'"
          >
            Sign Up
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-brain-300 mb-1.5">Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="your@email.com"
              class="w-full px-4 py-3 bg-brain-800/60 border border-brain-700/50 rounded-xl text-sm text-brain-100 placeholder:text-brain-500 focus:outline-none focus:border-entity-tgi/50 focus:ring-1 focus:ring-entity-tgi/20 transition-all duration-200"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-brain-300 mb-1.5">Password</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              minlength="6"
              class="w-full px-4 py-3 bg-brain-800/60 border border-brain-700/50 rounded-xl text-sm text-brain-100 placeholder:text-brain-500 focus:outline-none focus:border-entity-tgi/50 focus:ring-1 focus:ring-entity-tgi/20 transition-all duration-200"
            />
          </div>

          <!-- Error -->
          <div v-if="errorMsg" class="flex items-center gap-2 px-4 py-3 bg-entity-enterbiner/10 border border-entity-enterbiner/20 rounded-xl text-sm text-entity-enterbiner">
            <Icon name="lucide:alert-circle" class="w-4 h-4 shrink-0" />
            {{ errorMsg }}
          </div>

          <!-- Success -->
          <div v-if="successMsg" class="flex items-center gap-2 px-4 py-3 bg-entity-mbink/10 border border-entity-mbink/20 rounded-xl text-sm text-entity-mbink">
            <Icon name="lucide:check-circle" class="w-4 h-4 shrink-0" />
            {{ successMsg }}
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-3 bg-gradient-to-r from-entity-tgi to-entity-drc rounded-xl text-sm font-semibold text-white shadow-lg shadow-entity-tgi/20 hover:shadow-entity-tgi/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
              <Icon name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              {{ isSignUp ? 'Creating account...' : 'Signing in...' }}
            </span>
            <span v-else>{{ isSignUp ? 'Create Account' : 'Sign In' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { signIn, signUp } = useAuth()
const router = useRouter()

const isSignUp = ref(false)
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    if (isSignUp.value) {
      await signUp(email.value, password.value)
      successMsg.value = 'Account created! Check your email for confirmation.'
    } else {
      await signIn(email.value, password.value)
      router.push('/')
    }
  } catch (error: any) {
    errorMsg.value = error.message || 'An error occurred'
  } finally {
    isSubmitting.value = false
  }
}
</script>
