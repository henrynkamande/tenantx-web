<template>
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Lease Expiration Report</h2>
          <p class="text-gray-600">Track upcoming lease expirations and renewal opportunities</p>
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
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Property Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Property</label>
            <select
              v-model="filters.propertyId"
              @change="applyFilters"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Properties</option>
              <option v-for="property in properties" :key="property._id" :value="property._id">
                {{ property.name }}
              </option>
            </select>
          </div>

          <!-- Expiration Period Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Expiration Period</label>
            <select
              v-model="filters.period"
              @change="applyFilters"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="30">Next 30 days</option>
              <option value="60">Next 60 days</option>
              <option value="90">Next 90 days</option>
              <option value="180">Next 6 months</option>
              <option value="365">Next year</option>
              <option value="all">All upcoming</option>
            </select>
          </div>

          <!-- Lease Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Lease Status</label>
            <select
              v-model="filters.status"
              @change="applyFilters"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="renewal_pending">Renewal Pending</option>
              <option value="notice_given">Notice Given</option>
            </select>
          </div>

          <!-- Action Required Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Action Required</label>
            <select
              v-model="filters.actionRequired"
              @change="applyFilters"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Leases</option>
              <option value="renewal_notice">Send Renewal Notice</option>
              <option value="overdue">Overdue Action</option>
              <option value="expiring_soon">Expiring Soon</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Leases</p>
              <p class="text-2xl font-bold text-gray-900">{{ summary.totalLeases }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Expiring (30 days)</p>
              <p class="text-2xl font-bold text-yellow-600">{{ summary.expiring30Days }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Expiring (60 days)</p>
              <p class="text-2xl font-bold text-orange-600">{{ summary.expiring60Days }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.635 0L4.182 14.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Overdue</p>
              <p class="text-2xl font-bold text-red-600">{{ summary.overdue }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Renewed</p>
              <p class="text-2xl font-bold text-green-600">{{ summary.renewed }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lease Expiration Table -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Lease Expirations</h3>
          <p class="mt-1 text-sm text-gray-500">{{ filteredLeases.length }} leases found</p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit/Property
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lease Start
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lease End
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Until Expiry
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Rent
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action Required
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading lease data...
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredLeases.length === 0">
                <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                  No leases found matching the current filters.
                </td>
              </tr>
              <tr v-else v-for="lease in filteredLeases" :key="lease._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ lease.tenantName }}</div>
                  <div class="text-sm text-gray-500">{{ lease.tenantEmail }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ lease.unitNumber }}</div>
                  <div class="text-sm text-gray-500">{{ lease.propertyName }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(lease.startDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium" :class="getExpiryDateClass(lease.daysUntilExpiry)">
                    {{ formatDate(lease.endDate) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getDaysUntilExpiryClass(lease.daysUntilExpiry)"
                  >
                    {{ lease.daysUntilExpiry >= 0 ? lease.daysUntilExpiry : 'Expired' }}
                    {{ lease.daysUntilExpiry >= 0 ? (lease.daysUntilExpiry === 1 ? 'day' : 'days') : '' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ $formatMoney(lease.monthlyRent) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(lease.status)"
                  >
                    {{ formatStatus(lease.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    v-if="lease.actionRequired"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getActionRequiredClass(lease.actionRequired)"
                  >
                    {{ formatActionRequired(lease.actionRequired) }}
                  </span>
                  <span v-else class="text-sm text-gray-400">None</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex space-x-2">
                    <a 
                      :href="`tel:${lease.tenantPhone}`"
                      class="text-blue-600 hover:text-blue-800"
                      title="Call tenant"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                    <a 
                      :href="`mailto:${lease.tenantEmail}`"
                      class="text-blue-600 hover:text-blue-800"
                      title="Email tenant"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'
import { ref, computed, onMounted } from 'vue'

// Page metadata
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Reactive data
const loading = ref(false)
const leases = ref([])
const properties = ref([])

// Filters
const filters = ref({
  propertyId: '',
  period: '90',
  status: '',
  actionRequired: ''
})

// Summary data
const summary = computed(() => {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
  const sixtyDaysFromNow = new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000))

  return {
    totalLeases: leases.value.length,
    expiring30Days: leases.value.filter(lease => {
      const endDate = new Date(lease.endDate)
      return endDate <= thirtyDaysFromNow && endDate >= now
    }).length,
    expiring60Days: leases.value.filter(lease => {
      const endDate = new Date(lease.endDate)
      return endDate <= sixtyDaysFromNow && endDate >= now
    }).length,
    overdue: leases.value.filter(lease => new Date(lease.endDate) < now && lease.status === 'active').length,
    renewed: leases.value.filter(lease => lease.status === 'renewed').length
  }
})

// Filtered leases
const filteredLeases = computed(() => {
  let filtered = [...leases.value]

  // Filter by property
  if (filters.value.propertyId) {
    filtered = filtered.filter(lease => lease.propertyId === filters.value.propertyId)
  }

  // Filter by expiration period
  if (filters.value.period !== 'all') {
    const days = parseInt(filters.value.period)
    filtered = filtered.filter(lease => lease.daysUntilExpiry <= days)
  }

  // Filter by status
  if (filters.value.status) {
    filtered = filtered.filter(lease => lease.status === filters.value.status)
  }

  // Filter by action required
  if (filters.value.actionRequired) {
    filtered = filtered.filter(lease => lease.actionRequired === filters.value.actionRequired)
  }

  return filtered
})

// Methods
const fetchData = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.propertyId) params.append('propertyId', filters.value.propertyId)
    if (filters.value.period) params.append('period', filters.value.period)
    if (filters.value.status) params.append('status', filters.value.status)
    if (filters.value.actionRequired) params.append('actionRequired', filters.value.actionRequired)

    const [leasesResponse, propertiesResponse] = await Promise.all([
      $fetch(`/api/reports/lease-expiration?${params}`),
      $fetch('/api/properties')
    ])

    if (leasesResponse.success) {
      leases.value = leasesResponse.data.leases || []
    }

    if (propertiesResponse.success) {
      properties.value = propertiesResponse.data || []
    }
  } catch (error) {
    console.error('Error fetching lease expiration data:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  fetchData()
}

const refreshData = () => {
  fetchData()
}

const exportToCSV = () => {
  const headers = [
    'Tenant Name',
    'Tenant Email',
    'Tenant Phone',
    'Unit Number',
    'Property Name',
    'Lease Start',
    'Lease End',
    'Days Until Expiry',
    'Monthly Rent',
    'Status',
    'Action Required'
  ]

  const csvData = filteredLeases.value.map(lease => [
    lease.tenantName,
    lease.tenantEmail,
    lease.tenantPhone,
    lease.unitNumber,
    lease.propertyName,
    formatDate(lease.startDate),
    formatDate(lease.endDate),
    lease.daysUntilExpiry >= 0 ? lease.daysUntilExpiry : 'Expired',
    lease.monthlyRent,
    formatStatus(lease.status),
    lease.actionRequired ? formatActionRequired(lease.actionRequired) : 'None'
  ])

  const csvContent = [headers, ...csvData]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `lease-expiration-report-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatStatus = (status) => {
  const statusMap = {
    'active': 'Active',
    'expired': 'Expired',
    'renewed': 'Renewed',
    'terminated': 'Terminated',
    'renewal_pending': 'Renewal Pending',
    'notice_given': 'Notice Given'
  }
  return statusMap[status] || status
}

const formatActionRequired = (action) => {
  const actionMap = {
    'renewal_notice': 'Send Renewal Notice',
    'overdue': 'Overdue Action',
    'expiring_soon': 'Expiring Soon',
    'follow_up': 'Follow Up Required'
  }
  return actionMap[action] || action
}

const getStatusClass = (status) => {
  const statusClasses = {
    'active': 'bg-green-100 text-green-800',
    'expired': 'bg-red-100 text-red-800',
    'renewed': 'bg-blue-100 text-blue-800',
    'terminated': 'bg-gray-100 text-gray-800',
    'renewal_pending': 'bg-yellow-100 text-yellow-800',
    'notice_given': 'bg-orange-100 text-orange-800'
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

const getDaysUntilExpiryClass = (days) => {
  if (days < 0) return 'bg-red-100 text-red-800'
  if (days <= 30) return 'bg-red-100 text-red-800'
  if (days <= 60) return 'bg-yellow-100 text-yellow-800'
  if (days <= 90) return 'bg-orange-100 text-orange-800'
  return 'bg-green-100 text-green-800'
}

const getExpiryDateClass = (days) => {
  if (days < 0) return 'text-red-600 font-semibold'
  if (days <= 30) return 'text-red-600'
  if (days <= 60) return 'text-yellow-600'
  return 'text-gray-900'
}

const getActionRequiredClass = (action) => {
  const actionClasses = {
    'renewal_notice': 'bg-blue-100 text-blue-800',
    'overdue': 'bg-red-100 text-red-800',
    'expiring_soon': 'bg-yellow-100 text-yellow-800',
    'follow_up': 'bg-orange-100 text-orange-800'
  }
  return actionClasses[action] || 'bg-gray-100 text-gray-800'
}



// Lifecycle
onMounted(() => {
  fetchData()
})
</script>
