<template>
  <div class="toast-container">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :toast="toast"
      @close="removeToast(toast.id)"
    />
  </div>
</template>

<script setup>
import Toast from './Toast.vue'
import { useToast } from '~/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  @apply fixed top-4 right-4 z-50 space-y-2;
  max-width: 24rem;
}

@media (max-width: 640px) {
  .toast-container {
    @apply left-4 right-4 top-4;
    max-width: none;
  }
}
</style>
