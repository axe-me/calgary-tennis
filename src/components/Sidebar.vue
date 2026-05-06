<template>
  <aside
    class="sidebar"
    :class="{ 'sheet-dragging': isDragging }"
    :style="sheetStyle"
    ref="sidebarRef"
  >
    <!-- Mobile drag handle -->
    <div
      class="sheet-handle"
      @touchstart.passive="onDragStart"
      @touchmove.passive="onDragMove"
      @touchend="onDragEnd"
      @click="onHandleTap"
    >
      <div class="sheet-handle-bar"></div>
    </div>
    <!-- Header -->
    <div class="sidebar-header">
      <div class="logo-row">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
            <path d="M7 17C7.5 13 9.5 9 12 7C14.5 9 16.5 13 17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </div>
        <div class="logo-text">
          <h1 class="logo-title">Calgary Tennis</h1>
          <p class="logo-subtitle">Court Finder</p>
        </div>
        <!-- Theme Toggle -->
        <button class="theme-toggle" @click="$emit('toggle-theme')" :title="isLightMode ? 'Switch to dark mode' : 'Switch to light mode'">
          <svg v-if="!isLightMode" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="sidebar-search">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          class="search-input"
          placeholder="Search courts or addresses…"
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          @focus="onSearchFocus"
        />
        <button v-if="searchQuery" class="search-clear" @click="$emit('update:searchQuery', '')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Region Filter -->
    <div class="region-filters">
      <button
        class="region-btn"
        :class="{ active: selectedRegion === 'all' }"
        @click="$emit('update:selectedRegion', 'all')"
      >
        <span class="region-dot region-all"></span>
        All
        <span class="region-count">{{ courts.length }}</span>
      </button>
      <button
        v-for="r in regions"
        :key="r.key"
        class="region-btn"
        :class="{ active: selectedRegion === r.key }"
        @click="$emit('update:selectedRegion', r.key)"
      >
        <span class="region-dot" :style="{ background: r.color }"></span>
        {{ r.label }}
        <span class="region-count">{{ regionCount(r.key) }}</span>
      </button>
    </div>

    <!-- Type Filter -->
    <div class="type-filters">
      <button
        class="type-btn"
        :class="{ active: typeFilters.includes('tennis') }"
        @click="toggleType('tennis')"
      >
        <span class="type-emoji">🎾</span>
        Tennis
      </button>
      <button
        class="type-btn type-btn--pickle"
        :class="{ active: typeFilters.includes('pickleball') }"
        @click="toggleType('pickleball')"
      >
        <span class="type-emoji">🥒</span>
        Pickleball
      </button>
    </div>

    <!-- Court List -->
    <div class="court-list">
      <TransitionGroup name="list">
        <div
          v-for="court in displayedCourts"
          :key="court.id"
          class="court-card"
          :class="{ 'court-card--bookable': court.bookable }"
          @click="onCourtClick(court)"
        >
          <div class="court-card-header">
            <div class="court-card-dot" :style="{ background: regionColor(court.region) }"></div>
            <h3 class="court-card-name">{{ court.name }}</h3>
            <span v-if="court.bookable" class="court-badge bookable">Bookable</span>
          </div>
          <p class="court-card-address">{{ court.address }}</p>
          <div class="court-card-meta">
            <span class="meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              {{ court.courts }} court{{ court.courts > 1 ? 's' : '' }}
            </span>
            <span v-if="!court.pickleballOnly" class="meta-item meta-tennis">
              🎾 Tennis
            </span>
            <span v-if="court.pickleball" class="meta-item meta-pickle">
              🥒 Pickleball
            </span>
            <span v-if="court.pickleballOnly" class="meta-item meta-pickle">
              🥒 Pickleball Only
            </span>
          </div>
        </div>
      </TransitionGroup>

      <div v-if="displayedCourts.length === 0 && !loading" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <p>No courts found</p>
        <p class="empty-hint">Try a different search or filter</p>
      </div>
    </div>

    <!-- Footer Stats -->
    <div class="sidebar-footer">
      <div class="footer-stat">
        <span class="footer-stat-value">{{ totalCourts }}</span>
        <span class="footer-stat-label">Total Courts</span>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-stat">
        <span class="footer-stat-value">{{ displayedCourts.length }}</span>
        <span class="footer-stat-label">Showing</span>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-stat">
        <span class="footer-stat-value">{{ bookableCount }}</span>
        <span class="footer-stat-label">Bookable</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { REGION_COLORS } from '../data/courts.js'

