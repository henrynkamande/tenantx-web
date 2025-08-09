<template>
  <!-- Main Content -->
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center">
          <button @click="$router.back()" class="mr-4 p-2 text-gray-400 hover:text-gray-600">
            <ArrowLeftIcon class="h-5 w-5" />
          </button>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Tenant Details</h2>
            <p class="text-gray-600">View tenant information and payment history</p>
          </div>
        </div>
        <div class="flex space-x-3">
          <button 
            @click="editTenant" 
            class="btn-secondary hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            title="Edit tenant information"
          >
            <PencilIcon class="h-4 w-4 mr-2" />
            Edit Tenant
          </button>
          <button 
            @click="addPayment" 
            class="btn-primary"
            title="Add new payment record"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Payment
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Content -->
      <div v-else-if="tenant" class="space-y-6">
        
        <!-- Tenant Information Card -->
        <div class="card">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Tenant Information</h3>
          </div>
          <div class="px-6 py-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <!-- Personal Info -->
              <div class="space-y-4">
                <h4 class="font-medium text-gray-900">Personal Information</h4>
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 h-12 w-12">
                    <div class="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-lg font-medium text-primary-600">
                        {{ tenant.personalInfo?.firstName?.charAt(0) }}{{ tenant.personalInfo?.lastName?.charAt(0) }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ tenant.personalInfo?.firstName }} {{ tenant.personalInfo?.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">{{ tenant.personalInfo?.email }}</div>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="text-sm">
                    <span class="text-gray-500">Phone:</span>
                    <span class="ml-2 text-gray-900">{{ tenant.personalInfo?.phone || 'N/A' }}</span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-500">Date of Birth:</span>
                    <span class="ml-2 text-gray-900">{{ formatDate(tenant.personalInfo?.dateOfBirth) || 'N/A' }}</span>
                  </div>
                </div>
              </div>

              <!-- Property & Unit Info -->
              <div class="space-y-4">
                <h4 class="font-medium text-gray-900">Property & Unit</h4>
                <div class="space-y-2">
                  <div class="text-sm">
                    <span class="text-gray-500">Property:</span>
                    <span class="ml-2 text-gray-900">{{ tenant.unitId?.propertyId?.name || 'N/A' }}</span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-500">Unit:</span>
                    <span class="ml-2 text-gray-900">{{ tenant.unitId?.unitNumber || 'N/A' }}</span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-500">Status:</span>
                    <span class="ml-2">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="getStatusClass(tenant.status)">
                        {{ tenant.status }}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Lease Information -->
              <div class="space-y-4">
                <h4 class="font-medium text-gray-900">Lease Information</h4>
                <div class="space-y-2">
                  <div class="text-sm">
                    <span class="text-gray-500">Monthly Rent:</span>
                    <span class="ml-2 text-gray-900 font-medium">{{ $formatMoney(tenant.leaseInfo?.rentAmount || 0) }}</span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-500">Security Deposit:</span>
                    <span class="ml-2 text-gray-900">{{ $formatMoney(tenant.leaseInfo?.securityDeposit || 0) }}</span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-500">Lease Start:</span>
                    <span class="ml-2 text-gray-900">{{ formatDate(tenant.leaseInfo?.startDate) }}</span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-500">Lease End:</span>
                    <span class="ml-2 text-gray-900">{{ formatDate(tenant.leaseInfo?.endDate) || 'Month-to-month' }}</span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-500">Rent Due Day:</span>
                    <span class="ml-2 text-gray-900">{{ tenant.leaseInfo?.rentDueDay || 'N/A' }}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Payment History Card -->
        <div class="card">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Payment History</h3>
              <div class="flex items-center space-x-3">
                <select v-model="paymentStatusFilter" class="input-field text-sm">
                  <option value="">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
            </div>
          </div>
          <div class="px-6 py-4">
            
            <!-- Loading Payments -->
            <div v-if="paymentsLoading" class="flex items-center justify-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <!-- Payments Table -->
            <div v-else-if="filteredPayments.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="payment in filteredPayments" :key="payment._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(payment.dueDate) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ payment.paymentType }}
                      <div v-if="payment.monthFor" class="text-xs text-gray-500">
                        {{ formatMonthYear(payment.monthFor) }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ $formatMoney(payment.amount) }}
                      <div v-if="payment.lateFee && payment.lateFee > 0" class="text-xs text-red-600">
                        + {{ $formatMoney(payment.lateFee) }} late fee
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ payment.paymentDate ? formatDate(payment.paymentDate) : '-' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="getPaymentStatusClass(payment.status)">
                        {{ payment.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ payment.paymentMethod || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Pagination -->
              <div v-if="paymentsPagination.pages > 1" class="flex items-center justify-between mt-4">
                <div class="text-sm text-gray-700">
                  Showing {{ (paymentsPagination.page - 1) * paymentsPagination.limit + 1 }} to 
                  {{ Math.min(paymentsPagination.page * paymentsPagination.limit, paymentsPagination.total) }} of 
                  {{ paymentsPagination.total }} payments
                </div>
                <div class="flex space-x-2">
                  <button 
                    @click="loadPayments(paymentsPagination.page - 1)"
                    :disabled="paymentsPagination.page <= 1"
                    class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <button 
                    @click="loadPayments(paymentsPagination.page + 1)"
                    :disabled="paymentsPagination.page >= paymentsPagination.pages"
                    class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            </div>

            <!-- No Payments -->
            <div v-else class="text-center py-12">
              <CreditCardIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ paymentStatusFilter ? 'No payments match the selected status.' : 'This tenant has no payment history yet.' }}
              </p>
            </div>

          </div>
        </div>

      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Tenant not found</h3>
        <p class="mt-1 text-sm text-gray-500">The tenant you're looking for doesn't exist or has been removed.</p>
        <div class="mt-6">
          <button @click="$router.push('/tenants')" class="btn-primary">
            Back to Tenants
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  CreditCardIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Route parameters
const route = useRoute()
const tenantId = route.params.id

