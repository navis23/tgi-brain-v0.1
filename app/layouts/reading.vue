<template>
  <div class="min-h-screen w-full bg-brain-50 text-brain-900 font-sans selection:bg-brain-900 selection:text-white flex flex-col pt-[72px]">
    
    <!-- Architectural Grid Background -->
    <div class="fixed inset-0 z-0 pointer-events-none opacity-10" style="background-size: 24px 24px; background-image: linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px);"></div>

    <header class="fixed top-0 left-0 w-full z-40 border-b-2 border-brain-900 bg-white">
      <div class="max-w-4xl mx-auto w-full px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="brutal-btn flex items-center gap-2 px-4 py-2 bg-white border-2 border-brain-900 text-brain-900 shadow-[2px_2px_0px_#111] hover:-translate-y-0.5 transition-all text-xs cursor-pointer"
          >
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
            <span class="font-display font-bold uppercase">Return</span>
          </button>
        </div>

        <!-- Action slot (page can teleport here if needed) -->
        <div id="reading-header-actions" class="flex items-center gap-2"></div>
      </div>
    </header>

    <!-- Main article container -->
    <main class="relative z-10 flex-1 w-full bg-transparent">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/notes')
  }
}
</script>
