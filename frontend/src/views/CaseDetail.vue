<template>
  <div v-if="loading" class="text-gray-400">Loading...</div>
  <div v-else-if="caseItem">
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">{{ caseItem.title }}</h1>
        <p class="text-gray-400 mt-1">{{ caseItem.description }}</p>
      </div>
      <div class="flex space-x-2 items-center">
        <select v-model="caseItem.status" @change="updateStatus" class="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm">
          <option value="DRAFT">DRAFT</option>
          <option value="OPEN">OPEN</option>
          <option value="INVESTIGATING">INVESTIGATING</option>
          <option value="REVIEW">REVIEW</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>
    </div>
    
    <div class="border-b border-gray-700 mb-6">
      <nav class="-mb-px flex space-x-8">
        <a href="#" @click.prevent="tab = 'evidence'" :class="[tab === 'evidence' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">Evidence</a>
        <a href="#" @click.prevent="tab = 'hypotheses'" :class="[tab === 'hypotheses' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">Hypotheses</a>
      </nav>
    </div>

    <div v-if="tab === 'evidence'" class="mt-4">
      <h2 class="text-xl text-white mb-4">Evidence</h2>
      <div class="space-y-4">
        <div v-for="e in evidence" :key="e._id" class="bg-gray-800 rounded shadow border border-gray-700 p-4">
          <div class="flex justify-between">
            <h3 class="text-lg font-medium text-white">{{ e.title }}</h3>
            <span class="text-sm px-2 py-1 bg-gray-700 rounded">{{ e.verificationState }}</span>
          </div>
          <p class="text-sm text-gray-400 mt-1">{{ e.type }} - Confidence: {{ e.confidenceScore }}%</p>
        </div>
      </div>
    </div>

    <div v-if="tab === 'hypotheses'" class="mt-4">
      <h2 class="text-xl text-white mb-4">Hypotheses</h2>
      <div class="space-y-4">
        <div v-for="h in hypotheses" :key="h._id" class="bg-gray-800 rounded shadow border border-gray-700 p-4">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-medium text-white">{{ h.title }}</h3>
            <span class="text-lg font-bold" :class="h.score >= 0 ? 'text-green-400' : 'text-red-400'">Score: {{ h.score.toFixed(2) }}</span>
          </div>
          <div class="text-sm text-gray-300 bg-gray-900 p-3 rounded">
            <strong>Explainability:</strong>
            <ul class="list-disc pl-5 mt-1 text-gray-400">
              <li v-for="(exp, idx) in h.explainability" :key="idx">{{ exp }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';

const route = useRoute();
const authStore = useAuthStore();
const caseItem = ref(null);
const evidence = ref([]);
const hypotheses = ref([]);
const loading = ref(true);
const tab = ref('evidence');

const fetchCaseData = async () => {
  try {
    const headers = { 'Authorization': `Bearer ${authStore.token}` };
    const [caseRes, evRes, hypRes] = await Promise.all([
      fetch(`http://localhost:5000/api/cases/${route.params.id}`, { headers }),
      fetch(`http://localhost:5000/api/cases/${route.params.id}/evidence`, { headers }),
      fetch(`http://localhost:5000/api/cases/${route.params.id}/hypotheses`, { headers })
    ]);
    
    const [caseData, evData, hypData] = await Promise.all([caseRes.json(), evRes.json(), hypRes.json()]);
    
    if (caseData.success) caseItem.value = caseData.data;
    if (evData.success) evidence.value = evData.data;
    if (hypData.success) hypotheses.value = hypData.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async () => {
  try {
    await fetch(`http://localhost:5000/api/cases/${route.params.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status: caseItem.value.status })
    });
  } catch (err) {
    console.error(err);
  }
};

onMounted(fetchCaseData);
</script>
