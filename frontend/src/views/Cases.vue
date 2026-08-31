<template>
  <div class="max-w-6xl mx-auto pb-12">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-charcoal-700 pb-4">
      <div class="mb-4 md:mb-0">
        <h1 class="text-3xl font-light text-white tracking-wide">CASES</h1>
        <p class="text-sm text-gray-400 mt-2">Investigation Registry</p>
      </div>
      <div class="flex space-x-4 w-full md:w-auto">
        <input type="text" placeholder="Search ID or Title..." class="bg-charcoal-800 border border-charcoal-700 text-sm text-white px-4 py-2 rounded focus:outline-none focus:border-electric flex-1 md:w-64 font-mono">
        <button v-if="['Admin', 'Investigator'].includes(authStore.user?.role)" @click="showCreateModal = true" class="bg-white text-charcoal-900 px-4 py-2 rounded text-sm font-medium hover:bg-gray-200 transition-colors shrink-0">
          + NEW CASE
        </button>
      </div>
    </div>
    
    <!-- State: Loading -->
    <div v-if="loading" class="mt-8 text-gray-500 font-mono text-sm animate-pulse flex items-center justify-center h-48 border border-charcoal-700 rounded bg-charcoal-800/30">
      LOADING REGISTRY...
    </div>
    
    <!-- State: Empty -->
    <div v-else-if="cases.length === 0" class="mt-8 text-center p-16 border border-dashed border-charcoal-700 rounded bg-charcoal-900/50">
      <div class="text-gray-400 font-semibold mb-2">NO ACTIVE INVESTIGATIONS</div>
      <div class="text-sm text-gray-500 mb-6">Initialize a new case to begin the investigation workflow.</div>
      <button v-if="['Admin', 'Investigator'].includes(authStore.user?.role)" @click="showCreateModal = true" class="bg-charcoal-800 border border-charcoal-600 text-white px-6 py-2 rounded text-sm hover:border-charcoal-500 transition-colors">
        + Initialize Case
      </button>
    </div>

    <!-- State: Data -->
    <div v-else class="bg-charcoal-900 border border-charcoal-700 rounded overflow-x-auto">
      <table class="min-w-full divide-y divide-charcoal-700">
        <thead class="bg-charcoal-800">
          <tr>
            <th class="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono w-32">ID</th>
            <th class="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Title</th>
            <th class="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono w-40">Status</th>
            <th class="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono w-40">Lead</th>
            <th class="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono w-32">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-charcoal-800">
          <tr v-for="c in cases" :key="c._id" @click="router.push({ name: 'CaseDetail', params: { id: c._id } })" class="hover:bg-charcoal-800/50 transition-colors cursor-pointer group">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 group-hover:text-electric transition-colors">BK-{{ c._id.substring(c._id.length-4).toUpperCase() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white truncate max-w-xs">{{ c.title }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded uppercase tracking-widest border" :class="statusClass(c.status)">
                {{ c.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">{{ c.createdBy?.name || 'Unknown' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <span class="text-electric group-hover:text-white uppercase tracking-wider text-[10px] font-bold border border-transparent group-hover:border-charcoal-600 px-3 py-1.5 rounded transition-colors">Open</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Case Form Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-charcoal-900/95 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div class="bg-charcoal-800 p-8 rounded border border-charcoal-600 max-w-lg w-full shadow-2xl relative">
        <button @click="showCreateModal = false" class="absolute top-4 right-4 text-gray-500 hover:text-white text-xl leading-none">&times;</button>
        
        <h2 class="text-xl font-light text-white mb-2 uppercase tracking-wide">Initialize Case</h2>
        <p class="text-xs text-gray-500 mb-8 font-mono">Create a new forensic investigation dossier</p>
        
        <form @submit.prevent="createCase">
          <div class="mb-6">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Operation Title</label>
            <input v-model="newCase.title" required type="text" placeholder="e.g. Operation Phantom Strike" class="w-full bg-charcoal-900 border border-charcoal-600 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-electric transition-colors font-sans">
          </div>
          <div class="mb-8">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Initial Briefing</label>
            <textarea v-model="newCase.description" rows="4" placeholder="Summary of the incident or objective..." class="w-full bg-charcoal-900 border border-charcoal-600 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-electric transition-colors font-sans"></textarea>
          </div>
          
          <div class="flex justify-end space-x-4 pt-4 border-t border-charcoal-700">
            <button type="button" @click="showCreateModal = false" class="px-6 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" :disabled="creating" class="px-8 py-2 bg-white text-charcoal-900 rounded text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors flex items-center">
              <span v-if="creating" class="animate-pulse">Initializing...</span>
              <span v-else>Create Case</span>
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

const router = useRouter();
const authStore = useAuthStore();
const cases = ref([]);
const loading = ref(true);
const creating = ref(false);
const showCreateModal = ref(false);
const newCase = ref({ title: '', description: '' });

const fetchCases = async () => {
  loading.value = true;
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/cases', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (data.success) {
      cases.value = data.data;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const createCase = async () => {
  creating.value = true;
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/cases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(newCase.value)
    });
    const data = await res.json();
    if (data.success) {
      showCreateModal.value = false;
      // Auto navigate to new case
      router.push({ name: 'CaseDetail', params: { id: data.data._id } });
    }
  } catch (err) {
    console.error(err);
    creating.value = false;
  }
};

const statusClass = (status) => {
  const map = {
    'DRAFT': 'text-gray-400 border-gray-600 bg-gray-800',
    'OPEN': 'text-verified border-verified/30 bg-verified/10',
    'INVESTIGATING': 'text-electric border-electric/30 bg-electric/10',
    'REVIEW': 'text-pending border-pending/30 bg-pending/10',
    'RESOLVED': 'text-white border-charcoal-500 bg-charcoal-700',
    'ARCHIVED': 'text-gray-600 border-charcoal-800 bg-charcoal-900'
  };
  return map[status] || 'text-gray-400 border-gray-600 bg-gray-800';
};

onMounted(fetchCases);
</script>



