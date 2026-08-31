<template>
  <div class="bg-gray-900/90 border border-gray-700/80 rounded-xl p-4 shadow-lg space-y-3">
    <div class="flex items-center justify-between border-b border-gray-800 pb-2.5">
      <div class="flex items-center space-x-2">
        <span class="text-indigo-400 text-sm">📡</span>
        <h3 class="text-xs font-bold uppercase tracking-wider text-gray-200">Investigation Intelligence Signals</h3>
      </div>
      <div class="flex items-center space-x-3">
        <span class="text-[10px] font-mono text-gray-400">Live Telemetry</span>
        <button
          v-if="scoreHistory.length > 0"
          @click="$emit('open-history')"
          class="text-[10px] font-mono text-purple-400 hover:text-purple-300 font-bold underline flex items-center space-x-1"
        >
          <span>⚡ What Changed? ({{ scoreHistory.length }})</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
      <!-- 1. Strongest Current Hypothesis -->
      <div class="bg-gray-800/80 border border-purple-900/40 p-3 rounded-lg flex flex-col justify-between space-y-1">
        <span class="text-[10px] uppercase font-bold text-purple-300">Leading Theory</span>
        <div v-if="signals.leadingHypothesis" class="space-y-0.5">
          <div class="text-xs font-bold text-white truncate" :title="signals.leadingHypothesis.title">
            {{ signals.leadingHypothesis.title }}
          </div>
          <div class="text-xs font-mono font-black" :class="signals.leadingHypothesis.score > 0 ? 'text-emerald-400' : 'text-rose-400'">
            {{ signals.leadingHypothesis.score > 0 ? '+' : '' }}{{ signals.leadingHypothesis.score?.toFixed(2) }} pts
          </div>
        </div>
        <div v-else class="text-[11px] text-gray-500 italic">No theories active</div>
        <span class="text-[10px] text-gray-500">Highest ranked</span>
      </div>

      <!-- 2. Highest Analytical Impact Evidence -->
      <div class="bg-gray-800/80 border border-blue-900/40 p-3 rounded-lg flex flex-col justify-between space-y-1">
        <span class="text-[10px] uppercase font-bold text-blue-300">Highest Impact Evidence</span>
        <div v-if="signals.highestImpactEvidence" class="space-y-0.5">
          <div class="text-xs font-bold text-white truncate" :title="signals.highestImpactEvidence.evidence.title">
            {{ signals.highestImpactEvidence.evidence.title }}
          </div>
          <div class="text-xs font-mono font-bold text-blue-300">
            ±{{ signals.highestImpactEvidence.totalWeight.toFixed(2) }} impact across {{ signals.highestImpactEvidence.linksCount }} links
          </div>
        </div>
        <div v-else class="text-[11px] text-gray-500 italic">No linked evidence</div>
        <span class="text-[10px] text-gray-500">Max analytical weight</span>
      </div>

      <!-- 3. Recent Score Mutation Velocity -->
      <div class="bg-gray-800/80 border border-emerald-900/40 p-3 rounded-lg flex flex-col justify-between space-y-1">
        <span class="text-[10px] uppercase font-bold text-emerald-300">Latest Mutation</span>
        <div v-if="signals.latestMutation" class="space-y-0.5">
          <div class="text-xs font-bold text-white truncate" :title="signals.latestMutation.hypothesisTitle">
            {{ signals.latestMutation.hypothesisTitle }}
          </div>
          <div class="text-xs font-mono font-bold" :class="signals.latestMutation.delta > 0 ? 'text-emerald-400' : 'text-rose-400'">
            {{ signals.latestMutation.delta > 0 ? '▲ +' : '▼ ' }}{{ Number(signals.latestMutation.delta).toFixed(2) }}
            <span class="text-[9px] text-gray-400 font-normal">({{ signals.latestMutation.triggerType?.replace('_EVIDENCE', '')?.replace('_RELATIONSHIP', '') }})</span>
          </div>
        </div>
        <div v-else class="text-[11px] text-gray-500 italic">No mutations yet</div>
        <span class="text-[10px] text-gray-500">Most recent delta</span>
      </div>

      <!-- 4. Dominant Theory Spread -->
      <div class="bg-gray-800/80 border border-amber-900/40 p-3 rounded-lg flex flex-col justify-between space-y-1">
        <span class="text-[10px] uppercase font-bold text-amber-300">Theory Lead Spread</span>
        <div class="space-y-0.5">
          <div class="text-xs font-bold text-white font-mono">
            {{ signals.scoreSpread }} pts
          </div>
          <div class="text-[11px] text-gray-400 truncate">
            Gap between #1 & #2
          </div>
        </div>
        <span class="text-[10px] text-gray-500">Consensus lead</span>
      </div>

      <!-- 5. Unresolved / Disputed Items -->
      <div class="bg-gray-800/80 border border-rose-900/40 p-3 rounded-lg flex flex-col justify-between space-y-1">
        <span class="text-[10px] uppercase font-bold text-rose-300">Unresolved Items</span>
        <div class="space-y-0.5">
          <div class="text-sm font-black font-mono" :class="signals.unresolvedCount > 0 ? 'text-rose-400' : 'text-emerald-400'">
            {{ signals.unresolvedCount }} Items
          </div>
          <div class="text-[11px] text-gray-400">
            {{ signals.unverifiedCount }} unverified • {{ signals.disputedCount }} disputed
          </div>
        </div>
        <span class="text-[10px] text-gray-500">Requires review</span>
      </div>

      <!-- 6. Relationship Conflicts -->
      <div class="bg-gray-800/80 border border-indigo-900/40 p-3 rounded-lg flex flex-col justify-between space-y-1">
        <span class="text-[10px] uppercase font-bold text-indigo-300">Relational Tension</span>
        <div class="space-y-0.5">
          <div class="text-sm font-black font-mono" :class="signals.conflictCount > 0 ? 'text-amber-400' : 'text-emerald-400'">
            {{ signals.conflictCount }} Contradictions
          </div>
          <div class="text-[11px] text-gray-400">
            Active negative links
          </div>
        </div>
        <span class="text-[10px] text-gray-500">Divergent evidence</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  evidence: { type: Array, default: () => [] },
  hypotheses: { type: Array, default: () => [] },
  relationships: { type: Array, default: () => [] },
  scoreHistory: { type: Array, default: () => [] }
});

