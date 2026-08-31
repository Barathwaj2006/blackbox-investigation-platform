<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
      @click="$emit('close')"
    ></div>

    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <div class="w-screen max-w-2xl bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col justify-between">
        <!-- Header -->
        <div class="p-5 border-b border-gray-800 bg-gray-950/80 flex items-center justify-between">
          <div class="space-y-1">
            <div class="flex items-center space-x-2">
              <span class="text-purple-400 text-lg">⚡</span>
              <h2 class="text-base font-extrabold text-white tracking-tight">
                Investigation History & "What Changed?"
              </h2>
            </div>
            <p class="text-xs text-gray-400">
              {{ titleContext || 'Chronological causal log of score changes, verification shifts, and graph mutations.' }}
            </p>
          </div>
          <button 
            @click="$emit('close')" 
            class="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-lg text-xs font-bold transition"
          >
            ✕
          </button>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="p-3.5 bg-gray-900 border-b border-gray-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div class="flex items-center space-x-2">
            <label class="text-gray-400 font-bold uppercase text-[10px]">Filter:</label>
            <select 
              v-model="selectedFilter" 
              class="bg-gray-800 text-white border border-gray-700 rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="ALL">All Events ({{ scoreEvents.length }})</option>
              <option value="VERIFY_EVIDENCE">Verification Shifts</option>
              <option value="ADD_EVIDENCE_RELATIONSHIP">Relational Links</option>
              <option value="DELETE_EVIDENCE_RELATIONSHIP">Removed Links</option>
              <option value="POSITIVE">Positive Deltas (+)</option>
              <option value="NEGATIVE">Negative Deltas (-)</option>
            </select>
          </div>

          <div class="relative flex-1 min-w-[180px]">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search evidence or notes..." 
              class="w-full bg-gray-800 text-white placeholder-gray-500 text-xs px-3 py-1 rounded border border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <!-- Body: Causal Chain Stream -->
        <div class="flex-1 overflow-y-auto p-5 space-y-4">
          <!-- Empty State -->
          <div v-if="filteredEvents.length === 0" class="text-center py-16 bg-gray-950/50 rounded-xl border border-dashed border-gray-800 p-8 space-y-2">
            <span class="text-3xl block">📋</span>
            <p class="text-sm font-semibold text-gray-300">No score mutation events found</p>
            <p class="text-xs text-gray-500">Mutations occur when evidence is verified, disputed, or linked with hypotheses.</p>
          </div>

          <!-- Chronological Event Cards -->
          <div v-else class="space-y-3">
            <div 
              v-for="(event, idx) in filteredEvents" 
              :key="event._id || idx"
              class="bg-gray-950/90 border rounded-xl p-4 transition hover:border-gray-600 space-y-2.5 shadow-md"
              :class="event.delta > 0 ? 'border-emerald-900/60' : event.delta < 0 ? 'border-rose-900/60' : 'border-gray-800'"
            >
              <!-- Top Row: Trigger Type Badge, Delta, Score Change, Timestamp -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span 
                    class="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                    :class="triggerBadgeClass(event.triggerType)"
                  >
                    {{ event.triggerType }}
                  </span>
                  <span class="text-xs font-bold text-gray-200">
                    {{ event.hypothesisTitle || 'Hypothesis' }}
                  </span>
                </div>

                <!-- Score Movement Badge -->
                <div class="flex items-center space-x-2">
                  <span 
                    class="text-xs font-mono font-black px-2.5 py-0.5 rounded flex items-center space-x-1"
                    :class="event.delta > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : event.delta < 0 ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-gray-800 text-gray-300 border border-gray-700'"
                  >
                    <span>{{ event.delta > 0 ? '▲ +' : event.delta < 0 ? '▼ ' : '● ' }}{{ Number(event.delta || 0).toFixed(2) }}</span>
                  </span>
                </div>
              </div>

              <!-- Score Before / After Transition -->
              <div class="flex items-center justify-between text-xs font-mono bg-gray-900/80 p-2.5 rounded-lg border border-gray-800">
                <div class="flex items-center space-x-3">
                  <div>
                    <span class="text-gray-500 block text-[9px] uppercase">Before</span>
                    <span class="font-bold text-gray-300">{{ (event.previousScore || 0).toFixed(2) }}</span>
                  </div>
                  <span class="text-gray-600 font-bold">➔</span>
                  <div>
                    <span class="text-gray-500 block text-[9px] uppercase">After</span>
                    <span class="font-bold" :class="event.newScore > 0 ? 'text-emerald-400' : event.newScore < 0 ? 'text-rose-400' : 'text-gray-300'">
                      {{ (event.newScore || 0).toFixed(2) }}
                    </span>
                  </div>
                </div>

                <div class="text-right">
                  <span class="text-gray-500 block text-[9px] uppercase">Recorded At</span>
                  <span class="text-gray-400 text-[11px]">{{ formatDateTime(event.timestamp) }}</span>
                </div>
              </div>

              <!-- Trigger Details & Causal Impact Explanation -->
              <div class="text-xs text-gray-300 space-y-1">
                <div v-if="event.triggerDetails?.evidenceTitle" class="flex items-start space-x-1.5">
                  <span class="text-purple-400 font-bold">Trigger:</span>
                  <span class="text-white font-medium">{{ event.triggerDetails.evidenceTitle }}</span>
                  <span v-if="event.triggerDetails.verificationState" class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-800 text-gray-300">
                    {{ event.triggerDetails.verificationState }}
                  </span>
                </div>

                <p v-if="event.triggerDetails?.description" class="text-xs text-gray-400 leading-relaxed pl-1 border-l-2 border-purple-800/60">
                  {{ event.triggerDetails.description }}
                </p>
              </div>

              <!-- Footer: Actor metadata -->
              <div class="flex items-center justify-between pt-1 border-t border-gray-900 text-[10px] font-mono text-gray-500">
                <div class="flex items-center space-x-1">
                  <span>Authorized by:</span>
                  <strong class="text-gray-400">{{ event.actor?.name || event.actor?.username || 'Investigator' }}</strong>
                  <span>({{ event.actor?.role || 'Investigator' }})</span>
                </div>
                <span>Event ID: {{ event._id }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-800 bg-gray-950/90 flex justify-between items-center text-xs">
          <span class="text-gray-400 font-mono">
            Showing {{ filteredEvents.length }} of {{ scoreEvents.length }} score mutations
          </span>
          <button 
            @click="$emit('close')" 
            class="bg-gray-800 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded-lg transition"
          >
            Close History Drawer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  scoreEvents: { type: Array, default: () => [] },
  titleContext: { type: String, default: '' }
});

