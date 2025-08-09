<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Welcome Section -->
        <div class="card mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {{ user?.firstName }} {{ user?.lastName }}!
              </h2>
              <p class="text-gray-600">
                Here's what's happening with your properties today.
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Occupancy Rate</p>
              <p class="text-2xl font-bold text-primary-600">{{ stats?.occupancyRate || 0 }}%</p>
            </div>
          </div>
        </div>

        <!-- Alerts/Notifications -->
        <div v-if="stats?.overduePayments > 0" class="card bg-red-50 border-red-200 mb-8">
          <div class="flex items-center">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h4 class="text-red-900 font-medium">Attention Required</h4>
              <p class="text-red-700">You have {{ stats.overduePayments }} overdue {{ stats.overduePayments === 1 ? 'payment' : 'payments' }} that {{ stats.overduePayments === 1 ? 'needs' : 'need' }} attention.</p>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div class="card hover:shadow-lg transition-shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <BuildingOfficeIcon class="h-8 w-8 text-primary-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total Properties
                  </dt>
                  <dd class="text-2xl font-bold text-gray-900">
                    {{ stats?.totalProperties || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="card hover:shadow-lg transition-shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <HomeIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total Units
                  </dt>
                  <dd class="text-2xl font-bold text-gray-900">
                    {{ stats?.totalUnits || 0 }}
                  </dd>
                  <dd class="text-xs text-gray-500">
                    {{ stats?.occupiedUnits || 0 }} occupied, {{ stats?.vacantUnits || 0 }} vacant
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="card hover:shadow-lg transition-shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CurrencyDollarIcon class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Monthly Revenue
                  </dt>
                  <dd class="text-2xl font-bold text-gray-900">
                    {{ $formatMoney(stats?.monthlyRevenue || 0) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="card hover:shadow-lg transition-shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ExclamationTriangleIcon class="h-8 w-8 text-red-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Pending Issues
                  </dt>
                  <dd class="text-2xl font-bold text-gray-900">
                    {{ stats?.pendingMaintenance || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <NuxtLink to="/payments/defaulted" class="card hover:shadow-lg transition-shadow cursor-pointer">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ExclamationTriangleIcon class="h-8 w-8 text-orange-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Defaulted Rent
                  </dt>
                  <dd class="text-2xl font-bold text-gray-900">
                    {{ stats?.defaultedPayments || 0 }}
                  </dd>
                  <dd class="text-xs text-orange-600">
                    Click to manage
                  </dd>
                </dl>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Occupancy Chart -->
          <div class="card">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Property Occupancy</h3>
              <div class="h-64">
                <DoughnutChart
                  v-if="stats && (stats.occupiedUnits > 0 || stats.vacantUnits > 0)"
                  chart-id="occupancy-chart"
                  :labels="['Occupied', 'Vacant']"
                  :data="[stats.occupiedUnits || 0, stats.vacantUnits || 0]"
                  :background-color="['#10B981', '#F59E0B']"
                  :height="250"
                />
                <div v-else class="flex items-center justify-center h-full text-gray-500">
                  <div class="text-center">
                    <BuildingOfficeIcon class="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No units available</p>
                    <p class="text-sm">Add properties and units to see occupancy data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Revenue Trend Chart -->
          <div class="card">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Revenue Trend (Last 6 Months)</h3>
              <div class="h-64">
                <LineChart
                  v-if="stats?.revenueData && stats.revenueData.length > 0"
                  chart-id="revenue-trend-chart"
                  :labels="stats.revenueData.map(item => item.label)"
                  :datasets="[{
                    label: 'Monthly Revenue',
                    data: stats.revenueData.map(item => item.value),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true
                  }]"
                  :currency="true"
                  :height="250"
                />
                <div v-else class="flex items-center justify-center h-full text-gray-500">
                  <div class="text-center">
                    <CurrencyDollarIcon class="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No revenue data available</p>
                    <p class="text-sm">Record payments to see revenue trends</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Recent Activities -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
            <div v-if="stats?.recentActivities?.length" class="space-y-4">
              <div 
                v-for="activity in stats.recentActivities.slice(0, 5)" 
                :key="activity.date"
                class="flex items-start space-x-3 p-3 rounded-lg bg-gray-50"
              >
                <div class="flex-shrink-0">
                  <CurrencyDollarIcon v-if="activity.type === 'payment'" class="h-5 w-5 text-green-600" />
                  <WrenchScrewdriverIcon v-else class="h-5 w-5 text-orange-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                  <p class="text-sm text-gray-500">{{ activity.description }}</p>
                  <p class="text-xs text-gray-400">{{ formatDate(activity.date) }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <p class="text-gray-500">No recent activities</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <NuxtLink to="/properties/new" class="btn-primary flex items-center justify-center w-full">
                <PlusIcon class="h-5 w-5 mr-2" />
                Add New Property
              </NuxtLink>
              <NuxtLink to="/tenants/new" class="btn-secondary flex items-center justify-center w-full">
                <UserPlusIcon class="h-5 w-5 mr-2" />
                Add Tenant
              </NuxtLink>
              <NuxtLink to="/payments/new" class="btn-secondary flex items-center justify-center w-full">
                <DocumentPlusIcon class="h-5 w-5 mr-2" />
                Record Payment
              </NuxtLink>
              <NuxtLink to="/maintenance/new" class="btn-secondary flex items-center justify-center w-full">
                <WrenchScrewdriverIcon class="h-5 w-5 mr-2" />
                Report Maintenance
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  BuildingOfficeIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  UserPlusIcon,
  DocumentPlusIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline'
import DoughnutChart from '~/components/charts/DoughnutChart.vue'
import LineChart from '~/components/charts/LineChart.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { user, getAuthHeader } = useAuth()

// Data and state
const loading = ref(true)
const stats = ref(null)

// Fetch dashboard stats
const fetchStats = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/dashboard/stats', {
      headers: getAuthHeader()
    })
    if (response.success) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
  } finally {
    loading.value = false
  }
}

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}


// Fetch data on mount
onMounted(() => {
  fetchStats()
})

// Auto-refresh every 5 minutes
setInterval(() => {
  fetchStats()
}, 5 * 60 * 1000)
</script>
