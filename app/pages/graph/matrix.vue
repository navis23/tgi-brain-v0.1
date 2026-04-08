<template>
  <div class="flex flex-col h-screen bg-brain-50 font-sans overflow-hidden">
    <!-- Architectural Grid Background -->
    <div class="absolute inset-0 z-0 pointer-events-none opacity-5" style="background-size: 24px 24px; background-image: linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px);"></div>

    <!-- Header -->
    <div class="relative z-10 flex items-center justify-between px-6 py-4 border-b-2 border-brain-900 bg-white min-h-[72px] shrink-0">
      <div class="flex items-center gap-4">
        <NuxtLink to="/graph" class="brutal-btn p-2 -ml-2 text-brain-900 bg-white border-2 border-transparent hover:border-brain-900 transition-all focus:outline-none">
          <Icon name="lucide:arrow-left" class="w-6 h-6" />
        </NuxtLink>
        <div class="hidden sm:flex w-12 h-12 bg-brain-900 border-2 border-brain-900 shadow-[2px_2px_0px_#111] items-center justify-center shrink-0">
          <Icon name="lucide:grid-3x3" class="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 class="text-2xl font-display font-bold text-brain-900 uppercase tracking-tighter">Synergy Matrix</h2>
          <p class="text-[10px] font-mono text-brain-500 uppercase tracking-widest mt-1 pr-2 bg-brain-100 inline-block border border-brain-900 px-1">Exact Overlap Heatmap</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex-1 overflow-auto bg-transparent p-4 md:p-8 flex items-start justify-center">
      <div class="bg-white border-2 border-brain-900 shadow-[4px_4px_0px_#111] overflow-x-auto inline-block brutal-card max-w-full">
        <table class="border-collapse font-mono text-[10px]" v-if="entities.length">
          <thead>
            <tr>
              <!-- Top Left Empty Cell -->
              <th class="p-2 border-b-2 border-r-2 border-brain-900 bg-brain-100 min-w-[120px] max-w-[200px] text-left align-bottom">
                 <span class="bg-white border border-brain-900 px-1 font-bold uppercase truncate w-full block">Entities</span>
              </th>
              <!-- Column Headers -->
              <th 
                v-for="col in entities" 
                :key="'header-col-' + col.id"
                class="border-b-2 border-r-2 border-brain-900 bg-white align-bottom p-0 w-8 min-w-[32px] h-32"
              >
                <!-- Rotated text for compact columns -->
                <div class="flex h-full items-end justify-center pb-2">
                   <div style="writing-mode: vertical-rl; transform: rotate(180deg);" class="truncate font-bold uppercase text-brain-900 tracking-widest">{{ col.name }}</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in entities" :key="'row-' + row.id">
              <!-- Row Header -->
              <th class="px-3 py-2 border-b-2 border-r-2 border-brain-900 bg-white text-left font-bold uppercase truncate max-w-[200px]">
                <div class="flex items-center gap-2">
                   <span class="w-2.5 h-2.5 shrink-0 border border-brain-900" :style="{ backgroundColor: row.color }"></span>
                   <span class="truncate" :title="row.name">{{ row.name }}</span>
                </div>
              </th>
              
              <!-- Matrix Cells -->
              <td 
                v-for="col in entities" 
                :key="'cell-' + row.id + '-' + col.id"
                class="border-b-2 border-r-2 border-brain-900 w-8 h-8 p-0 cursor-cell text-center relative group"
                :class="row.id === col.id ? 'bg-brain-100' : 'bg-white hover:bg-brain-200'"
                @click="inspectInteraction(row, col)"
              >
                 <!-- Cell Color overlay if overlap exists -->
                 <div class="absolute inset-0 flex items-center justify-center transition-all opacity-90 group-hover:opacity-100"
                      :style="getHeatmapStyle(row.id, col.id)">
                     <span class="z-10 font-bold" :class="getHeatmapTextColor(row.id, col.id)" v-if="getOverlapCount(row.id, col.id) > 0">
                       {{ getOverlapCount(row.id, col.id) }}
                     </span>
                     <span v-else class="text-brain-300 opacity-20 group-hover:opacity-100">-</span>
                 </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Empty State -->
        <div v-else-if="!notesStore.loading" class="p-12 text-center">
            <Icon name="lucide:network" class="w-12 h-12 mx-auto text-brain-300 mb-4" />
            <p class="font-display font-bold uppercase text-brain-900">No Vector Data</p>
        </div>
      </div>
    </div>
    
    <!-- Inspector Panel Overlay -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
        <div v-if="inspected" class="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-brain-900 shadow-[4px_4px_0px_#111] max-w-[90vw] md:max-w-lg w-full flex flex-col brutal-card">
          <div class="flex items-center justify-between px-4 py-3 border-b-2 border-brain-900 bg-brain-100">
             <p class="text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest border border-brain-900 bg-white px-2 py-0.5 shadow-[1px_1px_0px_#111]">Adjacency Detail</p>
             <button @click="inspected = null" class="brutal-btn p-1 bg-white hover:bg-brain-900 hover:text-white transition-colors border-2 border-transparent">
                 <Icon name="lucide:x" class="w-4 h-4" />
             </button>
          </div>
          <div class="p-5 flex flex-col gap-4">
             <div class="flex items-center flex-wrap gap-3">
                 <div class="flex items-center gap-2 border-2 border-brain-900 px-3 py-1 bg-white shadow-[2px_2px_0px_#111]">
                     <span class="w-3 h-3 border border-brain-900" :style="{ backgroundColor: inspected.row.color }"></span>
                     <span class="text-sm font-display font-bold uppercase text-brain-900">{{ inspected.row.name }}</span>
                 </div>
                 <Icon name="lucide:x" class="w-4 h-4 text-brain-400" />
                 <div class="flex items-center gap-2 border-2 border-brain-900 px-3 py-1 bg-white shadow-[2px_2px_0px_#111]">
                     <span class="w-3 h-3 border border-brain-900" :style="{ backgroundColor: inspected.col.color }"></span>
                     <span class="text-sm font-display font-bold uppercase text-brain-900">{{ inspected.col.name }}</span>
                 </div>
             </div>
             
             <!-- Stat block -->
             <div class="flex gap-4 items-end pt-2">
                 <div class="flex flex-col">
                     <span class="text-[10px] font-mono text-brain-500 uppercase tracking-widest mb-1">Vol Link</span>
                     <span class="text-3xl font-display font-bold text-brain-900 leading-none">{{ inspected.count }}</span>
                 </div>
                 <div class="h-8 border-l-2 border-brain-900 border-dashed mx-2"></div>
                 <NuxtLink to="/notes" class="brutal-btn px-4 py-2 bg-brain-900 text-white text-[10px] font-mono font-bold uppercase shadow-[2px_2px_0px_#111]">
                    Open Register &rarr;
                 </NuxtLink>
             </div>
          </div>
        </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Entity } from '~/types'

