<template>
  <div :class="['inline-flex items-center', containerClass]">
    <!-- Vector BlackBox Holographic Isometric Cube Logo Icon -->
    <div :class="['relative flex-shrink-0 flex items-center justify-center', iconBoxClass]">
      <svg :viewBox="'0 0 100 100'" class="w-full h-full drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Outer reticle glow -->
          <filter id="cyberGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#334155" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
          
          <linearGradient id="cubeLeft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="100%" stop-color="#090d16" />
          </linearGradient>
          
          <linearGradient id="cubeRight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>

          <linearGradient id="neonBlue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#2563eb" />
          </linearGradient>

          <linearGradient id="metallicSilver" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="45%" stop-color="#cbd5e1" />
            <stop offset="55%" stop-color="#64748b" />
            <stop offset="100%" stop-color="#94a3b8" />
          </linearGradient>
        </defs>

        <!-- Circular Radar & Crosshair Reticle -->
        <circle cx="50" cy="50" r="44" stroke="#1e293b" stroke-width="1" stroke-dasharray="2 3" opacity="0.6" />
        <circle cx="50" cy="50" r="41" stroke="#0ea5e9" stroke-width="1.2" stroke-dasharray="8 4 2 4" opacity="0.8" filter="url(#cyberGlow)" />
        <circle cx="50" cy="50" r="37" stroke="#3b82f6" stroke-width="0.8" opacity="0.4" />
        
        <!-- Target Tick Crosshairs -->
        <path d="M50 2 L50 9 M50 91 L50 98 M2 50 L9 50 M91 50 L98 50" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" />
        <!-- Corner brackets -->
        <path d="M22 26 L18 26 L18 30 M78 26 L82 26 L82 30 M18 70 L18 74 L22 74 M82 70 L82 74 L78 74" stroke="#0284c7" stroke-width="1.2" />

        <!-- 3D Open Obsidian Cube -->
        <!-- Back interior glowing cavity -->
        <polygon points="50,22 76,36 76,64 50,78 24,64 24,36" fill="#030712" stroke="#0284c7" stroke-width="1.2" />
        
        <!-- Holographic Cyber Globe & Wireframe Grid inside cube -->
        <ellipse cx="48" cy="49" rx="13" ry="13" fill="#0c4a6e" fill-opacity="0.3" stroke="#38bdf8" stroke-width="0.8" stroke-dasharray="1 1" />
        <ellipse cx="48" cy="49" rx="7" ry="13" stroke="#0284c7" stroke-width="0.7" stroke-dasharray="2 1" />
        <line x1="35" y1="49" x2="61" y2="49" stroke="#38bdf8" stroke-width="0.7" opacity="0.8" />
        <line x1="38" y1="43" x2="58" y2="43" stroke="#0284c7" stroke-width="0.6" opacity="0.7" />
        <line x1="38" y1="55" x2="58" y2="55" stroke="#0284c7" stroke-width="0.6" opacity="0.7" />

        <!-- Digital Fingerprint / Telemetry HUD Lines on Left Face -->
        <path d="M29 39 Q32 38 34 40 M28 43 Q33 41 35 44 M29 47 Q32 46 36 49 M30 52 Q33 51 35 54" stroke="#38bdf8" stroke-width="0.8" stroke-linecap="round" opacity="0.85" />

        <!-- Outer Beveled Cube Frame -->
        <!-- Top Face -->
        <polygon points="50,15 80,31 50,47 20,31" fill="url(#cubeTop)" stroke="#475569" stroke-width="1" />
        <!-- Top Inner Opening Rim -->
        <polygon points="50,22 73,34 50,45 27,34" fill="#090d16" stroke="#0ea5e9" stroke-width="0.8" />

        <!-- Left Outer Wall -->
        <polygon points="20,31 50,47 50,83 20,67" fill="url(#cubeLeft)" stroke="#334155" stroke-width="1" />
        <!-- Left Inner Cutout Edge -->
        <polyline points="20,31 27,34 27,62 20,67" fill="#1e293b" stroke="#38bdf8" stroke-width="0.6" />

        <!-- Right Outer Wall with Neon "B" Insignia -->
        <polygon points="50,47 80,31 80,67 50,83" fill="url(#cubeRight)" stroke="#38bdf8" stroke-width="1.2" />
        
        <!-- Glowing Metallic "B" on the right facet -->
        <path d="M58 46 L68 41 C72 39 74 41 74 44 C74 46 72 48 70 49 C73 50 75 52 75 56 C75 60 72 62 67 64 L58 68 Z M62 49 L66 47 C68 46 69 47 69 49 C69 51 68 52 66 53 L62 55 Z M62 57 L67 55 C69 54 70 55 70 57 C70 59 69 60 67 61 L62 63 Z" fill="url(#neonBlue)" stroke="#e0f2fe" stroke-width="0.5" filter="url(#cyberGlow)" />

        <!-- Cyan Neon Edge Accents -->
        <line x1="50" y1="47" x2="50" y2="83" stroke="#38bdf8" stroke-width="1.4" />
        <line x1="50" y1="15" x2="80" y2="31" stroke="#0ea5e9" stroke-width="0.8" />
        <line x1="80" y1="31" x2="80" y2="67" stroke="#0284c7" stroke-width="1" />
      </svg>
    </div>

    <!-- Brand Typography (shown in full or compact mode) -->
    <div v-if="mode !== 'icon-only'" :class="['flex flex-col select-none', textWrapperClass]">
      <div class="flex items-center tracking-tight font-black font-mono">
        <span class="text-white tracking-widest text-base sm:text-lg">BLACK</span>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 tracking-widest text-base sm:text-lg">BOX</span>
      </div>
      <div v-if="mode === 'full'" class="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-mono font-medium -mt-0.5">
        Intelligence & Investigation Platform
      </div>
      <div v-else-if="mode === 'sub'" class="text-[8.5px] uppercase tracking-wider text-slate-500 font-mono">
        Evidence OS
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'compact' // 'icon-only' | 'compact' | 'full' | 'sub'
  },
  size: {
    type: String,
    default: 'md' // 'sm' | 'md' | 'lg' | 'xl'
  }
});

const containerClass = computed(() => {
  if (props.mode === 'full') return 'flex-col sm:flex-row gap-3 text-center sm:text-left';
  return 'gap-2.5';
});

const iconBoxClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-7 h-7';
    case 'lg': return 'w-14 h-14';
    case 'xl': return 'w-24 h-24 sm:w-28 sm:h-28';
    case 'md':
    default: return 'w-9 h-9';
  }
});

const textWrapperClass = computed(() => {
  if (props.mode === 'full') return 'space-y-0.5';
  return '';
});
</script>
