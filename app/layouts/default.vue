<template>
  <div class="min-h-screen bg-brain-50 text-brain-900 font-sans flex">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-h-screen md:ml-64 min-w-0 bg-transparent relative">
      <!-- Grid pattern overlay for that architectural look -->
      <div class="absolute inset-0 z-0 pointer-events-none opacity-5" style="background-size: 24px 24px; background-image: linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px);"></div>
      
      <div class="relative z-10 flex-1 flex flex-col min-h-0">
        <slot />
      </div>
    </div>

    <!-- Capture Modal (global) -->
    <CaptureModal />
  </div>
</template>

<script setup lang="ts">
// Global state for mobile sidebar
useState('sidebarOpen', () => false)
</script>
