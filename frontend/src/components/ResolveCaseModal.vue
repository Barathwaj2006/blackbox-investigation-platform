<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
    <div class="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-5">
      <!-- Modal Header -->
      <div class="flex justify-between items-start border-b border-slate-800 pb-3">
        <div class="space-y-0.5">
          <div class="flex items-center space-x-2">
            <span class="text-emerald-400 text-base">🛡️</span>
            <h3 class="text-lg font-bold text-white font-mono uppercase tracking-wide">
              Case Resolution & Dossier Sign-Off
            </h3>
          </div>
          <p class="text-xs text-slate-400">
            Formally archive the accepted primary investigative theory and conclusions.
          </p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-white p-1 font-bold">✕</button>
      </div>

      <form @submit.prevent="submitResolution" class="space-y-4 text-xs font-mono">
        <!-- Leading Theory Acceptance -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
            Accepted Primary Theory *
          </label>
          <select 
            v-model="form.acceptedHypothesisId" 
            required
            class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option v-for="h in sortedHypotheses" :key="h._id" :value="h._id">
              {{ h.title }} (Score: {{ (h.score || 0).toFixed(2) }})
            </option>
          </select>
        </div>

        <!-- Resolution Summary -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
            Investigative Findings Summary & Resolution Notes *
          </label>
          <textarea 
            v-model="form.resolutionNotes" 
            required 
            rows="4" 
            placeholder="Summarize key forensic findings, attribution, causal chain, and operational recommendations..." 
            class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs leading-relaxed focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          ></textarea>
        </div>

        <!-- Investigator Attestation -->
        <div class="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
          <div class="flex items-center space-x-2 text-emerald-400 font-bold">
            <span>✓</span>
            <span>Forensic Chain of Custody Verified</span>
          </div>
          <p class="text-slate-400 leading-normal">
            Resolving this case updates the dossier status to <strong class="text-emerald-300">RESOLVED</strong>, locks the analytical score history, and generates an immutable forensic audit event.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-3 border-t border-slate-800">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="px-4 py-2 text-slate-300 hover:text-white rounded-lg transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="submitting" 
            class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center space-x-1.5 shadow-lg shadow-emerald-900/40"
          >
            <span>{{ submitting ? 'Signing Off...' : 'Confirm Resolution & Sign Off' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  caseItem: { type: Object, required: true },
  hypotheses: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'resolve']);

const sortedHypotheses = computed(() => {
  return [...props.hypotheses].sort((a, b) => (b.score || 0) - (a.score || 0));
});

const submitting = ref(false);

const form = ref({
  acceptedHypothesisId: '',
  resolutionNotes: ''
});

onMounted(() => {
  if (sortedHypotheses.value.length > 0) {
    form.value.acceptedHypothesisId = sortedHypotheses.value[0]._id;
  }
});

const submitResolution = () => {
  submitting.value = true;
  emit('resolve', {
    acceptedHypothesisId: form.value.acceptedHypothesisId,
    resolutionNotes: form.value.resolutionNotes
  });
};
</script>
