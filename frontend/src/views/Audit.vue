<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
      <div>
        <div class="flex items-center space-x-3">
          <h1 class="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-mono">SYSTEM AUDIT TRAIL</h1>
          <span class="inline-flex items-center px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[11px] font-mono font-bold tracking-wider">
            IMMUTABLE LOG
          </span>
        </div>
        <p class="text-slate-400 text-xs sm:text-sm mt-0.5">Tamper-evident operational event log tracking every case modification, evidence verification, and scoring calculation.</p>
      </div>

      <button 
        @click="fetchLogs(1)" 
        :disabled="loading"
        class="bg-[#0B0F19] hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center space-x-2 self-start md:self-auto shadow-sm"
      >
        <svg :class="{ 'animate-spin': loading }" class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <span>Refresh Feed</span>
      </button>
    </div>

    <!-- Search & Filter Controls -->
    <div class="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800/90 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
      <!-- Search Input -->
      <div class="w-full md:w-1/2 relative">
        <input 
          v-model="searchQuery" 
          @input="onSearchInput"
          type="text" 
          placeholder="Filter by actor, action type, target ID, or keyword..." 
          class="w-full bg-[#0D1322] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
        />
        <svg class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
        <!-- Action Filter -->
        <div class="flex items-center space-x-1.5">
          <label class="text-[10px] text-slate-400 uppercase font-mono font-bold">Action:</label>
          <select 
            v-model="actionFilter" 
            @change="fetchLogs(1)"
            class="bg-[#0D1322] border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          >
            <option value="">ALL ACTIONS</option>
            <option value="CREATE_CASE">CREATE_CASE</option>
            <option value="UPDATE_CASE_STATUS">UPDATE_CASE_STATUS</option>
            <option value="ADD_EVIDENCE">ADD_EVIDENCE</option>
            <option value="VERIFY_EVIDENCE">VERIFY_EVIDENCE</option>
            <option value="CREATE_HYPOTHESIS">CREATE_HYPOTHESIS</option>
            <option value="ADD_EVIDENCE_RELATIONSHIP">ADD_EVIDENCE_RELATIONSHIP</option>
          </select>
        </div>

        <!-- Entity Type Filter -->
        <div class="flex items-center space-x-1.5">
          <label class="text-[10px] text-slate-400 uppercase font-mono font-bold">Target:</label>
          <select 
            v-model="entityFilter" 
            @change="fetchLogs(1)"
            class="bg-[#0D1322] border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          >
            <option value="">ALL ENTITIES</option>
            <option value="Case">Case</option>
            <option value="Evidence">Evidence</option>
            <option value="Hypothesis">Hypothesis</option>
            <option value="EvidenceRelationship">EvidenceRelationship</option>
          </select>
        </div>

        <!-- Reset Button -->
        <button 
          v-if="searchQuery || actionFilter || entityFilter"
          @click="resetFilters" 
          class="text-xs text-slate-400 hover:text-white px-2 py-1 underline font-mono"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="bg-[#0B0F19] rounded-xl border border-slate-800/90 overflow-hidden shadow-sm">
      <div v-if="loading" class="py-20 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
        <div class="w-7 h-7 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
        <span class="text-xs font-mono text-slate-400">Fetching audit trail records...</span>
      </div>

      <div v-else-if="logs.length === 0" class="py-12 text-center text-slate-500 text-xs font-mono">
        No audit events matching current criteria.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-800">
          <thead class="bg-[#0D1322] text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            <tr>
              <th class="px-5 py-3 text-left">Timestamp</th>
              <th class="px-5 py-3 text-left">Actor</th>
              <th class="px-5 py-3 text-left">Action</th>
              <th class="px-5 py-3 text-left">Target Entity</th>
              <th class="px-5 py-3 text-left">Mutation Context / Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-850 text-xs">
            <tr v-for="log in logs" :key="log._id" class="hover:bg-slate-900/60 transition">
              <td class="px-5 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                {{ formatDateTime(log.createdAt) }}
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap">
                <div class="font-bold text-white text-xs">{{ log.user?.name || log.user?.username || 'Agent' }}</div>
                <div class="text-[10px] text-slate-400 font-mono">{{ log.user?.role || 'System' }}</div>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap">
                <span :class="actionBadgeClass(log.action)" class="text-[10px] px-2 py-0.5 rounded font-bold font-mono uppercase">
                  {{ log.action }}
                </span>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap text-slate-300">
                <div class="font-bold text-slate-200">{{ log.entityType }}</div>
                <div class="font-mono text-slate-500 text-[10px]">ID: {{ log.entityId?.substring(0, 8) }}...</div>
              </td>
              <td class="px-5 py-3.5 text-slate-300 max-w-md">
                <div class="bg-[#0D1322] p-2 rounded-lg border border-slate-800 font-mono text-[10px] overflow-x-auto text-slate-300">
                  <span v-if="log.details?.title" class="text-blue-300 font-semibold block mb-0.5">Title: "{{ log.details.title }}"</span>
                  <span v-if="log.details?.oldState && log.details?.newState" class="text-amber-300 font-semibold block mb-0.5">
                    State: {{ log.details.oldState }} → {{ log.details.newState }}
                  </span>
                  <span v-if="log.details?.oldStatus && log.details?.newStatus" class="text-purple-300 font-semibold block mb-0.5">
                    Status: {{ log.details.oldStatus }} → {{ log.details.newStatus }}
                  </span>
                  <span v-if="log.details?.type && log.details?.strength" class="text-emerald-300 font-semibold block mb-0.5">
                    Link: {{ log.details.type }} (Strength: {{ log.details.strength }})
                  </span>
                  <span class="text-slate-500 block truncate">{{ JSON.stringify(log.details) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div v-if="pagination.totalPages > 1 || pagination.total > 0" class="bg-[#0D1322] px-5 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div>
          Showing page <span class="font-bold text-white">{{ pagination.page }}</span> of <span class="font-bold text-white">{{ pagination.totalPages }}</span> (Total {{ pagination.total }} audit entries)
        </div>
        <div class="flex space-x-2">
          <button 
            :disabled="pagination.page <= 1" 
            @click="fetchLogs(pagination.page - 1)" 
            class="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Previous
          </button>
          <button 
            :disabled="pagination.page >= pagination.totalPages" 
            @click="fetchLogs(pagination.page + 1)" 
            class="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiFetch } from '../utils/api';

const logs = ref([]);
const loading = ref(true);

const searchQuery = ref('');
const actionFilter = ref('');
const entityFilter = ref('');
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 });

