<template>
  <div class="space-y-4">
    <!-- Graph Top Toolbar -->
    <div class="bg-[#0B0F19] border border-slate-800/90 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Hypothesis Spotlight Focus -->
        <div class="flex items-center space-x-1.5">
          <label class="text-[10px] uppercase font-mono font-bold text-slate-400">Focus Theory:</label>
          <select 
            v-model="focusedHypothesisId" 
            class="bg-[#0D1322] border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
          >
            <option value="">ALL THEORIES (Show All)</option>
            <option v-for="h in hypotheses" :key="h._id" :value="h._id">
              {{ h.title }} ({{ (h.score || 0).toFixed(1) }} pts)
            </option>
          </select>
        </div>

        <!-- Relationship Type Filter -->
        <div class="flex items-center space-x-1.5">
          <label class="text-[10px] uppercase font-mono font-bold text-slate-400">Links:</label>
          <select 
            v-model="linkTypeFilter" 
            class="bg-[#0D1322] border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          >
            <option value="ALL">All Relations ({{ relationships.length }})</option>
            <option value="SUPPORT">Support Only (+)</option>
            <option value="CONTRADICT">Contradict Only (-)</option>
          </select>
        </div>
      </div>

      <!-- Zoom & Layout Controls -->
      <div class="flex items-center space-x-2">
        <button 
          @click="zoomIn" 
          class="p-1.5 bg-[#0D1322] hover:bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-xs font-bold transition"
          title="Zoom In"
        >
          🔍 +
        </button>
        <button 
          @click="zoomOut" 
          class="p-1.5 bg-[#0D1322] hover:bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-xs font-bold transition"
          title="Zoom Out"
        >
          🔍 -
        </button>
        <button 
          @click="resetZoom" 
          class="px-2.5 py-1.5 bg-[#0D1322] hover:bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-xs font-semibold transition"
          title="Reset View"
        >
          Reset View
        </button>
      </div>
    </div>

    <!-- Empty State if no data -->
    <div v-if="evidence.length === 0 && hypotheses.length === 0" class="bg-[#0B0F19] border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs font-mono">
      No evidence or hypotheses recorded yet. Add items to render the relational intelligence map.
    </div>

    <!-- Interactive Visual Graph Area + Inspector -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Visual Canvas Card -->
      <div class="lg:col-span-2 bg-[#0B0F19] border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[500px]">
        <!-- Graph Legend Overlay -->
        <div class="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2.5 mb-2">
          <div class="flex items-center space-x-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm"></span>
            <span class="text-slate-300">Evidence ({{ evidence.length }})</span>
          </div>
          <div class="flex items-center space-x-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-sm"></span>
            <span class="text-slate-300">Hypotheses ({{ hypotheses.length }})</span>
          </div>
          <div class="flex items-center space-x-1.5">
            <span class="w-3 h-0.5 bg-emerald-400 inline-block"></span>
            <span class="text-emerald-400 font-bold">SUPPORT (+)</span>
          </div>
          <div class="flex items-center space-x-1.5">
            <span class="w-3 h-0.5 bg-rose-400 inline-block border-b border-dashed border-rose-400"></span>
            <span class="text-rose-400 font-bold">CONTRADICT (-)</span>
          </div>
        </div>

        <!-- SVG Node-Link Canvas Container -->
        <div 
          ref="graphContainer" 
          class="relative flex-1 w-full min-h-[420px] bg-[#070A12] rounded-lg border border-slate-800/80 overflow-hidden cursor-grab active:cursor-grabbing"
          @mousedown="startPan"
          @mousemove="onPan"
          @mouseup="endPan"
          @mouseleave="endPan"
          @wheel.prevent="onWheel"
        >
          <svg 
            class="w-full h-full"
            :style="{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`, transformOrigin: 'center center' }"
          >
            <defs>
              <!-- Arrowhead for SUPPORT -->
              <marker 
                id="arrow-support" 
                viewBox="0 0 10 10" 
                refX="16" 
                refY="5" 
                markerWidth="6" 
                markerHeight="6" 
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
              </marker>

              <!-- Arrowhead for CONTRADICT -->
              <marker 
                id="arrow-contradict" 
                viewBox="0 0 10 10" 
                refX="16" 
                refY="5" 
                markerWidth="6" 
                markerHeight="6" 
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f87171" />
              </marker>

              <!-- Drop shadow for nodes -->
              <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.6" />
              </filter>
            </defs>

            <!-- Relationship Edge Lines -->
            <g class="edges">
              <path
                v-for="edge in activeEdges"
                :key="edge.id"
                :d="edge.pathD"
                fill="none"
                :stroke="edge.type === 'SUPPORT' ? '#10b981' : '#f43f5e'"
                :stroke-width="Math.min(4, Math.max(1.5, edge.strength / 2.5))"
                :stroke-dasharray="edge.type === 'CONTRADICT' ? '4,4' : 'none'"
                :marker-end="edge.type === 'SUPPORT' ? 'url(#arrow-support)' : 'url(#arrow-contradict)'"
                :opacity="edge.isHighlighted ? 1.0 : (hasActiveFocus ? 0.15 : 0.75)"
                class="transition-opacity duration-300"
              />
            </g>

            <!-- Evidence Nodes (Left Column Layout) -->
            <g class="evidence-nodes">
              <g 
                v-for="node in evidenceNodes" 
                :key="node.id"
                :transform="`translate(${node.x}, ${node.y})`"
                class="cursor-pointer group"
                @click.stop="selectNode('evidence', node.data)"
                :opacity="node.isHighlighted ? 1.0 : (hasActiveFocus ? 0.2 : 1.0)"
              >
                <!-- Node Box Background -->
                <rect 
                  x="-90" 
                  y="-22" 
                  width="180" 
                  height="44" 
                  rx="8" 
                  :fill="selectedNodeId === node.id ? '#1e3a8a' : '#0f172a'"
                  :stroke="selectedNodeId === node.id ? '#60a5fa' : '#334155'"
                  stroke-width="1.5"
                  filter="url(#nodeShadow)"
                  class="transition-all group-hover:stroke-blue-400"
                />

                <!-- Verification State Pill -->
                <circle 
                  cx="-76" 
                  cy="0" 
                  r="5" 
                  :fill="node.data.verificationState === 'VERIFIED' ? '#34d399' : node.data.verificationState === 'DISPUTED' ? '#fbbf24' : '#94a3b8'" 
                />

                <!-- Title Label -->
                <text 
                  x="-64" 
                  y="-4" 
                  fill="#f8fafc" 
                  font-size="11" 
                  font-weight="bold" 
                  font-family="monospace"
                >
                  {{ truncate(node.data.title, 16) }}
                </text>

                <!-- Subtitle Metadata -->
                <text 
                  x="-64" 
                  y="12" 
                  fill="#94a3b8" 
                  font-size="9" 
                  font-family="monospace"
                >
                  {{ node.data.type || 'Digital' }} • {{ node.data.confidenceScore }}% conf
                </text>
              </g>
            </g>

            <!-- Hypothesis Nodes (Right Column Layout) -->
            <g class="hypothesis-nodes">
              <g 
                v-for="node in hypothesisNodes" 
                :key="node.id"
                :transform="`translate(${node.x}, ${node.y})`"
                class="cursor-pointer group"
                @click.stop="selectNode('hypothesis', node.data)"
                :opacity="node.isHighlighted ? 1.0 : (hasActiveFocus ? 0.2 : 1.0)"
              >
                <!-- Node Box Background -->
                <rect 
                  x="-95" 
                  y="-25" 
                  width="190" 
                  height="50" 
                  rx="8" 
                  :fill="selectedNodeId === node.id ? '#4c1d95' : '#1e1b4b'"
                  :stroke="selectedNodeId === node.id ? '#c084fc' : (node.rank === 1 ? '#a855f7' : '#475569')"
                  stroke-width="1.8"
                  filter="url(#nodeShadow)"
                  class="transition-all group-hover:stroke-purple-400"
                />

                <!-- Rank Star/Badge -->
                <rect 
                  x="-85" 
                  y="-18" 
                  width="20" 
                  height="16" 
                  rx="3" 
                  :fill="node.rank === 1 ? '#7e22ce' : '#334155'" 
                />
                <text 
                  x="-75" 
                  y="-6" 
                  text-anchor="middle" 
                  fill="#ffffff" 
                  font-size="9" 
                  font-weight="bold" 
                  font-family="monospace"
                >
                  #{{ node.rank }}
                </text>

                <!-- Title Label -->
                <text 
                  x="-58" 
                  y="-6" 
                  fill="#f8fafc" 
                  font-size="11" 
                  font-weight="bold" 
                  font-family="monospace"
                >
                  {{ truncate(node.data.title, 15) }}
                </text>

                <!-- Score Value -->
                <text 
                  x="-58" 
                  y="12" 
                  :fill="node.data.score > 0 ? '#34d399' : '#f87171'" 
                  font-size="10" 
                  font-weight="bold" 
                  font-family="monospace"
                >
                  Score: {{ (node.data.score || 0).toFixed(2) }} pts
                </text>
              </g>
            </g>
          </svg>
        </div>

        <!-- Canvas Footer Instructions -->
        <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80 mt-2">
          <span>Click on any node to inspect parameters & impact</span>
          <span>Pan: Drag canvas • Zoom: Scroll / controls</span>
        </div>
      </div>

      <!-- Node / Link Entity Inspector Card -->
      <div class="bg-[#0B0F19] border border-slate-800/90 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
        <div>
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div class="flex items-center space-x-2">
              <span class="text-blue-400 font-bold text-sm">🔍</span>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">Entity Inspector</h3>
            </div>
            <span v-if="selectedEntity" :class="selectedEntity.type === 'evidence' ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-purple-950 text-purple-400 border border-purple-800'" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
              {{ selectedEntity.type }}
            </span>
          </div>

          <!-- Empty Inspector State -->
          <div v-if="!selectedEntity" class="py-16 text-center text-xs text-slate-500 space-y-2 font-mono">
            <div class="text-2xl">⚡</div>
            <p>Select any evidence node or hypothesis card to inspect its relationships and score mechanics.</p>
          </div>

          <!-- Active Selection Content -->
          <div v-else class="space-y-4 text-xs font-mono">
            <div>
              <span class="text-slate-500 uppercase text-[10px] font-bold block">Title / Description</span>
              <h4 class="text-sm font-bold text-white mt-0.5 font-sans leading-tight">
                {{ selectedEntity.data.title }}
              </h4>
              <p v-if="selectedEntity.data.description" class="text-xs text-slate-400 font-sans mt-1.5 leading-relaxed bg-[#0D1322] p-2.5 rounded border border-slate-800">
                {{ selectedEntity.data.description }}
              </p>
            </div>

            <!-- Evidence Inspector Details -->
            <div v-if="selectedEntity.type === 'evidence'" class="space-y-3">
              <div class="grid grid-cols-2 gap-2 bg-[#0D1322] p-3 rounded-lg border border-slate-800">
                <div>
                  <span class="text-slate-500 text-[10px] block">Verification:</span>
                  <span :class="verificationColor(selectedEntity.data.verificationState)" class="font-bold">
                    {{ selectedEntity.data.verificationState || 'UNVERIFIED' }}
                  </span>
                </div>
                <div>
                  <span class="text-slate-500 text-[10px] block">Confidence:</span>
                  <span class="text-slate-200 font-bold">{{ selectedEntity.data.confidenceScore }}%</span>
                </div>
                <div>
                  <span class="text-slate-500 text-[10px] block">Type:</span>
                  <span class="text-slate-200">{{ selectedEntity.data.type || 'Digital' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 text-[10px] block">Source:</span>
                  <span class="text-slate-200 truncate block">{{ selectedEntity.data.source || 'Capture' }}</span>
                </div>
              </div>

              <!-- Linked Hypotheses from this evidence -->
              <div class="space-y-1.5">
                <span class="text-[10px] text-slate-400 font-bold uppercase">Linked Hypotheses ({{ linkedHypothesesForEvidence.length }}):</span>
                <div v-if="linkedHypothesesForEvidence.length === 0" class="text-slate-500 text-[11px] italic">
                  Not linked to any theories yet.
                </div>
                <div v-else class="space-y-1">
                  <div 
                    v-for="lh in linkedHypothesesForEvidence" 
                    :key="lh._id" 
                    class="p-2 rounded border text-[11px] flex justify-between items-center"
                    :class="lh.type === 'SUPPORT' ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-rose-950/40 border-rose-800/60 text-rose-300'"
                  >
                    <span>{{ lh.title }}</span>
                    <span class="font-bold font-mono">{{ lh.type }} ({{ lh.strength }}/10)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hypothesis Inspector Details -->
            <div v-if="selectedEntity.type === 'hypothesis'" class="space-y-3">
              <div class="bg-[#0D1322] p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <span class="text-slate-500 text-[10px] block">Calculated Score:</span>
                  <span class="text-lg font-black" :class="selectedEntity.data.score > 0 ? 'text-emerald-400' : 'text-rose-400'">
                    {{ (selectedEntity.data.score || 0).toFixed(2) }} pts
                  </span>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                  Rank #{{ getHypothesisRank(selectedEntity.data._id) }}
                </span>
              </div>

              <!-- Factor Formulas -->
              <div class="space-y-1.5">
                <span class="text-[10px] text-slate-400 font-bold uppercase">Factor Contributions:</span>
                <div v-if="!selectedEntity.data.explainability || selectedEntity.data.explainability.length === 0" class="text-slate-500 text-[11px] italic">
                  No evidence relationships contributing to this score yet.
                </div>
                <div v-else class="space-y-1 max-h-40 overflow-y-auto pr-1">
                  <div 
                    v-for="(exp, idx) in selectedEntity.data.explainability" 
                    :key="idx" 
                    class="p-2 rounded text-[10px]"
                    :class="exp.startsWith('+') ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40' : 'bg-rose-950/40 text-rose-300 border border-rose-800/40'"
                  >
                    {{ exp }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div v-if="selectedEntity" class="pt-3 border-t border-slate-800 mt-4 flex space-x-2">
          <button 
            v-if="selectedEntity.type === 'evidence'"
            @click="$emit('open-evidence-drawer', selectedEntity.data)"
            class="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 rounded-lg transition"
          >
            Open Full Dossier
          </button>
          <button 
            @click="selectedEntity = null" 
            class="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  evidence: { type: Array, default: () => [] },
  hypotheses: { type: Array, default: () => [] },
  relationships: { type: Array, default: () => [] }
});

defineEmits(['open-evidence-drawer', 'link-evidence']);

const focusedHypothesisId = ref('');
const linkTypeFilter = ref('ALL');
const selectedEntity = ref(null);
const zoomLevel = ref(1);
const panOffset = ref({ x: 0, y: 0 });
const isPanning = ref(false);
const panStart = ref({ x: 0, y: 0 });

const selectedNodeId = computed(() => selectedEntity.value?.data?._id || null);
const hasActiveFocus = computed(() => !!focusedHypothesisId.value);

// Ranked Hypotheses
const rankedHypotheses = computed(() => {
  return [...props.hypotheses].sort((a, b) => (b.score || 0) - (a.score || 0));
});

const getHypothesisRank = (hypId) => {
  const idx = rankedHypotheses.value.findIndex(h => String(h._id) === String(hypId));
  return idx >= 0 ? idx + 1 : 1;
};

// Node positioning coordinates
const evidenceNodes = computed(() => {
  const list = props.evidence;
  const count = list.length;
  const startY = 40;
  const spacingY = 60;

  return list.map((ev, index) => {
    // Check if connected to focused hypothesis
    let isHighlighted = true;
    if (focusedHypothesisId.value) {
      isHighlighted = props.relationships.some(
        r => String(r.evidenceId) === String(ev._id) && String(r.hypothesisId) === String(focusedHypothesisId.value)
      );
    }

    return {
      id: ev._id,
      x: 120,
      y: startY + index * spacingY + 30,
      data: ev,
      isHighlighted
    };
  });
});

const hypothesisNodes = computed(() => {
  const list = rankedHypotheses.value;
  const count = list.length;
  const startY = 40;
  const spacingY = 70;

  return list.map((hyp, index) => {
    const isHighlighted = !focusedHypothesisId.value || String(hyp._id) === String(focusedHypothesisId.value);

    return {
      id: hyp._id,
      x: 480,
      y: startY + index * spacingY + 35,
      data: hyp,
      rank: index + 1,
      isHighlighted
    };
  });
});

// Active Edges
const activeEdges = computed(() => {
  const filteredRels = props.relationships.filter(r => {
    if (linkTypeFilter.value !== 'ALL' && r.type !== linkTypeFilter.value) return false;
    return true;
  });

  return filteredRels.map(rel => {
    const evNode = evidenceNodes.value.find(n => String(n.id) === String(rel.evidenceId));
    const hypNode = hypothesisNodes.value.find(n => String(n.id) === String(rel.hypothesisId));

    if (!evNode || !hypNode) return null;

    const startX = evNode.x + 90;
    const startY = evNode.y;
    const endX = hypNode.x - 95;
    const endY = hypNode.y;

    // Smooth Bezier Curve between columns
    const midX = (startX + endX) / 2;
    const pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

    const isHighlighted = (!focusedHypothesisId.value || String(rel.hypothesisId) === String(focusedHypothesisId.value)) &&
      (!selectedNodeId.value || String(rel.evidenceId) === String(selectedNodeId.value) || String(rel.hypothesisId) === String(selectedNodeId.value));

    return {
      id: rel._id,
      type: rel.type,
      strength: rel.strength || 5,
      pathD,
      isHighlighted
    };
  }).filter(Boolean);
});

// Linked Hypotheses for Selected Evidence
const linkedHypothesesForEvidence = computed(() => {
  if (!selectedEntity.value || selectedEntity.value.type !== 'evidence') return [];
  const evId = selectedEntity.value.data._id;
  const rels = props.relationships.filter(r => String(r.evidenceId) === String(evId));
  return rels.map(r => {
    const h = props.hypotheses.find(hyp => String(hyp._id) === String(r.hypothesisId));
    return {
      _id: r._id,
      title: h ? h.title : 'Hypothesis',
      type: r.type,
      strength: r.strength
    };
  });
});

const selectNode = (type, data) => {
  selectedEntity.value = { type, data };
};

const truncate = (text, maxLen) => {
  if (!text) return '';
  return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
};

const verificationColor = (state) => {
  if (state === 'VERIFIED') return 'text-emerald-400';
  if (state === 'DISPUTED') return 'text-amber-400';
  if (state === 'REJECTED') return 'text-rose-400';
  return 'text-slate-400';
};

// Zoom & Pan controls
const zoomIn = () => {
  zoomLevel.value = Math.min(2.0, zoomLevel.value + 0.15);
};

const zoomOut = () => {
  zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.15);
};

const resetZoom = () => {
  zoomLevel.value = 1;
  panOffset.value = { x: 0, y: 0 };
  focusedHypothesisId.value = '';
};

const startPan = (e) => {
  isPanning.value = true;
  panStart.value = { x: e.clientX - panOffset.value.x, y: e.clientY - panOffset.value.y };
};

const onPan = (e) => {
  if (!isPanning.value) return;
  panOffset.value = {
    x: e.clientX - panStart.value.x,
    y: e.clientY - panStart.value.y
  };
};

const endPan = () => {
  isPanning.value = false;
};

const onWheel = (e) => {
  if (e.deltaY < 0) zoomIn();
  else zoomOut();
};
</script>
