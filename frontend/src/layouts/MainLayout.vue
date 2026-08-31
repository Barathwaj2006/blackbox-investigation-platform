<template>
  <div class="h-screen flex overflow-hidden bg-[#090D16] text-slate-100 font-sans antialiased">
    <!-- Mobile Sidebar Backdrop -->
    <div 
      v-if="mobileMenuOpen" 
      @click="mobileMenuOpen = false"
      class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity"
    ></div>

    <!-- Sidebar (Desktop + Mobile Drawer) -->
    <aside 
      :class="[
        // Mobile positioning
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0B0F19] border-r border-slate-800/80 transition-all duration-200 ease-in-out md:static',
        mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0',
        // Desktop width
        isCollapsed ? 'md:w-18' : 'md:w-64'
      ]"
    >
      <!-- Sidebar Header / Brand -->
      <div class="flex items-center justify-between px-4 h-14 border-b border-slate-800/80 bg-[#0D1322]">
        <router-link to="/" class="flex items-center space-x-2.5 overflow-hidden group">
          <div class="w-8 h-8 rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-mono font-bold text-sm shadow-md shadow-blue-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
            <span>BB</span>
          </div>
          <div v-show="!isCollapsed || mobileMenuOpen" class="flex flex-col overflow-hidden transition-opacity duration-150">
            <div class="flex items-center space-x-1.5">
              <span class="text-sm font-extrabold tracking-widest text-white uppercase font-mono">BLACKBOX</span>
              <span class="text-[9px] font-mono px-1 py-0.2 bg-blue-950/80 text-blue-400 rounded border border-blue-800/50">v1.2</span>
            </div>
            <span class="text-[10px] text-slate-400 font-medium tracking-tight truncate">Intelligence Console</span>
          </div>
        </router-link>

        <!-- Mobile Close Button -->
        <button 
          @click="mobileMenuOpen = false" 
          class="md:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
          title="Close navigation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <!-- Desktop Collapse Button inside header when expanded -->
        <button 
          v-show="!isCollapsed" 
          @click="toggleSidebar"
          class="hidden md:flex items-center justify-center w-6 h-6 rounded text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          title="Collapse sidebar"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 py-3 px-2 overflow-y-auto space-y-1">
        <!-- Section: OPERATIONS -->
        <div v-show="!isCollapsed || mobileMenuOpen" class="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          Investigation
        </div>

        <!-- 1. Command Center -->
        <router-link 
          to="/" 
          @click="mobileMenuOpen = false"
          class="group relative flex items-center px-2.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          exact-active-class="bg-blue-600/15 text-blue-400 font-semibold border-l-2 border-blue-500"
        >
          <svg class="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-blue-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span v-show="!isCollapsed || mobileMenuOpen" class="ml-3 truncate">Command Center</span>
          
          <!-- Collapsed Tooltip -->
          <div 
            v-if="isCollapsed && !mobileMenuOpen"
            class="hidden md:group-hover:flex absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded shadow-xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none"
          >
            Command Center
          </div>
        </router-link>

        <!-- 2. Cases & Operations -->
        <router-link 
          to="/cases" 
          @click="mobileMenuOpen = false"
          class="group relative flex items-center px-2.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          exact-active-class="bg-blue-600/15 text-blue-400 font-semibold border-l-2 border-blue-500"
        >
          <svg class="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-blue-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          <span v-show="!isCollapsed || mobileMenuOpen" class="ml-3 truncate">Cases & Operations</span>

          <!-- Collapsed Tooltip -->
          <div 
            v-if="isCollapsed && !mobileMenuOpen"
            class="hidden md:group-hover:flex absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded shadow-xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none"
          >
            Cases & Operations
          </div>
        </router-link>

        <!-- 3. Audit Trail -->
        <router-link 
          to="/audit" 
          @click="mobileMenuOpen = false"
          class="group relative flex items-center px-2.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          exact-active-class="bg-blue-600/15 text-blue-400 font-semibold border-l-2 border-blue-500"
        >
          <svg class="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-blue-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <span v-show="!isCollapsed || mobileMenuOpen" class="ml-3 truncate">Audit Trail</span>

          <!-- Collapsed Tooltip -->
          <div 
            v-if="isCollapsed && !mobileMenuOpen"
            class="hidden md:group-hover:flex absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded shadow-xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none"
          >
            Audit Trail
          </div>
        </router-link>

        <!-- Section: OVERSIGHT -->
        <div v-if="authStore.user?.role === 'Admin'" v-show="!isCollapsed || mobileMenuOpen" class="px-2.5 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          Security & Admin
        </div>

        <!-- 4. Admin Console (Admin Only) -->
        <router-link 
          v-if="authStore.user?.role === 'Admin'"
          to="/admin" 
          @click="mobileMenuOpen = false"
          class="group relative flex items-center px-2.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          exact-active-class="bg-blue-600/15 text-blue-400 font-semibold border-l-2 border-blue-500"
        >
          <svg class="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-blue-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span v-show="!isCollapsed || mobileMenuOpen" class="ml-3 truncate">Admin Console</span>

          <!-- Collapsed Tooltip -->
          <div 
            v-if="isCollapsed && !mobileMenuOpen"
            class="hidden md:group-hover:flex absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded shadow-xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none"
          >
            Admin Console
          </div>
        </router-link>
      </div>

      <!-- Sidebar Footer: Collapse Toggle & User Profile -->
      <div class="border-t border-slate-800/80 p-2.5 bg-[#090D16]">
        <!-- Expand trigger button when collapsed on desktop -->
        <button 
          v-if="isCollapsed" 
          @click="toggleSidebar"
          class="hidden md:flex w-full items-center justify-center p-2 mb-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          title="Expand sidebar"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
          </svg>
        </button>

        <!-- User Information -->
        <div class="flex items-center justify-between">
          <div class="flex items-center min-w-0">
            <div 
              :class="userRoleAvatarClass" 
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono border flex-shrink-0 shadow-inner"
            >
              {{ userInitial }}
            </div>
            <div v-show="!isCollapsed || mobileMenuOpen" class="ml-2.5 min-w-0 flex-1">
              <p class="text-xs font-semibold text-white truncate">{{ authStore.user?.name || authStore.user?.username || 'Analyst' }}</p>
              <div class="flex items-center space-x-1">
                <span :class="roleBadgeClass" class="text-[9px] font-mono px-1 py-0.2 rounded font-bold uppercase">
                  {{ authStore.user?.role || 'User' }}
                </span>
              </div>
            </div>
          </div>

          <button 
            @click="logout" 
            class="text-slate-400 hover:text-rose-400 p-1.5 rounded hover:bg-slate-800/60 transition"
            title="Sign out of BlackBox"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Application Command Bar -->
      <header class="h-14 border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-10 flex-shrink-0">
        <!-- Left: Mobile Hamburger & Breadcrumb Navigation -->
        <div class="flex items-center space-x-3 min-w-0">
          <button 
            @click="mobileMenuOpen = true" 
            class="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 focus:outline-none"
            aria-label="Open Navigation"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <!-- Desktop Quick Sidebar Toggle -->
          <button 
            @click="toggleSidebar" 
            class="hidden md:flex text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800/60 transition"
            :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"></path>
            </svg>
          </button>

          <!-- Breadcrumb / Section Label -->
          <div class="flex items-center space-x-2 text-xs font-mono truncate">
            <span class="text-slate-500 font-bold uppercase tracking-wider">BLACKBOX</span>
            <span class="text-slate-600">/</span>
            <span class="text-slate-200 font-semibold tracking-wide uppercase">{{ currentSectionName }}</span>
          </div>
        </div>

        <!-- Right: Status Indicators & Quick Actions -->
        <div class="flex items-center space-x-3">
          <!-- Live System Telemetry Badge -->
          <div class="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[11px] font-mono font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SYSTEM ONLINE</span>
          </div>

          <!-- Quick Case Action Shortcut -->
          <router-link 
            to="/cases" 
            class="hidden sm:flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded transition"
          >
            <span>Dossiers</span>
          </router-link>

          <!-- User Role Tag -->
          <div class="flex items-center space-x-2 border-l border-slate-800 pl-3">
            <span class="text-xs text-slate-300 font-medium hidden md:inline truncate max-w-[120px]">
              {{ authStore.user?.name || authStore.user?.username }}
            </span>
            <span :class="roleBadgeClass" class="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase">
              {{ authStore.user?.role }}
            </span>
          </div>
        </div>
      </header>

      <!-- Scrollable Main Content -->
      <main class="flex-1 overflow-y-auto bg-[#090D16] p-4 sm:p-6 lg:p-8">
        <div class="max-w-7xl mx-auto">
          <router-view></router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Sidebar state
