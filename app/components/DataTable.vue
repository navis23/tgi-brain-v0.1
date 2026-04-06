<template>
  <div class="bg-brain-900/30 border border-brain-700/30 rounded-2xl overflow-hidden flex flex-col min-h-0">
    <!-- Table header -->
    <div class="flex items-center justify-between px-5 py-3 border-b border-brain-700/30">
      <div class="flex items-center gap-2">
        <Icon name="lucide:table-2" class="w-4 h-4 text-entity-sbs" />
        <span class="text-xs font-semibold text-brain-300">Data Table</span>
        <span class="text-xs text-brain-500 tabular-nums">({{ filteredNotes.length }})</span>
      </div>
      <div class="flex items-center gap-2">
        <!-- Category filter chips -->
        <button
          v-for="cat in CATEGORIES"
          :key="cat"
          @click="filterStore.setCategoryFilter(cat)"
          class="px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer border"
          :class="filterStore.activeCategory === cat
            ? 'border-transparent'
            : 'bg-brain-800/40 border-brain-700/50 text-brain-500 hover:text-brain-300'"
          :style="filterStore.activeCategory === cat
            ? { backgroundColor: `${CATEGORY_COLORS[cat]}20`, borderColor: `${CATEGORY_COLORS[cat]}40`, color: CATEGORY_COLORS[cat] }
            : {}"
        >
          {{ CATEGORY_LABELS[cat] }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto bg-brain-900/10">
      <table class="w-full min-w-[800px] table-fixed">
        <colgroup>
          <col class="w-auto" />
          <col style="width: 200px" />
          <col style="width: 130px" />
          <col style="width: 140px" />
          <col style="width: 110px" />
        </colgroup>
        <thead class="sticky top-0 z-10">
          <tr class="bg-brain-800/60 backdrop-blur-sm">
            <th
              v-for="col in columns"
              :key="col.key"
              @click="col.sortable && toggleSort(col.key)"
              class="px-4 py-3 text-left text-[11px] font-semibold text-brain-400 uppercase tracking-wider whitespace-nowrap"
              :class="col.sortable ? 'cursor-pointer hover:text-brain-200 transition-colors select-none' : ''"
            >
              <div class="flex items-center gap-1.5">
                {{ col.label }}
                <template v-if="col.sortable && sortKey === col.key">
                  <Icon
                    :name="sortDir === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down'"
                    class="w-3 h-3 text-entity-tgi"
                  />
                </template>
              </div>
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-brain-800/50">
          <tr
            v-for="note in paginatedNotes"
            :key="note.id"
            @click="toggleExpand(note.id)"
            class="group hover:bg-brain-800/30 transition-colors duration-150 cursor-pointer"
          >
            <!-- Title -->
            <td class="px-4 py-3.5">
              <div class="flex items-start gap-2.5">
                <Icon
                  :name="expandedId === note.id ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                  class="w-4 h-4 text-brain-500 mt-0.5 shrink-0 transition-transform duration-200"
                />
                <div class="min-w-0">
                  <p class="text-sm font-medium text-brain-100 group-hover:text-brain-50 transition-colors truncate max-w-md">
                    {{ note.title }}
                  </p>
                  <p class="text-xs text-brain-500 mt-0.5 truncate max-w-md">
                    {{ getPreview(note.content) }}
                  </p>
                </div>
              </div>
            </td>

            <!-- Entities -->
            <td class="px-4 py-3.5">
              <div class="flex flex-wrap gap-1">
                <EntityBadge
                  v-for="entity in note.entities"
                  :key="entity.id"
                  :entity="entity"
                />
              </div>
            </td>

            <!-- Category -->
            <td class="px-4 py-3.5">
              <CategoryBadge :category="note.category" />
            </td>

            <!-- Status -->
            <td class="px-4 py-3.5">
              <StatusBadge :status="note.status" />
            </td>

            <!-- Created -->
            <td class="px-4 py-3.5 text-xs text-brain-400 whitespace-nowrap tabular-nums">
              {{ formatDate(note.created_at) }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Expanded note content -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-96"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 max-h-96"
        leave-to-class="opacity-0 max-h-0"
      >
        <div
          v-if="expandedNote"
          class="px-12 py-4 bg-brain-800/20 border-t border-brain-700/30"
        >
          <div class="prose prose-invert prose-sm max-w-none text-brain-200">
            <ClientOnly>
              <MdPreview
                :model-value="expandedNote.content"
                :theme="'dark'"
                :editor-id="'preview-' + expandedNote.id"
                class="!bg-transparent"
              />
              <template #fallback>
                <p class="text-brain-400">Loading preview...</p>
              </template>
            </ClientOnly>
          </div>
          <div class="flex items-center gap-3 mt-4 pt-3 border-t border-brain-700/30">
            <button
              @click.stop="emit('editNote', expandedNote!)"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brain-300 hover:text-brain-100 hover:bg-brain-700/50 transition-colors cursor-pointer"
            >
              <Icon name="lucide:pencil" class="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              @click.stop="handleDelete(expandedNote!.id)"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-entity-enterbiner/70 hover:text-entity-enterbiner hover:bg-entity-enterbiner/10 transition-colors cursor-pointer"
            >
              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </Transition>

      <!-- Empty state -->
      <div
        v-if="filteredNotes.length === 0 && !notesStore.loading"
        class="flex flex-col items-center justify-center py-16 text-brain-400"
      >
        <div class="w-16 h-16 rounded-2xl bg-brain-800/40 flex items-center justify-center mb-4">
          <Icon name="lucide:inbox" class="w-8 h-8 opacity-40" />
        </div>
        <p class="text-sm font-medium">No notes found</p>
        <p class="text-xs text-brain-500 mt-1">
          {{ filterStore.hasActiveFilters ? 'Try adjusting your filters' : 'Press ⌘K to capture your first idea' }}
        </p>
      </div>

      <!-- Loading state -->
      <div
        v-if="notesStore.loading"
        class="flex items-center justify-center py-16"
      >
        <Icon name="lucide:loader-2" class="w-6 h-6 text-entity-tgi animate-spin" />
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between px-5 py-3 border-t border-brain-700/30"
    >
      <span class="text-xs text-brain-500">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <div class="flex items-center gap-1">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="p-1.5 rounded-lg text-brain-400 hover:text-brain-200 hover:bg-brain-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <Icon name="lucide:chevron-left" class="w-4 h-4" />
        </button>
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="p-1.5 rounded-lg text-brain-400 hover:text-brain-200 hover:bg-brain-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
  { key: 'title', label: 'Title', sortable: true },
  { key: 'entities', label: 'Entities', sortable: false },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'created_at', label: 'Created', sortable: true },
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
  if (!confirm('Are you sure you want to delete this note?')) return
  try {
    await notesStore.deleteNote(id)
    expandedId.value = null
  } catch (err) {
    console.error('Delete failed:', err)
  }
}
</script>
