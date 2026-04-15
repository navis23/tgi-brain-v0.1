<template>
  <div class="flex flex-col gap-7 px-5 py-6 bg-brain-50">
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
          type="button"
          @click="toggleEntity(entity.id)"
          class="flex items-center justify-between px-3 py-2 text-xs font-mono font-bold transition-all duration-100 cursor-pointer text-left border-2 uppercase"
          :class="modelValue.entityIds.includes(entity.id)
            ? 'border-brain-900 bg-brain-900 text-white shadow-[2px_2px_0px_#111] translate-x-1'
            : 'border-brain-900 bg-white text-brain-900 hover:shadow-[2px_2px_0px_#111] hover:-translate-y-0.5 hover:translate-x-0.5'"
        >
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 border border-brain-900 shrink-0" :style="{ backgroundColor: entity.color }" />
            <span>{{ entity.name }}</span>
          </div>
          <Icon v-if="modelValue.entityIds.includes(entity.id)" name="lucide:check-square" class="w-4 h-4 text-white" />
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
        :value="modelValue.category"
        @change="update('category', ($event.target as HTMLSelectElement).value as NoteCategory)"
        class="w-full px-4 py-3 bg-white border-2 border-brain-900 text-sm font-mono font-bold text-brain-900 focus:outline-none focus:bg-brain-100 transition-colors cursor-pointer uppercase shadow-[2px_2px_0px_#111]"
      >
        <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ CATEGORY_LABELS[cat] }}</option>
      </select>
    </div>

    <!-- Status -->
    <div>
      <label class="flex items-center gap-2 text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest mb-3 bg-white border border-brain-900 w-fit px-2 py-1 shadow-[1px_1px_0px_#111]">
        Pipeline State
      </label>
      <select
        :value="modelValue.status"
        @change="update('status', ($event.target as HTMLSelectElement).value as NoteStatus)"
        class="w-full px-4 py-3 bg-white border-2 border-brain-900 text-sm font-mono font-bold text-brain-900 focus:outline-none focus:bg-brain-100 transition-colors cursor-pointer uppercase shadow-[2px_2px_0px_#111]"
      >
        <option v-for="s in STATUSES" :key="s" :value="s">{{ STATUS_LABELS[s] }}</option>
      </select>
    </div>

    <!-- Source -->
    <div>
      <label class="flex items-center gap-2 text-[10px] font-mono font-bold text-brain-900 uppercase tracking-widest mb-3 bg-white border border-brain-900 w-fit px-2 py-1 shadow-[1px_1px_0px_#111]">
        Source
      </label>
      <input
        :value="modelValue.source"
        @input="update('source', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="claude.ai/share/…, meeting note, …"
        class="w-full px-3 py-2.5 bg-white border-2 border-brain-900 text-xs font-mono text-brain-900 placeholder:text-brain-400 focus:outline-none focus:bg-brain-100 shadow-[2px_2px_0px_#111]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CATEGORIES, CATEGORY_LABELS, STATUSES, STATUS_LABELS } from '~/types'
import type { Entity, NoteCategory, NoteStatus } from '~/types'

export interface PropertiesForm {
  category: NoteCategory
  status: NoteStatus
  entityIds: string[]
  source: string
}

const props = defineProps<{
  modelValue: PropertiesForm
  entities: Entity[]
  entityError?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [v: PropertiesForm]
  'clear-entity-error': []
}>()

const update = <K extends keyof PropertiesForm>(key: K, value: PropertiesForm[K]) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const toggleEntity = (id: string) => {
  const ids = [...props.modelValue.entityIds]
  const idx = ids.indexOf(id)
  if (idx === -1) ids.push(id)
  else ids.splice(idx, 1)
  emit('update:modelValue', { ...props.modelValue, entityIds: ids })
  emit('clear-entity-error')
}
</script>
