export default defineNuxtPlugin(async () => {
  const { $router } = useNuxtApp()
  const authStore = useAuthStore()

  // Initialize auth state from localStorage on app startup
  if (process.client) {
    console.log('Initializing auth state...')
    await authStore.initializeAuth()
    
    // Log current auth state for debugging
    console.log('Auth initialization complete:', {
      isAuthenticated: authStore.isAuthenticated,
      hasUser: !!authStore.landlord,
      hasToken: !!authStore.accessToken
    })
  }
})
