<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        @click="close"
      />
    </Transition>

    <!-- Modal -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-8 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-8 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 md:inset-auto md:top-[5vh] md:left-1/2 md:-translate-x-1/2 md:w-11/12 md:max-w-6xl h-dvh md:h-[90vh] bg-brain-950 md:bg-brain-900/95 md:backdrop-blur-3xl md:border md:border-brain-700/50 md:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
      >
        
        <!-- MOBILE HEADER -->
        <div class="md:hidden flex items-center justify-between px-3 py-3 border-b border-brain-800/60 bg-brain-950/80 backdrop-blur shrink-0">
          <button @click="close" class="text-sm font-medium text-brain-400 hover:text-white px-2 py-1 cursor-pointer">
            Cancel
          </button>
          <span class="text-[10px] font-extrabold text-brain-500 uppercase tracking-widest">
            {{ editNote ? 'Editing Note' : 'New Note' }}
          </span>
          <button 
            @click="handleSave" 
            :disabled="isSaving"
            class="text-sm font-bold text-entity-sbs hover:text-white px-2 py-1 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
          >
            <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <span v-else>Save</span>
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
          <div v-if="saveError" class="shrink-0 flex items-center gap-2.5 px-4 py-2.5 bg-entity-enterbiner/10 border-b border-entity-enterbiner/30">
            <Icon name="lucide:alert-circle" class="w-4 h-4 text-entity-enterbiner shrink-0" />
            <p class="text-xs text-entity-enterbiner flex-1">{{ saveError }}</p>
            <button @click="saveError = null" class="text-entity-enterbiner/60 hover:text-entity-enterbiner transition-colors cursor-pointer">
              <Icon name="lucide:x" class="w-3.5 h-3.5" />
            </button>
          </div>
        </Transition>

        <!-- MAIN LAYOUT (Canvas takes full height on mobile, split columns on desktop) -->
        <div class="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          <!-- Left Side: Uncompromised Writing Canvas -->
          <div class="flex-1 flex flex-col min-w-0 bg-transparent relative overflow-y-auto">
            
            <!-- Top Header inside canvas (Desktop ONLY) -->
            <div class="hidden md:flex items-center justify-between px-8 py-4 border-b border-brain-800/50 shrink-0">
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-brain-500 uppercase tracking-widest">
                  {{ editNote ? 'Editing Mode' : 'Capture Mode' }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <kbd class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono text-brain-500 bg-brain-800/50 border border-brain-700">
                  ⌘K
                </kbd>
                <button
                  @click="close"
                  class="flex p-1.5 rounded-lg text-brain-400 hover:text-brain-100 hover:bg-brain-800 transition-colors cursor-pointer"
                  title="Close Editor"
                >
                  <Icon name="lucide:x" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Document Canvas -->
            <div class="flex-1 flex flex-col min-h-0 px-4 md:px-12 py-5 md:py-8 space-y-4 md:space-y-6">
              <!-- Title Input -->
              <input
                ref="titleInput"
                v-model="form.title"
                type="text"
                placeholder="Note Title"
                class="w-full text-2xl md:text-5xl font-extrabold bg-transparent text-white placeholder:text-brain-700 focus:outline-none tracking-tight shrink-0"
              />
              
              <!-- Editor -->
              <div class="flex-1 -mx-2 md:-mx-8">
                <ClientOnly>
                  <MdEditor
                    v-model="form.content"
                    theme="dark"
                    :preview="false"
                    :toolbars="toolbars"
                    language="en-US"
                    editor-id="capture-editor"
                    class="bg-transparent! border-transparent! h-full min-h-[300px] md:min-h-[400px] text-lg leading-relaxed focus-within:bg-transparent"
                  />
                  <template #fallback>
                    <div class="h-full bg-brain-800/20 rounded-xl animate-pulse mx-4 md:mx-8" />
                  </template>
                </ClientOnly>
              </div>
            </div>
          </div>

          <!-- Right Side: Inspector Sidebar (Properties) - Hidden on mobile by default -->
          <div 
             :class="[
               showMobileProps ? 'fixed inset-0 z-60 bg-brain-950 flex' : 'hidden',
               'md:flex md:static md:w-80 md:bg-black/30 md:z-auto shrink-0 border-t md:border-t-0 md:border-l border-brain-800 flex-col overflow-y-auto'
             ]"
          >
            
            <!-- Mobile overlay header -->
            <div v-if="showMobileProps" class="md:hidden flex items-center justify-between px-4 py-4 border-b border-brain-800 bg-brain-900 shrink-0">
               <span class="text-sm font-bold text-white">Note Settings</span>
               <button @click="showMobileProps = false" class="text-entity-sbs font-bold text-sm px-2 py-1 cursor-pointer">Done</button>
            </div>
            
            <div class="flex-1 px-4 md:px-6 py-6 md:py-8 space-y-8">
              <!-- Entities -->
              <div>
                <label class="flex items-center gap-2 text-[10px] font-bold text-brain-400 uppercase tracking-widest mb-3">
                  <Icon name="lucide:git-commit-horizontal" class="w-3.5 h-3.5 text-brain-500" />
                  Linked Entities
                  <span class="text-entity-enterbiner">*</span>
                </label>
                <div class="flex flex-col gap-1.5">
                  <button
                    v-for="entity in entities"
                    :key="entity.id"
                    @click="toggleEntity(entity.id)"
                    class="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 cursor-pointer text-left"
                    :class="form.entityIds.includes(entity.id)
                      ? 'border-transparent shadow-sm bg-brain-800/80'
                      : 'bg-transparent border-brain-800 text-brain-400 hover:bg-brain-800/40 hover:border-brain-700'"
                  >
                    <div class="flex items-center gap-2">
                      <span
                        class="w-2 h-2 rounded-full"
                        :style="{ backgroundColor: entity.color }"
                      />
                      <span :class="form.entityIds.includes(entity.id) ? 'text-white' : 'text-brain-300'">{{ entity.name }}</span>
                    </div>
                    <Icon v-if="form.entityIds.includes(entity.id)" name="lucide:check" class="w-4 h-4" :style="{ color: entity.color }" />
                  </button>
                </div>
                <p v-if="entityError" class="text-xs text-entity-enterbiner mt-2 flex items-center gap-1">
                  <Icon name="lucide:alert-circle" class="w-3 h-3" />
                  Select at least one entity
                </p>
              </div>

              <hr class="border-brain-800/60" />

              <!-- Category -->
              <div>
                <label class="flex items-center gap-2 text-[10px] font-bold text-brain-400 uppercase tracking-widest mb-3">
                  <Icon name="lucide:folder" class="w-3.5 h-3.5 text-brain-500" />
                  Category
                </label>
                <select
                  v-model="form.category"
                  class="w-full px-3 py-2.5 bg-brain-900/60 border border-brain-700/60 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-entity-tgi/50 transition-colors appearance-none cursor-pointer"
                >
                  <option v-for="cat in CATEGORIES" :key="cat" :value="cat">
                    {{ CATEGORY_LABELS[cat] }}
                  </option>
                </select>
              </div>

              <!-- Status -->
              <div>
                <label class="flex items-center gap-2 text-[10px] font-bold text-brain-400 uppercase tracking-widest mb-3">
                  <Icon name="lucide:activity" class="w-3.5 h-3.5 text-brain-500" />
                  Status Pipeline
                </label>
                <select
                  v-model="form.status"
                  class="w-full px-3 py-2.5 bg-brain-900/60 border border-brain-700/60 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-entity-tgi/50 transition-colors appearance-none cursor-pointer"
                >
                  <option v-for="s in STATUSES" :key="s" :value="s">
                    {{ STATUS_LABELS[s] }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Actions Footer (Desktop ONLY sticks to bottom of right col) -->
            <div class="hidden md:flex flex-col gap-3 px-6 py-4 border-t border-brain-800 bg-transparent shrink-0">
              <button
                @click="handleSave"
                :disabled="isSaving"
                class="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-linear-to-r from-entity-tgi to-entity-drc rounded-xl text-sm font-bold text-white shadow-lg shadow-entity-tgi/20 hover:shadow-entity-tgi/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                <Icon v-else name="lucide:save" class="w-4 h-4" />
                {{ editNote ? 'Update Note' : 'Create Note' }}
              </button>
              <button
                @click="close"
                class="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-brain-400 hover:text-white hover:bg-brain-800/50 transition-colors cursor-pointer"
              >
                Cancel Edit
              </button>
            </div>
        </div>
        </div>
        
        <!-- Floating Mobile Settings Toggle -->
        <button 
          v-if="!showMobileProps" 
          @click="showMobileProps = true"
          class="md:hidden fixed bottom-6 right-6 z-55 flex items-center justify-center w-12 h-12 bg-brain-800/90 backdrop-blur hover:bg-brain-700 text-brain-200 hover:text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.5)] shadow-black border border-brain-700 transition-all cursor-pointer"
        >
          <Icon name="lucide:settings-2" class="w-5 h-5" />
        </button>

      </div>
    </Transition>
  </Teleport>

  <!-- FAB -->
  <button
    @click="open"
    class="fixed bottom-6 right-6 z-40 w-14 h-14 bg-linear-to-r from-entity-tgi to-entity-drc rounded-full shadow-xl shadow-entity-tgi/30 flex items-center justify-center text-white hover:scale-110 hover:shadow-entity-tgi/50 active:scale-95 transition-all duration-200 cursor-pointer md:hidden"
  >
    <Icon name="lucide:plus" class="w-6 h-6" />
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
  'preview', 'fullscreen',
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

const handleSave = async () => {
  if (form.entityIds.length === 0) {
    entityError.value = true
    showMobileProps.value = true // Automatically flip to properties on mobile to show the error
    return
  }

  if (!form.title.trim()) {
    form.title = 'Untitled Note'
  }

  isSaving.value = true
  saveError.value = null
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
    close()
  } catch (err: any) {
    saveError.value = err?.message || 'Failed to save. Please try again.'
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
