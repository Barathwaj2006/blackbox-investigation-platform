<template>
  <div 
    class="bg-[#0B0F19] rounded-xl border p-5 transition space-y-4 shadow-sm"
    :class="rank === 1 ? 'border-purple-600/80 bg-gradient-to-b from-[#0D1322] to-[#120D22]' : 'border-slate-800/90 hover:border-slate-700'"
  >
    <!-- Top Row: Rank Badge, ID, Title, Score, Link Button -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
      <div class="space-y-1.5 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span 
            class="text-[11px] px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider shadow-sm"
            :class="rank === 1 ? 'bg-purple-950 text-purple-300 border border-purple-700' : 'bg-slate-900 text-slate-400 border border-slate-700'"
          >
            {{ rank === 1 ? '★ LEADING THEORY' : `Rank #${rank}` }}
          </span>
          <span class="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            ID: {{ hypothesis._id }}
          </span>
          
          <!-- Score Change Indicator Delta Badge -->
          <span 
            v-if="scoreDelta" 
            class="text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1"
            :class="scoreDelta.delta > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : scoreDelta.delta < 0 ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-slate-900 text-slate-400 border border-slate-700'"
          >
            <span>{{ scoreDelta.delta > 0 ? '▲ +' : scoreDelta.delta < 0 ? '▼ ' : '● ' }}{{ scoreDelta.delta.toFixed(2) }}</span>
          </span>

          <!-- What Changed Trigger -->
          <button
            @click="$emit('open-history', hypothesis)"
            class="text-[10px] font-mono font-bold text-purple-300 hover:text-purple-200 bg-purple-950/70 border border-purple-700/60 px-2 py-0.5 rounded transition flex items-center space-x-1"
          >
            <span>What Changed?</span>
            <span v-if="hypothesisHistory.length > 0" class="text-[9px] bg-purple-900 text-purple-200 px-1 rounded-full">
              {{ hypothesisHistory.length }}
            </span>
          </button>
        </div>

        <h3 class="text-lg sm:text-xl font-black text-white leading-tight font-mono uppercase">{{ hypothesis.title }}</h3>
        <p v-if="hypothesis.description" class="text-xs sm:text-sm text-slate-300 mt-1 max-w-4xl leading-relaxed">
          {{ hypothesis.description }}
        </p>
      </div>

      <!-- Score KPI Display -->
      <div class="flex items-center space-x-3 self-end sm:self-auto bg-[#0D1322] px-3.5 py-2.5 rounded-xl border border-slate-700/80 shadow-inner">
        <div class="text-right">
          <div class="text-[10px] uppercase text-slate-400 font-bold font-mono tracking-wider">Score</div>
          <div class="text-2xl font-black font-mono" :class="hypothesis.score > 0 ? 'text-emerald-400' : hypothesis.score < 0 ? 'text-rose-400' : 'text-slate-400'">
            {{ hypothesis.score > 0 ? '+' : '' }}{{ (hypothesis.score || 0).toFixed(2) }}
          </div>
        </div>
        <button 
          v-if="hasEvidence"
          @click="$emit('link-evidence', hypothesis._id)" 
          class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold font-mono px-3 py-1.5 rounded-lg transition shadow flex items-center space-x-1"
        >
          <span>+ Link</span>
        </button>
      </div>
    </div>

    <!-- Relational Factors & Strongest Factors Row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0D1322]/80 p-3 rounded-lg border border-slate-800/80 text-xs font-mono">
      <div>
        <span class="text-slate-400 block text-[10px] uppercase font-bold">Supporting:</span>
        <span class="text-emerald-400 font-bold text-sm">+{{ supportCount }} items</span>
      </div>
      <div>
        <span class="text-slate-400 block text-[10px] uppercase font-bold">Contradicting:</span>
        <span class="text-rose-400 font-bold text-sm">-{{ contradictCount }} items</span>
      </div>
      <div>
        <span class="text-slate-400 block text-[10px] uppercase font-bold">Strongest Sup:</span>
        <span class="text-emerald-300 truncate block text-[11px]" :title="strongestSupportText">
          {{ strongestSupportText }}
        </span>
      </div>
      <div>
        <span class="text-slate-400 block text-[10px] uppercase font-bold">Strongest Con:</span>
        <span class="text-rose-300 truncate block text-[11px]" :title="strongestContradictText">
          {{ strongestContradictText }}
        </span>
      </div>
    </div>

    <!-- Explainability Action Bar -->
    <div class="flex items-center justify-between pt-1 border-t border-slate-800/80">
      <div class="text-[11px] text-slate-400 font-mono">
        <span v-if="hypothesis.explainability && hypothesis.explainability.length > 0">
          {{ hypothesis.explainability.length }} active mathematical evidence factors.
        </span>
        <span v-else class="text-slate-500 italic">
          No evidence links yet.
        </span>
      </div>
      
      <button 
        @click="$emit('open-explainability', hypothesis)" 
        class="text-xs text-blue-400 hover:text-blue-300 font-semibold font-mono flex items-center space-x-1"
      >
        <span>Why this score? (Explainability) ➔</span>
      </button>
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

