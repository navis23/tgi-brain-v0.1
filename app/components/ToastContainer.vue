<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-8"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-8"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 border-2 border-brain-900 shadow-[4px_4px_0px_#111] text-xs font-mono font-bold uppercase max-w-sm"
          :class="{
            'bg-white text-brain-900': toast.type === 'info',
            'bg-brain-900 text-white': toast.type === 'success',
            'bg-[#FF3366] text-white': toast.type === 'error',
          }"
        >
          <Icon
            :name="toast.type === 'success' ? 'lucide:check-square' : toast.type === 'error' ? 'lucide:alert-triangle' : 'lucide:info'"
            class="w-4 h-4 shrink-0"
          />
          <span class="flex-1">{{ toast.message }}</span>
          <button @click="remove(toast.id)" class="shrink-0 hover:opacity-70 cursor-pointer">
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()
</script>