const props = defineProps({
  courts: { type: Array, required: true },
  selectedRegion: { type: String, required: true },
  searchQuery: { type: String, required: true },
  typeFilters: { type: Array, default: () => ['tennis', 'pickleball'] },
  loading: { type: Boolean, default: false },
  isLightMode: { type: Boolean, default: false },
})

const emit = defineEmits(['update:selectedRegion', 'update:searchQuery', 'update:typeFilters', 'select-court', 'toggle-theme'])

// ── Mobile bottom sheet logic ──
const sidebarRef = ref(null)
const isMobile = ref(false)
const isDragging = ref(false)
const sheetHeight = ref(140) // collapsed peek height
const dragStartY = ref(0)
const dragStartHeight = ref(0)

const SNAP_PEEK = 140
const SNAP_HALF = () => window.innerHeight * 0.5
const SNAP_FULL = () => window.innerHeight * 0.9

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) sheetHeight.value = 0 // reset; CSS handles desktop
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const sheetStyle = computed(() => {
  if (!isMobile.value) return {}
  return { height: sheetHeight.value + 'px' }
})

function onDragStart(e) {
  if (!isMobile.value) return
  isDragging.value = true
  dragStartY.value = e.touches[0].clientY
  dragStartHeight.value = sheetHeight.value
}

function onDragMove(e) {
  if (!isDragging.value || !isMobile.value) return
  const dy = dragStartY.value - e.touches[0].clientY
  const newH = Math.min(Math.max(dragStartHeight.value + dy, 80), window.innerHeight * 0.92)
  sheetHeight.value = newH
}

function onDragEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  snapToNearest()
}

function snapToNearest() {
  const h = sheetHeight.value
  const snaps = [SNAP_PEEK, SNAP_HALF(), SNAP_FULL()]
  let closest = snaps[0]
  let minDist = Math.abs(h - snaps[0])
  for (const s of snaps) {
    const d = Math.abs(h - s)
    if (d < minDist) { minDist = d; closest = s }
  }
  sheetHeight.value = closest
}

function onHandleTap() {
  if (!isMobile.value) return
  // Toggle between peek and half
  sheetHeight.value = sheetHeight.value <= SNAP_PEEK + 20 ? SNAP_HALF() : SNAP_PEEK
}

function onSearchFocus() {
  if (isMobile.value) {
    sheetHeight.value = SNAP_HALF()
  }
}

function onCourtClick(court) {
  emit('select-court', court)
  if (isMobile.value) {
    sheetHeight.value = SNAP_PEEK
  }
}

function toggleType(type) {
  const isBoth = props.typeFilters.length === 2
  const isNone = props.typeFilters.length === 0
  
  let newTypes = []

  if (isBoth) {
    // If both selected, clicking one "solos" it
    newTypes = [type]
  } else if (isNone) {
    // If none selected, selecting one makes it active
    newTypes = [type]
  } else {
    // Exactly one is selected
    if (props.typeFilters.includes(type)) {
      // Clicking the already active one deselects it (none)
      newTypes = []
    } else {
      // Clicking the other one selects both
      newTypes = ['tennis', 'pickleball']
    }
  }

  emit('update:typeFilters', newTypes)
}

const regions = [
  { key: 'ne', label: 'NE', color: REGION_COLORS.ne },
  { key: 'nw', label: 'NW', color: REGION_COLORS.nw },
  { key: 'se', label: 'SE', color: REGION_COLORS.se },
  { key: 'sw', label: 'SW', color: REGION_COLORS.sw },
]

const displayedCourts = computed(() => {
  let result = props.courts

  if (props.selectedRegion !== 'all') {
    result = result.filter(c => c.region === props.selectedRegion)
  }

  const showTennis = props.typeFilters.includes('tennis')
  const showPickleball = props.typeFilters.includes('pickleball')

  if (showTennis && !showPickleball) {
    result = result.filter(c => !c.pickleballOnly)
  } else if (!showTennis && showPickleball) {
    result = result.filter(c => c.pickleball || c.pickleballOnly)
  }

  if (props.searchQuery.trim()) {
    const q = props.searchQuery.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    )
  }

  return result
})

const totalCourts = computed(() =>
  props.courts.reduce((sum, c) => sum + c.courts, 0)
)

