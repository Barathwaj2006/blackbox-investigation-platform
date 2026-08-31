<template>
  <div class="space-y-6">
    <!-- Top Bar: Title, Live Status & Quick Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
      <div>
        <div class="flex items-center space-x-3">
          <h1 class="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-mono">INVESTIGATION COMMAND CENTER</h1>
          <span class="inline-flex items-center px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[11px] font-mono font-bold tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            LIVE TELEMETRY
          </span>
        </div>
        <p class="text-slate-400 text-xs sm:text-sm mt-0.5">Real-time intelligence aggregation, evidence verification pipelines, and hypothesis tracking.</p>
      </div>

      <!-- Quick Actions -->
      <div class="flex flex-wrap items-center gap-2">
        <button 
          v-if="['Admin', 'Investigator'].includes(authStore.user?.role)"
          @click="showCreateModal = true" 
          class="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center space-x-1.5 shadow-md shadow-blue-900/30 active:scale-95"
        >
          <span>+ Create Case</span>
        </button>
        <router-link 
          to="/cases" 
          class="bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1"
        >
          <span>Open Cases</span>
        </router-link>
        <router-link 
          to="/audit" 
          class="bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1"
        >
          <span>Audit Log</span>
        </router-link>
        <button 
          @click="fetchDashboardData" 
          :disabled="loading"
          class="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700/80 transition"
          title="Refresh Data"
        >
          <svg :class="{ 'animate-spin': loading }" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Error Banner -->
    <div v-if="error" class="bg-rose-950/70 border border-rose-800 text-rose-200 p-3.5 rounded-lg flex items-center justify-between shadow-lg">
      <div class="flex items-center space-x-2">
        <svg class="w-4 h-4 text-rose-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span class="text-xs font-medium">{{ error }}</span>
      </div>
      <button @click="fetchDashboardData" class="text-xs bg-rose-900 hover:bg-rose-800 text-white px-2.5 py-1 rounded">Retry</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !stats" class="py-20 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
      <div class="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
      <span class="text-xs font-mono text-slate-400">Aggregating telemetry & case intelligence...</span>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="stats" class="space-y-6">
      <!-- 1. DYNAMIC SUMMARY METRICS GRID -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <!-- Metric 1: Total Cases -->
        <div class="bg-[#0B0F19] border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 hover:bg-[#0D1322] transition shadow-sm group">
          <div class="flex items-center justify-between text-slate-400 mb-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Total Cases</span>
            <div class="p-1 rounded bg-slate-800/80 text-blue-400 group-hover:scale-105 transition">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">{{ stats.metrics.totalCases }}</div>
          <div class="text-[11px] text-slate-400 mt-2 flex items-center space-x-1.5 pt-2 border-t border-slate-800/60 font-mono">
            <span class="text-blue-400 font-bold">{{ stats.metrics.activeInvestigations }} Active</span>
            <span class="text-slate-600">•</span>
            <span class="text-purple-400 font-bold">{{ stats.metrics.casesUnderReview }} In Review</span>
          </div>
        </div>

        <!-- Metric 2: Active Investigations -->
        <div class="bg-[#0B0F19] border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 hover:bg-[#0D1322] transition shadow-sm group">
          <div class="flex items-center justify-between text-slate-400 mb-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Active Ops</span>
            <div class="p-1 rounded bg-slate-800/80 text-amber-400 group-hover:scale-105 transition">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">{{ stats.metrics.activeInvestigations }}</div>
          <div class="text-[11px] text-slate-400 mt-2 flex items-center space-x-1.5 pt-2 border-t border-slate-800/60 font-mono">
            <span class="text-emerald-400 font-bold">{{ stats.metrics.resolvedCases }} Resolved</span>
            <span class="text-slate-600">•</span>
            <span class="text-slate-500">{{ stats.statusDistribution.OPEN || 0 }} Open</span>
          </div>
        </div>

        <!-- Metric 3: Total Evidence & Verification State -->
        <div class="bg-[#0B0F19] border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 hover:bg-[#0D1322] transition shadow-sm group">
          <div class="flex items-center justify-between text-slate-400 mb-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Evidence Dossiers</span>
            <div class="p-1 rounded bg-slate-800/80 text-emerald-400 group-hover:scale-105 transition">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">{{ stats.metrics.totalEvidence }}</div>
          <div class="text-[11px] text-slate-400 mt-2 flex items-center space-x-1.5 pt-2 border-t border-slate-800/60 font-mono">
            <span class="text-emerald-400 font-bold">{{ stats.metrics.verifiedEvidence }} Verified ({{ verificationRate }}%)</span>
          </div>
        </div>

        <!-- Metric 4: Active Hypotheses -->
        <div class="bg-[#0B0F19] border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 hover:bg-[#0D1322] transition shadow-sm group">
          <div class="flex items-center justify-between text-slate-400 mb-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Hypotheses</span>
            <div class="p-1 rounded bg-slate-800/80 text-indigo-400 group-hover:scale-105 transition">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-indigo-400 font-mono tracking-tight">{{ stats.metrics.activeHypotheses }}</div>
          <div class="text-[11px] text-slate-400 mt-2 flex items-center space-x-1.5 pt-2 border-t border-slate-800/60 font-mono">
            <span class="text-slate-300">Scoring Engine: <strong class="text-emerald-400">ACTIVE</strong></span>
          </div>
        </div>
      </div>

      <!-- 2. INVESTIGATION HEALTH & LIFECYCLE DISTRIBUTION -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Verification Progress Card -->
        <div class="bg-[#0B0F19] rounded-xl border border-slate-800/90 p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">Verification Health</h2>
              <span class="text-xs font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                {{ verificationRate }}% Rate
              </span>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex mb-4">
              <div :style="{ width: `${verifiedPct}%` }" class="bg-emerald-500 h-full transition-all duration-500" title="Verified"></div>
              <div :style="{ width: `${disputedPct}%` }" class="bg-amber-500 h-full transition-all duration-500" title="Disputed"></div>
              <div :style="{ width: `${rejectedPct}%` }" class="bg-rose-500 h-full transition-all duration-500" title="Rejected"></div>
              <div :style="{ width: `${unverifiedPct}%` }" class="bg-slate-600 h-full transition-all duration-500" title="Unverified"></div>
            </div>

            <!-- Breakdown Legend -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800/70">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="text-slate-300 text-[11px]">Verified (1.0x):</span>
                <span class="font-bold text-white ml-auto font-mono text-[11px]">{{ stats.metrics.verifiedEvidence }}</span>
              </div>
              <div class="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800/70">
                <span class="w-2 h-2 rounded-full bg-slate-500"></span>
                <span class="text-slate-300 text-[11px]">Pending (0.5x):</span>
                <span class="font-bold text-white ml-auto font-mono text-[11px]">{{ stats.metrics.unverifiedEvidence }}</span>
              </div>
              <div class="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800/70">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span class="text-slate-300 text-[11px]">Disputed (0.2x):</span>
                <span class="font-bold text-white ml-auto font-mono text-[11px]">{{ stats.metrics.disputedEvidence }}</span>
              </div>
              <div class="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800/70">
                <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                <span class="text-slate-300 text-[11px]">Rejected (0.0x):</span>
                <span class="font-bold text-white ml-auto font-mono text-[11px]">{{ stats.metrics.rejectedEvidence }}</span>
              </div>
            </div>
          </div>
          
          <div class="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            * Unverified evidence applies a 50% discount to hypothesis weights.
          </div>
        </div>

        <!-- Case Lifecycle Distribution Card -->
        <div class="bg-[#0B0F19] rounded-xl border border-slate-800/90 p-5 lg:col-span-2 flex flex-col justify-between shadow-sm">
          <div>
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">Case Lifecycle Pipeline</h2>
              <span class="text-xs text-slate-400 font-mono">{{ stats.metrics.totalCases }} Total Cases</span>
            </div>

            <!-- Pipeline Visual Blocks -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-2">
              <router-link to="/cases" class="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-center hover:border-slate-700 transition">
                <div class="text-[10px] text-slate-400 font-bold font-mono uppercase mb-0.5">DRAFT</div>
                <div class="text-lg font-bold font-mono text-slate-300">{{ stats.statusDistribution.DRAFT }}</div>
              </router-link>
              <router-link to="/cases" class="bg-blue-950/40 border border-blue-800/40 p-2.5 rounded-lg text-center hover:border-blue-700 transition">
                <div class="text-[10px] text-blue-400 font-bold font-mono uppercase mb-0.5">OPEN</div>
                <div class="text-lg font-bold font-mono text-blue-300">{{ stats.statusDistribution.OPEN }}</div>
              </router-link>
              <router-link to="/cases" class="bg-amber-950/40 border border-amber-800/40 p-2.5 rounded-lg text-center hover:border-amber-700 transition">
                <div class="text-[10px] text-amber-400 font-bold font-mono uppercase mb-0.5">INVESTIGATING</div>
                <div class="text-lg font-bold font-mono text-amber-300">{{ stats.statusDistribution.INVESTIGATING }}</div>
              </router-link>
              <router-link to="/cases" class="bg-purple-950/40 border border-purple-800/40 p-2.5 rounded-lg text-center hover:border-purple-700 transition">
                <div class="text-[10px] text-purple-400 font-bold font-mono uppercase mb-0.5">REVIEW</div>
                <div class="text-lg font-bold font-mono text-purple-300">{{ stats.statusDistribution.REVIEW }}</div>
              </router-link>
              <router-link to="/cases" class="bg-emerald-950/40 border border-emerald-800/40 p-2.5 rounded-lg text-center hover:border-emerald-700 transition">
                <div class="text-[10px] text-emerald-400 font-bold font-mono uppercase mb-0.5">RESOLVED</div>
                <div class="text-lg font-bold font-mono text-emerald-300">{{ stats.statusDistribution.RESOLVED }}</div>
              </router-link>
              <router-link to="/cases" class="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-center hover:border-slate-700 transition">
                <div class="text-[10px] text-slate-400 font-bold font-mono uppercase mb-0.5">ARCHIVED</div>
                <div class="text-lg font-bold font-mono text-slate-400">{{ stats.statusDistribution.ARCHIVED }}</div>
              </router-link>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Investigative status gates RBAC access & mathematical scoring.</span>
            <router-link to="/cases" class="text-blue-400 hover:text-blue-300 font-medium">Manage All Cases →</router-link>
          </div>
        </div>
      </div>

      <!-- 3. PRIORITY CASES & RECENT INVESTIGATION ACTIVITY -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Priority Active Cases -->
        <div class="bg-[#0B0F19] rounded-xl border border-slate-800/90 p-5 flex flex-col shadow-sm">
          <div class="flex items-center justify-between mb-3.5">
            <div class="flex items-center space-x-2">
              <h2 class="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">Active Case Dossiers</h2>
              <span class="bg-blue-950 text-blue-400 text-[10px] px-2 py-0.2 rounded font-mono font-bold">{{ stats.priorityCases.length }}</span>
            </div>
            <router-link to="/cases" class="text-xs text-blue-400 hover:text-blue-300 font-medium">View Registry →</router-link>
          </div>

          <!-- Empty Cases State -->
          <div v-if="stats.priorityCases.length === 0" class="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
            <p class="text-xs">No active cases registered in the system.</p>
            <button @click="showCreateModal = true" class="mt-2 text-xs text-blue-400 hover:underline">Create a new case</button>
          </div>

          <!-- Cases List -->
          <div v-else class="space-y-2.5 flex-1">
            <div 
              v-for="c in stats.priorityCases" 
              :key="c._id" 
              class="bg-[#0D1322]/80 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition flex flex-col justify-between group"
            >
              <div class="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <router-link :to="{ name: 'CaseDetail', params: { id: c._id } }" class="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition">
                    {{ c.title }}
                  </router-link>
                  <p class="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{{ c.description || 'No description provided' }}</p>
                </div>
                <span :class="statusBadgeClass(c.status)" class="text-[10px] px-2 py-0.2 rounded font-mono font-bold uppercase whitespace-nowrap">
                  {{ c.status }}
                </span>
              </div>

              <div class="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                <div class="flex items-center space-x-3">
                  <span class="flex items-center space-x-1">
                    <span class="text-slate-500">Ev:</span>
                    <span class="text-slate-200 font-bold">{{ c.evidenceCount }}</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <span class="text-slate-500">Hyp:</span>
                    <span class="text-slate-200 font-bold">{{ c.hypothesisCount }}</span>
                  </span>
                </div>
                <router-link :to="{ name: 'CaseDetail', params: { id: c._id } }" class="text-blue-400 hover:text-blue-300 font-medium">
                  Open Dossier →
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Investigation Activity / Audit Trail -->
        <div class="bg-[#0B0F19] rounded-xl border border-slate-800/90 p-5 flex flex-col shadow-sm">
          <div class="flex items-center justify-between mb-3.5">
            <div class="flex items-center space-x-2">
              <h2 class="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">Live Investigation Feed</h2>
              <span class="bg-emerald-950/80 text-emerald-400 text-[10px] px-2 py-0.2 rounded font-mono font-bold border border-emerald-800/40">AUDIT VERIFIED</span>
            </div>
            <router-link to="/audit" class="text-xs text-blue-400 hover:text-blue-300 font-medium">Full Log →</router-link>
          </div>

          <!-- Empty Activity State -->
          <div v-if="stats.recentActivity.length === 0" class="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
            <p class="text-xs">No operational activity recorded yet.</p>
          </div>

          <!-- Activity List -->
          <div v-else class="space-y-2 flex-1 max-h-[380px] overflow-y-auto pr-1">
            <div 
              v-for="log in stats.recentActivity" 
              :key="log._id"
              class="bg-[#0D1322]/80 border border-slate-800/80 rounded-lg p-2.5 text-xs flex items-start justify-between gap-3 hover:border-slate-700 transition"
            >
              <div class="flex items-start space-x-2.5 min-w-0">
                <div class="p-1.5 rounded bg-slate-800 text-slate-300 mt-0.5 flex-shrink-0">
                  <svg v-if="log.action.includes('EVIDENCE')" class="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <svg v-else-if="log.action.includes('HYPOTHESIS')" class="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  <svg v-else-if="log.action.includes('STATUS')" class="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  <svg v-else class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="min-w-0">
                  <div class="font-medium text-white truncate text-[11px]">
                    <span class="text-blue-300 font-semibold">{{ log.user?.name || log.user?.username || 'Agent' }}</span>
                    <span class="text-slate-400"> executed </span>
                    <span class="font-mono text-[10px] text-amber-300">{{ formatAction(log.action) }}</span>
                  </div>
                  <div v-if="log.details" class="text-slate-400 text-[10px] font-mono mt-0.5 truncate">
                    <span v-if="log.details.title">Target: "{{ log.details.title }}"</span>
                    <span v-else-if="log.details.status">Status → {{ log.details.status }}</span>
                    <span v-else>{{ JSON.stringify(log.details) }}</span>
                  </div>
                </div>
              </div>

              <div class="text-right flex-shrink-0 text-slate-500 font-mono text-[10px]">
                {{ formatTime(log.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CREATE CASE MODAL -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
      <div class="bg-[#0B0F19] border border-slate-700/80 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-bold text-white font-mono uppercase tracking-wide">Initialize Case Dossier</h3>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-white p-1 rounded">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="createCase" class="space-y-4">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-mono">Case Title *</label>
            <input 
              v-model="newCase.title" 
              required 
              type="text" 
              placeholder="e.g. Incident 2026-X: Ransomware Infiltration" 
              class="w-full bg-[#0D1322] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-mono">Investigation Scope</label>
            <textarea 
              v-model="newCase.description" 
              rows="3" 
              placeholder="Brief summary of investigation scope and technical objectives..." 
              class="w-full bg-[#0D1322] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <button 
              type="button" 
              @click="showCreateModal = false" 
              class="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="creatingCase" 
              class="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition disabled:opacity-50 shadow-md shadow-blue-900/30"
            >
              <span v-if="creatingCase">Initializing...</span>
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
    case 'OPEN': return 'bg-blue-950/80 text-blue-400 border border-blue-800';
    case 'INVESTIGATING': return 'bg-amber-950/80 text-amber-400 border border-amber-800';
    case 'REVIEW': return 'bg-purple-950/80 text-purple-400 border border-purple-800';
    case 'RESOLVED': return 'bg-emerald-950/80 text-emerald-400 border border-emerald-800';
    case 'ARCHIVED': return 'bg-slate-800 text-slate-400 border border-slate-700';
    default: return 'bg-slate-800 text-slate-400 border border-slate-700';
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
