<template>
  <div class="relative min-h-dvh bg-white flex flex-col">
    <!-- Top bar -->
    <header class="shrink-0 sticky top-0 z-30 bg-brain-50 border-b-2 border-brain-900 safe-top">
      <div class="flex items-center gap-3 px-4 md:px-6 py-3">
        <button
          @click="onCancel"
          class="brutal-btn flex items-center gap-2 px-3 md:px-4 py-2 bg-white border-2 border-brain-900 text-brain-900 shadow-[2px_2px_0px_#111] text-xs cursor-pointer"
          :title="dirty ? 'Discard changes' : 'Cancel'"
        >
          <Icon name="lucide:arrow-left" class="w-4 h-4" />
          <span class="hidden md:inline font-display font-bold uppercase">Cancel</span>
        </button>

        <!-- Center: title preview + dirty pill (desktop) -->
        <div class="hidden md:flex items-center gap-3 flex-1 min-w-0 px-4">
          <span class="truncate text-sm font-display font-bold uppercase tracking-tight text-brain-900">
            {{ form.title || 'Untitled' }}
          </span>
          <span
            class="shrink-0 text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border border-brain-900"
            :class="dirty ? 'bg-[#FFDD00] text-brain-900' : 'bg-brain-100 text-brain-500'"
          >
            {{ dirty ? 'Unsaved' : 'Clean' }}
          </span>
        </div>

        <div class="flex-1 md:hidden" />

        <!-- Right: properties toggle + commit -->
        <button
          @click="toggleProps"
          class="brutal-btn flex items-center justify-center p-2 bg-white border-2 border-brain-900 text-brain-900 shadow-[2px_2px_0px_#111] cursor-pointer"
          :class="{ 'bg-brain-900! text-white!': railOpen && !isMobile }"
          title="Properties"
        >
          <Icon name="lucide:sliders-horizontal" class="w-5 h-5" />
        </button>

        <button
          @click="handleSave"
          :disabled="isSaving"
          class="brutal-btn flex items-center gap-2 px-4 md:px-5 py-2 bg-brain-900 text-white text-xs font-display font-bold uppercase tracking-widest border-2 border-brain-900 shadow-[2px_2px_0px_#111] disabled:opacity-50 cursor-pointer"
        >
          <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <Icon v-else name="lucide:save" class="w-4 h-4" />
          <span class="hidden sm:inline">{{ isEdit ? 'Commit' : 'Generate' }}</span>
        </button>
      </div>

      <!-- Save error banner -->
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="saveError" class="flex items-center gap-3 px-5 py-2.5 bg-[#FF3366] border-t-2 border-brain-900">
          <Icon name="lucide:alert-triangle" class="w-4 h-4 text-white shrink-0" />
          <p class="text-[11px] font-mono font-bold text-white uppercase">{{ saveError }}</p>
          <button @click="saveError = null" class="ml-auto text-white">
            <Icon name="lucide:x-square" class="w-4 h-4" />
          </button>
        </div>
      </Transition>
    </header>

    <!-- Body: canvas + optional rail. No fixed viewport — the page itself scrolls,
         so the editor grows naturally with content (like a real document). -->
    <div class="flex-1 flex items-start">
      <!-- Canvas -->
      <div class="flex-1 min-w-0">
        <div class="max-w-3xl mx-auto w-full px-4 md:px-10 py-6 md:py-12">
          <input
            ref="titleInput"
            v-model="form.title"
            type="text"
            placeholder="Untitled"
            class="w-full text-xl md:text-5xl font-display font-bold bg-transparent text-brain-900 placeholder:text-brain-300 focus:outline-none tracking-tighter"
            :class="titleError ? 'text-[#FF3366]' : ''"
            @input="titleError = false"
          />
          <p v-if="titleError" class="text-[10px] font-mono font-bold text-[#FF3366] uppercase mt-2 flex items-center gap-1.5">
            <Icon name="lucide:alert-triangle" class="w-3.5 h-3.5" />
            Title is required
          </p>

          <div class="mt-6 md:mt-8 -mx-1 md:-mx-2">
            <ClientOnly>
              <MdEditor
                v-model="form.content"
                theme="light"
                :preview="false"
                :toolbars="toolbars"
                language="en-US"
                editor-id="note-editor"
                class="note-editor-auto bg-transparent! border-transparent! text-base md:text-lg leading-relaxed font-sans"
              />
              <template #fallback>
                <div class="border-2 border-brain-900 border-dashed py-12 flex items-center justify-center">
                  <span class="font-mono text-xs uppercase text-brain-500 font-bold">Mounting Markdown Engine...</span>
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>

      <!-- Right rail (desktop): sticky so it stays visible while canvas scrolls. -->
      <aside
        v-if="!isMobile && railOpen"
        class="hidden md:flex shrink-0 w-80 border-l-2 border-brain-900 bg-brain-50 self-stretch sticky top-[73px] overflow-y-auto"
        style="max-height: calc(100dvh - 73px);"
      >
        <NotePropertiesPanel
          v-model="propsForm"
          :entities="entities"
          :entity-error="entityError"
          @clear-entity-error="entityError = false"
          class="w-full"
        />
      </aside>
    </div>

    <!-- Bottom sheet (mobile) -->
    <BottomSheet v-model="sheetOpen" title="Properties">
      <NotePropertiesPanel
        v-model="propsForm"
        :entities="entities"
        :entity-error="entityError"
        @clear-entity-error="entityError = false"
      />
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'
import type { ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import type { Note, NoteCategory, NoteStatus } from '~/types'
import type { PropertiesForm } from './NotePropertiesPanel.vue'

const props = defineProps<{ note?: Note | null }>()

const router = useRouter()
const notesStore = useNotesStore()
const toast = useToast()

const isEdit = computed(() => !!props.note)
const entities = computed(() => notesStore.entities)

const toolbars = [
  'bold', 'italic', 'strikeThrough', '-',
  'title', 'unorderedList', 'orderedList', 'task', '-',
  'codeRow', 'code', 'link', 'table',
] as ToolbarNames[]

const titleInput = ref<HTMLInputElement>()
const isSaving = ref(false)
const saveError = ref<string | null>(null)
const titleError = ref(false)
const entityError = ref(false)
const sheetOpen = ref(false)
const railOpen = ref(true)

const isMobile = ref(false)
const updateBreakpoint = () => { isMobile.value = window.innerWidth < 768 }

const form = reactive({
  title: props.note?.title ?? '',
  content: props.note?.content ?? '',
})

const propsForm = ref<PropertiesForm>({
  category: (props.note?.category ?? 'strategic') as NoteCategory,
  status: (props.note?.status ?? 'raw_idea') as NoteStatus,
  entityIds: props.note?.entity_ids ? [...props.note.entity_ids] : [],
  source: props.note?.source ?? '',
})

// Initial snapshot for dirty tracking
const initial = JSON.stringify({ ...form, ...propsForm.value })
const dirty = computed(() => JSON.stringify({ ...form, ...propsForm.value }) !== initial)

const toggleProps = () => {
  if (isMobile.value) {
    sheetOpen.value = !sheetOpen.value
  } else {
    railOpen.value = !railOpen.value
    try { localStorage.setItem('tgibrain.editor.railOpen', String(railOpen.value)) } catch {}
  }
}

const handleSave = async () => {
  saveError.value = null
  titleError.value = false
  entityError.value = false

  if (!form.title.trim()) {
    titleError.value = true
    titleInput.value?.focus()
    return
  }
  if (propsForm.value.entityIds.length === 0) {
    entityError.value = true
    if (isMobile.value) sheetOpen.value = true
    return
  }

  isSaving.value = true
  try {
    if (props.note) {
      await notesStore.updateNote(
        props.note.id,
        {
          title: form.title,
          content: form.content,
          category: propsForm.value.category,
          status: propsForm.value.status,
          source: propsForm.value.source || null,
        },
        propsForm.value.entityIds,
      )
      toast.success('Record amended')
      await router.replace(`/notes/${props.note.id}`)
    } else {
      const created = await notesStore.createNote(
        form.title,
        form.content,
        propsForm.value.category,
        propsForm.value.status,
        propsForm.value.entityIds,
        propsForm.value.source || null,
      )
      toast.success('Record generated')
      const id = (created as Note | undefined)?.id
      await router.replace(id ? `/notes/${id}` : '/')
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Transaction failed. Subsystem error.'
    saveError.value = msg
    toast.error(msg)
  } finally {
    isSaving.value = false
  }
}

const onCancel = () => {
  if (dirty.value && !confirm('Discard unsaved changes?')) return
  if (window.history.length > 1) router.back()
  else router.push(props.note ? `/notes/${props.note.id}` : '/')
}

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'Enter')) {
    e.preventDefault()
    handleSave()
  } else if (e.key === 'Escape') {
    onCancel()
  }
}

