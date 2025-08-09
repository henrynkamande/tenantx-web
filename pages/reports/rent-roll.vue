<template>
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Rent Roll Report</h2>
          <p class="text-gray-600">Complete overview of all rental units and tenants</p>
        </div>
        <div class="flex space-x-3">
          <button @click="exportToCSV" class="btn-outline">
            <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
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
                <label class="label">Property</label>
                <select
                  v-model="filters.propertyId"
                  class="input-field"
                  @change="fetchRentRollData"
                >
                  <option value="">All Properties</option>
                  <option v-for="property in properties" :key="property._id" :value="property._id">
                    {{ property.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="label">Status</label>
                <select
                  v-model="filters.occupancyStatus"
                  class="input-field"
                  @change="fetchRentRollData"
                >
                  <option value="">All Units</option>
                  <option value="Occupied">Occupied Only</option>
                  <option value="Vacant">Vacant Only</option>
                </select>
              </div>
              <div>
                <label class="label">Report Date</label>
                <input
                  v-model="filters.reportDate"
                  type="date"
                  class="input-field"
                  @change="fetchRentRollData"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <HomeIcon class="h-8 w-8 text-blue-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Units</p>
                  <p class="text-2xl font-bold text-gray-900">{{ summary.totalUnits }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <UserGroupIcon class="h-8 w-8 text-green-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Occupied Units</p>
                  <p class="text-2xl font-bold text-gray-900">{{ summary.occupiedUnits }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <CurrencyDollarIcon class="h-8 w-8 text-green-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Rent</p>
                  <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(summary.totalRent) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <ChartBarIcon class="h-8 w-8 text-purple-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Occupancy Rate</p>
                  <p class="text-2xl font-bold text-gray-900">{{ summary.occupancyRate }}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rent Roll Table -->
        <div class="card">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Rent Roll Details</h3>
              <div class="text-sm text-gray-500">
                Report Date: {{ formatDate(filters.reportDate) }}
              </div>
            </div>
            
            <div v-if="loading" class="flex items-center justify-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property / Unit
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lease Dates
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Rent
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Security Deposit
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="unit in rentRollData" :key="unit._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        {{ unit.propertyId?.name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        Unit {{ unit.unitNumber }} - {{ unit.bedrooms }}BR/{{ unit.bathrooms }}BA
                      </div>
                      <div v-if="unit.squareFootage" class="text-xs text-gray-400">
                        {{ unit.squareFootage }} sq ft
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div v-if="unit.tenant" class="text-sm">
                        <div class="font-medium text-gray-900">
                          {{ unit.tenant.personalInfo?.firstName }} {{ unit.tenant.personalInfo?.lastName }}
                        </div>
                        <div class="text-gray-500">{{ unit.tenant.personalInfo?.email }}</div>
                      </div>
                      <div v-else class="text-sm text-gray-500 italic">
                        Vacant
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div v-if="unit.tenant?.leaseInfo">
                        <div>{{ formatDate(unit.tenant.leaseInfo.startDate) }}</div>
                        <div class="text-gray-500">
                          to {{ unit.tenant.leaseInfo.endDate ? formatDate(unit.tenant.leaseInfo.endDate) : 'Month-to-month' }}
                        </div>
                      </div>
                      <div v-else class="text-gray-500">-</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ $formatMoney(unit.rentAmount) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ $formatMoney(unit.securityDeposit || 0) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusClass(unit.occupancyStatus)"
                      >
                        {{ unit.occupancyStatus }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div v-if="unit.tenant?.personalInfo">
                        <div>{{ unit.tenant.personalInfo.phone }}</div>
                        <div class="text-gray-500">{{ unit.tenant.personalInfo.email }}</div>
                      </div>
                      <div v-else class="text-gray-500">-</div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div v-if="rentRollData.length === 0" class="text-center py-8">
                <p class="text-gray-500">No units found for the selected criteria.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Property Summary -->
        <div class="mt-8 card">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Property Summary</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="property in propertySummary" :key="property._id" class="border rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-2">{{ property.name }}</h4>
                <div class="space-y-1 text-sm text-gray-600">
                  <div>Units: {{ property.totalUnits }} ({{ property.occupiedUnits }} occupied)</div>
                  <div>Occupancy: {{ property.occupancyRate }}%</div>
                  <div>Monthly Rent: {{ $formatMoney(property.totalRent) }}</div>
                  <div>Potential Rent: {{ $formatMoney(property.potentialRent) }}</div>
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
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentArrowDownIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})



// Data
const loading = ref(true)
const properties = ref([])
const rentRollData = ref([])
const propertySummary = ref([])
const summary = ref({
  totalUnits: 0,
  occupiedUnits: 0,
  totalRent: 0,
  occupancyRate: 0
})

// Filters
const filters = reactive({
  propertyId: '',
  occupancyStatus: '',
  reportDate: new Date().toISOString().split('T')[0]
})

// Fetch properties
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

// Fetch rent roll data
const fetchRentRollData = async () => {
  try {
    loading.value = true
    const query = new URLSearchParams()
    
    if (filters.propertyId) query.append('propertyId', filters.propertyId)
    if (filters.occupancyStatus) query.append('occupancyStatus', filters.occupancyStatus)
    if (filters.reportDate) query.append('reportDate', filters.reportDate)
    
    const response = await $fetch(`/api/reports/rent-roll?${query}`)
    if (response.success) {
      rentRollData.value = response.data.units
      propertySummary.value = response.data.propertySummary
      summary.value = response.data.summary
    }
  } catch (error) {
    console.error('Failed to fetch rent roll data:', error)
  } finally {
    loading.value = false
  }
}

// Export to CSV
const exportToCSV = () => {
  const headers = [
    'Property', 'Unit', 'Bedrooms', 'Bathrooms', 'Sq Ft', 'Tenant Name', 'Tenant Email', 'Tenant Phone',
    'Lease Start', 'Lease End', 'Monthly Rent', 'Security Deposit', 'Status'
  ]
  
  const csvContent = [
    headers.join(','),
    ...rentRollData.value.map(unit => [
      unit.propertyId?.name || '',
      unit.unitNumber,
      unit.bedrooms,
      unit.bathrooms,
      unit.squareFootage || '',
      unit.tenant ? `${unit.tenant.personalInfo?.firstName} ${unit.tenant.personalInfo?.lastName}` : '',
      unit.tenant?.personalInfo?.email || '',
      unit.tenant?.personalInfo?.phone || '',
      unit.tenant?.leaseInfo?.startDate ? formatDate(unit.tenant.leaseInfo.startDate) : '',
      unit.tenant?.leaseInfo?.endDate ? formatDate(unit.tenant.leaseInfo.endDate) : '',
      unit.rentAmount,
      unit.securityDeposit || 0,
      unit.occupancyStatus
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rent-roll-${filters.reportDate}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

// Get status class
const getStatusClass = (status) => {
  switch (status) {
    case 'Occupied':
      return 'bg-green-100 text-green-800'
    case 'Vacant':
      return 'bg-red-100 text-red-800'
    case 'Under Maintenance':
      return 'bg-yellow-100 text-yellow-800'
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

// Initialize
onMounted(() => {
  fetchProperties()
  fetchRentRollData()
})
</script>

