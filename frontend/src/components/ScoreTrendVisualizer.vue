<template>
  <div class="bg-gray-950/80 rounded-lg p-3 border border-gray-800 space-y-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="text-xs font-bold uppercase text-gray-400 font-mono">Score Evolution Trail</span>
        <span class="text-[10px] text-gray-500 font-mono">({{ historyPoints.length }} milestones)</span>
      </div>
      <div v-if="historyPoints.length >= 2" class="flex items-center space-x-1.5 text-xs font-mono font-bold">
        <span :class="netDelta > 0 ? 'text-emerald-400' : netDelta < 0 ? 'text-rose-400' : 'text-gray-400'">
          Net: {{ netDelta > 0 ? '+' : '' }}{{ netDelta.toFixed(2) }}
        </span>
        <span class="text-gray-500 text-[10px]">
          ({{ firstScore.toFixed(1) }} ➔ {{ currentScore.toFixed(1) }})
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="historyPoints.length === 0" class="py-4 text-center text-xs text-gray-500 italic">
      No score mutations recorded yet. Initial baseline is 0.00.
    </div>

    <!-- SVG Trend Line and Event Markers -->
    <div v-else class="space-y-2">
      <div class="relative w-full h-24 sm:h-28 bg-gray-900/60 rounded border border-gray-800/80 px-2 py-1 overflow-hidden">
        <!-- Zero / baseline guide line -->
        <div 
          class="absolute left-0 right-0 border-b border-dashed border-gray-700/50 pointer-events-none"
          :style="{ top: zeroLineYPercent + '%' }"
        ></div>

        <!-- Trend SVG -->
        <svg class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#a855f7" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#a855f7" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Area fill -->
          <polygon
            v-if="pathCoords.length > 1"
            :points="polygonPoints"
            fill="url(#scoreGradient)"
          />

          <!-- Connecting line -->
          <polyline
            v-if="pathCoords.length > 1"
            :points="polylinePoints"
            fill="none"
            stroke="#c084fc"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Event Milestone Points -->
          <g v-for="(pt, idx) in pathCoords" :key="idx">
            <circle
              :cx="pt.x"
              :cy="pt.y"
              :r="activePointIndex === idx ? 6 : 4"
              :class="pt.delta > 0 ? 'fill-emerald-400 stroke-emerald-950' : pt.delta < 0 ? 'fill-rose-400 stroke-rose-950' : 'fill-purple-400 stroke-gray-950'"
              stroke-width="2"
              class="cursor-pointer transition-all hover:scale-125"
              @mouseenter="activePointIndex = idx"
              @mouseleave="activePointIndex = null"
              @click="$emit('select-history', pt.raw)"
            />
          </g>
        </svg>

        <!-- Hover / Active Tooltip -->
        <div 
          v-if="activePoint !== null" 
          class="absolute z-20 bg-gray-900 text-white text-[10px] font-mono p-2 rounded-lg border border-purple-500 shadow-xl pointer-events-none transition-all"
          :style="{
            left: Math.min(75, Math.max(10, activePoint.x)) + '%',
            top: activePoint.y > 50 ? '4px' : 'auto',
            bottom: activePoint.y <= 50 ? '4px' : 'auto'
          }"
        >
          <div class="font-bold flex items-center space-x-1">
            <span :class="activePoint.delta > 0 ? 'text-emerald-400' : activePoint.delta < 0 ? 'text-rose-400' : 'text-gray-300'">
              {{ activePoint.delta > 0 ? '▲ +' : activePoint.delta < 0 ? '▼ ' : '● ' }}{{ activePoint.delta.toFixed(2) }}
            </span>
            <span class="text-gray-400">➔ Score: {{ activePoint.score.toFixed(2) }}</span>
          </div>
          <div class="text-[9px] text-gray-400 truncate max-w-[200px] mt-0.5">
            {{ activePoint.raw.triggerType }}
          </div>
          <div class="text-[8px] text-gray-500">
            {{ formatTime(activePoint.raw.timestamp) }}
          </div>
        </div>
      </div>

      <!-- Quick Milestone Summary Chips -->
      <div class="flex items-center space-x-2 overflow-x-auto pb-1 text-[10px] font-mono">
        <button
          v-for="(item, idx) in recentItems"
          :key="item._id || idx"
          @click="$emit('select-history', item)"
          class="px-2 py-1 rounded border flex items-center space-x-1 whitespace-nowrap transition hover:opacity-100 opacity-80"
          :class="item.delta > 0 ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : item.delta < 0 ? 'bg-rose-950/60 border-rose-800 text-rose-300' : 'bg-gray-900 border-gray-700 text-gray-300'"
        >
          <span class="font-bold">{{ item.delta > 0 ? '+' : '' }}{{ (item.delta || 0).toFixed(2) }}</span>
          <span class="text-gray-400 text-[9px]">({{ item.triggerType?.replace('_EVIDENCE', '')?.replace('_RELATIONSHIP', '') }})</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  history: { type: Array, default: () => [] },
  currentScore: { type: Number, default: 0 }
});

defineEmits(['select-history']);

const activePointIndex = ref(null);

const historyPoints = computed(() => {
  // Sort ascending by timestamp
  const sorted = [...props.history].sort((a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt));
  return sorted;
});

const firstScore = computed(() => {
  if (historyPoints.value.length === 0) return 0;
  return historyPoints.value[0].previousScore || 0;
});

const netDelta = computed(() => {
  if (historyPoints.value.length === 0) return 0;
  return props.currentScore - firstScore.value;
});

const minMaxScore = computed(() => {
  const scores = [0, props.currentScore];
  historyPoints.value.forEach(h => {
    scores.push(h.previousScore || 0);
    scores.push(h.newScore || 0);
  });
  let min = Math.min(...scores);
  let max = Math.max(...scores);
  if (min === max) {
    min = min - 2;
    max = max + 2;
  } else {
    const pad = (max - min) * 0.15;
    min -= pad;
    max += pad;
  }
  return { min, max };
});

const zeroLineYPercent = computed(() => {
  const { min, max } = minMaxScore.value;
  const range = max - min || 1;
  const percent = ((max - 0) / range) * 100;
  return Math.min(95, Math.max(5, percent));
});

const pathCoords = computed(() => {
  if (historyPoints.value.length === 0) return [];
  const { min, max } = minMaxScore.value;
  const range = max - min || 1;
  const count = historyPoints.value.length;

  return historyPoints.value.map((item, idx) => {
    const x = count === 1 ? 50 : (idx / (count - 1)) * 90 + 5; // 5% to 95%
    const y = ((max - item.newScore) / range) * 80 + 10; // 10% to 90%
    return {
      x,
      y,
      score: item.newScore,
      delta: item.delta,
      raw: item
    };
  });
});

const polylinePoints = computed(() => {
  return pathCoords.value.map(pt => `${pt.x},${pt.y}`).join(' ');
});

const polygonPoints = computed(() => {
  if (pathCoords.value.length === 0) return '';
  const first = pathCoords.value[0];
  const last = pathCoords.value[pathCoords.value.length - 1];
  const points = pathCoords.value.map(pt => `${pt.x},${pt.y}`).join(' ');
  return `${first.x},100 ${points} ${last.x},100`;
});

const activePoint = computed(() => {
  if (activePointIndex.value === null || !pathCoords.value[activePointIndex.value]) return null;
  return pathCoords.value[activePointIndex.value];
});

const recentItems = computed(() => {
  return [...historyPoints.value].reverse().slice(0, 5);
});

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>
