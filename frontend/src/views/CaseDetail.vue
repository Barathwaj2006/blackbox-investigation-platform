<template>
  <div v-if="loading" class="text-gray-400 py-16 text-center flex flex-col items-center justify-center space-y-3">
    <svg class="animate-spin h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
    <span class="text-sm">Loading case workspace & intelligence dossiers...</span>
  </div>

  <div v-else-if="caseItem" class="space-y-6">
    <!-- Status / Notification Banner -->
    <div v-if="actionMessage" :class="[actionMessage.type === 'error' ? 'bg-rose-950/80 border-rose-700 text-rose-200' : 'bg-emerald-950/80 border-emerald-700 text-emerald-200', 'p-3 rounded-lg border flex justify-between items-center text-sm transition shadow-lg']">
      <span class="font-medium">{{ actionMessage.text }}</span>
      <button @click="actionMessage = null" class="text-xs opacity-75 hover:opacity-100 font-bold ml-4">✕</button>
    </div>

    <!-- Case Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-800/90 p-5 rounded-lg border border-gray-700 shadow-lg">
      <div>
        <div class="flex items-center space-x-3">
          <h1 class="text-2xl font-bold text-white tracking-wide">{{ caseItem.title }}</h1>
          <span :class="statusBadgeClass(caseItem.status)" class="text-xs px-2.5 py-0.5 rounded-full font-semibold">
            {{ caseItem.status }}
          </span>
        </div>
        <p class="text-gray-400 mt-1 text-sm max-w-3xl leading-relaxed">{{ caseItem.description || 'No detailed scope provided.' }}</p>
      </div>

      <div class="flex items-center space-x-3 self-end md:self-auto">
        <label class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Lifecycle Status:</label>
        <select 
          v-model="caseItem.status" 
          @change="updateStatus" 
          :disabled="statusUpdating"
          class="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium"
        >
          <option value="DRAFT">DRAFT</option>
          <option value="OPEN">OPEN</option>
          <option value="INVESTIGATING">INVESTIGATING</option>
          <option value="REVIEW">REVIEW</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>
    </div>
    
    <!-- Navigation Tabs -->
    <div class="border-b border-gray-700">
      <nav class="-mb-px flex space-x-6 overflow-x-auto">
        <button 
          @click="tab = 'evidence'" 
          :class="[tab === 'evidence' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500', 'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors']"
        >
          <span>Evidence Collection</span>
          <span class="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{{ evidence.length }}</span>
        </button>
        <button 
          @click="tab = 'hypotheses'" 
          :class="[tab === 'hypotheses' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500', 'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors']"
        >
          <span>Competing Hypotheses</span>
          <span class="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{{ hypotheses.length }}</span>
        </button>
        <button 
          @click="tab = 'map'" 
          :class="[tab === 'map' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500', 'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors']"
        >
          <span>Evidence Map (Graph)</span>
          <span class="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{{ caseRelationships.length }}</span>
        </button>
        <button 
          @click="tab = 'timeline'" 
          :class="[tab === 'timeline' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500', 'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors']"
        >
          <span>Investigation Timeline</span>
          <span class="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{{ timelineLogs.length }}</span>
        </button>
      </nav>
    </div>

    <!-- ==================== TAB 1: EVIDENCE ==================== -->
    <div v-if="tab === 'evidence'" class="space-y-4">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 class="text-lg font-semibold text-white">Collected Evidence</h2>
          <p class="text-xs text-gray-400">Search, filter, verify, and catalog digital and physical case evidence.</p>
        </div>
        <button 
          @click="openAddEvidenceModal" 
          class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium transition flex items-center space-x-1.5 shadow self-start sm:self-auto"
        >
          <span>+ Add Evidence</span>
        </button>
      </div>

      <!-- Evidence Search and Filter Controls -->
      <div class="bg-gray-800/80 p-3.5 rounded-lg border border-gray-700 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div class="w-full md:w-1/2 relative">
          <input 
            v-model="evidenceSearch" 
            @input="onEvidenceSearchInput"
            type="text" 
            placeholder="Search evidence by ID, title, type, or source..." 
            class="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <svg class="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <option value="">All States</option>
              <option value="UNVERIFIED">UNVERIFIED</option>
              <option value="VERIFIED">VERIFIED</option>
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
      <div v-if="filteredEvidence.length === 0" class="bg-gray-800/50 border border-dashed border-gray-700 rounded-lg p-8 text-center">
        <p class="text-gray-400 text-sm">No evidence matches the search or filter criteria.</p>
        <button @click="openAddEvidenceModal" class="mt-3 text-blue-400 hover:underline text-sm font-medium">Add first evidence item</button>
      </div>

      <!-- Evidence Grid -->
      <div v-else class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="e in paginatedEvidence" :key="e._id" class="bg-gray-800 rounded-lg shadow border border-gray-700 p-4 flex flex-col justify-between hover:border-gray-600 transition">
            <div>
              <div class="flex justify-between items-start gap-2 mb-2">
                <div>
                  <h3 class="text-base font-semibold text-white">{{ e.title }}</h3>
                  <span class="text-xs text-gray-400">{{ e.type || 'Digital' }} <span v-if="e.source">• Source: {{ e.source }}</span></span>
                </div>
                <span :class="verificationBadgeClass(e.verificationState)" class="text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
                  {{ e.verificationState || 'UNVERIFIED' }}
                </span>
              </div>
              
              <p v-if="e.description" class="text-sm text-gray-300 mb-3 bg-gray-900/50 p-2.5 rounded border border-gray-700/50">
                {{ e.description }}
              </p>

              <div class="flex items-center justify-between text-xs text-gray-400 mb-4">
                <div>
                  <span>Confidence: </span>
                  <span class="font-bold text-white">{{ e.confidenceScore !== undefined ? e.confidenceScore : 50 }}%</span>
                </div>
                <div v-if="e.uploadedBy" class="text-gray-400">
                  By: {{ e.uploadedBy.name || e.uploadedBy.username || 'Investigator' }}
                </div>
              </div>
            </div>

            <!-- Evidence Actions: Verify / Dispute / Reject -->
            <div class="border-t border-gray-700/80 pt-3 flex items-center justify-between">
              <span class="text-xs text-gray-400 font-medium">Set Verification:</span>
              <div class="flex space-x-1.5">
                <button 
                  @click="verifyEvidenceItem(e._id, 'VERIFIED')" 
                  :disabled="verifyingId === e._id"
                  :class="[e.verificationState === 'VERIFIED' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-emerald-700 hover:text-white', 'text-xs px-2.5 py-1 rounded font-medium transition disabled:opacity-50']"
                >
                  ✓ Verify
                </button>
                <button 
                  @click="verifyEvidenceItem(e._id, 'DISPUTED')" 
                  :disabled="verifyingId === e._id"
                  :class="[e.verificationState === 'DISPUTED' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-amber-700 hover:text-white', 'text-xs px-2.5 py-1 rounded font-medium transition disabled:opacity-50']"
                >
                  ⚠ Dispute
                </button>
                <button 
                  @click="verifyEvidenceItem(e._id, 'REJECTED')" 
                  :disabled="verifyingId === e._id"
                  :class="[e.verificationState === 'REJECTED' ? 'bg-rose-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-rose-700 hover:text-white', 'text-xs px-2.5 py-1 rounded font-medium transition disabled:opacity-50']"
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Evidence Pagination -->
        <div v-if="evidencePagination.totalPages > 1" class="bg-gray-800/80 border border-gray-700 rounded-lg p-3 flex items-center justify-between text-xs text-gray-400">
          <div>
            Showing page <span class="font-bold text-white">{{ evidencePagination.page }}</span> of <span class="font-bold text-white">{{ evidencePagination.totalPages }}</span> ({{ evidencePagination.total }} items)
          </div>
          <div class="flex space-x-2">
            <button 
              :disabled="evidencePagination.page <= 1" 
              @click="evidencePagination.page--" 
              class="px-3 py-1 bg-gray-900 hover:bg-gray-700 text-white rounded border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              :disabled="evidencePagination.page >= evidencePagination.totalPages" 
              @click="evidencePagination.page++" 
              class="px-3 py-1 bg-gray-900 hover:bg-gray-700 text-white rounded border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 2: HYPOTHESES ==================== -->
    <div v-if="tab === 'hypotheses'" class="space-y-4">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 class="text-lg font-semibold text-white">Hypotheses & Analysis</h2>
          <p class="text-xs text-gray-400">Formulate competing hypotheses and link evidence with SUPPORT or CONTRADICT relations.</p>
        </div>
        <div class="flex space-x-2 self-start sm:self-auto">
          <button 
            v-if="hypotheses.length > 0 && evidence.length > 0"
            @click="openLinkEvidenceModal(null)" 
            class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded text-sm font-medium transition flex items-center space-x-1 shadow"
          >
            <span>🔗 Link Evidence</span>
          </button>
          <button 
            @click="openCreateHypothesisModal" 
            class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium transition flex items-center space-x-1.5 shadow"
          >
            <span>+ Create Hypothesis</span>
          </button>
        </div>
      </div>

      <!-- Hypotheses Empty State -->
      <div v-if="hypotheses.length === 0" class="bg-gray-800/50 border border-dashed border-gray-700 rounded-lg p-8 text-center">
        <p class="text-gray-400 text-sm">No hypotheses have been formulated for this case yet.</p>
        <button @click="openCreateHypothesisModal" class="mt-3 text-blue-400 hover:underline text-sm font-medium">Create first hypothesis</button>
      </div>

      <!-- Hypotheses List -->
      <div v-else class="space-y-4">
        <div v-for="h in hypotheses" :key="h._id" class="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 hover:border-gray-600 transition">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
            <div>
              <h3 class="text-lg font-semibold text-white">{{ h.title }}</h3>
              <p v-if="h.description" class="text-sm text-gray-300 mt-0.5">{{ h.description }}</p>
            </div>
            <div class="flex items-center space-x-3 self-end sm:self-auto">
              <button 
                v-if="evidence.length > 0"
                @click="openLinkEvidenceModal(h._id)" 
                class="text-xs bg-gray-700 hover:bg-gray-600 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 px-2.5 py-1 rounded transition"
              >
                + Link Evidence
              </button>
              <div class="text-right">
                <div class="text-xs uppercase text-gray-400 font-semibold tracking-wider">Score</div>
                <div class="text-xl font-black font-mono" :class="h.score > 0 ? 'text-emerald-400' : h.score < 0 ? 'text-rose-400' : 'text-gray-400'">
                  {{ (h.score || 0).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Explainability Section -->
          <div class="mt-3 bg-gray-900/90 border border-gray-700/60 p-3.5 rounded-lg">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-semibold text-gray-300 uppercase tracking-wider">Mathematical Score Breakdown & Reasoning:</span>
              <span class="text-xs text-gray-400 font-mono">{{ h.explainability ? h.explainability.length : 0 }} contributing links</span>
            </div>
            
            <div v-if="!h.explainability || h.explainability.length === 0" class="text-xs text-gray-400 italic py-1">
              No evidence linked yet. Link supporting or contradicting evidence to compute scores.
            </div>
            <ul v-else class="space-y-1.5 mt-1">
              <li 
                v-for="(exp, idx) in h.explainability" 
                :key="idx" 
                class="text-xs font-mono p-2 rounded flex items-start space-x-2"
                :class="exp.startsWith('+') ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40' : 'bg-rose-950/40 text-rose-300 border border-rose-800/40'"
              >
                <span>{{ exp }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 3: EVIDENCE MAP (GRAPH) ==================== -->
    <div v-if="tab === 'map'" class="space-y-4">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 class="text-lg font-semibold text-white">Interactive Evidence Map</h2>
          <p class="text-xs text-gray-400">Visual relational graph showing links between collected evidence and competing hypotheses.</p>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-xs text-gray-400">Filter links:</span>
          <select v-model="mapLinkFilter" class="bg-gray-800 border border-gray-700 text-xs text-gray-300 rounded px-2.5 py-1">
            <option value="ALL">All Relations</option>
            <option value="SUPPORT">Support Only (Green)</option>
            <option value="CONTRADICT">Contradict Only (Red)</option>
          </select>
        </div>
      </div>

      <div v-if="evidence.length === 0 && hypotheses.length === 0" class="bg-gray-800/50 border border-dashed border-gray-700 rounded-lg p-12 text-center text-gray-400 text-sm">
        Add evidence and hypotheses to generate the intelligence relationship graph.
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Interactive Graph Area -->
        <div class="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-lg p-4 relative min-h-[420px] overflow-hidden flex flex-col justify-between">
          <!-- Graph Legend -->
          <div class="flex items-center space-x-4 text-xs text-gray-400 border-b border-gray-800 pb-2 mb-4">
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-3 rounded bg-blue-600 inline-block"></span>
              <span>Evidence Nodes</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="w-3 h-3 rounded bg-purple-600 inline-block"></span>
              <span>Hypothesis Nodes</span>
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

          <!-- SVG Visual Connections Canvas -->
          <div class="grid grid-cols-2 gap-8 py-2 relative z-10">
            <!-- Left: Evidence Column -->
            <div class="space-y-3">
              <div class="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">Evidence Items ({{ evidence.length }})</div>
              <div 
                v-for="evNode in evidence" 
                :key="evNode._id"
                @click="selectGraphNode('evidence', evNode)"
                :class="[
                  selectedGraphItem?.id === evNode._id ? 'ring-2 ring-blue-400 bg-blue-950/40 border-blue-500' : 'bg-gray-800/90 border-gray-700 hover:border-blue-400/60',
                  'p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between shadow'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-white truncate max-w-[150px]">{{ evNode.title }}</span>
                  <span :class="verificationBadgeClass(evNode.verificationState)" class="text-[10px] px-1.5 py-0.5 rounded font-mono">
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
            <div class="space-y-3">
              <div class="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">Hypotheses ({{ hypotheses.length }})</div>
              <div 
                v-for="hypNode in hypotheses" 
                :key="hypNode._id"
                @click="selectGraphNode('hypothesis', hypNode)"
                :class="[
                  selectedGraphItem?.id === hypNode._id ? 'ring-2 ring-purple-400 bg-purple-950/40 border-purple-500' : 'bg-gray-800/90 border-gray-700 hover:border-purple-400/60',
                  'p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between shadow'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-white truncate max-w-[150px]">{{ hypNode.title }}</span>
                  <span class="text-xs font-mono font-bold" :class="hypNode.score > 0 ? 'text-emerald-400' : hypNode.score < 0 ? 'text-rose-400' : 'text-gray-400'">
                    {{ hypNode.score?.toFixed(2) }}
                  </span>
                </div>
                <div class="text-[11px] text-gray-400 mt-1">
                  {{ (hypNode.explainability || []).length }} contributing links
                </div>
              </div>
            </div>
          </div>

          <!-- Active Relationships List at bottom -->
          <div class="border-t border-gray-800 pt-3 mt-4">
            <div class="text-xs font-semibold uppercase text-gray-400 mb-2">Active Linked Relationships ({{ filteredGraphRelationships.length }})</div>
            <div v-if="filteredGraphRelationships.length === 0" class="text-xs text-gray-500 italic">No relationships mapped. Use "+ Link Evidence" to construct graph edges.</div>
            <div v-else class="flex flex-wrap gap-2">
              <div 
                v-for="rel in filteredGraphRelationships" 
                :key="rel._id"
                @click="selectGraphRelationship(rel)"
                :class="[
                  rel.type === 'SUPPORT' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border-rose-800 text-rose-300',
                  'text-xs px-2.5 py-1 rounded-full border cursor-pointer hover:opacity-90 font-mono transition'
                ]"
              >
                {{ getEvidenceTitle(rel.evidenceId) }} ➔ {{ rel.type }} (str: {{ rel.strength }}) ➔ {{ getHypothesisTitle(rel.hypothesisId) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Node / Link Details Inspector Panel -->
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-gray-700 pb-2 mb-3">
              <h3 class="text-xs font-bold uppercase tracking-wider text-gray-300">Entity Inspector</h3>
              <span v-if="selectedGraphItem" class="text-[10px] px-2 py-0.5 rounded bg-blue-900 text-blue-300 font-mono">
                {{ selectedGraphItem.type.toUpperCase() }}
              </span>
            </div>

            <div v-if="!selectedGraphItem" class="py-12 text-center text-xs text-gray-400">
              Click on any evidence node, hypothesis, or relationship in the map to inspect its data and mathematical contributions.
            </div>

            <div v-else class="space-y-3 text-xs">
              <div>
                <div class="text-gray-400 uppercase text-[10px]">Title</div>
                <div class="font-bold text-white text-sm mt-0.5">{{ selectedGraphItem.data.title || selectedGraphItem.data.name || 'Relationship Link' }}</div>
              </div>

              <div v-if="selectedGraphItem.type === 'evidence'" class="space-y-2">
                <div class="grid grid-cols-2 gap-2 bg-gray-900/80 p-2.5 rounded border border-gray-700 font-mono text-[11px]">
                  <div>
                    <span class="text-gray-400 block">State:</span>
                    <span class="text-white font-bold">{{ selectedGraphItem.data.verificationState }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400 block">Confidence:</span>
                    <span class="text-white font-bold">{{ selectedGraphItem.data.confidenceScore }}%</span>
                  </div>
                  <div>
                    <span class="text-gray-400 block">Type:</span>
                    <span class="text-white font-bold">{{ selectedGraphItem.data.type }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400 block">Source:</span>
                    <span class="text-white font-bold">{{ selectedGraphItem.data.source || 'N/A' }}</span>
                  </div>
                </div>
                <div class="text-gray-300">{{ selectedGraphItem.data.description || 'No description provided.' }}</div>
              </div>

              <div v-if="selectedGraphItem.type === 'hypothesis'" class="space-y-2">
                <div class="bg-gray-900/80 p-2.5 rounded border border-gray-700 font-mono text-[11px]">
                  <span class="text-gray-400 block">Total Score:</span>
                  <span class="text-base font-bold" :class="selectedGraphItem.data.score > 0 ? 'text-emerald-400' : 'text-rose-400'">
                    {{ selectedGraphItem.data.score?.toFixed(2) }}
                  </span>
                </div>
                <div class="text-xs font-semibold text-gray-300 uppercase mt-2">Active Formula Contributions:</div>
                <div class="space-y-1">
                  <div 
                    v-for="(exp, idx) in selectedGraphItem.data.explainability || []" 
                    :key="idx"
                    class="p-1.5 rounded text-[11px] font-mono"
                    :class="exp.startsWith('+') ? 'bg-emerald-950/40 text-emerald-300' : 'bg-rose-950/40 text-rose-300'"
                  >
                    {{ exp }}
                  </div>
                </div>
              </div>

              <div v-if="selectedGraphItem.type === 'relationship'" class="space-y-2">
                <div class="bg-gray-900/80 p-2.5 rounded border border-gray-700 font-mono text-[11px] space-y-1">
                  <div><span class="text-gray-400">Type:</span> <span class="text-white font-bold">{{ selectedGraphItem.data.type }}</span></div>
                  <div><span class="text-gray-400">Strength Weight:</span> <span class="text-white font-bold">{{ selectedGraphItem.data.strength }} / 10</span></div>
                  <div><span class="text-gray-400">Evidence:</span> <span class="text-blue-300">{{ getEvidenceTitle(selectedGraphItem.data.evidenceId) }}</span></div>
                  <div><span class="text-gray-400">Hypothesis:</span> <span class="text-purple-300">{{ getHypothesisTitle(selectedGraphItem.data.hypothesisId) }}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedGraphItem" class="pt-3 border-t border-gray-700 mt-4">
            <button @click="selectedGraphItem = null" class="w-full bg-gray-700 hover:bg-gray-600 text-white text-xs py-1.5 rounded transition">
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
          <h2 class="text-lg font-semibold text-white">Investigation Timeline & Audit Trail</h2>
          <p class="text-xs text-gray-400">Chronological history of case mutations, evidence additions, verification cycles, and hypothesis formulate events.</p>
        </div>
        <button 
          @click="fetchTimeline" 
          :disabled="timelineLoading"
          class="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3 py-1.5 rounded text-xs font-medium transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <svg :class="{ 'animate-spin': timelineLoading }" class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>Refresh Timeline</span>
        </button>
      </div>

      <!-- Timeline Empty State -->
      <div v-if="timelineLoading" class="py-12 text-center text-gray-400 text-xs">Loading case event timeline...</div>
      <div v-else-if="timelineLogs.length === 0" class="bg-gray-800/50 border border-dashed border-gray-700 rounded-lg p-12 text-center text-gray-400 text-sm">
        No chronological audit events recorded for this case dossier yet.
      </div>

      <!-- Chronological Timeline Stream -->
      <div v-else class="relative pl-6 border-l-2 border-gray-700 space-y-6 my-4">
        <div v-for="(log, idx) in timelineLogs" :key="log._id || idx" class="relative group">
          <!-- Timeline Marker Icon -->
          <div :class="timelineMarkerClass(log.action)" class="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-gray-900 ring-2 ring-gray-700"></div>

          <!-- Timeline Card -->
          <div class="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow hover:border-gray-600 transition">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <div class="flex items-center space-x-2">
                <span :class="timelineBadgeClass(log.action)" class="text-xs px-2 py-0.5 rounded font-mono font-bold">
                  {{ log.action }}
                </span>
                <span class="text-xs text-gray-300">by <strong class="text-white">{{ log.user?.name || log.user?.username || 'System Agent' }}</strong> ({{ log.user?.role || 'Agent' }})</span>
              </div>
              <span class="text-xs text-gray-400 font-mono">{{ formatDateTime(log.createdAt) }}</span>
            </div>

            <!-- Event Details Body -->
            <div class="text-xs text-gray-300 font-mono bg-gray-900/70 p-2.5 rounded border border-gray-700/60">
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

    <!-- MODAL: ADD EVIDENCE -->
    <div v-if="showAddEvidenceModal" class="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <div class="bg-gray-800 border border-gray-700 rounded-lg max-w-lg w-full p-6 shadow-2xl">
        <h3 class="text-xl font-bold text-white mb-4">Add Case Evidence</h3>
        
        <form @submit.prevent="submitAddEvidence" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Title *</label>
            <input 
              v-model="evidenceForm.title" 
              required 
              placeholder="e.g., Server Auth Audit Logs, Weapon Serial #..." 
              class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Type</label>
              <select v-model="evidenceForm.type" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
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
                class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Verification State</label>
              <select v-model="evidenceForm.verificationState" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
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
                placeholder="e.g., Forensic Disk Image 04" 
                class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Description</label>
            <textarea 
              v-model="evidenceForm.description" 
              rows="3" 
              placeholder="Technical characteristics, hash values, discovery context..." 
              class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-700">
            <button type="button" @click="showAddEvidenceModal = false" class="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
            <button type="submit" :disabled="submittingModal" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition disabled:opacity-50">
              {{ submittingModal ? 'Adding...' : 'Add Evidence' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: CREATE HYPOTHESIS -->
    <div v-if="showCreateHypothesisModal" class="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <div class="bg-gray-800 border border-gray-700 rounded-lg max-w-lg w-full p-6 shadow-2xl">
        <h3 class="text-xl font-bold text-white mb-4">Formulate Competing Hypothesis</h3>
        
        <form @submit.prevent="submitCreateHypothesis" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Hypothesis Title *</label>
            <input 
              v-model="hypothesisForm.title" 
              required 
              placeholder="e.g., Insider Credential Theft via Compromised Workstation" 
              class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Theory Description</label>
            <textarea 
              v-model="hypothesisForm.description" 
              rows="3" 
              placeholder="Explain the causal chain, motive, and expected artifact trail..." 
              class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-700">
            <button type="button" @click="showCreateHypothesisModal = false" class="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
            <button type="submit" :disabled="submittingModal" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition disabled:opacity-50">
              {{ submittingModal ? 'Formulating...' : 'Create Hypothesis' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: LINK EVIDENCE TO HYPOTHESIS -->
    <div v-if="showLinkEvidenceModal" class="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <div class="bg-gray-800 border border-gray-700 rounded-lg max-w-lg w-full p-6 shadow-2xl">
        <h3 class="text-xl font-bold text-white mb-4">Link Evidence to Hypothesis</h3>
        
        <form @submit.prevent="submitLinkEvidence" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Select Hypothesis *</label>
            <select v-model="linkForm.hypothesisId" required class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option v-for="h in hypotheses" :key="h._id" :value="h._id">
                {{ h.title }} (Current Score: {{ (h.score || 0).toFixed(2) }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Select Evidence Item *</label>
            <select v-model="linkForm.evidenceId" required class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option v-for="e in evidence" :key="e._id" :value="e._id">
                {{ e.title }} [{{ e.verificationState || 'UNVERIFIED' }} - {{ e.confidenceScore }}% conf]
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">Relationship Type</label>
              <select v-model="linkForm.type" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold">
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
                class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
              />
            </div>
          </div>

          <div class="bg-gray-900/80 p-3 rounded border border-gray-700/60 text-xs text-gray-300">
            <p class="font-semibold text-blue-400 mb-1">Calculation Preview Rule:</p>
            <p class="text-gray-400">
              Contribution = Strength × (Confidence / 100) × State Multiplier (VERIFIED: 1.0, UNVERIFIED: 0.5, DISPUTED: 0.2, REJECTED: 0.0).
            </p>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-700">
            <button type="button" @click="showLinkEvidenceModal = false" class="px-4 py-2 text-sm text-gray-300 hover:text-white">Cancel</button>
            <button type="submit" :disabled="submittingModal" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded transition disabled:opacity-50">
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

const route = useRoute();

const tab = ref('evidence');
const caseItem = ref(null);
const evidence = ref([]);
const hypotheses = ref([]);
const caseRelationships = ref([]);
const timelineLogs = ref([]);
const timelineLoading = ref(false);

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

const fetchCaseData = async () => {
  try {
    const [caseData, evData, hypData, relData] = await Promise.all([
      apiFetch(`/api/cases/${route.params.id}`),
      apiFetch(`/api/cases/${route.params.id}/evidence`),
      apiFetch(`/api/cases/${route.params.id}/hypotheses`),
      apiFetch(`/api/cases/${route.params.id}/relationships`)
    ]);
    
    if (caseData.success && caseData.data) caseItem.value = caseData.data;
    if (evData.success && Array.isArray(evData.data)) evidence.value = evData.data;
    if (hypData.success && Array.isArray(hypData.data)) hypotheses.value = hypData.data;
    if (relData.success && Array.isArray(relData.data)) caseRelationships.value = relData.data;

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

const verifyEvidenceItem = async (evidenceId, newState) => {
  verifyingId.value = evidenceId;
  try {
    const res = await apiFetch(`/api/evidence/${evidenceId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ verificationState: newState })
    });
    if (res.success) {
      showNotification(`Evidence status updated to ${newState}`);
      await fetchCaseData();
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
      showNotification('Evidence added successfully');
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
      showNotification('Hypothesis created successfully');
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

const openLinkEvidenceModal = (hypothesisId) => {
  linkForm.value = {
    hypothesisId: hypothesisId || (hypotheses.value[0] ? hypotheses.value[0]._id : ''),
    evidenceId: evidence.value[0] ? evidence.value[0]._id : '',
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
