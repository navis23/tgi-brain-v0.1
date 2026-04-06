<template>
  <div>
    <!-- Mobile Backdrop -->
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
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        @click="isOpen = false"
      />
    </Transition>

    <aside
      class="fixed left-0 top-0 bottom-0 w-60 bg-brain-900/90 backdrop-blur-xl border-r border-brain-700/50 flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    >

    <!-- Logo -->
    <div class="px-5 py-5 border-b border-brain-700/50 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-linear-to-br from-entity-tgi to-entity-drc flex items-center justify-center shadow-lg shadow-entity-tgi/20 shrink-0">
          <Icon name="lucide:brain" class="w-4.5 h-4.5 text-white" />
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-sm font-bold text-brain-50 tracking-tight leading-tight">TGI BRAIN</h1>
          <p class="text-[10px] text-brain-500 font-medium leading-tight">Internal Elixir #0</p>
        </div>
        <button
          @click="isOpen = false"
          class="md:hidden p-1.5 text-brain-400 hover:text-brain-200 transition-colors"
        >
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="px-3 py-3 space-y-0.5 border-b border-brain-700/50 shrink-0">
      <NuxtLink
        to="/"
        class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-brain-300 hover:text-brain-50 hover:bg-brain-700/50"
        active-class="!bg-entity-tgi/15 !text-entity-tgi"
        exact
      >
        <Icon name="lucide:layout-dashboard" class="w-4 h-4 shrink-0" />
        <span>Dashboard</span>
      </NuxtLink>
      <NuxtLink
        to="/graph"
        class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-brain-300 hover:text-brain-50 hover:bg-brain-700/50"
        active-class="!bg-entity-tgi/15 !text-entity-tgi"
      >
        <Icon name="lucide:network" class="w-4 h-4 shrink-0" />
        <span>Knowledge Graph</span>
      </NuxtLink>
      <NuxtLink
        to="/notes"
        class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-brain-300 hover:text-brain-50 hover:bg-brain-700/50"
        active-class="!bg-entity-tgi/15 !text-entity-tgi"
      >
        <Icon name="lucide:table-2" class="w-4 h-4 shrink-0" />
        <span>Notes</span>
      </NuxtLink>
    </nav>

    <!-- Spacer: pushes entities + user to bottom -->
    <div class="flex-1" />

    <!-- Entity Quick Filters -->
    <div class="px-3 py-3 border-t border-brain-700/50 shrink-0">
      <p class="text-[10px] font-semibold text-brain-500 uppercase tracking-widest mb-2 px-2">Entities</p>
      <div class="space-y-0.5">
        <button
          v-for="entity in entities"
          :key="entity.id"
          @click="handleEntityClick(entity.id)"
          class="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 group cursor-pointer"
          :class="filterStore.activeEntityId === entity.id
            ? 'bg-brain-700/60 text-brain-50'
            : 'text-brain-400 hover:text-brain-100 hover:bg-brain-800/60'"
        >
          <span
            class="w-2 h-2 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-125"
            :style="{ backgroundColor: entity.color }"
          />
          <span class="truncate flex-1 text-left">{{ entity.name }}</span>
          <span class="text-[10px] text-brain-600 tabular-nums font-medium">
            {{ entityNoteCounts[entity.id] || 0 }}
          </span>
        </button>
      </div>
    </div>

    <!-- User info -->
    <div class="px-3 py-3 border-t border-brain-700/50 shrink-0">
      <div class="flex items-center gap-2.5 px-2 py-0.5">
        <div class="w-7 h-7 rounded-lg bg-brain-800 border border-brain-700/60 flex items-center justify-center shrink-0">
          <Icon name="lucide:user" class="w-3.5 h-3.5 text-brain-400" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-brain-300 truncate font-medium">{{ userName }}</p>
          <p class="text-[10px] text-brain-600 truncate">{{ userEmail }}</p>
        </div>
      </div>
    </div>

    <!-- Sign out -->
    <div class="px-3 pb-4 shrink-0">
      <button
        @click="handleSignOut"
        class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-brain-500 hover:text-entity-enterbiner hover:bg-entity-enterbiner/8 border border-transparent hover:border-entity-enterbiner/20 transition-all duration-200 cursor-pointer group"
      >
        <Icon name="lucide:log-out" class="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        Sign out
      </button>
    </div>

    </aside>
  </div>
</template>

<script setup lang="ts">
const notesStore = useNotesStore()
const filterStore = useFilterStore()
const { user, signOut } = useAuth()
const router = useRouter()
const route = useRoute()

const isOpen = useState('sidebarOpen', () => false)

const entities = computed(() => notesStore.entities)
const entityNoteCounts = computed(() => notesStore.entityNoteCounts)
const userEmail = computed(() => user.value?.email || '')
const userName = computed(() => {
  const email = user.value?.email || ''
  return email.split('@')[0] || 'User'
})

const handleEntityClick = (entityId: string) => {
  filterStore.setEntityFilter(entityId)
  isOpen.value = false // Close sidebar on mobile after clicking
  if (route.path !== '/graph') {
    router.push('/graph')
  }
}

const handleSignOut = async () => {
  try {
    await signOut()
  } catch (err) {
    console.error('Sign out error:', err)
  }
}
</script>
