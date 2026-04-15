<template>
    <div class="flex flex-col min-h-screen overflow-hidden bg-brain-50 font-sans">

        <!-- Architectural Grid Background -->
        <div class="absolute inset-0 z-0 pointer-events-none opacity-5"
            style="background-size: 24px 24px; background-image: linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px);">
        </div>

        <!-- Page header -->
        <div
            class="relative z-10 flex items-center justify-between px-6 py-4 border-b-2 border-brain-900 bg-white shrink-0">
            <div class="flex items-center gap-4">
                <button @click="isSidebarOpen = true"
                    class="md:hidden p-2 -ml-2 text-brain-900 hover:text-black hover:bg-brain-100 border-2 border-transparent transition-all">
                    <Icon name="lucide:menu" class="w-6 h-6" />
                </button>
                <div
                    class="hidden sm:flex w-12 h-12 bg-brain-900 items-center justify-center border-2 border-brain-900 shadow-[2px_2px_0px_#111]">
                    <Icon name="lucide:database" class="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 class="text-2xl font-display font-bold text-brain-900 uppercase tracking-tighter">Register</h2>
                    <p
                        class="text-[10px] font-mono text-brain-500 uppercase tracking-widest mt-1 pr-2 bg-brain-100 inline-block border border-brain-900 px-1">
                        Vol. {{ filteredNotes.length }} / {{ notesStore.notes.length }}</p>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <!-- Search -->
                <div class="relative hidden sm:block h-10">
                    <Icon name="lucide:search"
                        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brain-900" />
                    <input v-model="localSearch" type="text" placeholder="Search index..."
                        class="pl-10 pr-4 py-2 h-full bg-white border-2 border-brain-900 text-sm font-mono text-brain-900 placeholder:text-brain-400 focus:outline-none focus:bg-brain-100 transition-all w-48 md:w-64" />
                    <button v-if="localSearch" @click="localSearch = ''; filterStore.setSearch('')"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-brain-500 hover:text-brain-900 cursor-pointer">
                        <Icon name="lucide:x" class="w-4 h-4" />
                    </button>
                </div>

                <!-- Clear filters -->
                <button v-if="filterStore.hasActiveFilters" @click="clearAll"
                    class="hidden sm:flex brutal-btn items-center gap-2 px-4 py-2 bg-white text-xs font-bold text-brain-900 cursor-pointer h-10">
                    <Icon name="lucide:filter-x" class="w-4 h-4" />
                    <span>Clear Indexes</span>
                </button>

                <!-- Toggle Filters -->
                <button @click="showFilters = !showFilters"
                    class="flex brutal-btn items-center justify-center p-2 text-brain-900 bg-white h-10 w-10 cursor-pointer"
                    :class="{ 'bg-brain-900 text-white': showFilters || filterStore.hasActiveFilters }">
                    <Icon name="lucide:filter" class="w-5 h-5" />
                </button>

                <!-- New Note -->
                <NuxtLink to="/notes/new"
                    class="brutal-btn flex items-center gap-2 px-5 py-2 h-10 text-xs font-bold text-white bg-brain-900 shadow-[2px_2px_0px_#111] cursor-pointer">
                    <Icon name="lucide:plus-square" class="w-4 h-4" />
                    <span class="hidden md:inline font-mono tracking-widest uppercase">Input Data</span>
                    <span class="md:hidden uppercase">Input</span>
                </NuxtLink>
            </div>
        </div>

        <!-- Filter bar -->
        <div v-show="showFilters"
            class="relative z-10 px-4 md:px-6 py-4 border-b-2 border-brain-900 bg-brain-100 shrink-0 space-y-4 overflow-x-auto hide-scrollbar">
            <!-- Entity filters -->
            <div class="flex items-start md:items-center gap-3 flex-col md:flex-row flex-wrap">
                <span
                    class="text-[10px] text-brain-900 uppercase tracking-widest font-bold bg-white px-2 border border-brain-900 h-6 flex items-center shrink-0 shadow-[1px_1px_0px_#111] mt-0.5">Entity</span>
                <div class="flex items-center gap-2 flex-wrap">
                    <button v-for="entity in notesStore.entities" :key="entity.id"
                        @click="filterStore.setEntityFilter(entity.id)"
                        class="flex items-center gap-2 px-3 py-1 text-[10px] font-mono font-bold cursor-pointer transition-all duration-100 border-2 border-brain-900 uppercase"
                        :class="filterStore.activeEntityId === entity.id
                            ? 'text-white shadow-[2px_2px_0px_#111] -translate-y-0.5'
                            : 'bg-white text-brain-900 hover:shadow-[2px_2px_0px_#111] hover:-translate-y-0.5'" :style="filterStore.activeEntityId === entity.id
                                ? { backgroundColor: entity.color, borderColor: '#111' }
                                : {}">
                        <span v-if="filterStore.activeEntityId !== entity.id"
                            class="w-2 h-2 shrink-0 border border-brain-900"
                            :style="{ backgroundColor: entity.color }" />
                        {{ entity.name }}
                    </button>
                </div>
            </div>

            <!-- Category + Status on same row -->
            <div class="flex items-start md:items-center gap-6 flex-col md:flex-row flex-wrap">
                <!-- Category -->
                <div class="flex items-center gap-3 flex-wrap">
                    <span
                        class="text-[10px] text-brain-900 uppercase tracking-widest font-bold bg-white px-2 border border-brain-900 h-6 flex items-center shrink-0 shadow-[1px_1px_0px_#111]">Sector</span>
                    <div class="flex items-center gap-2 flex-wrap">
                        <button v-for="cat in CATEGORIES" :key="cat" @click="filterStore.setCategoryFilter(cat)"
                            class="px-3 py-1 text-[10px] font-mono font-bold cursor-pointer transition-all duration-100 border-2 border-brain-900 uppercase"
                            :class="filterStore.activeCategory === cat
                                ? 'text-white shadow-[2px_2px_0px_#111] -translate-y-0.5'
                                : 'bg-white text-brain-900 hover:shadow-[2px_2px_0px_#111] hover:-translate-y-0.5'"
                            :style="filterStore.activeCategory === cat
                                ? { backgroundColor: CATEGORY_COLORS[cat] }
                                : {}">
                            {{ CATEGORY_LABELS[cat] }}
                        </button>
                    </div>
                </div>

                <div class="w-full h-px bg-brain-900 md:w-px md:h-6 shrink-0" />

                <!-- Status -->
                <div class="flex items-center gap-3 flex-wrap">
                    <span
                        class="text-[10px] text-brain-900 uppercase tracking-widest font-bold bg-white px-2 border border-brain-900 h-6 flex items-center shrink-0 shadow-[1px_1px_0px_#111]">State</span>
                    <div class="flex items-center gap-2 flex-wrap">
                        <button v-for="status in STATUSES" :key="status" @click="filterStore.setStatusFilter(status)"
                            class="px-3 py-1 text-[10px] font-mono font-bold cursor-pointer transition-all duration-100 border-2 border-brain-900 uppercase"
                            :class="filterStore.activeStatus === status
                                ? 'bg-brain-900 text-white shadow-[2px_2px_0px_#111] -translate-y-0.5'
                                : 'bg-white text-brain-900 hover:shadow-[2px_2px_0px_#111] hover:-translate-y-0.5'">
                            <div class="flex items-center gap-2">
                                <span v-if="filterStore.activeStatus !== status"
                                    class="w-2 h-2 shrink-0 border border-brain-900"
                                    :style="{ backgroundColor: STATUS_COLORS[status] }"></span>
                                {{ STATUS_LABELS[status] }}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="relative z-10 flex flex-1 min-h-0 bg-transparent p-4 md:p-6 lg:p-8">
            <!-- Main table -->
            <div
                class="flex-1 overflow-auto bg-white border-2 border-brain-900 shadow-[4px_4px_0px_#111] flex flex-col brutal-card">
                <div class="flex-1 overflow-auto">
                    <!-- Mobile Card View -->
                    <div class="md:hidden flex flex-col border-b-2 border-brain-900 last:border-b-0">
                        <template v-for="note in paginatedNotes" :key="'mob-' + note.id">
                            <div
                                class="bg-white border-b-2 border-brain-900 last:border-b-0 p-5 flex flex-col gap-4 relative group hover:bg-brain-100 transition-colors">
                                <div class="flex items-start justify-between gap-3">
                                    <p
                                        class="text-base font-display font-bold text-brain-900 uppercase tracking-tight break-words whitespace-normal leading-tight flex-1">
                                        {{ note.title || 'Untitled Data' }}
                                    </p>
                                    <NuxtLink :to="`/notes/${note.id}`"
                                        class="brutal-btn flex items-center justify-center px-4 py-2 bg-brain-900 text-white text-[10px] uppercase cursor-pointer">
                                        Access
                                        <Icon name="lucide:arrow-right" class="w-3.5 h-3.5 ml-2" />
                                    </NuxtLink>
                                </div>

                                <div v-if="note.entities && note.entities.length" class="flex flex-wrap gap-2">
                                    <EntityBadge v-for="entity in note.entities" :key="entity.id" :entity="entity"
                                        class="rounded-none! shadow-[2px_2px_0px_#111]! border-2! border-brain-900!" />
                                </div>


                                <div class="flex items-center flex-wrap gap-2">
                                    <CategoryBadge :category="note.category"
                                        class="rounded-none! shadow-[2px_2px_0px_#111]! border-2! border-brain-900!" />
                                    <StatusBadge :status="note.status"
                                        class="rounded-none! shadow-[2px_2px_0px_#111]! border-2! border-brain-900!" />
                                </div>

                                <div
                                    class="flex items-center justify-between mt-2 pt-4 border-t-2 border-brain-900 border-dashed">
                                    <div
                                        class="flex items-center gap-2 text-[10px] font-mono font-bold text-brain-500 uppercase tracking-widest bg-brain-50 px-2 py-1 border border-brain-900">
                                        <Icon name="lucide:clock" class="w-3" />
                                        {{ formatDate(note.updated_at) }}
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <template v-if="confirmDeleteId === note.id">
                                            <span
                                                class="text-[10px] font-mono font-bold text-entity-enterbiner uppercase">Confirm?</span>
                                            <button @click.stop="handleDelete(note.id)"
                                                class="brutal-btn p-1.5 bg-entity-enterbiner text-white">
                                                <Icon name="lucide:check-square" class="w-4 h-4" />
                                            </button>
                                            <button @click.stop="confirmDeleteId = null"
                                                class="brutal-btn p-1.5 bg-white text-brain-900">
                                                <Icon name="lucide:x-square" class="w-4 h-4" />
                                            </button>
                                        </template>
                                        <template v-else>
                                            <button @click.stop="navigateTo(`/notes/${note.id}/edit`)"
                                                class="brutal-btn p-1.5 bg-[#FFDD00] text-brain-900 border-2 border-brain-900 shadow-[1px_1px_0px_#111]">
                                                <Icon name="lucide:edit-3" class="w-4 h-4" />
                                            </button>
                                            <button @click.stop="confirmDeleteId = note.id"
                                                class="brutal-btn p-1.5 bg-entity-enterbiner text-white border-2 border-brain-900 shadow-[1px_1px_0px_#111]">
                                                <Icon name="lucide:trash-2" class="w-4 h-4" />
                                            </button>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- Desktop Table View -->
                    <table class="hidden md:table w-full table-fixed min-w-200 border-collapse">
                        <colgroup>
                            <col class="w-auto" />
                            <col style="width: 170px" />
                            <col style="width: 130px" />
                            <col style="width: 150px" />
                            <col style="width: 140px" />
                            <col style="width: 100px" />
                        </colgroup>
                        <thead class="sticky top-0 z-10">
                            <tr class="bg-brain-100 border-b-2 border-brain-900">
                                <th v-for="col in columns" :key="col.key" @click="col.sortable && toggleSort(col.key)"
                                    class="px-5 py-4 text-left text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest border-r-2 border-brain-900 last:border-r-0 whitespace-nowrap"
                                    :class="col.sortable ? 'cursor-pointer hover:bg-brain-200 transition-colors select-none' : ''">
                                    <div class="flex items-center gap-2">
                                        {{ col.label }}
                                        <span v-if="col.sortable && sortKey === col.key"
                                            class="text-[10px] font-bold">{{ sortDir === 'asc'
                                                ? '▲' : '▼' }}</span>
                                        <Icon v-else-if="col.sortable" name="lucide:arrow-up-down"
                                            class="w-3 h-3 opacity-30" />
                                    </div>
                                </th>
                                <th
                                    class="px-5 py-4 text-right text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest">
                                    Controls</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="note in paginatedNotes" :key="note.id">
                                <tr
                                    class="group border-b border-brain-300 hover:bg-brain-50 transition-colors duration-100 bg-white">
                                    <!-- Title -->
                                    <td
                                        class="px-5 py-4 border-r-2 border-brain-900 lg:border-r align-top">
                                        <NuxtLink :to="`/notes/${note.id}`">
                                            <div class="flex flex-col items-start justify-center group/title gap-2">
                                                <p class="text-xs text-brain-600 border-b border-b-brain-900">
                                                    click to read it
                                                </p>
                                                <p
                                                    class="text-sm font-display font-bold text-brain-900 uppercase tracking-tight wrap-break-word whitespace-normal leading-tight group-hover:underline">
                                                    {{ note.title || 'Untitled Data' }}
                                                    
                                                </p>
                                                
                                            </div>
                                        </NuxtLink>
                                    </td>

                                    <!-- Entities -->
                                    <td class="px-5 py-4 border-r border-brain-300 align-top">
                                        <div class="flex flex-wrap gap-2">
                                            <EntityBadge v-for="entity in note.entities" :key="entity.id"
                                                :entity="entity"
                                                class="rounded-none! shadow-[2px_2px_0px_#111]! border-2! border-brain-900!" />
                                        </div>
                                    </td>

                                    <!-- Category -->
                                    <td class="px-5 py-4 border-r border-brain-300 align-top">
                                        <CategoryBadge :category="note.category"
                                            class="rounded-none! shadow-[2px_2px_0px_#111]! border-2! border-brain-900!" />
                                    </td>

                                    <!-- Status -->
                                    <td class="px-5 py-4 border-r border-brain-300 align-top">
                                        <StatusBadge :status="note.status"
                                            class="rounded-none! shadow-[2px_2px_0px_#111]! border-2! border-brain-900!" />
                                    </td>

                                    <!-- Dates -->
                                    <td class="px-5 py-4 border-r-2 border-brain-900 align-top">
                                        <div class="flex flex-col gap-2 text-xs font-mono font-bold text-brain-900">
                                            <div class="flex items-center gap-2 bg-brain-100 px-2 border border-brain-900"
                                                title="Updated">
                                                <Icon name="lucide:clock" class="w-3 h-3" />
                                                {{ formatDate(note.updated_at) }}
                                            </div>
                                            <div class="flex items-center gap-2 text-brain-500 bg-brain-50 px-2"
                                                title="Created">
                                                <Icon name="lucide:calendar" class="w-3 h-3" />
                                                {{ formatDate(note.created_at) }}
                                            </div>
                                        </div>
                                    </td>

                                    <!-- Actions -->
                                    <td class="px-3 py-4 text-right align-top">
                                        <div
                                            class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100">
                                            <template v-if="confirmDeleteId === note.id">
                                                <span
                                                    class="text-[10px] font-mono font-bold text-[#FF3366] uppercase mr-2 mt-1">Sure?</span>
                                                <button @click.stop="handleDelete(note.id)"
                                                    class="brutal-btn p-2 bg-[#FF3366] text-white">
                                                    <Icon name="lucide:check-square" class="w-4 h-4" />
                                                </button>
                                                <button @click.stop="confirmDeleteId = null"
                                                    class="brutal-btn p-2 bg-white text-brain-900">
                                                    <Icon name="lucide:x-square" class="w-4 h-4" />
                                                </button>
                                            </template>
                                            <template v-else>
                                                <button @click.stop="navigateTo(`/notes/${note.id}/edit`)"
                                                    class="brutal-btn p-2 bg-white text-brain-900" title="Edit">
                                                    <Icon name="lucide:edit-3" class="w-4 h-4" />
                                                </button>
                                                <button @click.stop="confirmDeleteId = note.id"
                                                    class="brutal-btn p-2 bg-[#FF3366] text-white" title="Delete">
                                                    <Icon name="lucide:x-square" class="w-4 h-4" />
                                                </button>
                                            </template>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>

                <!-- Empty / Loading -->
                <div v-if="filteredNotes.length === 0 && !notesStore.loading"
                    class="flex flex-col items-center justify-center py-32 px-4 text-center bg-white border-t-2 border-brain-900">
                    <div
                        class="w-20 h-20 border-2 border-brain-900 bg-brain-100 flex items-center justify-center mb-6 shadow-[4px_4px_0px_#111]">
                        <Icon name="lucide:file-question" class="w-10 h-10 text-brain-900" />
                    </div>
                    <p class="font-display font-bold text-2xl text-brain-900 uppercase">Index is Empty</p>
                    <p class="text-brain-500 font-mono text-sm mt-2">
                        {{
                            filterStore.hasActiveFilters ? 'Clear index filters to display records.' : 'Press ⌘K to initialize new query.'
                        }}
                    </p>
                </div>
                <div v-if="notesStore.loading"
                    class="flex items-center justify-center py-24 bg-white border-t-2 border-brain-900">
                    <div class="w-10 h-10 border-4 border-brain-200 border-t-brain-900 rounded-full animate-spin"></div>
                </div>

            </div>
        </div>

        <!-- Footer: summary + pagination -->
        <div
            class="relative z-10 flex flex-col xl:flex-row items-center justify-between px-6 py-4 border-t-2 border-brain-900 bg-white shrink-0 gap-4 xl:gap-0">
            <!-- Summary stats -->
            <div
                class="hidden xl:flex flex-wrap items-center justify-start gap-x-6 gap-y-2 text-[10px] font-mono font-bold uppercase tracking-widest text-brain-900 w-full xl:w-auto">
                <span class="flex items-center gap-2 border border-brain-900 px-2 py-1">
                    <span class="bg-brain-900 text-white px-2 -ml-2 -my-2 mr-2 py-1 h-full flex items-center">{{
                        filteredNotes.length }}</span> Results
                </span>
                <span v-if="filterStore.hasActiveFilters" class="text-brain-500 hidden sm:inline">
                    (Total: {{ notesStore.notes.length }})
                </span>
                <div class="h-4 w-1 border-l-2 border-brain-900 hidden md:block"></div>
                <div class="flex items-center gap-4">
                    <span class="flex items-center gap-2"><span
                            class="w-2 h-2 bg-brain-400 border border-brain-900"></span> {{
                                rawIdeaCount }} Raw</span>
                    <span class="flex items-center gap-2"><span
                            class="w-2 h-2 bg-brain-900 border border-brain-900"></span> {{
                                pipelineCount }} Active</span>
                    <span class="flex items-center gap-2"><span
                            class="w-2 h-2 bg-[#FF3366] border border-brain-900"></span> {{
                                shelvedCount }} Shelved</span>
                </div>
            </div>

            <!-- Pagination -->
            <div
                class="flex flex-wrap sm:flex-nowrap items-center justify-between w-full xl:w-auto gap-4 pt-4 xl:pt-0 border-t-2 border-brain-900 xl:border-none">
                <div
                    class="flex items-center justify-center w-full sm:w-auto gap-3 text-[10px] font-mono font-bold uppercase text-brain-900 order-2 sm:order-1">
                    <span>Per Page:</span>
                    <select v-model="pageSize"
                        class="bg-white border-2 border-brain-900 px-3 py-1.5 focus:outline-none cursor-pointer">
                        <option :value="10">10</option>
                        <option :value="25">25</option>
                        <option :value="50">50</option>
                        <option :value="100">100</option>
                    </select>
                </div>
                <div class="flex items-center justify-between w-full sm:w-auto gap-4 order-1 sm:order-2">
                    <span
                        class="text-[10px] font-mono font-bold uppercase text-brain-500 bg-brain-100 px-2 py-1 border border-brain-900">{{
                            pageInfo }}</span>
                    <div class="flex items-center gap-2">
                        <button @click="currentPage = 1" :disabled="currentPage === 1"
                            class="brutal-btn p-2 bg-white disabled:opacity-50 disabled:shadow-none">
                            <Icon name="lucide:chevrons-left" class="w-4 h-4" />
                        </button>
                        <button @click="currentPage--" :disabled="currentPage === 1"
                            class="brutal-btn p-2 bg-white disabled:opacity-50 disabled:shadow-none">
                            <Icon name="lucide:chevron-left" class="w-4 h-4" />
                        </button>
                        <button @click="currentPage++" :disabled="currentPage >= totalPages"
                            class="brutal-btn p-2 bg-white disabled:opacity-50 disabled:shadow-none">
                            <Icon name="lucide:chevron-right" class="w-4 h-4" />
                        </button>
                        <button @click="currentPage = totalPages" :disabled="currentPage >= totalPages"
                            class="brutal-btn p-2 bg-white disabled:opacity-50 disabled:shadow-none">
                            <Icon name="lucide:chevrons-right" class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import type { Note } from '~/types'
