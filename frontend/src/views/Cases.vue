<template>
  <div class="space-y-6">
    <!-- Top Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
      <div>
        <div class="flex items-center space-x-3">
          <h1 class="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-mono">CASE REGISTRY & OPERATIONS</h1>
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {{ pagination.total }} RECORDS
          </span>
        </div>
        <p class="text-slate-400 text-xs sm:text-sm mt-0.5">Search, monitor, and manage open active investigations and intelligence files.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2 self-start md:self-auto">
        <button 
          v-if="['Admin', 'Investigator'].includes(authStore.user?.role)" 
          @click="showCreateModal = true" 
          class="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center space-x-1.5 shadow-md shadow-blue-900/30 active:scale-95"
        >
          <span>+ Initialize Case</span>
        </button>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800/90 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
      <!-- Search Input -->
      <div class="w-full md:w-1/2 relative">
        <input 
          v-model="searchQuery" 
          @input="onSearchInput"
          type="text" 
          placeholder="Filter by case title, UUID, or scope..." 
          class="w-full bg-[#0D1322] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
        />
        <svg class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
        <!-- Quick Review Queue Shortcut -->
        <button 
          @click="statusFilter = statusFilter === 'REVIEW' ? '' : 'REVIEW'; fetchCases(1)"
          :class="statusFilter === 'REVIEW' ? 'bg-purple-600 text-white font-bold' : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900 border border-purple-800/60'"
          class="text-xs px-2.5 py-1.5 rounded-lg font-mono transition flex items-center space-x-1"
          title="Filter to cases awaiting Reviewer evaluation"
        >
          <span>⚡ Review Queue</span>
        </button>

        <!-- Status Filter -->
        <div class="flex items-center space-x-1.5">
          <label class="text-[10px] text-slate-400 uppercase font-mono font-bold">Status:</label>
          <select 
            v-model="statusFilter" 
            @change="fetchCases(1)"
            class="bg-[#0D1322] border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          >
            <option value="">ALL STATUSES</option>
            <option value="DRAFT">DRAFT</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="REVIEW">REVIEW</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>

        <!-- Priority Filter -->
        <div class="flex items-center space-x-1.5">
          <label class="text-[10px] text-slate-400 uppercase font-mono font-bold">Priority:</label>
          <select 
            v-model="priorityFilter" 
            @change="fetchCases(1)"
            class="bg-[#0D1322] border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          >
            <option value="">ALL PRIORITIES</option>
            <option value="CRITICAL">Critical (In Review)</option>
            <option value="HIGH">High (Investigating)</option>
            <option value="NORMAL">Normal</option>
          </select>
        </div>

        <!-- Reset Button -->
        <button 
          v-if="searchQuery || statusFilter || priorityFilter"
          @click="resetFilters" 
          class="text-xs text-slate-400 hover:text-white px-2 py-1 underline font-mono"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-20 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
      <div class="w-7 h-7 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
      <span class="text-xs font-mono text-slate-400">Fetching case dossiers...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="cases.length === 0" class="bg-[#0B0F19] border border-dashed border-slate-800 rounded-xl p-12 text-center">
      <p class="text-slate-300 font-medium text-sm">No matching cases found.</p>
      <p class="text-slate-500 text-xs mt-1">Try adjusting your search criteria or initialize a new case dossier.</p>
      <button 
        v-if="['Admin', 'Investigator'].includes(authStore.user?.role)" 
        @click="showCreateModal = true" 
        class="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition shadow-md shadow-blue-900/30"
      >
        + Initialize Case
      </button>
    </div>

    <!-- Case Grid -->
    <div v-else class="space-y-4">
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="c in cases" 
          :key="c._id" 
          class="bg-[#0B0F19] rounded-xl border border-slate-800/90 p-4 flex flex-col justify-between hover:border-slate-700 hover:bg-[#0D1322] transition shadow-sm group"
        >
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <router-link :to="{ name: 'CaseDetail', params: { id: c._id } }" class="text-sm font-bold text-white tracking-wide line-clamp-1 group-hover:text-blue-400 transition">
                {{ c.title }}
              </router-link>
              <span :class="statusClass(c.status)" class="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase whitespace-nowrap">
                {{ c.status }}
              </span>
            </div>
            
            <p class="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
              {{ c.description || 'No technical scope provided.' }}
            </p>
          </div>

          <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div class="text-slate-500 font-mono text-[10px] truncate max-w-[150px]">
              UUID: <span class="text-slate-400 font-bold">{{ c._id.substring(0, 8) }}...</span>
            </div>
            <router-link 
              :to="{ name: 'CaseDetail', params: { id: c._id } }" 
              class="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 px-2.5 py-1 rounded text-xs font-semibold transition"
            >
              Open Dossier →
            </router-link>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div class="bg-[#0B0F19] border border-slate-800/90 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div>
          Showing page <span class="font-bold text-white">{{ pagination.page }}</span> of <span class="font-bold text-white">{{ pagination.totalPages }}</span> (Total {{ pagination.total }} cases)
        </div>
        <div class="flex space-x-2">
          <button 
            :disabled="pagination.page <= 1" 
            @click="fetchCases(pagination.page - 1)" 
            class="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Previous
          </button>
          <button 
            :disabled="pagination.page >= pagination.totalPages" 
            @click="fetchCases(pagination.page + 1)" 
            class="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    <!-- Create Case Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div class="bg-[#0B0F19] p-6 rounded-xl max-w-md w-full border border-slate-700/80 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 class="text-base font-bold text-white font-mono uppercase tracking-wide">Initialize Case Dossier</h2>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-white p-1 rounded">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form @submit.prevent="createCase" class="space-y-4">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-mono">Title *</label>
            <input v-model="newCase.title" required type="text" placeholder="e.g. Incident 2026-X: Operational Infiltration" class="w-full bg-[#0D1322] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono">
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-mono">Investigation Scope</label>
            <textarea v-model="newCase.description" rows="3" placeholder="Case scope and preliminary evidence overview..." class="w-full bg-[#0D1322] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <div class="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <button type="button" @click="showCreateModal = false" class="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg transition">Cancel</button>
            <button type="submit" :disabled="creating" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 shadow-md shadow-blue-900/30">
              {{ creating ? 'Initializing...' : 'Initialize Case' }}
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
    case 'OPEN': return 'bg-blue-950/80 text-blue-400 border border-blue-800';
    case 'INVESTIGATING': return 'bg-amber-950/80 text-amber-400 border border-amber-800';
    case 'REVIEW': return 'bg-purple-950/80 text-purple-400 border border-purple-800';
    case 'RESOLVED': return 'bg-emerald-950/80 text-emerald-400 border border-emerald-800';
    case 'ARCHIVED': return 'bg-slate-800 text-slate-400 border border-slate-700';
    default: return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
};

onMounted(() => {
  fetchCases(1);
});
</script>