const beforeUnload = (e: BeforeUnloadEvent) => {
  if (dirty.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  updateBreakpoint()
  window.addEventListener('resize', updateBreakpoint)
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('beforeunload', beforeUnload)
  try {
    const saved = localStorage.getItem('tgibrain.editor.railOpen')
    if (saved !== null) railOpen.value = saved === 'true'
  } catch {}
  nextTick(() => {
    if (!isEdit.value) titleInput.value?.focus()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateBreakpoint)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('beforeunload', beforeUnload)
})
</script>

<style>
#note-editor .cm-content { font-family: 'DM Sans', sans-serif !important; }
#note-editor .cm-activeLine { background-color: transparent !important; }

/* Natural "document" auto-height: let the editor grow with its content instead
   of being a fixed-height scroll box. The page scroll handles overflow.
   Sticky positioning requires every ancestor to have `overflow: visible`. */
#note-editor.md-editor,
.note-editor-auto {
  border: none !important;
  height: auto !important;
  min-height: 60dvh;
  overflow: visible !important;
}

#note-editor .md-editor-content,
#note-editor .md-editor-content-wrapper,
#note-editor .md-editor-input-wrapper,
#note-editor .md-editor-input,
#note-editor .md-editor-preview-wrapper {
  height: auto !important;
  min-height: 60dvh;
  overflow: visible !important;
}

#note-editor .cm-editor {
  height: auto !important;
  min-height: 60dvh;
}

#note-editor .cm-scroller {
  overflow: visible !important;
  height: auto !important;
}

/* Floating sticky toolbar, pinned beneath the page header (top bar ~57px tall).
   Opaque background + hard border + shadow so content visibly passes *behind* it. */
#note-editor .md-editor-toolbar-wrapper {
  position: sticky !important;
  top: calc(57px + env(safe-area-inset-top, 0px));
  z-index: 25;
  background: #FAF9F6 !important;
  border-bottom: 2px solid #111 !important;
  box-shadow: 0 2px 0 #111, 0 4px 8px -4px rgba(0, 0, 0, 0.15);
  margin: 0 !important;
}
</style>
