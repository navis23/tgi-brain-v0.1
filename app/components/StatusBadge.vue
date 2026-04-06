<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
    :style="{
      backgroundColor: `${color}15`,
      borderColor: `${color}30`,
      color: color,
    }"
  >
    <span class="w-1.5 h-1.5 rounded-full mr-1.5" :style="{ backgroundColor: color }" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { STATUS_COLORS, STATUS_LABELS, type NoteStatus } from '~/types'

const props = defineProps<{
  status: NoteStatus
}>()

const color = computed(() => STATUS_COLORS[props.status])
const label = computed(() => STATUS_LABELS[props.status])
</script>
