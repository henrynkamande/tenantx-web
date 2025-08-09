<template>
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Occupancy Report</h2>
            <p class="text-gray-600">View occupancy rates and vacancy analysis</p>
          </div>
          <NuxtLink to="/reports" class="btn-outline">
            <ArrowLeftIcon class="h-4 w-4 mr-2" />
            Back to Reports
          </NuxtLink>
        </div>

        <!-- Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <HomeIcon class="h-8 w-8 text-blue-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Units</p>
                  <p class="text-2xl font-bold text-gray-900">{{ occupancyData.totalUnits }}</p>
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
                  <p class="text-2xl font-bold text-gray-900">{{ occupancyData.occupiedUnits }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <BuildingOfficeIcon class="h-8 w-8 text-red-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Vacant Units</p>
                  <p class="text-2xl font-bold text-gray-900">{{ occupancyData.vacantUnits }}</p>
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
                  <p class="text-2xl font-bold text-gray-900">{{ occupancyData.occupancyRate }}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Overall Occupancy Chart -->
          <div class="card">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Overall Occupancy</h3>
              <div class="h-64">
                <DoughnutChart
                  chart-id="overall-occupancy-chart"
                  :labels="['Occupied', 'Vacant']"
                  :data="[occupancyData.occupiedUnits, occupancyData.vacantUnits]"
                  :background-color="['#10B981', '#EF4444']"
                  :height="250"
                />
              </div>
            </div>
          </div>

          <!-- Property Occupancy Rates Chart -->
          <div class="card">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Property Occupancy Rates</h3>
              <div class="h-64">
                <BarChart
                  v-if="propertyBreakdown && propertyBreakdown.length > 0"
                  chart-id="property-occupancy-chart"
                  :labels="propertyBreakdown.map(p => p.name)"
                  :datasets="[{
                    label: 'Occupancy Rate (%)',
                    data: propertyBreakdown.map(p => p.occupancyRate),
                    backgroundColor: propertyBreakdown.map(p => getChartColor(p.occupancyRate)),
                    borderColor: propertyBreakdown.map(p => getChartColor(p.occupancyRate, 1)),
                    borderWidth: 1
                  }]"
                  :height="250"
                />
                <div v-else class="flex items-center justify-center h-full text-gray-500">
                  No property data available
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Property Breakdown -->
        <div class="card mb-8">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Occupancy by Property</h3>
            
            <div v-if="loading" class="flex items-center justify-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Units
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Occupied
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vacant
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Occupancy Rate
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Potential Revenue
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="property in propertyBreakdown" :key="property._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ property.name }}</div>
                      <div class="text-sm text-gray-500">{{ property.address?.street }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ property.totalUnits }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ property.occupiedUnits }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ property.vacantUnits }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            class="h-2 rounded-full"
                            :class="getOccupancyColor(property.occupancyRate)"
                            :style="{ width: `${property.occupancyRate}%` }"
                          ></div>
                        </div>
                        <span class="text-sm font-medium">{{ property.occupancyRate }}%</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ $formatMoney(property.potentialRevenue) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Vacant Units Details -->
        <div class="card">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Vacant Units</h3>
            
            <div v-if="vacantUnits.length === 0" class="text-center py-8">
              <BuildingOfficeIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">No Vacant Units</h3>
              <p class="mt-1 text-sm text-gray-500">All units are currently occupied.</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="unit in vacantUnits" :key="unit._id" class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-sm font-medium text-gray-900">
                    {{ unit.propertyId?.name }} - Unit {{ unit.unitNumber }}
                  </h4>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Vacant
                  </span>
                </div>
                <div class="space-y-1 text-sm text-gray-600">
                  <p>{{ unit.bedrooms }}BR / {{ unit.bathrooms }}BA</p>
                  <p>Rent: {{ $formatMoney(unit.rentAmount) }}/month</p>
                  <p v-if="unit.squareFootage">{{ unit.squareFootage }} sq ft</p>
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
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})



// Data
const loading = ref(true)
const occupancyData = ref({
  totalUnits: 0,
  occupiedUnits: 0,
  vacantUnits: 0,
  occupancyRate: 0
})
const propertyBreakdown = ref([])
const vacantUnits = ref([])

// Fetch occupancy data
const fetchOccupancyData = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/reports/occupancy')
    if (response.success) {
      occupancyData.value = response.data.summary
      propertyBreakdown.value = response.data.propertyBreakdown
      vacantUnits.value = response.data.vacantUnits
    }
  } catch (error) {
    console.error('Failed to fetch occupancy data:', error)
  } finally {
    loading.value = false
  }
}

// Get occupancy color based on rate
const getOccupancyColor = (rate) => {
  if (rate >= 90) return 'bg-green-500'
  if (rate >= 75) return 'bg-yellow-500'
  return 'bg-red-500'
}

// Get chart color based on occupancy rate
const getChartColor = (rate, alpha = 0.8) => {
  if (rate >= 90) return `rgba(16, 185, 129, ${alpha})`  // green
  if (rate >= 75) return `rgba(251, 191, 36, ${alpha})`  // yellow
  return `rgba(239, 68, 68, ${alpha})`  // red
}


// Initialize
onMounted(() => {
  fetchOccupancyData()
})
</script>

