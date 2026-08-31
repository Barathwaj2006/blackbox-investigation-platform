<template>
  <div class="bg-[#0B0F19] rounded-xl border border-slate-800/90 p-4 flex flex-col justify-between hover:border-slate-700 hover:bg-[#0D1322]/80 transition space-y-3 shadow-sm group">
    <div class="space-y-2.5">
      <!-- Header row: ID, Type, Verification Badge -->
      <div class="flex justify-between items-start gap-2">
        <div class="flex items-center space-x-2 font-mono text-[10px]">
          <span class="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700/80 font-semibold">
            {{ evidence._id }}
          </span>
          <span class="text-slate-400">
            {{ evidence.type || 'Digital' }}
          </span>
        </div>

        <span :class="verificationBadgeClass(evidence.verificationState)" class="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider whitespace-nowrap shadow-sm">
          {{ evidence.verificationState || 'UNVERIFIED' }}
        </span>
      </div>

      <!-- Title & Source -->
      <div>
        <h3 class="text-sm font-bold text-white leading-snug group-hover:text-blue-300 transition line-clamp-2">
          {{ evidence.title }}
        </h3>
        <p class="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
          Source: <span class="text-slate-300">{{ evidence.source || 'Direct Capture' }}</span>
        </p>
      </div>

      <!-- Compact Metrics Row -->
      <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
        <div>
          <span>Confidence: </span>
          <strong class="text-white">{{ evidence.confidenceScore !== undefined ? evidence.confidenceScore : 50 }}%</strong>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-emerald-400 font-bold">+{{ supportCount }} Sup</span>
          <span class="text-slate-600">•</span>
          <span class="text-rose-400 font-bold">-{{ contradictCount }} Con</span>
        </div>
      </div>

      <!-- Primary Impact Summary -->
      <div v-if="impactList.length > 0" class="text-[11px] font-mono text-slate-300 flex items-center justify-between pt-0.5">
        <span class="text-slate-500 text-[10px] uppercase">Primary Impact:</span>
        <span 
          class="font-bold truncate max-w-[170px]"
          :class="impactList[0].value > 0 ? 'text-emerald-400' : impactList[0].value < 0 ? 'text-rose-400' : 'text-slate-400'"
          :title="`${impactList[0].hypothesisTitle} (${impactList[0].formattedImpact})`"
        >
          {{ impactList[0].formattedImpact }} to {{ impactList[0].hypothesisTitle }}
        </span>
      </div>
    </div>

    <!-- Actions Toolbar -->
    <div class="border-t border-slate-800/80 pt-2.5 space-y-2 mt-2">
      <div class="flex items-center justify-between">
        <button 
          @click="$emit('view-details', evidence)" 
          class="text-xs text-blue-400 hover:text-blue-300 font-semibold font-mono flex items-center space-x-1"
        >
          <span>Inspect Details ➔</span>
        </button>
        <button 
          v-if="hasHypotheses"
          @click="$emit('link-theory', evidence._id)" 
          class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold font-mono"
        >
          + Link Theory
        </button>
      </div>

      <!-- Verification Quick Action Buttons -->
      <div class="grid grid-cols-3 gap-1.5 pt-0.5">
        <button 
          @click="$emit('verify', { id: evidence._id, state: 'VERIFIED' })" 
          :disabled="isVerifying"
          :class="[
            evidence.verificationState === 'VERIFIED' ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-emerald-800 hover:text-white border border-slate-800',
            'text-[11px] py-1 rounded transition disabled:opacity-50 text-center font-mono'
          ]"
        >
          ✓ Verify
        </button>
        <button 
          @click="$emit('verify', { id: evidence._id, state: 'DISPUTED' })" 
          :disabled="isVerifying"
          :class="[
            evidence.verificationState === 'DISPUTED' ? 'bg-amber-700 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-amber-800 hover:text-white border border-slate-800',
            'text-[11px] py-1 rounded transition disabled:opacity-50 text-center font-mono'
          ]"
        >
          ⚠ Dispute
        </button>
        <button 
          @click="$emit('verify', { id: evidence._id, state: 'REJECTED' })" 
          :disabled="isVerifying"
          :class="[
            evidence.verificationState === 'REJECTED' ? 'bg-rose-700 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-rose-800 hover:text-white border border-slate-800',
            'text-[11px] py-1 rounded transition disabled:opacity-50 text-center font-mono'
          ]"
        >
          ✕ Reject
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
  isVerifying: { type: Boolean, default: false },
  hasHypotheses: { type: Boolean, default: true }
});

defineEmits(['view-details', 'link-theory', 'verify']);

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

const relsForEvidence = computed(() => {
  return props.relationships.filter(r => String(r.evidenceId) === String(props.evidence._id));
});

const relationshipCount = computed(() => relsForEvidence.value.length);
const supportCount = computed(() => relsForEvidence.value.filter(r => r.type === 'SUPPORT').length);
const contradictCount = computed(() => relsForEvidence.value.filter(r => r.type === 'CONTRADICT').length);

const impactList = computed(() => {
  const ev = props.evidence;
  let multiplier = 0.5;
  if (ev.verificationState === 'VERIFIED') multiplier = 1.0;
  else if (ev.verificationState === 'UNDER REVIEW') multiplier = 0.5;
  else if (ev.verificationState === 'UNVERIFIED') multiplier = 0.5;
  else if (ev.verificationState === 'DISPUTED') multiplier = 0.2;
  else if (ev.verificationState === 'REJECTED') multiplier = 0.0;

  const conf = ev.confidenceScore !== undefined ? ev.confidenceScore : 50;

  return relsForEvidence.value.map(r => {
    const hyp = props.hypotheses.find(h => String(h._id) === String(r.hypothesisId));
    const base = (Number(r.strength) || 5) * (conf / 100);
    const value = base * multiplier;
    const signedValue = r.type === 'SUPPORT' ? value : -value;
    return {
      relationshipId: r._id,
      hypothesisId: r.hypothesisId,
      hypothesisTitle: hyp ? hyp.title : 'Theory ' + r.hypothesisId,
      type: r.type,
      strength: r.strength,
      value: signedValue,
      formattedImpact: (signedValue >= 0 ? '+' : '') + signedValue.toFixed(2)
    };
  });
});
</script>
