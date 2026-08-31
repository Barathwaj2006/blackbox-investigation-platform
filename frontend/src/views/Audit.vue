<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
      <div>
        <div class="flex items-center space-x-3">
          <h1 class="text-2xl font-bold text-white tracking-wide">SYSTEM AUDIT TRAIL</h1>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            IMMUTABLE LOG
          </span>
        </div>
        <p class="text-gray-400 text-sm mt-1">Tamper-evident operational event log tracking every case modification, evidence verification, and scoring calculation.</p>
      </div>

      <button 
        @click="fetchLogs(1)" 
        :disabled="loading"
        class="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2 self-start md:self-auto"
      >
        <svg :class="{ 'animate-spin': loading }" class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <span>Refresh Feed</span>
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
          placeholder="Search by actor, action type, target ID, or keyword..." 
          class="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <svg class="w-4 h-4 text-gray-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        <!-- Action Filter -->
        <div class="flex items-center space-x-2">
          <label class="text-xs text-gray-400 uppercase font-semibold">Action:</label>
          <select 
            v-model="actionFilter" 
            @change="fetchLogs(1)"
            class="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Actions</option>
            <option value="CREATE_CASE">CREATE_CASE</option>
            <option value="UPDATE_CASE_STATUS">UPDATE_CASE_STATUS</option>
            <option value="ADD_EVIDENCE">ADD_EVIDENCE</option>
            <option value="VERIFY_EVIDENCE">VERIFY_EVIDENCE</option>
            <option value="CREATE_HYPOTHESIS">CREATE_HYPOTHESIS</option>
            <option value="ADD_EVIDENCE_RELATIONSHIP">ADD_EVIDENCE_RELATIONSHIP</option>
          </select>
        </div>

        <!-- Entity Type Filter -->
        <div class="flex items-center space-x-2">
          <label class="text-xs text-gray-400 uppercase font-semibold">Target Entity:</label>
          <select 
            v-model="entityFilter" 
            @change="fetchLogs(1)"
            class="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Entities</option>
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
          class="text-xs text-gray-400 hover:text-white px-2 py-2 underline"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg">
      <div v-if="loading" class="py-16 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
        <svg class="animate-spin h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span class="text-sm">Fetching audit trail records...</span>
      </div>

      <div v-else-if="logs.length === 0" class="py-12 text-center text-gray-400 text-sm">
        No audit events matching current criteria.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-700">
          <thead class="bg-gray-900/90 text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-3.5 text-left">Timestamp</th>
              <th class="px-6 py-3.5 text-left">Actor</th>
              <th class="px-6 py-3.5 text-left">Action</th>
              <th class="px-6 py-3.5 text-left">Target Entity</th>
              <th class="px-6 py-3.5 text-left">Mutation Context / Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700/60 text-sm">
            <tr v-for="log in logs" :key="log._id" class="hover:bg-gray-750 transition">
              <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                {{ formatDateTime(log.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-white">{{ log.user?.name || log.user?.username || 'Agent' }}</div>
                <div class="text-xs text-gray-400 font-mono">{{ log.user?.role || 'System' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="actionBadgeClass(log.action)" class="text-xs px-2.5 py-1 rounded-full font-semibold font-mono">
                  {{ log.action }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-300">
                <div class="font-semibold text-gray-200">{{ log.entityType }}</div>
                <div class="font-mono text-gray-500 text-[11px]">ID: {{ log.entityId }}</div>
              </td>
              <td class="px-6 py-4 text-xs text-gray-300 max-w-md">
                <div class="bg-gray-900/70 p-2.5 rounded border border-gray-700/60 font-mono text-[11px] overflow-x-auto text-gray-300">
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
                  <span class="text-gray-500 block truncate">{{ JSON.stringify(log.details) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div v-if="pagination.totalPages > 1 || pagination.total > 0" class="bg-gray-900/80 px-6 py-3.5 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
        <div>
          Showing page <span class="font-bold text-white">{{ pagination.page }}</span> of <span class="font-bold text-white">{{ pagination.totalPages }}</span> (Total {{ pagination.total }} audit entries)
        </div>
        <div class="flex space-x-2">
          <button 
            :disabled="pagination.page <= 1" 
            @click="fetchLogs(pagination.page - 1)" 
            class="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Previous
          </button>
          <button 
            :disabled="pagination.page >= pagination.totalPages" 
            @click="fetchLogs(pagination.page + 1)" 
            class="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
  if (action?.includes('VERIFY')) return 'bg-emerald-950 text-emerald-300 border border-emerald-800';
  if (action?.includes('RELATIONSHIP')) return 'bg-indigo-950 text-indigo-300 border border-indigo-800';
  if (action?.includes('HYPOTHESIS')) return 'bg-purple-950 text-purple-300 border border-purple-800';
  if (action?.includes('EVIDENCE')) return 'bg-blue-950 text-blue-300 border border-blue-800';
  if (action?.includes('STATUS')) return 'bg-amber-950 text-amber-300 border border-amber-800';
  return 'bg-gray-800 text-gray-300 border border-gray-700';
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString();
};

onMounted(() => {
  fetchLogs(1);
});
</script>