const bookableCount = computed(() =>
  displayedCourts.value.filter(c => c.bookable).length
)

function regionCount(region) {
  return props.courts.filter(c => c.region === region).length
}

function regionColor(region) {
  return REGION_COLORS[region] || '#6b7280'
}
</script>

<style scoped>
.sidebar {
  width: 380px;
  min-width: 380px;
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  z-index: 500;
  transition: background var(--transition-normal), border-color var(--transition-normal);
}

.sidebar:not(.sheet-dragging) {
  transition: background var(--transition-normal), border-color var(--transition-normal), height 0.3s cubic-bezier(.2,.9,.3,1);
}

/* Mobile drag handle – hidden on desktop */
.sheet-handle {
  display: none;
}

/* Header */
.sidebar-header {
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.logo-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  flex: 1;
}

.logo-icon {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  background: var(--gradient-indigo);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-glow-indigo);
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: var(--logo-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Theme Toggle */
.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.theme-toggle:hover {
  background: var(--bg-card-hover);
  color: var(--accent-amber);
  border-color: var(--border-glow);
}

/* Search */
.sidebar-search {
  padding: 12px 20px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 36px 0 38px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-family);
  font-size: 13px;
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-normal);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: var(--accent-indigo);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-clear {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.search-clear:hover {
  color: var(--text-primary);
}

/* Region Filters */
.region-filters {
  display: flex;
  gap: 6px;
  padding: 0 20px 8px;
  flex-wrap: wrap;
}

.region-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  color: var(--text-secondary);
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.region-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.region-btn.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
  color: var(--text-primary);
}

.region-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.region-all {
  background: linear-gradient(135deg, #6366f1, #f59e0b, #10b981, #ef4444);
}

.region-count {
  background: var(--region-badge-bg);
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 11px;
  color: var(--text-muted);
}

/* Type Filters */
.type-filters {
  display: flex;
  gap: 6px;
  padding: 0 20px 12px;
}

.type-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  color: var(--text-secondary);
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.type-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.type-btn.active {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--accent-emerald);
}

.type-btn--pickle.active {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.3);
  color: var(--accent-amber);
}

.type-emoji {
  font-size: 13px;
  line-height: 1;
}

/* Court List */
.court-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 12px;
}

.court-card {
  padding: 14px 16px;
  margin-bottom: 4px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  animation: fadeInUp 0.3s ease backwards;
}

.court-card:hover {
  background: var(--bg-card);
  border-color: var(--border-subtle);
}

.court-card:active {
  transform: scale(0.99);
}

.court-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.court-card-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.court-card-name {
  font-size: 14px;
  font-weight: 600;
  flex: 1;
  letter-spacing: -0.01em;
}

.court-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.court-badge.bookable {
  background: rgba(16, 185, 129, 0.12);
  color: var(--accent-emerald);
}

.court-card-address {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  padding-left: 16px;
}

.court-card-meta {
  display: flex;
  gap: 12px;
  padding-left: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-muted);
}

.meta-pickle {
  color: var(--accent-amber);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 8px;
  color: var(--text-muted);
  font-size: 14px;
}

.empty-hint {
  font-size: 12px;
  opacity: 0.6;
}

/* Footer */
.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 14px 20px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
  transition: background var(--transition-normal);
}

.footer-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.footer-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.footer-stat-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
}

.footer-divider {
  width: 1px;
  height: 28px;
  background: var(--border-subtle);
}

/* List transition */
.list-enter-active {
  transition: all 0.3s ease;
}
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
.list-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    width: 100%;
    min-width: unset;
    bottom: 0;
    left: 0;
    right: 0;
    border-right: none;
    border-top: none;
    border-radius: 16px 16px 0 0;
    z-index: 600;
    box-shadow: 0 -4px 24px rgba(0,0,0,0.25);
    overflow: hidden;
  }

  .sheet-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 0 4px;
    cursor: grab;
    touch-action: none;
    flex-shrink: 0;
  }

  .sheet-handle-bar {
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background: var(--text-muted, #6b7280);
    opacity: 0.4;
  }

  .sidebar-header {
    padding: 8px 16px 10px;
  }

  .sidebar-search {
    padding: 6px 16px;
  }

  .region-filters {
    padding: 0 16px 6px;
  }

  .type-filters {
    padding: 0 16px 8px;
  }

  .court-list {
    flex: 1;
    min-height: 0;
  }
}
</style>
