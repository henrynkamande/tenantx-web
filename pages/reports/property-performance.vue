<template>
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Property Performance Report</h2>
          <p class="text-gray-600">Analyze individual property performance metrics</p>
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
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <!-- Property Performance Table -->
      <div v-else class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Property Performance</h3>

          <div v-if="performanceData.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupancy
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Rent
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maintenance
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Income
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="property in performanceData" :key="property._id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ property.name }}</div>
                    <div class="text-sm text-gray-500">{{ property.address }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ property.occupiedUnits }}/{{ property.totalUnits }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ property.vacantUnits }} vacant
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="text-sm font-medium text-gray-900 mr-2">
                        {{ property.occupancyRate }}%
                      </div>
                      <div class="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          class="h-2 rounded-full"
                          :class="{
                            'bg-green-500': property.occupancyRate >= 90,
                            'bg-yellow-500': property.occupancyRate >= 75 && property.occupancyRate < 90,
                            'bg-red-500': property.occupancyRate < 75
                          }"
                          :style="{ width: property.occupancyRate + '%' }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ currencySymbol }}{{ formatCurrency(property.totalRevenue) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ currencySymbol }}{{ formatCurrency(property.avgRent) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {{ currencySymbol }}{{ formatCurrency(property.maintenanceCosts) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span :class="{
                      'text-green-600': property.netIncome >= 0,
                      'text-red-600': property.netIncome < 0
                    }">
                      {{ currencySymbol }}{{ formatCurrency(property.netIncome) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span :class="{
                      'text-green-600': property.roi >= 0,
                      'text-red-600': property.roi < 0
                    }">
                      {{ property.roi }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-8">
            <BuildingOffice2Icon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No Data Available</h3>
            <p class="mt-1 text-sm text-gray-500">No property performance data found for the selected criteria.</p>
          </div>
        </div>
      </div>

      <!-- Performance Summary -->
      <div v-if="performanceData.length > 0" class="mt-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <CurrencyDollarIcon class="h-8 w-8 text-green-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p class="text-2xl font-bold text-gray-900">
                    {{ currencySymbol }}{{ formatCurrency(summary.totalRevenue) }}
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
                  <p class="text-sm font-medium text-gray-500">Avg Occupancy</p>
                  <p class="text-2xl font-bold text-gray-900">{{ summary.avgOccupancy }}%</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <WrenchScrewdriverIcon class="h-8 w-8 text-orange-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Maintenance Costs</p>
                  <p class="text-2xl font-bold text-gray-900">
                    {{ currencySymbol }}{{ formatCurrency(summary.totalMaintenance) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <TrendingUpIcon class="h-8 w-8 text-purple-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Avg ROI</p>
                  <p class="text-2xl font-bold text-gray-900">{{ summary.avgROI }}%</p>
                </div>
              </div>
            </div>
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
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  TrendingUpIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { currencySymbol } = useCurrency()



// Data
const loading = ref(true)
const properties = ref([])
const performanceData = ref([])
const summary = ref({
  totalRevenue: 0,
  avgOccupancy: 0,
  totalMaintenance: 0,
  avgROI: 0
})

// Filters
const filters = ref({
  propertyId: '',
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

// Fetch performance data
const fetchPerformanceData = async () => {
  try {
    loading.value = true
    const queryParams = new URLSearchParams()

    if (filters.value.propertyId) {
      queryParams.append('propertyId', filters.value.propertyId)
    }
    if (filters.value.dateRange) {
      queryParams.append('dateRange', filters.value.dateRange)
    }

    const response = await $fetch(`/api/reports/property-performance?${queryParams}`)
    if (response.success) {
      performanceData.value = response.data.properties
      summary.value = response.data.summary
    }
  } catch (error) {
    console.error('Failed to fetch performance data:', error)
  } finally {
    loading.value = false
  }
}

// Apply filters
const applyFilters = () => {
  fetchPerformanceData()
}

// Export to CSV
const exportToCSV = () => {
  if (performanceData.value.length === 0) return

  const headers = [
    'Property Name',
    'Address',
    'Total Units',
    'Occupied Units',
    'Vacant Units',
    'Occupancy Rate (%)',
    'Total Revenue ($)',
    'Average Rent ($)',
    'Maintenance Costs ($)',
    'Net Income ($)',
    'ROI (%)'
  ]

  const csvContent = [
    headers.join(','),
    ...performanceData.value.map(property => [
      `"${property.name}"`,
      `"${property.address || ''}"`,
      property.totalUnits,
      property.occupiedUnits,
      property.vacantUnits,
      property.occupancyRate,
      property.totalRevenue,
      property.avgRent,
      property.maintenanceCosts,
      property.netIncome,
      property.roi
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `property-performance-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Initialize
onMounted(() => {
  fetchProperties()
  fetchPerformanceData()
})
</script>

