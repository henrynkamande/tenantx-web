<template>
  <div id="app">
    <!-- Global Loading Indicator -->
    <div v-if="pending" class="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading...</p>
      </div>
    </div>

    <!-- Main App Content -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup>
import ToastContainer from '~/components/ui/ToastContainer.vue'

// Global app setup
useHead({
  title: 'TenantX - Property Management Made Simple',
  meta: [
    {
      name: 'description',
      content: 'Modern property management solution for landlords and property managers. Manage tenants, track payments, and streamline your rental business with TenantX.'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    },
    {
      name: 'theme-color',
      content: '#2563eb'
    }
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico'
    }
  ]
})

// Global loading state
const pending = ref(false)

// Handle route changes
const router = useRouter()
router.beforeEach((to, from) => {
  if (to.path !== from.path) {
    pending.value = true
  }
})

router.afterEach(() => {
  setTimeout(() => {
    pending.value = false
  }, 100)
})

// Global error handling
onErrorCaptured((error) => {
  console.error('Global error captured:', error)
  return false
})

// Initialize authentication on app start
onMounted(() => {
  // Any global initialization logic can go here
  console.log('TenantX app initialized')
})
</script>

<style>
/* Global styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #374151;
  background-color: #f9fafb;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Focus styles */
*:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Button hover effects */
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Card hover effects */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

/* Loading animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Utility classes */
.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.backdrop-blur {
  backdrop-filter: blur(8px);
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
}

/* Mobile responsive adjustments */
@media (max-width: 640px) {
  .card {
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .card {
    border: 2px solid #374151;
  }
  
  .btn-primary {
    border: 2px solid #1e40af;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
