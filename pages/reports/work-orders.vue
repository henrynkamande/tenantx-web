<template>
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Work Orders Report</h2>
          <p class="text-gray-600">Detailed tracking and management of work orders</p>
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
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div class="card">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ClipboardDocumentListIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Orders</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.totalOrders }}</p>
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
                <p class="text-2xl font-bold text-gray-900">{{ summary.pendingOrders }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Cog6ToothIcon class="h-8 w-8 text-orange-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">In Progress</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.inProgressOrders }}</p>
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
                <p class="text-sm font-medium text-gray-500">Completed</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.completedOrders }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CurrencyDollarIcon class="h-8 w-8 text-purple-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Cost</p>
                <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(summary.totalCost) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select v-model="filters.status" class="input">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select v-model="filters.priority" class="input">
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
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

      <!-- Work Orders Table -->
      <div v-else class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Work Orders ({{ filteredCount }} results)</h3>
          
          <div v-if="workOrders.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Order
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit/Property
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="order in workOrders" :key="order._id" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{ order.title }}</div>
                    <div class="text-sm text-gray-500 truncate max-w-xs">{{ order.description }}</div>
                    <div v-if="order.workOrderNumber" class="text-xs text-gray-400 mt-1">
                      #{{ order.workOrderNumber }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ order.unitId?.propertyId?.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      Unit {{ order.unitId?.unitNumber }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ order.category || 'General' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="{
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full': true,
                      'bg-gray-100 text-gray-800': order.priority === 'low',
                      'bg-blue-100 text-blue-800': order.priority === 'medium',
                      'bg-yellow-100 text-yellow-800': order.priority === 'high',
                      'bg-red-100 text-red-800': order.priority === 'urgent'
                    }">
                      {{ order.priority || 'medium' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="{
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full': true,
                      'bg-yellow-100 text-yellow-800': order.status === 'pending',
                      'bg-blue-100 text-blue-800': order.status === 'in_progress',
                      'bg-green-100 text-green-800': order.status === 'completed',
                      'bg-red-100 text-red-800': order.status === 'cancelled'
                    }">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div v-if="order.assignedTo" class="text-sm text-gray-900">
                      {{ order.assignedTo }}
                    </div>
                    <div v-else class="text-sm text-gray-400 italic">
                      Unassigned
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                    {{ $formatMoney(order.actualCost || order.estimatedCost || 0) }}
                    </div>
                    <div v-if="order.actualCost && order.estimatedCost && order.actualCost !== order.estimatedCost" class="text-xs text-gray-500">
                      Est: {{ $formatMoney(order.estimatedCost) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(order.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div v-if="order.dueDate" class="text-sm text-gray-900">
                      {{ formatDate(order.dueDate) }}
                    </div>
                    <div v-else class="text-sm text-gray-400 italic">
                      No due date
                    </div>
                    <div v-if="order.dueDate && isOverdue(order.dueDate, order.status)" class="text-xs text-red-600 font-medium">
                      Overdue
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-8">
            <ClipboardDocumentListIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No Work Orders</h3>
            <p class="mt-1 text-sm text-gray-500">No work orders found for the selected criteria.</p>
          </div>
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
  ClipboardDocumentListIcon,
  ClockIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Data
const loading = ref(true)
const properties = ref([])
const workOrders = ref([])
const filteredCount = ref(0)
const summary = ref({
  totalOrders: 0,
  pendingOrders: 0,
  inProgressOrders: 0,
  completedOrders: 0,
  totalCost: 0
})

// Filters
const filters = ref({
  propertyId: '',
  status: '',
  priority: '',
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

// Fetch work orders data
const fetchWorkOrdersData = async () => {
  try {
    loading.value = true
    const queryParams = new URLSearchParams()
    
    if (filters.value.propertyId) {
      queryParams.append('propertyId', filters.value.propertyId)
    }
    if (filters.value.status) {
      queryParams.append('status', filters.value.status)
    }
    if (filters.value.priority) {
      queryParams.append('priority', filters.value.priority)
    }
    if (filters.value.dateRange) {
      queryParams.append('dateRange', filters.value.dateRange)
    }

    const response = await $fetch(`/api/reports/work-orders?${queryParams}`)
    if (response.success) {
      workOrders.value = response.data.workOrders
      filteredCount.value = response.data.filteredCount
      summary.value = response.data.summary
    }
  } catch (error) {
    console.error('Failed to fetch work orders data:', error)
  } finally {
    loading.value = false
  }
}

// Apply filters
const applyFilters = () => {
  fetchWorkOrdersData()
}

// Check if work order is overdue
const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'completed' || status === 'cancelled') {
    return false
  }
  return new Date(dueDate) < new Date()
}

// Export to CSV
const exportToCSV = () => {
  if (workOrders.value.length === 0) return

  const headers = [
    'Work Order Number',
    'Title',
    'Description',
    'Property',
    'Unit Number',
    'Category',
    'Priority',
    'Status',
    'Assigned To',
    'Estimated Cost',
    'Actual Cost',
    'Created Date',
    'Due Date',
    'Completed Date'
  ]

  const csvContent = [
    headers.join(','),
    ...workOrders.value.map(order => [
      `"${order.workOrderNumber || ''}"`,
      `"${order.title || ''}"`,
      `"${order.description || ''}"`,
      `"${order.unitId?.propertyId?.name || ''}"`,
      `"${order.unitId?.unitNumber || ''}"`,
      `"${order.category || ''}"`,
      `"${order.priority || ''}"`,
      `"${order.status || ''}"`,
      `"${order.assignedTo || ''}"`,
      order.estimatedCost || 0,
      order.actualCost || 0,
      formatDate(order.createdAt),
      formatDate(order.dueDate),
      formatDate(order.completedAt)
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `work-orders-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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

// Initialize
onMounted(() => {
  fetchProperties()
  fetchWorkOrdersData()
})
</script>