// Data and state
const loading = ref(true)
const paymentsLoading = ref(true)
const tenant = ref(null)
const payments = ref([])
const paymentsPagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})
const paymentStatusFilter = ref('')

// Computed
const filteredPayments = computed(() => {
  if (!paymentStatusFilter.value) return payments.value
  return payments.value.filter(payment => payment.status === paymentStatusFilter.value)
})

// Fetch tenant details
const fetchTenant = async () => {
  try {
    loading.value = true
    const response = await $fetch(`/api/tenants/${tenantId}`)
    if (response.success) {
      tenant.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch tenant:', error)
  } finally {
    loading.value = false
  }
}

// Load payments with pagination
const loadPayments = async (page = 1) => {
  try {
    paymentsLoading.value = true
    console.log('Loading payments for tenant:', tenantId)
    const response = await $fetch(`/api/tenants/${tenantId}/payments`, {
      query: { page, limit: 20 }
    })
    console.log('Payments API response:', response)
    if (response.success) {
      payments.value = response.data
      paymentsPagination.value = response.pagination
      console.log('Payments loaded:', payments.value.length)
    }
  } catch (error) {
    console.error('Failed to fetch payments:', error)
  } finally {
    paymentsLoading.value = false
  }
}

// Actions
const editTenant = () => {
  navigateTo(`/tenants/edit/${tenantId}`)
}

const addPayment = () => {
  navigateTo(`/payments/new?tenantId=${tenantId}`)
}


// Utility functions
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatMonthYear = (monthStr) => {
  if (!monthStr) return 'N/A'
  const [year, month] = monthStr.split('-')
  const date = new Date(year, month - 1)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800'
    case 'Inactive':
      return 'bg-red-100 text-red-800'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPaymentStatusClass = (status) => {
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

// Watch for status filter changes
watch(paymentStatusFilter, () => {
  // Re-filter payments when status filter changes
})

// Load data on mount
onMounted(async () => {
  await Promise.all([
    fetchTenant(),
    loadPayments()
  ])
})
</script>
