<template>
  <header class="sticky top-0 z-30 bg-brain-950/80 backdrop-blur-xl border-b border-brain-700/50">
    <div class="flex items-center gap-3 px-4 md:px-6 py-4">
      <!-- Mobile Menu Toggle -->
      <button
        @click="isSidebarOpen = true"
        class="md:hidden p-2 -ml-2 text-brain-400 hover:text-brain-200 transition-colors"
      >
        <Icon name="lucide:menu" class="w-5 h-5" />
      </button>

      <!-- Search -->
      <div class="flex-1 max-w-xl relative">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brain-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search notes..."
          class="w-full pl-10 pr-4 py-2.5 bg-brain-800/60 border border-brain-700/50 rounded-xl text-sm text-brain-100 placeholder:text-brain-500 focus:outline-none focus:border-entity-tgi/50 focus:ring-1 focus:ring-entity-tgi/20 transition-all duration-200"
        />
      </div>

      <!-- Filter chips -->
      <div v-if="filterStore.hasActiveFilters" class="flex items-center gap-2">
        <span
          v-if="activeEntityName"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brain-700/60 text-brain-200 border border-brain-600/50"
        >
          <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: activeEntityColor }" />
          {{ activeEntityName }}
          <button @click="filterStore.setEntityFilter(null)" class="ml-1 hover:text-brain-50 cursor-pointer">
            <Icon name="lucide:x" class="w-3 h-3" />
          </button>
        </span>
        <button
          @click="filterStore.clearAll()"
          class="text-xs text-brain-400 hover:text-brain-200 transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      <!-- New Note button -->
      <button
        @click="$emit('openCapture')"
        class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-entity-tgi to-entity-drc rounded-xl text-sm font-semibold text-white shadow-lg shadow-entity-tgi/20 hover:shadow-entity-tgi/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
      >
        <Icon name="lucide:plus" class="w-4 h-4" />
        New Note
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits(['openCapture'])

const filterStore = useFilterStore()
const notesStore = useNotesStore()
const isSidebarOpen = useState('sidebarOpen')

const searchQuery = computed({
  get: () => filterStore.searchQuery,
  set: (val: string) => filterStore.setSearch(val),
})

const activeEntityName = computed(() => {
  if (!filterStore.activeEntityId) return null
  return notesStore.entities.find(e => e.id === filterStore.activeEntityId)?.name
})

const activeEntityColor = computed(() => {
  if (!filterStore.activeEntityId) return null
  return notesStore.entities.find(e => e.id === filterStore.activeEntityId)?.color
})
</script>
