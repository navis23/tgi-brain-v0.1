<template>
  <div class="min-h-screen bg-brain-950 text-brain-100 font-sans flex">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-h-screen md:ml-60 min-w-0">
      <slot />
    </div>

    <!-- Capture Modal (global) -->
    <CaptureModal />
  </div>
</template>

<script setup lang="ts">
// Global state for mobile sidebar
useState('sidebarOpen', () => false)
</script>
