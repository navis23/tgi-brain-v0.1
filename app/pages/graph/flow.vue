<template>
  <div class="flex flex-col h-screen bg-brain-50 font-sans overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 z-0 pointer-events-none opacity-5" style="background-size: 24px 24px; background-image: linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px);"></div>

    <!-- Header -->
    <div class="relative z-10 flex flex-wrap gap-3 items-center justify-between px-6 py-4 border-b-2 border-brain-900 bg-white min-h-18 shrink-0">
      <div class="flex items-center gap-4">
        <NuxtLink to="/graph" class="brutal-btn p-2 -ml-2 text-brain-900 bg-white border-2 border-transparent hover:border-brain-900 transition-all focus:outline-none">
          <Icon name="lucide:arrow-left" class="w-6 h-6" />
        </NuxtLink>
        <div class="hidden sm:flex w-12 h-12 bg-white border-2 border-[#00E5FF] shadow-[2px_2px_0px_#111] items-center justify-center shrink-0">
          <Icon name="lucide:arrow-right-left" class="w-6 h-6 text-brain-900" />
        </div>
        <div>
          <h2 class="text-2xl font-display font-bold text-brain-900 uppercase tracking-tighter">Vector Flow</h2>
          <p class="text-[10px] font-mono text-brain-500 uppercase tracking-widest mt-1 pr-2 bg-brain-100 inline-block border border-brain-900 px-1">Sector -> Identity -> State</p>
        </div>
      </div>
      
      <!-- Controls -->
      <div class="flex gap-2">
         <button @click="recalculate" class="brutal-btn px-3 py-1.5 bg-white border-2 border-brain-900 text-[10px] font-mono font-bold uppercase hover:bg-brain-100 transition-colors shadow-[2px_2px_0px_#111]">
            Refresh Pipeline
         </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex-1 min-h-0 bg-[#fff] border-r-2 border-brain-900">
       <div class="w-full h-full relative p-6 md:p-12" ref="containerRef">
           
           <!-- Legend overlay -->
           <div class="absolute top-4 left-4 z-10 hidden md:flex gap-4 p-2 bg-white border-2 border-brain-900 shadow-[4px_4px_0px_#111] font-mono text-[10px] uppercase font-bold text-brain-900 tracking-widest">
               <span class="flex items-center gap-2"><div class="w-3 h-3 bg-brain-100 border border-brain-900"></div> Origin (Sector)</span>
               <span class="flex items-center gap-2"><div class="w-3 h-3 bg-brain-400 border border-brain-900"></div> Conduit (Entity)</span>
               <span class="flex items-center gap-2"><div class="w-3 h-3 bg-brain-900 border border-brain-900"></div> Terminal (State)</span>
           </div>

           <svg v-if="containerWidth > 0" :width="containerWidth" :height="containerHeight" class="overflow-visible block mx-auto">
               <!-- Links (Ribbons) -->
               <g>
                   <path v-for="(link, i) in sankeyData.links" :key="'link-'+i"
                         :d="generateElbowPath(link)"
                         :stroke="link.source.color || '#ccc'"
                         fill="none"
                         :stroke-width="Math.max(1, link.width)"
                         class="opacity-40 hover:opacity-80 transition-opacity cursor-pointer duration-200"
                   >
                     <title>{{ link.source.name }} → {{ link.target.name }}\nVolume: {{ link.value }}</title>
                   </path>
               </g>

               <!-- Nodes (Pillars) -->
               <g>
                   <g v-for="(node, i) in sankeyData.nodes" :key="'node-'+i" 
                      :transform="`translate(${node.x0},${node.y0})`">
                      
                      <!-- Main Box -->
                      <rect 
                          :height="Math.max(2, node.y1 - node.y0)" 
                          :width="node.x1 - node.x0" 
                          :fill="node.color || '#111'"
                          class="stroke-brain-900 stroke-2 cursor-pointer hover:brightness-110 transition-all"
                      >
                         <title>{{ node.name }}\nTotal Flow: {{ node.value }}</title>
                      </rect>
                      
                      <!-- Labels -->
                      <text
                          :x="node.x0 < containerWidth / 2 ? (node.x1 - node.x0) + 6 : -6"
                          :y="(node.y1 - node.y0) / 2"
                          :text-anchor="node.x0 < containerWidth / 2 ? 'start' : 'end'"
                          alignment-baseline="middle"
                          class="text-[10px] font-mono font-bold uppercase fill-brain-900 pointer-events-none select-none"
                      >
                          {{ node.name }}
                      </text>
                      
                      <text
                          :x="node.x0 < containerWidth / 2 ? (node.x1 - node.x0) + 6 : -6"
                          :y="(node.y1 - node.y0) / 2 + 12"
                          :text-anchor="node.x0 < containerWidth / 2 ? 'start' : 'end'"
                          alignment-baseline="middle"
                          class="text-[10px] font-mono fill-brain-500 pointer-events-none select-none"
                          v-if="(node.y1 - node.y0) > 30"
                      >
                          Vol: {{ node.value }}
                      </text>
                   </g>
               </g>
           </svg>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sankey, sankeyCenter } from 'd3-sankey'
