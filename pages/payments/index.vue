<template>
  <div>
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Payments</h2>
            <p class="text-gray-600">Track and manage rent payments</p>
          </div>
            <button @click="navigateTo('/payments/new')" class="btn-primary">
            <DocumentPlusIcon class="h-5 w-5 mr-2" />
            Record Payment
            </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CurrencyDollarIcon class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total Collected
                  </dt>
                  <dd class="text-lg font-bold text-gray-900">
                    {{ $formatMoney(stats.totalCollected || 0) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ClockIcon class="h-8 w-8 text-yellow-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd class="text-lg font-bold text-gray-900">
                    {{ $formatMoney(stats.totalPending || 0) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ExclamationTriangleIcon class="h-8 w-8 text-red-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Overdue
                  </dt>
                  <dd class="text-lg font-bold text-gray-900">
                    {{ $formatMoney(stats.totalOverdue || 0) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ChartBarIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Collection Rate
                  </dt>
                  <dd class="text-lg font-bold text-gray-900">
                    {{ stats.collectionRate || 0 }}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="mb-6 flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search by tenant name..."
              class="input-field"
            />
          </div>
          <select v-model="statusFilter" class="input-field sm:w-48">
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
            <option value="Partial">Partial</option>
          </select>
          <select v-model="monthFilter" class="input-field sm:w-48">
            <option value="">All Months</option>
            <option v-for="month in months" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <!-- Payments Table -->
        <div v-else-if="filteredPayments.length > 0" class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property/Unit
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
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
                <tr v-for="payment in filteredPayments" :key="payment._id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span class="text-sm font-medium text-primary-600">
                            {{ payment.tenantId?.personalInfo?.firstName?.charAt(0) }}{{ payment.tenantId?.personalInfo?.lastName?.charAt(0) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ payment.tenantId?.personalInfo?.firstName }} {{ payment.tenantId?.personalInfo?.lastName }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ payment.unitId?.propertyId?.name || 'N/A' }}</div>
                    <div class="text-sm text-gray-500">Unit {{ payment.unitId?.unitNumber || 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ $formatMoney(payment.amount) }}</div>
                    <div class="text-sm text-gray-500">{{ payment.paymentType }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ formatDate(payment.dueDate) }}</div>
                    <div v-if="payment.paymentDate" class="text-sm text-gray-500">
                      Paid: {{ formatDate(payment.paymentDate) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getStatusClass(payment.status)">
                      {{ payment.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button @click="viewPayment(payment)" class="text-primary-600 hover:text-primary-900">
                        <EyeIcon class="h-4 w-4" />
                      </button>
                      <button v-if="payment.status !== 'Completed'" @click="markAsPaid(payment)" class="text-green-600 hover:text-green-900">
                        <CheckIcon class="h-4 w-4" />
                      </button>
                      <button @click="editPayment(payment)" class="text-blue-600 hover:text-blue-900">
                        <PencilIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <CurrencyDollarIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ searchTerm || statusFilter || monthFilter ? 'Try adjusting your search criteria.' : 'Get started by recording your first payment.' }}
          </p>
          <div v-if="!searchTerm && !statusFilter && !monthFilter" class="mt-6">
             <button @click="navigateTo('/payments/new')" class="btn-primary">
            <DocumentPlusIcon class="h-5 w-5 mr-2" />
            Record Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentPlusIcon,
  EyeIcon,
  CheckIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Data and state
const loading = ref(true)
const payments = ref([])
const stats = ref({})
const searchTerm = ref('')
const statusFilter = ref('')
const monthFilter = ref('')
const showRecordPayment = ref(false)

// Generate month options
const months = computed(() => {
  const monthsArray = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthsArray.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    })
  }
  return monthsArray
})

// Computed
const filteredPayments = computed(() => {
  return payments.value.filter(payment => {
    const matchesSearch = !searchTerm.value || 
      `${payment.tenantId?.personalInfo?.firstName} ${payment.tenantId?.personalInfo?.lastName}`.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    const matchesStatus = !statusFilter.value || payment.status === statusFilter.value
    
    const matchesMonth = !monthFilter.value || 
      payment.dueDate.startsWith(monthFilter.value)
    
    return matchesSearch && matchesStatus && matchesMonth
  })
})

// Get auth store
const { getAuthHeader } = useAuth()

// Fetch payments and stats
const fetchPayments = async () => {
  try {
    loading.value = true
    const [paymentsResponse, statsResponse] = await Promise.all([
      $fetch('/api/payments', {
        headers: getAuthHeader()
      }),
      $fetch('/api/payments/stats', {
        headers: getAuthHeader()
      })
    ])
    
    if (paymentsResponse.success) {
      payments.value = paymentsResponse.data
    }
    
    if (statsResponse.success) {
      stats.value = statsResponse.data
    }
  } catch (error) {
    console.error('Failed to fetch payments:', error)
  } finally {
    loading.value = false
  }
}

// View payment details
const viewPayment = (payment) => {
  navigateTo(`/payments/${payment._id}`)
}

// Mark payment as paid
const markAsPaid = async (payment) => {
  try {
    await $fetch(`/api/payments/${payment._id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: {
        status: 'Completed',
        paymentDate: new Date().toISOString()
      }
    })
    await fetchPayments() // Refresh the list
  } catch (error) {
    console.error('Failed to mark payment as paid:', error)
    alert('Failed to update payment status')
  }
}

// Edit payment
const editPayment = (payment) => {
  navigateTo(`/payments/edit/${payment._id}`)
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
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Format date
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
  fetchPayments()
})
</script>
