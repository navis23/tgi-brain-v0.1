<template>
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[50vh] text-brain-900">
        <Icon name="lucide:loader" class="w-8 h-8 animate-spin mb-4" />
        <p class="text-sm font-mono font-bold uppercase tracking-widest">Loading Record Data...</p>
    </div>

    <div v-else-if="!note" class="flex flex-col items-center justify-center min-h-[50vh] text-brain-900">
        <div
            class="w-20 h-20 border-2 border-brain-900 bg-brain-100 flex items-center justify-center mb-6 shadow-[4px_4px_0px_#111]">
            <Icon name="lucide:file-warning" class="w-10 h-10" />
        </div>
        <p class="font-display font-bold text-2xl uppercase tracking-tighter">Record Not Found</p>
        <p class="text-xs font-mono mt-2 mb-8">This record may have been expunged or the locator is invalid.</p>
        <NuxtLink to="/notes"
            class="brutal-btn px-6 py-3 bg-white border-2 border-brain-900 text-brain-900 text-xs shadow-[2px_2px_0px_#111]">
            Return to Index
        </NuxtLink>
    </div>

    <article v-else class="max-w-4xl mx-auto w-full px-6 md:px-10 py-4 md:py-6 bg-white brutal-card my-8">
        <!-- Header / Meta section -->
        <header class="mb-4 space-y-4 md:space-y-6">

            <!-- Top badges -->
            <div class="flex items-center flex-wrap gap-3 text-sm border-b-2 border-brain-900 pb-4">
                <!-- Status & Category block -->
                <div class="flex items-stretch border-2 border-brain-900 p-1">
                    <CategoryBadge :category="note.category" class="rounded-none! shadow-none! border-none!" />
                    <div class="w-px bg-brain-900 mx-2"></div>
                    <StatusBadge :status="note.status" class="rounded-none! shadow-none! border-none!" />
                </div>
            </div>

            <!-- Title -->
            <h1
                class="text-3xl md:text-5xl font-display font-bold text-brain-900 leading-none tracking-tighter uppercase mx-auto text-left">
                {{ note.title }}
            </h1>

            <!-- Meta Info Row -->
            <div class="flex flex-col md:flex-row md:items-start gap-6 md:gap-10 border-y-2 border-brain-900 py-4 mt-4">

                <!-- Dates -->
                <div class="flex items-center gap-6 text-xs w-full md:w-auto">
                    <div class="space-y-2 flex-1 md:flex-none">
                        <p
                            class="text-brain-900 font-mono font-bold uppercase tracking-widest text-[10px] bg-brain-100 px-2 py-1 inline-block border border-brain-900">
                            Originated</p>
                        <p class="font-mono text-brain-900 font-bold tabular-nums pl-1">{{
                            formatFullDate(note.created_at) }}</p>
                    </div>
                    <div class="w-px h-12 bg-brain-900 hidden md:block"></div>
                    <div class="space-y-2 flex-1 md:flex-none relative">
                        <p
                            class="text-brain-900 font-mono font-bold uppercase tracking-widest text-[10px] bg-brain-100 px-2 py-1 inline-block border border-brain-900 transition-all">
                            Revised</p>
                        <p class="font-mono text-brain-900 font-bold tabular-nums pl-1">{{
                            formatFullDate(note.updated_at) }}</p>
                    </div>
                </div>

                <div class="w-px h-12 bg-brain-900 hidden md:block"></div>

                <!-- Words -->
                <div class="space-y-2 text-xs flex-1 md:flex-none">
                    <p
                        class="text-brain-900 font-mono font-bold uppercase tracking-widest text-[10px] bg-brain-100 px-2 py-1 inline-block border border-brain-900">
                        Volume</p>
                    <p class="font-mono text-brain-900 font-bold tabular-nums pl-1">{{
                        String(wordCount(note.content)).padStart(4, '0') }} WRD</p>
                </div>

            </div>

            <!-- Source -->
            <div v-if="note.source" class="text-xs">
                <p class="text-brain-900 font-mono font-bold uppercase tracking-widest text-[10px] bg-brain-100 px-2 py-1 inline-block border border-brain-900 mb-2">
                    Source</p>
                <p class="font-mono text-brain-600 pl-1">
                    <a v-if="note.source.startsWith('http://') || note.source.startsWith('https://')"
                       :href="note.source"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="text-[#4B4DED] border-b border-[#4B4DED] hover:bg-[#4B4DED] hover:text-white transition-all font-bold">
                        {{ note.source }}
                    </a>
                    <span v-else>{{ note.source }}</span>
                </p>
            </div>

            <!-- Entities -->
            <div class="" v-if="note.entities && note.entities.length > 0">
                <p
                    class="text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest mb-2 inline-block bg-brain-100 px-2 py-1 border border-brain-900">
                    Cross-Referenced Entities</p>
                <div class="flex flex-wrap gap-2">
                    <EntityBadge v-for="entity in note.entities" :key="entity.id" :entity="entity"
                        class="px-3 py-1.5 text-xs! rounded-none! border-2! border-brain-900! shadow-[2px_2px_0px_#111]!" />
                </div>
            </div>
        </header>

        <!-- Main Markdown Content -->
        <!-- Switch MDPreview theme to light and apply white-paper prose styles -->
        <div
            class="prose prose-sm md:prose-base max-w-none prose-brain font-sans text-brain-900 pt-4 border-t-2 border-brain-900 dashed-border relative">
            <ClientOnly>
                <MdPreview :model-value="note.content" theme="light" :editor-id="`read-preview-${note.id}`"
                    class="bg-transparent! text-brain-900! md:text-lg leading-relaxed!" />
                <template #fallback>
                    <div class="whitespace-pre-wrap font-mono text-brain-900 text-sm leading-relaxed">{{ note.content }}
                    </div>
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
                class="brutal-btn flex items-center gap-2 px-6 py-2 border-2 border-brain-900 bg-brain-900 text-white shadow-[2px_2px_0px_#F4F4F0] cursor-pointer text-xs">
                <Icon name="lucide:pencil" class="w-4 h-4" />
                <span class="hidden md:inline font-display font-bold uppercase tracking-widest">Amend Record</span>
                <span class="md:hidden font-display font-bold uppercase">Amend</span>
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
    title: computed(() => note.value ? `${note.value.title} — Archive` : 'Reading — Archive')
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
        month: '2-digit', day: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).replace(',', ' //')
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
/* Custom editorial prose styling for Light Mode Neobrutalism */
.prose-brain h1,
.prose-brain h2,
.prose-brain h3,
.prose-brain h4 {
    font-family: 'Space Grotesk', sans-serif;
    color: #111111;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    font-weight: 700;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    border-bottom: 2px solid #111111;
    padding-bottom: 0.25em;
}