import { useResizeObserver } from '@vueuse/core'
import { CATEGORY_COLORS, CATEGORY_LABELS, STATUS_COLORS, STATUS_LABELS } from '~/types'

useHead({ title: 'Vector Flow — Archive' })

const notesStore = useNotesStore()
const filterStore = useFilterStore()
const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const containerHeight = ref(0)
const dataRevision = ref(0) // Used to force recalculation if needed

// Resize observer
useResizeObserver(containerRef, (entries) => {
    const entry = entries[0]
    if (!entry) return
    // Add padding allowance
    containerWidth.value = entry.contentRect.width - 48
    containerHeight.value = entry.contentRect.height - 48
})

const recalculate = () => {
    dataRevision.value++
}

// Prepare raw data
const graphData = computed(() => {
    // track dependency
    dataRevision.value 
    
    if (notesStore.notes.length === 0) return { nodes: [], links: [] }

    const nodesMap: Record<string, any> = {}
    const linksMap: Record<string, any> = {}
    
    const addNode = (id: string, name: string, categoryData: any) => {
        if (!nodesMap[id]) nodesMap[id] = { id, name, ...categoryData }
        return nodesMap[id]
    }
    
    const addLink = (source: string, target: string, value: number) => {
        const linkId = `${source}->${target}`
        if (!linksMap[linkId]) {
            linksMap[linkId] = { source, target, value: 0 }
        }
        linksMap[linkId].value += value
    }

    // Process nodes: 3-tier Sankey (Category -> Entity -> Status)
    notesStore.notes.forEach(note => {
        const catId = `cat_${note.category}`
        const catName = CATEGORY_LABELS[note.category as keyof typeof CATEGORY_LABELS] || note.category
        addNode(catId, catName, { color: CATEGORY_COLORS[note.category as keyof typeof CATEGORY_COLORS] || '#eee', layer: 0 })
        
        const statId = `stat_${note.status}`
        const statName = STATUS_LABELS[note.status as keyof typeof STATUS_LABELS] || note.status
        addNode(statId, statName, { color: STATUS_COLORS[note.status as keyof typeof STATUS_COLORS] || '#111', layer: 2 })

        if (note.entity_ids && note.entity_ids.length > 0) {
            note.entity_ids.forEach(eid => {
                const entity = notesStore.entities.find(e => e.id === eid)
                const entId = `ent_${eid}`
                addNode(entId, entity?.name || eid, { color: entity?.color || '#ccc', layer: 1 })
                
                // Add flows
                addLink(catId, entId, 1)
                addLink(entId, statId, 1)
            })
        }
    })
    
    const nodes = Object.values(nodesMap).map((n, i) => ({ ...n, index: i }))
    const linkVals = Object.values(linksMap)
    
    // Map links source/target to indices
    const links = linkVals.map(l => ({
        source: nodes.findIndex(n => n.id === l.source),
        target: nodes.findIndex(n => n.id === l.target),
        value: l.value
    }))
    
    return { nodes, links }
})

// Compute layout
const sankeyData = computed(() => {
    if (containerWidth.value === 0 || containerHeight.value === 0 || graphData.value.nodes.length === 0) return { nodes: [], links: [] }
    
    const sankeyGenerator = sankey()
        .nodeWidth(24)
        .nodePadding(16)
        .extent([[0, 0], [containerWidth.value, containerHeight.value]])
        // .nodeAlign(sankeyCenter)
        // D3 sankey v0.12+ type issues mean we sometimes just cast to any
    
    try {
        const result = sankeyGenerator(JSON.parse(JSON.stringify(graphData.value)) as any)
        return result
    } catch (e) {
        console.error("Sankey failed", e)
        return { nodes: [], links: [] }
    }
})

// Brutalist orthogonal elbow path generator instead of default curved ribbons
const generateElbowPath = (link: any) => {
    const sX = link.source.x1
    const sY = link.y0
    const tX = link.target.x0
    const tY = link.y1
    
    const midX = sX + (tX - sX) / 2
    
    return `M ${sX} ${sY} 
            L ${midX} ${sY} 
            L ${midX} ${tY} 
            L ${tX} ${tY}`
}

onMounted(async () => {
  if (notesStore.entities.length === 0) {
    await notesStore.fetchEntities()
    await notesStore.fetchNotes()
  }
})
</script>
