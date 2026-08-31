<template>
  <div class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
    <div class="bg-gray-800 border border-gray-700 rounded-xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
      <!-- Drawer Header -->
      <div class="flex justify-between items-start border-b border-gray-700 pb-3">
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-mono px-2.5 py-0.5 rounded bg-gray-900 text-blue-400 border border-gray-700 font-bold">
              ID: {{ evidence._id }}
            </span>
            <span :class="verificationBadgeClass(evidence.verificationState)" class="text-xs px-2.5 py-0.5 rounded font-mono font-bold uppercase">
              {{ evidence.verificationState || 'UNVERIFIED' }}
            </span>
          </div>
          <h3 class="text-xl font-bold text-white">{{ evidence.title }}</h3>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white text-xl font-bold p-1">✕</button>
      </div>

      <!-- SECTION 1: IDENTITY -->
      <div class="bg-gray-900/80 border border-gray-700/80 rounded-xl p-4 space-y-3">
        <div class="flex items-center space-x-2 border-b border-gray-800 pb-2">
          <span class="text-blue-400 text-sm">📇</span>
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-300">Identity & Origin</h4>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div>
            <span class="text-gray-500 block text-[10px] uppercase">Artifact ID:</span>
            <span class="text-gray-200 font-bold">{{ evidence._id }}</span>
          </div>
          <div>
            <span class="text-gray-500 block text-[10px] uppercase">Type:</span>
            <span class="text-white font-bold">{{ evidence.type || 'Digital' }}</span>
          </div>
          <div>
            <span class="text-gray-500 block text-[10px] uppercase">Source Origin:</span>
            <span class="text-white font-bold truncate block" :title="evidence.source">{{ evidence.source || 'Field Ingestion' }}</span>
          </div>
          <div>
            <span class="text-gray-500 block text-[10px] uppercase">Recorded At:</span>
            <span class="text-gray-300">{{ formatDateTime(evidence.createdAt) }}</span>
          </div>
        </div>
        <div v-if="evidence.description" class="pt-2 border-t border-gray-800/80">
          <span class="text-gray-500 block text-[10px] uppercase mb-1">Discovery Narrative:</span>
          <p class="text-xs text-gray-200 bg-gray-950/60 p-2.5 rounded border border-gray-800 leading-relaxed font-sans">
            {{ evidence.description }}
          </p>
        </div>
      </div>

      <!-- SECTION 2: RELIABILITY -->
      <div class="bg-gray-900/80 border border-gray-700/80 rounded-xl p-4 space-y-3">
        <div class="flex items-center space-x-2 border-b border-gray-800 pb-2">
          <span class="text-emerald-400 text-sm">🛡️</span>
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-300">Reliability & Verification State</h4>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-400">Confidence Metric:</span>
              <span class="font-mono font-bold text-white text-sm">{{ evidence.confidenceScore !== undefined ? evidence.confidenceScore : 50 }}%</span>
            </div>
            <div class="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden border border-gray-800">
              <div 
                class="bg-blue-500 h-full transition-all duration-300"
                :style="{ width: (evidence.confidenceScore !== undefined ? evidence.confidenceScore : 50) + '%' }"
              ></div>
            </div>
            <div class="text-[11px] text-gray-400">
              Calculated weight multiplier: <strong class="text-gray-200">{{ stateMultiplierLabel }}</strong>
            </div>
          </div>

          <div class="space-y-2">
            <span class="text-[10px] text-gray-400 uppercase block font-bold">Update Verification State:</span>
            <div class="grid grid-cols-3 gap-1.5">
              <button 
                @click="$emit('verify', { id: evidence._id, state: 'VERIFIED' })" 
                :class="[
                  evidence.verificationState === 'VERIFIED' ? 'bg-emerald-600 text-white font-bold' : 'bg-gray-800 text-gray-300 hover:bg-emerald-700 hover:text-white',
                  'text-xs py-1.5 rounded transition border border-gray-700'
                ]"
              >
                ✓ Verify
              </button>
              <button 
                @click="$emit('verify', { id: evidence._id, state: 'DISPUTED' })" 
                :class="[
                  evidence.verificationState === 'DISPUTED' ? 'bg-amber-600 text-white font-bold' : 'bg-gray-800 text-gray-300 hover:bg-amber-700 hover:text-white',
                  'text-xs py-1.5 rounded transition border border-gray-700'
                ]"
              >
                ⚠ Dispute
              </button>
              <button 
                @click="$emit('verify', { id: evidence._id, state: 'REJECTED' })" 
                :class="[
                  evidence.verificationState === 'REJECTED' ? 'bg-rose-600 text-white font-bold' : 'bg-gray-800 text-gray-300 hover:bg-rose-700 hover:text-white',
                  'text-xs py-1.5 rounded transition border border-gray-700'
                ]"
              >
                ✕ Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 3: RELATIONSHIPS -->
      <div class="bg-gray-900/80 border border-gray-700/80 rounded-xl p-4 space-y-3">
        <div class="flex items-center justify-between border-b border-gray-800 pb-2">
          <div class="flex items-center space-x-2">
            <span class="text-indigo-400 text-sm">🔗</span>
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-300">Hypothesis Relationships ({{ linkedRels.length }})</h4>
          </div>
          <div class="flex space-x-2 text-[10px] font-mono">
            <span class="text-emerald-400 font-bold">+{{ supportCount }} Supporting</span>
            <span class="text-gray-500">•</span>
            <span class="text-rose-400 font-bold">-{{ contradictCount }} Contradicting</span>
          </div>
        </div>

        <div v-if="linkedRels.length === 0" class="text-xs text-gray-500 italic py-2">
          This evidence item is not linked to any hypotheses yet.
        </div>
        <div v-else class="space-y-2">
          <div 
            v-for="rel in linkedRels" 
            :key="rel._id"
            class="p-2.5 rounded-lg border text-xs flex justify-between items-center"
            :class="rel.type === 'SUPPORT' ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' : 'bg-rose-950/40 border-rose-800/60 text-rose-200'"
          >
            <div>
              <strong class="text-white">{{ rel.hypothesisTitle }}</strong>
              <span class="opacity-80 block text-[11px] font-mono">{{ rel.type }} Link (Strength: {{ rel.strength }}/10)</span>
            </div>
            <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-950 text-gray-200 border border-gray-800">
              Weight: {{ rel.strength }}/10
            </span>
          </div>
        </div>
      </div>

      <!-- SECTION 4: ANALYTICAL IMPACT -->
      <div class="bg-gray-900/80 border border-gray-700/80 rounded-xl p-4 space-y-3">
        <div class="flex items-center space-x-2 border-b border-gray-800 pb-2">
          <span class="text-purple-400 text-sm">⚖️</span>
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-300">Analytical Impact Breakdown</h4>
        </div>

        <div v-if="impactList.length === 0" class="text-xs text-gray-500 italic py-2">
          No mathematical score impact computed without active hypothesis links.
        </div>
        <div v-else class="space-y-2">
          <div 
            v-for="item in impactList" 
            :key="item.relationshipId"
            class="bg-gray-950/70 border border-gray-800 p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-2"
          >
            <div class="space-y-0.5 font-mono text-xs">
              <div class="font-bold text-white">{{ item.hypothesisTitle }}</div>
              <div class="text-[11px] text-gray-400">
                Formula: {{ item.strength }} (strength) × {{ item.confidence }}% (conf) × {{ item.multiplier }} (state)
              </div>
            </div>
            <div class="text-right font-mono self-end sm:self-auto">
              <span 
                class="text-sm font-black px-2 py-0.5 rounded"
                :class="item.value > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : item.value < 0 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-gray-800 text-gray-300'"
              >
                {{ item.formattedImpact }} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 5: HISTORY & AUDIT LOGS -->
      <div class="bg-gray-900/80 border border-gray-700/80 rounded-xl p-4 space-y-3">
        <div class="flex items-center space-x-2 border-b border-gray-800 pb-2">
          <span class="text-amber-400 text-sm">📜</span>
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-300">Evidence Audit History ({{ evidenceAuditLogs.length }})</h4>
        </div>

        <div v-if="evidenceAuditLogs.length === 0" class="text-xs text-gray-500 italic py-2">
          No historical mutations logged for this evidence item.
        </div>
        <div v-else class="space-y-2 max-h-40 overflow-y-auto pr-1">
          <div 
            v-for="log in evidenceAuditLogs" 
            :key="log._id"
            class="bg-gray-950/60 border border-gray-800 p-2.5 rounded-lg text-xs font-mono flex justify-between items-center"
          >
            <div>
              <span class="text-gray-200 font-bold">{{ log.action }}</span>
              <span class="text-gray-400 text-[11px] block">Actor: {{ log.user?.name || log.user?.username || 'Investigator' }}</span>
            </div>
            <span class="text-gray-500 text-[11px]">{{ formatDateTime(log.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Close Action & Map Navigation -->
      <div class="pt-2 border-t border-gray-700 flex items-center justify-between">
        <button 
          @click="$emit('open-in-map', evidence._id)"
          class="px-4 py-2 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 font-mono"
        >
          <span>🗺️ Open in Evidence Map</span>
        </button>
        <button 
          @click="$emit('close')" 
          class="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-lg transition"
        >
          Close Dossier
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  evidence: { type: Object, required: true },
  hypotheses: { type: Array, default: () => [] },
  relationships: { type: Array, default: () => [] },
  auditLogs: { type: Array, default: () => [] }
});

defineEmits(['close', 'verify', 'open-in-map', 'select-hypothesis']);

const verificationBadgeClass = (state) => {
  switch (state) {
    case 'VERIFIED':
      return 'bg-emerald-950 text-emerald-300 border border-emerald-700';
    case 'UNDER REVIEW':
      return 'bg-sky-950 text-sky-300 border border-sky-700';
    case 'UNVERIFIED':
      return 'bg-amber-950 text-amber-300 border border-amber-700';
    case 'DISPUTED':
      return 'bg-orange-950 text-orange-300 border border-orange-700';
    case 'REJECTED':
      return 'bg-rose-950 text-rose-300 border border-rose-700';
    default:
      return 'bg-gray-800 text-gray-300 border border-gray-700';
  }
};

const stateMultiplierLabel = computed(() => {
  switch (props.evidence.verificationState) {
    case 'VERIFIED': return '1.0x (Full)';
    case 'UNVERIFIED': return '0.5x (Half)';
    case 'UNDER REVIEW': return '0.5x (Half)';
    case 'DISPUTED': return '0.2x (Reduced)';
    case 'REJECTED': return '0.0x (Ignored)';
    default: return '0.5x';
  }
});

const linkedRels = computed(() => {
  const rels = props.relationships.filter(r => String(r.evidenceId) === String(props.evidence._id));
  return rels.map(r => {
    const hyp = props.hypotheses.find(h => String(h._id) === String(r.hypothesisId));
    return {
      ...r,
      hypothesisTitle: hyp ? hyp.title : 'Theory ' + r.hypothesisId
    };
  });
});

const supportCount = computed(() => linkedRels.value.filter(r => r.type === 'SUPPORT').length);
const contradictCount = computed(() => linkedRels.value.filter(r => r.type === 'CONTRADICT').length);

const impactList = computed(() => {
  const ev = props.evidence;
  let multiplier = 0.5;
  if (ev.verificationState === 'VERIFIED') multiplier = 1.0;
  else if (ev.verificationState === 'DISPUTED') multiplier = 0.2;
  else if (ev.verificationState === 'REJECTED') multiplier = 0.0;

  const conf = ev.confidenceScore !== undefined ? ev.confidenceScore : 50;

  return linkedRels.value.map(r => {
    const base = (Number(r.strength) || 5) * (conf / 100);
    const value = base * multiplier;
    const signedValue = r.type === 'SUPPORT' ? value : -value;
    return {
      relationshipId: r._id,
      hypothesisTitle: r.hypothesisTitle,
      strength: r.strength,
      confidence: conf,
      multiplier,
      value: signedValue,
      formattedImpact: (signedValue >= 0 ? '+' : '') + signedValue.toFixed(2)
    };
  });
});

const evidenceAuditLogs = computed(() => {
  return props.auditLogs.filter(l => 
    String(l.entityId) === String(props.evidence._id) || 
    (l.details && String(l.details.evidenceId) === String(props.evidence._id))
  );
});

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString();
};
</script>
