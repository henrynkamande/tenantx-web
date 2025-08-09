<template>
  <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Record Payment</h2>
            <p class="text-gray-600">Record a new rent payment</p>
          </div>
          <NuxtLink to="/payments" class="btn-outline">
            <ArrowLeftIcon class="h-4 w-4 mr-2" />
            Back to Payments
          </NuxtLink>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Payment Information -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Payment Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="label">Property *</label>
                <select
                  v-model="form.propertyId"
                  required
                  class="input-field"
                  @change="onPropertyChange"
                >
                  <option value="">Select a property</option>
                  <option v-for="property in properties" :key="property._id" :value="property._id">
                    {{ property.name }}
                  </option>
                </select>
                <p v-if="!form.propertyId" class="text-sm text-gray-500 mt-1">Select a property first</p>
              </div>

              <div>
                <label class="label">Tenant *</label>
                <select
                  v-model="form.tenantId"
                  required
                  class="input-field"
                  @change="onTenantChange"
                  :disabled="!form.propertyId"
                >
                  <option value="">{{ form.propertyId ? 'Select a tenant' : 'Select property first' }}</option>
                  <option v-for="tenant in filteredTenants" :key="tenant._id" :value="tenant._id">
                    {{ tenant.personalInfo?.firstName }} {{ tenant.personalInfo?.lastName }}
                    <span v-if="tenant.unitId?.unitNumber" class="text-gray-500"> - Unit {{ tenant.unitId.unitNumber }}</span>
                  </option>
                </select>
                <p v-if="form.propertyId && filteredTenants.length === 0" class="text-sm text-orange-600 mt-1">
                  No tenants found for selected property
                </p>
              </div>

              <div>
                <label class="label">Unit</label>
                <input
                  :value="selectedTenant?.unitId?.unitNumber || 'N/A'"
                  type="text"
                  disabled
                  class="input-field bg-gray-100"
                  :placeholder="form.tenantId ? 'Unit information' : 'Select tenant first'"
                />
                <p v-if="selectedTenant?.unitId" class="text-sm text-gray-500 mt-1">
                  {{ selectedProperty?.name }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

              <div>
                <label class="label">Payment Amount ({{ currencySymbol }}) *</label>
                <input
                  v-model.number="form.amount"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  class="input-field"
                  :placeholder="`0.00 ${currencySymbol}`"
                />
                <div v-if="form.paymentType === 'Rent' && selectedTenant?.unitId?.rentAmount" class="mt-2">
                  <div class="flex items-center justify-between text-sm text-gray-600">
                    <span>Expected rent amount:</span>
                    <span class="font-medium">{{ currencySymbol }}{{ expectedRentAmount }}</span>
                  </div>
                  <div v-if="totalPaidForMonth > 0" class="mt-1">
                    <div class="flex items-center justify-between text-sm text-gray-600">
                      <span>Already paid this month:</span>
                      <span class="font-medium">{{ currencySymbol }}{{ totalPaidForMonth }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm text-gray-600">
                      <span>Remaining balance:</span>
                      <span class="font-medium">{{ currencySymbol }}{{ remainingBalance }}</span>
                    </div>
                  </div>
                  <div v-if="isOverpayment" class="mt-2 p-2 bg-red-100 border border-red-200 rounded-md">
                    <div class="flex items-center">
                      <svg class="h-4 w-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                      <span class="text-sm text-red-800">Payment exceeds remaining balance of {{ currencySymbol }}{{ remainingBalance }}</span>
                    </div>
                  </div>
                  <div v-else-if="form.status === 'Partial' && form.amount && form.amount < expectedRentAmount" class="mt-1">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-orange-600">Outstanding balance:</span>
                      <span class="font-medium text-orange-600">{{ currencySymbol }}{{ outstandingBalance }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label class="label">Payment Type *</label>
                <select
                  v-model="form.paymentType"
                  required
                  class="input-field"
                >
                  <option value="Rent">Rent</option>
                  <option value="Security Deposit">Security Deposit</option>
                  <option value="Late Fee">Late Fee</option>
                  <option value="Pet Fee">Pet Fee</option>
                  <option value="Utility">Utility</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div v-if="form.paymentType === 'Rent'">
                <label class="label">Month For *</label>
                <select
                  v-model="form.monthFor"
                  required
                  class="input-field"
                >
                  <option value="">Select month</option>
                  <option v-for="month in availableMonths" :key="month.value" :value="month.value">
                    {{ month.label }}
                  </option>
                </select>
                <p class="text-sm text-gray-500 mt-1">Select the month this rent payment covers</p>
              </div>

              <div>
                <label class="label">Due Date *</label>
                <input
                  v-model="form.dueDate"
                  type="date"
                  required
                  class="input-field"
                />
              </div>

              <div>
                <label class="label">Payment Date</label>
                <input
                  v-model="form.paymentDate"
                  type="date"
                  class="input-field"
                />
              </div>

              <div>
                <label class="label">Payment Status *</label>
                <select
                  v-model="form.status"
                  required
                  class="input-field"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>

              <div>
                <label class="label">Payment Method</label>
                <select
                  v-model="form.paymentMethod"
                  class="input-field"
                >
                  <option value="">Select method</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Online Payment">Online Payment</option>
                  <option value="Money Order">Money Order</option>
                </select>
              </div>
            </div>

            <div v-if="form.paymentMethod === 'Check'" class="mt-6">
              <label class="label">Check Number</label>
              <input
                v-model="form.checkNumber"
                type="text"
                class="input-field"
                placeholder="Enter check number"
              />
            </div>

            <div v-if="form.paymentMethod === 'Bank Transfer'" class="mt-6">
              <label class="label">Transaction ID</label>
              <input
                v-model="form.transactionId"
                type="text"
                class="input-field"
                placeholder="Enter transaction ID"
              />
            </div>
          </div>

          <!-- Partial Payment Information -->
          <div v-if="form.status === 'Partial' && form.paymentType === 'Rent'" class="card bg-orange-50 border-orange-200">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Partial Payment Information</h3>
            
            <div class="bg-white p-4 rounded-lg border border-orange-200">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div class="text-center">
                  <div class="text-gray-600 mb-1">Expected Amount</div>
                  <div class="font-semibold text-lg text-gray-900">{{ currencySymbol }}{{ expectedRentAmount }}</div>
                </div>
                <div class="text-center">
                  <div class="text-gray-600 mb-1">Payment Amount</div>
                  <div class="font-semibold text-lg text-blue-600">{{ currencySymbol }}{{ form.amount || 0 }}</div>
                </div>
                <div class="text-center">
                  <div class="text-gray-600 mb-1">Outstanding Balance</div>
                  <div class="font-semibold text-lg text-orange-600">{{ currencySymbol }}{{ outstandingBalance }}</div>
                </div>
              </div>
              
              <div v-if="outstandingBalance > 0" class="mt-4 p-3 bg-orange-100 rounded-md">
                <div class="flex items-start">
                  <svg class="flex-shrink-0 h-5 w-5 text-orange-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <div class="text-sm text-orange-800">
                    <p class="font-medium">Partial Payment Notice</p>
                    <p class="mt-1">This payment is less than the expected rent amount. The outstanding balance of {{ currencySymbol }}{{ outstandingBalance }} will need to be collected separately.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Late Fee Information -->
          <div v-if="form.status === 'Overdue'" class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Late Fee Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="label">Late Fee Amount ({{ currencySymbol }})</label>
                <input
                  v-model.number="form.lateFee"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field"
                  :placeholder="`0.00 ${currencySymbol}`"
                />
              </div>

              <div>
                <label class="label">Days Overdue</label>
                <input
                  v-model.number="form.daysOverdue"
                  type="number"
                  min="0"
                  class="input-field"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Additional Notes</h3>
            
            <div>
              <label class="label">Notes</label>
              <textarea
                v-model="form.notes"
                rows="4"
                class="input-field"
                placeholder="Any additional notes about the payment..."
              ></textarea>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-4">
            <NuxtLink to="/payments" class="btn-outline">
              Cancel
            </NuxtLink>
            <button
              type="submit"
              :disabled="loading || isOverpayment"
              class="btn-primary"
              :class="{ 'opacity-50 cursor-not-allowed': isOverpayment }"
            >
              <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ loading ? 'Recording...' : 'Record Payment' }}
            </button>
          </div>
        </form>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon
} from '@heroicons/vue/24/outline'
import { useToast } from '~/composables/useToast'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { currencySymbol } = useCurrency()
const toast = useToast()



