<template>
  <div class="h-screen flex overflow-hidden bg-charcoal-900 text-gray-300 font-sans selection:bg-electric selection:text-white">
    
    <!-- LEFT: Sidebar -->
    <div class="flex flex-col w-64 border-r border-charcoal-700 bg-charcoal-800 shrink-0 shadow-2xl z-20 transition-all duration-300 hidden md:flex">
      <div class="flex items-center px-6 h-16 border-b border-charcoal-700">
        <span class="text-sm font-bold text-white tracking-widest uppercase">BLACKBOX</span>
      </div>
      
      <div class="flex flex-col flex-1 overflow-y-auto py-8 px-4 space-y-10">
        
        <div>
          <h3 class="px-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Command Center</h3>
          <router-link to="/" class="group flex items-center px-3 py-2 text-sm font-medium rounded hover:bg-charcoal-700 transition-colors" exact-active-class="bg-charcoal-700 text-white border-l-2 border-electric">
            <span class="w-5 h-5 mr-3 flex items-center justify-center opacity-70 group-hover:opacity-100 text-electric">▣</span>
            Intelligence
          </router-link>
        </div>

        <div>
          <h3 class="px-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Investigations</h3>
          <router-link to="/cases" class="group flex items-center px-3 py-2 text-sm font-medium rounded hover:bg-charcoal-700 transition-colors" active-class="bg-charcoal-700 text-white border-l-2 border-electric">
            <span class="w-5 h-5 mr-3 flex items-center justify-center opacity-70 group-hover:opacity-100 text-electric">⌂</span>
            Registry
          </router-link>
        </div>

        <div>
          <h3 class="px-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Activity</h3>
          <router-link to="/audit" class="group flex items-center px-3 py-2 text-sm font-medium rounded hover:bg-charcoal-700 transition-colors" exact-active-class="bg-charcoal-700 text-white border-l-2 border-electric">
            <span class="w-5 h-5 mr-3 flex items-center justify-center opacity-70 group-hover:opacity-100 text-electric">◈</span>
            System Log
          </router-link>
        </div>

      </div>
    </div>

    <!-- MAIN AREA -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden bg-charcoal-900 relative">
      
      <!-- TOP: Command Bar -->
      <header class="h-16 border-b border-charcoal-700 bg-charcoal-900 flex items-center justify-between px-6 lg:px-10 shrink-0 z-10 shadow-sm">
        <div class="flex items-center space-x-4">
           <button class="md:hidden text-gray-400 hover:text-white">☰</button>
           <span class="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{{ currentRouteName }}</span>
        </div>
        <div class="flex items-center space-x-6 text-sm">
          <div class="hidden sm:flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full bg-verified animate-pulse"></span>
            <span class="text-gray-500 text-[10px] uppercase font-mono tracking-widest">Sys.Nominal</span>
          </div>
          <div class="hidden sm:block h-4 w-px bg-charcoal-700"></div>
          <div class="flex items-center">
            <span class="text-white text-xs font-bold mr-3">{{ authStore.user?.username }}</span>
            <span class="text-[9px] font-bold uppercase tracking-widest text-electric border border-electric/30 bg-electric/10 px-2 py-0.5 rounded">{{ authStore.user?.role }}</span>
            <button @click="logout" class="ml-6 text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <!-- CENTER: Workspace -->
      <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none scrollbar-hide px-4 lg:px-10 py-8">
        <router-view></router-view>
      </main>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
  router.push({ name: 'Login' });
};

const currentRouteName = computed(() => {
  return route.name ? route.name.toUpperCase() : 'WORKSPACE';
});
</script>