useHead({ title: 'Synergy Matrix — Archive' })

const notesStore = useNotesStore()
const filterStore = useFilterStore()

// Sorted list of entities
const entities = computed(() => {
    return [...notesStore.entities].sort((a, b) => a.name.localeCompare(b.name))
})

// Matrix values mapped
const overlaps = computed(() => {
    // build a fast lookup dict
    const dict: Record<string, number> = {}
    
    // Diagonal: single entity total
    for (const e of entities.value) {
        dict[`${e.id}::${e.id}`] = notesStore.entityNoteCounts[e.id] || 0
    }
    
    // Links
    for (const link of notesStore.synergyLinks) {
        dict[`${link.source}::${link.target}`] = link.count
        dict[`${link.target}::${link.source}`] = link.count
    }
    
    return dict
})

const getOverlapCount = (rowId: string, colId: string) => overlaps.value[`${rowId}::${colId}`] || 0

const maxOverlap = computed(() => {
    let max = 0
    for(const l of notesStore.synergyLinks) {
        if(l.count > max) max = l.count
    }
    return max || 1
})

const getHeatmapStyle = (rowId: string, colId: string) => {
    const count = getOverlapCount(rowId, colId)
    if (count === 0) return {}
    
    if (rowId === colId) {
        const entity = entities.value.find(e => e.id === rowId)
        return { backgroundColor: entity?.color }
    }
    
    // For regular synergies, use a heat scale mapping to a specific color
    // Pure brutalism: shades of a harsh color, or a gradient from #eee to #111
    const intensity = Math.min(1, count / maxOverlap.value)
    // Map intensity to a dark grayscale background
    const lightness = 90 - (intensity * 80) // 90% (light) down to 10% (dark)
    return { backgroundColor: `hsl(0, 0%, ${lightness}%)` }
}

const getHeatmapTextColor = (rowId: string, colId: string) => {
    const count = getOverlapCount(rowId, colId)
    if (count === 0) return 'text-brain-900'
    
    if (rowId === colId) return 'text-white drop-shadow-[1px_1px_0_rgba(0,0,0,1)]'
    
    const intensity = Math.min(1, count / maxOverlap.value)
    return intensity > 0.5 ? 'text-white' : 'text-brain-900'
}

type InspectorData = { row: Entity, col: Entity, count: number }
const inspected = ref<InspectorData | null>(null)

const inspectInteraction = (row: Entity, col: Entity) => {
    const c = getOverlapCount(row.id, col.id)
    if (c > 0) {
        inspected.value = { row, col, count: c }
        
        // Setup filter store conceptually so going to notes page works
        // But since there's no dual-filter yet, we could set the primary one
        filterStore.setEntityFilter(row.id)
    } else {
        inspected.value = null
    }
}

onMounted(async () => {
  if (notesStore.entities.length === 0) {
    await notesStore.fetchEntities()
    await notesStore.fetchNotes()
  }
})
</script>