let searchTimeout = null;
const onSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchLogs(1);
  }, 300);
};

const resetFilters = () => {
  searchQuery.value = '';
  actionFilter.value = '';
  entityFilter.value = '';
  fetchLogs(1);
};

const fetchLogs = async (page = 1) => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: '10'
    });
    if (searchQuery.value.trim()) params.append('search', searchQuery.value.trim());
    if (actionFilter.value) params.append('action', actionFilter.value);
    if (entityFilter.value) params.append('entityType', entityFilter.value);

    const data = await apiFetch(`/api/audit?${params.toString()}`);
    if (data.success && Array.isArray(data.data)) {
      logs.value = data.data;
      if (data.pagination) {
        pagination.value = data.pagination;
      }
    }
  } catch (err) {
    console.error('Error fetching audit logs:', err);
  } finally {
    loading.value = false;
  }
};

const actionBadgeClass = (action) => {
  if (action?.includes('VERIFY')) return 'bg-emerald-950/80 text-emerald-300 border border-emerald-800';
  if (action?.includes('RELATIONSHIP')) return 'bg-indigo-950/80 text-indigo-300 border border-indigo-800';
  if (action?.includes('HYPOTHESIS')) return 'bg-purple-950/80 text-purple-300 border border-purple-800';
  if (action?.includes('EVIDENCE')) return 'bg-blue-950/80 text-blue-300 border border-blue-800';
  if (action?.includes('STATUS')) return 'bg-amber-950/80 text-amber-300 border border-amber-800';
  return 'bg-slate-800 text-slate-300 border border-slate-700';
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString();
};

onMounted(() => {
  fetchLogs(1);
});
</script>