import {
    CATEGORIES, STATUSES,
    CATEGORY_COLORS, CATEGORY_LABELS,
    STATUS_COLORS, STATUS_LABELS,
} from '~/types'

useHead({ title: 'Registers — Archive' })

const notesStore = useNotesStore()
const filterStore = useFilterStore()
const isSidebarOpen = useState('sidebarOpen')

const confirmDeleteId = ref<string | null>(null)
const showFilters = ref(false)
const localSearch = ref(filterStore.searchQuery)
const currentPage = ref(1)
const pageSize = ref(25)

const sortKey = ref<keyof Note>('updated_at')
const sortDir = ref<'asc' | 'desc'>('desc')

const SORT_LABELS: Partial<Record<keyof Note, string>> = {
    created_at: 'Date',
    updated_at: 'Revised',
    title: 'Input',
    category: 'Sector',
    status: 'State',
}

const columns = [
    { key: 'title', label: 'Record Input', sortable: true },
    { key: 'entities', label: 'Entities', sortable: false },
    { key: 'category', label: 'Sector', sortable: true },
    { key: 'status', label: 'State', sortable: true },
    { key: 'updated_at', label: 'Timeline', sortable: true },
]

// Debounce search
let searchTimer: ReturnType<typeof setTimeout>
watch(localSearch, (v) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => filterStore.setSearch(v), 200)
})

