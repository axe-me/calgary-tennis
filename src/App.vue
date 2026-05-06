<template>
  <div class="app-container" :class="{ 'light-mode': isLightMode }">
    <!-- Sidebar -->
    <Sidebar
      :courts="courts"
      :selected-region="selectedRegion"
      :search-query="searchQuery"
      :type-filters="typeFilters"
      :loading="loading"
      :is-light-mode="isLightMode"
      @update:selectedRegion="selectedRegion = $event"
      @update:searchQuery="searchQuery = $event"
      @update:typeFilters="typeFilters = $event"
      @select-court="handleCourtSelect"
      @toggle-theme="toggleTheme"
    />

    <!-- Map Area -->
    <div class="map-container">
      <MapView
        ref="mapRef"
        :courts="filteredCourts"
        :selected-court="selectedCourt"
        :is-light-mode="isLightMode"
        @select-court="handleCourtSelect"
      />

      <!-- Loading Overlay -->
      <Transition name="fade">
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <p class="loading-text">Loading tennis courts…</p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { courts as courtData, REGION_LABELS } from './data/courts.js'
import Sidebar from './components/Sidebar.vue'
import MapView from './components/MapView.vue'

const courts = ref([])
const selectedRegion = ref('all')
const searchQuery = ref('')
const typeFilters = ref(['tennis', 'pickleball'])
const selectedCourt = ref(null)
const loading = ref(true)
const mapRef = ref(null)

// Theme: check localStorage or default to dark
const isLightMode = ref(localStorage.getItem('theme') === 'light')

function toggleTheme() {
  isLightMode.value = !isLightMode.value
  localStorage.setItem('theme', isLightMode.value ? 'light' : 'dark')
}

// Also apply the class to <body> for global styles (scrollbar, leaflet overrides)
watch(isLightMode, (val) => {
  document.body.classList.toggle('light-mode', val)
}, { immediate: true })

const filteredCourts = computed(() => {
  let result = courts.value

  if (selectedRegion.value !== 'all') {
    result = result.filter(c => c.region === selectedRegion.value)
  }

  const showTennis = typeFilters.value.includes('tennis')
  const showPickleball = typeFilters.value.includes('pickleball')

  if (showTennis && !showPickleball) {
    result = result.filter(c => !c.pickleballOnly)
  } else if (!showTennis && showPickleball) {
    result = result.filter(c => c.pickleball || c.pickleballOnly)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      REGION_LABELS[c.region].toLowerCase().includes(q)
    )
  }

  return result
})

function handleCourtSelect(court) {
  selectedCourt.value = court
  if (mapRef.value) {
    mapRef.value.flyToCourt(court)
  }
}

onMounted(() => {
  // Simulate loading from the city data source
  setTimeout(() => {
    courts.value = courtData
    loading.value = false
  }, 800)
})
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.map-container {
  flex: 1;
  position: relative;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 17, 23, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.light-mode .loading-overlay {
  background: rgba(245, 247, 250, 0.9);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner-ring {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid rgba(99, 102, 241, 0.15);
  border-top-color: var(--accent-indigo);
  animation: spin 0.8s linear infinite;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
