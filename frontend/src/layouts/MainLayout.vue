<template>
  <div class="h-screen flex overflow-hidden bg-gray-900 text-gray-100">
    <!-- Sidebar -->
    <div class="flex flex-col w-64 border-r border-gray-800 bg-gray-900">
      <div class="flex items-center justify-between px-6 h-16 border-b border-gray-800">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <span class="text-lg font-bold text-white tracking-widest">BLACKBOX</span>
        </div>
        <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded border border-gray-700">v1.0</span>
      </div>

      <div class="flex flex-col flex-1 overflow-y-auto">
        <nav class="flex-1 px-3 py-4 space-y-1">
          <router-link to="/" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition" exact-active-class="bg-blue-600/20 text-blue-400 font-semibold border-l-2 border-blue-500">
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span>Command Center</span>
          </router-link>

          <router-link to="/cases" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition" exact-active-class="bg-blue-600/20 text-blue-400 font-semibold border-l-2 border-blue-500">
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <span>Cases & Ops</span>
          </router-link>

          <router-link to="/audit" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition" exact-active-class="bg-blue-600/20 text-blue-400 font-semibold border-l-2 border-blue-500">
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            <span>Audit Trail</span>
          </router-link>

          <router-link 
            v-if="authStore.user?.role === 'Admin'" 
            to="/admin" 
            class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition" 
            exact-active-class="bg-blue-600/20 text-blue-400 font-semibold border-l-2 border-blue-500"
          >
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>Admin Console</span>
          </router-link>
        </nav>
      </div>

      <!-- User Profile & Logout -->
      <div class="flex-shrink-0 flex border-t border-gray-800 p-4 bg-gray-950/40">
        <div class="flex-shrink-0 w-full block">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-blue-400">
              {{ (authStore.user?.name || authStore.user?.username || 'U').charAt(0).toUpperCase() }}
            </div>
            <div class="ml-3 overflow-hidden">
              <p class="text-sm font-medium text-white truncate">{{ authStore.user?.name || authStore.user?.username }}</p>
              <p class="text-xs text-gray-400">{{ authStore.user?.role }}</p>
            </div>
            <div class="ml-auto">
              <button @click="logout" class="text-xs text-gray-400 hover:text-rose-400 p-1 transition" title="Sign out">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <router-view></router-view>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
  router.push({ name: 'Login' });
};
</script>
