<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-brain-900/50 z-[120]"
        @click="$emit('update:modelValue', false)"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="modelValue"
        class="fixed left-0 right-0 bottom-0 z-[121] bg-white border-t-2 border-brain-900 shadow-[0_-4px_0_#111] flex flex-col"
        :style="{ maxHeight: '85dvh' }"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- Drag handle -->
        <div class="flex flex-col items-center pt-2 pb-1 shrink-0 cursor-grab">
          <div class="w-12 h-1.5 bg-brain-900" />
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-3 border-b-2 border-brain-900 bg-brain-50 shrink-0">
          <span class="text-sm font-display font-bold text-brain-900 uppercase tracking-widest">
            {{ title || 'Properties' }}
          </span>
          <button
            @click="$emit('update:modelValue', false)"
            class="brutal-btn px-4 py-1.5 bg-brain-900 text-white text-[10px] font-mono uppercase cursor-pointer"
          >
            Done
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean; title?: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

let startY = 0
let currentY = 0

const onTouchStart = (e: TouchEvent) => {
  startY = e.touches[0]?.clientY ?? 0
  currentY = startY
}
const onTouchMove = (e: TouchEvent) => {
  currentY = e.touches[0]?.clientY ?? startY
}
const onTouchEnd = () => {
  if (currentY - startY > 80) emit('update:modelValue', false)
  startY = 0
  currentY = 0
}
</script>
