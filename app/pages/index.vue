<template>
  <div class="flex flex-col h-screen md:h-auto md:min-h-screen overflow-hidden md:overflow-visible">
    <!-- Header -->
    <AppHeader @open-capture="openCapture" />

    <!-- Main content container -->
    <div class="flex-1 flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-y-auto">
      
      <!-- High Level Stats Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 shrink-0">
        <!-- Note Stat -->
        <div class="flex items-center gap-4 px-4 md:px-5 py-4 bg-brain-900/40 border border-brain-700/30 rounded-2xl shadow-sm">
          <div class="w-10 h-10 rounded-xl bg-entity-tgi/15 flex items-center justify-center shrink-0">
            <Icon name="lucide:file-text" class="w-5 h-5 text-entity-tgi" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-brain-500 font-medium uppercase tracking-wider">Total Notes</p>
            <p class="text-xl md:text-2xl font-bold text-brain-50 tabular-nums leading-tight">{{ notesStore.loading ? '—' : notesStore.notes.length }}</p>
          </div>
        </div>

        <!-- Pipeline Stat -->
        <div class="flex items-center gap-4 px-4 md:px-5 py-4 bg-brain-900/40 border border-brain-700/30 rounded-2xl shadow-sm">
          <div class="w-10 h-10 rounded-xl bg-entity-mbink/15 flex items-center justify-center shrink-0">
            <Icon name="lucide:sparkles" class="w-5 h-5 text-entity-mbink" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-brain-500 font-medium uppercase tracking-wider">In Pipeline</p>
            <p class="text-xl md:text-2xl font-bold text-brain-50 tabular-nums leading-tight">{{ notesStore.loading ? '—' : stats.pipeline }}</p>
          </div>
        </div>

        <!-- Synergies Stat -->
        <div class="flex items-center gap-4 px-4 md:px-5 py-4 bg-brain-900/40 border border-brain-700/30 rounded-2xl shadow-sm">
          <div class="w-10 h-10 rounded-xl bg-entity-sbs/15 flex items-center justify-center shrink-0">
            <Icon name="lucide:git-branch" class="w-5 h-5 text-entity-sbs" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-brain-500 font-medium uppercase tracking-wider">Synergies</p>
            <p class="text-xl md:text-2xl font-bold text-brain-50 tabular-nums leading-tight">{{ notesStore.loading ? '—' : notesStore.synergyLinks.length }}</p>
          </div>
        </div>

        <!-- Shelved Stat -->
        <div class="flex items-center gap-4 px-4 md:px-5 py-4 bg-brain-900/40 border border-brain-700/30 rounded-2xl shadow-sm">
          <div class="w-10 h-10 rounded-xl bg-brain-700/40 flex items-center justify-center shrink-0">
            <Icon name="lucide:archive" class="w-5 h-5 text-brain-400" />
          </div>
          <div class="min-w-0">
            <p class="text-xs text-brain-500 font-medium uppercase tracking-wider">Shelved</p>
            <p class="text-xl md:text-2xl font-bold text-brain-50 tabular-nums leading-tight">{{ notesStore.loading ? '—' : stats.shelved }}</p>
          </div>
        </div>
      </div>

      <!-- Split Layout (Recent Activity & Graph Overview) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 flex-1 min-h-[500px]">
        
        <!-- Left: Recent Activity Widget -->
        <div class="lg:col-span-2 flex flex-col bg-brain-900/30 border border-brain-700/30 rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-brain-700/30 bg-brain-950/40 shrink-0">
            <div class="flex items-center gap-2">
              <Icon name="lucide:activity" class="w-4 h-4 text-entity-sbs" />
              <h3 class="text-sm font-semibold text-brain-100 uppercase tracking-widest">Recent Activity</h3>
            </div>
            <NuxtLink to="/notes" class="text-xs font-medium text-brain-400 hover:text-entity-sbs transition-colors flex items-center gap-1">
              View all
              <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
            </NuxtLink>
          </div>
          
          <div class="flex-1 overflow-y-auto p-2 md:p-4 space-y-2">
            <div
              v-for="note in recentNotes"
              :key="note.id"
              @click="editNote(note)"
              class="group flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl hover:bg-brain-800/40 border border-transparent hover:border-brain-700/50 transition-all duration-200 cursor-pointer"
            >
              <!-- Icon & Time -->
              <div class="flex items-center sm:flex-col sm:justify-center gap-2 sm:gap-1 shrink-0 w-full sm:w-16">
                <div class="w-8 h-8 rounded-lg bg-brain-800/80 border border-brain-700/50 flex items-center justify-center text-brain-300 group-hover:text-entity-tgi group-hover:bg-entity-tgi/10 transition-colors">
                  <Icon name="lucide:file-text" class="w-4 h-4" />
                </div>
                <span class="text-[10px] text-brain-500 font-medium tabular-nums">{{ formatDate(note.updated_at) }}</span>
              </div>

              <!-- Main Content -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-brain-100 group-hover:text-white truncate mb-1">{{ note.title }}</p>
                <div class="flex items-center flex-wrap gap-2">
                  <EntityBadge v-for="entity in (note.entities || []).slice(0, 3)" :key="entity.id" :entity="entity" />
                  <span v-if="(note.entities || []).length > 3" class="text-[10px] text-brain-500 font-medium">
                    +{{ (note.entities || []).length - 3 }} more
                  </span>
                </div>
              </div>

              <!-- Tags / Status -->
              <div class="flex items-center sm:flex-col sm:items-end gap-2 shrink-0 border-t border-brain-700/30 pt-2 sm:border-t-0 sm:pt-0 mt-2 sm:mt-0">
                <CategoryBadge :category="note.category" />
                <StatusBadge :status="note.status" />
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!notesStore.loading && recentNotes.length === 0" class="h-full flex flex-col items-center justify-center text-brain-400 py-12">
               <Icon name="lucide:inbox" class="w-10 h-10 mb-3 opacity-30" />
               <p class="text-sm font-medium">No activity yet</p>
               <button @click="openCapture" class="text-xs mt-2 text-entity-sbs hover:underline">Create your first note</button>
            </div>
          </div>
        </div>

        <!-- Right: Knowledge Graph Overview -->
        <div class="lg:col-span-1 flex flex-col bg-brain-900/30 border border-brain-700/30 rounded-2xl shadow-xl shadow-black/10 overflow-hidden min-h-[350px]">
          <div class="flex items-center justify-between px-5 py-4 border-b border-brain-700/30 bg-brain-950/40 shrink-0">
            <div class="flex items-center gap-2">
              <Icon name="lucide:network" class="w-4 h-4 text-entity-tgi" />
              <h3 class="text-sm font-semibold text-brain-100 uppercase tracking-widest">Network Pulse</h3>
            </div>
            <NuxtLink to="/graph" class="text-xs font-medium text-brain-400 hover:text-entity-tgi transition-colors flex items-center gap-1">
              Explore
              <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
            </NuxtLink>
          </div>
          
          <div class="flex-1 relative bg-brain-950/30">
            <!-- Reuse KnowledgeGraph component but make it fill container securely -->
            <KnowledgeGraph class="absolute inset-0 border-0! rounded-none! bg-transparent! h-full w-full" />
            
            <!-- Overlay to prevent interaction if desired, or act as fade mask -->
            <div class="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-brain-900/50 to-transparent pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
    
    <!-- Capture Modal for editing via Dashboard -->
    <CaptureModal :edit-note="selectedNote" @close="selectedNote = null; showCapture = false" v-if="showCapture" />
  </div>
</template>

<script setup lang="ts">
import type { Note } from '~/types'

const notesStore = useNotesStore()

const showCapture = ref(false)
const selectedNote = ref<Note | null>(null)

const stats = computed(() => {
  let pipeline = 0
  let shelved = 0
  
  notesStore.notes.forEach(n => {
    if (n.status === 'active_pipeline') pipeline++
    if (n.status === 'shelved') shelved++
  })
  
  return { pipeline, shelved }
})

// Get top 8 most recently updated notes
const recentNotes = computed(() => {
  return [...notesStore.notes]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 8)
})

const openCapture = () => {
  selectedNote.value = null
  showCapture.value = true
}

const editNote = (note: Note) => {
  selectedNote.value = note
  showCapture.value = true
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Load data on mount
onMounted(async () => {
  await notesStore.fetchEntities()
  await notesStore.fetchNotes()
})
</script>
