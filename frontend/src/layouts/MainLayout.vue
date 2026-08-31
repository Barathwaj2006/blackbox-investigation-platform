<template>
  <div class="h-screen flex overflow-hidden bg-gray-900 text-gray-100">
    <!-- Sidebar -->
    <div class="flex flex-col w-64 border-r border-gray-800 bg-gray-900">
      <div class="flex items-center justify-center h-16 border-b border-gray-800">
        <span class="text-xl font-bold text-white tracking-wider">BLACKBOX</span>
      </div>
      <div class="flex flex-col flex-1 overflow-y-auto">
        <nav class="flex-1 px-2 py-4 space-y-1">
          <router-link to="/" class="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800" exact-active-class="bg-gray-800 text-white border-l-2 border-blue-500">
            Dashboard
          </router-link>
          <router-link to="/cases" class="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800" exact-active-class="bg-gray-800 text-white border-l-2 border-blue-500">
            Cases
          </router-link>
          <router-link to="/audit" class="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800" exact-active-class="bg-gray-800 text-white border-l-2 border-blue-500">
            Audit
          </router-link>
        </nav>
      </div>
      <div class="flex-shrink-0 flex border-t border-gray-800 p-4">
        <div class="flex-shrink-0 w-full group block">
          <div class="flex items-center">
            <div class="ml-3">
              <p class="text-sm font-medium text-white">{{ authStore.user?.name }}</p>
              <p class="text-xs font-medium text-gray-400 group-hover:text-gray-300">{{ authStore.user?.role }}</p>
            </div>
            <div class="ml-auto">
              <button @click="logout" class="text-gray-400 hover:text-white">
                Logout
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
