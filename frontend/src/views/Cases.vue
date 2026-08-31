<template>
  <div class="space-y-6">
    <!-- Top Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-wide">CASE REGISTRY & OPERATIONS</h1>
        <p class="text-gray-400 text-sm mt-1">Search, monitor, and manage open active investigations and intelligence files.</p>
      </div>
      <button 
        v-if="['Admin', 'Investigator'].includes(authStore.user?.role)" 
        @click="showCreateModal = true" 
        class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 shadow self-start md:self-auto"
      >
        <span>+ New Case</span>
      </button>
    </div>

    <!-- Search & Filter Controls -->
    <div class="bg-gray-800/80 p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row gap-3 items-center justify-between">
      <!-- Search Input -->
      <div class="w-full md:w-1/2 relative">
        <input 
          v-model="searchQuery" 
          @input="onSearchInput"
          type="text" 
          placeholder="Search by case title, ID, or description..." 
          class="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <svg class="w-4 h-4 text-gray-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        <!-- Status Filter -->
        <div class="flex items-center space-x-2">
          <label class="text-xs text-gray-400 uppercase font-semibold">Status:</label>
          <select 
            v-model="statusFilter" 
            @change="fetchCases(1)"
            class="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="REVIEW">REVIEW</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>

        <!-- Priority Filter -->
        <div class="flex items-center space-x-2">
          <label class="text-xs text-gray-400 uppercase font-semibold">Priority:</label>
          <select 
            v-model="priorityFilter" 
            @change="fetchCases(1)"
            class="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical (In Review)</option>
            <option value="HIGH">High (Investigating)</option>
            <option value="NORMAL">Normal</option>
          </select>
        </div>

        <!-- Reset Button -->
        <button 
          v-if="searchQuery || statusFilter || priorityFilter"
          @click="resetFilters" 
          class="text-xs text-gray-400 hover:text-white px-2 py-2 underline"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-16 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
      <svg class="animate-spin h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span class="text-sm">Fetching case dossiers...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="cases.length === 0" class="bg-gray-800/50 border border-dashed border-gray-700 rounded-lg p-12 text-center">
      <p class="text-gray-300 font-medium">No matching cases found.</p>
      <p class="text-gray-500 text-xs mt-1">Try adjusting your search criteria or create a new case.</p>
      <button 
        v-if="['Admin', 'Investigator'].includes(authStore.user?.role)" 
        @click="showCreateModal = true" 
        class="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium transition"
      >
        + Create New Case
      </button>
    </div>

    <!-- Case Grid -->
    <div v-else class="space-y-4">
      <div class="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="c in cases" 
          :key="c._id" 
          class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-5 flex flex-col justify-between hover:border-gray-600 transition"
        >
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <h2 class="text-base font-bold text-white tracking-wide line-clamp-1">
                {{ c.title }}
              </h2>
              <span :class="statusClass(c.status)" class="text-xs px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap">
                {{ c.status }}
              </span>
            </div>
            
            <p class="text-xs text-gray-400 line-clamp-3 mb-4 leading-relaxed">
              {{ c.description || 'No detailed scope provided.' }}
            </p>
          </div>

          <div class="pt-3 border-t border-gray-700/80 flex items-center justify-between text-xs">
            <div class="text-gray-400 font-mono text-[11px]">
              ID: <span class="text-gray-300">{{ c._id }}</span>
            </div>
            <router-link 
              :to="{ name: 'CaseDetail', params: { id: c._id } }" 
              class="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 px-3 py-1.5 rounded text-xs font-semibold transition"
            >
              Open Workspace →
            </router-link>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div class="bg-gray-800/80 border border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
        <div>
          Showing page <span class="font-bold text-white">{{ pagination.page }}</span> of <span class="font-bold text-white">{{ pagination.totalPages }}</span> (Total {{ pagination.total }} records)
        </div>
        <div class="flex space-x-2">
          <button 
            :disabled="pagination.page <= 1" 
            @click="fetchCases(pagination.page - 1)" 
            class="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-700 text-white rounded border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Previous
          </button>
          <button 
            :disabled="pagination.page >= pagination.totalPages" 
            @click="fetchCases(pagination.page + 1)" 
            class="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-700 text-white rounded border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    <!-- Create Case Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700 shadow-2xl">
        <h2 class="text-xl font-bold text-white mb-4">Create New Case</h2>
        <form @submit.prevent="createCase" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Title *</label>
            <input v-model="newCase.title" required type="text" placeholder="e.g. Operation Nightfall" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Description</label>
            <textarea v-model="newCase.description" rows="3" placeholder="Case scope and preliminary evidence overview..." class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"></textarea>
          </div>
          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-700">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
            <button type="submit" :disabled="creating" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition disabled:opacity-50">
              {{ creating ? 'Creating...' : 'Initialize Case' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { apiFetch } from '../utils/api';

const router = useRouter();
const authStore = useAuthStore();

const cases = ref([]);
const loading = ref(true);
const creating = ref(false);
const showCreateModal = ref(false);
const newCase = ref({ title: '', description: '' });

// Search, Filter, Pagination
const searchQuery = ref('');
const statusFilter = ref('');
const priorityFilter = ref('');
const pagination = ref({ page: 1, limit: 9, total: 0, totalPages: 1 });

let searchTimeout = null;
const onSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchCases(1);
  }, 300);
};

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  priorityFilter.value = '';
  fetchCases(1);
};

const fetchCases = async (page = 1) => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: '9'
    });
    if (searchQuery.value.trim()) params.append('search', searchQuery.value.trim());
    if (statusFilter.value) params.append('status', statusFilter.value);
    if (priorityFilter.value) params.append('priority', priorityFilter.value);

    const data = await apiFetch(`/api/cases?${params.toString()}`);
    if (data.success && Array.isArray(data.data)) {
      cases.value = data.data;
      if (data.pagination) {
        pagination.value = data.pagination;
      }
    }
  } catch (err) {
    console.error('Error loading cases:', err);
  } finally {
    loading.value = false;
  }
};

const createCase = async () => {
  if (!newCase.value.title.trim()) return;
  creating.value = true;
  try {
    const data = await apiFetch('/api/cases', {
      method: 'POST',
      body: JSON.stringify(newCase.value)
    });
    if (data.success && data.data) {
      showCreateModal.value = false;
      newCase.value = { title: '', description: '' };
      router.push({ name: 'CaseDetail', params: { id: data.data._id } });
    }
  } catch (err) {
    console.error('Error creating case:', err);
  } finally {
    creating.value = false;
  }
};

const statusClass = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-950 text-blue-300 border border-blue-800';
    case 'INVESTIGATING': return 'bg-amber-950 text-amber-300 border border-amber-800';
    case 'REVIEW': return 'bg-purple-950 text-purple-300 border border-purple-800';
    case 'RESOLVED': return 'bg-emerald-950 text-emerald-300 border border-emerald-800';
    case 'ARCHIVED': return 'bg-gray-800 text-gray-400 border border-gray-700';
    default: return 'bg-gray-800 text-gray-300 border border-gray-700';
  }
};

onMounted(() => {
  fetchCases(1);
});
</script>
