<template>
  <div class="min-h-screen bg-[#0d1117] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Ambient tactical glow background -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-4xl mx-auto w-full space-y-8 relative z-10">
      <!-- Logo & Brand Header -->
      <div class="flex flex-col items-center text-center space-y-4">
        <BlackboxLogo mode="full" size="xl" />
        <div class="max-w-xl space-y-2 mt-2">
          <h1 class="text-2xl sm:text-3xl font-display font-medium text-[#e9e7e1] leading-tight">
            Every claim needs a source. Every source needs a chain.
          </h1>
          <p class="text-sm text-[#9aa0a6] leading-relaxed">
            Sign in to collect evidence, verify its integrity, and analyze how forensic artifacts shift competing analytical hypotheses in real time.
          </p>
        </div>
      </div>

      <!-- Quick Role-Based Instant Access Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <!-- 1. Investigator -->
        <button 
          @click="loginAs('investigator')"
          class="bg-[#1b1f23] border border-[#33393f] hover:border-[#6c93c7] hover:bg-[#20252a] rounded-lg p-5 text-left transition duration-150 flex flex-col justify-between group shadow-sm"
        >
          <div class="space-y-3">
            <div class="w-10 h-10 rounded-full bg-[#233448] text-[#6c93c7] flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" stroke-width="1.8"/>
                <path d="M21 21l-4.3-4.3" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </div>
            <h3 class="font-display font-medium text-base text-[#e9e7e1] group-hover:text-[#6c93c7] transition">
              Investigator
            </h3>
            <p class="text-xs text-[#9aa0a6] leading-relaxed">
              Build cases, log and verify evidence, link exhibits to theories, and weigh competing hypotheses.
            </p>
          </div>
          <div class="font-mono text-[11px] text-[#6c93c7] mt-4 flex items-center space-x-1 font-semibold">
            <span>Continue as Investigator</span>
            <span>➔</span>
          </div>
        </button>

        <!-- 2. Reviewer / Supervisor -->
        <button 
          @click="loginAs('reviewer')"
          class="bg-[#1b1f23] border border-[#33393f] hover:border-[#4fb8ae] hover:bg-[#20252a] rounded-lg p-5 text-left transition duration-150 flex flex-col justify-between group shadow-sm"
        >
          <div class="space-y-3">
            <div class="w-10 h-10 rounded-full bg-[#1f4744] text-[#4fb8ae] flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="font-display font-medium text-base text-[#e9e7e1] group-hover:text-[#4fb8ae] transition">
              Supervisor / Reviewer
            </h3>
            <p class="text-xs text-[#9aa0a6] leading-relaxed">
              Review case progress, assess chain of custody integrity, and audit investigator findings.
            </p>
          </div>
          <div class="font-mono text-[11px] text-[#4fb8ae] mt-4 flex items-center space-x-1 font-semibold">
            <span>Continue as Supervisor</span>
            <span>➔</span>
          </div>
        </button>

        <!-- 3. Administrator -->
        <button 
          @click="loginAs('admin')"
          class="bg-[#1b1f23] border border-[#33393f] hover:border-[#e8a23d] hover:bg-[#20252a] rounded-lg p-5 text-left transition duration-150 flex flex-col justify-between group shadow-sm"
        >
          <div class="space-y-3">
            <div class="w-10 h-10 rounded-full bg-[#5a4526] text-[#e8a23d] flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke-width="1.8"/>
                <path d="M4 10h16M10 10v10" stroke-width="1.8"/>
              </svg>
            </div>
            <h3 class="font-display font-medium text-base text-[#e9e7e1] group-hover:text-[#e8a23d] transition">
              Administrator
            </h3>
            <p class="text-xs text-[#9aa0a6] leading-relaxed">
              Manage users and permissions, monitor platform health, and oversee platform-wide operations.
            </p>
          </div>
          <div class="font-mono text-[11px] text-[#e8a23d] mt-4 flex items-center space-x-1 font-semibold">
            <span>Continue as Admin</span>
            <span>➔</span>
          </div>
        </button>
      </div>

      <!-- Manual Credential Sign In Form Toggle / Container -->
      <div class="bg-[#1b1f23] border border-[#33393f] rounded-lg p-6 max-w-md mx-auto shadow-md space-y-4">
        <div class="flex items-center justify-between border-b border-[#2a3036] pb-3">
          <span class="text-xs uppercase font-mono font-bold tracking-wider text-[#9aa0a6]">
            Standard Authentication
          </span>
          <span class="text-[11px] font-mono text-[#666c73]">
            Operator Sign In
          </span>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label for="username" class="block text-xs font-mono font-medium text-[#9aa0a6]">
              USERNAME / OPERATOR ID
            </label>
            <div class="mt-1">
              <input 
                id="username" 
                v-model="username" 
                name="username" 
                type="text" 
                required 
                placeholder="investigator / reviewer / admin"
                class="appearance-none block w-full px-3 py-2 border border-[#33393f] rounded bg-[#20252a] text-[#e9e7e1] text-xs font-mono placeholder-[#666c73] focus:outline-none focus:border-[#6c93c7]"
              >
            </div>
          </div>

          <div>
            <label for="password" class="block text-xs font-mono font-medium text-[#9aa0a6]">
              CREDENTIAL / KEY
            </label>
            <div class="mt-1">
              <input 
                id="password" 
                v-model="password" 
                name="password" 
                type="password" 
                required 
                placeholder="••••"
                class="appearance-none block w-full px-3 py-2 border border-[#33393f] rounded bg-[#20252a] text-[#e9e7e1] text-xs font-mono placeholder-[#666c73] focus:outline-none focus:border-[#6c93c7]"
              >
            </div>
          </div>

          <div v-if="error" class="text-[#d2685a] bg-[#4a2a25]/50 border border-[#d2685a]/40 p-2 rounded text-xs font-mono">
            {{ error }}
          </div>

          <div>
            <button 
              type="submit" 
              :disabled="loading" 
              class="w-full flex justify-center py-2 px-4 border border-[#e8a23d] rounded text-xs font-mono font-bold text-[#1b1305] bg-[#e8a23d] hover:bg-[#f0ae4d] transition shadow disabled:opacity-50"
            >
              {{ loading ? 'AUTHENTICATING...' : 'SECURE SIGN IN' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Footer Tagline -->
      <div class="text-center font-mono text-[11px] text-[#666c73] tracking-widest uppercase">
        COLLECT • ANALYZE • CONNECT • RESOLVE
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import BlackboxLogo from '../components/BlackboxLogo.vue';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('investigator');
const password = ref('demo');
const error = ref('');
const loading = ref(false);

const loginAs = async (role) => {
  username.value = role;
  password.value = 'demo';
  await handleLogin();
};

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  const res = await authStore.login(username.value, password.value);
  loading.value = false;
  if (res.success) {
    router.push({ name: 'Dashboard' });
  } else {
    error.value = res.error || 'Authentication failed. Please verify credentials.';
  }
};
</script>
