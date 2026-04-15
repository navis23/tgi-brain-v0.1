<template>
  <NoteEditor />
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'New Record — Archive' })

const notesStore = useNotesStore()
onMounted(async () => {
  if (notesStore.entities.length === 0) await notesStore.fetchEntities()
  if (notesStore.notes.length === 0) await notesStore.fetchNotes()
})
</script>
