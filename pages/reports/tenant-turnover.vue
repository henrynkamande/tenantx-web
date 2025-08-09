<template>
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Tenant Turnover Report</h2>
          <p class="text-gray-600">Track tenant move-ins, move-outs, and turnover rates</p>
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
                <ArrowRightOnRectangleIcon class="h-8 w-8 text-red-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Move-outs</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.moveOuts }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ArrowLeftOnRectangleIcon class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Move-ins</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.moveIns }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ArrowPathIcon class="h-8 w-8 text-orange-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Turnover Rate</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.turnoverRate }}%</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CalendarDaysIcon class="h-8 w-8 text-purple-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Avg Tenancy</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary.avgTenancyDays }}d</p>
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
              <select v-model="filters.activityType" class="input">
                <option value="">All Activities</option>
                <option value="move_in">Move-ins Only</option>
                <option value="move_out">Move-outs Only</option>
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

      <!-- Turnover Activities Table -->
      <div v-else class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Tenant Activities ({{ filteredCount }} results)</h3>

          <div v-if="activities.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Rent
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="activity in activities" :key="activity._id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <ArrowLeftOnRectangleIcon
                        v-if="activity.type === 'move_in'"
                        class="h-5 w-5 text-green-600 mr-2"
                      />
                      <ArrowRightOnRectangleIcon
                        v-else
                        class="h-5 w-5 text-red-600 mr-2"
                      />
                      <span :class="{
                        'text-green-600 font-medium': activity.type === 'move_in',
                        'text-red-600 font-medium': activity.type === 'move_out'
                      }">
                        {{ activity.type === 'move_in' ? 'Move-in' : 'Move-out' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span class="text-xs font-medium text-primary-600">
                            {{ getInitials(activity.tenant?.firstName, activity.tenant?.lastName) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">
                          {{ activity.tenant?.firstName }} {{ activity.tenant?.lastName }}
                        </div>
                        <div class="text-sm text-gray-500">{{ activity.tenant?.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ activity.unit?.propertyId?.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      Unit {{ activity.unit?.unitNumber }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(activity.date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ activity.tenancyDuration || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ $formatMoney(activity.monthlyRent || 0) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ activity.reason || 'N/A' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-8">
            <ArrowPathIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No Activities Found</h3>
            <p class="mt-1 text-sm text-gray-500">No tenant activities found for the selected criteria.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon,
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CalendarDaysIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Data
const loading = ref(true)
const properties = ref([])
const activities = ref([])
const filteredCount = ref(0)
const summary = ref({
  moveOuts: 0,
  moveIns: 0,
  turnoverRate: 0,
  avgTenancyDays: 0
})

// Filters
const filters = ref({
  propertyId: '',
  dateRange: 'current_month',
  activityType: ''
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

// Fetch turnover data
const fetchTurnoverData = async () => {
  try {
    loading.value = true
    const queryParams = new URLSearchParams()

    if (filters.value.propertyId) {
      queryParams.append('propertyId', filters.value.propertyId)
    }
    if (filters.value.dateRange) {
      queryParams.append('dateRange', filters.value.dateRange)
    }
    if (filters.value.activityType) {
      queryParams.append('activityType', filters.value.activityType)
    }

    const response = await $fetch(`/api/reports/tenant-turnover?${queryParams}`)
    if (response.success) {
      activities.value = response.data.activities
      filteredCount.value = response.data.filteredCount
      summary.value = response.data.summary
    }
  } catch (error) {
    console.error('Failed to fetch turnover data:', error)
  } finally {
    loading.value = false
  }
}

// Apply filters
const applyFilters = () => {
  fetchTurnoverData()
}

// Get initials for avatar
const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
}

// Export to CSV
const exportToCSV = () => {
  if (activities.value.length === 0) return

  const headers = [
    'Activity Type',
    'Tenant Name',
    'Tenant Email',
    'Property',
    'Unit Number',
    'Date',
    'Tenancy Duration',
    'Monthly Rent',
    'Reason'
  ]

  const csvContent = [
    headers.join(','),
    ...activities.value.map(activity => [
      `"${activity.type === 'move_in' ? 'Move-in' : 'Move-out'}"`,
      `"${activity.tenant?.firstName || ''} ${activity.tenant?.lastName || ''}"`,
      `"${activity.tenant?.email || ''}"`,
      `"${activity.unit?.propertyId?.name || ''}"`,
      `"${activity.unit?.unitNumber || ''}"`,
      formatDate(activity.date),
      `"${activity.tenancyDuration || ''}"`,
      activity.monthlyRent || 0,
      `"${activity.reason || ''}"`
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `tenant-turnover-${new Date().toISOString().split('T')[0]}.csv`)
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
  fetchTurnoverData()
})
</script>
