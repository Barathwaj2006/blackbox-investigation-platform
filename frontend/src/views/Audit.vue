<template>
  <div>
    <h1 class="text-2xl font-semibold text-white mb-6">Audit Trail</h1>
    
    <div v-if="loading" class="text-gray-400">Loading audit logs...</div>
    <div v-else-if="logs.length === 0" class="text-gray-400">No audit logs found.</div>
    <div v-else class="bg-gray-800 rounded shadow overflow-hidden border border-gray-700">
      <table class="min-w-full divide-y divide-gray-700">
        <thead class="bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Entity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700">
          <tr v-for="log in logs" :key="log._id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{{ new Date(log.createdAt).toLocaleString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ log.user?.name || 'Unknown' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-400 font-medium">{{ log.action }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ log.entityType }} ({{ log.entityId.substring(0,6) }}...)</td>
            <td class="px-6 py-4 text-sm text-gray-400">
              <pre class="text-xs">{{ JSON.stringify(log.details) }}</pre>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const logs = ref([]);
const loading = ref(true);

const fetchLogs = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/audit', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (data.success) {
      logs.value = data.data;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchLogs);
</script>
