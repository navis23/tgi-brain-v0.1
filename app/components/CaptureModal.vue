<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 z-[100]"
        @click="close"
      />
    </Transition>

    <!-- Modal -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-8 scale-[0.98]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-8 scale-[0.98]"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 md:inset-auto md:top-[5vh] md:left-1/2 md:-translate-x-1/2 md:w-11/12 md:max-w-6xl h-dvh md:h-[90vh] bg-white border-2 border-brain-900 shadow-[8px_8px_0px_#111] z-[101] flex flex-col overflow-hidden brutal-card! transform-none!"
      >
        
        <!-- MOBILE HEADER -->
        <div class="md:hidden flex items-center justify-between px-4 py-4 border-b-2 border-brain-900 bg-brain-100 shrink-0">
          <button @click="close" class="text-xs font-mono font-bold text-brain-900 px-2 py-1 uppercase border border-brain-900 bg-white shadow-[2px_2px_0px_#111]">
            Cancel
          </button>
          <span class="text-sm font-display font-bold text-brain-900 uppercase tracking-widest">
            {{ editNote ? 'Amend' : 'Input' }}
          </span>
          <button 
            @click="handleSave" 
            :disabled="isSaving"
            class="text-xs font-mono font-bold text-white bg-brain-900 px-3 py-1 uppercase border border-brain-900 shadow-[2px_2px_0px_#111] disabled:opacity-50 flex items-center gap-1"
          >
            <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <span v-else>Commit</span>
          </button>
        </div>

        <!-- Save Error Banner -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="saveError" class="shrink-0 flex items-center gap-3 px-6 py-3 bg-[#FF3366] border-b-2 border-brain-900">
            <Icon name="lucide:alert-triangle" class="w-5 h-5 text-white shrink-0" />
            <p class="text-xs font-mono font-bold text-white uppercase">{{ saveError }}</p>
            <button @click="saveError = null" class="ml-auto text-white hover:text-brain-900">
              <Icon name="lucide:x-square" class="w-5 h-5" />
            </button>
          </div>
        </Transition>

        <!-- MAIN LAYOUT -->
        <div class="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          <!-- Left Side: Uncompromised Writing Canvas -->
          <div class="flex-1 flex flex-col min-w-0 bg-white relative overflow-y-auto">
            
            <!-- Top Header inside canvas (Desktop ONLY) -->
            <div class="hidden md:flex items-center justify-between px-8 py-5 border-b-2 border-brain-900 bg-brain-50 shrink-0">
              <div class="flex flex-col">
                <span class="text-xs font-mono font-bold text-brain-900 uppercase tracking-widest px-2 py-1 border border-brain-900 bg-white shadow-[1px_1px_0px_#111]">
                  {{ editNote ? 'Amdendation Interface' : 'Input Interface' }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <kbd class="inline-flex items-center px-2 py-1 text-[10px] font-mono font-bold uppercase text-brain-900 border-2 border-brain-900 bg-white shadow-[1px_1px_0px_#111]">
                  ⌘K
                </kbd>
                <button
                  @click="close"
                  class="flex p-1.5 border-2 border-brain-900 bg-white text-brain-900 hover:bg-brain-900 hover:text-white shadow-[1px_1px_0px_#111] transition-all cursor-pointer"
                  title="Close Terminal"
                >
                  <Icon name="lucide:x" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Document Canvas -->
            <div class="flex-1 flex flex-col min-h-0 px-6 md:px-12 py-6 md:py-10 space-y-6 md:space-y-8 bg-white">
              <!-- Title Input -->
              <input
                ref="titleInput"
                v-model="form.title"
                type="text"
                placeholder="RECORD TITLE DIRECTIVE"
                class="w-full text-3xl md:text-5xl font-display font-bold bg-transparent text-brain-900 placeholder:text-brain-300 focus:outline-none uppercase tracking-tighter shrink-0 border-b-2 pb-2 border-dashed"
                :class="titleError ? 'border-[#FF3366]' : 'border-brain-900'"
                @input="titleError = false"
              />
              <p v-if="titleError" class="text-[10px] font-mono font-bold text-[#FF3366] uppercase mt-1 flex items-center gap-1.5">
                <Icon name="lucide:alert-triangle" class="w-3.5 h-3.5" />
                Title is required
              </p>
              
              <!-- Editor -->
              <div class="flex-1 -mx-2 md:-mx-8">
                <ClientOnly>
                  <MdEditor
                    v-model="form.content"
                    theme="light"
                    :preview="false"
                    :toolbars="toolbars"
                    language="en-US"
                    editor-id="capture-editor"
                    class="bg-transparent! border-transparent! h-full min-h-[300px] md:min-h-[400px] text-lg leading-relaxed focus-within:bg-transparent font-sans"
                  />
                  <template #fallback>
                    <div class="h-full border-2 border-brain-900 border-dashed m-4 md:m-8 flex items-center justify-center">
                       <span class="font-mono text-xs uppercase text-brain-500 font-bold">Mounting Markdown Engine...</span>
                    </div>
                  </template>
                </ClientOnly>
              </div>
            </div>
          </div>

          <!-- Right Side: Inspector Sidebar (Properties) - Hidden on mobile by default -->
          <div 
             :class="[
               showMobileProps ? 'fixed inset-0 z-60 bg-white flex' : 'hidden',
               'md:flex md:static md:w-80 md:bg-brain-100 md:z-auto shrink-0 border-t-2 md:border-t-0 md:border-l-2 border-brain-900 flex-col overflow-y-auto'
             ]"
          >
            
            <!-- Mobile overlay header -->
            <div v-if="showMobileProps" class="md:hidden flex items-center justify-between px-6 py-5 border-b-2 border-brain-900 bg-white shrink-0">
               <span class="text-base font-display font-bold uppercase text-brain-900">Record Parameters</span>
               <button @click="showMobileProps = false" class="brutal-btn px-4 py-2 bg-brain-900 text-white text-[10px] font-mono cursor-pointer uppercase">Lock</button>
            </div>
            
            <div class="flex-1 px-6 py-6 md:py-8 space-y-8 bg-brain-50">
              <!-- Entities -->
              <div>
                <label class="flex items-center gap-2 text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest mb-3 bg-white border border-brain-900 box-content px-2 py-1 w-fit shadow-[1px_1px_0px_#111]">
                  Cross-References
                  <span class="text-[#FF3366]">*</span>
                </label>
                <div class="flex flex-col gap-2">
                  <button
                    v-for="entity in entities"
                    :key="entity.id"
                    @click="toggleEntity(entity.id)"
                    class="flex items-center justify-between px-3 py-2 text-xs font-mono font-bold transition-all duration-100 cursor-pointer text-left border-2 uppercase"
                    :class="form.entityIds.includes(entity.id)
                      ? 'border-brain-900 bg-brain-900 text-white shadow-[2px_2px_0px_#111] translate-x-1'
                      : 'border-brain-900 bg-white text-brain-900 hover:shadow-[2px_2px_0px_#111] hover:-translate-y-0.5 hover:translate-x-0.5'"
                  >
                    <div class="flex items-center gap-3">
                      <span
                        class="w-3 h-3 border border-brain-900 shrink-0"
                        :style="{ backgroundColor: entity.color }"
                      />
                      <span>{{ entity.name }}</span>
                    </div>
                    <Icon v-if="form.entityIds.includes(entity.id)" name="lucide:check-square" class="w-4 h-4 text-white" />
                  </button>
                </div>
                <p v-if="entityError" class="text-[10px] font-mono font-bold text-[#FF3366] uppercase mt-3 flex items-center gap-1.5 border border-[#FF3366] px-2 py-1 bg-white">
                  <Icon name="lucide:alert-triangle" class="w-3.5 h-3.5" />
                  Link >= 1 Entity needed
                </p>
              </div>

              <hr class="border-brain-900 border-t-2 border-dashed" />

              <!-- Category -->
              <div>
                <label class="flex items-center gap-2 text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest mb-3 bg-white border border-brain-900 w-fit px-2 py-1 shadow-[1px_1px_0px_#111]">
                  Sector Assignment
                </label>
                <select
                  v-model="form.category"
                  class="w-full px-4 py-3 bg-white border-2 border-brain-900 text-sm font-mono font-bold text-brain-900 focus:outline-none focus:bg-brain-100 transition-colors cursor-pointer uppercase shadow-[2px_2px_0px_#111]"
                >
                  <option v-for="cat in CATEGORIES" :key="cat" :value="cat">
                    {{ CATEGORY_LABELS[cat] }}
                  </option>
                </select>
              </div>

              <!-- Status -->
              <div>
                <label class="flex items-center gap-2 text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest mb-3 bg-white border border-brain-900 w-fit px-2 py-1 shadow-[1px_1px_0px_#111]">
                  Pipeline State
                </label>
                <select
                  v-model="form.status"
                  class="w-full px-4 py-3 bg-white border-2 border-brain-900 text-sm font-mono font-bold text-brain-900 focus:outline-none focus:bg-brain-100 transition-colors cursor-pointer uppercase shadow-[2px_2px_0px_#111]"
                >
                  <option v-for="s in STATUSES" :key="s" :value="s">
                    {{ STATUS_LABELS[s] }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Actions Footer (Desktop ONLY sticks to bottom of right col) -->
            <div class="hidden md:flex flex-col gap-4 px-6 py-6 border-t-2 border-brain-900 bg-white shrink-0">
              <button
                @click="handleSave"
                :disabled="isSaving"
                class="w-full flex items-center justify-center gap-2 px-5 py-4 brutal-btn bg-brain-900 text-white text-sm uppercase disabled:opacity-50 cursor-pointer"
              >
                <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                <Icon v-else name="lucide:save" class="w-4 h-4" />
                {{ editNote ? 'Commit Amendment' : 'Execute Generation' }}
              </button>
              <button
                @click="close"
                class="brutal-btn w-full px-4 py-3 bg-white text-brain-900 text-xs font-mono uppercase border-2 border-brain-900 cursor-pointer"
              >
                Abort
              </button>
            </div>
        </div>
        </div>
        
        <!-- Floating Mobile Settings Toggle -->
        <button 
          v-if="!showMobileProps" 
          @click="showMobileProps = true"
          class="md:hidden fixed bottom-6 right-6 z-[60] flex items-center justify-center w-14 h-14 bg-brain-900 text-white border-2 border-white shadow-[4px_4px_0px_#111] transition-all cursor-pointer box-content"
        >
          <Icon name="lucide:sliders-horizontal" class="w-6 h-6" />
        </button>

      </div>
    </Transition>
  </Teleport>

  <!-- FAB -->
  <button
    @click="open"
    class="fixed bottom-6 right-6 z-40 w-16 h-16 bg-brain-900 border-2 border-white shadow-[4px_4px_0px_#111] flex items-center justify-center text-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111] active:translate-y-1 active:shadow-[0px_0px_0px_#111] transition-all duration-200 cursor-pointer md:hidden box-content"
  >
    <Icon name="lucide:plus-square" class="w-8 h-8" />
  </button>
</template>

<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'
import type { ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { CATEGORIES, CATEGORY_LABELS, STATUSES, STATUS_LABELS } from '~/types'
import type { Note, NoteCategory, NoteStatus } from '~/types'

const props = defineProps<{ editNote?: Note | null }>()
const emit = defineEmits(['close'])

const notesStore = useNotesStore()
const toast = useToast()

const isOpen = ref(false)
const isSaving = ref(false)
const saveError = ref<string | null>(null)
const showMobileProps = ref(false)
const entityError = ref(false)
const titleInput = ref<HTMLInputElement>()

const entities = computed(() => notesStore.entities)

const toolbars = [
  'bold', 'italic', 'strikeThrough', '-',
  'title', 'unorderedList', 'orderedList', 'task', '-',
  'codeRow', 'code', 'link', 'table', '-',
  'fullscreen',
] as ToolbarNames[]

const form = reactive({
  title: '',
  content: '',
  category: 'strategic' as NoteCategory,
  status: 'raw_idea' as NoteStatus,
  entityIds: [] as string[],
})

const resetForm = () => {
  form.title = ''
  form.content = ''
  form.category = 'strategic'
  form.status = 'raw_idea'
  form.entityIds = []
  entityError.value = false
  saveError.value = null
  showMobileProps.value = false
}

const open = () => {
  isOpen.value = true
  showMobileProps.value = false
  nextTick(() => titleInput.value?.focus())
}

const close = () => {
  isOpen.value = false
  resetForm()
  emit('close')
}

const toggleEntity = (id: string) => {
  const idx = form.entityIds.indexOf(id)
  if (idx === -1) {
    form.entityIds.push(id)
  } else {
    form.entityIds.splice(idx, 1)
  }
  entityError.value = false
}

const titleError = ref(false)

const handleSave = async () => {
  saveError.value = null
  entityError.value = false
  titleError.value = false

  // Validate required fields
  if (!form.title.trim()) {
    titleError.value = true
    titleInput.value?.focus()
    return
  }

  if (form.entityIds.length === 0) {
    entityError.value = true
    showMobileProps.value = true
    return
  }

  isSaving.value = true
  try {
    if (props.editNote) {
      await notesStore.updateNote(
        props.editNote.id,
        { title: form.title, content: form.content, category: form.category, status: form.status },
        form.entityIds
      )
    } else {
      await notesStore.createNote(
        form.title,
        form.content,
        form.category,
        form.status,
        form.entityIds
      )
    }
    toast.success(props.editNote ? 'Record amended' : 'Record generated')
    close()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Transaction failed. Subsystem error.'
    saveError.value = msg
    toast.error(msg)
    console.error('Failed to save note:', err)
  } finally {
    isSaving.value = false
  }
}

// Keyboard shortcut
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }
  if (e.key === 'Escape' && isOpen.value) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  // Auto-open when rendered (e.g. from Notes page with v-if)
  if (props.editNote !== undefined) {
    // Pre-fill from editNote
    if (props.editNote) {
      form.title = props.editNote.title
      form.content = props.editNote.content
      form.category = props.editNote.category
      form.status = props.editNote.status
      form.entityIds = props.editNote.entity_ids ? [...props.editNote.entity_ids] : []
    }
    open()
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Expose open for parent components
defineExpose({ open })
</script>

<style>
/* Adjust md-editor internally for light theme in capture modal */
#capture-editor .cm-content {
    font-family: 'DM Sans', sans-serif !important;
}
#capture-editor .cm-activeLine {
    background-color: transparent !important;
}
#capture-editor .md-editor-toolbar-wrapper {
   border-bottom: 2px solid #111;
}
</style>
