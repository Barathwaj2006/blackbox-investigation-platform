<template>
  <div class="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-2 border-purple-600/70 rounded-xl p-5 shadow-2xl space-y-4 animate-fadeIn">
    <!-- Header / Banner Title -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/60 pb-3">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-lg bg-purple-900/80 border border-purple-500/60 flex items-center justify-center text-purple-300 font-bold text-lg shadow-inner">
          ⚖️
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xs font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-900 text-purple-200 border border-purple-600">
              INVESTIGATION REVIEW MODE
            </span>
            <span class="text-xs text-purple-300/80 font-mono">Formal Peer & Supervisory Review</span>
          </div>
          <p class="text-xs text-slate-300 mt-0.5">
            Dossier is undergoing evaluation before final sign-off and forensic resolution.
          </p>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-wrap items-center gap-2 self-start sm:self-auto">
        <button 
          @click="$emit('resume-investigation')"
          class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition font-mono"
        >
          ↩ Return to Active
        </button>
        <button 
          @click="$emit('open-resolve-modal')"
          class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-900/40 font-mono"
        >
          <span>✓ Approve & Resolve Case</span>
        </button>
      </div>
    </div>

    <!-- Readiness & Quality Checklist -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
      <!-- 1. Verification Quality -->
      <div class="bg-slate-950/70 p-3 rounded-lg border border-purple-900/50 space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-slate-400 uppercase text-[10px] font-bold">Evidence Integrity:</span>
          <span :class="unverifiedCount === 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'">
            {{ unverifiedCount === 0 ? '✓ COMPLETE' : '⚠ PENDING' }}
          </span>
        </div>
        <div class="text-white font-bold text-sm">
          {{ verifiedCount }} of {{ totalEvidence }} Verified ({{ verificationPercent }}%)
        </div>
        <div class="text-[10px] text-slate-400">
          <span v-if="unverifiedCount > 0" class="text-amber-300">
            {{ unverifiedCount }} item(s) awaiting verification
          </span>
          <span v-else class="text-emerald-300">
            All evidence artifacts verified with 1.0x weight
          </span>
        </div>
      </div>

      <!-- 2. Leading Theory Spread -->
      <div class="bg-slate-950/70 p-3 rounded-lg border border-purple-900/50 space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-slate-400 uppercase text-[10px] font-bold">Theory Consensus:</span>
          <span :class="theorySpread && Number(theorySpread) >= 5 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'">
            {{ theorySpread && Number(theorySpread) >= 5 ? '✓ HIGH SPREAD' : 'EVALUATING' }}
          </span>
        </div>
        <div class="text-white font-bold text-sm truncate" :title="leadingTheory?.title || 'None'">
          {{ leadingTheory?.title || 'No Leading Theory' }}
        </div>
        <div class="text-[10px] text-slate-400">
          Score: <strong class="text-emerald-400">{{ (leadingTheory?.score || 0).toFixed(2) }}</strong>
          <span v-if="theorySpread" class="text-slate-400"> (Spread: +{{ theorySpread }} vs #2)</span>
        </div>
      </div>

      <!-- 3. Conflict / Dispute Status -->
      <div class="bg-slate-950/70 p-3 rounded-lg border border-purple-900/50 space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-slate-400 uppercase text-[10px] font-bold">Forensic Disputes:</span>
          <span :class="disputedCount === 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'">
            {{ disputedCount === 0 ? '✓ NO DISPUTES' : `${disputedCount} DISPUTED` }}
          </span>
        </div>
        <div class="text-white font-bold text-sm">
          {{ relationshipsCount }} Active Relational Links
        </div>
        <div class="text-[10px] text-slate-400">
          <span v-if="disputedCount > 0" class="text-rose-300">
            Resolve {{ disputedCount }} disputed artifact(s) before closing
          </span>
          <span v-else class="text-emerald-300">
            Relational matrix mathematically consistent
          </span>
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
  relationships: { type: Array, default: () => [] }
});

defineEmits(['resume-investigation', 'open-resolve-modal']);

const totalEvidence = computed(() => props.evidence.length);
const verifiedCount = computed(() => props.evidence.filter(e => e.verificationState === 'VERIFIED').length);
const unverifiedCount = computed(() => props.evidence.filter(e => !e.verificationState || e.verificationState === 'UNVERIFIED').length);
const disputedCount = computed(() => props.evidence.filter(e => e.verificationState === 'DISPUTED').length);
const relationshipsCount = computed(() => props.relationships.length);

const verificationPercent = computed(() => {
  if (totalEvidence.value === 0) return 0;
  return Math.round((verifiedCount.value / totalEvidence.value) * 100);
});

const rankedHypotheses = computed(() => {
  return [...props.hypotheses].sort((a, b) => (b.score || 0) - (a.score || 0));
});

const leadingTheory = computed(() => rankedHypotheses.value[0] || null);
const runnerUpTheory = computed(() => rankedHypotheses.value[1] || null);

const theorySpread = computed(() => {
  if (leadingTheory.value && runnerUpTheory.value) {
    const diff = leadingTheory.value.score - runnerUpTheory.value.score;
    return diff > 0 ? diff.toFixed(2) : '0.00';
  }
  return null;
});
</script>
