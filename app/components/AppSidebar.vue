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
        class="fixed inset-0 bg-brain-900/40 z-40 md:hidden"
        @click="isOpen = false"
      />
    </Transition>

    <aside
      class="fixed left-0 top-0 bottom-0 w-64 bg-brain-50 border-r-2 border-brain-900 flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    >

    <!-- Logo - Brutalist Header -->
    <div class="px-6 py-6 border-b-2 border-brain-900 shrink-0 bg-brain-900 text-brain-50">
      <div class="flex items-center gap-3">
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-display font-bold tracking-tight uppercase leading-none">THE ARCHIVE</h1>
          <p class="text-[10px] font-mono mt-1 uppercase tracking-widest text-brain-400">TGI Intelligence</p>
        </div>
        <button
          @click="isOpen = false"
          class="md:hidden p-1 text-brain-400 hover:text-white border-2 border-transparent hover:border-white transition-colors"
        >
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="px-4 py-4 space-y-1.5 border-b-2 border-brain-900 shrink-0">
       <NuxtLink
        to="/"
        @click="isOpen = false"
        class="flex items-center gap-3 px-3 py-2.5 font-display font-medium text-sm transition-all duration-100 border-2 border-transparent"
        active-class="!border-brain-900 !bg-brain-900 !text-brain-50 shadow-[2px_2px_0px_#111]"
        :class="route.path === '/' ? '' : 'text-brain-800 hover:border-brain-900 hover:shadow-[2px_2px_0px_#111]'"
      >
        <Icon name="lucide:file-stack" class="w-4 h-4 shrink-0" />
        <span class="uppercase tracking-wider">Index</span>
      </NuxtLink>
      
      <NuxtLink
        to="/graph"
        @click="isOpen = false"
        class="flex items-center gap-3 px-3 py-2.5 font-display font-medium text-sm transition-all duration-100 border-2 border-transparent"
        active-class="!border-brain-900 !bg-brain-900 !text-brain-50 shadow-[2px_2px_0px_#111]"
        :class="route.path === '/graph' ? '' : 'text-brain-800 hover:border-brain-900 hover:shadow-[2px_2px_0px_#111]'"
      >
        <Icon name="lucide:network" class="w-4 h-4 shrink-0" />
        <span class="uppercase tracking-wider">Topology</span>
      </NuxtLink>
      
      <NuxtLink
        to="/notes"
        @click="isOpen = false"
        class="flex items-center gap-3 px-3 py-2.5 font-display font-medium text-sm transition-all duration-100 border-2 border-transparent"
        active-class="!border-brain-900 !bg-brain-900 !text-brain-50 shadow-[2px_2px_0px_#111]"
        :class="route.path === '/notes' ? '' : 'text-brain-800 hover:border-brain-900 hover:shadow-[2px_2px_0px_#111]'"
      >
        <Icon name="lucide:table-2" class="w-4 h-4 shrink-0" />
        <span class="uppercase tracking-wider">Registers</span>
      </NuxtLink>
    </nav>

    <!-- Spacer: pushes entities + user to bottom -->
    <div class="flex-1 overflow-y-auto">
        <!-- Entity Quick Filters -->
        <div class="px-4 py-4 shrink-0">
          <p class="text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest mb-3 px-1 border-b-2 border-brain-900 pb-1">Entities.idx</p>
          <div class="space-y-1">
            <button
              v-for="entity in entities"
              :key="entity.id"
              @click="handleEntityClick(entity.id)"
              class="w-full flex items-center gap-3 px-2 py-2 font-mono text-xs transition-all duration-100 cursor-pointer border-2"
              :class="filterStore.activeEntityId === entity.id
                ? 'border-brain-900 bg-brain-900 text-brain-50 shadow-[2px_2px_0px_#111]'
                : 'border-transparent text-brain-800 hover:border-brain-900 hover:shadow-[2px_2px_0px_#111]'"
            >
              <span
                class="w-3 h-3 border border-brain-900 shrink-0"
                :style="{ backgroundColor: entity.color }"
              />
              <span class="truncate flex-1 text-left uppercase">{{ entity.name }}</span>
              <span class="text-[10px] bg-brain-200 text-brain-900 px-1 border border-brain-900" :class="{'bg-brain-700 text-brain-50 border-brain-50': filterStore.activeEntityId === entity.id}">
                {{ String(entityNoteCounts[entity.id] || 0).padStart(3, '0') }}
              </span>
            </button>
          </div>
        </div>
    </div>

    <!-- User info / Footer -->
    <div class="border-t-2 border-brain-900 shrink-0 bg-white">
      <div class="flex items-center gap-3 px-4 py-3 border-b-2 border-brain-900">
        <div class="flex-1 min-w-0">
          <p class="text-xs font-display font-bold text-brain-900 uppercase truncate">{{ userName }}</p>
          <p class="text-[10px] font-mono text-brain-500 truncate">{{ userEmail }}</p>
        </div>
      </div>
      <!-- Sign out -->
      <button
        @click="handleSignOut"
        class="w-full flex items-center justify-center gap-2 px-4 py-3 font-display font-bold text-xs uppercase text-brain-900 hover:bg-brain-900 hover:text-white transition-colors cursor-pointer"
      >
        <Icon name="lucide:log-out" class="w-4 h-4 shrink-0" />
        Terminate Session
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
  return email.split('@')[0] || 'Operator'
})

const handleEntityClick = (entityId: string) => {
  filterStore.setEntityFilter(entityId)
  isOpen.value = false // Close sidebar on mobile after clicking
  if (route.path !== '/notes') {
    router.push('/notes')
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
