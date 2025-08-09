<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
          <BuildingOfficeIcon class="h-8 w-8 text-blue-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your TenantX account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Start managing your properties today
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="label">First Name</label>
              <input
                id="firstName"
                v-model="form.firstName"
                name="firstName"
                type="text"
                required
                class="input-field"
                placeholder="John"
              />
            </div>
            <div>
              <label for="lastName" class="label">Last Name</label>
              <input
                id="lastName"
                v-model="form.lastName"
                name="lastName"
                type="text"
                required
                class="input-field"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label for="email" class="label">Email Address</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="input-field"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label for="password" class="label">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="input-field"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label for="phone" class="label">Phone Number (Optional)</label>
            <input
              id="phone"
              v-model="form.phone"
              name="phone"
              type="tel"
              class="input-field"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label for="companyName" class="label">Company Name (Optional)</label>
            <input
              id="companyName"
              v-model="form.companyName"
              name="companyName"
              type="text"
              class="input-field"
              placeholder="Your Property Management Company"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="currency" class="label">Preferred Currency</label>
              <select
                id="currency"
                v-model="form.preferredCurrency"
                name="currency"
                class="input-field"
              >
                <option value="KES">KES (Kenyan Shilling)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
              </select>
            </div>
            <div>
              <label for="language" class="label">Language</label>
              <select
                id="language"
                v-model="form.language"
                name="language"
                class="input-field"
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex items-center">
          <input
            id="terms"
            v-model="form.agreeToTerms"
            name="terms"
            type="checkbox"
            required
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="terms" class="ml-2 block text-sm text-gray-900">
            I agree to the 
            <a href="#" class="text-blue-600 hover:text-blue-500">Terms of Service</a>
            and 
            <a href="#" class="text-blue-600 hover:text-blue-500">Privacy Policy</a>
          </label>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading || !form.agreeToTerms"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <UserPlusIcon class="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
            </span>
            <span v-if="!authStore.loading">Create Account</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </span>
          </button>
        </div>

        <div class="text-center">
          <span class="text-sm text-gray-600">
            Already have an account?
            <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </NuxtLink>
          </span>
        </div>
      </form>

      <!-- Error Alert -->
      <div v-if="error" class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <XCircleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Registration failed
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
import { BuildingOfficeIcon, UserPlusIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: false,
  auth: false
})

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  companyName: '',
  preferredCurrency: 'KES',
  language: 'en',
  agreeToTerms: false
})

const error = ref('')

const handleRegister = async () => {
  error.value = ''
  
  try {
    const registrationData = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      ...(form.phone && { phone: form.phone }),
      ...(form.companyName && { companyName: form.companyName }),
      preferredCurrency: form.preferredCurrency,
      language: form.language
    }
    
    await authStore.register(registrationData)
    toast.success('Account created successfully!', 'Welcome to TenantX.')
    await router.push('/dashboard')
  } catch (err) {
    error.value = err.data?.message || 'Registration failed. Please try again.'
    toast.error('Registration failed', error.value)
  }
}

// Redirect if already authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

