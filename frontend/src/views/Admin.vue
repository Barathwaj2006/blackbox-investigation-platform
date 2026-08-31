<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
      <div>
        <div class="flex items-center space-x-3">
          <h1 class="text-2xl font-bold text-white tracking-wide">ADMIN CONSOLE</h1>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-400 border border-blue-800">
            SYSTEM CONTROL
          </span>
        </div>
        <p class="text-gray-400 text-sm mt-1">Platform user surveillance, role-based access monitoring, and case operational metrics.</p>
      </div>

      <!-- Admin Tabs -->
      <div class="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
        <button 
          @click="activeTab = 'users'" 
          :class="[activeTab === 'users' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200', 'px-4 py-1.5 rounded-md text-sm font-medium transition']"
        >
          User Monitoring
        </button>
        <button 
          @click="activeTab = 'cases'" 
          :class="[activeTab === 'cases' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200', 'px-4 py-1.5 rounded-md text-sm font-medium transition']"
        >
          Case Oversight
        </button>
      </div>
    </div>

    <!-- Unauthorized Banner if not admin -->
    <div v-if="authStore.user?.role !== 'Admin'" class="bg-rose-950/60 border border-rose-800 text-rose-200 p-8 rounded-lg text-center">
      <h2 class="text-lg font-bold">Access Restricted</h2>
      <p class="text-sm mt-1 text-rose-300">You must possess the Administrator role to access system user management and case telemetry.</p>
      <router-link to="/" class="mt-4 inline-block bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm text-white">Return to Dashboard</router-link>
    </div>

    <div v-else>
      <!-- TAB 1: USER MONITORING -->
      <div v-if="activeTab === 'users'" class="space-y-4">
        <!-- Filter and Search Bar -->
        <div class="bg-gray-800/80 p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div class="w-full md:w-1/2 relative">
            <input 
              v-model="userSearch" 
              @input="onUserSearchInput"
              type="text" 
              placeholder="Search users by name or username..." 
              class="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <svg class="w-4 h-4 text-gray-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          <div class="flex items-center space-x-3 w-full md:w-auto justify-end">
            <label class="text-xs text-gray-400 font-semibold uppercase">Role:</label>
            <select 
              v-model="userRoleFilter" 
              @change="fetchUsers(1)"
              class="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Investigator">Investigator</option>
              <option value="Reviewer">Reviewer</option>
            </select>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div v-if="usersLoading" class="py-12 text-center text-gray-400">Loading user registries...</div>
          <div v-else-if="users.length === 0" class="py-12 text-center text-gray-400">No users match the specified criteria.</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-700">
              <thead class="bg-gray-900/90 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th class="px-6 py-3.5 text-left">User Identity</th>
                  <th class="px-6 py-3.5 text-left">Role</th>
                  <th class="px-6 py-3.5 text-left">Status</th>
                  <th class="px-6 py-3.5 text-left">Cases Created</th>
                  <th class="px-6 py-3.5 text-left">Audit Events</th>
                  <th class="px-6 py-3.5 text-left">Registered Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700/60 text-sm">
                <tr v-for="u in users" :key="u._id" class="hover:bg-gray-750 transition">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-medium text-white">{{ u.name }}</div>
                    <div class="text-xs text-gray-400 font-mono">@{{ u.username }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="roleBadgeClass(u.role)" class="text-xs px-2.5 py-1 rounded-full font-semibold">
                      {{ u.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center text-xs text-emerald-400 font-semibold">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
                      Active
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap font-mono text-gray-200">
                    {{ u.caseCount || 0 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap font-mono text-gray-200">
                    {{ u.activityCount || 0 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                    {{ formatDate(u.createdAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div v-if="userPagination.totalPages > 1" class="bg-gray-900/80 px-6 py-3.5 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
            <div>
              Showing page <span class="font-bold text-white">{{ userPagination.page }}</span> of <span class="font-bold text-white">{{ userPagination.totalPages }}</span> ({{ userPagination.total }} users)
            </div>
            <div class="flex space-x-2">
              <button 
                :disabled="userPagination.page <= 1" 
                @click="fetchUsers(userPagination.page - 1)" 
                class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button 
                :disabled="userPagination.page >= userPagination.totalPages" 
                @click="fetchUsers(userPagination.page + 1)" 
                class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: CASE OVERSIGHT / MONITORING -->
      <div v-if="activeTab === 'cases'" class="space-y-6">
        <div v-if="caseOversightLoading" class="py-12 text-center text-gray-400">Aggregating case telemetry...</div>
        <div v-else-if="caseOversight" class="space-y-6">
          <!-- Overview Cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div class="text-xs text-gray-400 font-semibold uppercase">Total Operations</div>
              <div class="text-2xl font-bold font-mono text-white mt-1">{{ caseOversight.totalCases }}</div>
            </div>
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div class="text-xs text-amber-400 font-semibold uppercase">Active Cases</div>
              <div class="text-2xl font-bold font-mono text-amber-400 mt-1">{{ caseOversight.activeCases }}</div>
            </div>
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div class="text-xs text-purple-400 font-semibold uppercase">In Review</div>
              <div class="text-2xl font-bold font-mono text-purple-400 mt-1">{{ caseOversight.statusCounts?.REVIEW || 0 }}</div>
            </div>
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div class="text-xs text-emerald-400 font-semibold uppercase">Resolved</div>
              <div class="text-2xl font-bold font-mono text-emerald-400 mt-1">{{ caseOversight.statusCounts?.RESOLVED || 0 }}</div>
            </div>
          </div>

          <!-- High-Priority Cases & Activity Feed -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- High Priority Cases -->
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-5">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4 flex items-center justify-between">
                <span>Critical / High Priority Investigations</span>
                <span class="text-xs bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800 font-mono">
                  {{ caseOversight.highPriorityCases?.length || 0 }} Escalated
                </span>
              </h2>

              <div v-if="!caseOversight.highPriorityCases || caseOversight.highPriorityCases.length === 0" class="py-8 text-center text-gray-400 text-sm">
                No critical cases pending at this time.
              </div>
              <div v-else class="space-y-3">
                <div v-for="c in caseOversight.highPriorityCases" :key="c._id" class="bg-gray-900/80 border border-gray-700 p-3.5 rounded-lg flex items-center justify-between">
                  <div>
                    <router-link :to="{ name: 'CaseDetail', params: { id: c._id } }" class="text-sm font-semibold text-white hover:text-blue-400 transition">
                      {{ c.title }}
                    </router-link>
                    <div class="text-xs text-gray-400 mt-0.5">Author: {{ c.createdBy }} • Updated: {{ formatDate(c.updatedAt || c.createdAt) }}</div>
                  </div>
                  <span :class="c.priority === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-amber-950 text-amber-300 border-amber-800'" class="text-xs px-2.5 py-1 rounded-full font-semibold border">
                    {{ c.priority }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Recent Case Activity -->
            <div class="bg-gray-800 rounded-lg border border-gray-700 p-5">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
                Recent Case Mutation Activity
              </h2>

              <div v-if="!caseOversight.recentActivity || caseOversight.recentActivity.length === 0" class="py-8 text-center text-gray-400 text-sm">
                No recorded activity logs.
              </div>
              <div v-else class="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                <div v-for="log in caseOversight.recentActivity" :key="log._id" class="bg-gray-900/60 border border-gray-800 p-3 rounded-lg text-xs flex justify-between items-start gap-2">
                  <div>
                    <span class="font-semibold text-blue-300">{{ log.user?.name || log.user?.username || 'Agent' }}</span>
                    <span class="text-gray-400"> executed </span>
                    <span class="font-mono text-amber-300">{{ log.action }}</span>
                    <div v-if="log.details" class="text-gray-400 text-[11px] mt-0.5 line-clamp-1">
                      <span v-if="log.details.title">"{{ log.details.title }}"</span>
                      <span v-else>{{ JSON.stringify(log.details) }}</span>
                    </div>
                  </div>
                  <span class="text-gray-500 font-mono text-[11px] flex-shrink-0">{{ formatDate(log.createdAt) }}</span>
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
    case 'Admin': return 'bg-purple-950 text-purple-300 border border-purple-800';
    case 'Investigator': return 'bg-blue-950 text-blue-300 border border-blue-800';
    case 'Reviewer': return 'bg-amber-950 text-amber-300 border border-amber-800';
    default: return 'bg-gray-800 text-gray-300 border border-gray-700';
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
