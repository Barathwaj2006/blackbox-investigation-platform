<template>
  <div class="bg-gray-800/95 rounded-xl shadow border border-gray-700 p-4.5 flex flex-col justify-between hover:border-gray-600 transition space-y-3">
    <div class="space-y-3">
      <!-- Header row: ID, Title, Source, Type, Verification State -->
      <div class="flex justify-between items-start gap-2">
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-700 font-semibold">
              ID: {{ evidence._id }}
            </span>
            <span class="text-[11px] font-mono text-gray-400">
              Type: <strong class="text-gray-300">{{ evidence.type || 'Digital' }}</strong>
            </span>
          </div>
          <h3 class="text-base font-bold text-white leading-snug">{{ evidence.title }}</h3>
          <div class="text-xs text-gray-400">
            Source: <strong class="text-gray-300">{{ evidence.source || 'Direct Field Ingestion' }}</strong>
          </div>
        </div>

        <span :class="verificationBadgeClass(evidence.verificationState)" class="text-xs px-2.5 py-1 rounded font-mono font-bold uppercase tracking-wider whitespace-nowrap shadow-sm">
          {{ evidence.verificationState || 'UNVERIFIED' }}
        </span>
      </div>

      <!-- Description narrative -->
      <p v-if="evidence.description" class="text-xs text-gray-300 bg-gray-900/60 p-2.5 rounded-lg border border-gray-700/60 line-clamp-2">
        {{ evidence.description }}
      </p>

      <!-- Reliability & Relational Metrics -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-gray-900/70 p-2.5 rounded-lg border border-gray-700/50 font-mono">
        <div>
          <span class="text-[10px] text-gray-400 uppercase block">Confidence:</span>
          <span class="font-bold text-white">{{ evidence.confidenceScore !== undefined ? evidence.confidenceScore : 50 }}%</span>
        </div>
        <div>
          <span class="text-[10px] text-gray-400 uppercase block">Relationships:</span>
          <span class="font-bold text-indigo-300">{{ relationshipCount }} Links</span>
        </div>
        <div class="col-span-2 sm:col-span-1 flex items-center space-x-2">
          <span class="text-emerald-400 font-bold text-[11px]">+{{ supportCount }} Sup</span>
          <span class="text-gray-500">•</span>
          <span class="text-rose-400 font-bold text-[11px]">-{{ contradictCount }} Con</span>
        </div>
      </div>

      <!-- Analytical Impact on Linked Hypotheses -->
      <div class="space-y-1.5 pt-1">
        <div class="flex items-center justify-between text-[10px] uppercase font-bold text-gray-400">
          <span>Analytical Impact</span>
          <span class="font-mono text-gray-500">Score Contribution</span>
        </div>

        <div v-if="impactList.length === 0" class="text-[11px] text-gray-500 italic bg-gray-900/40 px-2.5 py-1.5 rounded border border-gray-800">
          Not linked to any competing hypotheses yet.
        </div>

        <div v-else class="space-y-1">
          <div 
            v-for="item in impactList" 
            :key="item.relationshipId"
            class="flex items-center justify-between text-xs px-2.5 py-1 rounded bg-gray-900/90 border border-gray-800 font-mono"
          >
            <span class="text-gray-300 truncate max-w-[200px]" :title="item.hypothesisTitle">
              {{ item.hypothesisTitle }}
            </span>
            <span 
              class="font-bold text-xs"
              :class="item.value > 0 ? 'text-emerald-400' : item.value < 0 ? 'text-rose-400' : 'text-gray-400'"
            >
              {{ item.formattedImpact }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Toolbar -->
    <div class="border-t border-gray-700/80 pt-3 space-y-2 mt-3">
      <div class="flex items-center justify-between">
        <button 
          @click="$emit('view-details', evidence)" 
          class="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
        >
          <span>🔍 View Details</span>
        </button>
        <button 
          v-if="hasHypotheses"
          @click="$emit('link-theory', evidence._id)" 
          class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
        >
          + Link to Theory
        </button>
      </div>

      <!-- Verification Buttons -->
      <div class="grid grid-cols-3 gap-1.5 pt-1">
        <button 
          @click="$emit('verify', { id: evidence._id, state: 'VERIFIED' })" 
          :disabled="isVerifying"
          :class="[
            evidence.verificationState === 'VERIFIED' ? 'bg-emerald-600 text-white font-bold' : 'bg-gray-700/80 text-gray-300 hover:bg-emerald-700 hover:text-white',
            'text-xs py-1.5 rounded transition disabled:opacity-50 text-center font-medium'
          ]"
        >
          ✓ Verify
        </button>
        <button 
          @click="$emit('verify', { id: evidence._id, state: 'DISPUTED' })" 
          :disabled="isVerifying"
          :class="[
            evidence.verificationState === 'DISPUTED' ? 'bg-amber-600 text-white font-bold' : 'bg-gray-700/80 text-gray-300 hover:bg-amber-700 hover:text-white',
            'text-xs py-1.5 rounded transition disabled:opacity-50 text-center font-medium'
          ]"
        >
          ⚠ Dispute
        </button>
        <button 
          @click="$emit('verify', { id: evidence._id, state: 'REJECTED' })" 
          :disabled="isVerifying"
          :class="[
            evidence.verificationState === 'REJECTED' ? 'bg-rose-600 text-white font-bold' : 'bg-gray-700/80 text-gray-300 hover:bg-rose-700 hover:text-white',
            'text-xs py-1.5 rounded transition disabled:opacity-50 text-center font-medium'
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
