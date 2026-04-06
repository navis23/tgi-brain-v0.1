import type { Entity, Note, NoteCategory, NoteStatus, SynergyLink } from '~/types'

export const useNotesStore = defineStore('notes', () => {
  // Lazy getter to avoid circular / SSR issues
  const getFilterStore = () => useFilterStore()
  // State
  const notes = ref<Note[]>([])
  const entities = ref<Entity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Lazy supabase getter — avoids SSR init issues
  const getSupabase = () => useSupabase()

  // Getters
  const entityNoteCounts = computed(() => {
    const counts: Record<string, number> = {}
    entities.value.forEach(e => { counts[e.id] = 0 })
    notes.value.forEach(note => {
      if (note.entity_ids) {
        note.entity_ids.forEach(eid => {
          if (counts[eid] !== undefined) counts[eid]++
        })
      }
    })
    return counts
  })

  const synergyLinks = computed((): SynergyLink[] => {
    const pairCounts: Record<string, number> = {}
    notes.value.forEach(note => {
      const eids = note.entity_ids || []
      for (let i = 0; i < eids.length; i++) {
        for (let j = i + 1; j < eids.length; j++) {
          const key = [eids[i], eids[j]].sort().join('::')
          pairCounts[key] = (pairCounts[key] || 0) + 1
        }
      }
    })
    return Object.entries(pairCounts)
      .map(([key, count]) => {
        const parts = key.split('::')
        return { source: parts[0]!, target: parts[1]!, count }
      })
  })

  const filteredNotes = computed(() => {
    const filterStore = getFilterStore()
    let result = [...notes.value]

    if (filterStore.activeEntityId) {
      result = result.filter(n =>
        n.entity_ids?.includes(filterStore.activeEntityId!)
      )
    }

    if (filterStore.activeCategory) {
      result = result.filter(n => n.category === filterStore.activeCategory)
    }

    if (filterStore.activeStatus) {
      result = result.filter(n => n.status === filterStore.activeStatus)
    }

    if (filterStore.searchQuery) {
      const q = filterStore.searchQuery.toLowerCase()
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      )
    }

    return result
  })

  // Actions
  const fetchEntities = async () => {
    const supabase = getSupabase()
    const { data, error: err } = await supabase
      .from('tgibrain_entities')
      .select('*')
      .order('name')

    if (err) {
      error.value = err.message
      return
    }
    entities.value = data || []
  }

  const fetchNotes = async () => {
    loading.value = true
    error.value = null
    const supabase = getSupabase()

    try {
      // Fetch notes
      const { data: notesData, error: notesErr } = await supabase
        .from('tgibrain_notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (notesErr) throw notesErr

      // Fetch note-entity mappings
      const { data: mappings, error: mapErr } = await supabase
        .from('tgibrain_note_entities')
        .select('note_id, entity_id')

      if (mapErr) throw mapErr

      // Build entity_ids for each note
      const entityMap: Record<string, string[]> = {}
      mappings?.forEach(m => {
        if (!entityMap[m.note_id]) entityMap[m.note_id] = []
        entityMap[m.note_id].push(m.entity_id)
      })

      notes.value = (notesData || []).map(note => {
        const noteEntityIds: string[] = entityMap[note.id] ?? []
        return {
          ...note,
          entity_ids: noteEntityIds,
          entities: noteEntityIds
            .map(eid => entities.value.find(e => e.id === eid))
            .filter((e): e is Entity => e !== undefined),
        }
      })
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createNote = async (
    title: string,
    content: string,
    category: NoteCategory,
    status: NoteStatus,
    entityIds: string[]
  ) => {
    const supabase = getSupabase()
    const { user } = useAuth()
    if (!user.value) throw new Error('Not authenticated')

    // Insert the note
    const { data: noteData, error: noteErr } = await supabase
      .from('tgibrain_notes')
      .insert({
        title,
        content,
        category,
        status,
        user_id: user.value.id,
      })
      .select()
      .single()

    if (noteErr) throw noteErr

    // Insert entity mappings
    if (entityIds.length > 0) {
      const mappings = entityIds.map(entity_id => ({
        note_id: noteData.id,
        entity_id,
      }))

      const { error: mapErr } = await supabase
        .from('tgibrain_note_entities')
        .insert(mappings)

      if (mapErr) throw mapErr
    }

    // Refresh notes list
    await fetchNotes()
    return noteData
  }

  const updateNote = async (
    id: string,
    updates: Partial<Pick<Note, 'title' | 'content' | 'category' | 'status'>>,
    entityIds?: string[]
  ) => {
    const supabase = getSupabase()
    const { error: updateErr } = await supabase
      .from('tgibrain_notes')
      .update(updates)
      .eq('id', id)

    if (updateErr) throw updateErr

    // Update entity mappings if provided
    if (entityIds !== undefined) {
      // Delete existing
      await supabase
        .from('tgibrain_note_entities')
        .delete()
        .eq('note_id', id)

      // Insert new
      if (entityIds.length > 0) {
        const mappings = entityIds.map(entity_id => ({
          note_id: id,
          entity_id,
        }))
        await supabase
          .from('tgibrain_note_entities')
          .insert(mappings)
      }
    }

    await fetchNotes()
  }

  const deleteNote = async (id: string) => {
    const supabase = getSupabase()
    const { error: delErr } = await supabase
      .from('tgibrain_notes')
      .delete()
      .eq('id', id)

    if (delErr) throw delErr
    await fetchNotes()
  }

  return {
    notes,
    entities,
    loading,
    error,
    entityNoteCounts,
    synergyLinks,
    filteredNotes,
    fetchEntities,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  }
})
