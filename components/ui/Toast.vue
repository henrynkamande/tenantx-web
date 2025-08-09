<template>
  <div
    v-if="toast"
    class="toast"
    :class="toastClasses"
    @click="$emit('close')"
  >
    <div class="flex items-center">
      <!-- Success Icon -->
      <CheckCircleIcon v-if="toast.type === 'success'" class="h-5 w-5 mr-3 flex-shrink-0" />
      <!-- Error Icon -->
      <XCircleIcon v-else-if="toast.type === 'error'" class="h-5 w-5 mr-3 flex-shrink-0" />
      <!-- Warning Icon -->
      <ExclamationTriangleIcon v-else-if="toast.type === 'warning'" class="h-5 w-5 mr-3 flex-shrink-0" />
      <!-- Info Icon -->
      <InformationCircleIcon v-else class="h-5 w-5 mr-3 flex-shrink-0" />
      
      <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
      
      <!-- Close Button -->
      <button
        @click.stop="$emit('close')"
        class="ml-4 flex-shrink-0 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
        :class="closeButtonClasses"
      >
        <XMarkIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  toast: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const toastClasses = computed(() => {
  const baseClasses = 'toast-base animate-slide-in-right'
  
  switch (props.toast.type) {
    case 'success':
      return `${baseClasses} toast-success`
    case 'error':
      return `${baseClasses} toast-error`
    case 'warning':
      return `${baseClasses} toast-warning`
    case 'info':
    default:
      return `${baseClasses} toast-info`
  }
})

const closeButtonClasses = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'text-green-600 hover:bg-green-100 focus:ring-green-500'
    case 'error':
      return 'text-red-600 hover:bg-red-100 focus:ring-red-500'
    case 'warning':
      return 'text-yellow-600 hover:bg-yellow-100 focus:ring-yellow-500'
    case 'info':
    default:
      return 'text-blue-600 hover:bg-blue-100 focus:ring-blue-500'
  }
})
</script>

<style scoped>
.toast-base {
  @apply max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 mb-4 cursor-pointer;
  padding: 1rem;
  transition: all 0.3s ease;
}

.toast-success {
  @apply border-l-4 border-green-500;
}

.toast-success .text-sm {
  @apply text-green-800;
}

.toast-success svg:first-child {
  @apply text-green-500;
}

.toast-error {
  @apply border-l-4 border-red-500;
}

.toast-error .text-sm {
  @apply text-red-800;
}

.toast-error svg:first-child {
  @apply text-red-500;
}

.toast-warning {
  @apply border-l-4 border-yellow-500;
}

.toast-warning .text-sm {
  @apply text-yellow-800;
}

.toast-warning svg:first-child {
  @apply text-yellow-500;
}

.toast-info {
  @apply border-l-4 border-blue-500;
}

.toast-info .text-sm {
  @apply text-blue-800;
}

.toast-info svg:first-child {
  @apply text-blue-500;
}

.toast-base:hover {
  @apply shadow-xl transform -translate-y-1;
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
</style>
