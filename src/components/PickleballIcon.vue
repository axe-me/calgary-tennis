<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="pickle-icon"
  >
    <!-- Cucumber/pickle body shape -->
    <path
      d="M6.5 3.5C4.5 5 3 8.5 3.5 12C4 15.5 6 19 8.5 20.5C11 22 14 21.5 16.5 19.5C19 17.5 21 14 21 10.5C21 7 19 4 16.5 3C14 2 9 1.5 6.5 3.5Z"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      fill="none"
    />
    <!-- Pickle bumps/texture -->
    <circle cx="9" cy="8" r="0.8" fill="currentColor" opacity="0.5" />
    <circle cx="12" cy="6.5" r="0.8" fill="currentColor" opacity="0.5" />
    <circle cx="15" cy="7.5" r="0.8" fill="currentColor" opacity="0.5" />
    <circle cx="7.5" cy="11.5" r="0.8" fill="currentColor" opacity="0.5" />
    <circle cx="10.5" cy="10.5" r="0.8" fill="currentColor" opacity="0.5" />
    <circle cx="14" cy="11" r="0.8" fill="currentColor" opacity="0.5" />
    <circle cx="17" cy="10.5" r="0.8" fill="currentColor" opacity="0.5" />
    <circle cx="8.5" cy="15" r="0.8" fill="currentColor" opacity="0.5" />
    <circle cx="11.5" cy="14" r="0.8" fill="currentColor" opacity="0.5" />
    <circle cx="15" cy="14.5" r="0.8" fill="currentColor" opacity="0.5" />
    <circle cx="10" cy="17.5" r="0.8" fill="currentColor" opacity="0.5" />
    <circle cx="13" cy="17" r="0.8" fill="currentColor" opacity="0.5" />
    <!-- Stem -->
    <path
      d="M6 4C5 3 4 2.5 3 2.5"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      fill="none"
    />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 14 },
})
</script>

<style scoped>
.pickle-icon {
  flex-shrink: 0;
}
</style>
