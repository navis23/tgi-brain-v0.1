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
        <div class="hidden sm:flex w-9 h-9 rounded-xl bg-entity-sbs/15 border border-entity-sbs/30 items-center justify-center">
          <Icon name="lucide:table-2" class="w-4.5 h-4.5 text-entity-sbs" />
        </div>
        <div>
          <h2 class="text-base font-bold text-brain-50">Notes</h2>
          <p class="text-xs text-brain-500">{{ filteredNotes.length }} of {{ notesStore.notes.length }} notes · sorted by {{ SORT_LABELS[sortKey] }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Search -->
        <div class="relative hidden sm:block">
          <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brain-400" />
          <input
            v-model="localSearch"
            type="text"
            placeholder="Search notes..."
            class="pl-9 pr-4 py-2 bg-brain-800/60 border border-brain-700/50 rounded-xl text-sm text-brain-100 placeholder:text-brain-500 focus:outline-none focus:border-entity-sbs/50 focus:ring-1 focus:ring-entity-sbs/20 transition-all w-48 md:w-64"
          />
          <button
            v-if="localSearch"
            @click="localSearch = ''; filterStore.setSearch('')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-brain-500 hover:text-brain-300 cursor-pointer"
          >
            <Icon name="lucide:x" class="w-3 h-3" />
          </button>
        </div>

        <!-- Clear filters -->
        <button
          v-if="filterStore.hasActiveFilters"
          @click="clearAll"
          class="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-brain-400 hover:text-brain-200 hover:bg-brain-700/50 transition-colors cursor-pointer border border-brain-700/40"
        >
          <Icon name="lucide:x" class="w-3 h-3" />
          <span class="hidden md:inline">Clear</span> ({{ filterStore.activeFilterCount }})
        </button>

        <!-- Toggle Mobile Filters -->
        <button
          @click="showFiltersMobile = !showFiltersMobile"
          class="md:hidden flex items-center justify-center p-2 rounded-xl text-brain-400 bg-brain-800/40 hover:bg-brain-800 border border-brain-700/40 transition-colors cursor-pointer"
          :class="{ 'bg-entity-sbs/20 text-entity-sbs border-entity-sbs/50': showFiltersMobile || filterStore.hasActiveFilters }"
        >
          <Icon name="lucide:filter" class="w-5 h-5" />
          <span v-if="filterStore.hasActiveFilters" class="absolute top-1 right-1 w-2 h-2 bg-entity-sbs rounded-full"></span>
        </button>

        <!-- New Note -->
        <button
          @click="showCapture = true"
          class="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-entity-tgi to-entity-drc shadow-lg shadow-entity-tgi/20 hover:shadow-entity-tgi/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          <span class="hidden md:inline">New Note</span>
          <span class="md:hidden">New</span>
        </button>
      </div>
    </div>

    <!-- Filter bar -->
    <div :class="[showFiltersMobile ? 'block' : 'hidden md:block']" class="px-4 md:px-6 py-3 border-b border-brain-700/30 bg-brain-950/30 shrink-0 space-y-3 overflow-x-auto hide-scrollbar">
      <!-- Entity filters -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="text-[10px] text-brain-600 uppercase tracking-widest font-semibold w-14 shrink-0">Entity</span>
        <div class="flex items-center gap-1 flex-wrap">
          <button
            v-for="entity in notesStore.entities"
            :key="entity.id"
            @click="filterStore.setEntityFilter(entity.id)"
            class="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 border"
            :class="filterStore.activeEntityId === entity.id
              ? 'border-transparent'
              : 'bg-brain-800/40 border-brain-700/40 text-brain-500 hover:text-brain-300'"
            :style="filterStore.activeEntityId === entity.id
              ? { backgroundColor: `${entity.color}20`, borderColor: `${entity.color}40`, color: entity.color }
              : {}"
          >
            <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: entity.color }" />
            {{ entity.name }}
          </button>
        </div>
      </div>

      <!-- Category + Status on same row -->
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Category -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-[10px] text-brain-600 uppercase tracking-widest font-semibold w-14 shrink-0">Category</span>
          <div class="flex items-center gap-1 flex-wrap">
            <button
              v-for="cat in CATEGORIES"
              :key="cat"
              @click="filterStore.setCategoryFilter(cat)"
              class="px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 border"
              :class="filterStore.activeCategory === cat
                ? 'border-transparent'
                : 'bg-brain-800/40 border-brain-700/40 text-brain-500 hover:text-brain-300'"
              :style="filterStore.activeCategory === cat
                ? { backgroundColor: `${CATEGORY_COLORS[cat]}20`, borderColor: `${CATEGORY_COLORS[cat]}40`, color: CATEGORY_COLORS[cat] }
                : {}"
            >
              {{ CATEGORY_LABELS[cat] }}
            </button>
          </div>
        </div>

        <div class="w-px h-3 bg-brain-700/50 shrink-0" />

        <!-- Status -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-[10px] text-brain-600 uppercase tracking-widest font-semibold w-10 shrink-0">Status</span>
          <div class="flex items-center gap-1 flex-wrap">
            <button
              v-for="status in STATUSES"
              :key="status"
              @click="filterStore.setStatusFilter(status)"
              class="px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-150 border"
              :class="filterStore.activeStatus === status
                ? 'border-transparent'
                : 'bg-brain-800/40 border-brain-700/40 text-brain-500 hover:text-brain-300'"
              :style="filterStore.activeStatus === status
                ? { backgroundColor: `${STATUS_COLORS[status]}20`, borderColor: `${STATUS_COLORS[status]}40`, color: STATUS_COLORS[status] }
                : {}"
            >
              {{ STATUS_LABELS[status] }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-1 min-h-0 bg-brain-950">
      <!-- Main table -->
      <div class="flex-1 overflow-auto p-4 md:p-6 pb-0">
        <div class="bg-brain-900/40 border border-brain-700/40 rounded-t-2xl overflow-hidden h-full flex flex-col">
          <div class="flex-1 overflow-auto bg-brain-900/20">
            <!-- Mobile Card View -->
            <div class="md:hidden flex flex-col p-4 space-y-4">
              <template v-for="note in paginatedNotes" :key="'mob-' + note.id">
                <div class="bg-brain-800/20 border border-brain-700/40 rounded-xl p-4 flex flex-col gap-3 relative group focus-within:ring-2 focus-within:ring-entity-tgi/30 focus-within:border-entity-tgi/50 transition-all">
                  <div class="flex items-start justify-between gap-3">
                    <p class="text-sm font-semibold text-brain-100 group-hover:text-white transition-colors break-words whitespace-normal leading-relaxed flex-1">
                      {{ note.title || 'Untitled Note' }}
                    </p>
                    <NuxtLink
                      :to="`/notes/${note.id}`"
                      class="flex items-center justify-center px-3 py-1.5 rounded-lg bg-entity-tgi/10 text-entity-tgi border border-entity-tgi/30 hover:bg-entity-tgi hover:text-white transition-colors shrink-0 text-xs font-bold"
                    >
                      Read
                      <Icon name="lucide:arrow-right" class="w-3.5 h-3.5 ml-1" />
                    </NuxtLink>
                  </div>
                  
                  <div v-if="note.entities && note.entities.length" class="flex flex-wrap gap-1.5">
                    <EntityBadge v-for="entity in note.entities" :key="entity.id" :entity="entity" class="scale-90 origin-left" />
                  </div>

                  <div class="flex items-center flex-wrap gap-2">
                    <CategoryBadge :category="note.category" class="scale-90 origin-left -ml-1 border border-brain-700/50" />
                    <StatusBadge :status="note.status" class="scale-90 origin-left -ml-1 border border-brain-700/50" />
                  </div>
                  
                  <div class="flex items-center justify-between mt-1 pt-3 border-t border-brain-800/50">
                    <div class="flex items-center gap-1.5 text-[11px] font-medium text-brain-500 uppercase tracking-widest">
                      <Icon name="lucide:clock" class="w-3.5 h-3.5" />
                      {{ formatDate(note.updated_at) }}
                    </div>
                    <div class="flex items-center gap-2">
                      <template v-if="confirmDeleteId === note.id">
                        <span class="text-[10px] text-brain-400 whitespace-nowrap">Delete?</span>
                        <button @click.stop="handleDelete(note.id)" class="p-2 rounded-lg text-entity-enterbiner bg-entity-enterbiner/10 hover:text-white hover:bg-entity-enterbiner transition-colors" title="Confirm">
                          <Icon name="lucide:check" class="w-4 h-4" />
                        </button>
                        <button @click.stop="confirmDeleteId = null" class="p-2 rounded-lg text-brain-400 bg-brain-800/40 hover:text-white hover:bg-brain-700 transition-colors" title="Cancel">
                          <Icon name="lucide:x" class="w-4 h-4" />
                        </button>
                      </template>
                      <template v-else>
                        <button @click.stop="editingNote = note; showCapture = true" class="p-2 rounded-lg text-brain-400 bg-brain-800/40 hover:text-white hover:bg-brain-700 transition-colors" title="Edit">
                          <Icon name="lucide:pencil" class="w-4 h-4" />
                        </button>
                        <button @click.stop="confirmDeleteId = note.id" class="p-2 rounded-lg text-entity-enterbiner/60 bg-entity-enterbiner/10 hover:text-white hover:bg-entity-enterbiner transition-colors" title="Delete">
                          <Icon name="lucide:trash-2" class="w-4 h-4" />
                        </button>
                      </template>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- Desktop Table View -->
            <table class="hidden md:table w-full table-fixed min-w-[800px]">
              <colgroup>
            <col class="w-auto" />
            <col style="width: 170px" />
            <col style="width: 115px" />
            <col style="width: 130px" />
            <col style="width: 120px" />
            <col style="width: 72px" />
          </colgroup>
          <thead class="sticky top-0 z-10">
            <tr class="bg-brain-900/90 backdrop-blur-sm border-b border-brain-700/40">
              <th
                v-for="col in columns"
                :key="col.key"
                @click="col.sortable && toggleSort(col.key)"
                class="px-3 py-3 text-left text-xs font-semibold text-brain-400 uppercase tracking-wider whitespace-nowrap"
                :class="col.sortable ? 'cursor-pointer hover:text-brain-200 transition-colors select-none' : ''"
              >
                <div class="flex items-center gap-1">
                  {{ col.label }}
                  <Icon
                    v-if="col.sortable && sortKey === col.key"
                    :name="sortDir === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down'"
                    class="w-3 h-3 text-entity-tgi"
                  />
                  <Icon
                    v-else-if="col.sortable"
                    name="lucide:arrow-up-down"
                    class="w-3 h-3 opacity-20"
                  />
                </div>
              </th>
              <th class="px-3 py-3 text-right text-xs font-semibold text-brain-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brain-800/50">
            <template v-for="note in paginatedNotes" :key="note.id">
              <!-- Note row -->
              <tr
                class="group flex-col border-b border-brain-800/20 hover:bg-brain-800/20 transition-colors duration-150"
              >
                <!-- Title -->
                <td class="px-3 py-3 w-full min-w-[200px]">
                  <div class="flex items-start justify-between group/title pr-2 gap-4">
                    <p class="text-sm font-semibold text-brain-100 group-hover:text-white transition-colors break-words whitespace-normal leading-relaxed">
                      {{ note.title || 'Untitled Note' }}
                    </p>
                    <NuxtLink
                      :to="`/notes/${note.id}`"
                      class="flex items-center gap-1 mt-0.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-entity-tgi border border-entity-tgi/30 hover:border-entity-tgi hover:bg-entity-tgi hover:text-white transition-all opacity-100 md:opacity-0 group-hover/title:opacity-100 focus:opacity-100 shrink-0 whitespace-nowrap bg-entity-tgi/10 md:bg-transparent"
                    >
                      Read <span class="hidden xl:inline">Full Note</span>
                      <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
                    </NuxtLink>
                  </div>
                </td>

                <!-- Entities -->
                <td class="px-3 py-3">
                  <div class="flex flex-wrap gap-1">
                    <EntityBadge v-for="entity in note.entities" :key="entity.id" :entity="entity" />
                  </div>
                </td>

                <!-- Category -->
                <td class="px-3 py-3">
                  <CategoryBadge :category="note.category" />
                </td>

                <!-- Status -->
                <td class="px-3 py-3">
                  <StatusBadge :status="note.status" />
                </td>

                <!-- Dates -->
                <td class="px-3 py-3 text-xs w-32 tabular-nums">
                  <div class="flex flex-col gap-1 text-brain-400">
                    <div class="flex items-center gap-1.5" title="Updated">
                      <Icon name="lucide:clock" class="w-3" />
                      {{ formatDate(note.updated_at) }}
                    </div>
                    <div class="flex items-center gap-1.5 opacity-60" title="Created">
                      <Icon name="lucide:calendar" class="w-3" />
                      {{ formatDate(note.created_at) }}
                    </div>
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-3 py-3 text-right">
                  <div class="flex items-center justify-end gap-0.5 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <template v-if="confirmDeleteId === note.id">
                      <span class="text-[10px] text-brain-400 mr-1 whitespace-nowrap">Delete?</span>
                      <button
                        @click.stop="handleDelete(note.id)"
                        class="p-1.5 rounded-lg text-entity-enterbiner hover:text-white hover:bg-entity-enterbiner transition-colors cursor-pointer"
                        title="Confirm delete"
                      >
                        <Icon name="lucide:check" class="w-3.5 h-3.5" />
                      </button>
                      <button
                        @click.stop="confirmDeleteId = null"
                        class="p-1.5 rounded-lg text-brain-400 hover:text-brain-200 hover:bg-brain-700/50 transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <Icon name="lucide:x" class="w-3.5 h-3.5" />
                      </button>
                    </template>
                    <template v-else>
                      <button
                        @click.stop="editingNote = note; showCapture = true"
                        class="p-1.5 rounded-lg text-brain-400 hover:text-brain-200 hover:bg-brain-700/50 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Icon name="lucide:pencil" class="w-3.5 h-3.5" />
                      </button>
                      <button
                        @click.stop="confirmDeleteId = note.id"
                        class="p-1.5 rounded-lg text-entity-enterbiner/50 hover:text-entity-enterbiner hover:bg-entity-enterbiner/10 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
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
          <div v-if="filteredNotes.length === 0 && !notesStore.loading" class="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div class="w-16 h-16 rounded-2xl bg-brain-800/40 flex items-center justify-center mb-4">
              <Icon name="lucide:inbox" class="w-8 h-8 text-brain-600 opacity-60" />
            </div>
            <p class="text-brain-300 font-medium">No notes found</p>
            <p class="text-brain-600 text-sm mt-1">
              {{ filterStore.hasActiveFilters ? 'Try adjusting your filters' : 'Press ⌘K to capture your first idea' }}
            </p>
          </div>
          <div v-if="notesStore.loading" class="flex items-center justify-center py-24">
            <Icon name="lucide:loader-2" class="w-7 h-7 text-entity-tgi animate-spin" />
          </div>
        </div>
      </div>
    </div>

    <!-- Footer: summary + pagination -->
    <div class="flex flex-col xl:flex-row items-center justify-between px-4 md:px-6 py-3 border-t border-brain-700/40 bg-brain-950/60 shrink-0 gap-4 xl:gap-0">
      <!-- Summary stats -->
      <div class="flex flex-wrap items-center justify-center xl:justify-start gap-x-4 gap-y-2 text-xs text-brain-500 w-full xl:w-auto">
        <span>
          <span class="font-semibold text-brain-300">{{ filteredNotes.length }}</span> results
        </span>
        <span v-if="filterStore.hasActiveFilters" class="text-brain-600 hidden sm:inline">
          (filtered from {{ notesStore.notes.length }} total)
        </span>
        <span class="text-brain-700 hidden sm:inline">·</span>
        <div class="flex items-center gap-4">
          <span>
            <span class="font-semibold text-brain-300">{{ rawIdeaCount }}</span> raw
          </span>
          <span>
            <span class="font-semibold text-entity-sbs">{{ pipelineCount }}</span> active
          </span>
          <span>
            <span class="font-semibold text-brain-500">{{ shelvedCount }}</span> shelved
          </span>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex flex-wrap sm:flex-nowrap items-center justify-between w-full xl:w-auto gap-3 pt-3 xl:pt-0 border-t border-brain-800/50 xl:border-none">
        <div class="flex items-center justify-center w-full sm:w-auto gap-1.5 text-xs text-brain-500 order-2 sm:order-1">
          <span>Per page:</span>
          <select
            v-model="pageSize"
            class="bg-brain-800/60 border border-brain-700/40 rounded-lg px-2 py-1 text-brain-200 focus:outline-none focus:border-entity-sbs/50 cursor-pointer"
          >
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
        <div class="flex items-center justify-between w-full sm:w-auto gap-3 order-1 sm:order-2">
          <span class="text-xs text-brain-500 font-medium">{{ pageInfo }}</span>
          <div class="flex items-center gap-1">
            <button
              @click="currentPage = 1"
              :disabled="currentPage === 1"
              class="p-1.5 rounded-lg text-brain-400 hover:text-brain-200 hover:bg-brain-700/50 transition-colors disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
            >
              <Icon name="lucide:chevrons-left" class="w-4 h-4" />
            </button>
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="p-1.5 rounded-lg text-brain-400 hover:text-brain-200 hover:bg-brain-700/50 transition-colors disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
            >
              <Icon name="lucide:chevron-left" class="w-4 h-4" />
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage >= totalPages"
              class="p-1.5 rounded-lg text-brain-400 hover:text-brain-200 hover:bg-brain-700/50 transition-colors disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
            >
              <Icon name="lucide:chevron-right" class="w-4 h-4" />
            </button>
            <button
              @click="currentPage = totalPages"
              :disabled="currentPage >= totalPages"
              class="p-1.5 rounded-lg text-brain-400 hover:text-brain-200 hover:bg-brain-700/50 transition-colors disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
            >
              <Icon name="lucide:chevrons-right" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Capture modal (inline override for editing) -->
    <CaptureModal :edit-note="editingNote" @close="editingNote = null; showCapture = false" v-if="showCapture" />
  </div>
</template>

<script setup lang="ts">
import type { Note } from '~/types'
import {
  CATEGORIES, STATUSES,
  CATEGORY_COLORS, CATEGORY_LABELS,
  STATUS_COLORS, STATUS_LABELS,
} from '~/types'

useHead({ title: 'Notes — TGI BRAIN' })

const notesStore = useNotesStore()
const filterStore = useFilterStore()
const isSidebarOpen = useState('sidebarOpen')

const editingNote = ref<Note | null>(null)
const confirmDeleteId = ref<string | null>(null)
const showCapture = ref(false)
const showFiltersMobile = ref(false)
const localSearch = ref(filterStore.searchQuery)
const currentPage = ref(1)
const pageSize = ref(25)

const sortKey = ref<keyof Note>('created_at')
const sortDir = ref<'asc' | 'desc'>('desc')

const SORT_LABELS: Partial<Record<keyof Note, string>> = {
  created_at: 'Created Date',
  updated_at: 'Updated Date',
  title: 'Title',
  category: 'Category',
  status: 'Status',
}

const columns = [
  { key: 'title', label: 'Title', sortable: true, width: '' },
  { key: 'entities', label: 'Entities', sortable: false, width: '200px' },
  { key: 'category', label: 'Category', sortable: true, width: '130px' },
  { key: 'status', label: 'Status', sortable: true, width: '150px' },
  { key: 'updated_at', label: 'Dates', sortable: true, width: '140px' },
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
  return filteredNotes.value.length > 0 ? `${start}–${end} of ${filteredNotes.value.length}` : '0 results'
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
