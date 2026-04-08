<template>
  <div class="brutal-card flex flex-col min-h-0 bg-white border-2 border-brain-900 rounded-none shadow-[4px_4px_0px_#111]">
    <!-- Table header -->
    <div class="flex items-center justify-between px-6 py-4 border-b-2 border-brain-900 bg-brain-50">
      <div class="flex items-center gap-3">
        <Icon name="lucide:database" class="w-5 h-5 text-brain-900" />
        <span class="text-sm font-display font-bold text-brain-900 uppercase tracking-widest">Active Registers</span>
        <span class="text-xs font-mono text-brain-500 bg-white border border-brain-900 px-1.5 py-0.5">Vol. {{ filteredNotes.length }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <!-- Category filter chips -->
        <button
          v-for="cat in CATEGORIES"
          :key="cat"
          @click="filterStore.setCategoryFilter(cat)"
          class="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-100 cursor-pointer border-2"
          :class="filterStore.activeCategory === cat
            ? 'border-brain-900 text-brain-50 shadow-[2px_2px_0px_#111] -translate-y-0.5'
            : 'border-brain-900 bg-white text-brain-900 hover:shadow-[2px_2px_0px_#111] hover:-translate-y-0.5'"
          :style="filterStore.activeCategory === cat
            ? { backgroundColor: CATEGORY_COLORS[cat] }
            : {}"
        >
          {{ CATEGORY_LABELS[cat] }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto bg-white">
      <table class="w-full min-w-[800px] table-fixed border-collapse">
        <colgroup>
          <col class="w-auto" />
          <col style="width: 200px" />
          <col style="width: 140px" />
          <col style="width: 140px" />
          <col style="width: 120px" />
        </colgroup>
        <thead class="sticky top-0 z-10 bg-brain-100 border-b-2 border-brain-900">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              @click="col.sortable && toggleSort(col.key)"
              class="px-5 py-3 text-left text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest border-r-2 border-brain-900 last:border-r-0 whitespace-nowrap"
              :class="col.sortable ? 'cursor-pointer hover:bg-brain-200 transition-colors select-none' : ''"
            >
              <div class="flex items-center gap-2">
                {{ col.label }}
                <template v-if="col.sortable && sortKey === col.key">
                  <span class="text-[10px] font-bold">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                </template>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="note in paginatedNotes"
            :key="note.id"
            @click="toggleExpand(note.id)"
            class="group hover:bg-brain-50 transition-colors duration-100 cursor-pointer border-b border-brain-300"
          >
            <!-- Title -->
            <td class="px-5 py-4 border-r-2 border-brain-900 lg:border-r border-brain-300 align-top">
              <div class="flex items-start gap-3">
                <Icon
                  :name="expandedId === note.id ? 'lucide:minus-square' : 'lucide:plus-square'"
                  class="w-4 h-4 text-brain-900 mt-0.5 shrink-0"
                />
                <div class="min-w-0">
                  <p class="text-sm font-display font-bold text-brain-900 uppercase tracking-tight truncate max-w-md">
                    {{ note.title }}
                  </p>
                  <p class="text-xs font-mono text-brain-500 mt-1 truncate max-w-md">
                    {{ getPreview(note.content) }}
                  </p>
                </div>
              </div>
            </td>

            <!-- Entities -->
            <td class="px-5 py-4 border-r border-brain-300 align-top">
              <div class="flex flex-wrap gap-1">
                <EntityBadge
                  v-for="entity in note.entities"
                  :key="entity.id"
                  :entity="entity"
                />
              </div>
            </td>

            <!-- Category -->
            <td class="px-5 py-4 border-r border-brain-300 align-top">
              <CategoryBadge :category="note.category" />
            </td>

            <!-- Status -->
            <td class="px-5 py-4 border-r border-brain-300 align-top">
              <StatusBadge :status="note.status" />
            </td>

            <!-- Created -->
            <td class="px-5 py-4 align-top text-xs font-mono font-bold text-brain-700 whitespace-nowrap">
              {{ formatDate(note.created_at) }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Expanded note content -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-[500px]"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 max-h-[500px]"
        leave-to-class="opacity-0 max-h-0"
      >
        <div
          v-if="expandedNote"
          class="px-12 py-6 bg-brain-50 border-b-2 border-brain-900 overflow-hidden"
        >
          <div class="prose prose-sm max-w-none text-brain-900 font-sans">
            <ClientOnly>
              <MdPreview
                :model-value="expandedNote.content"
                :theme="'light'"
                :editor-id="'preview-' + expandedNote.id"
                class="!bg-transparent"
              />
              <template #fallback>
                <p class="text-brain-500 font-mono">Loading data segment...</p>
              </template>
            </ClientOnly>
          </div>
          <div class="flex items-center gap-4 mt-6 pt-4 border-t-2 border-brain-900">
            <button
              @click.stop="emit('editNote', expandedNote!)"
              class="brutal-btn flex items-center gap-2 px-4 py-2 text-xs bg-white text-brain-900 cursor-pointer"
            >
              <Icon name="lucide:edit-3" class="w-3.5 h-3.5" />
              Modify Record
            </button>
            <button
              @click.stop="handleDelete(expandedNote!.id)"
              class="brutal-btn flex items-center gap-2 px-4 py-2 text-xs bg-[#FF3366] text-white cursor-pointer"
            >
              <Icon name="lucide:x-square" class="w-3.5 h-3.5" />
              Expunge
            </button>
          </div>
        </div>
      </Transition>

      <!-- Empty state -->
      <div
        v-if="filteredNotes.length === 0 && !notesStore.loading"
        class="flex flex-col items-center justify-center py-24 text-brain-900 bg-white"
      >
        <div class="w-20 h-20 border-2 border-brain-900 bg-brain-100 flex items-center justify-center mb-6 shadow-[4px_4px_0px_#111]">
          <Icon name="lucide:file-search" class="w-10 h-10" />
        </div>
        <p class="text-xl font-display font-bold uppercase">No records found</p>
        <p class="text-sm font-mono text-brain-500 mt-2">
          {{ filterStore.hasActiveFilters ? 'Clear active index filters' : 'Press ⌘K to initialize new record' }}
        </p>
      </div>

      <!-- Loading state -->
      <div
        v-if="notesStore.loading"
        class="flex items-center justify-center py-24"
      >
        <div class="w-10 h-10 border-4 border-brain-200 border-t-brain-900 rounded-full animate-spin"></div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between px-6 py-4 border-t-2 border-brain-900 bg-brain-50"
    >
      <span class="text-xs font-mono font-bold text-brain-500 uppercase">
        Page {{ String(currentPage).padStart(2, '0') }} / {{ String(totalPages).padStart(2, '0') }}
      </span>
      <div class="flex items-center gap-2">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="brutal-btn p-2 bg-white text-brain-900 disabled:opacity-50 disabled:shadow-none cursor-pointer"
        >
          <Icon name="lucide:chevron-left" class="w-4 h-4" />
        </button>
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="brutal-btn p-2 bg-white text-brain-900 disabled:opacity-50 disabled:shadow-none cursor-pointer"
        >
          <Icon name="lucide:chevron-right" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_LABELS } from '~/types'
import type { Note } from '~/types'

const emit = defineEmits(['editNote'])

const notesStore = useNotesStore()
const filterStore = useFilterStore()

const sortKey = ref('created_at')
const sortDir = ref<'asc' | 'desc'>('desc')
const expandedId = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = 25

const columns = [
  { key: 'title', label: 'Index Title', sortable: true },
  { key: 'entities', label: 'Entities', sortable: false },
  { key: 'category', label: 'Sector', sortable: true },
  { key: 'status', label: 'State', sortable: true },
  { key: 'created_at', label: 'Timestamp', sortable: true },
]

const filteredNotes = computed(() => {
  let result = [...notesStore.filteredNotes]

  // Sort
  result.sort((a, b) => {
    const key = sortKey.value as keyof Note
    const aVal = a[key] ?? ''
    const bVal = b[key] ?? ''
    const cmp = String(aVal).localeCompare(String(bVal))
    return sortDir.value === 'asc' ? cmp : -cmp
  })

  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredNotes.value.length / pageSize)))

const paginatedNotes = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredNotes.value.slice(start, start + pageSize)
})

const expandedNote = computed(() =>
  expandedId.value ? filteredNotes.value.find(n => n.id === expandedId.value) : null
)

// Reset page when filters change
watch(() => filterStore.activeEntityId, () => { currentPage.value = 1 })
watch(() => filterStore.activeCategory, () => { currentPage.value = 1 })
watch(() => filterStore.searchQuery, () => { currentPage.value = 1 })

const toggleSort = (key: string) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
}

const toggleExpand = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id
}

const getPreview = (content: string) => {
  const clean = content.replace(/[#*`\[\]()]/g, '').trim()
  return clean.length > 80 ? clean.substring(0, 80) + '...' : clean
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this root record?')) return
  try {
    await notesStore.deleteNote(id)
    expandedId.value = null
  } catch (err) {
    console.error('Delete failed:', err)
  }
}
</script>