const isCollapsed = ref(false);
const mobileMenuOpen = ref(false);

onMounted(() => {
  const savedState = localStorage.getItem('blackbox_sidebar_collapsed');
  if (savedState !== null) {
    isCollapsed.value = savedState === 'true';
  }
});

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem('blackbox_sidebar_collapsed', String(isCollapsed.value));
};

const logout = () => {
  authStore.logout();
  router.push({ name: 'Login' });
};

const userInitial = computed(() => {
  const name = authStore.user?.name || authStore.user?.username || 'U';
  return name.charAt(0).toUpperCase();
});

const userRoleAvatarClass = computed(() => {
  const role = authStore.user?.role;
  if (role === 'Admin') return 'bg-purple-950/80 text-purple-400 border-purple-700/60';
  if (role === 'Investigator') return 'bg-blue-950/80 text-blue-400 border-blue-700/60';
  return 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60';
});

const roleBadgeClass = computed(() => {
  const role = authStore.user?.role;
  if (role === 'Admin') return 'bg-purple-950 text-purple-400 border border-purple-800';
  if (role === 'Investigator') return 'bg-blue-950 text-blue-400 border border-blue-800';
  return 'bg-emerald-950 text-emerald-400 border border-emerald-800';
});

const currentSectionName = computed(() => {
  const path = route.path;
  if (path === '/') return 'Command Center';
  if (path.startsWith('/cases/') && path !== '/cases') return 'Case Dossier';
  if (path.startsWith('/cases')) return 'Case Operations';
  if (path.startsWith('/audit')) return 'Audit Trail';
  if (path.startsWith('/admin')) return 'Admin Console';
  return 'Operations';
});
</script>

