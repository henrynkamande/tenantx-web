<template>
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Maintenance Summary Report</h2>
          <p class="text-gray-600">Track maintenance requests, costs, and resolution times</p>
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

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="card">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <WrenchScrewdriverIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Requests</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.totalRequests }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CheckCircleIcon class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Completion Rate</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.completionRate }}%</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CurrencyDollarIcon class="h-8 w-8 text-orange-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Cost</p>
                <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(summary.totalCost) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ClockIcon class="h-8 w-8 text-purple-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Avg Resolution</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.avgResolutionDays }}d</p>
              </div>
            </div>
          </div>
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select v-model="filters.dateRange" class="input">
                <option value="current_month">Current Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="last_6_months">Last 6 Months</option>
                <option value="current_year">Current Year</option>
                <option value="last_year">Last Year</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select v-model="filters.status" class="input">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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

      <!-- Category Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="card">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h3>
            <div v-if="categoryBreakdown.length > 0" class="space-y-4">
              <div v-for="category in categoryBreakdown" :key="category._id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900">{{ category.category || 'Other' }}</p>
                  <p class="text-sm text-gray-500">{{ category.count }} requests</p>
                </div>
                <div class="text-right">
                  <p class="font-medium text-gray-900">{{ $formatMoney(category.totalCost) }}</p>
                  <p class="text-sm text-gray-500">{{ category.avgDays }}d avg</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              No data available for the selected period
            </div>
          </div>
        </div>

        <div class="card">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Property Performance</h3>
            <div v-if="propertyBreakdown.length > 0" class="space-y-4">
              <div v-for="property in propertyBreakdown.slice(0, 5)" :key="property._id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900">{{ property.propertyName }}</p>
                  <p class="text-sm text-gray-500">{{ property.totalRequests }} requests • {{ property.completionRate }}% completed</p>
                </div>
                <div class="text-right">
                  <p class="font-medium text-gray-900">{{ $formatMoney(property.totalCost) }}</p>
                  <p class="text-sm text-gray-500">{{ property.avgResolutionDays }}d avg</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              No data available for the selected period
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Maintenance Requests Table -->
      <div v-else class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Maintenance Requests ({{ filteredCount }} results)</h3>

          <div v-if="maintenanceRequests.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property/Unit
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resolution
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="request in maintenanceRequests" :key="request._id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ request.title }}</div>
                    <div class="text-sm text-gray-500">{{ truncateText(request.description, 50) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ request.unitId?.propertyId?.name }}</div>
                    <div class="text-sm text-gray-500">Unit {{ request.unitId?.unitNumber }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {{ request.category || 'General' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(request.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ formatStatus(request.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getPriorityClass(request.priority)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ formatPriority(request.priority) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ $formatMoney(request.cost || 0) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(request.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span v-if="request.resolutionDays">{{ request.resolutionDays }}d</span>
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-12">
            <WrenchScrewdriverIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No maintenance requests</h3>
            <p class="mt-1 text-sm text-gray-500">No maintenance requests found for the selected filters.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'

// Page meta configuration
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Head configuration
useHead({
  title: 'Maintenance Summary Report - TenantX'
})

// Reactive data
const loading = ref(true)
const maintenanceRequests = ref([])
const categoryBreakdown = ref([])
const propertyBreakdown = ref([])
const properties = ref([])
const filteredCount = ref(0)
const summary = ref({
  totalRequests: 0,
  totalCost: 0,
  completionRate: 0,
  avgResolutionDays: 0
})

const filters = ref({
  propertyId: '',
  dateRange: 'current_month',
  status: ''
})

// Fetch initial data
const fetchData = async () => {
  loading.value = true
  try {
    // Fetch properties for filter
    const { data: propertiesData } = await $fetch('/api/properties')
    if (propertiesData) {
      properties.value = propertiesData
    }

    // Fetch maintenance summary data
    const params = new URLSearchParams()
    if (filters.value.propertyId) params.append('propertyId', filters.value.propertyId)
    if (filters.value.dateRange) params.append('dateRange', filters.value.dateRange)
    if (filters.value.status) params.append('status', filters.value.status)

    const response = await $fetch(`/api/reports/maintenance-summary?${params.toString()}`)
    
    if (response.success) {
      maintenanceRequests.value = response.data.maintenanceRequests
      categoryBreakdown.value = response.data.categoryBreakdown
      propertyBreakdown.value = response.data.propertyBreakdown
      filteredCount.value = response.data.filteredCount
      summary.value = response.data.summary
    }
  } catch (error) {
    console.error('Error fetching maintenance summary:', error)
  } finally {
    loading.value = false
  }
}

// Apply filters
const applyFilters = () => {
  fetchData()
}

// Format functions
const formatNumber = (value: number) => {
  return new Intl.NumberFormat().format(value || 0)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatStatus = (status: string) => {
  const statusMap = {
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  return statusMap[status] || status
}

const formatPriority = (priority: string) => {
  const priorityMap = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'Urgent'
  }
  return priorityMap[priority] || priority
}

const getStatusClass = (status: string) => {
  const classMap = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

const getPriorityClass = (priority: string) => {
  const classMap = {
    'low': 'bg-gray-100 text-gray-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800'
  }
  return classMap[priority] || 'bg-gray-100 text-gray-800'
}

const truncateText = (text: string, length: number) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// Export to CSV
const exportToCSV = () => {
  const headers = [
    'Title',
    'Description', 
    'Property',
    'Unit',
    'Category',
    'Status',
    'Priority',
    'Cost',
    'Created Date',
    'Resolution Days'
  ]
  
  const rows = maintenanceRequests.value.map(request => [
    request.title,
    request.description,
    request.unitId?.propertyId?.name,
    request.unitId?.unitNumber,
    request.category || 'General',
    formatStatus(request.status),
    formatPriority(request.priority),
    request.cost || 0,
    formatDate(request.createdAt),
    request.resolutionDays || ''
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `maintenance-summary-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Initialize data on mount
onMounted(() => {
  fetchData()
})
</script>
