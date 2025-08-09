import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Public routes list
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/']

  // Wait for auth initialization if still loading
  if (process.client && authStore.loading) {
    // Wait a bit for auth to initialize
    let attempts = 0
    while (authStore.loading && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
  }

  // If still not initialized on client side, try to initialize
  if (process.client && !authStore.isAuthenticated && !authStore.loading) {
    const token = localStorage.getItem('accessToken')
    if (token && !authStore.accessToken) {
      await authStore.initializeAuth()
    }
  }

  // If not authenticated and not going to public routes, redirect to login
  if (!authStore.isAuthenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }

  // If authenticated and going to public routes, redirect to dashboard
  if (authStore.isAuthenticated && publicRoutes.includes(to.path)) {
    return navigateTo('/dashboard')
  }
})
