<template>
  <div v-if="canInstall">
    <!-- Chromium / Android: native prompt -->
    <button
      v-if="hasNativePrompt"
      @click="handleInstall"
      class="brutal-btn w-full flex items-center gap-2 px-3 py-2 bg-[#4B4DED] text-white border-2 border-brain-900 shadow-[2px_2px_0px_#111] text-[10px] font-mono font-bold uppercase tracking-widest cursor-pointer hover:-translate-y-0.5 transition-transform"
      title="Install TGI BRAIN as an app"
    >
      <Icon name="lucide:download" class="w-4 h-4 shrink-0" />
      <span class="truncate">Install App</span>
    </button>

    <!-- iOS Safari: manual instructions -->
    <button
      v-else-if="isIos"
      @click="showIosHint = true"
      class="brutal-btn w-full flex items-center gap-2 px-3 py-2 bg-[#4B4DED] text-white border-2 border-brain-900 shadow-[2px_2px_0px_#111] text-[10px] font-mono font-bold uppercase tracking-widest cursor-pointer hover:-translate-y-0.5 transition-transform"
      title="Add TGI BRAIN to your Home Screen"
    >
      <Icon name="lucide:share" class="w-4 h-4 shrink-0" />
      <span class="truncate">Add to Home Screen</span>
    </button>
  </div>

  <!-- iOS instructions modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showIosHint"
        class="fixed inset-0 bg-brain-900/60 z-[200] flex items-end md:items-center justify-center p-0 md:p-6"
        @click="showIosHint = false"
      >
        <div
          class="w-full md:max-w-md bg-white border-2 border-brain-900 shadow-[6px_6px_0px_#111] p-6 space-y-4"
          @click.stop
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 border-2 border-brain-900 bg-[#4B4DED] text-white flex items-center justify-center shadow-[2px_2px_0px_#111]">
                <Icon name="lucide:share" class="w-5 h-5" />
              </div>
              <h3 class="font-display font-bold text-brain-900 uppercase tracking-tight text-lg">Install TGI BRAIN</h3>
            </div>
            <button @click="showIosHint = false" class="text-brain-900 p-1 cursor-pointer">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>

          <p class="text-xs font-mono text-brain-600 leading-relaxed">
            iOS doesn't expose a one-click install. Add it manually:
          </p>

          <ol class="space-y-3 text-xs font-mono text-brain-900">
            <li class="flex gap-3">
              <span class="shrink-0 w-6 h-6 border-2 border-brain-900 bg-brain-100 flex items-center justify-center font-bold">1</span>
              <span class="pt-0.5">
                Tap the <Icon name="lucide:share" class="inline w-3.5 h-3.5 -mt-0.5" /> <b>Share</b> button in Safari's toolbar.
              </span>
            </li>
            <li class="flex gap-3">
              <span class="shrink-0 w-6 h-6 border-2 border-brain-900 bg-brain-100 flex items-center justify-center font-bold">2</span>
              <span class="pt-0.5">
                Scroll and tap <b>Add to Home Screen</b>.
              </span>
            </li>
            <li class="flex gap-3">
              <span class="shrink-0 w-6 h-6 border-2 border-brain-900 bg-brain-100 flex items-center justify-center font-bold">3</span>
              <span class="pt-0.5">
                Tap <b>Add</b> — TGI BRAIN will launch like a native app.
              </span>
            </li>
          </ol>

          <button
            @click="showIosHint = false"
            class="brutal-btn w-full px-4 py-2.5 bg-brain-900 text-white text-xs font-display font-bold uppercase tracking-widest border-2 border-brain-900 shadow-[2px_2px_0px_#111] cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const toast = useToast()
const { init, canInstall, hasNativePrompt, isIos, promptInstall } = usePwaInstall()

const showIosHint = ref(false)

const handleInstall = async () => {
  const result = await promptInstall()
  if (result === 'accepted') toast.success('Installed — launch from your home screen / apps.')
  else if (result === 'ios-manual') showIosHint.value = true
}

onMounted(() => init())
</script>
