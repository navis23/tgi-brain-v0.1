<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- Page header -->
    <div class="flex items-center justify-between px-4 md:px-6 py-4 border-b border-brain-700/40 bg-brain-950/60 backdrop-blur-xl shrink-0">
      <div class="flex items-center gap-3">
        <button
          @click="isSidebarOpen = true"
          class="md:hidden p-2 -ml-2 text-brain-400 hover:text-brain-200"
        >
          <Icon name="lucide:menu" class="w-5 h-5" />
        </button>
        <div class="hidden sm:flex w-9 h-9 rounded-xl bg-entity-tgi/15 border border-entity-tgi/30 items-center justify-center">
          <Icon name="lucide:network" class="w-4.5 h-4.5 text-entity-tgi" />
        </div>
        <div>
          <h2 class="text-base font-bold text-brain-50">Knowledge Graph</h2>
          <p class="text-xs text-brain-500">Interactive synergy visualization · {{ notesStore.entities.length }} entities · {{ notesStore.synergyLinks.length }} synergies</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex justify-end gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
        <button
          v-if="filterStore.hasActiveFilters"
          @click="filterStore.clearAll()"
          class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brain-400 hover:text-brain-200 hover:bg-brain-700/50 transition-colors cursor-pointer border border-brain-700/40"
        >
          <Icon name="lucide:x" class="w-3 h-3" />
          Clear filters
        </button>
        <button
          @click="showLabels = !showLabels"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border"
          :class="showLabels ? 'bg-entity-tgi/10 border-entity-tgi/30 text-entity-tgi' : 'bg-brain-800/40 border-brain-700/40 text-brain-400 hover:text-brain-200'"
        >
          <Icon name="lucide:tag" class="w-3 h-3" />
          Labels
        </button>
        <button
          @click="recenter"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brain-800/40 border border-brain-700/40 text-brain-400 hover:text-brain-200 transition-colors cursor-pointer"
        >
          <Icon name="lucide:crosshair" class="w-3 h-3" />
          Recenter
        </button>
      </div>
    </div>

    <div class="flex flex-1 min-h-0">
      <!-- Graph canvas (full width, shrinks if panel open) -->
      <div class="relative flex-1 min-w-0">
        <!-- Entity legend bar -->
        <div class="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
          <button
            v-for="entity in notesStore.entities"
            :key="entity.id"
            @click="filterStore.setEntityFilter(entity.id)"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 border"
            :class="filterStore.activeEntityId === entity.id
              ? 'border-transparent shadow-lg scale-105'
              : 'bg-brain-900/60 border-brain-700/50 text-brain-400 hover:text-brain-200 backdrop-blur-sm'"
            :style="filterStore.activeEntityId === entity.id
              ? { backgroundColor: `${entity.color}20`, borderColor: `${entity.color}50`, color: entity.color }
              : {}"
          >
            <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: entity.color }" />
            {{ entity.name }}
            <span class="opacity-60 tabular-nums">{{ notesStore.entityNoteCounts[entity.id] || 0 }}</span>
          </button>
        </div>

        <!-- Graph container -->
        <div ref="graphRef" class="w-full h-full" />

        <!-- Empty state overlay -->
        <div
          v-if="notesStore.notes.length === 0 && !notesStore.loading"
          class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <div class="w-20 h-20 rounded-2xl bg-brain-800/40 flex items-center justify-center mb-4">
            <Icon name="lucide:network" class="w-10 h-10 text-brain-600" />
          </div>
          <p class="text-brain-300 font-medium">No notes yet</p>
          <p class="text-brain-500 text-sm mt-1">Press ⌘K to capture your first idea</p>
        </div>
      </div>

      <!-- Detail Panel (slides in on node click) -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-full md:translate-y-0 md:translate-x-4 md:w-0"
        enter-to-class="opacity-100 translate-y-0 translate-x-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 translate-x-0"
        leave-to-class="opacity-0 translate-y-full md:translate-y-0 md:translate-x-4"
      >
        <div
          v-if="selectedEntity"
          class="fixed inset-0 top-[73px] md:relative md:inset-auto md:w-96 z-20 md:z-0 shrink-0 border-l border-brain-700/40 bg-brain-900/95 md:bg-brain-900/70 backdrop-blur-xl flex flex-col overflow-y-auto"
        >
          <!-- Panel header -->
          <div class="p-5 border-b border-brain-700/40">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  :style="{ backgroundColor: selectedEntity.color + '30', border: `1px solid ${selectedEntity.color}50`, color: selectedEntity.color }"
                >
                  {{ selectedEntity.name[0] }}
                </div>
                <div>
                  <h3 class="font-bold text-brain-50 text-base">{{ selectedEntity.name }}</h3>
                  <p class="text-xs text-brain-500">Entity · {{ entityNotes.length }} notes</p>
                </div>
              </div>
              <button
                @click="selectedEntity = null"
                class="p-1.5 rounded-lg text-brain-400 hover:text-brain-200 hover:bg-brain-700/50 transition-colors cursor-pointer"
              >
                <Icon name="lucide:x" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-3 p-5 border-b border-brain-700/40">
            <div class="text-center">
              <p class="text-2xl font-bold" :style="{ color: selectedEntity.color }">{{ entityNotes.length }}</p>
              <p class="text-xs text-brain-500">Notes</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-entity-sbs">{{ entitySynergies.length }}</p>
              <p class="text-xs text-brain-500">Synergies</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-entity-mbink">{{ activePipelineCount }}</p>
              <p class="text-xs text-brain-500">Active</p>
            </div>
          </div>

          <!-- Category breakdown -->
          <div class="p-5 border-b border-brain-700/40">
            <p class="text-xs font-semibold text-brain-400 uppercase tracking-wider mb-3">Category Breakdown</p>
            <div class="space-y-2">
              <div
                v-for="(count, cat) in categoryBreakdown"
                :key="cat"
                v-show="count > 0"
                class="flex items-center gap-3"
              >
                <span class="text-xs text-brain-400 w-20 truncate capitalize">{{ cat.replace('_', ' ') }}</span>
                <div class="flex-1 h-1.5 bg-brain-800 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :style="{
                      width: `${(count / entityNotes.length) * 100}%`,
                      backgroundColor: CATEGORY_COLORS[cat as NoteCategory]
                    }"
                  />
                </div>
                <span class="text-xs text-brain-500 tabular-nums w-4">{{ count }}</span>
              </div>
            </div>
          </div>

          <!-- Synergy connections -->
          <div v-if="entitySynergies.length > 0" class="p-5 border-b border-brain-700/40">
            <p class="text-xs font-semibold text-brain-400 uppercase tracking-wider mb-3">Synergy Connections</p>
            <div class="space-y-2">
              <div
                v-for="syn in entitySynergies"
                :key="syn.partnerId"
                class="flex items-center gap-3 p-2.5 rounded-xl bg-brain-800/40 hover:bg-brain-800/70 transition-colors cursor-pointer"
                @click="selectEntityById(syn.partnerId)"
              >
                <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: syn.partnerColor }" />
                <span class="text-sm font-medium text-brain-200 flex-1">{{ syn.partnerName }}</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-md" :style="{ backgroundColor: syn.partnerColor + '20', color: syn.partnerColor }">
                  {{ syn.count }} shared
                </span>
              </div>
            </div>
          </div>

          <!-- Notes list -->
          <div class="p-5 flex-1">
            <p class="text-xs font-semibold text-brain-400 uppercase tracking-wider mb-3">Recent Notes</p>
            <div class="space-y-2">
              <div
                v-for="note in entityNotes"
                :key="note.id"
                class="p-3 rounded-xl bg-brain-800/30 border border-brain-700/30 hover:border-brain-600/50 transition-all duration-200 cursor-pointer"
                @click="expandedNoteId = expandedNoteId === note.id ? null : note.id"
              >
                <div class="flex items-start gap-2">
                  <Icon
                    :name="expandedNoteId === note.id ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                    class="w-3.5 h-3.5 text-brain-500 mt-0.5 shrink-0 transition-transform"
                  />
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-brain-200 leading-snug">{{ note.title }}</p>
                    <div class="flex items-center gap-2 mt-1.5">
                      <CategoryBadge :category="note.category" />
                      <StatusBadge :status="note.status" />
                    </div>
                    <div v-if="expandedNoteId === note.id" class="mt-2 pt-2 border-t border-brain-700/40">
                      <p class="text-xs text-brain-400 leading-relaxed">{{ getPreview(note.content, 200) }}</p>
                      <p class="text-xs text-brain-600 mt-1.5">{{ formatDate(note.created_at) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="entityNotes.length === 0" class="text-center py-6 text-brain-600">
                <Icon name="lucide:inbox" class="w-6 h-6 mx-auto mb-2 opacity-40" />
                <p class="text-sm">No notes yet</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Bottom synergy matrix -->
    <div class="shrink-0 border-t border-brain-700/40 bg-brain-950/60 backdrop-blur-xl">
      <div class="px-6 py-3">
        <div class="flex items-center gap-4 overflow-x-auto">
          <p class="text-xs font-semibold text-brain-500 uppercase tracking-wider whitespace-nowrap shrink-0">Synergy Matrix</p>
          <div class="flex items-center gap-2">
            <div
              v-for="link in topSynergies"
              :key="`${link.source}::${link.target}`"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brain-800/40 border border-brain-700/30 text-xs whitespace-nowrap cursor-pointer hover:bg-brain-800/70 transition-colors"
              @click="handleSynergyClick(link)"
            >
              <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: getEntityColor(link.source) }" />
              <span class="text-brain-300">{{ getEntityName(link.source) }}</span>
              <Icon name="lucide:arrow-right-left" class="w-3 h-3 text-brain-600" />
              <span class="text-brain-300">{{ getEntityName(link.target) }}</span>
              <span class="font-semibold text-entity-sbs">{{ link.count }}</span>
            </div>
            <p v-if="topSynergies.length === 0" class="text-xs text-brain-600 italic">No synergies yet — tag notes with multiple entities</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import type { Entity, NoteCategory, SynergyLink } from '~/types'
import { CATEGORY_COLORS } from '~/types'

useHead({ title: 'Knowledge Graph — TGI BRAIN' })

const notesStore = useNotesStore()
const filterStore = useFilterStore()
const isSidebarOpen = useState('sidebarOpen')

const graphRef = ref<HTMLDivElement | null>(null)
const showLabels = ref(true)
const selectedEntity = ref<Entity | null>(null)
const expandedNoteId = ref<string | null>(null)

// D3 simulation refs
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let simulation: d3.Simulation<any, any> | null = null
let zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null

// Entity notes
const entityNotes = computed(() =>
  selectedEntity.value
    ? notesStore.notes.filter(n => n.entity_ids?.includes(selectedEntity.value!.id))
    : []
)

const activePipelineCount = computed(() =>
  entityNotes.value.filter(n => n.status === 'active_pipeline').length
)

const categoryBreakdown = computed(() => {
  const counts: Record<string, number> = {
    strategic: 0, technical: 0, marketing: 0, financial: 0, operations: 0
  }
  entityNotes.value.forEach(n => { counts[n.category] = (counts[n.category] || 0) + 1 })
  return counts
})

const entitySynergies = computed(() => {
  if (!selectedEntity.value) return []
  const eid = selectedEntity.value.id
  return notesStore.synergyLinks
    .filter(l => l.source === eid || l.target === eid)
    .map(l => {
      const partnerId = l.source === eid ? l.target : l.source
      const partner = notesStore.entities.find(e => e.id === partnerId)
      return {
        partnerId,
        partnerName: partner?.name ?? partnerId,
        partnerColor: partner?.color ?? '#888',
        count: l.count,
      }
    })
    .sort((a, b) => b.count - a.count)
})

const topSynergies = computed(() =>
  [...notesStore.synergyLinks].sort((a, b) => b.count - a.count).slice(0, 8)
)

const getEntityColor = (id: string) =>
  notesStore.entities.find(e => e.id === id)?.color ?? '#888'

const getEntityName = (id: string) =>
  notesStore.entities.find(e => e.id === id)?.name ?? id

const getPreview = (content: string, limit = 100) => {
  const clean = content.replace(/[#*`\[\]()]/g, '').trim()
  return clean.length > limit ? clean.substring(0, limit) + '…' : clean
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const selectEntityById = (id: string) => {
  const entity = notesStore.entities.find(e => e.id === id)
  if (entity) selectedEntity.value = entity
  filterStore.setEntityFilter(id)
}

const handleSynergyClick = (link: SynergyLink) => {
  filterStore.setEntityFilter(link.source)
}

// Recenter graph
const recenter = () => {
  if (!svg || !zoom || !graphRef.value) return
  const { width, height } = graphRef.value.getBoundingClientRect()
  svg.transition().duration(600).call(
    (zoom as any).transform,
    d3.zoomIdentity.translate(width / 2, height / 2)
  )
}

// Build D3 graph
const buildGraph = () => {
  if (!graphRef.value) return
  const el = graphRef.value
  el.innerHTML = ''
  const { width, height } = el.getBoundingClientRect()
  if (!width || !height) return

  const entities = notesStore.entities
  const synergyLinks = notesStore.synergyLinks
  if (entities.length === 0) return

  const nodes = entities.map(e => ({
    ...e,
    noteCount: notesStore.entityNoteCounts[e.id] || 0,
  }))

  const links = synergyLinks.map(l => ({
    source: l.source,
    target: l.target,
    count: l.count,
  }))

  const maxCount = Math.max(1, ...nodes.map(n => n.noteCount))
  const maxLinkCount = Math.max(1, ...links.map(l => l.count))
  const radius = d3.scaleSqrt().domain([0, maxCount]).range([28, 70])
  const linkWidth = d3.scaleLinear().domain([0, maxLinkCount]).range([1.5, 8])
  const linkOpacity = d3.scaleLinear().domain([0, maxLinkCount]).range([0.2, 0.7])

  svg = d3.select(el).append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('background', 'transparent')

  // Arrow defs
  const defs = svg.append('defs')
  defs.append('filter').attr('id', 'glow')
    .append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur')
  const feMerge = svg.select('filter#glow').append('feMerge')
  feMerge.append('feMergeNode').attr('in', 'coloredBlur')
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

  const g = svg.append('g')

  // Zoom
  const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.2, 4])
    .on('zoom', e => g.attr('transform', e.transform))
  svg.call(zoomBehavior as any)
  svg.call((zoomBehavior as any).transform, d3.zoomIdentity.translate(width / 2, height / 2))
  zoom = zoomBehavior

  // Draw links
  const linkSel = g.append('g').selectAll('line').data(links).enter().append('line')
    .attr('stroke', '#6366f120')
    .attr('stroke-width', d => linkWidth(d.count))
    .attr('stroke-opacity', d => linkOpacity(d.count))

  // Draw link count labels
  const linkLabelSel = g.append('g').selectAll('text').data(links).enter().append('text')
    .text(d => `${d.count}`)
    .attr('fill', '#94a3b8')
    .attr('font-size', '10')
    .attr('font-family', 'Inter, sans-serif')
    .attr('text-anchor', 'middle')
    .attr('dy', '-4')
    .style('pointer-events', 'none')

  // Draw nodes
  const nodeSel = g.append('g').selectAll('g').data(nodes).enter().append('g')
    .style('cursor', 'pointer')
    .call(d3.drag<any, any>()
      .on('start', (event, d) => {
        if (!event.active && simulation) simulation.alphaTarget(0.3).restart()
        d.fx = d.x; d.fy = d.y
      })
      .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
      .on('end', (event, d) => {
        if (!event.active && simulation) simulation.alphaTarget(0)
        d.fx = null; d.fy = null
      })
    )
    .on('click', (_event, d) => {
      selectedEntity.value = notesStore.entities.find(e => e.id === d.id) ?? null
      filterStore.setEntityFilter(d.id)
    })

  // Outer glow ring
  nodeSel.append('circle')
    .attr('r', d => radius(d.noteCount) + 10)
    .attr('fill', d => d.color + '08')
    .attr('stroke', d => d.color + '25')
    .attr('stroke-width', 1)

  // Main circle
  nodeSel.append('circle')
    .attr('r', d => radius(d.noteCount))
    .attr('fill', d => d.color + '15')
    .attr('stroke', d => d.color)
    .attr('stroke-width', 2)
    .style('filter', 'url(#glow)')

  // Count text
  nodeSel.append('text')
    .text(d => d.noteCount)
    .attr('fill', d => d.color)
    .attr('font-size', d => radius(d.noteCount) > 40 ? '18' : '14')
    .attr('font-family', 'Inter, sans-serif')
    .attr('font-weight', '700')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .style('pointer-events', 'none')

  // Label below node
  nodeSel.append('text')
    .attr('data-node-label', '')
    .attr('display', showLabels.value ? null : 'none')
    .text(d => d.name)
    .attr('fill', '#cbd5e1')
    .attr('font-size', '13')
    .attr('font-family', 'Inter, sans-serif')
    .attr('font-weight', '600')
    .attr('text-anchor', 'middle')
    .attr('dy', d => radius(d.noteCount) + 20)
    .style('pointer-events', 'none')

  simulation = d3.forceSimulation(nodes as any)
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100).strength(0.6))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('collision', d3.forceCollide().radius((d: any) => radius(d.noteCount) + 30))
    .force('center', d3.forceCenter(0, 0))
    .on('tick', () => {
      linkSel
        .attr('x1', d => (d.source as any).x ?? 0)
        .attr('y1', d => (d.source as any).y ?? 0)
        .attr('x2', d => (d.target as any).x ?? 0)
        .attr('y2', d => (d.target as any).y ?? 0)
      linkLabelSel
        .attr('x', d => (((d.source as any).x ?? 0) + ((d.target as any).x ?? 0)) / 2)
        .attr('y', d => (((d.source as any).y ?? 0) + ((d.target as any).y ?? 0)) / 2)
      nodeSel.attr('transform', d => `translate(${(d as any).x ?? 0},${(d as any).y ?? 0})`)
    })
}

// Rebuild on data change
watch(() => [notesStore.notes, notesStore.entities], buildGraph, { deep: true })

// Toggle node labels
watch(showLabels, (val) => {
  if (!svg) return
  svg.selectAll('[data-node-label]').attr('display', val ? null : 'none')
})

// Highlight selected entity in graph
watch(() => filterStore.activeEntityId, (id) => {
  if (!svg) return
  svg.selectAll<SVGCircleElement, any>('circle:nth-child(2)')
    .attr('stroke-width', d => d.id === id ? 4 : 2)
    .attr('fill', d => d.id === id ? d.color + '30' : d.color + '15')
})

onMounted(async () => {
  if (notesStore.entities.length === 0) {
    await notesStore.fetchEntities()
    await notesStore.fetchNotes()
  }
  await nextTick()
  buildGraph()
})

onUnmounted(() => {
  simulation?.stop()
})
</script>