// Get auth store for API calls
const { getAuthHeader } = useAuth()

// Form state
const loading = ref(false)
const properties = ref([])
const tenants = ref([])
const existingPayments = ref([])
const form = reactive({
  propertyId: '',
  tenantId: '',
  amount: null,
  paymentType: 'Rent',
  monthFor: '',
  dueDate: '',
  paymentDate: '',
  status: 'Pending',
  paymentMethod: '',
  checkNumber: '',
  transactionId: '',
  lateFee: null,
  daysOverdue: null,
  notes: ''
})

// Computed
const selectedProperty = computed(() => {
  return properties.value.find(p => p._id === form.propertyId)
})

const selectedTenant = computed(() => {
  return tenants.value.find(t => t._id === form.tenantId)
})

// Filter tenants by selected property
const filteredTenants = computed(() => {
  if (!form.propertyId) return []
  return tenants.value.filter(tenant => 
    tenant.unitId?.propertyId?._id === form.propertyId
  )
})

const expectedRentAmount = computed(() => {
  return selectedTenant.value?.unitId?.rentAmount || 0
})

// Calculate total already paid for the selected month
const totalPaidForMonth = computed(() => {
  if (!form.tenantId || !form.monthFor || form.paymentType !== 'Rent') return 0
  return existingPayments.value
    .filter(payment => 
      payment.tenantId === form.tenantId && 
      payment.monthFor === form.monthFor &&
      payment.paymentType === 'Rent' &&
      ['Completed', 'Partial'].includes(payment.status)
    )
    .reduce((sum, payment) => sum + payment.amount, 0)
})

