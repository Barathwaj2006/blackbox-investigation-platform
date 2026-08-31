<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
      <div>
        <div class="flex items-center space-x-3">
          <h1 class="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-mono">ADMIN CONSOLE</h1>
          <span class="inline-flex items-center px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/60 text-[11px] font-mono font-bold tracking-wider">
            SYSTEM CONTROL
          </span>
        </div>
        <p class="text-slate-400 text-xs sm:text-sm mt-0.5">Platform user surveillance, role-based access monitoring, and case operational metrics.</p>
      </div>

      <!-- Admin Tabs -->
      <div class="flex bg-[#0B0F19] p-1 rounded-lg border border-slate-800 self-start md:self-auto shadow-sm">
        <button 
          @click="activeTab = 'users'" 
          :class="[activeTab === 'users' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200', 'px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition font-mono uppercase']"
        >
          User Monitoring
        </button>
        <button 
          @click="activeTab = 'cases'" 
          :class="[activeTab === 'cases' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200', 'px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition font-mono uppercase']"
        >
          Case Oversight
        </button>
      </div>
    </div>

    <!-- Unauthorized Banner if not admin -->
    <div v-if="authStore.user?.role !== 'Admin'" class="bg-rose-950/40 border border-rose-800/80 text-rose-200 p-8 rounded-xl text-center shadow-sm">
      <h2 class="text-base font-bold font-mono uppercase">Access Restricted</h2>
      <p class="text-xs mt-1 text-rose-300">You must possess the Administrator role to access system user management and case oversight.</p>
      <router-link to="/" class="mt-4 inline-block bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition">Return to Dashboard</router-link>
    </div>

    <div v-else>
      <!-- TAB 1: USER MONITORING -->
      <div v-if="activeTab === 'users'" class="space-y-4">
        <!-- Filter and Search Bar -->
        <div class="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800/90 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
          <div class="w-full md:w-1/2 relative">
            <input 
              v-model="userSearch" 
              @input="onUserSearchInput"
              type="text" 
              placeholder="Search users by name or username..." 
              class="w-full bg-[#0D1322] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <svg class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          <div class="flex items-center space-x-2 w-full md:w-auto justify-end">
            <label class="text-[10px] text-slate-400 font-bold uppercase font-mono">Role:</label>
            <select 
              v-model="userRoleFilter" 
              @change="fetchUsers(1)"
              class="bg-[#0D1322] border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            >
              <option value="">ALL ROLES</option>
              <option value="Admin">Admin</option>
              <option value="Investigator">Investigator</option>
              <option value="Reviewer">Reviewer</option>
            </select>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-[#0B0F19] rounded-xl border border-slate-800/90 overflow-hidden shadow-sm">
          <div v-if="usersLoading" class="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <div class="w-7 h-7 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
            <span class="text-xs font-mono text-slate-400">Loading user registries...</span>
          </div>
          <div v-else-if="users.length === 0" class="py-12 text-center text-slate-500 text-xs font-mono">No users match the specified criteria.</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-800">
              <thead class="bg-[#0D1322] text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                <tr>
                  <th class="px-5 py-3 text-left">User Identity</th>
                  <th class="px-5 py-3 text-left">Role</th>
                  <th class="px-5 py-3 text-left">Status</th>
                  <th class="px-5 py-3 text-left">Cases Created</th>
                  <th class="px-5 py-3 text-left">Audit Events</th>
                  <th class="px-5 py-3 text-left">Registered Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-850 text-xs">
                <tr v-for="u in users" :key="u._id" class="hover:bg-slate-900/60 transition">
                  <td class="px-5 py-3.5 whitespace-nowrap">
                    <div class="font-bold text-white">{{ u.name }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">@{{ u.username }}</div>
                  </td>
                  <td class="px-5 py-3.5 whitespace-nowrap">
                    <span :class="roleBadgeClass(u.role)" class="text-[10px] px-2 py-0.5 rounded font-bold font-mono uppercase">
                      {{ u.role }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 whitespace-nowrap">
                    <span class="inline-flex items-center text-xs text-emerald-400 font-mono font-semibold">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
                      ACTIVE
                    </span>
                  </td>
                  <td class="px-5 py-3.5 whitespace-nowrap font-mono text-slate-200 font-bold">
                    {{ u.caseCount || 0 }}
                  </td>
                  <td class="px-5 py-3.5 whitespace-nowrap font-mono text-slate-200 font-bold">
                    {{ u.activityCount || 0 }}
                  </td>
                  <td class="px-5 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                    {{ formatDate(u.createdAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div v-if="userPagination.totalPages > 1" class="bg-[#0D1322] px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div>
              Showing page <span class="font-bold text-white">{{ userPagination.page }}</span> of <span class="font-bold text-white">{{ userPagination.totalPages }}</span> ({{ userPagination.total }} users)
            </div>
            <div class="flex space-x-2">
              <button 
                :disabled="userPagination.page <= 1" 
                @click="fetchUsers(userPagination.page - 1)" 
                class="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button 
                :disabled="userPagination.page >= userPagination.totalPages" 
                @click="fetchUsers(userPagination.page + 1)" 
                class="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: CASE OVERSIGHT / MONITORING -->
      <div v-if="activeTab === 'cases'" class="space-y-6">
        <div v-if="caseOversightLoading" class="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div class="w-7 h-7 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
          <span class="text-xs font-mono text-slate-400">Aggregating case oversight metrics...</span>
        </div>
        <div v-else-if="caseOversight" class="space-y-6">
          <!-- Overview Cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div class="bg-[#0B0F19] border border-slate-800/90 rounded-xl p-4 shadow-sm">
              <div class="text-[11px] text-slate-400 font-bold uppercase font-mono">Total Operations</div>
              <div class="text-2xl font-black font-mono text-white mt-1">{{ caseOversight.totalCases }}</div>
            </div>
            <div class="bg-[#0B0F19] border border-amber-900/30 rounded-xl p-4 shadow-sm">
              <div class="text-[11px] text-amber-400 font-bold uppercase font-mono">Active Cases</div>
              <div class="text-2xl font-black font-mono text-amber-400 mt-1">{{ caseOversight.activeCases }}</div>
            </div>
            <div class="bg-[#0B0F19] border border-purple-900/30 rounded-xl p-4 shadow-sm">
              <div class="text-[11px] text-purple-400 font-bold uppercase font-mono">In Review</div>
              <div class="text-2xl font-black font-mono text-purple-400 mt-1">{{ caseOversight.statusCounts?.REVIEW || 0 }}</div>
            </div>
            <div class="bg-[#0B0F19] border border-emerald-900/30 rounded-xl p-4 shadow-sm">
              <div class="text-[11px] text-emerald-400 font-bold uppercase font-mono">Resolved</div>
              <div class="text-2xl font-black font-mono text-emerald-400 mt-1">{{ caseOversight.statusCounts?.RESOLVED || 0 }}</div>
            </div>
          </div>

          <!-- High-Priority Cases & Activity Feed -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- High Priority Cases -->
            <div class="bg-[#0B0F19] rounded-xl border border-slate-800/90 p-5 shadow-sm">
              <h2 class="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-4 flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span>Critical / High Priority Investigations</span>
                <span class="text-[10px] bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded border border-rose-800 font-mono font-bold">
                  {{ caseOversight.highPriorityCases?.length || 0 }} Escalated
                </span>
              </h2>

              <div v-if="!caseOversight.highPriorityCases || caseOversight.highPriorityCases.length === 0" class="py-8 text-center text-slate-500 text-xs font-mono">
                No critical cases pending at this time.
              </div>
              <div v-else class="space-y-2.5">
                <div v-for="c in caseOversight.highPriorityCases" :key="c._id" class="bg-[#0D1322] border border-slate-800/80 p-3 rounded-lg flex items-center justify-between hover:border-slate-700 transition">
                  <div>
                    <router-link :to="{ name: 'CaseDetail', params: { id: c._id } }" class="text-xs font-bold text-white hover:text-blue-400 transition line-clamp-1">
                      {{ c.title }}
                    </router-link>
                    <div class="text-[10px] text-slate-400 mt-0.5 font-mono">Lead: {{ c.createdBy }} • Updated: {{ formatDate(c.updatedAt || c.createdAt) }}</div>
                  </div>
                  <span :class="c.priority === 'CRITICAL' ? 'bg-rose-950/80 text-rose-300 border-rose-800' : 'bg-amber-950/80 text-amber-300 border-amber-800'" class="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border whitespace-nowrap ml-2">
                    {{ c.priority }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Recent Case Activity -->
            <div class="bg-[#0B0F19] rounded-xl border border-slate-800/90 p-5 shadow-sm">
              <h2 class="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-4 border-b border-slate-800 pb-2.5">
                Recent Case Mutation Activity
              </h2>

              <div v-if="!caseOversight.recentActivity || caseOversight.recentActivity.length === 0" class="py-8 text-center text-slate-500 text-xs font-mono">
                No recorded activity logs.
              </div>
              <div v-else class="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                <div v-for="log in caseOversight.recentActivity" :key="log._id" class="bg-[#0D1322] border border-slate-800/60 p-2.5 rounded-lg text-xs flex justify-between items-start gap-2">
                  <div>
                    <span class="font-bold text-blue-400">{{ log.user?.name || log.user?.username || 'Agent' }}</span>
                    <span class="text-slate-400 text-xs"> executed </span>
                    <span class="font-mono text-amber-400 font-semibold">{{ log.action }}</span>
                    <div v-if="log.details" class="text-slate-400 text-[10px] font-mono mt-0.5 line-clamp-1">
                      <span v-if="log.details.title">"{{ log.details.title }}"</span>
                      <span v-else>{{ JSON.stringify(log.details) }}</span>
                    </div>
                  </div>
                  <span class="text-slate-500 font-mono text-[10px] flex-shrink-0">{{ formatDate(log.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { apiFetch } from '../utils/api';

const authStore = useAuthStore();
const activeTab = ref('users');

// User state
const users = ref([]);
const usersLoading = ref(false);
const userSearch = ref('');
const userRoleFilter = ref('');
const userPagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 });

// Case oversight state
const caseOversight = ref(null);
const caseOversightLoading = ref(false);

let searchTimeout = null;
const onUserSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchUsers(1);
  }, 300);
};

const fetchUsers = async (page = 1) => {
  usersLoading.value = true;
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: '10'
    });
    if (userSearch.value.trim()) params.append('search', userSearch.value.trim());
    if (userRoleFilter.value) params.append('role', userRoleFilter.value);

    const res = await apiFetch(`/api/admin/users?${params.toString()}`);
    if (res.success && Array.isArray(res.data)) {
      users.value = res.data;
      if (res.pagination) {
        userPagination.value = res.pagination;
      }
    }
  } catch (err) {
    console.error('Error fetching admin users:', err);
  } finally {
    usersLoading.value = false;
  }
};

const fetchCaseOversight = async () => {
  caseOversightLoading.value = true;
  try {
    const res = await apiFetch('/api/admin/case-monitoring');
    if (res.success && res.data) {
      caseOversight.value = res.data;
    }
  } catch (err) {
    console.error('Error fetching case oversight:', err);
  } finally {
    caseOversightLoading.value = false;
  }
};

const roleBadgeClass = (role) => {
  switch (role) {
    case 'Admin': return 'bg-purple-950/80 text-purple-300 border border-purple-800';
    case 'Investigator': return 'bg-blue-950/80 text-blue-300 border border-blue-800';
    case 'Reviewer': return 'bg-amber-950/80 text-amber-300 border border-amber-800';
    default: return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
};

const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString();
};

onMounted(() => {
  if (authStore.user?.role === 'Admin') {
    fetchUsers(1);
    fetchCaseOversight();
  }
});
</script>

