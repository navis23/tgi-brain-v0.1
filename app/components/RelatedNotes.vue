<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <p class="text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest bg-brain-100 px-2 py-1 inline-block border border-brain-900">
        Linked Records
      </p>
      <button
        v-if="!showAddForm"
        @click="showAddForm = true"
        class="brutal-btn flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase bg-white text-brain-900 border-2 border-brain-900 shadow-[2px_2px_0px_#111] cursor-pointer hover:-translate-y-0.5 transition-transform"
      >
        <Icon name="lucide:link" class="w-3.5 h-3.5" />
        Link Record
      </button>
    </div>

    <!-- Existing relations grouped by type -->
    <div v-if="groupedRelations.length > 0" class="space-y-3">
      <div v-for="group in groupedRelations" :key="group.label" class="space-y-1.5">
        <p class="text-[9px] font-mono font-bold text-brain-500 uppercase tracking-widest">{{ group.label }}</p>
        <div class="space-y-1">
          <div
            v-for="rel in group.items"
            :key="rel.relation.id"
            class="flex items-center gap-3 px-3 py-2.5 border-2 border-brain-900 bg-white group hover:shadow-[2px_2px_0px_#111] transition-all"
          >
            <NuxtLink
              :to="`/notes/${rel.linkedNote.id}`"
              class="flex-1 min-w-0 flex items-center gap-3"
            >
              <Icon name="lucide:file-text" class="w-4 h-4 text-brain-400 shrink-0" />
              <span class="text-xs font-display font-bold text-brain-900 uppercase tracking-tight truncate">
                {{ rel.linkedNote.title }}
              </span>
              <div class="flex items-center gap-1.5 shrink-0">
                <span
                  v-for="entity in (rel.linkedNote.entities || []).slice(0, 3)"
                  :key="entity.id"
                  class="w-2 h-2 border border-brain-900"
                  :style="{ backgroundColor: entity.color }"
                />
              </div>
            </NuxtLink>
            <button
              @click="handleDeleteRelation(rel.relation.id)"
              class="shrink-0 p-1 text-brain-300 hover:text-[#FF3366] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              title="Remove link"
            >
              <Icon name="lucide:x" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <p v-else-if="!loadingRelations && !showAddForm" class="text-xs font-mono text-brain-400 uppercase">
      No linked records yet.
    </p>

    <!-- Loading -->
    <div v-if="loadingRelations" class="flex items-center gap-2 py-2">
      <Icon name="lucide:loader-2" class="w-4 h-4 animate-spin text-brain-400" />
      <span class="text-xs font-mono text-brain-400 uppercase">Loading relations...</span>
    </div>

    <!-- Add relation form -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showAddForm" class="border-2 border-brain-900 bg-brain-50 p-4 space-y-3 shadow-[2px_2px_0px_#111]">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest">New Link</p>
          <button @click="closeAddForm" class="text-brain-400 hover:text-brain-900 cursor-pointer">
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>

        <!-- Relation type -->
        <select
          v-model="newRelationType"
          class="w-full px-3 py-2 bg-white border-2 border-brain-900 text-xs font-mono font-bold text-brain-900 focus:outline-none uppercase shadow-[1px_1px_0px_#111] cursor-pointer"
        >
          <option v-for="rt in RELATION_TYPES" :key="rt" :value="rt">
            This record {{ RELATION_TYPE_LABELS[rt].toLowerCase() }}...
          </option>
        </select>

        <!-- Note search -->
        <div class="relative">
          <div class="flex items-center border-2 border-brain-900 bg-white shadow-[1px_1px_0px_#111]">
            <Icon name="lucide:search" class="w-4 h-4 text-brain-400 ml-3 shrink-0" />
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="SEARCH RECORDS BY TITLE..."
              class="flex-1 px-3 py-2 bg-transparent text-xs font-mono font-bold text-brain-900 placeholder:text-brain-300 focus:outline-none uppercase"
              @focus="showResults = true"
            />
          </div>

          <!-- Search results dropdown -->
          <div
            v-if="showResults && filteredCandidates.length > 0"
            class="absolute top-full left-0 right-0 z-10 mt-1 border-2 border-brain-900 bg-white shadow-[4px_4px_0px_#111] max-h-48 overflow-y-auto"
          >
            <button
              v-for="candidate in filteredCandidates"
              :key="candidate.id"
              @click="selectNote(candidate)"
              class="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-brain-100 transition-colors cursor-pointer border-b border-brain-200 last:border-b-0"
            >
              <Icon name="lucide:file-text" class="w-4 h-4 text-brain-400 shrink-0" />
              <span class="text-xs font-mono font-bold text-brain-900 uppercase truncate flex-1">{{ candidate.title }}</span>
              <div class="flex items-center gap-1 shrink-0">
                <span
                  v-for="entity in (candidate.entities || []).slice(0, 3)"
                  :key="entity.id"
                  class="w-2 h-2 border border-brain-900"
                  :style="{ backgroundColor: entity.color }"
                />
              </div>
            </button>
          </div>
        </div>

        <!-- Selected note preview -->
        <div v-if="selectedNote" class="flex items-center gap-3 px-3 py-2 border-2 border-brain-900 bg-white">
          <Icon name="lucide:check-square" class="w-4 h-4 text-[#10b981] shrink-0" />
          <span class="text-xs font-mono font-bold text-brain-900 uppercase truncate flex-1">{{ selectedNote.title }}</span>
          <button @click="selectedNote = null" class="text-brain-400 hover:text-brain-900 cursor-pointer">
            <Icon name="lucide:x" class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Error -->
        <p v-if="addError" class="text-[10px] font-mono font-bold text-[#FF3366] uppercase flex items-center gap-1.5">
          <Icon name="lucide:alert-triangle" class="w-3.5 h-3.5" />
          {{ addError }}
        </p>

        <!-- Submit -->
        <button
          @click="handleAddRelation"
          :disabled="!selectedNote || isSaving"
          class="brutal-btn w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brain-900 text-white text-[10px] font-mono font-bold uppercase disabled:opacity-40 cursor-pointer"
        >
          <Icon v-if="isSaving" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
          <Icon v-else name="lucide:link" class="w-3.5 h-3.5" />
          Create Link
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { RELATION_TYPES, RELATION_TYPE_LABELS, RELATION_TYPE_REVERSE_LABELS } from '~/types'
import type { Note, NoteRelation, NoteRelationType } from '~/types'

const props = defineProps<{ noteId: string }>()

const notesStore = useNotesStore()
const toast = useToast()

const relations = ref<NoteRelation[]>([])
const loadingRelations = ref(true)
const showAddForm = ref(false)
const searchQuery = ref('')
const showResults = ref(false)
const selectedNote = ref<Note | null>(null)
const newRelationType = ref<NoteRelationType>('followup_of')
const isSaving = ref(false)
const addError = ref<string | null>(null)
const searchInput = ref<HTMLInputElement>()

// Fetch relations on mount
const loadRelations = async () => {
  loadingRelations.value = true
  try {
    relations.value = await notesStore.fetchRelationsForNote(props.noteId)
  } catch (err: unknown) {
    console.error('Failed to load relations:', err)
  } finally {
    loadingRelations.value = false
  }
}

// Group relations for display
const groupedRelations = computed(() => {
  const groups: { label: string; items: { relation: NoteRelation; linkedNote: Note }[] }[] = []
  const outgoing: Record<string, { relation: NoteRelation; linkedNote: Note }[]> = {}
  const incoming: Record<string, { relation: NoteRelation; linkedNote: Note }[]> = {}

  for (const rel of relations.value) {
    if (rel.from_note_id === props.noteId) {
      // Outgoing: this note → other
      const linked = notesStore.notes.find(n => n.id === rel.to_note_id)
      if (!linked) continue
      const label = RELATION_TYPE_LABELS[rel.relation_type]
      if (!outgoing[label]) outgoing[label] = []
      outgoing[label].push({ relation: rel, linkedNote: linked })
    } else {
      // Incoming: other → this note
      const linked = notesStore.notes.find(n => n.id === rel.from_note_id)
      if (!linked) continue
      const label = RELATION_TYPE_REVERSE_LABELS[rel.relation_type]
      if (!incoming[label]) incoming[label] = []
      incoming[label].push({ relation: rel, linkedNote: linked })
    }
  }

  for (const [label, items] of Object.entries(outgoing)) {
    groups.push({ label, items })
  }
  for (const [label, items] of Object.entries(incoming)) {
    groups.push({ label, items })
  }

  return groups
})

// Filter candidates for the note picker (exclude self and already-linked notes)
const filteredCandidates = computed(() => {
  const alreadyLinked = new Set(
    relations.value.map(r => r.from_note_id === props.noteId ? r.to_note_id : r.from_note_id)
  )
  const q = searchQuery.value.toLowerCase()
  return notesStore.notes
    .filter(n => n.id !== props.noteId && !alreadyLinked.has(n.id))
    .filter(n => !q || n.title.toLowerCase().includes(q))
    .slice(0, 8)
})

const selectNote = (note: Note) => {
  selectedNote.value = note
  searchQuery.value = ''
  showResults.value = false
}

const closeAddForm = () => {
  showAddForm.value = false
  selectedNote.value = null
  searchQuery.value = ''
  addError.value = null
}

const handleAddRelation = async () => {
  if (!selectedNote.value) return
  isSaving.value = true
  addError.value = null
  try {
    await notesStore.createRelation(props.noteId, selectedNote.value.id, newRelationType.value)
    toast.success('Record linked')
    await loadRelations()
    closeAddForm()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create link'
    addError.value = msg
    toast.error(msg)
  } finally {
    isSaving.value = false
  }
}

const handleDeleteRelation = async (relationId: string) => {
  try {
    await notesStore.deleteRelation(relationId)
    toast.success('Link removed')
    relations.value = relations.value.filter(r => r.id !== relationId)
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Failed to remove link')
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  if (searchInput.value && !searchInput.value.closest('.relative')?.contains(e.target as Node)) {
    showResults.value = false
  }
}

onMounted(() => {
  loadRelations()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
