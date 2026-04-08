<template>
    <div class="flex flex-col min-h-screen overflow-hidden bg-brain-50 font-sans">

        <!-- Architectural Grid Background -->
        <div class="absolute inset-0 z-0 pointer-events-none opacity-5"
            style="background-size: 24px 24px; background-image: linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px);">
        </div>

        <!-- Page header -->
        <div
            class="relative z-10 flex items-center justify-between px-6 py-4 border-b-2 border-brain-900 bg-white shrink-0">
            <div class="flex items-center gap-4">
                <button @click="isSidebarOpen = true"
                    class="md:hidden p-2 -ml-2 text-brain-900 hover:text-black hover:bg-brain-100 border-2 border-transparent transition-all">
                    <Icon name="lucide:menu" class="w-6 h-6" />
                </button>
                <div
                    class="hidden sm:flex w-12 h-12 bg-brain-900 border-2 border-brain-900 shadow-[2px_2px_0px_#111] items-center justify-center">
                    <Icon name="lucide:radar" class="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 class="text-2xl font-display font-bold text-brain-900 uppercase tracking-tighter">Topology Lab
                    </h2>
                    <p
                        class="text-[10px] font-mono text-brain-500 uppercase tracking-widest mt-1 pr-2 bg-brain-100 inline-block border border-brain-900 px-1">
                        Select Analysis Module</p>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="relative z-10 flex-1 overflow-auto flex items-center justify-center p-6 md:p-12">
            <div class="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">

                <!-- Module 1: Matrix -->
                <NuxtLink to="/graph/matrix"
                    class="group brutal-card bg-white border-2 border-brain-900 shadow-[4px_4px_0px_#111] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111] transition-all flex flex-col cursor-pointer overflow-hidden">
                    <div
                        class="h-48 bg-brain-100 border-b-2 border-brain-900 relative flex items-center justify-center overflow-hidden">
                        <!-- Decorative Matrix Background -->
                        <div class="absolute inset-0 opacity-20"
                            style="background-image: repeating-linear-gradient(0deg, transparent, transparent 19px, #111 19px, #111 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #111 19px, #111 20px); background-size: 20px 20px;">
                        </div>
                        <div
                            class="w-24 h-24 bg-brain-900 border-2 border-brain-900 shadow-[4px_4px_0px_#111] z-10 flex items-center justify-center transform group-hover:rotate-3 transition-transform">
                            <Icon name="lucide:grid-3x3" class="w-12 h-12 text-white" />
                        </div>
                    </div>
                    <div class="p-6 flex-1 flex flex-col">
                        <h3 class="text-2xl font-display font-bold text-brain-900 uppercase tracking-tighter mb-2">
                            Synergy Matrix</h3>
                        <p class="text-xs font-mono text-brain-500 leading-relaxed mb-6">Analyze complete network
                            adjacency and inter-entity overlap. Best for exact quantitative relationship mappings.</p>
                        <div
                            class="mt-auto flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-brain-900 border-t-2 border-brain-900 pt-4">
                            <span>Initialize Module</span>
                            <Icon name="lucide:arrow-right"
                                class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </NuxtLink>

                <!-- Module 2: Flow -->
                <NuxtLink to="/graph/flow"
                    class="group brutal-card bg-white border-2 border-brain-900 shadow-[4px_4px_0px_#111] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111] transition-all flex flex-col cursor-pointer overflow-hidden">
                    <div
                        class="h-48 bg-[#00E5FF] border-b-2 border-brain-900 relative flex items-center justify-center overflow-hidden">
                        <div class="absolute inset-0 opacity-20"
                            style="background-image: repeating-linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), repeating-linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111); background-position: 0 0, 10px 10px; background-size: 20px 20px;">
                        </div>
                        <div
                            class="w-24 h-24 bg-white border-2 border-brain-900 shadow-[4px_4px_0px_#111] z-10 flex items-center justify-center transform group-hover:-rotate-3 transition-transform">
                            <Icon name="lucide:arrow-right-left" class="w-12 h-12 text-brain-900" />
                        </div>
                    </div>
                    <div class="p-6 flex-1 flex flex-col">
                        <h3 class="text-2xl font-display font-bold text-brain-900 uppercase tracking-tighter mb-2">
                            Vector Flow</h3>
                        <p class="text-xs font-mono text-brain-500 leading-relaxed mb-6">View hierarchical volume
                            pipelines mapping sectors to operational pipelines. Best for state flow analysis.</p>
                        <div
                            class="mt-auto flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-brain-900 border-t-2 border-brain-900 pt-4">
                            <span>Initialize Module</span>
                            <Icon name="lucide:arrow-right"
                                class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </NuxtLink>

                <!-- Module 3: Volume -->
                <NuxtLink to="/graph/volume"
                    class="group brutal-card bg-white border-2 border-brain-900 shadow-[4px_4px_0px_#111] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111] transition-all flex flex-col cursor-pointer overflow-hidden">
                    <div
                        class="h-48 bg-[#FFDD00] border-b-2 border-brain-900 relative flex items-center justify-center overflow-hidden">
                        <div class="absolute inset-0 flex">
                            <div class="w-1/2 h-full border-r-2 border-brain-900 bg-white opacity-20"></div>
                            <div class="w-1/4 h-[40%] border-r-2 border-b-2 border-brain-900 bg-black opacity-10"></div>
                        </div>
                        <div
                            class="w-24 h-24 bg-white border-2 border-brain-900 shadow-[4px_4px_0px_#111] z-10 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                            <Icon name="lucide:bar-chart-2" class="w-12 h-12 text-brain-900" />
                        </div>
                    </div>
                    <div class="p-6 flex-1 flex flex-col">
                        <h3 class="text-2xl font-display font-bold text-brain-900 uppercase tracking-tighter mb-2">
                            Volume Treemap</h3>
                        <p class="text-xs font-mono text-brain-500 leading-relaxed mb-6">Visualize total data mass
                            clustered hierarchically. Best for identifying dominant categorical archives.</p>
                        <div
                            class="mt-auto flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-brain-900 border-t-2 border-brain-900 pt-4">
                            <span>Initialize Module</span>
                            <Icon name="lucide:arrow-right"
                                class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </NuxtLink>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
useHead({ title: 'Topology Lab — Archive' })
const isSidebarOpen = useState('sidebarOpen')
</script>
