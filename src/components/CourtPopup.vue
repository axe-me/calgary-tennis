<template>
  <div class="popup-content">
    <!-- Header with region gradient -->
    <div class="popup-header" :style="headerStyle">
      <div class="popup-header-bg"></div>
      <div class="popup-header-inner">
        <span class="popup-region-badge">{{ regionLabel }}</span>
        <h2 class="popup-name">{{ court.name }}</h2>
      </div>
    </div>

    <!-- Body -->
    <div class="popup-body">
      <!-- Address -->
      <div class="popup-row">
        <svg class="popup-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span class="popup-address">{{ court.address }}</span>
      </div>

      <!-- Stats Row -->
      <div class="popup-stats">
        <div class="popup-stat">
          <span class="stat-value">{{ court.courts }}</span>
          <span class="stat-label">Court{{ court.courts > 1 ? 's' : '' }}</span>
        </div>
        <div class="popup-stat">
          <div class="stat-value stat-type-icons">
            <template v-if="court.pickleballOnly">
              <span>🥒</span>
            </template>
            <template v-else-if="court.pickleball">
              <span>🎾</span><span>🥒</span>
            </template>
            <template v-else>
              <span>🎾</span>
            </template>
          </div>
          <span class="stat-label">Type</span>
        </div>
        <div class="popup-stat">
          <span class="stat-value" :class="court.bookable ? 'stat-open' : 'stat-closed'">
            {{ court.bookable ? 'Yes' : 'No' }}
          </span>
          <span class="stat-label">Bookable</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="popup-actions">
        <!-- Directions Button -->
        <a
          :href="directionsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="popup-directions-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          Directions
        </a>

        <!-- Booking Button -->
        <a
          v-if="court.bookable"
          :href="bookingUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="popup-book-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          Book Court
        </a>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BOOKING_URLS, REGION_LABELS, REGION_COLORS } from '../data/courts.js'

const props = defineProps({
  court: { type: Object, required: true },
})

const regionLabel = computed(() => REGION_LABELS[props.court.region] || props.court.region.toUpperCase())

const bookingUrl = computed(() => BOOKING_URLS[props.court.region] || '#')

// Use geo: URI for mobile native map picker, falls back to Google Maps on desktop
const directionsUrl = computed(() => {
  const { lat, lng, name, address } = props.court
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  if (isMobile) {
    // geo: URI lets the OS pick the map app
    return `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`
  }
  // Desktop: open Google Maps directions
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(address + ', Calgary, AB')}`
})

const headerStyle = computed(() => {
  const color = REGION_COLORS[props.court.region] || '#6366f1'
  return {
    '--region-color': color,
  }
})
</script>

<style scoped>
.popup-content {
  width: 300px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.popup-header {
  position: relative;
  padding: 20px 20px 16px;
  overflow: hidden;
}

.popup-header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--region-color) 0%, transparent 70%);
  opacity: 0.12;
}

.popup-header-inner {
  position: relative;
}

.popup-region-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--region-color);
  background: var(--region-badge-bg, rgba(255, 255, 255, 0.06));
  padding: 3px 10px;
  border-radius: 999px;
  margin-bottom: 8px;
}

.popup-name {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--popup-text, #f0f2f5);
  line-height: 1.2;
}

/* Body */
.popup-body {
  padding: 0 20px 20px;
}

.popup-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
}

.popup-icon {
  color: var(--popup-muted, #6b7280);
  flex-shrink: 0;
  margin-top: 1px;
}

.popup-address {
  font-size: 13px;
  color: var(--popup-subtext, #9ca3af);
  line-height: 1.4;
}

/* Stats */
.popup-stats {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  background: var(--popup-stat-bg, rgba(255, 255, 255, 0.03));
  border-radius: 10px;
  border: 1px solid var(--popup-stat-border, rgba(255, 255, 255, 0.05));
  overflow: hidden;
}

.popup-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  border-right: 1px solid var(--popup-stat-border, rgba(255, 255, 255, 0.05));
}

.popup-stat:last-child {
  border-right: none;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--popup-text, #f0f2f5);
  letter-spacing: -0.01em;
}

.stat-type-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 16px;
  line-height: 1;
  height: 24px;
}

.stat-open {
  color: var(--accent-emerald, #10b981);
}

.stat-closed {
  color: var(--popup-muted, #6b7280);
}

.stat-label {
  font-size: 10px;
  color: var(--popup-muted, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
  margin-top: 2px;
}

/* Action Buttons Row */
.popup-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

/* Directions Button */
.popup-directions-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  background: var(--popup-stat-bg, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--popup-stat-border, rgba(255, 255, 255, 0.08));
  color: var(--accent-indigo, #6366f1);
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.popup-directions-btn:hover {
  background: var(--bg-card-hover, rgba(255, 255, 255, 0.06));
  border-color: var(--accent-indigo, #6366f1);
  transform: translateY(-1px);
}

.popup-directions-btn:active {
  transform: translateY(0);
}

/* Booking Button */
.popup-book-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  padding: 11px 14px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  white-space: nowrap;
}

.popup-book-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
}

.popup-book-btn:active {
  transform: translateY(0);
}

</style>
