<template>
  <div v-if="loading" class="text-gray-400 py-20 text-center flex flex-col items-center justify-center space-y-4">
    <div class="relative w-12 h-12">
      <div class="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
      <div class="absolute inset-0 flex items-center justify-center text-xs font-mono text-blue-400">BB</div>
    </div>
    <div class="space-y-1">
      <div class="text-sm font-semibold text-gray-200">Loading Case Intelligence Dossier...</div>
      <div class="text-xs text-gray-500 font-mono">Synchronizing evidence graphs, hypotheses, and audit telemetry</div>
    </div>
  </div>

  <div v-else-if="caseItem" class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- Status / Action Notification Banner -->
    <div 
      v-if="actionMessage" 
      :class="[
        actionMessage.type === 'error' ? 'bg-rose-950/90 border-rose-700 text-rose-200' : 'bg-emerald-950/90 border-emerald-700 text-emerald-200',
        'p-3.5 rounded-lg border flex justify-between items-center text-sm shadow-xl transition animate-fadeIn'
      ]"
    >
      <div class="flex items-center space-x-2.5">
        <span v-if="actionMessage.type === 'error'" class="text-rose-400 font-bold">✕</span>
        <span v-else class="text-emerald-400 font-bold">✓</span>
        <span class="font-medium">{{ actionMessage.text }}</span>
      </div>
      <button @click="actionMessage = null" class="text-xs opacity-75 hover:opacity-100 font-bold px-2 py-1">Dismiss</button>
    </div>

    <!-- ==================== 1. CASE HEADER ==================== -->
    <div class="bg-gray-800/95 border border-gray-700 rounded-xl p-6 shadow-xl relative overflow-hidden">
      <!-- Ambient decorative glow -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
        <div class="space-y-2 flex-1">
          <!-- Top metadata row -->
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="font-mono text-xs px-2.5 py-0.5 rounded bg-gray-900 text-blue-400 border border-gray-700 font-semibold tracking-wider">
              ID: {{ caseItem._id }}
            </span>
            <span :class="priorityBadgeClass(computedPriority)" class="text-xs px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
              {{ computedPriority }} PRIORITY
            </span>
            <span :class="statusBadgeClass(caseItem.status)" class="text-xs px-3 py-0.5 rounded-full font-semibold uppercase tracking-wider">
              {{ caseItem.status }}
            </span>
            <span class="text-xs text-gray-400 font-mono flex items-center space-x-1">
              <span>👤 Investigator:</span>
              <strong class="text-gray-200">{{ investigatorName }}</strong>
            </span>
          </div>

          <!-- Case Title -->
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {{ caseItem.title }}
          </h1>

          <!-- Case Scope / Description -->
          <p class="text-gray-300 text-sm max-w-4xl leading-relaxed">
            {{ caseItem.description || 'No detailed scope summary specified for this case dossier.' }}
          </p>

          <!-- Timeline metadata -->
          <div class="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1 font-mono">
            <span>Opened: <strong class="text-gray-300">{{ formatDateTime(caseItem.createdAt) }}</strong></span>
            <span v-if="caseItem.updatedAt && caseItem.updatedAt !== caseItem.createdAt">
              Last Mutation: <strong class="text-gray-300">{{ formatDateTime(caseItem.updatedAt) }}</strong>
            </span>
          </div>
        </div>

        <!-- Lifecycle Control & Case Attention Indicator -->
        <div class="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 w-full lg:w-auto self-stretch lg:self-auto border-t lg:border-t-0 border-gray-700/80 pt-4 lg:pt-0">
          <div class="bg-gray-900/90 border border-gray-700 p-3 rounded-lg flex items-center justify-between sm:justify-start space-x-3 w-full lg:w-auto shadow-inner">
            <label class="text-xs text-gray-400 uppercase font-semibold tracking-wider whitespace-nowrap">Case Status:</label>
            <select 
              v-model="caseItem.status" 
              @change="updateStatus" 
              :disabled="statusUpdating"
              class="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="OPEN">OPEN</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="REVIEW">REVIEW</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <!-- Prominent Health / Attention Status Badge -->
          <div :class="caseHealthBoxClass" class="w-full lg:w-auto px-3.5 py-2 rounded-lg border text-xs flex items-center justify-between space-x-3">
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full animate-pulse" :class="caseHealthDotClass"></span>
              <span class="font-bold">{{ caseHealthText }}</span>
            </div>
            <span class="text-[11px] font-mono opacity-80">{{ attentionItems.length }} alerts</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 6. QUICK ACTIONS TOOLBAR ==================== -->
    <div class="bg-gray-900/90 border border-gray-700/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
      <div class="flex items-center space-x-2">
        <span class="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">Actions:</span>
        <div class="flex flex-wrap gap-2">
          <button 
            @click="openAddEvidenceModal" 
            class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow"
          >
            <span>+ Add Evidence</span>
          </button>
          <button 
            @click="openCreateHypothesisModal" 
            class="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow"
          >
            <span>+ Create Hypothesis</span>
          </button>
          <button 
            v-if="hypotheses.length > 0 && evidence.length > 0"
            @click="openLinkEvidenceModal(null)" 
            class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow"
          >
            <span>🔗 Link Evidence</span>
          </button>
          <button 
            @click="quickReviewPendingEvidence" 
            class="bg-amber-600/80 hover:bg-amber-600 text-amber-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 border border-amber-500/30"
          >
            <span>⚡ Review Evidence ({{ unverifiedEvidenceCount }})</span>
          </button>
        </div>
      </div>

      <!-- Advance Lifecycle Shortcut Button -->
      <button 
        @click="advanceCaseLifecycle" 
        :disabled="statusUpdating || caseItem.status === 'RESOLVED' || caseItem.status === 'ARCHIVED'"
        class="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 disabled:opacity-40"
      >
        <span>Advance Stage ➔</span>
      </button>
    </div>

    <!-- ==================== 8. CASE NAVIGATION TABS ==================== -->
    <div class="border-b border-gray-700">
      <nav class="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
        <button 
          @click="tab = 'overview'" 
          :class="[tab === 'overview' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500', 'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors']"
        >
          <span>Investigation Overview</span>
          <span v-if="attentionItems.length > 0" class="bg-amber-900/80 text-amber-300 border border-amber-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {{ attentionItems.length }}
          </span>
        </button>
        <button 
          @click="tab = 'evidence'" 
          :class="[tab === 'evidence' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500', 'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors']"
        >
          <span>Evidence Collection</span>
          <span class="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full font-mono">{{ evidence.length }}</span>
        </button>
        <button 
          @click="tab = 'hypotheses'" 
          :class="[tab === 'hypotheses' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500', 'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors']"
        >
          <span>Competing Hypotheses</span>
          <span class="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full font-mono">{{ hypotheses.length }}</span>
        </button>
        <button 
          @click="tab = 'map'" 
          :class="[tab === 'map' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500', 'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors']"
        >
          <span>Interactive Evidence Map</span>
          <span class="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full font-mono">{{ caseRelationships.length }}</span>
        </button>
        <button 
          @click="tab = 'timeline'" 
          :class="[tab === 'timeline' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500', 'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors']"
        >
          <span>Timeline Stream</span>
          <span class="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full font-mono">{{ timelineLogs.length }}</span>
        </button>
        <button 
          @click="tab = 'audit'" 
          :class="[tab === 'audit' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500', 'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors']"
        >
          <span>Case Audit Log</span>
          <span class="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full font-mono">{{ caseAuditLogs.length }}</span>
        </button>
      </nav>
    </div>

    <!-- ==================== TAB 0: INVESTIGATION OVERVIEW ==================== -->
    <div v-if="tab === 'overview'" class="space-y-6">
      <!-- 2. INVESTIGATION METRICS CARDS -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <!-- Total Evidence -->
        <div class="bg-gray-800/90 border border-gray-700 p-4 rounded-xl shadow flex flex-col justify-between">
          <span class="text-xs uppercase font-semibold text-gray-400">Total Evidence</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-2">{{ evidence.length }}</div>
          <span class="text-[11px] text-gray-400 mt-1">Cataloged items</span>
        </div>

        <!-- Verified Evidence -->
        <div class="bg-gray-800/90 border border-emerald-800/40 p-4 rounded-xl shadow flex flex-col justify-between">
          <span class="text-xs uppercase font-semibold text-emerald-400">Verified Evidence</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono mt-2">{{ verifiedEvidenceCount }}</div>
          <span class="text-[11px] text-emerald-400/80 mt-1">1.0 weight multiplier</span>
        </div>

        <!-- Pending Verification -->
        <div class="bg-gray-800/90 border border-amber-800/40 p-4 rounded-xl shadow flex flex-col justify-between">
          <span class="text-xs uppercase font-semibold text-amber-400">Pending Review</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono mt-2">{{ unverifiedEvidenceCount }}</div>
          <span class="text-[11px] text-amber-400/80 mt-1">0.5 weight multiplier</span>
        </div>

        <!-- Disputed / Rejected -->
        <div class="bg-gray-800/90 border border-rose-800/40 p-4 rounded-xl shadow flex flex-col justify-between">
          <span class="text-xs uppercase font-semibold text-rose-400">Disputed / Rejected</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-rose-300 font-mono mt-2">{{ disputedOrRejectedCount }}</div>
          <span class="text-[11px] text-rose-400/80 mt-1">0.0 - 0.2 multiplier</span>
        </div>

        <!-- Hypotheses Count -->
        <div class="bg-gray-800/90 border border-purple-800/40 p-4 rounded-xl shadow flex flex-col justify-between">
          <span class="text-xs uppercase font-semibold text-purple-400">Hypotheses</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono mt-2">{{ hypotheses.length }}</div>
          <span class="text-[11px] text-purple-400/80 mt-1">Competing theories</span>
        </div>

        <!-- Leading Hypothesis Score -->
        <div class="bg-gray-800/90 border border-blue-800/40 p-4 rounded-xl shadow flex flex-col justify-between">
          <span class="text-xs uppercase font-semibold text-blue-400">Leading Score</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-blue-300 font-mono mt-2">
            {{ leadingHypothesis ? leadingHypothesis.score?.toFixed(2) : '0.00' }}
          </div>
          <span class="text-[11px] text-blue-400/80 mt-1 truncate" :title="leadingHypothesis?.title || 'None'">
            {{ leadingHypothesis ? leadingHypothesis.title : 'None active' }}
          </span>
        </div>
      </div>

      <!-- Investigation Intelligence Signals Area -->
      <InvestigationSignals 
        :evidence="evidence" 
        :hypotheses="hypotheses" 
        :relationships="caseRelationships" 
        :score-history="scoreHistory"
        @open-history="() => openScoreHistoryDrawer()"
      />

      <!-- Investigation Intelligence Summary & Velocity Bar -->
      <div v-if="intelligenceSummary" class="bg-gray-900/90 border border-purple-900/40 rounded-xl p-4 shadow-lg space-y-3">
        <div class="flex items-center justify-between border-b border-gray-800 pb-2">
          <div class="flex items-center space-x-2">
            <span class="text-purple-400 font-bold text-sm">📈</span>
            <h3 class="text-xs font-bold uppercase tracking-wider text-gray-200">Investigation Intelligence & Score Evolution Summary</h3>
          </div>
          <button 
            @click="openScoreHistoryDrawer()" 
            class="text-[10px] font-mono text-purple-400 hover:text-purple-300 font-bold underline"
          >
            Inspect Full History ({{ scoreHistory.length }} events) ➔
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <!-- Leading Theory & Momentum -->
          <div class="bg-gray-950/80 p-3 rounded-lg border border-gray-800 space-y-1">
            <span class="text-gray-400 block text-[10px] uppercase font-bold">Leading Theory Momentum</span>
            <div class="text-white font-bold truncate">
              {{ intelligenceSummary.leadingTheory?.title || 'None active' }}
            </div>
            <div class="font-mono text-[11px] flex items-center space-x-2">
              <span :class="(intelligenceSummary.leadingTheory?.score || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'">
                Score: {{ (intelligenceSummary.leadingTheory?.score || 0).toFixed(2) }}
              </span>
              <span v-if="intelligenceSummary.leadingTheory?.netMovement" class="text-gray-400 text-[10px]">
                (Net: {{ intelligenceSummary.leadingTheory.netMovement > 0 ? '+' : '' }}{{ intelligenceSummary.leadingTheory.netMovement.toFixed(2) }})
              </span>
            </div>
          </div>

          <!-- Top Positive Catalyst -->
          <div class="bg-gray-950/80 p-3 rounded-lg border border-gray-800 space-y-1">
            <span class="text-emerald-400 block text-[10px] uppercase font-bold">Top Positive Score Catalyst</span>
            <div v-if="intelligenceSummary.topPositiveDriver" class="space-y-0.5">
              <div class="text-white font-bold truncate">
                {{ intelligenceSummary.topPositiveDriver.evidenceTitle || intelligenceSummary.topPositiveDriver.hypothesisTitle }}
              </div>
              <div class="font-mono text-emerald-300 text-[11px]">
                ▲ +{{ Number(intelligenceSummary.topPositiveDriver.delta).toFixed(2) }} ({{ intelligenceSummary.topPositiveDriver.triggerType }})
              </div>
            </div>
            <div v-else class="text-gray-500 italic text-[11px]">No positive mutations yet</div>
          </div>

          <!-- Total Score Mutations & Velocity -->
          <div class="bg-gray-950/80 p-3 rounded-lg border border-gray-800 space-y-1">
            <span class="text-purple-300 block text-[10px] uppercase font-bold">Intelligence Velocity</span>
            <div class="text-white font-mono font-bold">
              {{ scoreHistory.length }} Historical Events
            </div>
            <div class="text-gray-400 text-[10px] truncate">
              {{ evidence.length }} evidence items • {{ caseRelationships.length }} relational links
            </div>
          </div>
        </div>
      </div>

      <!-- Main Overview Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 7. INVESTIGATION ATTENTION / NEEDS ATTENTION AREA -->
        <div class="lg:col-span-1 space-y-4">
          <div class="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow">
            <div class="flex items-center justify-between mb-4 border-b border-gray-700 pb-3">
              <div class="flex items-center space-x-2">
                <span class="text-amber-400 text-lg">⚠️</span>
                <h3 class="text-base font-bold text-white">Investigation Attention</h3>
              </div>
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-300 border border-gray-700">
                {{ attentionItems.length }} Items
              </span>
            </div>

            <!-- Empty State -->
            <div v-if="attentionItems.length === 0" class="text-center py-8 px-4 bg-gray-900/60 rounded-lg border border-gray-700/60">
              <span class="text-emerald-400 text-2xl block mb-2">✓</span>
              <p class="text-xs font-semibold text-gray-300">All Case Items Operational</p>
              <p class="text-[11px] text-gray-500 mt-1">All collected evidence is verified, hypotheses are linked, and no conflicts are unresolved.</p>
            </div>

            <!-- Attention Items List -->
            <div v-else class="space-y-3">
              <div 
                v-for="(item, idx) in attentionItems" 
                :key="idx"
                class="p-3 rounded-lg border text-xs transition space-y-1.5"
                :class="item.severity === 'high' ? 'bg-rose-950/40 border-rose-800 text-rose-200' : 'bg-amber-950/40 border-amber-800 text-amber-200'"
              >
                <div class="flex items-center justify-between font-bold">
                  <span>{{ item.title }}</span>
                  <span class="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded" :class="item.severity === 'high' ? 'bg-rose-900 text-rose-200' : 'bg-amber-900 text-amber-200'">
                    {{ item.type }}
                  </span>
                </div>
                <p class="text-[11px] opacity-90 leading-relaxed">{{ item.description }}</p>
                <div class="pt-1 flex justify-end">
                  <button 
                    @click="handleAttentionAction(item)"
                    class="text-[10px] font-semibold underline hover:opacity-100 opacity-80"
                  >
                    {{ item.actionLabel }} ➔
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Case Health Card -->
          <div class="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow space-y-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-gray-400">Intelligence Consensus Health</h3>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between items-center text-gray-300">
                <span>Evidence Verification Ratio:</span>
                <span class="font-mono font-bold text-white">{{ verificationRatio }}%</span>
              </div>
              <div class="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full transition-all duration-500" :style="{ width: verificationRatio + '%' }"></div>
              </div>

              <div class="flex justify-between items-center text-gray-300 pt-2">
                <span>Leading Theory Confidence:</span>
                <span class="font-mono font-bold text-white">
                  {{ leadingHypothesis ? Math.min(100, Math.max(0, Math.round(leadingHypothesis.score * 10))) : 0 }}%
                </span>
              </div>
              <div class="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                <div 
                  class="bg-blue-500 h-full transition-all duration-500" 
                  :style="{ width: (leadingHypothesis ? Math.min(100, Math.max(0, Math.round(leadingHypothesis.score * 10))) : 0) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Leading Hypothesis & Top Evidence Dossier -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Leading Hypothesis Card -->
          <div class="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow">
            <div class="flex items-center justify-between mb-3 border-b border-gray-700 pb-3">
              <div class="flex items-center space-x-2">
                <span class="text-purple-400 font-bold text-lg">💡</span>
                <h3 class="text-base font-bold text-white">Ranked Leading Hypothesis</h3>
              </div>
              <button @click="tab = 'hypotheses'" class="text-xs text-blue-400 hover:underline font-medium">
                View All Hypotheses ({{ hypotheses.length }}) ➔
              </button>
            </div>

            <div v-if="!leadingHypothesis" class="text-center py-8 text-xs text-gray-400">
              No hypotheses formulated. Click "+ Create Hypothesis" to begin comparative analysis.
            </div>

            <div v-else class="space-y-4">
              <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gray-900/80 p-4 rounded-xl border border-gray-700">
                <div class="space-y-1">
                  <div class="flex items-center space-x-2">
                    <span class="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono font-bold">
                      #1 RANKED
                    </span>
                    <h4 class="text-base font-bold text-white">{{ leadingHypothesis.title }}</h4>
                  </div>
                  <p class="text-xs text-gray-300 leading-relaxed">{{ leadingHypothesis.description || 'No theory summary.' }}</p>
                </div>
                <div class="text-right sm:self-center">
                  <div class="text-[10px] uppercase font-bold text-gray-400">Calculated Score</div>
                  <div class="text-2xl font-black font-mono" :class="leadingHypothesis.score > 0 ? 'text-emerald-400' : 'text-rose-400'">
                    {{ (leadingHypothesis.score || 0).toFixed(2) }}
                  </div>
                </div>
              </div>

              <!-- Top Explainability Snippet -->
              <div class="bg-gray-900/50 p-3.5 rounded-lg border border-gray-700/60 text-xs">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-semibold text-gray-300 uppercase tracking-wider">Top Mathematical Factor:</span>
                  <button @click="openExplainabilityModal(leadingHypothesis)" class="text-xs text-indigo-400 hover:underline font-mono">
                    Why this score? ➔
                  </button>
                </div>
                <div v-if="leadingHypothesis.explainability && leadingHypothesis.explainability.length > 0" class="font-mono text-emerald-300 text-xs bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
                  {{ leadingHypothesis.explainability[0] }}
                </div>
                <div v-else class="text-xs text-gray-500 italic">No linked evidence relationships yet.</div>
              </div>
            </div>
          </div>

          <!-- Recent Evidence Ingested -->
          <div class="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow">
            <div class="flex items-center justify-between mb-3 border-b border-gray-700 pb-3">
              <div class="flex items-center space-x-2">
                <span class="text-blue-400 font-bold text-lg">📁</span>
                <h3 class="text-base font-bold text-white">Recent Case Evidence</h3>
              </div>
              <button @click="tab = 'evidence'" class="text-xs text-blue-400 hover:underline font-medium">
                Open Full Evidence Catalog ({{ evidence.length }}) ➔
              </button>
            </div>

            <div v-if="evidence.length === 0" class="text-center py-8 text-xs text-gray-400">
              No evidence ingested yet.
            </div>

            <div v-else class="space-y-2.5">
              <div 
                v-for="ev in evidence.slice(0, 4)" 
                :key="ev._id"
                class="bg-gray-900/70 border border-gray-700/80 p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:border-gray-600 transition"
              >
                <div class="space-y-0.5">
                  <div class="flex items-center space-x-2">
                    <span class="font-semibold text-white text-xs">{{ ev.title }}</span>
                    <span class="text-[10px] font-mono text-gray-400">({{ ev.type || 'Digital' }})</span>
                  </div>
                  <div class="text-[11px] text-gray-400">
                    Source: {{ ev.source || 'Direct Telemetry' }} • Confidence: <strong class="text-gray-200">{{ ev.confidenceScore }}%</strong>
                  </div>
                </div>

                <div class="flex items-center space-x-2 self-end sm:self-auto">
                  <span :class="verificationBadgeClass(ev.verificationState)" class="text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    {{ ev.verificationState || 'UNVERIFIED' }}
                  </span>
                  <button 
                    @click="openEvidenceDetailDrawer(ev)" 
                    class="text-xs px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-700 transition"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 3. TAB 1: EVIDENCE COLLECTION ==================== -->
    <div v-if="tab === 'evidence'" class="space-y-4">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 class="text-lg font-bold text-white">Evidence Collection & Verification Dossier</h2>
          <p class="text-xs text-gray-400">Catalog, inspect, verify, and link forensic artifacts, digital logs, and physical evidence.</p>
        </div>
        <button 
          @click="openAddEvidenceModal" 
          class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1.5 shadow self-start sm:self-auto"
        >
          <span>+ Ingest Evidence</span>
        </button>
      </div>

      <!-- Evidence Search, Filter & View Controls -->
      <div class="bg-gray-800/90 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row gap-3 items-center justify-between shadow">
        <div class="w-full md:w-1/2 relative">
          <input 
            v-model="evidenceSearch" 
            @input="onEvidenceSearchInput"
            type="text" 
            placeholder="Search evidence by ID, title, type, source, or description..." 
            class="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <svg class="w-4 h-4 text-gray-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div class="flex items-center space-x-1.5">
            <label class="text-xs text-gray-400 uppercase font-semibold">State:</label>
            <select 
              v-model="evidenceStateFilter" 
              @change="fetchEvidence(1)"
              class="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="">All States ({{ evidence.length }})</option>
              <option value="UNVERIFIED">UNVERIFIED ({{ unverifiedEvidenceCount }})</option>
              <option value="VERIFIED">VERIFIED ({{ verifiedEvidenceCount }})</option>
              <option value="DISPUTED">DISPUTED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div class="flex items-center space-x-1.5">
            <label class="text-xs text-gray-400 uppercase font-semibold">Type:</label>
            <select 
              v-model="evidenceTypeFilter" 
              @change="fetchEvidence(1)"
              class="bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="Digital">Digital</option>
              <option value="Physical">Physical</option>
              <option value="Document">Document</option>
              <option value="Testimonial">Testimonial</option>
              <option value="Forensic">Forensic</option>
              <option value="Network">Network</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Evidence Empty State -->
      <div v-if="filteredEvidence.length === 0" class="bg-gray-800/50 border border-dashed border-gray-700 rounded-xl p-10 text-center">
        <p class="text-gray-400 text-sm font-medium">No evidence items match the search or filter criteria.</p>
        <button @click="openAddEvidenceModal" class="mt-3 text-blue-400 hover:underline text-sm font-semibold">Ingest new evidence item</button>
      </div>

      <!-- Evidence Grid -->
      <div v-else class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <EvidenceIntelligenceCard
            v-for="e in paginatedEvidence"
            :key="e._id"
            :evidence="e"
            :hypotheses="hypotheses"
            :relationships="caseRelationships"
            :is-verifying="verifyingId === e._id"
            :has-hypotheses="hypotheses.length > 0"
            @view-details="openEvidenceDetailDrawer"
            @link-theory="(evId) => openLinkEvidenceModal(null, evId)"
            @verify="({ id, state }) => verifyEvidenceItem(id, state)"
          />
        </div>

        <!-- Evidence Pagination -->
        <div v-if="evidencePagination.totalPages > 1" class="bg-gray-800/90 border border-gray-700 rounded-xl p-3.5 flex items-center justify-between text-xs text-gray-400 shadow">
          <div>
            Showing page <span class="font-bold text-white">{{ evidencePagination.page }}</span> of <span class="font-bold text-white">{{ evidencePagination.totalPages }}</span> ({{ evidencePagination.total }} items)
          </div>
          <div class="flex space-x-2">
            <button 
              :disabled="evidencePagination.page <= 1" 
              @click="evidencePagination.page--" 
              class="px-3 py-1.5 bg-gray-900 hover:bg-gray-700 text-white rounded-lg border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Previous
            </button>
            <button 
              :disabled="evidencePagination.page >= evidencePagination.totalPages" 
              @click="evidencePagination.page++" 
              class="px-3 py-1.5 bg-gray-900 hover:bg-gray-700 text-white rounded-lg border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 4. TAB 2: HYPOTHESES & EXPLAINABILITY ==================== -->
    <div v-if="tab === 'hypotheses'" class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 class="text-lg font-bold text-white">Competing Hypotheses & Intelligence Analysis</h2>
          <p class="text-xs text-gray-400">Ranked competing theories scored through mathematical evidence links (SUPPORT / CONTRADICT).</p>
        </div>
        <div class="flex space-x-2 self-start sm:self-auto">
          <button 
            v-if="hypotheses.length > 0 && evidence.length > 0"
            @click="openLinkEvidenceModal(null)" 
            class="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1.5 shadow"
          >
            <span>🔗 Link Evidence</span>
          </button>
          <button 
            @click="openCreateHypothesisModal" 
            class="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1.5 shadow"
          >
            <span>+ Create Hypothesis</span>
          </button>
        </div>
      </div>

      <!-- Hypotheses Empty State -->
      <div v-if="hypotheses.length === 0" class="bg-gray-800/50 border border-dashed border-gray-700 rounded-xl p-10 text-center">
        <p class="text-gray-400 text-sm font-medium">No competing hypotheses have been formulated for this case yet.</p>
        <button @click="openCreateHypothesisModal" class="mt-3 text-purple-400 hover:underline text-sm font-semibold">Formulate first hypothesis</button>
      </div>

      <div v-else class="space-y-6">
        <!-- Hypothesis Comparison Matrix View -->
        <HypothesisComparisonView 
          :hypotheses="hypotheses"
          :evidence="evidence"
          :relationships="caseRelationships"
          :score-deltas="scoreDeltas"
          :score-history="scoreHistory"
          @open-history="() => openScoreHistoryDrawer()"
        />

        <!-- Hypotheses Ranked List -->
        <div class="space-y-4">
          <HypothesisCard
            v-for="(h, index) in rankedHypotheses"
            :key="h._id"
            :hypothesis="h"
            :rank="index + 1"
            :evidence="evidence"
            :relationships="caseRelationships"
            :score-delta="scoreDeltas[h._id]"
            :score-history="scoreHistory"
            :has-evidence="evidence.length > 0"
            @link-evidence="(hypId) => openLinkEvidenceModal(hypId)"
            @open-explainability="openExplainabilityModal"
            @open-history="(hyp) => openScoreHistoryDrawer(hyp)"
          />
        </div>
      </div>
    </div>

    <!-- ==================== TAB 3: EVIDENCE MAP (GRAPH) ==================== -->
    <div v-if="tab === 'map'" class="space-y-4">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 class="text-lg font-bold text-white">Interactive Evidence Map</h2>
          <p class="text-xs text-gray-400">Visual relational graph showing links between collected evidence nodes and competing hypotheses.</p>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-xs text-gray-400 font-medium">Filter links:</span>
          <select v-model="mapLinkFilter" class="bg-gray-800 border border-gray-700 text-xs text-gray-300 rounded-lg px-3 py-1.5">
            <option value="ALL">All Relations ({{ caseRelationships.length }})</option>
            <option value="SUPPORT">Support Only (+)</option>
            <option value="CONTRADICT">Contradict Only (-)</option>
          </select>
        </div>
      </div>

      <div v-if="evidence.length === 0 && hypotheses.length === 0" class="bg-gray-800/50 border border-dashed border-gray-700 rounded-xl p-12 text-center text-gray-400 text-sm">
        Add evidence and hypotheses to generate the intelligence relationship graph.
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Interactive Graph Area -->
        <div class="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-xl p-5 relative min-h-[460px] overflow-hidden flex flex-col justify-between shadow-xl">
          <!-- Graph Legend -->
          <div class="flex flex-wrap items-center gap-4 text-xs text-gray-400 border-b border-gray-800 pb-3 mb-4 font-mono">
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-3 rounded bg-blue-600 inline-block"></span>
              <span class="text-gray-300">Evidence Nodes</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-3 rounded bg-purple-600 inline-block"></span>
              <span class="text-gray-300">Hypothesis Nodes</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-4 h-0.5 bg-emerald-500 inline-block"></span>
              <span class="text-emerald-400 font-medium">SUPPORT Link</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-4 h-0.5 bg-rose-500 inline-block"></span>
              <span class="text-rose-400 font-medium">CONTRADICT Link</span>
            </div>
          </div>

          <!-- Nodes Columns -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2 relative z-10">
            <!-- Left: Evidence Column -->
            <div class="space-y-2.5">
              <div class="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1 flex justify-between">
                <span>Evidence Items</span>
                <span>({{ evidence.length }})</span>
              </div>
              <div 
                v-for="evNode in evidence" 
                :key="evNode._id"
                @click="selectGraphNode('evidence', evNode)"
                :class="[
                  selectedGraphItem?.id === evNode._id ? 'ring-2 ring-blue-400 bg-blue-950/60 border-blue-500' : 'bg-gray-800/90 border-gray-700 hover:border-blue-400/60',
                  'p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between shadow'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-white truncate max-w-[170px]">{{ evNode.title }}</span>
                  <span :class="verificationBadgeClass(evNode.verificationState)" class="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                    {{ evNode.verificationState }}
                  </span>
                </div>
                <div class="text-[11px] text-gray-400 mt-1 flex justify-between">
                  <span>{{ evNode.type }}</span>
                  <span class="font-mono text-gray-300">Conf: {{ evNode.confidenceScore }}%</span>
                </div>
              </div>
            </div>

            <!-- Right: Hypotheses Column -->
            <div class="space-y-2.5">
              <div class="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1 flex justify-between">
                <span>Hypotheses</span>
                <span>({{ hypotheses.length }})</span>
              </div>
              <div 
                v-for="hypNode in rankedHypotheses" 
                :key="hypNode._id"
                @click="selectGraphNode('hypothesis', hypNode)"
                :class="[
                  selectedGraphItem?.id === hypNode._id ? 'ring-2 ring-purple-400 bg-purple-950/60 border-purple-500' : 'bg-gray-800/90 border-gray-700 hover:border-purple-400/60',
                  'p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between shadow'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-white truncate max-w-[170px]">{{ hypNode.title }}</span>
                  <span class="text-xs font-mono font-bold" :class="hypNode.score > 0 ? 'text-emerald-400' : hypNode.score < 0 ? 'text-rose-400' : 'text-gray-400'">
                    {{ hypNode.score?.toFixed(2) }}
                  </span>
                </div>
                <div class="text-[11px] text-gray-400 mt-1 flex justify-between">
                  <span>{{ (hypNode.explainability || []).length }} contributing links</span>
                  <span class="text-purple-300 text-[10px]">Inspect ➔</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Relationships List at bottom -->
          <div class="border-t border-gray-800 pt-3 mt-4">
            <div class="text-xs font-bold uppercase text-gray-400 mb-2">Active Graph Relationships ({{ filteredGraphRelationships.length }})</div>
            <div v-if="filteredGraphRelationships.length === 0" class="text-xs text-gray-500 italic">No relationships mapped. Use "+ Link Evidence" to construct graph edges.</div>
            <div v-else class="flex flex-wrap gap-2">
              <div 
                v-for="rel in filteredGraphRelationships" 
                :key="rel._id"
                @click="selectGraphRelationship(rel)"
                :class="[
                  rel.type === 'SUPPORT' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border-rose-800 text-rose-300',
                  'text-xs px-2.5 py-1 rounded-full border cursor-pointer hover:opacity-90 font-mono transition shadow-sm'
                ]"
              >
                {{ getEvidenceTitle(rel.evidenceId) }} ➔ {{ rel.type }} (weight: {{ rel.strength }}) ➔ {{ getHypothesisTitle(rel.hypothesisId) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Node / Link Details Inspector Panel -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div class="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-gray-200">Entity Inspector</h3>
              <span v-if="selectedGraphItem" class="text-[10px] px-2 py-0.5 rounded bg-blue-900 text-blue-300 font-mono font-bold">
                {{ selectedGraphItem.type.toUpperCase() }}
              </span>
            </div>

            <div v-if="!selectedGraphItem" class="py-16 text-center text-xs text-gray-400 space-y-2">
              <div class="text-2xl">🔍</div>
              <p>Click on any evidence node, hypothesis card, or relationship in the map to inspect its data and mathematical contributions.</p>
            </div>

            <div v-else class="space-y-4 text-xs">
              <div>
                <div class="text-gray-400 uppercase text-[10px] font-bold">Title</div>
                <div class="font-bold text-white text-sm mt-0.5">{{ selectedGraphItem.data.title || selectedGraphItem.data.name || 'Relationship Link' }}</div>
              </div>

              <div v-if="selectedGraphItem.type === 'evidence'" class="space-y-3">
                <div class="grid grid-cols-2 gap-2 bg-gray-900/80 p-3 rounded-lg border border-gray-700 font-mono text-[11px]">
                  <div>
                    <span class="text-gray-400 block text-[10px]">Verification:</span>
                    <span class="text-white font-bold">{{ selectedGraphItem.data.verificationState }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400 block text-[10px]">Confidence:</span>
                    <span class="text-white font-bold">{{ selectedGraphItem.data.confidenceScore }}%</span>
                  </div>
                  <div>
                    <span class="text-gray-400 block text-[10px]">Type:</span>
                    <span class="text-white font-bold">{{ selectedGraphItem.data.type }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400 block text-[10px]">Source:</span>
                    <span class="text-white font-bold">{{ selectedGraphItem.data.source || 'N/A' }}</span>
                  </div>
                </div>
                <div class="text-gray-300 bg-gray-900/40 p-2.5 rounded border border-gray-700/50">
                  {{ selectedGraphItem.data.description || 'No description provided.' }}
                </div>
              </div>

              <div v-if="selectedGraphItem.type === 'hypothesis'" class="space-y-3">
                <div class="bg-gray-900/80 p-3 rounded-lg border border-gray-700 font-mono text-[11px]">
                  <span class="text-gray-400 block text-[10px]">Calculated Score:</span>
                  <span class="text-lg font-black" :class="selectedGraphItem.data.score > 0 ? 'text-emerald-400' : 'text-rose-400'">
                    {{ selectedGraphItem.data.score?.toFixed(2) }}
                  </span>
                </div>
                <div class="text-xs font-bold text-gray-300 uppercase">Active Formula Contributions:</div>
                <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <div 
                    v-for="(exp, idx) in selectedGraphItem.data.explainability || []" 
                    :key="idx"
                    class="p-2 rounded text-[11px] font-mono"
                    :class="exp.startsWith('+') ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40' : 'bg-rose-950/40 text-rose-300 border border-rose-800/40'"
                  >
                    {{ exp }}
                  </div>
                </div>
              </div>

              <div v-if="selectedGraphItem.type === 'relationship'" class="space-y-3">
                <div class="bg-gray-900/80 p-3 rounded-lg border border-gray-700 font-mono text-[11px] space-y-1.5">
                  <div><span class="text-gray-400">Type:</span> <strong class="text-white">{{ selectedGraphItem.data.type }}</strong></div>
                  <div><span class="text-gray-400">Strength Weight:</span> <strong class="text-white">{{ selectedGraphItem.data.strength }} / 10</strong></div>
                  <div><span class="text-gray-400">Evidence:</span> <span class="text-blue-300">{{ getEvidenceTitle(selectedGraphItem.data.evidenceId) }}</span></div>
                  <div><span class="text-gray-400">Hypothesis:</span> <span class="text-purple-300">{{ getHypothesisTitle(selectedGraphItem.data.hypothesisId) }}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedGraphItem" class="pt-4 border-t border-gray-700 mt-4">
            <button @click="selectedGraphItem = null" class="w-full bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 rounded-lg font-semibold transition">
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 4: INVESTIGATION TIMELINE ==================== -->
    <div v-if="tab === 'timeline'" class="space-y-4">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 class="text-lg font-bold text-white">Investigation Timeline & Audit Trail</h2>
          <p class="text-xs text-gray-400">Chronological history of case mutations, evidence additions, verification cycles, and hypothesis formulation events.</p>
        </div>
        <button 
          @click="fetchTimeline" 
          :disabled="timelineLoading"
          class="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <svg :class="{ 'animate-spin': timelineLoading }" class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>Refresh Timeline</span>
        </button>
      </div>

      <!-- Timeline Empty State -->
      <div v-if="timelineLoading" class="py-12 text-center text-gray-400 text-xs">Loading case event timeline...</div>
      <div v-else-if="timelineLogs.length === 0" class="bg-gray-800/50 border border-dashed border-gray-700 rounded-xl p-12 text-center text-gray-400 text-sm">
        No chronological audit events recorded for this case dossier yet.
      </div>

      <!-- Chronological Timeline Stream -->
      <div v-else class="relative pl-6 sm:pl-8 border-l-2 border-gray-700 space-y-6 my-4">
        <div v-for="(log, idx) in timelineLogs" :key="log._id || idx" class="relative group">
          <!-- Timeline Marker Icon -->
          <div :class="timelineMarkerClass(log.action)" class="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full border-2 border-gray-900 ring-2 ring-gray-700"></div>

          <!-- Timeline Card -->
          <div class="bg-gray-800/95 border border-gray-700 p-4.5 rounded-xl shadow hover:border-gray-600 transition space-y-2">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div class="flex items-center space-x-2">
                <span :class="timelineBadgeClass(log.action)" class="text-xs px-2.5 py-0.5 rounded font-mono font-bold">
                  {{ log.action }}
                </span>
                <span class="text-xs text-gray-300">by <strong class="text-white">{{ log.user?.name || log.user?.username || 'Agent' }}</strong> ({{ log.user?.role || 'Investigator' }})</span>
              </div>
              <span class="text-xs text-gray-400 font-mono">{{ formatDateTime(log.createdAt) }}</span>
            </div>

            <!-- Event Details Body -->
            <div class="text-xs text-gray-300 font-mono bg-gray-900/70 p-3 rounded-lg border border-gray-700/60">
              <div v-if="log.details?.title" class="text-blue-300 font-bold mb-1">Target Title: "{{ log.details.title }}"</div>
              <div v-if="log.details?.oldState && log.details?.newState" class="text-emerald-400">
                Verification State Shifted: <span class="text-gray-400">{{ log.details.oldState }}</span> ➔ <span class="font-bold underline">{{ log.details.newState }}</span>
              </div>
              <div v-if="log.details?.oldStatus && log.details?.newStatus" class="text-purple-400">
                Case Status Transition: <span class="text-gray-400">{{ log.details.oldStatus }}</span> ➔ <span class="font-bold underline">{{ log.details.newStatus }}</span>
              </div>
              <div v-if="log.details?.type && log.details?.strength" class="text-indigo-300">
                Relationship Formed: {{ log.details.type }} Link (Strength: {{ log.details.strength }}/10)
              </div>
              <div v-if="!log.details?.title && !log.details?.oldState && !log.details?.oldStatus" class="text-gray-400">
                {{ JSON.stringify(log.details) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 5: CASE AUDIT LOG ==================== -->
    <div v-if="tab === 'audit'" class="space-y-4">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 class="text-lg font-bold text-white">Immutable Case Audit Logs</h2>
          <p class="text-xs text-gray-400">Forensic, tamper-evident audit records specific to this case identifier.</p>
        </div>
        <button 
          @click="fetchTimeline" 
          class="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5"
        >
          <span>Refresh Logs</span>
        </button>
      </div>

      <div v-if="timelineLogs.length === 0" class="bg-gray-800/50 border border-dashed border-gray-700 rounded-xl p-12 text-center text-gray-400 text-sm">
        No audit entries recorded for this case.
      </div>

      <div v-else class="bg-gray-800/90 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-300">
            <thead class="bg-gray-900/90 text-gray-400 font-mono uppercase text-[10px] tracking-wider border-b border-gray-700">
              <tr>
                <th class="p-3.5">Timestamp</th>
                <th class="p-3.5">Action</th>
                <th class="p-3.5">Actor</th>
                <th class="p-3.5">Entity Type</th>
                <th class="p-3.5">Details Payload</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700/60 font-mono text-[11px]">
              <tr v-for="log in timelineLogs" :key="log._id" class="hover:bg-gray-700/40 transition">
                <td class="p-3.5 whitespace-nowrap text-gray-400">{{ formatDateTime(log.createdAt) }}</td>
                <td class="p-3.5 whitespace-nowrap">
                  <span :class="timelineBadgeClass(log.action)" class="px-2 py-0.5 rounded font-bold">
                    {{ log.action }}
                  </span>
                </td>
                <td class="p-3.5 whitespace-nowrap text-gray-200 font-bold">
                  {{ log.user?.name || log.user?.username || 'Agent' }} ({{ log.user?.role || 'Investigator' }})
                </td>
                <td class="p-3.5 whitespace-nowrap text-gray-400">{{ log.entityType }}</td>
                <td class="p-3.5 text-gray-300 max-w-md truncate" :title="JSON.stringify(log.details)">
                  {{ JSON.stringify(log.details) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== EVIDENCE DETAIL DRAWER / MODAL ==================== -->
    <EvidenceDetailDrawer 
      v-if="selectedEvidenceDetail" 
      :evidence="selectedEvidenceDetail" 
      :hypotheses="hypotheses" 
      :relationships="caseRelationships" 
      :audit-logs="timelineLogs" 
      @close="selectedEvidenceDetail = null" 
      @verify="({ id, state }) => verifyEvidenceItem(id, state)" 
    />

    <!-- ==================== EXPLAINABILITY MODAL ==================== -->
    <WhyThisScoreModal 
      v-if="selectedExplainHypothesis" 
      :hypothesis="selectedExplainHypothesis" 
      :evidence="evidence" 
      :relationships="caseRelationships" 
      @close="selectedExplainHypothesis = null" 
    />

    <!-- ==================== INVESTIGATION HISTORY / WHAT CHANGED DRAWER ==================== -->
    <InvestigationHistoryDrawer
      :is-open="showHistoryDrawer"
      :score-events="activeHistoryEvents"
      :title-context="historyDrawerContextTitle"
      @close="showHistoryDrawer = false"
    />

    <!-- MODAL: ADD EVIDENCE -->
    <div v-if="showAddEvidenceModal" class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div class="bg-gray-800 border border-gray-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <h3 class="text-xl font-bold text-white mb-4">Ingest Case Evidence</h3>
        
        <form @submit.prevent="submitAddEvidence" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Title *</label>
            <input 
              v-model="evidenceForm.title" 
              required 
              placeholder="e.g., Firewall Breach Logs, Forensic Disk Image..." 
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Type</label>
              <select v-model="evidenceForm.type" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="Digital">Digital</option>
                <option value="Physical">Physical</option>
                <option value="Document">Document</option>
                <option value="Testimonial">Testimonial</option>
                <option value="Forensic">Forensic</option>
                <option value="Network">Network</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Confidence (0-100%)</label>
              <input 
                v-model.number="evidenceForm.confidenceScore" 
                type="number" 
                min="0" 
                max="100" 
                required 
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono font-bold"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Verification State</label>
              <select v-model="evidenceForm.verificationState" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="UNVERIFIED">UNVERIFIED</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="DISPUTED">DISPUTED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Source / Origin</label>
              <input 
                v-model="evidenceForm.source" 
                placeholder="e.g., Edge Gateway, SOC Telemetry" 
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Description Narrative</label>
            <textarea 
              v-model="evidenceForm.description" 
              rows="3" 
              placeholder="Technical characteristics, hash signatures, context..." 
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-700">
            <button type="button" @click="showAddEvidenceModal = false" class="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
            <button type="submit" :disabled="submittingModal" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50">
              {{ submittingModal ? 'Ingesting...' : 'Ingest Evidence' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: CREATE HYPOTHESIS -->
    <div v-if="showCreateHypothesisModal" class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div class="bg-gray-800 border border-gray-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <h3 class="text-xl font-bold text-white mb-4">Formulate Competing Hypothesis</h3>
        
        <form @submit.prevent="submitCreateHypothesis" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Hypothesis Title *</label>
            <input 
              v-model="hypothesisForm.title" 
              required 
              placeholder="e.g., External Exploitation Attempt, Insider Credential Theft..." 
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Theory Narrative</label>
            <textarea 
              v-model="hypothesisForm.description" 
              rows="3" 
              placeholder="Explain the causal chain, motive, and expected artifact trail..." 
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-700">
            <button type="button" @click="showCreateHypothesisModal = false" class="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
            <button type="submit" :disabled="submittingModal" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50">
              {{ submittingModal ? 'Formulating...' : 'Create Hypothesis' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: LINK EVIDENCE TO HYPOTHESIS -->
    <div v-if="showLinkEvidenceModal" class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div class="bg-gray-800 border border-gray-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <h3 class="text-xl font-bold text-white mb-4">Link Evidence to Hypothesis</h3>
        
        <form @submit.prevent="submitLinkEvidence" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Select Hypothesis *</label>
            <select v-model="linkForm.hypothesisId" required class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option v-for="h in hypotheses" :key="h._id" :value="h._id">
                {{ h.title }} (Current Score: {{ (h.score || 0).toFixed(2) }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Select Evidence Item *</label>
            <select v-model="linkForm.evidenceId" required class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option v-for="e in evidence" :key="e._id" :value="e._id">
                {{ e.title }} [{{ e.verificationState || 'UNVERIFIED' }} - {{ e.confidenceScore }}% conf]
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Relationship Type</label>
              <select v-model="linkForm.type" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold">
                <option value="SUPPORT">SUPPORT (+)</option>
                <option value="CONTRADICT">CONTRADICT (-)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Weight / Strength (1 - 10)</label>
              <input 
                v-model.number="linkForm.strength" 
                type="number" 
                min="1" 
                max="10" 
                required 
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono font-bold"
              />
            </div>
          </div>

          <div class="bg-gray-900/80 p-3 rounded-lg border border-gray-700/60 text-xs text-gray-300">
            <p class="font-semibold text-blue-400 mb-1">Calculation Rule:</p>
            <p class="text-gray-400">
              Contribution = Strength × (Confidence / 100) × State Multiplier (VERIFIED: 1.0, UNVERIFIED: 0.5, DISPUTED: 0.2, REJECTED: 0.0).
            </p>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-700">
            <button type="button" @click="showLinkEvidenceModal = false" class="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
            <button type="submit" :disabled="submittingModal" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50">
              {{ submittingModal ? 'Linking...' : 'Establish Link & Recalculate' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { apiFetch } from '../utils/api';
import InvestigationSignals from '../components/InvestigationSignals.vue';
import EvidenceIntelligenceCard from '../components/EvidenceIntelligenceCard.vue';
import EvidenceDetailDrawer from '../components/EvidenceDetailDrawer.vue';
import HypothesisCard from '../components/HypothesisCard.vue';
import HypothesisComparisonView from '../components/HypothesisComparisonView.vue';
import WhyThisScoreModal from '../components/WhyThisScoreModal.vue';
import InvestigationHistoryDrawer from '../components/InvestigationHistoryDrawer.vue';

const route = useRoute();

const tab = ref('overview');
const caseItem = ref(null);
const evidence = ref([]);
const hypotheses = ref([]);
const caseRelationships = ref([]);
const timelineLogs = ref([]);
const timelineLoading = ref(false);

// Score Change Tracking & History
const previousScores = ref({});
const scoreDeltas = ref({});
const scoreHistory = ref([]);
const intelligenceSummary = ref(null);

// History Drawer State
const showHistoryDrawer = ref(false);
const selectedHistoryHypothesis = ref(null);

const loading = ref(true);
const statusUpdating = ref(false);
const verifyingId = ref(null);
const submittingModal = ref(false);

// Evidence Search & Filter
const evidenceSearch = ref('');
const evidenceStateFilter = ref('');
const evidenceTypeFilter = ref('');
const evidencePagination = ref({ page: 1, limit: 6, total: 0, totalPages: 1 });

// Evidence Map (Graph) State
const mapLinkFilter = ref('ALL');
const selectedGraphItem = ref(null);

// Detail & Explainability Modal States
const selectedEvidenceDetail = ref(null);
const selectedExplainHypothesis = ref(null);

// Modal Visibility & Forms
const showAddEvidenceModal = ref(false);
const showCreateHypothesisModal = ref(false);
const showLinkEvidenceModal = ref(false);

const evidenceForm = ref({
  title: '',
  type: 'Digital',
  source: '',
  confidenceScore: 80,
  verificationState: 'UNVERIFIED',
  description: ''
});

const hypothesisForm = ref({
  title: '',
  description: ''
});

const linkForm = ref({
  hypothesisId: '',
  evidenceId: '',
  type: 'SUPPORT',
  strength: 7
});

const actionMessage = ref(null);

const showNotification = (text, type = 'success') => {
  actionMessage.value = { text, type };
  setTimeout(() => {
    if (actionMessage.value && actionMessage.value.text === text) {
      actionMessage.value = null;
    }
  }, 4000);
};

const investigatorName = computed(() => {
  if (!caseItem.value) return 'Investigator';
  if (caseItem.value.assignedTo && caseItem.value.assignedTo.length > 0) {
    const a = caseItem.value.assignedTo[0];
    return typeof a === 'object' ? (a.name || a.username) : a;
  }
  if (caseItem.value.createdBy) {
    const c = caseItem.value.createdBy;
    return typeof c === 'object' ? (c.name || c.username) : c;
  }
  return 'Special Agent';
});

const computedPriority = computed(() => {
  if (!caseItem.value) return 'NORMAL';
  if (caseItem.value.priority) return caseItem.value.priority;
  if (caseItem.value.status === 'REVIEW') return 'CRITICAL';
  if (caseItem.value.status === 'INVESTIGATING') return 'HIGH';
  return 'NORMAL';
});

const priorityBadgeClass = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'bg-rose-950 text-rose-300 border border-rose-700';
    case 'HIGH': return 'bg-amber-950 text-amber-300 border border-amber-700';
    default: return 'bg-blue-950 text-blue-300 border border-blue-700';
  }
};

const statusBadgeClass = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-900 text-blue-300 border border-blue-700';
    case 'INVESTIGATING': return 'bg-amber-900 text-amber-300 border border-amber-700';
    case 'REVIEW': return 'bg-purple-900 text-purple-300 border border-purple-700';
    case 'RESOLVED': return 'bg-emerald-900 text-emerald-300 border border-emerald-700';
    case 'ARCHIVED': return 'bg-gray-700 text-gray-300 border border-gray-600';
    default: return 'bg-gray-800 text-gray-400 border border-gray-700';
  }
};

const verificationBadgeClass = (state) => {
  switch (state) {
    case 'VERIFIED': return 'bg-emerald-950 text-emerald-300 border border-emerald-800';
    case 'DISPUTED': return 'bg-amber-950 text-amber-300 border border-amber-800';
    case 'REJECTED': return 'bg-rose-950 text-rose-300 border border-rose-800';
    default: return 'bg-gray-800 text-gray-300 border border-gray-700';
  }
};

const timelineBadgeClass = (action) => {
  if (action?.includes('VERIFY')) return 'bg-emerald-950 text-emerald-300 border border-emerald-800';
  if (action?.includes('RELATIONSHIP')) return 'bg-indigo-950 text-indigo-300 border border-indigo-800';
  if (action?.includes('HYPOTHESIS')) return 'bg-purple-950 text-purple-300 border border-purple-800';
  if (action?.includes('EVIDENCE')) return 'bg-blue-950 text-blue-300 border border-blue-800';
  if (action?.includes('STATUS')) return 'bg-amber-950 text-amber-300 border border-amber-800';
  return 'bg-gray-800 text-gray-300 border border-gray-700';
};

const timelineMarkerClass = (action) => {
  if (action?.includes('VERIFY')) return 'bg-emerald-500';
  if (action?.includes('RELATIONSHIP')) return 'bg-indigo-500';
  if (action?.includes('HYPOTHESIS')) return 'bg-purple-500';
  if (action?.includes('EVIDENCE')) return 'bg-blue-500';
  if (action?.includes('STATUS')) return 'bg-amber-500';
  return 'bg-gray-500';
};

// Overview / KPI Computed Values
const verifiedEvidenceCount = computed(() => evidence.value.filter(e => e.verificationState === 'VERIFIED').length);
const unverifiedEvidenceCount = computed(() => evidence.value.filter(e => !e.verificationState || e.verificationState === 'UNVERIFIED').length);
const disputedOrRejectedCount = computed(() => evidence.value.filter(e => e.verificationState === 'DISPUTED' || e.verificationState === 'REJECTED').length);

const verificationRatio = computed(() => {
  if (evidence.value.length === 0) return 0;
  return Math.round((verifiedEvidenceCount.value / evidence.value.length) * 100);
});

// Ranked Hypotheses (highest score first)
const rankedHypotheses = computed(() => {
  return [...hypotheses.value].sort((a, b) => (b.score || 0) - (a.score || 0));
});

const leadingHypothesis = computed(() => {
  return rankedHypotheses.value.length > 0 ? rankedHypotheses.value[0] : null;
});

// Contextual Needs Attention Items
const attentionItems = computed(() => {
  const items = [];
  
  // Unverified evidence items
  const unverified = evidence.value.filter(e => !e.verificationState || e.verificationState === 'UNVERIFIED');
  if (unverified.length > 0) {
    items.push({
      type: 'VERIFICATION',
      title: `${unverified.length} Evidence Items Awaiting Verification`,
      description: 'Unverified items currently contribute at reduced (0.5x) weight.',
      severity: 'medium',
      actionLabel: 'Review Evidence',
      action: () => quickReviewPendingEvidence()
    });
  }

  // Disputed evidence items
  const disputed = evidence.value.filter(e => e.verificationState === 'DISPUTED');
  if (disputed.length > 0) {
    items.push({
      type: 'DISPUTE',
      title: `${disputed.length} Disputed Evidence Items`,
      description: 'Disputed evidence reduces theory confidence. Re-examine sources.',
      severity: 'high',
      actionLabel: 'Inspect Disputed',
      action: () => {
        tab.value = 'evidence';
        evidenceStateFilter.value = 'DISPUTED';
      }
    });
  }

  // Hypotheses with no links
  const unlinkedHyp = hypotheses.value.filter(h => !h.explainability || h.explainability.length === 0);
  if (unlinkedHyp.length > 0) {
    items.push({
      type: 'UNLINKED',
      title: `${unlinkedHyp.length} Hypotheses Without Linked Evidence`,
      description: 'Formulated theories require supporting/contradicting evidence to calculate confidence.',
      severity: 'medium',
      actionLabel: 'Link Evidence',
      action: () => openLinkEvidenceModal(unlinkedHyp[0]._id)
    });
  }

  return items;
});

const caseHealthText = computed(() => {
  if (attentionItems.value.length === 0 && hypotheses.value.length > 0) return 'Consensus Stable';
  if (unverifiedEvidenceCount.value > 0) return 'Verification Pending';
  if (disputedOrRejectedCount.value > 0) return 'Disputed Artifacts';
  return 'Active Investigation';
});

const caseHealthBoxClass = computed(() => {
  if (attentionItems.value.length === 0 && hypotheses.value.length > 0) return 'bg-emerald-950/70 border-emerald-800 text-emerald-300';
  if (disputedOrRejectedCount.value > 0) return 'bg-rose-950/70 border-rose-800 text-rose-300';
  return 'bg-amber-950/70 border-amber-800 text-amber-300';
});

const caseHealthDotClass = computed(() => {
  if (attentionItems.value.length === 0 && hypotheses.value.length > 0) return 'bg-emerald-400';
  if (disputedOrRejectedCount.value > 0) return 'bg-rose-400';
  return 'bg-amber-400';
});

const caseAuditLogs = computed(() => timelineLogs.value);

// Client-side computed for evidence searching & pagination
const filteredEvidence = computed(() => {
  let ev = evidence.value;
  if (evidenceSearch.value.trim()) {
    const s = evidenceSearch.value.toLowerCase().trim();
    ev = ev.filter(e => 
      (e.title && e.title.toLowerCase().includes(s)) ||
      (e.type && e.type.toLowerCase().includes(s)) ||
      (e.source && e.source.toLowerCase().includes(s)) ||
      (e.description && e.description.toLowerCase().includes(s)) ||
      (e._id && e._id.toLowerCase().includes(s))
    );
  }
  if (evidenceStateFilter.value) {
    ev = ev.filter(e => e.verificationState === evidenceStateFilter.value);
  }
  if (evidenceTypeFilter.value) {
    ev = ev.filter(e => e.type === evidenceTypeFilter.value);
  }
  return ev;
});

const paginatedEvidence = computed(() => {
  const list = filteredEvidence.value;
  evidencePagination.value.total = list.length;
  evidencePagination.value.totalPages = Math.ceil(list.length / evidencePagination.value.limit) || 1;
  const start = (evidencePagination.value.page - 1) * evidencePagination.value.limit;
  return list.slice(start, start + evidencePagination.value.limit);
});

let evidenceSearchTimeout = null;
const onEvidenceSearchInput = () => {
  clearTimeout(evidenceSearchTimeout);
  evidenceSearchTimeout = setTimeout(() => {
    evidencePagination.value.page = 1;
  }, 200);
};

const activeHistoryEvents = computed(() => {
  if (selectedHistoryHypothesis.value) {
    return scoreHistory.value.filter(h => String(h.hypothesisId) === String(selectedHistoryHypothesis.value._id));
  }
  return scoreHistory.value;
});

const historyDrawerContextTitle = computed(() => {
  if (selectedHistoryHypothesis.value) {
    return `Score evolution history for theory: "${selectedHistoryHypothesis.value.title}"`;
  }
  return 'Full case intelligence score evolution & causal mutation history.';
});

const openScoreHistoryDrawer = (hyp = null) => {
  selectedHistoryHypothesis.value = hyp;
  showHistoryDrawer.value = true;
};

const fetchCaseData = async () => {
  try {
    const [caseData, evData, hypData, relData, scoreHistData, summaryData] = await Promise.all([
      apiFetch(`/api/cases/${route.params.id}`),
      apiFetch(`/api/cases/${route.params.id}/evidence`),
      apiFetch(`/api/cases/${route.params.id}/hypotheses`),
      apiFetch(`/api/cases/${route.params.id}/relationships`),
      apiFetch(`/api/cases/${route.params.id}/score-history`),
      apiFetch(`/api/cases/${route.params.id}/intelligence-summary`)
    ]);
    
    if (caseData.success && caseData.data) caseItem.value = caseData.data;
    if (evData.success && Array.isArray(evData.data)) evidence.value = evData.data;
    if (hypData.success && Array.isArray(hypData.data)) {
      hypData.data.forEach(h => {
        const old = previousScores.value[h._id];
        if (old !== undefined && old !== h.score) {
          scoreDeltas.value[h._id] = {
            delta: h.score - old,
            oldScore: old,
            newScore: h.score,
            timestamp: Date.now()
          };
        }
        previousScores.value[h._id] = h.score;
      });
      hypotheses.value = hypData.data;
    }
    if (relData.success && Array.isArray(relData.data)) caseRelationships.value = relData.data;
    if (scoreHistData.success && Array.isArray(scoreHistData.data)) {
      scoreHistory.value = scoreHistData.data;
    }
    if (summaryData.success && summaryData.data) {
      intelligenceSummary.value = summaryData.data;
    }

    await fetchTimeline();
  } catch (err) {
    console.error(err);
    showNotification('Failed to load case data', 'error');
  } finally {
    loading.value = false;
  }
};

const fetchTimeline = async () => {
  timelineLoading.value = true;
  try {
    const res = await apiFetch(`/api/audit?caseId=${route.params.id}`);
    if (res.success && Array.isArray(res.data)) {
      timelineLogs.value = res.data;
    }
  } catch (err) {
    console.error('Error fetching timeline:', err);
  } finally {
    timelineLoading.value = false;
  }
};

const updateStatus = async () => {
  statusUpdating.value = true;
  try {
    const res = await apiFetch(`/api/cases/${route.params.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: caseItem.value.status })
    });
    if (res.success) {
      showNotification(`Case status updated to ${caseItem.value.status}`);
      await fetchTimeline();
    } else {
      showNotification(res.error || 'Failed to update status', 'error');
    }
  } catch (err) {
    console.error(err);
    showNotification('Error updating case status', 'error');
  } finally {
    statusUpdating.value = false;
  }
};

const advanceCaseLifecycle = async () => {
  const lifecycleOrder = ['DRAFT', 'OPEN', 'INVESTIGATING', 'REVIEW', 'RESOLVED', 'ARCHIVED'];
  const currentIndex = lifecycleOrder.indexOf(caseItem.value.status);
  if (currentIndex >= 0 && currentIndex < lifecycleOrder.length - 1) {
    caseItem.value.status = lifecycleOrder[currentIndex + 1];
    await updateStatus();
  }
};

const verifyEvidenceItem = async (evidenceId, newState) => {
  verifyingId.value = evidenceId;
  try {
    const res = await apiFetch(`/api/evidence/${evidenceId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ verificationState: newState })
    });
    if (res.success) {
      showNotification(`Evidence state updated to ${newState}`);
      await fetchCaseData();
      if (selectedEvidenceDetail.value && selectedEvidenceDetail.value._id === evidenceId) {
        selectedEvidenceDetail.value.verificationState = newState;
      }
    } else {
      showNotification(res.error || 'Failed to verify evidence', 'error');
    }
  } catch (err) {
    console.error(err);
    showNotification('Error verifying evidence', 'error');
  } finally {
    verifyingId.value = null;
  }
};

const openAddEvidenceModal = () => {
  evidenceForm.value = {
    title: '',
    type: 'Digital',
    source: '',
    confidenceScore: 80,
    verificationState: 'UNVERIFIED',
    description: ''
  };
  showAddEvidenceModal.value = true;
};

const submitAddEvidence = async () => {
  submittingModal.value = true;
  try {
    const res = await apiFetch(`/api/cases/${route.params.id}/evidence`, {
      method: 'POST',
      body: JSON.stringify(evidenceForm.value)
    });
    if (res.success) {
      showNotification('Evidence ingested successfully');
      showAddEvidenceModal.value = false;
      await fetchCaseData();
    } else {
      showNotification(res.error || 'Failed to add evidence', 'error');
    }
  } catch (err) {
    console.error(err);
    showNotification('Error adding evidence', 'error');
  } finally {
    submittingModal.value = false;
  }
};

const openCreateHypothesisModal = () => {
  hypothesisForm.value = {
    title: '',
    description: ''
  };
  showCreateHypothesisModal.value = true;
};

const submitCreateHypothesis = async () => {
  submittingModal.value = true;
  try {
    const res = await apiFetch(`/api/cases/${route.params.id}/hypotheses`, {
      method: 'POST',
      body: JSON.stringify(hypothesisForm.value)
    });
    if (res.success) {
      showNotification('Hypothesis formulated successfully');
      showCreateHypothesisModal.value = false;
      await fetchCaseData();
    } else {
      showNotification(res.error || 'Failed to create hypothesis', 'error');
    }
  } catch (err) {
    console.error(err);
    showNotification('Error creating hypothesis', 'error');
  } finally {
    submittingModal.value = false;
  }
};

const openLinkEvidenceModal = (hypothesisId = null, evidenceId = null) => {
  linkForm.value = {
    hypothesisId: hypothesisId || (hypotheses.value[0] ? hypotheses.value[0]._id : ''),
    evidenceId: evidenceId || (evidence.value[0] ? evidence.value[0]._id : ''),
    type: 'SUPPORT',
    strength: 7
  };
  showLinkEvidenceModal.value = true;
};

const submitLinkEvidence = async () => {
  if (!linkForm.value.hypothesisId || !linkForm.value.evidenceId) {
    showNotification('Please select both a hypothesis and evidence item', 'error');
    return;
  }
  submittingModal.value = true;
  try {
    const res = await apiFetch(`/api/hypotheses/${linkForm.value.hypothesisId}/relationships`, {
      method: 'POST',
      body: JSON.stringify({
        evidenceId: linkForm.value.evidenceId,
        type: linkForm.value.type,
        strength: linkForm.value.strength
      })
    });
    if (res.success) {
      showNotification('Evidence linked to hypothesis successfully');
      showLinkEvidenceModal.value = false;
      await fetchCaseData();
    } else {
      showNotification(res.error || 'Failed to link evidence', 'error');
    }
  } catch (err) {
    console.error(err);
    showNotification('Error linking evidence', 'error');
  } finally {
    submittingModal.value = false;
  }
};

const quickReviewPendingEvidence = () => {
  tab.value = 'evidence';
  evidenceStateFilter.value = 'UNVERIFIED';
};

const handleAttentionAction = (item) => {
  if (item.action) item.action();
};

const openEvidenceDetailDrawer = (ev) => {
  selectedEvidenceDetail.value = ev;
};

const openExplainabilityModal = (hyp) => {
  selectedExplainHypothesis.value = hyp;
};

const getEvidenceRelationshipCount = (evidenceId) => {
  return caseRelationships.value.filter(r => String(r.evidenceId) === String(evidenceId)).length;
};

const getHypothesisRelationCount = (hypId, type) => {
  return caseRelationships.value.filter(r => String(r.hypothesisId) === String(hypId) && r.type === type).length;
};

const getStrongestEvidenceTitle = (hyp) => {
  if (!hyp.explainability || hyp.explainability.length === 0) return 'No linked evidence';
  return hyp.explainability[0].split(':')[1] || hyp.explainability[0];
};

const getLinkedHypothesesForEvidence = (evId) => {
  const rels = caseRelationships.value.filter(r => String(r.evidenceId) === String(evId));
  return rels.map(r => {
    const h = hypotheses.value.find(hyp => String(hyp._id) === String(r.hypothesisId));
    return {
      _id: r._id,
      hypothesisId: r.hypothesisId,
      hypothesisTitle: h ? h.title : 'Hypothesis',
      type: r.type,
      strength: r.strength
    };
  });
};

// Evidence Map Graph helpers
const filteredGraphRelationships = computed(() => {
  if (mapLinkFilter.value === 'ALL') return caseRelationships.value;
  return caseRelationships.value.filter(r => r.type === mapLinkFilter.value);
});

const getEvidenceTitle = (evId) => {
  const ev = evidence.value.find(e => String(e._id) === String(evId));
  return ev ? ev.title : 'Evidence Item';
};

const getHypothesisTitle = (hypId) => {
  const hyp = hypotheses.value.find(h => String(h._id) === String(hypId));
  return hyp ? hyp.title : 'Hypothesis';
};

const selectGraphNode = (type, data) => {
  selectedGraphItem.value = { type, id: data._id, data };
};

const selectGraphRelationship = (rel) => {
  selectedGraphItem.value = { type: 'relationship', id: rel._id, data: rel };
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString();
};

onMounted(fetchCaseData);
</script>
