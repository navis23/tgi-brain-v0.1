<template>
    <div class="flex flex-col min-h-screen md:h-auto overflow-hidden md:overflow-visible">
        <!-- Header -->
        <AppHeader @open-capture="openCapture" />

        <!-- Main content container -->
        <div class="flex-1 flex flex-col p-4 md:p-8 gap-6 md:gap-8 overflow-y-auto">

            <!-- Headline -->
            <div class="px-2">
                <h2 class="text-3xl lg:text-5xl font-display font-bold text-brain-900 uppercase tracking-tighter">Index
                    Overview</h2>
                <p class="font-mono text-xs text-brain-500 uppercase tracking-widest mt-1">Real-time Conglomerate
                    Register</p>
            </div>

            <!-- High Level Stats Row -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 shrink-0">
                <!-- Note Stat -->
                <div class="brutal-card flex flex-col justify-between p-5 bg-white h-32">
                    <div class="flex items-start justify-between">
                        <span
                            class="text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest bg-brain-100 px-2 py-1 border border-brain-900">Total</span>
                        <Icon name="lucide:file-text" class="w-5 h-5 text-brain-900" />
                    </div>
                    <div>
                        <p class="text-4xl md:text-5xl font-display font-bold text-brain-900 tabular-nums leading-none">
                            {{ notesStore.loading ? '—' : notesStore.notes.length }}</p>
                    </div>
                </div>

                <!-- Pipeline Stat -->
                <div
                    class="brutal-card flex flex-col justify-between p-5 bg-[#00C853] text-white h-32 border-2 border-brain-900 shadow-[4px_4px_0px_#111]">
                    <div class="flex items-start justify-between gap-2">
                        <span
                            class="text-[10px] font-mono font-bold uppercase tracking-widest bg-white/20 px-2 py-1 border border-white">Active
                            Pipeline</span>
                        <Icon name="lucide:zap" class="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p class="text-4xl md:text-5xl font-display font-bold text-white tabular-nums leading-none">{{
                            notesStore.loading ? '—' : stats.pipeline }}</p>
                    </div>
                </div>

                <!-- Committed Stat -->
                <div
                    class="brutal-card flex flex-col justify-between p-5 bg-[#10b981] text-white h-32 border-2 border-brain-900 shadow-[4px_4px_0px_#111]">
                    <div class="flex items-start justify-between gap-2">
                        <span
                            class="text-[10px] font-mono font-bold uppercase tracking-widest bg-white/20 px-2 py-1 border border-white">Committed</span>
                        <Icon name="lucide:check-square" class="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p class="text-4xl md:text-5xl font-display font-bold text-white tabular-nums leading-none">{{
                            notesStore.loading ? '—' : stats.committed }}</p>
                    </div>
                </div>

                <!-- Synergies Stat -->
                <div class="brutal-card flex flex-col justify-between p-5 bg-white h-32">
                    <div class="flex items-start justify-between">
                        <span
                            class="text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest bg-brain-100 px-2 py-1 border border-brain-900">Synergies</span>
                        <Icon name="lucide:git-pull-request" class="w-5 h-5 text-brain-900" />
                    </div>
                    <div>
                        <p class="text-4xl md:text-5xl font-display font-bold text-brain-900 tabular-nums leading-none">
                            {{ notesStore.loading ? '—' : notesStore.synergyLinks.length }}</p>
                    </div>
                </div>

                <!-- Shelved Stat -->
                <div class="brutal-card flex flex-col justify-between p-5 bg-white h-32">
                    <div class="flex items-start justify-between">
                        <span
                            class="text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest bg-brain-100 px-2 py-1 border border-brain-900">Shelved</span>
                        <Icon name="lucide:archive" class="w-5 h-5 text-brain-900" />
                    </div>
                    <div>
                        <p class="text-4xl md:text-5xl font-display font-bold text-brain-900 tabular-nums leading-none">
                            {{ notesStore.loading ? '—' : stats.shelved }}</p>
                    </div>
                </div>
            </div>

            <!-- Split Layout (Recent Activity & Graph Overview) -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">

                <!-- Left: Recent Activity Ledger -->
                <div
                    class="lg:col-span-2 brutal-card flex flex-col bg-white overflow-hidden border-2 border-brain-900 shadow-[4px_4px_0px_#111] min-h-[500px] lg:min-h-0">
                    <div
                        class="flex items-center gap-3 justify-between px-6 py-4 border-b-2 border-brain-900 bg-brain-100 shrink-0">
                        <div class="flex items-center gap-3">
                            <Icon name="lucide:activity" class="w-5 h-5 text-brain-900" />
                            <h3 class="text-sm font-display font-bold text-brain-900 uppercase tracking-widest">Recent
                                Activity Ledger</h3>
                        </div>
                        <NuxtLink to="/notes"
                            class="brutal-btn text-[10px] px-3 py-1.5 bg-white text-brain-900 transition-colors flex items-center gap-1 border-2 border-brain-900 shadow-[2px_2px_0px_#111]">
                            View Registry
                        </NuxtLink>
                    </div>

                    <div class="flex-1 overflow-y-auto bg-white flex flex-col divide-y-2 divide-brain-900">
                        <div v-for="note in recentNotes" :key="note.id"
                            class="group flex flex-col sm:flex-row gap-4 p-4 md:p-5 hover:bg-brain-50 transition-colors duration-100 cursor-pointer">
                            <!-- Icon & Time -->
                            <div class="flex items-center sm:flex-col sm:items-start gap-2 shrink-0 sm:w-20 pt-1">
                                <span
                                    class="text-[10px] bg-brain-100 border border-brain-900 px-2 py-0.5 font-mono text-brain-900 font-bold tabular-nums whitespace-nowrap">{{
                                        formatDate(note.updated_at) }}</span>
                            </div>

                            <!-- Main Content -->
                            <div class="flex-1 min-w-0 flex flex-col gap-2">
                                <p
                                    class="text-lg font-display font-bold text-brain-900 group-hover:underline uppercase tracking-tight wrap-break-word whitespace-normal leading-tight">
                                    {{ note.title || 'UNTITLED DATA' }}</p>
                                <div class="flex items-center flex-wrap gap-2">
                                    <EntityBadge v-for="entity in (note.entities || []).slice(0, 3)" :key="entity.id"
                                        :entity="entity"
                                        class="rounded-none! shadow-[2px_2px_0px_#111]! border-2! border-brain-900!" />
                                    <span v-if="(note.entities || []).length > 3"
                                        class="text-[10px] font-mono text-brain-900 font-bold px-2 py-1 border-2 border-brain-900 bg-brain-100 shadow-[2px_2px_0px_#111]">
                                        +{{ (note.entities || []).length - 3 }} Mutual
                                    </span>
                                </div>
                            </div>

                            <!-- Tags / Status -->
                            <div
                                class="flex flex-row flex-wrap sm:flex-col items-center sm:items-end gap-2 shrink-0 sm:w-32 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t-2 border-brain-900 border-dashed sm:border-t-0">
                                <CategoryBadge :category="note.category"
                                    class="rounded-none! shadow-[2px_2px_0px_#111]! border-2! border-brain-900!" />
                                <StatusBadge :status="note.status"
                                    class="rounded-none! shadow-[2px_2px_0px_#111]! border-2! border-brain-900!" />
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-if="!notesStore.loading && recentNotes.length === 0"
                            class="h-full flex flex-col items-center justify-center text-brain-900 py-16">
                            <div
                                class="w-16 h-16 border-2 border-brain-900 bg-brain-100 flex items-center justify-center mb-4 shadow-[2px_2px_0px_#111]">
                                <Icon name="lucide:inbox" class="w-8 h-8" />
                            </div>
                            <p class="text-sm font-display font-bold uppercase">Ledger is empty</p>
                            <button @click="openCapture"
                                class="text-xs font-mono mt-2 bg-brain-900 text-white px-3 py-2 cursor-pointer font-bold uppercase border-2 border-transparent hover:border-brain-900 hover:bg-white hover:text-brain-900 transition-colors">Generate
                                first entry</button>
                        </div>
                    </div>
                </div>

                <!-- Right: Topology Summary (Replaced Full Graph) -->
                <div
                    class="lg:col-span-1 brutal-card flex flex-col bg-brain-50 overflow-hidden border-2 border-brain-900 shadow-[4px_4px_0px_#111] min-h-[350px]">
                    <div
                        class="flex items-center gap-3 justify-between px-6 py-4 border-b-2 border-brain-900 bg-brain-100 shrink-0">
                        <div class="flex items-center gap-3">
                            <Icon name="lucide:radar" class="w-5 h-5 text-brain-900" />
                            <h3 class="text-sm font-display font-bold text-brain-900 uppercase tracking-widest">Topology
                                Snapshot</h3>
                        </div>
                        <NuxtLink to="/graph"
                            class="brutal-btn text-[10px] px-3 py-1.5 bg-white text-brain-900 transition-colors flex items-center gap-1 border-2 border-brain-900 shadow-[2px_2px_0px_#111]">
                            Expand Network
                        </NuxtLink>
                    </div>

                    <div class="flex-1 flex flex-col bg-white overflow-y-auto p-5">
                        <div class="space-y-6">
                            <!-- Network Pulse block -->
                            <div>
                                <p
                                    class="text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest mb-3 bg-brain-100 border border-brain-900 px-2 py-1 inline-block">
                                    Pulse</p>
                                <div class="flex items-end gap-2">
                                    <p class="text-4xl font-display font-bold text-brain-900 leading-none">{{
                                        notesStore.synergyLinks.length }}</p>
                                    <p class="text-sm font-mono font-bold text-brain-500 uppercase pb-1">Edges</p>
                                </div>
                            </div>

                            <!-- Top Synergies -->
                            <div>
                                <p
                                    class="text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest mb-3 bg-brain-100 border border-brain-900 px-2 py-1 inline-block">
                                    Key Edges</p>
                                <div class="flex flex-col gap-2">
                                    <div v-for="link in topSynergiesSummary" :key="`${link.source}::${link.target}`"
                                        class="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-2 border-brain-900 bg-brain-50 gap-2 sm:gap-4">
                                        <div class="flex items-center gap-2 overflow-hidden flex-1">
                                            <span
                                                class="text-xs font-mono font-bold text-brain-900 truncate uppercase">{{
                                                    getEntityName(link.source) }}</span>
                                            <Icon name="lucide:arrow-right-left"
                                                class="w-3 h-3 text-brain-900 shrink-0" />
                                            <span
                                                class="text-xs font-mono font-bold text-brain-900 truncate uppercase">{{
                                                    getEntityName(link.target) }}</span>
                                        </div>
                                        <span
                                            class="text-[10px] font-mono font-bold text-white bg-brain-900 px-2 py-1 shrink-0 self-start sm:self-auto">
                                            {{ link.count }} Links
                                        </span>
                                    </div>
                                    <div v-if="topSynergiesSummary.length === 0"
                                        class="p-4 border-2 border-brain-900 border-dashed text-center">
                                        <p class="text-xs font-mono text-brain-500 uppercase font-bold">No edges
                                            detected</p>
                                    </div>
                                </div>
                            </div>
                        </div>
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
    let committed = 0

    notesStore.notes.forEach(n => {
        if (n.status === 'active_pipeline') pipeline++
        if (n.status === 'shelved') shelved++
        if (n.status === 'committed') committed++
    })

    return { pipeline, shelved, committed }
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
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

const topSynergiesSummary = computed(() => {
    return [...notesStore.synergyLinks].sort((a, b) => b.count - a.count).slice(0, 4)
})

const getEntityName = (id: string) => {
    return notesStore.entities.find(e => e.id === id)?.name ?? id
}

// Load data on mount
onMounted(async () => {
    await notesStore.fetchEntities()
    await notesStore.fetchNotes()
})
</script>
