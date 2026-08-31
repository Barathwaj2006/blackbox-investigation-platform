<template>
  <div class="bg-[#0B0F19] border border-slate-800/90 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
    <!-- Header Row -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800/80 pb-3">
      <div class="flex items-center space-x-2.5">
        <span class="text-blue-400 text-sm">📋</span>
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">Investigation Executive Brief</h3>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/50 font-semibold">
          30-SEC INTELLIGENCE SUMMARY
        </span>
      </div>
      <div class="flex items-center space-x-3 text-xs font-mono">
        <span class="text-slate-500">Consensus:</span>
        <span :class="consensusBadgeClass" class="px-2 py-0.5 rounded text-[11px] font-bold">
          {{ consensusStatusText }}
        </span>
      </div>
    </div>

    <!-- 4-Quadrant Intelligence Summary Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <!-- Quadrant 1: Leading Theory -->
      <div class="bg-[#0D1322] border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between space-y-2">
        <div>
          <div class="flex items-center justify-between text-[10px] uppercase font-mono font-bold text-purple-400 mb-1">
            <span>Leading Theory</span>
            <span v-if="leadingHypothesis" class="text-slate-500">Rank #1</span>
          </div>
          <div v-if="leadingHypothesis" class="space-y-1">
            <h4 class="text-xs font-bold text-white line-clamp-2 leading-tight" :title="leadingHypothesis.title">
              {{ leadingHypothesis.title }}
            </h4>
            <div class="flex items-baseline space-x-2 font-mono pt-1">
              <span class="text-base font-black" :class="leadingHypothesis.score > 0 ? 'text-emerald-400' : 'text-rose-400'">
                {{ leadingHypothesis.score > 0 ? '+' : '' }}{{ (leadingHypothesis.score || 0).toFixed(2) }} pts
              </span>
              <span v-if="theorySpread" class="text-[10px] text-slate-400">
                (+{{ theorySpread }} lead)
              </span>
            </div>
          </div>
          <div v-else class="text-xs text-slate-500 italic py-1">
            No active hypotheses formulated.
          </div>
        </div>
        <div class="text-[10px] text-slate-500 border-t border-slate-800/80 pt-1.5 flex justify-between font-mono">
          <span>Confidence:</span>
          <strong class="text-slate-300">{{ leadingConfidencePercent }}%</strong>
        </div>
      </div>

      <!-- Quadrant 2: Primary Analytical Driver -->
      <div class="bg-[#0D1322] border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between space-y-2">
        <div>
          <div class="flex items-center justify-between text-[10px] uppercase font-mono font-bold text-blue-400 mb-1">
            <span>Primary Evidence Driver</span>
            <span class="text-slate-500">Impact</span>
          </div>
          <div v-if="primaryDriver" class="space-y-1">
            <h4 class="text-xs font-bold text-white line-clamp-2 leading-tight" :title="primaryDriver.title">
              {{ primaryDriver.title }}
            </h4>
            <div class="flex items-center space-x-2 text-[11px] font-mono pt-1">
              <span class="text-blue-300 font-bold">±{{ primaryDriver.impact.toFixed(2) }} pts</span>
              <span class="text-slate-500">•</span>
              <span :class="verificationBadgeColor(primaryDriver.state)" class="text-[10px] font-bold">
                {{ primaryDriver.state }}
              </span>
            </div>
          </div>
          <div v-else class="text-xs text-slate-500 italic py-1">
            No evidence linked to active theories.
          </div>
        </div>
        <div class="text-[10px] text-slate-500 border-t border-slate-800/80 pt-1.5 flex justify-between font-mono">
          <span>Origin:</span>
          <strong class="text-slate-300 truncate max-w-[120px]">{{ primaryDriver ? primaryDriver.source : 'N/A' }}</strong>
        </div>
      </div>

      <!-- Quadrant 3: Outstanding Inconsistencies & Attention Signals -->
      <div class="bg-[#0D1322] border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between space-y-2">
        <div>
          <div class="flex items-center justify-between text-[10px] uppercase font-mono font-bold text-amber-400 mb-1">
            <span>Attention Signals</span>
            <span class="text-slate-500">{{ totalAttentionCount }} alerts</span>
          </div>
          <div class="space-y-1.5 text-xs font-mono">
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Unverified Items:</span>
              <span :class="unverifiedCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'">{{ unverifiedCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Disputed Artifacts:</span>
              <span :class="disputedCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'">{{ disputedCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Contradiction Links:</span>
              <span :class="contradictionCount > 0 ? 'text-purple-400 font-bold' : 'text-slate-500'">{{ contradictionCount }}</span>
            </div>
          </div>
        </div>
        <div class="text-[10px] text-slate-500 border-t border-slate-800/80 pt-1.5 flex justify-between font-mono">
          <span>Verification Ratio:</span>
          <strong :class="verificationRatio >= 75 ? 'text-emerald-400' : 'text-amber-400'">{{ verificationRatio }}%</strong>
        </div>
      </div>

      <!-- Quadrant 4: Recommended Next Action -->
      <div class="bg-[#0D1322] border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between space-y-2">
        <div>
          <div class="flex items-center justify-between text-[10px] uppercase font-mono font-bold text-emerald-400 mb-1">
            <span>Recommended Next Action</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed font-sans mt-1">
            {{ recommendation.text }}
          </p>
        </div>
        <div class="pt-2 border-t border-slate-800/80">
          <button 
            @click="recommendation.action"
            class="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:border-blue-500 text-[11px] font-semibold py-1.5 px-2.5 rounded transition flex items-center justify-center space-x-1 font-mono"
          >
            <span>{{ recommendation.buttonText }}</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  caseItem: { type: Object, required: true },
  evidence: { type: Array, default: () => [] },
  hypotheses: { type: Array, default: () => [] },
  relationships: { type: Array, default: () => [] },
  scoreHistory: { type: Array, default: () => [] }
});

const emit = defineEmits([
  'navigate-tab',
  'open-add-evidence',
  'open-create-hypothesis',
  'open-link-evidence',
  'review-unverified'
]);

// Ranked Hypotheses
const rankedHypotheses = computed(() => {
  return [...props.hypotheses].sort((a, b) => (b.score || 0) - (a.score || 0));
});

const leadingHypothesis = computed(() => {
  return rankedHypotheses.value.length > 0 ? rankedHypotheses.value[0] : null;
});

const runnerUpHypothesis = computed(() => {
  return rankedHypotheses.value.length > 1 ? rankedHypotheses.value[1] : null;
});

const theorySpread = computed(() => {
  if (leadingHypothesis.value && runnerUpHypothesis.value) {
    const diff = leadingHypothesis.value.score - runnerUpHypothesis.value.score;
    return diff > 0 ? diff.toFixed(2) : null;
  }
  return null;
});

const leadingConfidencePercent = computed(() => {
  if (!leadingHypothesis.value) return 0;
  // Normalized confidence heuristic based on score & evidence verification
  const raw = Math.round((leadingHypothesis.value.score || 0) * 10);
  return Math.min(100, Math.max(0, raw || (props.evidence.length > 0 ? 50 : 0)));
});

// Verification Metrics
const verifiedCount = computed(() => props.evidence.filter(e => e.verificationState === 'VERIFIED').length);
const unverifiedCount = computed(() => props.evidence.filter(e => !e.verificationState || e.verificationState === 'UNVERIFIED').length);
const disputedCount = computed(() => props.evidence.filter(e => e.verificationState === 'DISPUTED').length);
const contradictionCount = computed(() => props.relationships.filter(r => r.type === 'CONTRADICT').length);
const totalAttentionCount = computed(() => unverifiedCount.value + disputedCount.value + (props.hypotheses.length === 0 ? 1 : 0));

const verificationRatio = computed(() => {
  if (props.evidence.length === 0) return 0;
  return Math.round((verifiedCount.value / props.evidence.length) * 100);
});

// Primary Analytical Driver
const primaryDriver = computed(() => {
  if (props.evidence.length === 0 || props.relationships.length === 0) return null;
  
  let best = null;
  let maxImpact = -1;

  props.evidence.forEach(ev => {
    const rels = props.relationships.filter(r => String(r.evidenceId) === String(ev._id));
    if (rels.length === 0) return;

    let multiplier = 0.5;
    if (ev.verificationState === 'VERIFIED') multiplier = 1.0;
    else if (ev.verificationState === 'DISPUTED') multiplier = 0.2;
    else if (ev.verificationState === 'REJECTED') multiplier = 0.0;

    let totalWeight = 0;
    rels.forEach(r => {
      totalWeight += Number(r.strength || 5) * ((ev.confidenceScore || 50) / 100) * multiplier;
    });

    if (totalWeight > maxImpact) {
      maxImpact = totalWeight;
      best = {
        title: ev.title,
        source: ev.source || 'Digital Capture',
        state: ev.verificationState || 'UNVERIFIED',
        impact: totalWeight
      };
    }
  });

  return best;
});

// Consensus Status
const consensusStatusText = computed(() => {
  if (props.hypotheses.length === 0) return 'NO HYPOTHESES';
  if (unverifiedCount.value > 0) return 'VERIFICATION PENDING';
  if (disputedCount.value > 0) return 'DISPUTES UNRESOLVED';
  if (theorySpread.value && Number(theorySpread.value) >= 5) return 'STRONG CONSENSUS';
  return 'EVALUATING THEORIES';
});

const consensusBadgeClass = computed(() => {
  if (consensusStatusText.value === 'STRONG CONSENSUS') return 'bg-emerald-950/80 text-emerald-400 border border-emerald-800';
  if (consensusStatusText.value === 'DISPUTES UNRESOLVED') return 'bg-rose-950/80 text-rose-400 border border-rose-800';
  if (consensusStatusText.value === 'VERIFICATION PENDING') return 'bg-amber-950/80 text-amber-400 border border-amber-800';
  return 'bg-slate-800 text-slate-300 border border-slate-700';
});

const verificationBadgeColor = (state) => {
  if (state === 'VERIFIED') return 'text-emerald-400';
  if (state === 'DISPUTED') return 'text-amber-400';
  if (state === 'REJECTED') return 'text-rose-400';
  return 'text-slate-400';
};

// Deterministic Recommendation
const recommendation = computed(() => {
  if (props.evidence.length === 0) {
    return {
      text: 'Ingest initial case evidence artifacts to establish baseline investigative records.',
      buttonText: 'Ingest Evidence',
      action: () => emit('open-add-evidence')
    };
  }

  if (props.hypotheses.length === 0) {
    return {
      text: 'Formulate competing working theories to begin mathematical scoring analysis.',
      buttonText: 'Create Hypothesis',
      action: () => emit('open-create-hypothesis')
    };
  }

  if (props.relationships.length === 0) {
    return {
      text: 'Link ingested evidence artifacts to competing hypotheses to calculate scores.',
      buttonText: 'Link Evidence',
      action: () => emit('open-link-evidence')
    };
  }

  if (unverifiedCount.value > 0) {
    return {
      text: `Review ${unverifiedCount.value} pending evidence item(s) to upgrade score weight from 0.5x to 1.0x.`,
      buttonText: `Review ${unverifiedCount.value} Items`,
      action: () => emit('review-unverified')
    };
  }

  if (disputedCount.value > 0) {
    return {
      text: `${disputedCount.value} artifact(s) remain in DISPUTED state. Re-examine sources or reject tainted data.`,
      buttonText: 'Inspect Disputed Evidence',
      action: () => emit('navigate-tab', 'evidence')
    };
  }

  return {
    text: 'All evidence items are verified. Review hypothesis comparison matrix and advance case lifecycle.',
    buttonText: 'View Comparison Matrix',
    action: () => emit('navigate-tab', 'hypotheses')
  };
});
</script>
