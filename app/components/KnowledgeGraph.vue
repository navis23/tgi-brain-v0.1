<template>
  <div class="relative w-full h-full bg-brain-900/30 border border-brain-700/30 rounded-2xl overflow-hidden" :style="height ? { height: `${height}px` } : {}">
    <!-- Header -->
    <div class="absolute top-4 left-4 z-10 flex items-center gap-2">
      <div class="flex items-center gap-2 px-3 py-1.5 bg-brain-900/80 backdrop-blur-sm border border-brain-700/50 rounded-lg">
        <Icon name="lucide:network" class="w-4 h-4 text-entity-tgi" />
        <span class="text-xs font-semibold text-brain-300">Knowledge Graph</span>
      </div>
      <div v-if="filterStore.activeEntityId" class="flex items-center gap-1.5 px-3 py-1.5 bg-brain-900/80 backdrop-blur-sm border border-brain-700/50 rounded-lg">
        <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: activeEntityColor }" />
        <span class="text-xs font-medium text-brain-200">{{ activeEntityName }}</span>
        <button @click="filterStore.setEntityFilter(null)" class="ml-1 text-brain-400 hover:text-brain-200 cursor-pointer">
          <Icon name="lucide:x" class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- Legend -->
    <div class="absolute top-4 right-4 z-10 flex flex-wrap gap-2">
      <div
        v-for="entity in notesStore.entities"
        :key="entity.id"
        class="flex items-center gap-1.5 px-2 py-1 bg-brain-900/80 backdrop-blur-sm border border-brain-700/50 rounded-md"
      >
        <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: entity.color }" />
        <span class="text-[10px] font-medium text-brain-400">{{ entity.name }}</span>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="notesStore.entities.length === 0"
      class="absolute inset-0 flex flex-col items-center justify-center text-brain-400"
    >
      <Icon name="lucide:network" class="w-12 h-12 mb-3 opacity-30" />
      <p class="text-sm">Loading graph data...</p>
    </div>

    <!-- Graph container -->
    <ClientOnly>
      <div ref="graphContainer" class="w-full h-full relative" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { GraphNode, GraphLink } from '~/types'

const props = withDefaults(defineProps<{
  height?: number | null
}>(), {
  height: null,
})

const graphContainer = ref<HTMLElement>()
const notesStore = useNotesStore()
const filterStore = useFilterStore()
const { init, destroy } = useForceGraph()

const activeEntityName = computed(() =>
  notesStore.entities.find(e => e.id === filterStore.activeEntityId)?.name
)
const activeEntityColor = computed(() =>
  notesStore.entities.find(e => e.id === filterStore.activeEntityId)?.color
)

const graphNodes = computed((): GraphNode[] =>
  notesStore.entities.map(e => ({
    id: e.id,
    name: e.name,
    slug: e.slug,
    color: e.color,
    noteCount: notesStore.entityNoteCounts[e.id] || 0,
  }))
)

const graphLinks = computed((): GraphLink[] =>
  notesStore.synergyLinks.map(l => ({
    source: l.source,
    target: l.target,
    count: l.count,
  }))
)

const renderGraph = () => {
  if (!graphContainer.value || notesStore.entities.length === 0) return

  const rect = graphContainer.value.getBoundingClientRect()
  const width = rect.width || 800
  const actualHeight = props.height || rect.height || 400

  init(
    {
      container: graphContainer.value,
      width,
      height: actualHeight,
      onNodeClick: (node: GraphNode) => {
        filterStore.setEntityFilter(node.id)
      },
      activeNodeId: filterStore.activeEntityId,
    },
    // Deep clone to avoid D3 mutating the reactive data
    JSON.parse(JSON.stringify(graphNodes.value)),
    JSON.parse(JSON.stringify(graphLinks.value))
  )
}

// Re-render when data changes
watch(
  [graphNodes, graphLinks, () => filterStore.activeEntityId],
  () => {
    nextTick(renderGraph)
  },
  { deep: true }
)

// Resize handler
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick(() => {
    renderGraph()

    if (graphContainer.value) {
      resizeObserver = new ResizeObserver(() => {
        renderGraph()
      })
      resizeObserver.observe(graphContainer.value)
    }
  })
})

onUnmounted(() => {
  destroy()
  resizeObserver?.disconnect()
})
</script>
