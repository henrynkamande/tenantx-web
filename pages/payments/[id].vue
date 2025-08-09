<template>
  <div>
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center">
            <button @click="navigateTo('/payments')" class="mr-4 p-2 text-gray-400 hover:text-gray-600">
              <ArrowLeftIcon class="h-6 w-6" />
            </button>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Payment Details</h2>
              <p class="text-gray-600">View payment information and history</p>
            </div>
          </div>
          <div class="flex space-x-3">
            <button @click="editPayment" class="btn-secondary">
              <PencilIcon class="h-5 w-5 mr-2" />
              Edit Payment
            </button>
            <button v-if="payment.status !== 'Completed'" @click="markAsPaid" class="btn-primary">
              <CheckIcon class="h-5 w-5 mr-2" />
              Mark as Paid
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <!-- Payment Details -->
        <div v-else-if="payment" class="space-y-6">
          <!-- Status Banner -->
          <div class="card">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <component :is="getStatusIcon(payment.status)" 
                    :class="getStatusIconClass(payment.status)" 
                    class="h-8 w-8" />
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Payment Status</h3>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1"
                        :class="getStatusClass(payment.status)">
                    {{ payment.status }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold text-gray-900">{{ $formatMoney(payment.amount) }}</div>
                <div class="text-sm text-gray-500">{{ payment.paymentType }}</div>
              </div>
            </div>
          </div>

          <!-- Payment Information Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Basic Information -->
            <div class="card">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Payment ID</dt>
                  <dd class="text-sm text-gray-900 font-mono">{{ payment._id }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Amount</dt>
                  <dd class="text-sm text-gray-900 font-semibold">{{ $formatMoney(payment.amount) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Payment Type</dt>
                  <dd class="text-sm text-gray-900">{{ payment.paymentType }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Due Date</dt>
                  <dd class="text-sm text-gray-900">{{ formatDate(payment.dueDate) }}</dd>
                </div>
                <div v-if="payment.paymentDate">
                  <dt class="text-sm font-medium text-gray-500">Payment Date</dt>
                  <dd class="text-sm text-gray-900">{{ formatDate(payment.paymentDate) }}</dd>
                </div>
                <div v-if="payment.paymentMethod">
                  <dt class="text-sm font-medium text-gray-500">Payment Method</dt>
                  <dd class="text-sm text-gray-900">{{ payment.paymentMethod }}</dd>
                </div>
                <div v-if="payment.referenceNumber">
                  <dt class="text-sm font-medium text-gray-500">Reference Number</dt>
                  <dd class="text-sm text-gray-900 font-mono">{{ payment.referenceNumber }}</dd>
                </div>
              </dl>
            </div>

            <!-- Tenant & Property Information -->
            <div class="card">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Tenant & Property</h3>
              <dl class="space-y-3">
                <div v-if="payment.tenantId">
                  <dt class="text-sm font-medium text-gray-500">Tenant</dt>
                  <dd class="text-sm text-gray-900">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span class="text-xs font-medium text-primary-600">
                            {{ payment.tenantId.personalInfo?.firstName?.charAt(0) }}{{ payment.tenantId.personalInfo?.lastName?.charAt(0) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-3">
                        <div class="font-medium">{{ payment.tenantId.personalInfo?.firstName }} {{ payment.tenantId.personalInfo?.lastName }}</div>
                        <div class="text-gray-500">{{ payment.tenantId.contactInfo?.email }}</div>
                      </div>
                    </div>
                  </dd>
                </div>
                <div v-if="payment.unitId">
                  <dt class="text-sm font-medium text-gray-500">Property</dt>
                  <dd class="text-sm text-gray-900">{{ payment.unitId.propertyId?.name || 'N/A' }}</dd>
                </div>
                <div v-if="payment.unitId">
                  <dt class="text-sm font-medium text-gray-500">Unit</dt>
                  <dd class="text-sm text-gray-900">Unit {{ payment.unitId.unitNumber || 'N/A' }}</dd>
                </div>
                <div v-if="payment.unitId?.propertyId?.address">
                  <dt class="text-sm font-medium text-gray-500">Address</dt>
                  <dd class="text-sm text-gray-900">
                    {{ payment.unitId.propertyId.address.street }}<br>
                    {{ payment.unitId.propertyId.address.city }}, {{ payment.unitId.propertyId.address.state }} {{ payment.unitId.propertyId.address.zipCode }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Default Information (if applicable) -->
          <div v-if="payment.isDefaulted" class="card border-orange-200 bg-orange-50">
            <h3 class="text-lg font-medium text-orange-900 mb-4">Default Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-orange-700">Defaulted Date</dt>
                  <dd class="text-sm text-orange-900">{{ formatDate(payment.defaultedDate) }}</dd>
                </div>
                <div v-if="payment.deadlineDate">
                  <dt class="text-sm font-medium text-orange-700">Deadline Date</dt>
                  <dd class="text-sm text-orange-900">{{ formatDate(payment.deadlineDate) }}</dd>
                </div>
              </dl>
              <dl class="space-y-3">
                <div v-if="payment.penaltyAmount">
                  <dt class="text-sm font-medium text-orange-700">Penalty Amount</dt>
                  <dd class="text-sm text-orange-900 font-semibold">{{ $formatMoney(payment.penaltyAmount) }}</dd>
                </div>
                <div v-if="payment.penaltyPercentage">
                  <dt class="text-sm font-medium text-orange-700">Penalty Rate</dt>
                  <dd class="text-sm text-orange-900">{{ payment.penaltyPercentage }}%</dd>
                </div>
              </dl>
            </div>
            <div v-if="payment.penaltyAmount" class="mt-4 p-3 bg-orange-100 rounded-md">
              <div class="text-sm text-orange-800">
                <strong>Total Amount Due:</strong> {{ $formatMoney(payment.amount + payment.penaltyAmount) }}
                ({{ $formatMoney(payment.amount) }} + {{ $formatMoney(payment.penaltyAmount) }} penalty)
              </div>
            </div>
          </div>

          <!-- Description -->
          <div v-if="payment.description" class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Description</h3>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ payment.description }}</p>
          </div>

          <!-- Payment History -->
          <div v-if="payment.partialPayments && payment.partialPayments.length > 0" class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="partial in payment.partialPayments" :key="partial._id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(partial.paymentDate) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ $formatMoney(partial.amount) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ partial.paymentMethod || 'N/A' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {{ partial.transactionId || 'N/A' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Metadata -->
          <div class="card bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900 mb-4">System Information</h3>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Created</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(payment.createdAt) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(payment.updatedAt) }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="text-center py-12">
          <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Payment not found</h3>
          <p class="mt-1 text-sm text-gray-500">The payment you're looking for doesn't exist or you don't have access to it.</p>
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
  PencilIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
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
const payment = ref(null)

// Fetch payment details
const fetchPayment = async () => {
  try {
    loading.value = true
    const response = await $fetch(`/api/payments/${paymentId}`, {
      headers: getAuthHeader()
    })
    
    if (response.success) {
      payment.value = response.data
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

// Edit payment
const editPayment = () => {
  navigateTo(`/payments/edit/${paymentId}`)
}

// Mark payment as paid
const markAsPaid = async () => {
  if (!confirm('Mark this payment as completed?')) return
  
  try {
    await $fetch(`/api/payments/${paymentId}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: {
        status: 'Completed',
        paymentDate: new Date().toISOString()
      }
    })
    await fetchPayment() // Refresh the payment details
    
    // Show success notification
    useNuxtApp().$toast?.success('Payment marked as completed')
  } catch (error) {
    console.error('Failed to mark payment as paid:', error)
    useNuxtApp().$toast?.error('Failed to update payment status')
  }
}

// Get status class
const getStatusClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'Overdue':
      return 'bg-red-100 text-red-800'
    case 'Partial':
      return 'bg-orange-100 text-orange-800'
    case 'Defaulted':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get status icon
const getStatusIcon = (status) => {
  switch (status) {
    case 'Completed':
      return CheckCircleIcon
    case 'Pending':
      return ClockIcon
    case 'Overdue':
    case 'Defaulted':
      return XCircleIcon
    case 'Partial':
      return ExclamationCircleIcon
    default:
      return CurrencyDollarIcon
  }
}

// Get status icon class
const getStatusIconClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'text-green-600'
    case 'Pending':
      return 'text-yellow-600'
    case 'Overdue':
    case 'Defaulted':
      return 'text-red-600'
    case 'Partial':
      return 'text-orange-600'
    default:
      return 'text-gray-600'
  }
}

// Format date
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fetch data on mount
onMounted(() => {
  fetchPayment()
})
</script>
