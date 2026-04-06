import type { NoteCategory, NoteStatus } from '~/types'

export const useFilterStore = defineStore('filters', () => {
  const activeEntityId = ref<string | null>(null)
  const activeCategory = ref<NoteCategory | null>(null)
  const activeStatus = ref<NoteStatus | null>(null)
  const searchQuery = ref('')

  const hasActiveFilters = computed(() =>
    activeEntityId.value !== null ||
    activeCategory.value !== null ||
    activeStatus.value !== null ||
    searchQuery.value !== ''
  )

  const activeFilterCount = computed(() => {
    let count = 0
    if (activeEntityId.value) count++
    if (activeCategory.value) count++
    if (activeStatus.value) count++
    if (searchQuery.value) count++
    return count
  })

  const setEntityFilter = (id: string | null) => {
    activeEntityId.value = activeEntityId.value === id ? null : id
  }

  const setCategoryFilter = (cat: NoteCategory | null) => {
    activeCategory.value = activeCategory.value === cat ? null : cat
  }

  const setStatusFilter = (status: NoteStatus | null) => {
    activeStatus.value = activeStatus.value === status ? null : status
  }

  const setSearch = (query: string) => {
    searchQuery.value = query
  }

  const clearAll = () => {
    activeEntityId.value = null
    activeCategory.value = null
    activeStatus.value = null
    searchQuery.value = ''
  }

  return {
    activeEntityId,
    activeCategory,
    activeStatus,
    searchQuery,
    hasActiveFilters,
    activeFilterCount,
    setEntityFilter,
    setCategoryFilter,
    setStatusFilter,
    setSearch,
    clearAll,
  }
})
