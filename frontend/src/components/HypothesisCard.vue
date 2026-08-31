<template>
  <div 
    class="bg-gray-800/95 rounded-xl shadow-lg border p-5 transition space-y-4"
    :class="rank === 1 ? 'border-purple-600/80 ring-1 ring-purple-500/40 bg-gradient-to-b from-gray-800 to-purple-950/10' : 'border-gray-700 hover:border-gray-600'"
  >
    <!-- Top Row: Rank Badge, ID, Title, Score, Link Button -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
      <div class="space-y-1.5 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span 
            class="text-xs px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider shadow-sm"
            :class="rank === 1 ? 'bg-purple-900 text-purple-200 border border-purple-600' : 'bg-gray-900 text-gray-400 border border-gray-700'"
          >
            {{ rank === 1 ? '★ LEADING THEORY' : `Rank #${rank}` }}
          </span>
          <span class="text-[10px] font-mono text-gray-400 px-2 py-0.5 rounded bg-gray-900 border border-gray-800">
            ID: {{ hypothesis._id }}
          </span>
          
          <!-- Score Change Indicator Delta Badge -->
          <span 
            v-if="scoreDelta" 
            class="text-[11px] font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1 animate-fadeIn"
            :class="scoreDelta.delta > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : scoreDelta.delta < 0 ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-gray-900 text-gray-400 border border-gray-700'"
          >
            <span>{{ scoreDelta.delta > 0 ? '▲ +' : scoreDelta.delta < 0 ? '▼ ' : '● ' }}{{ scoreDelta.delta.toFixed(2) }}</span>
            <span class="text-[9px] opacity-75 font-normal">({{ scoreDelta.oldScore.toFixed(1) }} ➔ {{ scoreDelta.newScore.toFixed(1) }})</span>
          </span>

          <!-- What Changed Trigger -->
          <button
            @click="$emit('open-history', hypothesis)"
            class="text-[10px] font-mono font-bold text-purple-300 hover:text-purple-200 bg-purple-950/70 border border-purple-700/60 px-2 py-0.5 rounded transition flex items-center space-x-1"
          >
            <span>⚡ What Changed?</span>
            <span v-if="hypothesisHistory.length > 0" class="text-[9px] bg-purple-900 text-purple-200 px-1 rounded-full">
              {{ hypothesisHistory.length }}
            </span>
          </button>
        </div>

        <h3 class="text-xl font-extrabold text-white leading-tight">{{ hypothesis.title }}</h3>
        <p v-if="hypothesis.description" class="text-sm text-gray-300 mt-1 max-w-4xl leading-relaxed">
          {{ hypothesis.description }}
        </p>
      </div>

      <!-- Score KPI Display -->
      <div class="flex items-center space-x-4 self-end sm:self-auto bg-gray-900/90 p-3 rounded-xl border border-gray-700/80 shadow-inner">
        <div class="text-right">
          <div class="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Analytical Score</div>
          <div class="text-2xl font-black font-mono" :class="hypothesis.score > 0 ? 'text-emerald-400' : hypothesis.score < 0 ? 'text-rose-400' : 'text-gray-400'">
            {{ hypothesis.score > 0 ? '+' : '' }}{{ (hypothesis.score || 0).toFixed(2) }}
          </div>
        </div>
        <button 
          v-if="hasEvidence"
          @click="$emit('link-evidence', hypothesis._id)" 
          class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-2 rounded-lg transition shadow flex items-center space-x-1"
        >
          <span>🔗 Link</span>
        </button>
      </div>
    </div>

    <!-- Relational Factors & Strongest Factors Row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-900/70 p-3.5 rounded-lg border border-gray-700/60 text-xs">
      <div>
        <span class="text-gray-400 block text-[10px] uppercase font-bold">Supporting Evidence:</span>
        <span class="text-emerald-400 font-bold font-mono text-sm">+{{ supportCount }} items</span>
      </div>
      <div>
        <span class="text-gray-400 block text-[10px] uppercase font-bold">Contradicting Evidence:</span>
        <span class="text-rose-400 font-bold font-mono text-sm">-{{ contradictCount }} items</span>
      </div>
      <div>
        <span class="text-gray-400 block text-[10px] uppercase font-bold">Strongest Supporting:</span>
        <span class="text-emerald-300 font-mono truncate block text-[11px]" :title="strongestSupportText">
          {{ strongestSupportText }}
        </span>
      </div>
      <div>
        <span class="text-gray-400 block text-[10px] uppercase font-bold">Strongest Contradiction:</span>
        <span class="text-rose-300 font-mono truncate block text-[11px]" :title="strongestContradictText">
          {{ strongestContradictText }}
        </span>
      </div>
    </div>

    <!-- Score Evolution & Trend Section -->
    <div v-if="hypothesisHistory.length > 0" class="space-y-2">
      <ScoreTrendVisualizer 
        :history="hypothesisHistory" 
        :current-score="hypothesis.score || 0"
        @select-history="(item) => $emit('open-history', hypothesis, item)"
      />
    </div>

    <!-- Structured Explainability Accordion -->
    <div class="bg-gray-900/90 border border-gray-700/80 p-4 rounded-xl space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-blue-400 text-sm">⚖️</span>
          <span class="text-xs font-bold text-gray-200 uppercase tracking-wider">Score Explainability & Factor Contributions</span>
        </div>
        <button 
          @click="$emit('open-explainability', hypothesis)" 
          class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center space-x-1"
        >
          <span>Why this score? (Full Breakdown)</span>
        </button>
      </div>

      <div v-if="!hypothesis.explainability || hypothesis.explainability.length === 0" class="text-xs text-gray-500 italic py-2">
        No evidence linked yet. Link supporting or contradicting evidence to compute mathematical scores.
      </div>
      <div v-else class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        <div 
          v-for="(exp, idx) in hypothesis.explainability" 
          :key="idx" 
          class="text-xs font-mono p-2.5 rounded-lg flex items-start space-x-2 shadow-sm"
          :class="exp.startsWith('+') ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40' : 'bg-rose-950/40 text-rose-300 border border-rose-800/40'"
        >
          <span>{{ exp }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ScoreTrendVisualizer from './ScoreTrendVisualizer.vue';

const props = defineProps({
  hypothesis: { type: Object, required: true },
  rank: { type: Number, default: 1 },
  evidence: { type: Array, default: () => [] },
  relationships: { type: Array, default: () => [] },
  scoreDelta: { type: Object, default: null },
  hasEvidence: { type: Boolean, default: true },
  scoreHistory: { type: Array, default: () => [] }
});

defineEmits(['link-evidence', 'open-explainability', 'open-history']);

const hypothesisHistory = computed(() => {
  return props.scoreHistory.filter(h => String(h.hypothesisId) === String(props.hypothesis._id));
});

const relsForHypothesis = computed(() => {
  return props.relationships.filter(r => String(r.hypothesisId) === String(props.hypothesis._id));
});

const supportCount = computed(() => relsForHypothesis.value.filter(r => r.type === 'SUPPORT').length);
const contradictCount = computed(() => relsForHypothesis.value.filter(r => r.type === 'CONTRADICT').length);

const factorCalculations = computed(() => {
  return relsForHypothesis.value.map(r => {
    const ev = props.evidence.find(e => String(e._id) === String(r.evidenceId));
    const title = ev ? ev.title : 'Evidence ' + r.evidenceId;
    const conf = ev && ev.confidenceScore !== undefined ? ev.confidenceScore : 50;
    const state = ev ? (ev.verificationState || 'UNVERIFIED') : 'UNVERIFIED';

    let multiplier = 0.5;
    if (state === 'VERIFIED') multiplier = 1.0;
    else if (state === 'DISPUTED') multiplier = 0.2;
    else if (state === 'REJECTED') multiplier = 0.0;

    const strength = Number(r.strength) || 5;
    const base = strength * (conf / 100);
    const value = base * multiplier;

    return {
      type: r.type,
      title,
      evidenceId: r.evidenceId,
      value
    };
  });
});

const strongestSupportText = computed(() => {
  const supports = factorCalculations.value.filter(f => f.type === 'SUPPORT');
  if (supports.length === 0) return 'None linked';
  supports.sort((a, b) => b.value - a.value);
  return `${supports[0].title} (+${supports[0].value.toFixed(2)})`;
});

const strongestContradictText = computed(() => {
  const contradicts = factorCalculations.value.filter(f => f.type === 'CONTRADICT');
  if (contradicts.length === 0) return 'None linked';
  contradicts.sort((a, b) => b.value - a.value);
  return `${contradicts[0].title} (-${contradicts[0].value.toFixed(2)})`;
});
</script>

