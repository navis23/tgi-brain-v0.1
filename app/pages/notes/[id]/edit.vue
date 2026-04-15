<template>
  <div v-if="loading" class="fixed inset-0 flex flex-col items-center justify-center bg-white text-brain-900 z-30">
    <Icon name="lucide:loader" class="w-8 h-8 animate-spin mb-4" />
    <p class="text-sm font-mono font-bold uppercase tracking-widest">Loading Record…</p>
  </div>
  <div v-else-if="!note" class="fixed inset-0 flex flex-col items-center justify-center bg-white text-brain-900 z-30 p-6">
    <div class="w-20 h-20 border-2 border-brain-900 bg-brain-100 flex items-center justify-center mb-6 shadow-[4px_4px_0px_#111]">
      <Icon name="lucide:file-warning" class="w-10 h-10" />
    </div>
    <p class="font-display font-bold text-2xl uppercase tracking-tighter">Record Not Found</p>
    <NuxtLink to="/notes" class="brutal-btn mt-6 px-6 py-3 bg-white border-2 border-brain-900 text-brain-900 text-xs shadow-[2px_2px_0px_#111]">
      Return to Index
    </NuxtLink>
  </div>
  <NoteEditor v-else :note="note" />
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const notesStore = useNotesStore()

const loading = ref(true)
const noteId = route.params.id as string
const note = computed(() => notesStore.notes.find(n => n.id === noteId) || null)

useHead({ title: computed(() => note.value ? `Amend: ${note.value.title}` : 'Amend Record') })

onMounted(async () => {
  if (notesStore.entities.length === 0) await notesStore.fetchEntities()
  if (notesStore.notes.length === 0) await notesStore.fetchNotes()
  loading.value = false
})
</script>