// Calculate remaining balance that can be paid
const remainingBalance = computed(() => {
  if (!expectedRentAmount.value) return 0
  return Math.max(0, expectedRentAmount.value - totalPaidForMonth.value)
})

const outstandingBalance = computed(() => {
  if (!form.amount || !expectedRentAmount.value) return 0
  return Math.max(0, expectedRentAmount.value - (totalPaidForMonth.value + form.amount))
})

// Check if payment would exceed remaining balance
const isOverpayment = computed(() => {
  if (form.paymentType !== 'Rent' || !form.amount || !expectedRentAmount.value) return false
  return (totalPaidForMonth.value + form.amount) > expectedRentAmount.value
})

// Generate available months (previous 3 months, current month, and next 6 months)
const availableMonths = computed(() => {
  const months = []
  const today = new Date()
  
  // Start from 3 months ago
  for (let i = -3; i <= 6; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    
    months.push({ value, label })
  }
  
  return months
})

// Fetch properties on mount
const fetchProperties = async () => {
  try {
    const response = await $fetch('/api/properties', {
      headers: getAuthHeader(),
      query: { limit: 100 } // Get more properties without pagination
    })
    if (response.success) {
      properties.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch properties:', error)
  }
}

// Fetch tenants on mount
const fetchTenants = async () => {
  try {
    const response = await $fetch('/api/tenants', {
      headers: getAuthHeader(),
      query: { limit: 1000 } // Get more tenants without pagination
    })
    if (response.success) {
      tenants.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch tenants:', error)
  }
}

// Fetch existing payments for validation
const fetchExistingPayments = async () => {
  try {
    const response = await $fetch('/api/payments')
    if (response.success) {
      existingPayments.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch existing payments:', error)
  }
}

// Handle property selection
const onPropertyChange = () => {
  // Clear tenant selection when property changes
  form.tenantId = ''
  form.amount = null
}

// Handle tenant selection
const onTenantChange = () => {
  if (selectedTenant.value) {
    // Auto-fill rent amount if available
    form.amount = selectedTenant.value.unitId?.rentAmount || null
  }
  // Fetch existing payments when tenant changes
  fetchExistingPayments()
}

// Watch for month changes to refetch payments
watch(() => form.monthFor, () => {
  if (form.monthFor) {
    fetchExistingPayments()
  }
})

// Handle form submission
const handleSubmit = async () => {
  try {
    loading.value = true
    
    // Client-side validation before submitting
    if (isOverpayment.value) {
      toast.error('Error', `Cannot record payment: Amount exceeds remaining balance of ${currencySymbol.value}${remainingBalance.value}`)
      return
    }
    
    if (form.paymentType === 'Rent' && !form.monthFor) {
      toast.error('Error', 'Please select the month this rent payment covers')
      return
    }
    
    if (!selectedTenant.value) {
      toast.error('Error', 'Please select a tenant before recording the payment')
      return
    }
    
    // Prepare payload without propertyId (backend doesn't expect it)
    const { propertyId, ...paymentData } = form
    
    const response = await $fetch('/api/payments', {
      method: 'POST',
      headers: getAuthHeader(),
      body: {
        ...paymentData,
        unitId: selectedTenant.value?.unitId?._id
      }
    })

    if (response.success) {
      const tenantName = selectedTenant.value ? `${selectedTenant.value.personalInfo.firstName} ${selectedTenant.value.personalInfo.lastName}` : 'tenant'
      toast.success('Payment for ${tenantName} recorded successfully!')
      await navigateTo('/payments')
    }
  } catch (error) {
    console.error('Failed to record payment:', error)
    
    // Handle different types of errors with specific messages
    let errorMessage = 'Failed to record payment. Please try again.'
    
    if (error.data?.statusMessage) {
      errorMessage = error.data.statusMessage
    } else if (error.message) {
      errorMessage = error.message
    }
    
    // Provide actionable feedback based on error type
    if (errorMessage.includes('exceeds remaining balance')) {
      const match = errorMessage.match(/Maximum allowed: ([\d.]+)/)
      const maxAmount = match ? match[1] : remainingBalance.value
      errorMessage += `. Please enter an amount of ${currencySymbol.value}${maxAmount} or less.`
    } else if (errorMessage.includes('Unit not found')) {
      errorMessage = 'The selected tenant\'s unit could not be found. Please contact support or try selecting a different tenant.'
    } else if (errorMessage.includes('Month for rent payment must be in YYYY-MM format')) {
      errorMessage = 'Invalid month format. Please select a valid month from the dropdown.'
    } else if (errorMessage.includes('validation failed')) {
      errorMessage = 'Payment information is invalid. Please check all required fields and try again.'
    } else if (errorMessage.includes('required')) {
      errorMessage = 'Please fill in all required fields marked with an asterisk (*).'
    }
    
    toast.error('Error', errorMessage)
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => {
  fetchProperties()
  fetchTenants()
  fetchExistingPayments()
  
  // Set default month to current month
  const currentDate = new Date()
  form.monthFor = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  
  // Set default due date to next month's 1st
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  nextMonth.setDate(1)
  form.dueDate = nextMonth.toISOString().split('T')[0]
})
</script>

