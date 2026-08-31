<template>
  <div v-if="loading" class="text-gray-500 font-mono text-sm animate-pulse flex items-center justify-center h-64 border border-charcoal-700 rounded bg-charcoal-800/30 mx-4 lg:mx-auto max-w-6xl mt-8">
    INITIALIZING FORENSIC WORKSPACE...
  </div>
  
  <div v-else-if="caseItem" class="max-w-6xl mx-auto pb-12 flex flex-col min-h-screen px-4 lg:px-0">
    
    <!-- TOAST NOTIFICATIONS -->
    <div v-if="toastMessage" class="fixed top-6 right-6 z-50 bg-charcoal-800 border-l-4 border-electric text-white px-6 py-4 shadow-2xl rounded text-sm font-medium flex items-center transition-all">
       <span class="mr-3 text-electric font-bold text-lg">✓</span> {{ toastMessage }}
    </div>

    <!-- HEADER / NAVIGATION -->
    <div class="mb-6 border-b border-charcoal-700 pb-6 pt-4">
      <router-link to="/cases" class="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white mb-4 inline-flex items-center transition-colors">
         <span class="mr-2 text-lg leading-none">&larr;</span> BACK TO REGISTRY
      </router-link>
      <div class="flex flex-col md:flex-row justify-between items-start">
        <div class="mb-4 md:mb-0">
          <div class="text-xs font-mono text-electric mb-2 uppercase tracking-widest">Case // BK-{{ caseItem._id.substring(caseItem._id.length-4).toUpperCase() }}</div>
          <h1 class="text-3xl font-light text-white tracking-wide uppercase">{{ caseItem.title }}</h1>
        </div>
        <div class="flex flex-col items-start md:items-end w-full md:w-auto">
          <div v-if="caseItem.status === 'RESOLVED'" class="px-6 py-2 bg-charcoal-700 border border-charcoal-500 text-white font-bold uppercase tracking-widest text-xs rounded w-full md:w-auto text-center">
            CASE RESOLVED
          </div>
          <select v-else v-model="caseItem.status" @change="updateStatus" class="bg-charcoal-800 text-[10px] font-bold uppercase tracking-widest text-white border border-charcoal-600 rounded px-4 py-2 focus:outline-none focus:border-electric transition-colors w-full md:w-auto" :class="statusColorClass(caseItem.status)">
            <option value="DRAFT">STAGE: DRAFT</option>
            <option value="OPEN">STAGE: OPEN</option>
            <option value="INVESTIGATING">STAGE: INVESTIGATING</option>
            <option value="REVIEW">STAGE: REVIEW</option>
            <option value="RESOLVED">STAGE: RESOLVED</option>
            <option value="ARCHIVED">STAGE: ARCHIVED</option>
          </select>
          <div class="text-[10px] text-gray-500 mt-3 font-mono uppercase tracking-widest">LEAD INVESTIGATOR: {{ caseItem.createdBy?.name || 'Unknown' }}</div>
        </div>
      </div>
    </div>

    <!-- RESOLUTION PANEL -->
    <div v-if="caseItem.status === 'RESOLVED'" class="mb-8 bg-charcoal-800 border border-charcoal-600 rounded p-6 lg:p-8 shadow-2xl relative overflow-hidden">
       <div class="absolute top-0 left-0 w-1 h-full bg-charcoal-500"></div>
       <div class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-charcoal-700 pb-3">Final Investigative Assessment</div>
       <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div>
           <div class="text-[10px] text-gray-500 uppercase font-mono tracking-widest mb-2">LEADING INTERPRETATION</div>
           <div class="text-xl text-white font-medium">{{ leadingHypothesis?.title || 'Unknown' }}</div>
         </div>
         <div>
           <div class="text-[10px] text-gray-500 uppercase font-mono tracking-widest mb-2">RESOLUTION TIMESTAMP</div>
           <div class="text-sm text-gray-300 font-mono">{{ formatTime(caseItem.updatedAt) }}</div>
         </div>
       </div>
    </div>

    <!-- REVIEW PANEL -->
    <div v-if="caseItem.status === 'REVIEW'" class="mb-8 bg-charcoal-800 border border-electric/30 rounded p-6 lg:p-8 shadow-2xl relative overflow-hidden">
       <div class="absolute top-0 left-0 w-1 h-full bg-electric"></div>
       <div class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-charcoal-700 pb-3">Is this investigation ready to conclude?</div>
       <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div class="bg-charcoal-900 border border-charcoal-700 rounded p-4 text-center">
           <div class="text-2xl font-light font-mono text-white mb-1">{{ evidence.length }}</div>
           <div class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Evidence Logged</div>
         </div>
         <div class="bg-charcoal-900 border border-charcoal-700 rounded p-4 text-center">
           <div class="text-2xl font-light font-mono mb-1" :class="pendingEvidenceCount > 0 ? 'text-pending' : 'text-verified'">{{ pendingEvidenceCount }}</div>
           <div class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Pending Review</div>
         </div>
         <div class="bg-charcoal-900 border border-charcoal-700 rounded p-4 text-center">
           <div class="text-lg font-medium text-electric truncate mb-1 px-2">{{ leadingHypothesis?.title || 'None' }}</div>
           <div class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Leading Theory</div>
         </div>
       </div>
       
       <div v-if="pendingEvidenceCount > 0" class="mb-6 flex items-center justify-between bg-pending/10 border border-pending/30 rounded p-4">
          <div class="text-sm text-pending font-medium">{{ pendingEvidenceCount }} artifacts still require attention.</div>
          <button @click="tab = 'evidence'" class="text-xs text-pending border border-pending px-4 py-2 rounded font-bold uppercase tracking-wider hover:bg-pending hover:text-charcoal-900 transition-colors">Review Evidence</button>
       </div>
       
       <div class="flex justify-end border-t border-charcoal-700 pt-6">
         <button @click="showResolveConfirm = true" class="bg-electric hover:bg-blue-500 text-white px-8 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors w-full md:w-auto">
           Resolve Investigation
         </button>
       </div>
    </div>

    <!-- TAB NAVIGATION -->
    <div class="flex overflow-x-auto space-x-2 md:space-x-8 border-b border-charcoal-800 mb-8 scrollbar-hide">
      <button @click="tab = 'overview'" :class="[tab === 'overview' ? 'text-white border-electric' : 'text-gray-500 border-transparent hover:text-gray-300', 'pb-3 border-b-2 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap']">Overview</button>
      <button @click="tab = 'evidence'" :class="[tab === 'evidence' ? 'text-white border-electric' : 'text-gray-500 border-transparent hover:text-gray-300', 'pb-3 border-b-2 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap']">Evidence</button>
      <button @click="tab = 'hypotheses'" :class="[tab === 'hypotheses' ? 'text-white border-electric' : 'text-gray-500 border-transparent hover:text-gray-300', 'pb-3 border-b-2 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap']">Hypotheses</button>
      <button @click="tab = 'map'; renderMap();" :class="[tab === 'map' ? 'text-white border-electric' : 'text-gray-500 border-transparent hover:text-gray-300', 'pb-3 border-b-2 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap']">Evidence Map</button>
      <button @click="tab = 'timeline'" :class="[tab === 'timeline' ? 'text-white border-electric' : 'text-gray-500 border-transparent hover:text-gray-300', 'pb-3 border-b-2 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap']">Timeline</button>
    </div>

    <!-- OVERVIEW WORKSPACE -->
    <div v-show="tab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      <div class="lg:col-span-2">
        <h2 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-charcoal-700 pb-3 mb-6">INVESTIGATION BRIEF</h2>
        <div class="bg-charcoal-800 border border-charcoal-700 rounded p-6 lg:p-8">
          <h3 class="text-sm font-medium text-white mb-4">What we currently know</h3>
          <p class="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{{ caseItem.description || 'No initial briefing provided.' }}</p>
        </div>
      </div>
      <div class="space-y-8">
        <div>
          <h2 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-charcoal-700 pb-3 mb-6">CURRENT ASSESSMENT</h2>
          <div class="bg-charcoal-800 border border-charcoal-700 rounded p-6 text-center shadow-lg hover:border-charcoal-600 transition-colors">
            <div class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">LEADING THEORY</div>
            <div v-if="leadingHypothesis">
              <div class="text-base lg:text-lg font-medium text-white px-2">{{ leadingHypothesis.title }}</div>
              <div class="text-4xl font-light font-mono text-electric mt-4 mb-2">{{ leadingHypothesis.score.toFixed(2) }}</div>
            </div>
            <div v-else class="text-xs text-gray-500 mt-4 font-mono py-4 border border-dashed border-charcoal-700 rounded mx-4">NO_THEORIES</div>
          </div>
        </div>
        <div v-if="pendingEvidenceCount > 0">
          <h2 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-charcoal-700 pb-3 mb-6">NEXT ACTION</h2>
          <div class="bg-charcoal-800 border border-electric/30 rounded p-6 text-center">
            <p class="text-sm text-gray-300 mb-6">{{ pendingEvidenceCount }} evidence artifacts require verification.</p>
            <button @click="tab = 'evidence'" class="bg-white text-charcoal-900 px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors w-full">Review Evidence</button>
          </div>
        </div>
      </div>
    </div>

    <!-- EVIDENCE WORKSPACE -->
    <div v-show="tab === 'evidence'">
      
      <!-- Evidence Form -->
      <div v-if="showEvidenceForm" class="bg-charcoal-800 border border-charcoal-600 rounded p-6 lg:p-8 mb-8 shadow-2xl">
         <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-light text-white uppercase tracking-wide">Add Artifact</h3>
            <button @click="showEvidenceForm = false" class="text-gray-500 hover:text-white text-xl">&times;</button>
         </div>
         <form @submit.prevent="createEvidence">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
               <div>
                 <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Artifact Title <span class="text-electric">*</span></label>
                 <input v-model="newEvidence.title" required type="text" class="w-full bg-charcoal-900 border border-charcoal-600 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-electric transition-colors">
               </div>
               <div>
                 <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Source Type <span class="text-electric">*</span></label>
                 <select v-model="newEvidence.type" required class="w-full bg-charcoal-900 border border-charcoal-600 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-electric transition-colors">
                    <option value="Document">Document</option>
                    <option value="Testimony">Testimony</option>
                    <option value="Digital">Digital Forensic</option>
                    <option value="Physical">Physical</option>
                 </select>
               </div>
            </div>
            <div class="mb-8">
               <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description / Payload <span class="text-electric">*</span></label>
               <textarea v-model="newEvidence.description" required rows="3" class="w-full bg-charcoal-900 border border-charcoal-600 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-electric transition-colors font-mono"></textarea>
            </div>
            <div class="flex justify-end space-x-4 border-t border-charcoal-700 pt-4">
               <button type="button" @click="showEvidenceForm = false" class="px-6 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Cancel</button>
               <button type="submit" :disabled="creatingAction" class="px-8 py-2 bg-white text-charcoal-900 rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                 {{ creatingAction ? 'Saving...' : 'Add Artifact' }}
               </button>
            </div>
         </form>
      </div>

      <!-- Evidence List -->
      <div v-if="!showEvidenceForm">
         <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-charcoal-700 pb-4 mb-6">
           <div class="flex items-center space-x-6 mb-4 md:mb-0">
             <div class="flex flex-col">
               <span class="text-xl font-light text-white font-mono">{{ evidence.length }}</span>
               <span class="text-[9px] uppercase font-bold text-gray-500 tracking-widest mt-1">TOTAL</span>
             </div>
             <div class="flex flex-col">
               <span class="text-xl font-light text-verified font-mono">{{ verifiedEvidenceCount }}</span>
               <span class="text-[9px] uppercase font-bold text-gray-500 tracking-widest mt-1">VERIFIED</span>
             </div>
           </div>
           
           <div class="flex space-x-4 w-full md:w-auto">
             <button v-if="caseItem.status !== 'RESOLVED'" @click="showEvidenceForm = true" class="bg-white text-charcoal-900 px-6 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors shrink-0">+ Add Evidence</button>
           </div>
         </div>

         <!-- Empty State -->
         <div v-if="evidence.length === 0" class="text-center p-16 border border-dashed border-charcoal-700 rounded bg-charcoal-900/50">
           <div class="text-gray-400 font-semibold mb-2">NO EVIDENCE YET</div>
           <div class="text-sm text-gray-500 mb-6">Add artifacts to begin building this investigation.</div>
           <button v-if="caseItem.status !== 'RESOLVED'" @click="showEvidenceForm = true" class="bg-charcoal-800 border border-charcoal-600 text-white px-6 py-2 rounded text-sm hover:border-charcoal-500 transition-colors">+ Add Evidence</button>
         </div>

         <!-- List -->
         <div v-else class="space-y-4">
           <div v-for="e in evidence" :key="e._id" class="flex flex-col p-4 md:p-5 border bg-charcoal-900 rounded transition-colors group" :class="recentlyVerified === e._id ? 'border-verified bg-verified/5 shadow-[0_0_15px_rgba(5,150,105,0.1)]' : 'border-charcoal-800 hover:border-charcoal-600'">
             <div class="flex flex-col lg:flex-row lg:items-center justify-between">
               
               <div class="flex-1 mb-4 lg:mb-0">
                 <div class="flex items-center space-x-3 mb-2">
                   <span class="text-xs font-mono text-gray-500">E-{{ e._id.substring(e._id.length-4).toUpperCase() }}</span>
                   <span class="text-[9px] px-2 py-0.5 rounded border uppercase tracking-widest font-bold" :class="evidenceStateClass(e.verificationState)">
                     {{ e.verificationState }}
                   </span>
                 </div>
                 <h3 class="text-base font-medium text-white mb-1 pr-4">{{ e.title }}</h3>
                 <div class="text-[10px] text-gray-500 uppercase tracking-widest font-mono">TYPE: {{ e.type }}</div>
               </div>
               
               <div class="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-8">
                 <div class="text-left lg:text-right">
                   <div class="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">CONFIDENCE</div>
                   <div class="text-sm text-white font-mono">{{ e.confidenceScore }}%</div>
                 </div>
                 
                 <!-- Actions -->
                 <div v-if="caseItem.status !== 'RESOLVED'" class="flex space-x-2">
                   <button v-if="e.verificationState === 'UNVERIFIED'" @click="verifyEvidence(e._id, 'VERIFIED')" class="text-[10px] text-verified uppercase font-bold tracking-widest hover:bg-verified hover:text-white border border-verified/50 px-4 py-2 rounded transition-colors bg-verified/10">Verify</button>
                   
                   <button v-if="e.verificationState === 'UNVERIFIED'" @click="actionConfirm = { id: e._id, type: 'evidence', state: 'DISPUTED', msg: `Mark artifact E-${e._id.substring(e._id.length-4).toUpperCase()} as disputed?` }" class="text-[10px] text-danger uppercase font-bold tracking-widest hover:bg-danger hover:text-white border border-danger/50 px-4 py-2 rounded transition-colors bg-charcoal-900">Dispute</button>
                   
                   <button @click="openLinkFlow(e)" class="text-[10px] text-electric uppercase font-bold tracking-widest hover:bg-electric hover:text-white border border-electric/50 px-4 py-2 rounded bg-charcoal-900 transition-colors">Link</button>
                 </div>
               </div>
             </div>
           </div>
         </div>
      </div>
    </div>

    <!-- HYPOTHESES WORKSPACE -->
    <div v-show="tab === 'hypotheses'">
      
      <div v-if="showHypothesisForm" class="bg-charcoal-800 border border-charcoal-600 rounded p-6 lg:p-8 mb-8 shadow-2xl">
         <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-light text-white uppercase tracking-wide">Propose Theory</h3>
            <button @click="showHypothesisForm = false" class="text-gray-500 hover:text-white text-xl">&times;</button>
         </div>
         <form @submit.prevent="createHypothesis">
            <div class="mb-6">
               <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Theory Title <span class="text-electric">*</span></label>
               <input v-model="newHypothesis.title" required type="text" placeholder="e.g. Internal Data Exfiltration" class="w-full bg-charcoal-900 border border-charcoal-600 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-electric transition-colors">
            </div>
            <div class="mb-8">
               <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Explanation <span class="text-electric">*</span></label>
               <textarea v-model="newHypothesis.description" required rows="3" class="w-full bg-charcoal-900 border border-charcoal-600 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-electric transition-colors"></textarea>
            </div>
            <div class="flex justify-end space-x-4 border-t border-charcoal-700 pt-4">
               <button type="button" @click="showHypothesisForm = false" class="px-6 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Cancel</button>
               <button type="submit" :disabled="creatingAction" class="px-8 py-2 bg-white text-charcoal-900 rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                 {{ creatingAction ? 'Saving...' : 'Propose Theory' }}
               </button>
            </div>
         </form>
      </div>

      <div v-if="!showHypothesisForm">
         <div class="flex justify-between items-center border-b border-charcoal-700 pb-4 mb-6">
           <div>
             <h2 class="text-xl font-light text-white uppercase tracking-wide">COMPETING THEORIES</h2>
           </div>
           <button v-if="caseItem.status !== 'RESOLVED'" @click="showHypothesisForm = true" class="bg-white text-charcoal-900 px-6 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">+ Propose Theory</button>
         </div>
         
         <!-- Empty State -->
         <div v-if="hypotheses.length === 0" class="text-center p-16 border border-dashed border-charcoal-700 rounded bg-charcoal-900/50">
           <div class="text-gray-400 font-semibold mb-2">NO COMPETING THEORIES</div>
           <div class="text-sm text-gray-500 mb-6">Create a hypothesis to begin comparing possible explanations against evidence.</div>
           <button v-if="caseItem.status !== 'RESOLVED'" @click="showHypothesisForm = true" class="bg-charcoal-800 border border-charcoal-600 text-white px-6 py-2 rounded text-sm hover:border-charcoal-500 transition-colors">+ Create Hypothesis</button>
         </div>

         <div v-else class="space-y-6">
           <div v-for="(h, index) in hypotheses" :key="h._id" class="bg-charcoal-800 border border-charcoal-700 rounded p-6 relative overflow-hidden transition-colors hover:border-charcoal-600">
             <div class="absolute left-0 top-0 bottom-0 w-1" :class="index === 0 ? 'bg-verified' : 'bg-charcoal-600'"></div>
             
             <div class="flex flex-col md:flex-row justify-between items-start pl-4 md:pl-6">
               <div class="flex items-start space-x-4 md:space-x-6 mb-6 md:mb-0 w-full md:w-auto">
                 <div class="text-gray-600 font-mono text-3xl font-light hidden md:block">{{ String(index + 1).padStart(2, '0') }}</div>
                 <div class="flex-1">
                   <div class="flex items-center space-x-3 mb-2">
                     <div class="text-xs font-mono text-gray-500">H-{{ h._id.substring(h._id.length-4).toUpperCase() }}</div>
                     <span v-if="index === 0" class="text-[9px] text-verified border border-verified/30 bg-verified/10 px-2 py-0.5 rounded uppercase tracking-widest font-bold">LEADING THEORY</span>
                   </div>
                   <h3 class="text-xl font-medium text-white mb-2">{{ h.title }}</h3>
                   <p class="text-sm text-gray-400 mb-4">{{ h.description }}</p>
                   
                   <div class="flex space-x-6 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                      <div class="flex items-center"><span class="w-2 h-2 bg-verified mr-2 rounded-full"></span> {{ getSupportingCount(h._id) }} SUPPORTING</div>
                      <div class="flex items-center"><span class="w-2 h-2 bg-danger mr-2 rounded-full"></span> {{ getContradictingCount(h._id) }} CONTRADICTING</div>
                   </div>
                 </div>
               </div>
               
               <div class="text-left md:text-right flex flex-col md:items-end w-full md:w-auto border-t md:border-t-0 border-charcoal-700 pt-4 md:pt-0">
                 <div class="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">SCORE</div>
                 <div class="text-4xl font-light font-mono mb-4" :class="h.score >= 0 ? 'text-electric' : 'text-danger'">
                   {{ h.score.toFixed(2) }}
                 </div>
                 
                 <button @click="toggleScoreDetails(h._id)" class="text-[10px] text-gray-300 uppercase font-bold tracking-widest hover:text-white border border-charcoal-600 px-4 py-2 rounded transition-colors w-full md:w-auto bg-charcoal-900">Why this score?</button>
               </div>
             </div>
             
             <!-- Progressive Disclosure: Why this score? -->
             <div v-if="expandedScore === h._id" class="mt-6 pt-6 border-t border-charcoal-700 pl-4 md:pl-6">
                <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">MATHEMATICAL EXPLANATION</div>
                <div class="bg-charcoal-900 border border-charcoal-800 rounded p-4 font-mono text-xs text-gray-400 space-y-2">
                  <div v-if="h.explainability.length === 0">No verified evidence linked. Connect artifacts to influence this theory's rank.</div>
                  <div v-for="(exp, idx) in h.explainability" :key="idx" class="flex items-start">
                    <span class="mr-2" :class="exp.startsWith('+') ? 'text-verified' : 'text-danger'">{{ exp.startsWith('+') ? '▲' : '▼' }}</span>
                    <span class="text-gray-300">{{ exp }}</span>
                  </div>
                </div>
             </div>
           </div>
         </div>
      </div>
    </div>

    <!-- EVIDENCE MAP WORKSPACE -->
    <div v-show="tab === 'map'" class="flex-1 flex flex-col">
       <div class="flex justify-between items-center mb-4">
         <div class="text-sm text-gray-400">Interactive investigation connections</div>
         <div class="flex space-x-2">
            <button @click="renderMap" class="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white bg-charcoal-800 px-3 py-1.5 rounded border border-charcoal-700">Fit Graph</button>
         </div>
       </div>
       <div class="flex-1 relative h-[600px] border border-charcoal-700 rounded overflow-hidden bg-charcoal-900 group">
         <!-- Legend -->
         <div class="absolute top-4 left-4 z-10 text-white bg-charcoal-900/90 p-4 border border-charcoal-700 rounded shadow-xl backdrop-blur">
            <div class="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 border-b border-charcoal-700 pb-2">LEGEND</div>
            <div class="text-[10px] font-mono text-gray-400 space-y-2">
               <div class="flex items-center"><div class="w-4 h-4 border border-charcoal-500 rounded-full mr-3 bg-charcoal-800 flex items-center justify-center text-[8px]">E</div> Artifact</div>
               <div class="flex items-center"><div class="w-4 h-4 border border-electric rounded mr-3 bg-charcoal-800 flex items-center justify-center text-[8px] text-electric">H</div> Theory</div>
               <div class="flex items-center mt-2"><div class="w-4 h-0.5 bg-verified mr-3"></div> Support Link</div>
               <div class="flex items-center"><div class="w-4 h-0.5 bg-danger mr-3"></div> Contradict Link</div>
            </div>
         </div>

         <!-- SVG / HTML Canvas via renderMap -->
         <div id="map-canvas" class="flex-1 w-full h-full relative cursor-crosshair"></div>
         
         <!-- Map Empty State -->
         <div v-if="relationships.length === 0" class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div class="bg-charcoal-800/80 border border-charcoal-600 px-6 py-4 rounded backdrop-blur text-center shadow-xl">
               <div class="text-gray-300 font-medium mb-1">Graph Empty</div>
               <div class="text-xs text-gray-500">Link evidence to hypotheses to generate the network map.</div>
            </div>
         </div>
       </div>
    </div>

    <!-- TIMELINE WORKSPACE -->
    <div v-show="tab === 'timeline'">
       <div class="mb-8 border-b border-charcoal-700 pb-4">
        <h2 class="text-xl font-light text-white uppercase tracking-wide">INVESTIGATION STORY</h2>
      </div>

      <!-- State: Empty -->
      <div v-if="timeline.length === 0" class="text-center p-16 border border-dashed border-charcoal-700 rounded bg-charcoal-900/50">
         <div class="text-gray-400 font-semibold mb-2">NO INVESTIGATION EVENTS</div>
         <div class="text-sm text-gray-500">Investigation activity will appear here chronologically.</div>
      </div>

      <!-- Chronological Stream -->
      <div v-else class="max-w-2xl mx-auto relative py-4">
         <div class="absolute left-6 md:left-24 top-0 bottom-0 w-px bg-charcoal-700"></div>
         
         <div v-for="(event, i) in timeline" :key="event._id" class="relative pl-16 md:pl-32 py-5 group">
            <!-- Timestamp on left (desktop) or inline (mobile) -->
            <div class="hidden md:block absolute left-0 top-6 text-xs font-mono text-gray-500 w-16 text-right">
               {{ formatTimeOnly(event.createdAt) }}
            </div>
            
            <!-- Node -->
            <div class="absolute left-[21px] md:left-[93px] top-7 w-2.5 h-2.5 rounded-full border border-charcoal-900 ring-2 group-hover:ring-white transition-colors" :class="getEventRingClass(event.action)"></div>
            
            <!-- Content -->
            <div class="bg-charcoal-900 border border-charcoal-700 rounded p-4 group-hover:border-charcoal-500 transition-colors">
               <div class="flex justify-between items-start mb-2">
                 <div class="text-[10px] font-bold uppercase tracking-widest text-electric">{{ formatEventAction(event.action) }}</div>
                 <div class="md:hidden text-[10px] font-mono text-gray-500">{{ formatTimeOnly(event.createdAt) }}</div>
               </div>
               <div class="text-sm text-gray-200 leading-relaxed">{{ formatEventDescription(event) }}</div>
               <div class="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-3">OPERATOR: {{ event.user?.name || 'System' }}</div>
            </div>
         </div>
      </div>
    </div>

    <!-- GLOBAL LINKING MODAL -->
    <div v-if="linkingEvidence" class="fixed inset-0 bg-charcoal-900/95 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div class="bg-charcoal-800 p-6 lg:p-8 rounded border border-charcoal-600 max-w-lg w-full shadow-2xl relative">
        <button @click="linkingEvidence = null" class="absolute top-4 right-4 text-gray-500 hover:text-white text-xl">&times;</button>
        
        <h2 class="text-xl font-light text-white mb-2 uppercase tracking-wide">Link Artifact</h2>
        <div class="text-xs font-mono text-electric mb-6 truncate px-3 py-2 bg-charcoal-900 rounded border border-charcoal-700">{{ linkingEvidence.title }}</div>
        
        <form @submit.prevent="submitLink">
          <div class="mb-6">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Target Hypothesis <span class="text-electric">*</span></label>
            <select v-model="linkForm.hypothesisId" required class="w-full bg-charcoal-900 border border-charcoal-600 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-electric transition-colors">
               <option disabled value="">Select theory to test...</option>
               <option v-for="h in hypotheses" :key="h._id" :value="h._id">{{ h.title }}</option>
            </select>
          </div>
          
          <div class="mb-8">
             <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Relationship Type <span class="text-electric">*</span></label>
             <div class="grid grid-cols-2 gap-4">
                <label class="cursor-pointer">
                   <input type="radio" v-model="linkForm.type" value="SUPPORT" class="sr-only peer" required>
                   <div class="border border-charcoal-600 rounded p-4 text-center peer-checked:border-verified peer-checked:bg-verified/10 transition-colors">
                      <div class="text-sm font-bold text-verified uppercase tracking-wider mb-1">Support</div>
                      <div class="text-[10px] text-gray-500 font-mono">Increases score</div>
                   </div>
                </label>
                <label class="cursor-pointer">
                   <input type="radio" v-model="linkForm.type" value="CONTRADICT" class="sr-only peer" required>
                   <div class="border border-charcoal-600 rounded p-4 text-center peer-checked:border-danger peer-checked:bg-danger/10 transition-colors">
                      <div class="text-sm font-bold text-danger uppercase tracking-wider mb-1">Contradict</div>
                      <div class="text-[10px] text-gray-500 font-mono">Decreases score</div>
                   </div>
                </label>
             </div>
          </div>
          
          <div class="flex justify-end space-x-4 border-t border-charcoal-700 pt-4">
            <button type="button" @click="linkingEvidence = null" class="px-6 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" :disabled="creatingAction" class="px-8 py-2 bg-electric text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors">
              {{ creatingAction ? 'Linking...' : 'Confirm Link' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- GLOBAL ACTION CONFIRMATION MODAL (For Destructive/Consequential) -->
    <div v-if="actionConfirm" class="fixed inset-0 bg-charcoal-900/90 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
       <div class="bg-charcoal-800 p-6 rounded border border-charcoal-600 max-w-sm w-full shadow-2xl text-center">
          <div class="text-2xl text-danger mb-4">⚠</div>
          <h3 class="text-lg text-white font-medium mb-2">Confirm Action</h3>
          <p class="text-sm text-gray-400 mb-8">{{ actionConfirm.msg }}</p>
          <div class="flex justify-center space-x-4">
             <button @click="actionConfirm = null" class="px-6 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Cancel</button>
             <button @click="executeConfirmedAction" class="px-6 py-2 bg-danger text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">Confirm</button>
          </div>
       </div>
    </div>
    
    <div v-if="showResolveConfirm" class="fixed inset-0 bg-charcoal-900/90 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
       <div class="bg-charcoal-800 p-6 rounded border border-electric/50 max-w-sm w-full shadow-2xl text-center relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-electric"></div>
          <h3 class="text-lg text-white font-medium mt-2 mb-2 uppercase tracking-wide">Resolve Investigation</h3>
          <p class="text-sm text-gray-400 mb-8">This action will conclude the investigation workflow and log the final state immutably. Are you ready to resolve?</p>
          <div class="flex justify-center space-x-4">
             <button @click="showResolveConfirm = false" class="px-6 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Cancel</button>
             <button @click="executeResolveCase" class="px-6 py-2 bg-electric text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors">Confirm Resolution</button>
          </div>
       </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';

const route = useRoute();
const authStore = useAuthStore();

// State
const caseItem = ref(null);
const evidence = ref([]);
const hypotheses = ref([]);
const timeline = ref([]);
const relationships = ref([]);
const loading = ref(true);
const tab = ref('overview');

// Interactions
const toastMessage = ref('');
const expandedScore = ref(null);
const recentlyVerified = ref(null);
const actionConfirm = ref(null);
const showResolveConfirm = ref(false);

// Forms
const showEvidenceForm = ref(false);
const newEvidence = ref({ title: '', type: 'Document', description: '' });

const showHypothesisForm = ref(false);
const newHypothesis = ref({ title: '', description: '' });

const linkingEvidence = ref(null);
const linkForm = ref({ hypothesisId: '', type: 'SUPPORT' });
const creatingAction = ref(false);

const headers = computed(() => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authStore.token}`
}));

const showToast = (msg) => {
   toastMessage.value = msg;
   setTimeout(() => toastMessage.value = '', 3500);
};

const fetchCaseData = async () => {
  try {
    const h = { 'Authorization': `Bearer ${authStore.token}` };
    const [caseRes, evRes, hypRes] = await Promise.all([
      fetch(`/api/cases/${route.params.id}`, { headers: h }),
      fetch(`/api/cases/${route.params.id}/evidence`, { headers: h }),
      fetch(`/api/cases/${route.params.id}/hypotheses`, { headers: h })
    ]);
    
    const [caseData, evData, hypData] = await Promise.all([caseRes.json(), evRes.json(), hypRes.json()]);
    if (caseData.success) caseItem.value = caseData.data;
    if (evData.success) evidence.value = evData.data;
    if (hypData.success) hypotheses.value = hypData.data;

    // Fetch all relationships
    const allRels = [];
    for (const hyp of hypotheses.value) {
       const res = await fetch(`/api/hypotheses/${hyp._id}/relationships`, { headers: h });
       const d = await res.json();
       if (d.success) allRels.push(...d.data);
    }
    relationships.value = allRels;

    fetchTimeline();
  } catch (err) {
    console.error("Load error", err);
  } finally {
    loading.value = false;
  }
};

const fetchTimeline = async () => {
  try {
     const res = await fetch(`/api/cases/${route.params.id}/timeline`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
     });
     const data = await res.json();
     if (data.success) timeline.value = data.data.reverse(); // newest first
  } catch(err) {
     console.error("Timeline error", err);
  }
};

const updateStatus = async () => {
  try {
    await fetch(`/api/cases/${route.params.id}/status`, {
      method: 'PUT',
      headers: headers.value,
      body: JSON.stringify({ status: caseItem.value.status })
    });
    showToast(`Case moved to ${caseItem.value.status}`);
    fetchTimeline();
  } catch (err) {
    console.error(err);
  }
};

const executeResolveCase = async () => {
   caseItem.value.status = 'RESOLVED';
   await updateStatus();
   showResolveConfirm.value = false;
};

// --- Workflows ---

const createEvidence = async () => {
   creatingAction.value = true;
   try {
      const res = await fetch(`/api/cases/${route.params.id}/evidence`, {
         method: 'POST',
         headers: headers.value,
         body: JSON.stringify(newEvidence.value)
      });
      const data = await res.json();
      if(data.success) {
         showToast('Evidence artifact logged');
         showEvidenceForm.value = false;
         newEvidence.value = { title: '', type: 'Document', description: '' };
         await fetchCaseData();
      }
   } catch (err) {
      console.error(err);
   } finally {
      creatingAction.value = false;
   }
};

const verifyEvidence = async (id, state) => {
  try {
     await fetch(`/api/evidence/${id}/verify`, {
       method: 'PUT',
       headers: headers.value,
       body: JSON.stringify({ verificationState: state })
     });
     if(state === 'VERIFIED') showToast('Artifact verified ✓');
     recentlyVerified.value = id;
     await fetchCaseData();
     setTimeout(() => { recentlyVerified.value = null; }, 4000);
  } catch(err) {
     console.error(err);
  }
};

const executeConfirmedAction = async () => {
   if(!actionConfirm.value) return;
   const { id, type, state } = actionConfirm.value;
   if(type === 'evidence') {
      await fetch(`/api/evidence/${id}/verify`, {
         method: 'PUT',
         headers: headers.value,
         body: JSON.stringify({ verificationState: state })
      });
      showToast(`Artifact marked as ${state.toLowerCase()}`);
      await fetchCaseData();
   }
   actionConfirm.value = null;
};

const createHypothesis = async () => {
   creatingAction.value = true;
   try {
      const res = await fetch(`/api/cases/${route.params.id}/hypotheses`, {
         method: 'POST',
         headers: headers.value,
         body: JSON.stringify(newHypothesis.value)
      });
      const data = await res.json();
      if(data.success) {
         showToast('Theory proposed ✓');
         showHypothesisForm.value = false;
         newHypothesis.value = { title: '', description: '' };
         await fetchCaseData();
      }
   } catch(err) {
      console.error(err);
   } finally {
      creatingAction.value = false;
   }
};

const openLinkFlow = (ev) => {
   linkingEvidence.value = ev;
   linkForm.value = { hypothesisId: '', type: 'SUPPORT' };
};

const submitLink = async () => {
   creatingAction.value = true;
   try {
      const res = await fetch(`/api/hypotheses/${linkForm.value.hypothesisId}/relationships`, {
         method: 'POST',
         headers: headers.value,
         body: JSON.stringify({
            evidenceId: linkingEvidence.value._id,
            type: linkForm.value.type,
            strength: 5 // Default fast flow
         })
      });
      const data = await res.json();
      if(data.success) {
         showToast('Relationship created ✓');
         linkingEvidence.value = null;
         await fetchCaseData();
      }
   } catch (err) {
      console.error(err);
   } finally {
      creatingAction.value = false;
   }
};

const toggleScoreDetails = (id) => {
   expandedScore.value = expandedScore.value === id ? null : id;
};

// --- Evidence Map (Lightweight DOM Graph) ---
const renderMap = () => {
   nextTick(() => {
      const container = document.getElementById('map-canvas');
      if (!container) return;
      container.innerHTML = '';
      
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 600;

      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.style.position = "absolute";
      
      const nodes = [];
      
      // Layout Math: Theories bottom half, Evidence top half
      hypotheses.value.forEach((h, i) => {
         nodes.push({ id: h._id, title: h.title, type: 'hypothesis', score: h.score, x: (width / (hypotheses.value.length + 1)) * (i + 1), y: height * 0.7 });
      });

      evidence.value.forEach((e, i) => {
         nodes.push({ id: e._id, title: e.title, type: 'evidence', state: e.verificationState, x: (width / (evidence.value.length + 1)) * (i + 1), y: height * 0.25 });
      });

      relationships.value.forEach(rel => {
         const sId = rel.evidenceId?._id || rel.evidenceId;
         const source = nodes.find(n => n.id === sId);
         const target = nodes.find(n => n.id === rel.hypothesisId);
         if(source && target) {
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", source.x);
            line.setAttribute("y1", source.y);
            line.setAttribute("x2", target.x);
            line.setAttribute("y2", target.y);
            line.setAttribute("stroke", rel.type === 'SUPPORT' ? '#059669' : '#dc2626');
            line.setAttribute("stroke-width", "2");
            line.setAttribute("opacity", "0.4");
            svg.appendChild(line);
         }
      });
      container.appendChild(svg);

      nodes.forEach(n => {
         const el = document.createElement('div');
         el.style.position = 'absolute';
         el.style.transform = 'translate(-50%, -50%)'; // precise centering
         el.style.left = n.x + 'px';
         el.style.top = n.y + 'px';
         el.title = n.title; // native tooltip
         
         if (n.type === 'hypothesis') {
            el.className = 'w-32 bg-charcoal-800 border-2 rounded p-2 text-center shadow-lg transition-transform hover:scale-105 z-10 font-mono text-[9px] truncate ' + (n.score >= 0 ? 'border-electric text-electric' : 'border-charcoal-600 text-gray-400');
            el.innerHTML = `H-${n.id.substring(n.id.length-4).toUpperCase()}<br/>${n.score.toFixed(1)}`;
         } else {
            el.className = 'w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10 font-mono text-[9px] ' + (n.state === 'VERIFIED' ? 'bg-verified/10 border-verified text-verified' : 'bg-charcoal-900 border-charcoal-600 text-gray-500');
            el.innerHTML = `E-${n.id.substring(n.id.length-2).toUpperCase()}`;
         }
         container.appendChild(el);
      });
   });
};

// --- Computed & Utils ---
const verifiedEvidenceCount = computed(() => evidence.value.filter(e => e.verificationState === 'VERIFIED').length);
const pendingEvidenceCount = computed(() => evidence.value.filter(e => e.verificationState === 'UNVERIFIED').length);
const leadingHypothesis = computed(() => hypotheses.value.length > 0 ? hypotheses.value[0] : null);

const getSupportingCount = (id) => relationships.value.filter(r => r.hypothesisId === id && r.type === 'SUPPORT').length;
const getContradictingCount = (id) => relationships.value.filter(r => r.hypothesisId === id && r.type === 'CONTRADICT').length;

const statusColorClass = (status) => {
  const map = { 'OPEN': 'text-verified border-verified/50', 'INVESTIGATING': 'text-electric border-electric/50', 'REVIEW': 'text-pending border-pending/50', 'RESOLVED': 'text-gray-300 border-gray-500' };
  return map[status] || 'text-gray-400 border-charcoal-600';
};
const evidenceStateClass = (state) => {
  const map = { 'VERIFIED': 'text-verified border-verified/30 bg-verified/10', 'DISPUTED': 'text-danger border-danger/30 bg-danger/10', 'REJECTED': 'text-gray-500 border-gray-600 bg-charcoal-800' };
  return map[state] || 'text-pending border-pending/30 bg-pending/10';
};

const formatTime = (iso) => new Date(iso).toLocaleString();
const formatTimeOnly = (iso) => new Date(iso).toTimeString().substring(0,5);

const getEventRingClass = (action) => {
   if (action.includes('VERIFY') || action.includes('RELATIONSHIP')) return 'ring-verified/30 bg-verified';
   if (action.includes('HYPOTHESIS')) return 'ring-electric/30 bg-electric';
   if (action.includes('STATUS')) return 'ring-pending/30 bg-pending';
   return 'ring-charcoal-600 bg-charcoal-500';
};

const formatEventAction = (action) => action.replace(/_/g, ' ');

const formatEventDescription = (ev) => {
   const details = ev.details || {};
   if (ev.action === 'VERIFY_EVIDENCE') return `Artifact verification state changed from ${details.oldState} to ${details.newState}.`;
   if (ev.action === 'UPDATE_CASE_STATUS') return `Investigation lifecycle advanced from ${details.oldStatus} to ${details.newStatus}.`;
   if (ev.action === 'ADD_EVIDENCE') return `Artifact "${details.title}" was logged into the dossier.`;
   if (ev.action === 'CREATE_HYPOTHESIS') return `Theory "${details.title}" was formally proposed.`;
   if (ev.action === 'CREATE_CASE') return `Investigation "${details.title}" initialized.`;
   if (ev.action === 'ADD_EVIDENCE_RELATIONSHIP') return `Evidence explicitly linked to hypothesis (Relation: ${details.type}, Strength: ${details.strength}).`;
   return 'System event recorded.';
};

onMounted(fetchCaseData);
</script>
