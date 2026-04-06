<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border"
    :style="{
      backgroundColor: `${color}15`,
      borderColor: `${color}30`,
      color: color,
    }"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { CATEGORY_COLORS, CATEGORY_LABELS, type NoteCategory } from '~/types'

const props = defineProps<{
  category: NoteCategory
}>()

const color = computed(() => CATEGORY_COLORS[props.category])
const label = computed(() => CATEGORY_LABELS[props.category])
</script>
