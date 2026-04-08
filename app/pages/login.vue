<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-brain-50" data-layout="auth">
    <!-- Grid background for The Archive -->
    <div class="absolute inset-0 z-0 pointer-events-none opacity-10" style="background-size: 40px 40px; background-image: linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px);"></div>

    <!-- Login Card -->
    <div class="relative z-10 w-full max-w-md mx-4">
      <div class="brutal-card p-10">
        <!-- Logo -->
        <div class="text-center mb-10 border-b-2 border-brain-900 pb-8">
          <h1 class="text-3xl font-display font-bold text-brain-900 uppercase tracking-tighter">THE ARCHIVE</h1>
          <p class="text-[10px] font-mono text-brain-500 mt-2 uppercase tracking-widest">TGI Intelligence System</p>
        </div>

        <!-- Toggle -->
        <div class="flex border-2 border-brain-900 mb-8 p-1 bg-brain-100">
          <button
            @click="isSignUp = false"
            class="flex-1 py-3 text-xs font-display font-bold uppercase transition-all duration-100 cursor-pointer"
            :class="!isSignUp ? 'bg-brain-900 text-brain-50' : 'text-brain-600 hover:text-brain-900'"
          >
            Access
          </button>
          <button
            @click="isSignUp = true"
            class="flex-1 py-3 text-xs font-display font-bold uppercase transition-all duration-100 cursor-pointer"
            :class="isSignUp ? 'bg-brain-900 text-brain-50' : 'text-brain-600 hover:text-brain-900'"
          >
            Register
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest mb-2">Identification (Email)</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="operator@tgicorp.com"
              class="w-full px-4 py-3 bg-white border-2 border-brain-900 text-sm font-mono text-brain-900 placeholder:text-brain-400 focus:outline-none focus:bg-brain-100 transition-all duration-100"
            />
          </div>

          <div>
            <label class="block text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest mb-2">Security Key</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              minlength="6"
              class="w-full px-4 py-3 bg-white border-2 border-brain-900 text-sm font-mono text-brain-900 placeholder:text-brain-400 focus:outline-none focus:bg-brain-100 transition-all duration-100"
            />
          </div>

          <!-- Error -->
          <div v-if="errorMsg" class="flex items-start gap-2 px-4 py-3 bg-[#FF3366] border-2 border-brain-900 text-xs font-mono font-bold text-white shadow-[2px_2px_0px_#111]">
            <Icon name="lucide:alert-triangle" class="w-4 h-4 shrink-0 mt-0.5" />
            <span class="leading-tight">{{ errorMsg }}</span>
          </div>

          <!-- Success -->
          <div v-if="successMsg" class="flex items-start gap-2 px-4 py-3 bg-[#00C853] border-2 border-brain-900 text-xs font-mono font-bold text-white shadow-[2px_2px_0px_#111]">
            <Icon name="lucide:check-square" class="w-4 h-4 shrink-0 mt-0.5" />
            <span class="leading-tight">{{ successMsg }}</span>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-4 bg-brain-900 text-brain-50 text-sm brutal-btn mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
              <Icon name="lucide:loader" class="w-4 h-4 animate-spin" />
              {{ isSignUp ? 'Allocating...' : 'Authenticating...' }}
            </span>
            <span v-else>{{ isSignUp ? 'Generate Credentials' : 'Initialize Session' }}</span>
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
      successMsg.value = 'Credentials generated. Await confirmation via email protocols.'
    } else {
      await signIn(email.value, password.value)
      router.push('/')
    }
  } catch (error: unknown) {
    errorMsg.value = error instanceof Error ? error.message : 'System error. Access denied.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
