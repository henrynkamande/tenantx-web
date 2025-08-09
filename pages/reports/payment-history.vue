<template>
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Payment History Report</h2>
          <p class="text-gray-600">Track and analyze tenant payment history and trends</p>
        </div>
        <div class="flex space-x-3">
          <button @click="exportToCSV" class="btn-outline">
            <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <NuxtLink to="/reports" class="btn-outline">
            <ArrowLeftIcon class="h-4 w-4 mr-2" />
            Back to Reports
          </NuxtLink>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Property</label>
              <select v-model="filters.propertyId" class="input">
                <option value="">All Properties</option>
                <option v-for="property in properties" :key="property._id" :value="property._id">
                  {{ property.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tenant</label>
              <select v-model="filters.tenantId" class="input">
                <option value="">All Tenants</option>
                <option v-for="tenant in tenants" :key="tenant._id" :value="tenant._id">
                  {{ tenant.firstName }} {{ tenant.lastName }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <select v-model="filters.status" class="input">
                <option value="">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div class="flex items-end">
              <button @click="applyFilters" class="btn-primary">
                <MagnifyingGlassIcon class="h-4 w-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Payment History Table -->
      <div v-else class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Payment History</h3>

          <div v-if="paymentHistory.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="payment in paymentHistory" :key="payment._id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(payment.paymentDate) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ payment.tenant?.firstName }} {{ payment.tenant?.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">{{ payment.tenant?.email }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ payment.property?.name }}</div>
                    <div class="text-sm text-gray-500">{{ payment.property?.address }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ payment.unit?.unitNumber || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ $formatMoney(payment.amount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="capitalize">{{ payment.type || 'Rent' }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="capitalize">{{ payment.paymentMethod || 'N/A' }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="{
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full': true,
                      'bg-green-100 text-green-800': payment.status === 'paid',
                      'bg-yellow-100 text-yellow-800': payment.status === 'pending',
                      'bg-red-100 text-red-800': payment.status === 'overdue',
                      'bg-gray-100 text-gray-800': payment.status === 'failed'
                    }">
                      {{ payment.status || 'Unknown' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click="viewPaymentDetails(payment)"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-8">
            <CreditCardIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No Payment History</h3>
            <p class="mt-1 text-sm text-gray-500">No payment records found for the selected criteria.</p>
          </div>
        </div>
      </div>

      <!-- Payment Summary -->
      <div v-if="paymentHistory.length > 0" class="mt-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <CurrencyDollarIcon class="h-8 w-8 text-green-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Collected</p>
                  <p class="text-2xl font-bold text-gray-900">
                    {{ $formatMoney(summary.totalCollected) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <ClockIcon class="h-8 w-8 text-yellow-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Pending</p>
                  <p class="text-2xl font-bold text-gray-900">
                    {{ $formatMoney(summary.totalPending) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <ExclamationTriangleIcon class="h-8 w-8 text-red-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Overdue</p>
                  <p class="text-2xl font-bold text-gray-900">
                    {{ $formatMoney(summary.totalOverdue) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <ChartBarIcon class="h-8 w-8 text-blue-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Collection Rate</p>
                  <p class="text-2xl font-bold text-gray-900">{{ summary.collectionRate }}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Payment Details Modal -->
  <div v-if="selectedPayment" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Payment Details</h3>
          <button @click="selectedPayment = null" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium text-gray-500">Payment ID</label>
            <p class="text-sm text-gray-900">{{ selectedPayment._id }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Date</label>
            <p class="text-sm text-gray-900">{{ formatDate(selectedPayment.paymentDate) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Amount</label>
            <p class="text-sm text-gray-900">{{ $formatMoney(selectedPayment.amount) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Method</label>
            <p class="text-sm text-gray-900 capitalize">{{ selectedPayment.paymentMethod || 'N/A' }}</p>
          </div>
          <div v-if="selectedPayment.description">
            <label class="text-sm font-medium text-gray-500">Description</label>
            <p class="text-sm text-gray-900">{{ selectedPayment.description }}</p>
          </div>
          <div v-if="selectedPayment.transactionId">
            <label class="text-sm font-medium text-gray-500">Transaction ID</label>
            <p class="text-sm text-gray-900">{{ selectedPayment.transactionId }}</p>
          </div>
        </div>
        <div class="mt-6">
          <button @click="selectedPayment = null" class="btn-primary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Data
const loading = ref(true)
const properties = ref([])
const tenants = ref([])
const paymentHistory = ref([])
const selectedPayment = ref(null)
const summary = ref({
  totalCollected: 0,
  totalPending: 0,
  totalOverdue: 0,
  collectionRate: 0
})

// Filters
const filters = ref({
  propertyId: '',
  tenantId: '',
  status: '',
  dateRange: 'current_month'
})

// Fetch properties for filter dropdown
const fetchProperties = async () => {
  try {
    const response = await $fetch('/api/properties')
    if (response.success) {
      properties.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch properties:', error)
  }
}

// Fetch tenants for filter dropdown
const fetchTenants = async () => {
  try {
    const response = await $fetch('/api/tenants')
    if (response.success) {
      tenants.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch tenants:', error)
  }
}

// Fetch payment history data
const fetchPaymentHistory = async () => {
  try {
    loading.value = true
    const queryParams = new URLSearchParams()

    if (filters.value.propertyId) {
      queryParams.append('propertyId', filters.value.propertyId)
    }
    if (filters.value.tenantId) {
      queryParams.append('tenantId', filters.value.tenantId)
    }
    if (filters.value.status) {
      queryParams.append('status', filters.value.status)
    }
    if (filters.value.dateRange) {
      queryParams.append('dateRange', filters.value.dateRange)
    }

    const response = await $fetch(`/api/reports/payment-history?${queryParams}`)
    if (response.success) {
      paymentHistory.value = response.data.payments
      summary.value = response.data.summary
    }
  } catch (error) {
    console.error('Failed to fetch payment history:', error)
  } finally {
    loading.value = false
  }
}

// Apply filters
const applyFilters = () => {
  fetchPaymentHistory()
}

// View payment details
const viewPaymentDetails = (payment) => {
  selectedPayment.value = payment
}

// Export to CSV
const exportToCSV = () => {
  if (paymentHistory.value.length === 0) return

  const headers = [
    'Date',
    'Tenant Name',
    'Tenant Email',
    'Property Name',
    'Unit Number',
    'Amount',
    'Payment Type',
    'Payment Method',
    'Status',
    'Transaction ID',
    'Description'
  ]

  const csvContent = [
    headers.join(','),
    ...paymentHistory.value.map(payment => [
      `"${formatDate(payment.paymentDate)}"`,
      `"${payment.tenant?.firstName || ''} ${payment.tenant?.lastName || ''}"`,
      `"${payment.tenant?.email || ''}"`,
      `"${payment.property?.name || ''}"`,
      `"${payment.unit?.unitNumber || ''}"`,
      payment.amount,
      `"${payment.type || 'Rent'}"`,
      `"${payment.paymentMethod || ''}"`,
      `"${payment.status || ''}"`,
      `"${payment.transactionId || ''}"`,
      `"${payment.description || ''}"`
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `payment-history-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}


// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Initialize
onMounted(() => {
  fetchProperties()
  fetchTenants()
  fetchPaymentHistory()
})
</script>

