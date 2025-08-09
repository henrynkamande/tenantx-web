import { defineStore } from 'pinia'

interface Landlord {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  companyName?: string
  preferredCurrency: string
  language: string
  isActive: boolean
  subscriptionStatus: string
  subscriptionPlan: string
  createdAt: string
  updatedAt: string
}

interface AuthState {
  landlord: Landlord | null
  accessToken: string | null
  isAuthenticated: boolean
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    landlord: null,
    accessToken: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    fullName: (state) => {
      if (!state.landlord) return ''
      return `${state.landlord.firstName} ${state.landlord.lastName}`
    },

    initials: (state) => {
      if (!state.landlord) return ''
      return `${state.landlord.firstName[0]}${state.landlord.lastName[0]}`.toUpperCase()
    }
  },

  actions: {
    async register(data: {
      firstName: string
      lastName: string
      email: string
      password: string
      phone?: string
      companyName?: string
      preferredCurrency?: string
      language?: string
    }) {
      this.loading = true
      try {
        const response = await $fetch('/api/auth/register', {
          method: 'POST',
          body: data
        }) as {
          success: boolean
          data: {
            landlord?: Landlord
            accessToken: string
          }
        }

        if (response.success) {
          this.landlord = response.data.landlord ? response.data.landlord : null
          this.accessToken = response.data.accessToken ?? null
          this.isAuthenticated = !!response.data.accessToken

          // Store token in localStorage for persistence
          if (process.client && this.accessToken) {
            localStorage.setItem('accessToken', this.accessToken)
          }

          return response
        }
      } catch (error) {
        console.error('Registration error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(email: string, password: string) {
      this.loading = true
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        })

        if (response.success) {
          this.landlord = response.data.landlord ? response.data.landlord : null
          this.accessToken = response.data.accessToken ?? null
          this.isAuthenticated = true

          // Store token in localStorage for persistence
          if (process.client && typeof this.accessToken === 'string') {
            localStorage.setItem('accessToken', this.accessToken)
          }

          return response
        }
      } catch (error: any) {
        console.error('Login error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST'
        })
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.landlord = null
        this.accessToken = null
        this.isAuthenticated = false

        // Clear token from localStorage
        if (process.client) {
          localStorage.removeItem('accessToken')
        }

        // Redirect to login
        await navigateTo('/login')
      }
    },

    async refreshToken() {
      try {
        const response = await $fetch('/api/auth/refresh', {
          method: 'POST'
        })

        if (response.success) {
          this.accessToken = response.data.accessToken

          // Store new token in localStorage
          if (process.client) {
            localStorage.setItem('accessToken', this.accessToken)
          }

          return response.data.accessToken
        }
      } catch (error) {
        console.error('Token refresh error:', error)
        this.logout()
        throw error
      }
    },

    async forgotPassword(email: string) {
      this.loading = true
      try {
        const response = await $fetch('/api/auth/forgot-password', {
          method: 'POST',
          body: { email }
        })
        return response
      } catch (error: any) {
        console.error('Forgot password error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async resetPassword(token: string, password: string) {
      this.loading = true
      try {
        const response = await $fetch('/api/auth/reset-password', {
          method: 'POST',
          body: { token, password }
        })
        return response
      } catch (error: any) {
        console.error('Reset password error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Initialize auth state from localStorage
    async initializeAuth() {
      if (process.client) {
        const token = localStorage.getItem('accessToken')
        if (token) {
          this.accessToken = token
          this.loading = true
          
          try {
            const response = await $fetch('/api/auth/me', {
              headers: { Authorization: `Bearer ${token}` }
            })
            
            if (response.success && response.data.landlord) {
              this.landlord = response.data.landlord
              this.isAuthenticated = true
              console.log('Auth initialized successfully:', this.landlord.email)
            } else {
              throw new Error('Invalid response structure')
            }
          } catch (error) {
            console.log('Token validation failed, clearing auth state:', error)
            this.clearAuthState()
          } finally {
            this.loading = false
          }
        } else {
          this.clearAuthState()
        }
      }
    },

    // Clear authentication state
    clearAuthState() {
      this.landlord = null
      this.accessToken = null
      this.isAuthenticated = false
      
      if (process.client) {
        localStorage.removeItem('accessToken')
      }
    },

    // Set authorization header for API calls
    getAuthHeader() {
      console.log('Auth Store - getAuthHeader called:', {
        hasToken: !!this.accessToken,
        isAuthenticated: this.isAuthenticated,
        tokenLength: this.accessToken ? this.accessToken.length : 0
      })
      return this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}
    }
  }
})
