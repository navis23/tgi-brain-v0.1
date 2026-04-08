<template>
    <header class="sticky top-0 z-30 bg-brain-100 border-b-2 border-brain-900">
        <div class="flex items-center gap-4 px-6 py-4">
            <!-- Mobile Menu Toggle -->
            <button @click="isSidebarOpen = true"
                class="md:hidden p-2 -ml-2 text-brain-900 hover:text-black hover:bg-white border-2 border-transparent transition-all">
                <Icon name="lucide:menu" class="w-6 h-6" />
            </button>

            <!-- Filter chips -->
            <div v-if="filterStore.hasActiveFilters" class="flex items-center gap-3">
                <span v-if="activeEntityName"
                    class="inline-flex items-center gap-2 px-3 py-1 font-mono text-[10px] uppercase font-bold bg-white text-brain-900 border-2 border-brain-900 shadow-[1px_1px_0px_#111]">
                    <span class="w-2.5 h-2.5 border border-brain-900" :style="{ backgroundColor: activeEntityColor }" />
                    {{ activeEntityName }}
                    <button @click="filterStore.setEntityFilter(null)"
                        class="ml-1 text-entity-enterbiner hover:text-brain-900 cursor-pointer p-0.5">
                        <Icon name="lucide:x-square" class="w-4 h-4" />
                    </button>
                </span>
                <button @click="filterStore.clearAll()"
                    class="brutal-btn text-[10px] font-mono font-bold uppercase text-brain-900 border-2 border-brain-900 px-3 py-1 bg-white hover:bg-brain-900 hover:text-white cursor-pointer">
                    Clear
                </button>
            </div>

            <!-- New Note button -->
            <button @click="$emit('openCapture')"
                class="brutal-btn flex items-center gap-2 px-5 py-2.5 bg-brain-900 border-2 border-transparent text-[10px] font-display font-bold uppercase tracking-widest text-white shadow-[2px_2px_0px_#F4F4F0] hover:-translate-y-0.5 transition-transform duration-100 cursor-pointer whitespace-nowrap">
                <Icon name="lucide:plus-square" class="w-4 h-4" />
                Execute Input
            </button>
        </div>
    </header>
</template>

<script setup lang="ts">
defineEmits(['openCapture'])

const filterStore = useFilterStore()
const notesStore = useNotesStore()
const isSidebarOpen = useState('sidebarOpen')

const activeEntityName = computed(() => {
    if (!filterStore.activeEntityId) return null
    return notesStore.entities.find(e => e.id === filterStore.activeEntityId)?.name
})

const activeEntityColor = computed(() => {
    if (!filterStore.activeEntityId) return null
    return notesStore.entities.find(e => e.id === filterStore.activeEntityId)?.color
})
</script>
