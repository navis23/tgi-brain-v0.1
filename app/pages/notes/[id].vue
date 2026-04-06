<template>
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[50vh] text-brain-500">
        <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mb-4 text-entity-sbs" />
        <p class="text-sm font-medium">Loading Note...</p>
    </div>

    <div v-else-if="!note" class="flex flex-col items-center justify-center min-h-[50vh] text-brain-500">
        <div class="w-16 h-16 rounded-2xl bg-brain-800/40 flex items-center justify-center mb-4">
            <Icon name="lucide:file-question" class="w-8 h-8 text-brain-600 opacity-60" />
        </div>
        <p class="text-brain-300 font-medium text-lg">Note Not Found</p>
        <p class="text-sm mt-1 mb-6">This note may have been deleted or the URL is incorrect.</p>
        <NuxtLink to="/notes"
            class="px-4 py-2 bg-brain-800 hover:bg-brain-700 text-brain-200 rounded-lg transition-colors text-sm font-medium">
            Return to Notes
        </NuxtLink>
    </div>

    <article v-else class="max-w-4xl mx-auto w-full px-4 md:px-8 py-4 md:py-8">
        <!-- Header / Meta section -->
        <header class="mb-4 md:mb-8 space-y-4 md:space-y-6">

            <!-- Top badges -->
            <div class="flex items-center flex-wrap gap-2 text-sm">
                <CategoryBadge :category="note.category" />
                <span class="text-brain-700">•</span>
                <StatusBadge :status="note.status" />
            </div>

            <!-- Title -->
            <h1 class="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
                {{ note.title }}
            </h1>

            <!-- Meta Info Row -->
            <div
                class="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 border-y border-brain-800/50 py-4 mt-8">

                <!-- Dates -->
                <div class="flex items-center gap-4 text-xs">
                    <div class="space-y-1">
                        <p class="text-brain-600 font-medium uppercase tracking-widest text-[10px]">Created</p>
                        <p class="text-brain-300 tabular-nums">{{ formatFullDate(note.created_at) }}</p>
                    </div>
                    <div class="w-px h-6 bg-brain-800/60 hidden md:block"></div>
                    <div class="space-y-1">
                        <p class="text-brain-600 font-medium uppercase tracking-widest text-[10px]">Last Updated</p>
                        <p class="text-brain-300 tabular-nums">{{ formatFullDate(note.updated_at) }}</p>
                    </div>
                </div>

                <div class="w-px h-6 bg-brain-800/60 hidden md:block"></div>

                <!-- Words -->
                <div class="space-y-1 text-xs">
                    <p class="text-brain-600 font-medium uppercase tracking-widest text-[10px]">Length</p>
                    <p class="text-brain-300 tabular-nums">{{ wordCount(note.content) }} words</p>
                </div>

            </div>

            <!-- Entities -->
            <div class="pt-2" v-if="note.entities && note.entities.length > 0">
                <p class="text-[10px] font-semibold text-brain-600 uppercase tracking-widest mb-3">Linked Entities</p>
                <div class="flex flex-wrap gap-2">
                    <EntityBadge v-for="entity in note.entities" :key="entity.id" :entity="entity"
                        class="px-2.5 py-1 text-xs!" />
                </div>
            </div>
        </header>

        <!-- Main Markdown Content -->
        <div
            class="prose prose-invert prose-brain max-w-none prose-headings:font-bold prose-a:text-entity-sbs prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
            <ClientOnly>
                <MdPreview :model-value="note.content" theme="dark" :editor-id="`read-preview-${note.id}`"
                    class="bg-transparent! text-base md:text-lg leading-relaxed!" />
                <template #fallback>
                    <div class="whitespace-pre-wrap text-brain-200 text-lg leading-relaxed">{{ note.content }}</div>
                </template>
            </ClientOnly>
        </div>

        <!-- Capture modal override for editing in-place -->
        <Teleport to="body">
            <CaptureModal :edit-note="selectedEditNote" @close="selectedEditNote = null" v-if="selectedEditNote" />
        </Teleport>

        <!-- Top Nav Actions (Teleported to layout) -->
        <Teleport to="#reading-header-actions">
            <button @click="editNote"
                class="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold bg-entity-sbs/20 hover:bg-entity-sbs/30 transition-colors shadow-sm cursor-pointer border border-entity-sbs/50 text-entity-sbs">
                <Icon name="lucide:pencil" class="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span class="hidden md:inline">Edit Note</span>
                <span class="md:hidden">Edit</span>
            </button>
        </Teleport>
    </article>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import type { Note } from '~/types'

definePageMeta({
    layout: 'reading'
})

const route = useRoute()
const notesStore = useNotesStore()

const noteId = route.params.id as string
const loading = ref(true)
const selectedEditNote = ref<Note | null>(null)

const note = computed(() => notesStore.notes.find(n => n.id === noteId) || null)

useHead({
    title: computed(() => note.value ? `${note.value.title} — TGI BRAIN` : 'Note — TGI BRAIN')
})

const editNote = () => {
    if (note.value) {
        selectedEditNote.value = note.value
    }
}

const wordCount = (content: string) => content.trim().split(/\s+/).filter(Boolean).length

const formatFullDate = (dateStr: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

onMounted(async () => {
    // If notes are not loaded yet, fetch them
    if (notesStore.notes.length === 0) {
        await notesStore.fetchEntities()
        await notesStore.fetchNotes()
    }
    loading.value = false
})
</script>

<style>
/* Custom prose styling overrides for the reader */
.prose-brain h1,
.prose-brain h2,
.prose-brain h3 {
    color: #f8fafc;
    margin-top: 2em;
    margin-bottom: 1em;
}

.prose-brain p {
    color: #e2e8f0;
    margin-bottom: 1.5em;
}

/* Prevent unnatural word breaking in the md-editor while allowing long links to wrap */
.md-editor-preview,
.md-editor-preview * {
    word-break: normal !important;
    overflow-wrap: break-word !important;
}

.prose-brain blockquote {
    border-left-color: #3b82f6;
    /* Adjust to match theme if needed */
    background: rgba(15, 23, 42, 0.4);
    padding: 1rem;
    border-radius: 0 0.5rem 0.5rem 0;
    color: #cbd5e1;
}

.prose-brain code {
    color: #60a5fa;
    background: rgba(15, 23, 42, 0.8);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
}
</style>
