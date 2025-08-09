export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  // Intercept all $fetch calls globally
  const originalFetch = globalThis.$fetch
  
  globalThis.$fetch = ((url: any, options: any = {}) => {
    // Only add auth headers for API calls to our own server
    if (typeof url === 'string' && url.startsWith('/api/')) {
      const authHeader = authStore.getAuthHeader()
      if (authHeader.Authorization) {
        options.headers = {
          ...options.headers,
          ...authHeader
        }
        console.log('🔐 Adding auth header to request:', url)
      } else {
        console.warn('⚠️  No auth header available for request:', url, 'isAuthenticated:', authStore.isAuthenticated)
      }
    }
    
    return originalFetch(url, options).catch((error) => {
      console.error('❌ API Request failed:', url, error)
      
      // Handle 401 responses by attempting token refresh
      if (error.statusCode === 401 || error.status === 401) {
        console.log('🔄 Got 401 response, attempting token refresh...')
        if (authStore.isAuthenticated) {
          authStore.refreshToken().catch((refreshError) => {
            console.log('❌ Token refresh failed, logging out:', refreshError)
            authStore.logout()
          })
        } else {
          console.log('🚪 Not authenticated, redirecting to login')
          authStore.logout()
        }
      }
      
      throw error
    })
  }) as typeof originalFetch
})