defineEmits(['close']);

const selectedFilter = ref('ALL');
const searchQuery = ref('');

const filteredEvents = computed(() => {
  let list = [...props.scoreEvents];

  if (selectedFilter.value === 'VERIFY_EVIDENCE') {
    list = list.filter(e => e.triggerType === 'VERIFY_EVIDENCE' || e.triggerType === 'DISPUTE_EVIDENCE' || e.triggerType === 'REJECT_EVIDENCE');
  } else if (selectedFilter.value === 'ADD_EVIDENCE_RELATIONSHIP') {
    list = list.filter(e => e.triggerType === 'ADD_EVIDENCE_RELATIONSHIP');
  } else if (selectedFilter.value === 'DELETE_EVIDENCE_RELATIONSHIP') {
    list = list.filter(e => e.triggerType === 'DELETE_EVIDENCE_RELATIONSHIP');
  } else if (selectedFilter.value === 'POSITIVE') {
    list = list.filter(e => (e.delta || 0) > 0);
  } else if (selectedFilter.value === 'NEGATIVE') {
    list = list.filter(e => (e.delta || 0) < 0);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(e => {
      const hyp = (e.hypothesisTitle || '').toLowerCase();
      const ev = (e.triggerDetails?.evidenceTitle || '').toLowerCase();
      const desc = (e.triggerDetails?.description || '').toLowerCase();
      const actor = (e.actor?.name || e.actor?.username || '').toLowerCase();
      return hyp.includes(q) || ev.includes(q) || desc.includes(q) || actor.includes(q);
    });
  }

  return list;
});

const triggerBadgeClass = (type) => {
  switch (type) {
    case 'VERIFY_EVIDENCE': return 'bg-emerald-950 text-emerald-300 border border-emerald-800';
    case 'DISPUTE_EVIDENCE': return 'bg-amber-950 text-amber-300 border border-amber-800';
    case 'REJECT_EVIDENCE': return 'bg-rose-950 text-rose-300 border border-rose-800';
    case 'ADD_EVIDENCE_RELATIONSHIP': return 'bg-indigo-950 text-indigo-300 border border-indigo-800';
    case 'DELETE_EVIDENCE_RELATIONSHIP': return 'bg-gray-800 text-gray-300 border border-gray-700';
    default: return 'bg-purple-950 text-purple-300 border border-purple-800';
  }
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString();
};
</script>
