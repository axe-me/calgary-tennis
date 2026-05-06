<template>
  <div class="map-wrapper" ref="mapWrapper">
    <l-map
      ref="mapInstance"
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      @ready="onMapReady"
    >
      <l-tile-layer
        :key="tileUrl"
        :url="tileUrl"
        :attribution="attribution"
      />

      <l-marker
        v-for="court in courts"
        :key="court.id"
        :lat-lng="[court.lat, court.lng]"
        :icon="createIcon(court)"
        @click="handleMarkerClick(court)"
      >
        <l-popup :options="{ maxWidth: 320, minWidth: 280, closeButton: true }">
          <CourtPopup :court="court" />
        </l-popup>
      </l-marker>
    </l-map>

    <!-- Region Legend -->
    <div class="map-legend">
      <div class="legend-title">Regions</div>
      <div v-for="r in regionItems" :key="r.key" class="legend-item">
        <span class="legend-dot" :style="{ background: r.color }"></span>
        <span class="legend-label">{{ r.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import { REGION_COLORS, REGION_LABELS } from '../data/courts.js'
import CourtPopup from './CourtPopup.vue'

const props = defineProps({
  courts: { type: Array, required: true },
  selectedCourt: { type: Object, default: null },
  isLightMode: { type: Boolean, default: false },
})

const emit = defineEmits(['select-court'])

const mapInstance = ref(null)
const mapWrapper = ref(null)
const zoom = ref(11)
const center = ref([51.0447, -114.0719]) // Calgary center

const mapOptions = {
  zoomControl: true,
  zoomAnimation: true,
  fadeAnimation: true,
  markerZoomAnimation: true,
}

const tileUrl = computed(() =>
  props.isLightMode
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
)

const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

const regionItems = Object.keys(REGION_COLORS).map(key => ({
  key,
  label: REGION_LABELS[key],
  color: REGION_COLORS[key],
}))

function createIcon(court) {
  const color = REGION_COLORS[court.region] || '#6b7280'
  const size = court.bookable ? 14 : 10
  const pulseSize = size + 12
  const borderColor = props.isLightMode ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.9)'

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;width:${pulseSize}px;height:${pulseSize}px;display:flex;align-items:center;justify-content:center;">
        <div style="
          position:absolute;
          width:${pulseSize}px;
          height:${pulseSize}px;
          border-radius:50%;
          background:${color};
          opacity:0.15;
          animation: marker-pulse 2.5s ease-in-out infinite;
        "></div>
        <div style="
          width:${size}px;
          height:${size}px;
          border-radius:50%;
          background:${color};
          border:2px solid ${borderColor};
          box-shadow: 0 0 8px ${color}60, 0 2px 6px rgba(0,0,0,0.3);
          position:relative;
          z-index:2;
        "></div>
      </div>
    `,
    iconSize: [pulseSize, pulseSize],
    iconAnchor: [pulseSize / 2, pulseSize / 2],
    popupAnchor: [0, -pulseSize / 2],
  })
}

function handleMarkerClick(court) {
  emit('select-court', court)
}

function onMapReady() {
  // Map is ready
}

function flyToCourt(court) {
  if (mapInstance.value?.leafletObject) {
    mapInstance.value.leafletObject.flyTo([court.lat, court.lng], 15, {
      duration: 1,
    })
    // Open popup for the court - find the marker layers
    setTimeout(() => {
      mapInstance.value.leafletObject.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          const pos = layer.getLatLng()
          if (
            Math.abs(pos.lat - court.lat) < 0.0001 &&
            Math.abs(pos.lng - court.lng) < 0.0001
          ) {
            layer.openPopup()
          }
        }
      })
    }, 1100)
  }
}

// Expose for parent
defineExpose({ flyToCourt })

watch(() => props.courts, (newCourts) => {
  if (newCourts.length > 0 && mapInstance.value?.leafletObject) {
    const bounds = L.latLngBounds(newCourts.map(c => [c.lat, c.lng]))
    mapInstance.value.leafletObject.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  }
})
</script>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-wrapper :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
}

/* Custom Marker Reset */
.map-wrapper :deep(.custom-marker) {
  background: none !important;
  border: none !important;
}

/* Legend */
.map-legend {
  position: absolute;
  bottom: 32px;
  right: 16px;
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  z-index: 400;
  box-shadow: var(--shadow-lg);
  transition: background var(--transition-normal), border-color var(--transition-normal);
}

.legend-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}
</style>
