<template>
  <div class="flex flex-col h-screen bg-brain-50 font-sans overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 z-0 pointer-events-none opacity-5" style="background-size: 24px 24px; background-image: linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px);"></div>

    <!-- Header -->
    <div class="relative z-10 flex flex-wrap gap-3 items-center justify-between px-6 py-4 border-b-2 border-brain-900 bg-white min-h-[72px] shrink-0">
      <div class="flex items-center gap-4">
        <NuxtLink to="/graph" class="brutal-btn p-2 -ml-2 text-brain-900 bg-white border-2 border-transparent hover:border-brain-900 transition-all focus:outline-none">
          <Icon name="lucide:arrow-left" class="w-6 h-6" />
        </NuxtLink>
        <div class="hidden sm:flex w-12 h-12 bg-white border-2 border-brain-900 shadow-[2px_2px_0px_#111] items-center justify-center shrink-0">
          <Icon name="lucide:bar-chart-2" class="w-6 h-6 text-brain-900" />
        </div>
        <div>
          <h2 class="text-2xl font-display font-bold text-brain-900 uppercase tracking-tighter">Volume Treemap</h2>
          <p class="text-[10px] font-mono text-brain-500 uppercase tracking-widest mt-1 pr-2 bg-brain-100 inline-block border border-brain-900 px-1">Hierarchical Sector Mass</p>
        </div>
      </div>
      
      <!-- Treemap Controls -->
      <div class="flex gap-2">
         <select v-model="treemapMode" class="bg-white border-2 border-brain-900 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 shadow-[2px_2px_0px_#111] focus:outline-none">
             <option value="entity">Group By: Identity</option>
             <option value="category">Group By: Sector</option>
         </select>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex-1 min-h-0 bg-white border-r-2 border-brain-900 flex flex-col md:flex-row overflow-hidden">
       <!-- SVG Canvas -->
       <div class="flex-1 min-h-0 relative p-4 bg-brain-50 shadow-[inset_4px_4px_0_rgba(0,0,0,0.05)] border-r-2 border-brain-900" ref="containerRef">
           <svg v-if="containerWidth > 0" :width="containerWidth" :height="containerHeight" class="overflow-visible block">
              <g v-for="(leaf, i) in treemapLeaves" :key="leaf.data.id || i" 
                 :transform="`translate(${leaf.x0},${leaf.y0})`"
                 class="group cursor-pointer"
                 @mouseenter="hoveredLeaf = leaf"
                 @mouseleave="hoveredLeaf = null"
                 @click="handleClick(leaf)"
                 >
                 <rect 
                     :width="leaf.x1 - leaf.x0" 
                     :height="leaf.y1 - leaf.y0"
                     :fill="leaf.data.color || '#fff'"
                     class="stroke-brain-900 stroke-2 transition-all duration-200"
                     :class="hoveredLeaf === leaf ? 'stroke-[4px]' : ''"
                 />
                 <!-- Pattern Overlay for visual texture -->
                 <rect 
                     v-if="leaf.data.isCategory"
                     :width="leaf.x1 - leaf.x0" 
                     :height="leaf.y1 - leaf.y0"
                     fill="url(#hatch)"
                     class="pointer-events-none opacity-20"
                 />
                 
                 <g v-if="(leaf.x1 - leaf.x0) > 40 && (leaf.y1 - leaf.y0) > 30" class="pointer-events-none">
                     <!-- Background behind text to ensure readability -->
                     <rect x="0" y="0" :width="leaf.x1 - leaf.x0" height="24" fill="rgba(255,255,255,0.7)" />
                     <text x="6" y="16" class="text-[10px] font-mono font-bold uppercase fill-brain-900 select-none">
                        {{ leaf.data.name }}
                     </text>
                     <text x="6" y="32" class="text-xs font-display font-medium uppercase fill-brain-900 select-none" v-if="(leaf.y1 - leaf.y0) > 50">
                        {{ leaf.value }} Vol
                     </text>
                 </g>
              </g>

              <!-- SVG Definitions -->
              <defs>
                  <pattern id="hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#111" stroke-width="2" />
                  </pattern>
              </defs>
           </svg>
       </div>

       <!-- Side Panel Stats -->
       <div class="w-full md:w-80 shrink-0 bg-white flex flex-col items-stretch overflow-y-auto hidden md:flex">
          <div class="p-6 border-b-2 border-brain-900 bg-brain-100 uppercase tracking-widest font-mono font-bold text-xs text-brain-900 border-l-4 border-brain-900">
             Cluster Metrics
          </div>
          
          <div v-if="hoveredLeaf" class="p-6 flex flex-col gap-4">
             <div class="inline-flex">
                 <span class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 border-2 border-brain-900 bg-white shadow-[2px_2px_0px_#111]">
                    {{ hoveredLeaf.data.isCategory ? 'Sector' : 'Identity' }}
                 </span>
             </div>
             
             <div>
                <h3 class="text-xl font-display font-bold uppercase text-brain-900">{{ hoveredLeaf.data.name }}</h3>
                <div class="mt-2 h-1 w-full border-b-2 border-brain-900 border-dashed"></div>
             </div>
             
             <div class="flex items-end justify-between border-2 border-brain-900 p-4 bg-brain-50 shadow-[4px_4px_0px_#111]">
                <div class="flex flex-col">
                   <span class="text-[10px] font-mono text-brain-500 uppercase tracking-widest">Aggregate Volume</span>
                   <span class="text-4xl font-display font-bold leading-none">{{ hoveredLeaf.value }}</span>
                </div>
                <div class="w-8 h-8 border-2 border-brain-900 shadow-[2px_2px_0px_#111]" :style="{ backgroundColor: hoveredLeaf.data.color || '#fff' }"></div>
             </div>
             
             <!-- Show parent if it's a child node -->
             <div class="mt-4 p-4 border-2 border-brain-900 bg-white" v-if="hoveredLeaf.parent && hoveredLeaf.parent.data.name !== 'root'">
                 <span class="text-[10px] font-mono font-bold text-brain-500 uppercase block mb-1">Contained Within</span>
                 <p class="font-bold uppercase tracking-widest text-brain-900 break-words">{{ hoveredLeaf.parent.data.name }}</p>
             </div>
          </div>
          
          <div v-else class="p-6 flex-1 flex flex-col items-center justify-center text-center opacity-50">
             <Icon name="lucide:mouse-pointer-click" class="w-12 h-12 mb-4" />
             <p class="font-mono text-xs uppercase tracking-widest font-bold">Hover sectors to retrieve cluster metrics.</p>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import { useResizeObserver } from '@vueuse/core'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '~/types'

useHead({ title: 'Volume Treemap — Archive' })

const notesStore = useNotesStore()
const filterStore = useFilterStore()
const router = useRouter()

const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const containerHeight = ref(0)
const treemapMode = ref<'entity' | 'category'>('entity')

const hoveredLeaf = ref<any>(null)

// Resize observer
useResizeObserver(containerRef, (entries) => {
    const entry = entries[0]
    containerWidth.value = entry.contentRect.width
    containerHeight.value = entry.contentRect.height
})

// Build hierarchical data
const hierarchicalData = computed(() => {
    const root = { id: 'root', name: 'root', children: [] as any[] }
    
    if (treemapMode.value === 'entity') {
        // Group by Entity -> Category
        for (const entity of notesStore.entities) {
            const entityNotes = notesStore.notes.filter(n => n.entity_ids?.includes(entity.id))
            if (entityNotes.length === 0) continue
            
            const catsArr: Record<string, number> = {}
            entityNotes.forEach(n => { catsArr[n.category] = (catsArr[n.category] || 0) + 1 })
            
            const children = Object.entries(catsArr).map(([cat, count]) => ({
                id: `${entity.id}-${cat}`,
                name: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat,
                value: count,
                color: entity.color, // Inherit entity color
                isCategory: true,
                categoryId: cat
            }))
            
            root.children.push({
                id: entity.id,
                name: entity.name,
                color: entity.color,
                children
            })
        }
    } else {
        // Group by Category -> Entity
        const catsArr: Record<string, any[]> = {}
        // Pre-fill categories
        Object.keys(CATEGORY_LABELS).forEach(cat => { catsArr[cat] = [] })
        
        // Count notes per entity per category map to properly distribute
        // Treemaps need flat disjoint sets. If a note has multiple entities, we count it for both.
        
        for (const cat of Object.keys(CATEGORY_LABELS)) {
            const catNotes = notesStore.notes.filter(n => n.category === cat)
            if (catNotes.length === 0) continue
            
            const entityCounts: Record<string, number> = {}
            for(const note of catNotes) {
                if(!note.entity_ids) continue
                for (const eid of note.entity_ids) {
                    entityCounts[eid] = (entityCounts[eid] || 0) + 1
                }
            }
            
            const children = Object.entries(entityCounts).map(([eid, count]) => {
                const entity = notesStore.entities.find(e => e.id === eid)
                return {
                    id: `${cat}-${eid}`,
                    name: entity?.name || eid,
                    value: count,
                    color: entity?.color || '#eee',
                    entityId: eid
                }
            })
            
            if (children.length > 0) {
               root.children.push({
                   id: cat,
                   name: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat,
                   color: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || '#ccc',
                   isCategory: true,
                   children
               })
            }
        }
    }
    
    return root
})

// Compute D3 Treemap layout
const treemapLeaves = computed(() => {
    if (containerWidth.value === 0 || containerHeight.value === 0 || hierarchicalData.value.children.length === 0) return []
    
    const hierarchy = d3.hierarchy(hierarchicalData.value)
        .sum(d => d.value || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0))
        
    const treemap = d3.treemap()
        .size([containerWidth.value, containerHeight.value])
        .paddingOuter(4)
        .paddingTop(24) // Room for headers in group
        .paddingInner(2)
        .round(true)
        
    const layout = treemap(hierarchy as any)
    
    return layout.leaves()
})

const handleClick = (leaf: any) => {
    // Navigate to notes page with filter applied
    if (leaf.data.entityId) {
        filterStore.setEntityFilter(leaf.data.entityId)
    } else if (leaf.parent && !leaf.parent.data.isCategory && leaf.parent.data.id !== 'root') {
        filterStore.setEntityFilter(leaf.parent.data.id)
    }
    
    router.push('/notes')
}

onMounted(async () => {
  if (notesStore.entities.length === 0) {
    await notesStore.fetchEntities()
    await notesStore.fetchNotes()
  }
})
</script>
