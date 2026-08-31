<template>
  <div>
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-white">Cases</h1>
      <button v-if="['Admin', 'Investigator'].includes(authStore.user?.role)" @click="showCreateModal = true" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        New Case
      </button>
    </div>
    
    <div v-if="loading" class="mt-8 text-gray-400">Loading cases...</div>
    <div v-else-if="cases.length === 0" class="mt-8 text-gray-400">No cases found.</div>
    <div v-else class="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="c in cases" :key="c._id" class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6 flex flex-col">
        <h3 class="text-lg font-medium text-white mb-2">{{ c.title }}</h3>
        <p class="text-sm text-gray-400 flex-1">{{ c.description }}</p>
        <div class="mt-4 flex justify-between items-center">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="statusClass(c.status)">
            {{ c.status }}
          </span>
          <router-link :to="{ name: 'CaseDetail', params: { id: c._id } }" class="text-blue-400 hover:text-blue-300 text-sm">
            View Details
          </router-link>
        </div>
      </div>
    </div>

    <!-- Create Case Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700">
        <h2 class="text-xl font-bold text-white mb-4">Create New Case</h2>
        <form @submit.prevent="createCase">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input v-model="newCase.title" required type="text" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea v-model="newCase.description" rows="3" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"></textarea>
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const cases = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);
const newCase = ref({ title: '', description: '' });

const fetchCases = async () => {
  loading.value = true;
  try {
    const res = await fetch('http://localhost:5000/api/cases', {
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
  try {
    const res = await fetch('http://localhost:5000/api/cases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(newCase.value)
    });
    const data = await res.json();
    if (data.success) {
      cases.value.unshift(data.data);
      showCreateModal.value = false;
      newCase.value = { title: '', description: '' };
    }
  } catch (err) {
    console.error(err);
  }
};

const statusClass = (status) => {
  const map = {
    'DRAFT': 'bg-gray-100 text-gray-800',
    'OPEN': 'bg-green-100 text-green-800',
    'INVESTIGATING': 'bg-blue-100 text-blue-800',
    'REVIEW': 'bg-yellow-100 text-yellow-800',
    'RESOLVED': 'bg-purple-100 text-purple-800',
    'ARCHIVED': 'bg-gray-600 text-gray-200'
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

onMounted(fetchCases);
</script>
