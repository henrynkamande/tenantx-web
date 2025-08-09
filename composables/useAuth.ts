import { useAuthStore } from '~/stores/auth'

export const useAuth = () => {
  const authStore = useAuthStore()

  return {
    // State
    user: computed(() => authStore.landlord),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    loading: computed(() => authStore.loading),
    fullName: computed(() => authStore.fullName),
    initials: computed(() => authStore.initials),
    
    // Actions
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
    refreshToken: authStore.refreshToken,
    forgotPassword: authStore.forgotPassword,
    resetPassword: authStore.resetPassword,
    initializeAuth: authStore.initializeAuth,
    getAuthHeader: authStore.getAuthHeader
  }
}