.prose-brain p {
    color: #1c1c1c;
    margin-bottom: 1.5em;
    font-size: 1.05rem;
    line-height: 1.6;
}

.prose-brain a {
    color: #4B4DED;
    text-decoration: none;
    border-bottom: 2px solid #4B4DED;
    font-weight: 700;
    transition: all 0.1s ease;
}

.prose-brain a:hover {
    background-color: #4B4DED;
    color: white;
}

.prose-brain img {
    border: 2px solid #111111;
    box-shadow: 4px 4px 0px #111111;
    border-radius: 0px !important;
}

/* Prevent unnatural word breaking in the md-editor while allowing long links to wrap */
.md-editor-preview,
.md-editor-preview * {
    word-break: normal !important;
    overflow-wrap: break-word !important;
}

.prose-brain blockquote {
    border-left: 4px solid #111111;
    background: #f0f0f0;
    padding: 1.5rem;
    font-style: italic;
    color: #3f3f3f;
    font-family: 'DM Sans', serif;
}

.prose-brain code {
    color: #111111;
    background: #e5e5e5;
    border: 1px solid #111111;
    padding: 0.125rem 0.35rem;
    border-radius: 0px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: bold;
}

.prose-brain pre {
    background: #111111 !important;
    border: 2px solid #111111;
    border-radius: 0px;
    box-shadow: 4px 4px 0px #d4d4d4;
}

.prose-brain pre code {
    background: transparent;
    color: #f0f0f0;
    border: none;
}

.prose-brain ul {
    list-style-type: square;
    padding-left: 1.5rem;
    margin-bottom: 1.5em;
}

.prose-brain ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-bottom: 1.5em;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: semibold;
}

.prose-brain li {
    margin-bottom: 0.5em;
    color: #1c1c1c;
}

.prose-brain li > p {
    margin-bottom: 0.25em;
}
</style>
