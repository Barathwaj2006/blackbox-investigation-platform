<template>
  <div class="bg-gray-900/90 border border-gray-700/80 rounded-xl p-4 shadow-lg space-y-3">
    <div class="flex items-center justify-between border-b border-gray-800 pb-2.5">
      <div class="flex items-center space-x-2">
        <span class="text-purple-400 text-sm">📊</span>
        <h3 class="text-xs font-bold uppercase tracking-wider text-gray-200">Competing Theories Comparative Matrix & Score Movement</h3>
      </div>
      <div class="flex items-center space-x-3">
        <span class="text-[10px] font-mono text-gray-400">{{ hypotheses.length }} Theories Evaluated</span>
        <button 
          @click="$emit('open-history')" 
          class="text-[10px] font-mono text-purple-400 hover:text-purple-300 font-bold underline"
        >
          View Full History ➔
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs font-mono">
        <thead class="bg-gray-950/80 text-gray-400 uppercase text-[10px] border-b border-gray-800">
          <tr>
            <th class="p-2.5">Rank & Hypothesis</th>
            <th class="p-2.5">Score Gauge</th>
            <th class="p-2.5 text-center">Score</th>
            <th class="p-2.5 text-center">Movement & Delta</th>
            <th class="p-2.5 text-center">Support</th>
            <th class="p-2.5 text-center">Contradict</th>
            <th class="p-2.5 text-center">Verified Ratio</th>
            <th class="p-2.5 text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr 
            v-for="(item, idx) in comparisonData" 
            :key="item._id"
            class="hover:bg-gray-800/50 transition"
            :class="idx === 0 ? 'bg-purple-950/15' : ''"
          >
            <td class="p-2.5 font-sans">
              <div class="flex items-center space-x-2">
                <span 
                  class="font-mono text-[10px] px-1.5 py-0.5 rounded font-bold"
                  :class="idx === 0 ? 'bg-purple-900 text-purple-200 border border-purple-700' : 'bg-gray-800 text-gray-400'"
                >
                  #{{ idx + 1 }}
                </span>
                <span class="font-bold text-white text-xs">{{ item.title }}</span>
              </div>
            </td>
            <td class="p-2.5 w-32">
              <div class="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-gray-800 flex">
                <div 
                  v-if="item.score > 0"
                  class="bg-emerald-500 h-full transition-all duration-300"
                  :style="{ width: Math.min(100, Math.max(5, (item.score / maxScore) * 100)) + '%' }"
                ></div>
                <div 
                  v-else-if="item.score < 0"
                  class="bg-rose-500 h-full transition-all duration-300 ml-auto"
                  :style="{ width: Math.min(100, Math.max(5, (Math.abs(item.score) / maxScore) * 100)) + '%' }"
                ></div>
              </div>
            </td>
            <td class="p-2.5 text-center font-bold text-xs" :class="item.score > 0 ? 'text-emerald-400' : item.score < 0 ? 'text-rose-400' : 'text-gray-400'">
              {{ item.score > 0 ? '+' : '' }}{{ (item.score || 0).toFixed(2) }}
            </td>

            <!-- Score Movement & Delta -->
            <td class="p-2.5 text-center">
              <span 
                v-if="item.delta !== null && item.delta !== undefined"
                class="px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center space-x-1"
                :class="item.delta > 0 ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : item.delta < 0 ? 'bg-rose-950/80 text-rose-300 border border-rose-800' : 'bg-gray-900 text-gray-400 border border-gray-800'"
              >
                <span>{{ item.delta > 0 ? '▲ +' : item.delta < 0 ? '▼ ' : '➔ ' }}{{ item.delta.toFixed(2) }}</span>
                <span v-if="item.previousScore !== null" class="text-[9px] opacity-75 font-normal">({{ item.previousScore.toFixed(1) }})</span>
              </span>
              <span v-else class="text-gray-500 text-[10px]">
                Baseline
              </span>
            </td>

            <td class="p-2.5 text-center text-emerald-400 font-bold">
              +{{ item.supportCount }}
            </td>
            <td class="p-2.5 text-center text-rose-400 font-bold">
              -{{ item.contradictCount }}
            </td>
            <td class="p-2.5 text-center text-gray-300">
              {{ item.verifiedRatio }}%
            </td>
            <td class="p-2.5 text-right font-sans">
              <span 
                v-if="idx === 0" 
                class="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-purple-900 text-purple-200 border border-purple-600 animate-pulse"
              >
                ★ LEADING THEORY
              </span>
              <span 
                v-else 
                class="text-[10px] font-mono px-2 py-0.5 rounded font-medium bg-gray-800 text-gray-400 border border-gray-700"
              >
                COMPETING
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  hypotheses: { type: Array, default: () => [] },
  evidence: { type: Array, default: () => [] },
  relationships: { type: Array, default: () => [] },
  scoreDeltas: { type: Object, default: () => ({}) },
  scoreHistory: { type: Array, default: () => [] }
});

defineEmits(['open-history']);

const maxScore = computed(() => {
  const scores = props.hypotheses.map(h => Math.abs(h.score || 0));
  const max = Math.max(...scores, 1);
  return max;
});

const comparisonData = computed(() => {
  const ranked = [...props.hypotheses].sort((a, b) => (b.score || 0) - (a.score || 0));

  return ranked.map(h => {
    const rels = props.relationships.filter(r => String(r.hypothesisId) === String(h._id));
    const supportRels = rels.filter(r => r.type === 'SUPPORT');
    const contradictRels = rels.filter(r => r.type === 'CONTRADICT');

    // Calculate verified ratio
    let verifiedSupport = 0;
    supportRels.forEach(r => {
      const ev = props.evidence.find(e => String(e._id) === String(r.evidenceId));
      if (ev && ev.verificationState === 'VERIFIED') {
        verifiedSupport++;
      }
    });

    const verifiedRatio = supportRels.length > 0 ? Math.round((verifiedSupport / supportRels.length) * 100) : 0;

    // Determine score movement delta from scoreDeltas or latest score history
    let delta = null;
    let previousScore = null;

    if (props.scoreDeltas && props.scoreDeltas[h._id]) {
      delta = props.scoreDeltas[h._id].delta;
      previousScore = props.scoreDeltas[h._id].oldScore;
    } else {
      const hist = (props.scoreHistory || []).find(sh => String(sh.hypothesisId) === String(h._id));
      if (hist) {
        delta = hist.delta;
        previousScore = hist.previousScore;
      }
    }

    return {
      _id: h._id,
      title: h.title,
      score: h.score || 0,
      delta,
      previousScore,
      supportCount: supportRels.length,
      contradictCount: contradictRels.length,
      verifiedRatio
    };
  });
});
</script>

