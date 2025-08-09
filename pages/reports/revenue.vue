<template>
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Revenue Report</h2>
            <p class="text-gray-600">Detailed revenue analysis and breakdown</p>
          </div>
          <NuxtLink to="/reports" class="btn-outline">
            <ArrowLeftIcon class="h-4 w-4 mr-2" />
            Back to Reports
          </NuxtLink>
        </div>

        <!-- Filters -->
        <div class="card mb-6">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="label">Start Date</label>
                <input
                  v-model="filters.startDate"
                  type="date"
                  class="input-field"
                  @change="fetchRevenueData"
                />
              </div>
              <div>
                <label class="label">End Date</label>
                <input
                  v-model="filters.endDate"
                  type="date"
                  class="input-field"
                  @change="fetchRevenueData"
                />
              </div>
              <div>
                <label class="label">Property</label>
                <select
                  v-model="filters.propertyId"
                  class="input-field"
                  @change="fetchRevenueData"
                >
                  <option value="">All Properties</option>
                  <option v-for="property in properties" :key="property._id" :value="property._id">
                    {{ property.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="label">Payment Type</label>
                <select
                  v-model="filters.paymentType"
                  class="input-field"
                  @change="fetchRevenueData"
                >
                  <option value="">All Types</option>
                  <option value="Rent">Rent</option>
                  <option value="Security Deposit">Security Deposit</option>
                  <option value="Late Fee">Late Fee</option>
                  <option value="Pet Fee">Pet Fee</option>
                  <option value="Utility">Utility</option>
                  <option value="Other">Other</option>
                </select>
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
                  <CurrencyDollarIcon class="h-8 w-8 text-green-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(summary.totalRevenue) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <HomeIcon class="h-8 w-8 text-blue-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Rent Revenue</p>
                  <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(summary.rentRevenue) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <ExclamationTriangleIcon class="h-8 w-8 text-yellow-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Late Fees</p>
                  <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(summary.lateFees) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <DocumentTextIcon class="h-8 w-8 text-purple-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Payments</p>
                  <p class="text-2xl font-bold text-gray-900">{{ summary.totalPayments }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Breakdown Chart -->
        <div class="card mb-6">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Monthly Revenue Breakdown</h3>
            <div class="h-80">
              <BarChart
                v-if="monthlyData && monthlyData.length > 0"
                chart-id="monthly-revenue-chart"
                :labels="monthlyData.map(item => item.month)"
                :datasets="[{
                  label: 'Revenue',
                  data: monthlyData.map(item => item.revenue),
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  borderColor: '#3B82F6'
                }]"
                :currency="true"
                :height="300"
              />
              <div v-else class="flex items-center justify-center h-full text-gray-500">
                No monthly data available
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Revenue Table -->
        <div class="card">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Revenue Details</h3>
              <button @click="exportToCSV" class="btn-outline">
                <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
            
            <div v-if="loading" class="flex items-center justify-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month For
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="payment in revenueData" :key="payment._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(payment.paymentDate) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ payment.unitId?.propertyId?.name || 'N/A' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ payment.tenantId?.personalInfo?.firstName }} {{ payment.tenantId?.personalInfo?.lastName }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ payment.paymentType }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatMonthFor(payment.monthFor) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ $formatMoney(payment.amount) }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div v-if="revenueData.length === 0" class="text-center py-8">
                <p class="text-gray-500">No revenue data found for the selected criteria.</p>
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
  CurrencyDollarIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})



// Data
const loading = ref(true)
const properties = ref([])
const revenueData = ref([])
const monthlyData = ref([])
const summary = ref({
  totalRevenue: 0,
  rentRevenue: 0,
  lateFees: 0,
  totalPayments: 0
})

// Filters
const filters = reactive({
  startDate: '',
  endDate: '',
  propertyId: '',
  paymentType: ''
})

// Computed
const maxMonthlyRevenue = computed(() => {
  return Math.max(...monthlyData.value.map(m => m.revenue), 1)
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

// Fetch revenue data
const fetchRevenueData = async () => {
  try {
    loading.value = true
    const query = new URLSearchParams()
    
    if (filters.startDate) query.append('startDate', filters.startDate)
    if (filters.endDate) query.append('endDate', filters.endDate)
    if (filters.propertyId) query.append('propertyId', filters.propertyId)
    if (filters.paymentType) query.append('paymentType', filters.paymentType)
    
    const response = await $fetch(`/api/reports/revenue?${query}`)
    if (response.success) {
      revenueData.value = response.data.payments
      monthlyData.value = response.data.monthlyBreakdown
      summary.value = response.data.summary
    }
  } catch (error) {
    console.error('Failed to fetch revenue data:', error)
  } finally {
    loading.value = false
  }
}

// Export to CSV
const exportToCSV = () => {
  const headers = ['Date', 'Property', 'Tenant', 'Type', 'Month For', 'Amount']
  const csvContent = [
    headers.join(','),
    ...revenueData.value.map(payment => [
      formatDate(payment.paymentDate),
      payment.unitId?.propertyId?.name || 'N/A',
      `${payment.tenantId?.personalInfo?.firstName} ${payment.tenantId?.personalInfo?.lastName}`,
      payment.paymentType,
      formatMonthFor(payment.monthFor),
      payment.amount
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
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

// Format month for
const formatMonthFor = (monthFor) => {
  if (!monthFor) return 'N/A'
  const [year, month] = monthFor.split('-')
  const date = new Date(year, month - 1)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

// Initialize
onMounted(() => {
  // Set default date range (last 12 months)
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 12)
  
  filters.startDate = startDate.toISOString().split('T')[0]
  filters.endDate = endDate.toISOString().split('T')[0]
  
  fetchProperties()
  fetchRevenueData()
})
</script>

