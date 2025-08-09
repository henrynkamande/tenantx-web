<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Defaulted Rent Payments</h1>
            <p class="text-gray-600 mt-2">
              Manage rent payments that have exceeded their deadline and incurred penalties
            </p>
          </div>
          <div class="flex space-x-4">
            <button
              @click="checkForDefaults"
              :disabled="checkingDefaults"
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {{ checkingDefaults ? 'Checking...' : 'Check for New Defaults' }}
            </button>
            <button
              @click="refreshData"
              :disabled="loading"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {{ loading ? 'Refreshing...' : 'Refresh' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ExclamationTriangleIcon class="h-8 w-8 text-red-600" />
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500">Total Defaulted</p>
              <p class="text-2xl font-bold text-gray-900">{{ defaultedPayments?.length || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CurrencyDollarIcon class="h-8 w-8 text-orange-600" />
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500">Total Amount</p>
              <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(totalDefaultedAmount) }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ExclamationTriangleIcon class="h-8 w-8 text-yellow-600" />
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500">Total Penalties</p>
              <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(totalPenalties) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Defaulted Payments Table -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Defaulted Payments</h3>
          
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          
          <div v-else-if="!defaultedPayments?.length" class="text-center py-12">
            <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Defaulted Payments</h3>
            <p class="text-gray-500">All rent payments are up to date.</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant & Unit
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Penalty
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Due
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Defaulted Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="payment in defaultedPayments" :key="payment._id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ payment.tenantId?.firstName }} {{ payment.tenantId?.lastName }}
                      </div>
                      <div class="text-sm text-gray-500">
                        Unit {{ payment.unitId?.unitNumber }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ $formatMoney(payment.amount) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-red-600">
                      {{ $formatMoney(payment.penaltyAmount || 0) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ payment.penaltyPercentage || 0 }}%
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-bold text-gray-900">
                      {{ $formatMoney((payment.amount || 0) + (payment.penaltyAmount || 0)) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ formatDate(payment.dueDate) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ formatDate(payment.defaultedDate) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      @click="initiatePayment(payment)"
                      class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm mr-2"
                    >
                      Make Payment
                    </button>
                    <button
                      @click="viewDetails(payment)"
                      class="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center mb-4">
            <CurrencyDollarIcon class="h-6 w-6 text-green-600 mr-2" />
            <h3 class="text-lg font-medium text-gray-900">Clear Defaulted Payment</h3>
          </div>
          
          <div v-if="selectedPayment" class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium text-gray-500">Tenant:</span>
                  <p class="text-gray-900">{{ selectedPayment.tenantId?.firstName }} {{ selectedPayment.tenantId?.lastName }}</p>
                </div>
                <div>
                  <span class="font-medium text-gray-500">Unit:</span>
                  <p class="text-gray-900">{{ selectedPayment.unitId?.unitNumber }}</p>
                </div>
                <div>
                  <span class="font-medium text-gray-500">Rent Amount:</span>
                  <p class="text-gray-900">{{ $formatMoney(selectedPayment.amount) }}</p>
                </div>
                <div>
                  <span class="font-medium text-gray-500">Penalty:</span>
                  <p class="text-red-600">{{ $formatMoney(selectedPayment.penaltyAmount || 0) }}</p>
                </div>
                <div class="col-span-2">
                  <span class="font-medium text-gray-500">Total Amount Due:</span>
                  <p class="text-lg font-bold text-gray-900">
                    {{ $formatMoney((selectedPayment.amount || 0) + (selectedPayment.penaltyAmount || 0)) }}
                  </p>
                </div>
              </div>
            </div>

            <form @submit.prevent="processPayment" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Payment Amount</label>
                <input
                  v-model.number="paymentForm.amount"
                  type="number"
                  step="0.01"
                  :min="0"
                  :max="(selectedPayment.amount || 0) + (selectedPayment.penaltyAmount || 0)"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  v-model="paymentForm.paymentMethod"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select payment method</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Online Payment">Online Payment</option>
                  <option value="Money Order">Money Order</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Reference Number (Optional)</label>
                <input
                  v-model="paymentForm.referenceNumber"
                  type="text"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea
                  v-model="paymentForm.description"
                  rows="3"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="closePaymentModal"
                  class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="processingPayment"
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
                >
                  {{ processingPayment ? 'Processing...' : 'Process Payment' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  ExclamationTriangleIcon, 
  CurrencyDollarIcon 
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { getAuthHeader } = useAuth()

// Data and state
const loading = ref(true)
const checkingDefaults = ref(false)
const defaultedPayments = ref([])
const showPaymentModal = ref(false)
const selectedPayment = ref(null)
const processingPayment = ref(false)

// Payment form
const paymentForm = ref({
  amount: 0,
  paymentMethod: '',
  referenceNumber: '',
  description: ''
})

// Computed properties
const totalDefaultedAmount = computed(() => {
  return defaultedPayments.value.reduce((total, payment) => total + (payment.amount || 0), 0)
})

const totalPenalties = computed(() => {
  return defaultedPayments.value.reduce((total, payment) => total + (payment.penaltyAmount || 0), 0)
})

// Methods
const fetchDefaultedPayments = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/payments', {
      headers: getAuthHeader(),
      query: { status: 'Defaulted' }
    })
    
    if (response.success) {
      defaultedPayments.value = response.data.filter(payment => payment.isDefaulted)
    }
  } catch (error) {
    console.error('Error fetching defaulted payments:', error)
    // Handle error appropriately
  } finally {
    loading.value = false
  }
}

const checkForDefaults = async () => {
  try {
    checkingDefaults.value = true
    const response = await $fetch('/api/payments/check-defaults', {
      method: 'POST',
      headers: getAuthHeader()
    })
    
    if (response.success) {
      // Refresh the data
      await fetchDefaultedPayments()
    }
  } catch (error) {
    console.error('Error checking for defaults:', error)
  } finally {
    checkingDefaults.value = false
  }
}

const refreshData = async () => {
  await fetchDefaultedPayments()
}

const initiatePayment = (payment) => {
  selectedPayment.value = payment
  paymentForm.value = {
    amount: (payment.amount || 0) + (payment.penaltyAmount || 0),
    paymentMethod: '',
    referenceNumber: '',
    description: `Payment for defaulted rent - Unit ${payment.unitId?.unitNumber}`
  }
  showPaymentModal.value = true
}

const closePaymentModal = () => {
  showPaymentModal.value = false
  selectedPayment.value = null
  paymentForm.value = {
    amount: 0,
    paymentMethod: '',
    referenceNumber: '',
    description: ''
  }
}

const processPayment = async () => {
  try {
    processingPayment.value = true
    
    // Create a new payment record to clear the defaulted payment
    const response = await $fetch('/api/payments', {
      method: 'POST',
      headers: getAuthHeader(),
      body: {
        unitId: selectedPayment.value.unitId._id,
        tenantId: selectedPayment.value.tenantId._id,
        amount: paymentForm.value.amount,
        paymentMethod: paymentForm.value.paymentMethod,
        referenceNumber: paymentForm.value.referenceNumber,
        description: paymentForm.value.description,
        paymentType: 'Rent',
        status: 'Completed',
        paymentDate: new Date().toISOString(),
        monthFor: selectedPayment.value.monthFor,
        clearingDefaultedPayment: selectedPayment.value._id
      }
    })
    
    if (response.success) {
      // Update the original defaulted payment status
      await $fetch(`/api/payments/${selectedPayment.value._id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: {
          status: 'Completed',
          isDefaulted: false,
          clearedDate: new Date().toISOString(),
          clearedAmount: paymentForm.value.amount
        }
      })
      
      // Refresh data and close modal
      await fetchDefaultedPayments()
      closePaymentModal()
      
      // Show success message
      alert('Payment processed successfully!')
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    alert('Error processing payment. Please try again.')
  } finally {
    processingPayment.value = false
  }
}

const viewDetails = (payment) => {
  // Navigate to payment details or show details modal
  navigateTo(`/payments/${payment._id}`)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Fetch data on mount
onMounted(() => {
  fetchDefaultedPayments()
})
</script>
