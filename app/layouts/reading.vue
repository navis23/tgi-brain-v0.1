<template>
  <div class="min-h-screen w-full bg-brain-950 text-brain-50 font-sans selection:bg-entity-sbs/30 selection:text-white flex flex-col pt-[72px]">
    
    <header class="fixed top-0 left-0 w-full z-40 border-b border-brain-800/40 bg-brain-950/80 backdrop-blur-md">
      <div class="max-w-4xl mx-auto w-full px-4 md:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-lg text-brain-400 hover:text-brain-100 hover:bg-brain-800/50 transition-all group cursor-pointer"
          >
            <Icon name="lucide:arrow-left" class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span class="text-sm font-medium">Back</span>
          </button>
        </div>

        <!-- Action slot (page can teleport here if needed, or we just keep it simple) -->
        <div id="reading-header-actions" class="flex items-center gap-2"></div>
      </div>
    </header>

    <!-- Main article container -->
    <main class="flex-1 w-full bg-brain-900/10">
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