defineEmits(['open-history']);

const signals = computed(() => {
  const ranked = [...props.hypotheses].sort((a, b) => (b.score || 0) - (a.score || 0));
  const leading = ranked.length > 0 ? ranked[0] : null;
  const runnerUp = ranked.length > 1 ? ranked[1] : null;

  const scoreSpread = leading && runnerUp ? (leading.score - runnerUp.score).toFixed(2) : (leading ? leading.score.toFixed(2) : '0.00');

  // Compute impact per evidence item
  let highestImpact = null;
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
      const w = Number(r.strength || 5) * ((ev.confidenceScore !== undefined ? ev.confidenceScore : 50) / 100) * multiplier;
      totalWeight += w;
    });

    if (totalWeight > maxImpact) {
      maxImpact = totalWeight;
      highestImpact = { evidence: ev, totalWeight, linksCount: rels.length };
    }
  });

  const unverifiedCount = props.evidence.filter(e => !e.verificationState || e.verificationState === 'UNVERIFIED' || e.verificationState === 'UNDER REVIEW').length;
  const disputedCount = props.evidence.filter(e => e.verificationState === 'DISPUTED' || e.verificationState === 'REJECTED').length;
  const conflictCount = props.relationships.filter(r => r.type === 'CONTRADICT').length;

  const latestMutation = props.scoreHistory.length > 0 ? props.scoreHistory[0] : null;

  return {
    leadingHypothesis: leading,
    highestImpactEvidence: highestImpact,
    latestMutation,
    scoreSpread,
    unresolvedCount: unverifiedCount + disputedCount,
    unverifiedCount,
    disputedCount,
    conflictCount
  };
});
</script>

