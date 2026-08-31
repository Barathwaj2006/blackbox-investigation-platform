<template>
  <div class="max-w-5xl mx-auto">
    <div class="mb-12 flex justify-between items-end">
      <div>
        <h1 class="text-4xl font-light text-white tracking-wide uppercase">Command Center</h1>
        <p class="text-sm text-gray-400 mt-2">Active intelligence and operational overview</p>
      </div>
      <button v-if="authStore.user?.role === 'Admin'" @click="resetDemo" :disabled="resetting" class="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white border border-charcoal-700 px-4 py-2 rounded transition-colors flex items-center">
        <span v-if="resetting" class="animate-pulse">Resetting...</span>
        <span v-else>Load Demo Case</span>
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      
      <!-- MAIN: Priority Investigations -->
      <div class="lg:col-span-2 space-y-6">
        <div>
          <div class="flex items-center justify-between border-b border-charcoal-700 pb-3 mb-6">
             <h2 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Investigations</h2>
             <router-link to="/cases" class="text-[10px] font-bold text-electric hover:text-white uppercase tracking-widest transition-colors">View Registry &rarr;</router-link>
          </div>
          
          <div v-if="loading" class="text-sm font-mono text-gray-500 animate-pulse py-8 border border-dashed border-charcoal-700 rounded text-center">Loading cases...</div>
          <div v-else-if="priorityCases.length === 0" class="text-sm font-mono text-gray-500 py-12 border border-dashed border-charcoal-700 rounded text-center">
             No active investigations require immediate attention.
          </div>
          
          <div v-else class="space-y-4">
            <router-link v-for="c in priorityCases" :key="c._id" :to="{ name: 'CaseDetail', params: { id: c._id }}" class="block bg-charcoal-800 border border-charcoal-700 hover:border-charcoal-500 rounded p-6 transition-all group">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <div class="text-[10px] font-mono text-electric mb-2 tracking-widest uppercase">Case // BK-{{ c._id.substring(c._id.length-4).toUpperCase() }}</div>
                  <h3 class="text-xl font-medium text-white group-hover:text-electric transition-colors">{{ c.title }}</h3>
                </div>
                <span class="px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded border" :class="statusColorClass(c.status)">
                  {{ c.status }}
                </span>
              </div>
              <p class="text-sm text-gray-400 mb-6 truncate">{{ c.description || 'No briefing provided.' }}</p>
              
              <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <span class="flex items-center"><span class="w-2 h-2 rounded-full mr-2" :class="c.priority === 'High' ? 'bg-danger animate-pulse' : 'bg-electric'"></span> {{ c.priority || 'Standard' }} Priority</span>
                <span class="text-electric border border-electric/30 px-4 py-1.5 rounded transition-colors group-hover:bg-electric group-hover:text-white">Open Workspace</span>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- SIDE: System & Attention -->
      <div class="space-y-10">
        
        <!-- Actionable Attention Items -->
        <div v-if="attentionItems.length > 0">
          <h2 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-charcoal-700 pb-3 mb-6">Requires Attention</h2>
          <div class="space-y-4">
            <router-link v-for="(item, idx) in attentionItems" :key="idx" :to="item.link" class="block bg-charcoal-800 border border-charcoal-700 rounded p-4 hover:border-charcoal-500 transition-colors group">
              <div class="flex items-start">
                <div class="mt-0.5 mr-3 text-lg leading-none" :class="item.type === 'alert' ? 'text-danger' : 'text-pending'">{{ item.type === 'alert' ? '!' : '●' }}</div>
                <div>
                  <p class="text-sm text-white font-medium mb-1 group-hover:text-electric transition-colors">{{ item.message }}</p>
                  <p class="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Action Required</p>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <!-- System Health -->
        <div>
           <h2 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-charcoal-700 pb-3 mb-6">System Health</h2>
           <div class="bg-charcoal-900 border border-charcoal-700 rounded p-5 text-[10px] text-gray-400 font-mono uppercase tracking-widest space-y-4">
             <div class="flex justify-between items-center pb-2 border-b border-charcoal-800">
                <span>Database Node</span>
                <span class="text-verified flex items-center"><span class="w-1.5 h-1.5 bg-verified rounded-full mr-2"></span> Connected</span>
             </div>
             <div class="flex justify-between items-center pb-2 border-b border-charcoal-800">
                <span>Scoring Engine</span>
                <span class="text-verified flex items-center"><span class="w-1.5 h-1.5 bg-verified rounded-full mr-2"></span> Nominal</span>
             </div>
             <div class="flex justify-between items-center">
                <span>Audit Ledger</span>
                <span class="text-verified flex items-center"><span class="w-1.5 h-1.5 bg-verified rounded-full mr-2"></span> Writing</span>
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

const authStore = useAuthStore();
const priorityCases = ref([]);
const attentionItems = ref([]);
const loading = ref(true);
const resetting = ref(false);

const resetDemo = async () => {
  if(!confirm('This will wipe the database and restore the BK-2041 Demo Case. Proceed?')) return;
  resetting.value = true;
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/admin/reset-demo', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if(res.ok) await fetchDashboardData();
  } catch(err) {
    console.error(err);
  } finally {
    resetting.value = false;
  }
};

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/cases', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (data.success) {
      // Filter for active cases (e.g. REVIEW or INVESTIGATING)
      priorityCases.value = data.data.filter(c => ['INVESTIGATING', 'REVIEW', 'OPEN'].includes(c.status)).slice(0, 3);
      
      // Generate actionable attention items based on cases in REVIEW state
      attentionItems.value = priorityCases.value
        .filter(c => c.status === 'REVIEW')
        .map(c => ({
           type: 'warning',
           message: `Case BK-${c._id.substring(c._id.length-4).toUpperCase()} is awaiting final resolution review.`,
           link: `/cases/${c._id}`
        }));
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const statusColorClass = (status) => {
  const map = { 'OPEN': 'text-verified border-verified/50 bg-verified/10', 'INVESTIGATING': 'text-electric border-electric/50 bg-electric/10', 'REVIEW': 'text-pending border-pending/50 bg-pending/10' };
  return map[status] || 'text-gray-400 border-charcoal-600 bg-charcoal-800';
};

onMounted(fetchDashboardData);
</script>



