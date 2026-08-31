<template>
  <div class="space-y-6">
    <!-- Top Bar: Title, Live Status & Quick Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
      <div>
        <div class="flex items-center space-x-3">
          <h1 class="text-2xl font-bold text-white tracking-wide">INVESTIGATION COMMAND CENTER</h1>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            LIVE SYSTEM
          </span>
        </div>
        <p class="text-gray-400 text-sm mt-1">Real-time intelligence aggregation, evidence verification pipelines, and hypothesis tracking.</p>
      </div>

      <!-- Quick Actions -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button 
          v-if="['Admin', 'Investigator'].includes(authStore.user?.role)"
          @click="showCreateModal = true" 
          class="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 shadow"
        >
          <span>+ Create Case</span>
        </button>
        <router-link 
          to="/cases" 
          class="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1"
        >
          <span>Open Cases</span>
        </router-link>
        <router-link 
          to="/audit" 
          class="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1"
        >
          <span>Audit Log</span>
        </router-link>
        <button 
          @click="fetchDashboardData" 
          :disabled="loading"
          class="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg border border-gray-700 transition"
          title="Refresh Data"
        >
          <svg :class="{ 'animate-spin': loading }" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Error Banner -->
    <div v-if="error" class="bg-rose-950/60 border border-rose-800 text-rose-200 p-4 rounded-lg flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5 text-rose-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span class="text-sm font-medium">{{ error }}</span>
      </div>
      <button @click="fetchDashboardData" class="text-xs bg-rose-900 hover:bg-rose-800 text-white px-3 py-1 rounded">Retry</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !stats" class="py-16 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
      <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span class="text-sm">Aggregating telemetry & case records...</span>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="stats" class="space-y-6">
      <!-- 1. DYNAMIC SUMMARY METRICS GRID -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Metric 1: Total Cases -->
        <div class="bg-gray-800/90 border border-gray-700/80 rounded-lg p-4 flex flex-col justify-between hover:border-gray-600 transition">
          <div class="flex items-center justify-between text-gray-400 mb-1">
            <span class="text-xs font-semibold uppercase tracking-wider">Total Cases</span>
            <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <div class="text-2xl font-bold text-white font-mono">{{ stats.metrics.totalCases }}</div>
          <div class="text-xs text-gray-400 mt-2 flex items-center space-x-1.5">
            <span class="text-blue-400 font-semibold">{{ stats.metrics.activeInvestigations }} Active</span>
            <span>•</span>
            <span class="text-purple-400 font-semibold">{{ stats.metrics.casesUnderReview }} Review</span>
          </div>
        </div>

        <!-- Metric 2: Active Investigations -->
        <div class="bg-gray-800/90 border border-gray-700/80 rounded-lg p-4 flex flex-col justify-between hover:border-gray-600 transition">
          <div class="flex items-center justify-between text-gray-400 mb-1">
            <span class="text-xs font-semibold uppercase tracking-wider">Active Investigations</span>
            <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div class="text-2xl font-bold text-amber-400 font-mono">{{ stats.metrics.activeInvestigations }}</div>
          <div class="text-xs text-gray-400 mt-2">
            <span>{{ stats.metrics.resolvedCases }} Cases Resolved/Archived</span>
          </div>
        </div>

        <!-- Metric 3: Total Evidence & Verification State -->
        <div class="bg-gray-800/90 border border-gray-700/80 rounded-lg p-4 flex flex-col justify-between hover:border-gray-600 transition">
          <div class="flex items-center justify-between text-gray-400 mb-1">
            <span class="text-xs font-semibold uppercase tracking-wider">Evidence Items</span>
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="text-2xl font-bold text-white font-mono">{{ stats.metrics.totalEvidence }}</div>
          <div class="text-xs text-gray-400 mt-2 flex items-center space-x-1.5">
            <span class="text-emerald-400 font-semibold">{{ stats.metrics.verifiedEvidence }} Verified</span>
            <span>•</span>
            <span class="text-gray-400">{{ stats.metrics.unverifiedEvidence }} Pending</span>
          </div>
        </div>

        <!-- Metric 4: Active Hypotheses -->
        <div class="bg-gray-800/90 border border-gray-700/80 rounded-lg p-4 flex flex-col justify-between hover:border-gray-600 transition">
          <div class="flex items-center justify-between text-gray-400 mb-1">
            <span class="text-xs font-semibold uppercase tracking-wider">Active Hypotheses</span>
            <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <div class="text-2xl font-bold text-indigo-400 font-mono">{{ stats.metrics.activeHypotheses }}</div>
          <div class="text-xs text-gray-400 mt-2">
            <span>Dynamic Mathematical Scoring Active</span>
          </div>
        </div>
      </div>

      <!-- 2. INVESTIGATION HEALTH & LIFECYCLE DISTRIBUTION -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Verification Progress Card -->
        <div class="bg-gray-800 rounded-lg border border-gray-700 p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-gray-300">Evidence Verification Health</h2>
              <span class="text-xs font-mono text-emerald-400 font-bold">
                {{ verificationRate }}% Verified
              </span>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full bg-gray-700 h-3 rounded-full overflow-hidden flex mb-4">
              <div :style="{ width: `${verifiedPct}%` }" class="bg-emerald-500 h-full" title="Verified"></div>
              <div :style="{ width: `${disputedPct}%` }" class="bg-amber-500 h-full" title="Disputed"></div>
              <div :style="{ width: `${rejectedPct}%` }" class="bg-rose-500 h-full" title="Rejected"></div>
              <div :style="{ width: `${unverifiedPct}%` }" class="bg-gray-600 h-full" title="Unverified"></div>
            </div>

            <!-- Breakdown Legend -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="flex items-center space-x-2 bg-gray-900/60 p-2 rounded border border-gray-700/50">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span class="text-gray-300">Verified (1.0x):</span>
                <span class="font-bold text-white ml-auto font-mono">{{ stats.metrics.verifiedEvidence }}</span>
              </div>
              <div class="flex items-center space-x-2 bg-gray-900/60 p-2 rounded border border-gray-700/50">
                <span class="w-2.5 h-2.5 rounded-full bg-gray-500"></span>
                <span class="text-gray-300">Pending (0.5x):</span>
                <span class="font-bold text-white ml-auto font-mono">{{ stats.metrics.unverifiedEvidence }}</span>
              </div>
              <div class="flex items-center space-x-2 bg-gray-900/60 p-2 rounded border border-gray-700/50">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span class="text-gray-300">Disputed (0.2x):</span>
                <span class="font-bold text-white ml-auto font-mono">{{ stats.metrics.disputedEvidence }}</span>
              </div>
              <div class="flex items-center space-x-2 bg-gray-900/60 p-2 rounded border border-gray-700/50">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span class="text-gray-300">Rejected (0.0x):</span>
                <span class="font-bold text-white ml-auto font-mono">{{ stats.metrics.rejectedEvidence }}</span>
              </div>
            </div>
          </div>
          
          <div class="mt-4 pt-3 border-t border-gray-700/70 text-xs text-gray-400">
            Unverified evidence applies a 50% discount to hypothesis weights.
          </div>
        </div>

        <!-- Case Lifecycle Distribution Card -->
        <div class="bg-gray-800 rounded-lg border border-gray-700 p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-gray-300">Case Lifecycle Pipeline</h2>
              <span class="text-xs text-gray-400 font-mono">{{ stats.metrics.totalCases }} Total Records</span>
            </div>

            <!-- Pipeline Visual Blocks -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mt-2">
              <div class="bg-gray-900/80 border border-gray-700/80 p-3 rounded text-center">
                <div class="text-xs text-gray-400 font-semibold mb-1">DRAFT</div>
                <div class="text-xl font-bold font-mono text-gray-300">{{ stats.statusDistribution.DRAFT }}</div>
              </div>
              <div class="bg-blue-950/40 border border-blue-800/40 p-3 rounded text-center">
                <div class="text-xs text-blue-400 font-semibold mb-1">OPEN</div>
                <div class="text-xl font-bold font-mono text-blue-300">{{ stats.statusDistribution.OPEN }}</div>
              </div>
              <div class="bg-amber-950/40 border border-amber-800/40 p-3 rounded text-center">
                <div class="text-xs text-amber-400 font-semibold mb-1">INVESTIGATING</div>
                <div class="text-xl font-bold font-mono text-amber-300">{{ stats.statusDistribution.INVESTIGATING }}</div>
              </div>
              <div class="bg-purple-950/40 border border-purple-800/40 p-3 rounded text-center">
                <div class="text-xs text-purple-400 font-semibold mb-1">REVIEW</div>
                <div class="text-xl font-bold font-mono text-purple-300">{{ stats.statusDistribution.REVIEW }}</div>
              </div>
              <div class="bg-emerald-950/40 border border-emerald-800/40 p-3 rounded text-center">
                <div class="text-xs text-emerald-400 font-semibold mb-1">RESOLVED</div>
                <div class="text-xl font-bold font-mono text-emerald-300">{{ stats.statusDistribution.RESOLVED }}</div>
              </div>
              <div class="bg-gray-900/80 border border-gray-700/80 p-3 rounded text-center">
                <div class="text-xs text-gray-400 font-semibold mb-1">ARCHIVED</div>
                <div class="text-xl font-bold font-mono text-gray-400">{{ stats.statusDistribution.ARCHIVED }}</div>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-gray-700/70 flex items-center justify-between text-xs text-gray-400">
            <span>Investigative status gates access and hypothesis scoring.</span>
            <router-link to="/cases" class="text-blue-400 hover:underline">Manage All Cases →</router-link>
          </div>
        </div>
      </div>

      <!-- 3. PRIORITY CASES & RECENT INVESTIGATION ACTIVITY -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Priority Active Cases -->
        <div class="bg-gray-800 rounded-lg border border-gray-700 p-5 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-gray-300">Priority Active Cases</h2>
              <span class="bg-blue-900 text-blue-300 text-xs px-2 py-0.5 rounded-full font-mono">{{ stats.priorityCases.length }}</span>
            </div>
            <router-link to="/cases" class="text-xs text-blue-400 hover:text-blue-300 font-medium">View All Cases →</router-link>
          </div>

          <!-- Empty Cases State -->
          <div v-if="stats.priorityCases.length === 0" class="py-8 text-center text-gray-400 border border-dashed border-gray-700 rounded-lg">
            <p class="text-sm">No active cases registered in the system.</p>
            <button @click="showCreateModal = true" class="mt-2 text-xs text-blue-400 hover:underline">Create a new case</button>
          </div>

          <!-- Cases List -->
          <div v-else class="space-y-3 flex-1">
            <div 
              v-for="c in stats.priorityCases" 
              :key="c._id" 
              class="bg-gray-900/70 border border-gray-700/80 rounded-lg p-3.5 hover:border-gray-600 transition flex flex-col justify-between"
            >
              <div class="flex items-start justify-between gap-2 mb-2">
                <div>
                  <router-link :to="{ name: 'CaseDetail', params: { id: c._id } }" class="text-sm font-semibold text-white hover:text-blue-400 transition">
                    {{ c.title }}
                  </router-link>
                  <p class="text-xs text-gray-400 line-clamp-1 mt-0.5">{{ c.description || 'No description' }}</p>
                </div>
                <span :class="statusBadgeClass(c.status)" class="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                  {{ c.status }}
                </span>
              </div>

              <div class="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800">
                <div class="flex items-center space-x-3">
                  <span class="flex items-center space-x-1">
                    <span class="text-gray-500">Evidence:</span>
                    <span class="font-mono text-gray-200 font-bold">{{ c.evidenceCount }}</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <span class="text-gray-500">Hypotheses:</span>
                    <span class="font-mono text-gray-200 font-bold">{{ c.hypothesisCount }}</span>
                  </span>
                </div>
                <router-link :to="{ name: 'CaseDetail', params: { id: c._id } }" class="text-xs text-blue-400 hover:underline font-medium">
                  Workspace →
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Investigation Activity / Audit Trail -->
        <div class="bg-gray-800 rounded-lg border border-gray-700 p-5 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-gray-300">Live Investigation Feed</h2>
              <span class="bg-emerald-950 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-mono">AUDIT VERIFIED</span>
            </div>
            <router-link to="/audit" class="text-xs text-blue-400 hover:text-blue-300 font-medium">Full Audit Log →</router-link>
          </div>

          <!-- Empty Activity State -->
          <div v-if="stats.recentActivity.length === 0" class="py-8 text-center text-gray-400 border border-dashed border-gray-700 rounded-lg">
            <p class="text-sm">No activity recorded yet.</p>
          </div>

          <!-- Activity List -->
          <div v-else class="space-y-2.5 flex-1 max-h-[380px] overflow-y-auto pr-1">
            <div 
              v-for="log in stats.recentActivity" 
              :key="log._id"
              class="bg-gray-900/60 border border-gray-800/80 rounded-lg p-3 text-xs flex items-start justify-between gap-3 hover:border-gray-700 transition"
            >
              <div class="flex items-start space-x-2.5">
                <div class="p-1.5 rounded bg-gray-800 text-gray-300 mt-0.5 flex-shrink-0">
                  <svg v-if="log.action.includes('EVIDENCE')" class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <svg v-else-if="log.action.includes('HYPOTHESIS')" class="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  <svg v-else-if="log.action.includes('STATUS')" class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  <svg v-else class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-white">
                    <span class="text-blue-300 font-semibold">{{ log.user?.name || log.user?.username || 'Agent' }}</span>
                    <span class="text-gray-400"> executed </span>
                    <span class="font-mono text-xs text-amber-300">{{ formatAction(log.action) }}</span>
                  </div>
                  <div v-if="log.details" class="text-gray-400 text-xs mt-0.5 line-clamp-1">
                    <span v-if="log.details.title">Target: "{{ log.details.title }}"</span>
                    <span v-else-if="log.details.status">Status → {{ log.details.status }}</span>
                    <span v-else>{{ JSON.stringify(log.details) }}</span>
                  </div>
                </div>
              </div>

              <div class="text-right flex-shrink-0 text-gray-500 font-mono text-[11px]">
                {{ formatTime(log.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CREATE CASE MODAL -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <div class="bg-gray-800 border border-gray-700 rounded-lg max-w-md w-full p-6 shadow-2xl">
        <h3 class="text-xl font-bold text-white mb-4">Create New Case</h3>
        
        <form @submit.prevent="createCase" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Case Title *</label>
            <input 
              v-model="newCase.title" 
              required 
              type="text" 
              placeholder="e.g. Incident 2026-X: Ransomware Infection" 
              class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Case Description</label>
            <textarea 
              v-model="newCase.description" 
              rows="3" 
              placeholder="Brief summary of investigation scope and objectives..." 
              class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-700">
            <button 
              type="button" 
              @click="showCreateModal = false" 
              class="px-4 py-2 text-sm text-gray-300 hover:text-white rounded transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="creatingCase" 
              class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded transition disabled:opacity-50"
            >
              <span v-if="creatingCase">Creating...</span>
              <span v-else>Initialize Case</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { apiFetch } from '../utils/api';

const router = useRouter();
const authStore = useAuthStore();

const stats = ref(null);
const loading = ref(true);
const error = ref(null);

const showCreateModal = ref(false);
const creatingCase = ref(false);
const newCase = ref({ title: '', description: '' });

const fetchDashboardData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await apiFetch('/api/dashboard/stats');
    if (res.success && res.data) {
      stats.value = res.data;
    } else {
      error.value = res.error || 'Failed to load dashboard statistics';
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
    error.value = 'Network error while fetching dashboard statistics';
  } finally {
    loading.value = false;
  }
};

const createCase = async () => {
  if (!newCase.value.title.trim()) return;
  creatingCase.value = true;
  try {
    const res = await apiFetch('/api/cases', {
      method: 'POST',
      body: JSON.stringify(newCase.value)
    });
    if (res.success && res.data) {
      showCreateModal.value = false;
      newCase.value = { title: '', description: '' };
      // Navigate straight to the new case workspace or refresh dashboard
      await fetchDashboardData();
      router.push({ name: 'CaseDetail', params: { id: res.data._id } });
    } else {
      alert(res.error || 'Failed to create case');
    }
  } catch (err) {
    console.error(err);
    alert('Error creating case');
  } finally {
    creatingCase.value = false;
  }
};

// Verification percentages
const verifiedPct = computed(() => {
  if (!stats.value?.metrics.totalEvidence) return 0;
  return Math.round((stats.value.metrics.verifiedEvidence / stats.value.metrics.totalEvidence) * 100);
});

const disputedPct = computed(() => {
  if (!stats.value?.metrics.totalEvidence) return 0;
  return Math.round((stats.value.metrics.disputedEvidence / stats.value.metrics.totalEvidence) * 100);
});

const rejectedPct = computed(() => {
  if (!stats.value?.metrics.totalEvidence) return 0;
  return Math.round((stats.value.metrics.rejectedEvidence / stats.value.metrics.totalEvidence) * 100);
});

const unverifiedPct = computed(() => {
  if (!stats.value?.metrics.totalEvidence) return 0;
  return Math.round((stats.value.metrics.unverifiedEvidence / stats.value.metrics.totalEvidence) * 100);
});

const verificationRate = computed(() => {
  if (!stats.value?.metrics.totalEvidence) return 0;
  return verifiedPct.value;
});

const statusBadgeClass = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-900/80 text-blue-300 border border-blue-700';
    case 'INVESTIGATING': return 'bg-yellow-900/80 text-yellow-300 border border-yellow-700';
    case 'REVIEW': return 'bg-purple-900/80 text-purple-300 border border-purple-700';
    case 'RESOLVED': return 'bg-green-900/80 text-green-300 border border-green-700';
    case 'ARCHIVED': return 'bg-gray-700 text-gray-300 border border-gray-600';
    default: return 'bg-gray-800 text-gray-400 border border-gray-700';
  }
};

const formatAction = (action) => {
  if (!action) return 'ACTION';
  return action.replace(/_/g, ' ');
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
};

onMounted(() => {
  fetchDashboardData();
});
</script>
