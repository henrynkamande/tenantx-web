<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
          <BuildingOfficeIcon class="h-8 w-8 text-blue-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a reset link
        </p>
      </div>
      
      <form v-if="!submitted" class="mt-8 space-y-6" @submit.prevent="handleForgotPassword">
        <div>
          <label for="email" class="sr-only">Email address</label>
          <input
            id="email"
            v-model="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
          />
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <EnvelopeIcon class="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
            </span>
            <span v-if="!loading">Send reset link</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          </button>
        </div>

        <div class="text-center">
          <span class="text-sm text-gray-600">
            Remember your password?
            <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </NuxtLink>
          </span>
        </div>
      </form>

      <!-- Success message -->
      <div v-if="submitted" class="text-center">
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
          <CheckIcon class="h-8 w-8 text-green-600" />
        </div>
        <h3 class="mt-4 text-lg font-medium text-gray-900">Check your email</h3>
        <p class="mt-2 text-sm text-gray-600">
          We've sent a password reset link to <strong>{{ email }}</strong>
        </p>
        <p class="mt-1 text-xs text-gray-500">
          Didn't receive the email? Check your spam folder or try again.
        </p>
        <div class="mt-4">
          <button
            @click="submitted = false"
            class="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <XCircleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Password reset failed
            </h3>
            <div class="mt-2 text-sm text-red-700">
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BuildingOfficeIcon, EnvelopeIcon, CheckIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: false,
  auth: false
})

const authStore = useAuthStore()
const toast = useToast()

const email = ref('')
const loading = ref(false)
const submitted = ref(false)
const error = ref('')

const handleForgotPassword = async () => {
  error.value = ''
  loading.value = true
  
  try {
    await authStore.forgotPassword(email.value)
    submitted.value = true
    toast.success('Reset link sent!', 'Check your email for the password reset link.')
  } catch (err) {
    console.error('Forgot password error:', err)
    error.value = err.data?.message || err.message || 'Failed to send reset link. Please try again.'
    toast.error('Reset failed', error.value)
  } finally {
    loading.value = false
  }
}

// Redirect if already authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    navigateTo('/dashboard')
  }
})
</script>
