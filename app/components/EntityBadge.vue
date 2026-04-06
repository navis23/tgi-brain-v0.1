<template>
  <span
    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border"
    :style="{
      backgroundColor: `${entity.color}15`,
      borderColor: `${entity.color}30`,
      color: entity.color,
    }"
  >
    <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: entity.color }" />
    {{ entity.name }}
  </span>
</template>

<script setup lang="ts">
import type { Entity } from '~/types'

defineProps<{
  entity: Entity
}>()
</script>
