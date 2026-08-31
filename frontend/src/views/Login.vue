<template>
  <div class="min-h-screen bg-charcoal-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-light text-white tracking-widest uppercase">
        BlackBox
      </h2>
      <p class="mt-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-widest">
        Forensic Investigation Workspace
      </p>
    </div>

    <div class="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-charcoal-800 py-8 px-4 shadow-2xl sm:rounded border border-charcoal-700 sm:px-10">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="username" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Operator ID
            </label>
            <div class="mt-1">
              <input id="username" v-model="username" name="username" type="text" required class="appearance-none block w-full px-3 py-2 border border-charcoal-600 rounded shadow-sm placeholder-charcoal-600 focus:outline-none focus:ring-1 focus:ring-electric focus:border-electric sm:text-sm bg-charcoal-900 text-white font-mono">
            </div>
          </div>

          <div>
            <label for="password" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Passcode
            </label>
            <div class="mt-1">
              <input id="password" v-model="password" name="password" type="password" required class="appearance-none block w-full px-3 py-2 border border-charcoal-600 rounded shadow-sm placeholder-charcoal-600 focus:outline-none focus:ring-1 focus:ring-electric focus:border-electric sm:text-sm bg-charcoal-900 text-white font-mono">
            </div>
          </div>

          <div v-if="error" class="text-danger text-xs font-mono">
            {{ error }}
          </div>

          <div class="pt-2">
            <button type="submit" :disabled="loading" class="w-full flex justify-center py-2 px-4 border border-transparent rounded shadow-sm text-xs font-bold uppercase tracking-wider text-charcoal-900 bg-white hover:bg-gray-200 focus:outline-none transition-colors">
              {{ loading ? 'AUTHENTICATING...' : 'AUTHENTICATE' }}
            </button>
          </div>
        </form>
        
        <div class="mt-10 pt-6 border-t border-charcoal-700">
          <p class="text-center text-xs font-semibold text-gray-600 uppercase tracking-widest mb-4">Demo Access Profiles</p>
          <div class="grid grid-cols-3 gap-3">
            <button @click="fillDemo('investigator')" class="w-full inline-flex justify-center py-1.5 px-4 border border-charcoal-600 rounded text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:border-charcoal-500 transition-colors">Investigator</button>
            <button @click="fillDemo('reviewer')" class="w-full inline-flex justify-center py-1.5 px-4 border border-charcoal-600 rounded text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:border-charcoal-500 transition-colors">Reviewer</button>
            <button @click="fillDemo('admin')" class="w-full inline-flex justify-center py-1.5 px-4 border border-charcoal-600 rounded text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:border-charcoal-500 transition-colors">Admin</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const fillDemo = (role) => {
  username.value = role;
  password.value = 'demo';
};

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  const res = await authStore.login(username.value, password.value);
  loading.value = false;
  if (res.success) {
    router.push({ name: 'Dashboard' });
  } else {
    error.value = res.error;
  }
};
</script>
