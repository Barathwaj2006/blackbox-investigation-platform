<template>
  <div class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
    <div class="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-start border-b border-gray-700 pb-3">
        <div>
          <div class="flex items-center space-x-2">
            <button 
              @click="$emit('close')" 
              class="text-xs font-mono text-purple-400 hover:text-purple-300 font-bold flex items-center space-x-1 mr-2 px-2 py-0.5 rounded bg-gray-900 border border-gray-700 transition"
            >
              <span>←</span>
              <span>Back to Hypotheses</span>
            </button>
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-gray-900 text-purple-400 border border-gray-700 font-bold">
              ID: {{ hypothesis._id }}
            </span>
            <span class="text-xs font-mono font-bold text-gray-400">Score Audit Dossier</span>
          </div>
          <h3 class="text-xl font-bold text-white mt-1">{{ hypothesis.title }}</h3>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white text-xl font-bold p-1" title="Close">✕</button>
      </div>

      <!-- Score Header Banner -->
      <div class="bg-gray-900/90 border border-gray-700 p-4 rounded-xl flex items-center justify-between font-mono">
        <div>
          <span class="text-[10px] uppercase text-gray-400 block font-bold">Total Composite Score:</span>
          <div class="text-2xl font-black" :class="hypothesis.score > 0 ? 'text-emerald-400' : hypothesis.score < 0 ? 'text-rose-400' : 'text-gray-400'">
            {{ hypothesis.score > 0 ? '+' : '' }}{{ (hypothesis.score || 0).toFixed(2) }} pts
          </div>
        </div>
        <div class="text-right text-xs text-gray-400 space-y-0.5">
          <div>Formula: <strong class="text-gray-200">Σ (Type × Strength × Conf% × Multiplier)</strong></div>
          <div class="text-[11px] text-gray-500">VERIFIED=1.0 • UNVERIFIED=0.5 • DISPUTED=0.2 • REJECTED=0.0</div>
        </div>
      </div>

      <!-- SUPPORTING EVIDENCE SECTION -->
      <div class="space-y-2">
        <div class="flex items-center justify-between border-b border-emerald-950 pb-1.5">
          <div class="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <span>✓</span>
            <span>Supporting Evidence Factors ({{ supportingFactors.length }})</span>
          </div>
          <span class="text-xs font-mono font-bold text-emerald-400">+{{ totalSupportScore.toFixed(2) }} pts</span>
        </div>

        <div v-if="supportingFactors.length === 0" class="text-xs text-gray-500 italic py-2 bg-gray-900/40 p-3 rounded-lg border border-gray-800">
          No supporting evidence linked to this theory.
        </div>
        <div v-else class="space-y-2">
          <div 
            v-for="(item, idx) in supportingFactors" 
            :key="idx"
            class="bg-gray-900/80 border border-emerald-950 p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-2"
          >
            <div class="space-y-0.5 text-xs">
              <div class="flex items-center space-x-2">
                <span class="font-mono text-[10px] text-gray-400 px-1.5 py-0.2 rounded bg-gray-950 border border-gray-800">{{ item.evidenceId }}</span>
                <span class="font-bold text-white">{{ item.evidenceTitle }}</span>
              </div>
              <div class="font-mono text-[11px] text-gray-400">
                Confidence: <strong class="text-gray-200">{{ item.confidence }}%</strong> • 
                Strength: <strong class="text-gray-200">{{ item.strength }}/10</strong> • 
                State: <span :class="item.stateColor">{{ item.state }}</span> (×{{ item.multiplier }})
              </div>
            </div>
            <div class="font-mono text-sm font-black text-emerald-400 self-end sm:self-auto">
              +{{ item.value.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <!-- CONTRADICTING EVIDENCE SECTION -->
      <div class="space-y-2">
        <div class="flex items-center justify-between border-b border-rose-950 pb-1.5">
          <div class="flex items-center space-x-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <span>✕</span>
            <span>Contradicting Evidence Factors ({{ contradictingFactors.length }})</span>
          </div>
          <span class="text-xs font-mono font-bold text-rose-400">-{{ totalContradictScore.toFixed(2) }} pts</span>
        </div>

        <div v-if="contradictingFactors.length === 0" class="text-xs text-gray-500 italic py-2 bg-gray-900/40 p-3 rounded-lg border border-gray-800">
          No contradicting evidence linked to this theory.
        </div>
        <div v-else class="space-y-2">
          <div 
            v-for="(item, idx) in contradictingFactors" 
            :key="idx"
            class="bg-gray-900/80 border border-rose-950 p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-2"
          >
            <div class="space-y-0.5 text-xs">
              <div class="flex items-center space-x-2">
                <span class="font-mono text-[10px] text-gray-400 px-1.5 py-0.2 rounded bg-gray-950 border border-gray-800">{{ item.evidenceId }}</span>
                <span class="font-bold text-white">{{ item.evidenceTitle }}</span>
              </div>
              <div class="font-mono text-[11px] text-gray-400">
                Confidence: <strong class="text-gray-200">{{ item.confidence }}%</strong> • 
                Strength: <strong class="text-gray-200">{{ item.strength }}/10</strong> • 
                State: <span :class="item.stateColor">{{ item.state }}</span> (×{{ item.multiplier }})
              </div>
            </div>
            <div class="font-mono text-sm font-black text-rose-400 self-end sm:self-auto">
              -{{ item.value.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <div class="pt-2 border-t border-gray-700 flex justify-end">
        <button 
          @click="$emit('close')" 
          class="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-lg transition"
        >
          Close Explanation
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  hypothesis: { type: Object, required: true },
  evidence: { type: Array, default: () => [] },
  relationships: { type: Array, default: () => [] }
});

defineEmits(['close']);

const parsedFactors = computed(() => {
  const rels = props.relationships.filter(r => String(r.hypothesisId) === String(props.hypothesis._id));

  return rels.map(rel => {
    const ev = props.evidence.find(e => String(e._id) === String(rel.evidenceId));
    const title = ev ? ev.title : 'Evidence ' + rel.evidenceId;
    const conf = ev && ev.confidenceScore !== undefined ? ev.confidenceScore : 50;
    const state = ev ? (ev.verificationState || 'UNVERIFIED') : 'UNVERIFIED';

    let multiplier = 0.5;
    let stateColor = 'text-amber-400';
    if (state === 'VERIFIED') {
      multiplier = 1.0;
      stateColor = 'text-emerald-400';
    } else if (state === 'DISPUTED') {
      multiplier = 0.2;
      stateColor = 'text-orange-400';
    } else if (state === 'REJECTED') {
      multiplier = 0.0;
      stateColor = 'text-rose-400';
    }

    const strength = Number(rel.strength) || 5;
    const base = strength * (conf / 100);
    const value = base * multiplier;

    return {
      relationshipId: rel._id,
      evidenceId: rel.evidenceId,
      evidenceTitle: title,
      type: rel.type,
      strength,
      confidence: conf,
      state,
      stateColor,
      multiplier,
      value
    };
  });
});

const supportingFactors = computed(() => parsedFactors.value.filter(f => f.type === 'SUPPORT'));
const contradictingFactors = computed(() => parsedFactors.value.filter(f => f.type === 'CONTRADICT'));

const totalSupportScore = computed(() => supportingFactors.value.reduce((acc, f) => acc + f.value, 0));
const totalContradictScore = computed(() => contradictingFactors.value.reduce((acc, f) => acc + f.value, 0));
</script>
