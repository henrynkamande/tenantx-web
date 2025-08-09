<template>
  <div>
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center">
            <button @click="navigateTo(`/payments/${paymentId}`)" class="mr-4 p-2 text-gray-400 hover:text-gray-600">
              <ArrowLeftIcon class="h-6 w-6" />
            </button>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Edit Payment</h2>
              <p class="text-gray-600">Update payment information and details</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <!-- Edit Form -->
        <div v-else-if="payment" class="space-y-6">
          <form @submit.prevent="updatePayment" class="space-y-6">
            <!-- Basic Information -->
            <div class="card">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="amount" class="block text-sm font-medium text-gray-700">Amount</label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      id="amount"
                      v-model="formData.amount"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      class="input-field pl-7"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label for="paymentType" class="block text-sm font-medium text-gray-700">Payment Type</label>
                  <select
                    id="paymentType"
                    v-model="formData.paymentType"
                    required
                    class="input-field"
                  >
                    <option value="">Select Payment Type</option>
                    <option value="Rent">Rent</option>
                    <option value="Security Deposit">Security Deposit</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Late Fee">Late Fee</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label for="dueDate" class="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    id="dueDate"
                    v-model="formData.dueDate"
                    type="date"
                    required
                    class="input-field"
                  />
                </div>

                <div>
                  <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    id="status"
                    v-model="formData.status"
                    required
                    class="input-field"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Partial">Partial</option>
                    <option value="Defaulted">Defaulted</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Payment Details -->
            <div class="card">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="paymentDate" class="block text-sm font-medium text-gray-700">Payment Date</label>
                  <input
                    id="paymentDate"
                    v-model="formData.paymentDate"
                    type="datetime-local"
                    class="input-field"
                  />
                </div>

                <div>
                  <label for="paymentMethod" class="block text-sm font-medium text-gray-700">Payment Method</label>
                  <select
                    id="paymentMethod"
                    v-model="formData.paymentMethod"
                    class="input-field"
                  >
                    <option value="">Select Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Online Payment">Online Payment</option>
                    <option value="Money Order">Money Order</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label for="referenceNumber" class="block text-sm font-medium text-gray-700">Reference Number</label>
                  <input
                    id="referenceNumber"
                    v-model="formData.referenceNumber"
                    type="text"
                    class="input-field"
                    placeholder="Enter reference number"
                  />
                </div>
              </div>
            </div>

            <!-- Tenant & Property (Read-only info) -->
            <div class="card bg-gray-50">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Tenant & Property Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tenant</label>
                  <div class="mt-2 flex items-center">
                    <div class="flex-shrink-0 h-8 w-8">
                      <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span class="text-xs font-medium text-primary-600">
                          {{ payment.tenantId?.personalInfo?.firstName?.charAt(0) }}{{ payment.tenantId?.personalInfo?.lastName?.charAt(0) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">
                        {{ payment.tenantId?.personalInfo?.firstName }} {{ payment.tenantId?.personalInfo?.lastName }}
                      </div>
                      <div class="text-sm text-gray-500">{{ payment.tenantId?.contactInfo?.email }}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Property & Unit</label>
                  <div class="mt-2">
                    <div class="text-sm font-medium text-gray-900">{{ payment.unitId?.propertyId?.name || 'N/A' }}</div>
                    <div class="text-sm text-gray-500">Unit {{ payment.unitId?.unitNumber || 'N/A' }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Default Information (if applicable) -->
            <div v-if="payment.isDefaulted" class="card border-orange-200 bg-orange-50">
              <h3 class="text-lg font-medium text-orange-900 mb-4">Default Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="penaltyAmount" class="block text-sm font-medium text-orange-700">Penalty Amount</label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="text-orange-500 sm:text-sm">$</span>
                    </div>
                    <input
                      id="penaltyAmount"
                      v-model="formData.penaltyAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      class="input-field pl-7 border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label for="penaltyPercentage" class="block text-sm font-medium text-orange-700">Penalty Percentage</label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <input
                      id="penaltyPercentage"
                      v-model="formData.penaltyPercentage"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      class="input-field border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="0.0"
                    />
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span class="text-orange-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label for="defaultedDate" class="block text-sm font-medium text-orange-700">Defaulted Date</label>
                  <input
                    id="defaultedDate"
                    v-model="formData.defaultedDate"
                    type="datetime-local"
                    class="input-field border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label for="deadlineDate" class="block text-sm font-medium text-orange-700">Deadline Date</label>
                  <input
                    id="deadlineDate"
                    v-model="formData.deadlineDate"
                    type="datetime-local"
                    class="input-field border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="card">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <textarea
                v-model="formData.notes"
                rows="4"
                class="input-field"
                placeholder="Add any additional notes about this payment..."
              ></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="navigateTo(`/payments/${paymentId}`)"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="btn-primary"
              >
                <div v-if="saving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                  <div class="rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
                {{ saving ? 'Saving...' : 'Update Payment' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Error State -->
        <div v-else class="text-center py-12">
          <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Payment not found</h3>
          <p class="mt-1 text-sm text-gray-500">The payment you're trying to edit doesn't exist or you don't have access to it.</p>
          <div class="mt-6">
            <button @click="navigateTo('/payments')" class="btn-primary">
              Back to Payments
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Get payment ID from route
const route = useRoute()
const paymentId = route.params.id

// Get auth store
const { getAuthHeader } = useAuth()

// Data and state
const loading = ref(true)
const saving = ref(false)
const payment = ref(null)
const formData = ref({
  amount: '',
  paymentType: '',
  dueDate: '',
  status: '',
  paymentDate: '',
  paymentMethod: '',
  referenceNumber: '',
  penaltyAmount: '',
  penaltyPercentage: '',
  defaultedDate: '',
  deadlineDate: '',
  notes: ''
})

// Fetch payment details
const fetchPayment = async () => {
  try {
    loading.value = true
    const response = await $fetch(`/api/payments/${paymentId}`, {
      headers: getAuthHeader()
    })
    
    if (response.success) {
      payment.value = response.data
      populateForm(response.data)
    } else {
      payment.value = null
    }
  } catch (error) {
    console.error('Failed to fetch payment:', error)
    payment.value = null
  } finally {
    loading.value = false
  }
}

// Populate form with payment data
const populateForm = (paymentData) => {
  formData.value = {
    amount: paymentData.amount || '',
    paymentType: paymentData.paymentType || '',
    dueDate: paymentData.dueDate ? formatDateForInput(paymentData.dueDate) : '',
    status: paymentData.status || '',
    paymentDate: paymentData.paymentDate ? formatDatetimeForInput(paymentData.paymentDate) : '',
    paymentMethod: paymentData.paymentMethod || '',
    referenceNumber: paymentData.referenceNumber || '',
    penaltyAmount: paymentData.penaltyAmount || '',
    penaltyPercentage: paymentData.penaltyPercentage || '',
    defaultedDate: paymentData.defaultedDate ? formatDatetimeForInput(paymentData.defaultedDate) : '',
    deadlineDate: paymentData.deadlineDate ? formatDatetimeForInput(paymentData.deadlineDate) : '',
    notes: paymentData.notes || ''
  }
}

// Update payment
const updatePayment = async () => {
  try {
    saving.value = true
    
    // Prepare update data
    const updateData = {
      amount: parseFloat(formData.value.amount),
      paymentType: formData.value.paymentType,
      dueDate: formData.value.dueDate,
      status: formData.value.status,
      paymentMethod: formData.value.paymentMethod || null,
      referenceNumber: formData.value.referenceNumber || null,
      notes: formData.value.notes || null
    }

    // Add payment date if provided
    if (formData.value.paymentDate) {
      updateData.paymentDate = new Date(formData.value.paymentDate).toISOString()
    }

    // Add default-related fields if applicable
    if (payment.value.isDefaulted) {
      updateData.penaltyAmount = formData.value.penaltyAmount ? parseFloat(formData.value.penaltyAmount) : null
      updateData.penaltyPercentage = formData.value.penaltyPercentage ? parseFloat(formData.value.penaltyPercentage) : null
      
      if (formData.value.defaultedDate) {
        updateData.defaultedDate = new Date(formData.value.defaultedDate).toISOString()
      }
      if (formData.value.deadlineDate) {
        updateData.deadlineDate = new Date(formData.value.deadlineDate).toISOString()
      }
    }

    const response = await $fetch(`/api/payments/${paymentId}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: updateData
    })

    if (response.success) {
      useNuxtApp().$toast?.success('Payment updated successfully')
      navigateTo(`/payments/${paymentId}`)
    } else {
      useNuxtApp().$toast?.error('Failed to update payment')
    }
  } catch (error) {
    console.error('Failed to update payment:', error)
    useNuxtApp().$toast?.error('Failed to update payment')
  } finally {
    saving.value = false
  }
}

// Format date for input field (YYYY-MM-DD)
const formatDateForInput = (date) => {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

// Format datetime for input field (YYYY-MM-DDTHH:MM)
const formatDatetimeForInput = (date) => {
  if (!date) return ''
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset()) // Adjust for timezone
  return d.toISOString().slice(0, 16)
}

// Fetch data on mount
onMounted(() => {
  fetchPayment()
})
</script>
