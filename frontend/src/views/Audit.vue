<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-8 border-b border-charcoal-700 pb-4">
      <h1 class="text-3xl font-light text-white tracking-wide uppercase">AUDIT LOG</h1>
      <p class="text-sm text-gray-400 mt-2">Operational History</p>
    </div>
    
    <div v-if="loading" class="text-gray-500 font-mono text-sm animate-pulse">Querying logs...</div>
    <div v-else-if="logs.length === 0" class="text-gray-500 font-mono text-sm border border-dashed border-charcoal-700 p-8 text-center">No operational history found.</div>
    <div v-else class="bg-charcoal-900 border border-charcoal-700 rounded overflow-hidden">
      <table class="min-w-full divide-y divide-charcoal-800">
        <thead class="bg-charcoal-800">
          <tr>
            <th class="px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest font-mono">TIME</th>
            <th class="px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest font-mono">ACTOR</th>
            <th class="px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest font-mono">ACTION</th>
            <th class="px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest font-mono">TARGET</th>
            <th class="px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest font-mono">DETAILS</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-charcoal-800">
          <tr v-for="log in logs" :key="log._id" class="hover:bg-charcoal-800/30 transition-colors">
            <td class="px-6 py-3 whitespace-nowrap text-[11px] font-mono text-gray-400">{{ formatTime(log.createdAt) }}</td>
            <td class="px-6 py-3 whitespace-nowrap text-[11px] font-mono text-gray-300">{{ log.user?.username.toUpperCase() || 'UNKNOWN' }}</td>
            <td class="px-6 py-3 whitespace-nowrap text-[11px] font-mono text-electric">{{ log.action }}</td>
            <td class="px-6 py-3 whitespace-nowrap text-[11px] font-mono text-gray-500">{{ log.entityType.toUpperCase() }} {{ log.entityId.substring(0,8).toUpperCase() }}</td>
            <td class="px-6 py-3 text-[11px] font-mono text-gray-500 truncate max-w-xs">
              {{ JSON.stringify(log.details) }}
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

const formatTime = (isoString) => {
  const d = new Date(isoString);
  return d.toISOString().replace('T', ' ').substring(0, 19);
};

onMounted(fetchLogs);
</script>