// Reset page on filter change
watch([() => filterStore.activeEntityId, () => filterStore.activeCategory, () => filterStore.activeStatus, () => filterStore.searchQuery], () => {
    currentPage.value = 1
})

const filteredNotes = computed(() => {
    let result = [...notesStore.filteredNotes]
    result.sort((a, b) => {
        const aVal = String(a[sortKey.value] ?? '')
        const bVal = String(b[sortKey.value] ?? '')
        const cmp = aVal.localeCompare(bVal)
        return sortDir.value === 'asc' ? cmp : -cmp
    })
    return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredNotes.value.length / pageSize.value)))
const paginatedNotes = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredNotes.value.slice(start, start + pageSize.value)
})
const pageInfo = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value + 1
    const end = Math.min(currentPage.value * pageSize.value, filteredNotes.value.length)
    return filteredNotes.value.length > 0 ? `Vol. ${start}–${end} / ${filteredNotes.value.length}` : '0 results'
})

const rawIdeaCount = computed(() => filteredNotes.value.filter(n => n.status === 'raw_idea').length)
const pipelineCount = computed(() => filteredNotes.value.filter(n => n.status === 'active_pipeline').length)
const shelvedCount = computed(() => filteredNotes.value.filter(n => n.status === 'shelved').length)

const toggleSort = (key: string) => {
    if (sortKey.value === key) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortKey.value = key as keyof Note
        sortDir.value = 'desc'
    }
}



const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
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

const clearAll = () => {
    filterStore.clearAll()
    localSearch.value = ''
}

const handleDelete = async (id: string) => {
    try {
        await notesStore.deleteNote(id)
        confirmDeleteId.value = null
    } catch (err) {
        console.error('Delete failed:', err)
    }
}

onMounted(async () => {
    if (notesStore.entities.length === 0) {
        await notesStore.fetchEntities()
        await notesStore.fetchNotes()
    }
})
</script>
