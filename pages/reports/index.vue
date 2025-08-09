<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Reports</h2>
          <p class="text-gray-600 mt-2">Generate detailed reports for your property management business</p>
        </div>

        <!-- Report Categories -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Financial Reports -->
          <div class="card hover:shadow-lg transition-shadow">
            <div class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <CurrencyDollarIcon class="h-8 w-8 text-green-600" />
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Financial Reports</h3>
                  <p class="text-sm text-gray-500">Income, expenses, and financial summaries</p>
                </div>
              </div>
              <div class="space-y-3">
                <NuxtLink to="/reports/revenue" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Revenue Report
                </NuxtLink>
                <NuxtLink to="/reports/rent-roll" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Rent Roll Report
                </NuxtLink>
                <NuxtLink to="/reports/payment-history" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Payment History
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Property Reports -->
          <div class="card hover:shadow-lg transition-shadow">
            <div class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <HomeIcon class="h-8 w-8 text-blue-600" />
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Property Reports</h3>
                  <p class="text-sm text-gray-500">Occupancy, vacancies, and property performance</p>
                </div>
              </div>
              <div class="space-y-3">
                <NuxtLink to="/reports/occupancy" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Occupancy Report
                </NuxtLink>
                <NuxtLink to="/reports/vacancy" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Vacancy Report
                </NuxtLink>
                <NuxtLink to="/reports/property-performance" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Property Performance
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Tenant Reports -->
          <div class="card hover:shadow-lg transition-shadow">
            <div class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <UserGroupIcon class="h-8 w-8 text-purple-600" />
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Tenant Reports</h3>
                  <p class="text-sm text-gray-500">Tenant demographics and lease information</p>
                </div>
              </div>
              <div class="space-y-3">
                <NuxtLink to="/reports/tenant-list" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Tenant Directory
                </NuxtLink>
                <NuxtLink to="/reports/lease-expiration" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Lease Expiration Report
                </NuxtLink>
                <NuxtLink to="/reports/tenant-turnover" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Tenant Turnover Analysis
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Maintenance Reports -->
          <div class="card hover:shadow-lg transition-shadow">
            <div class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <WrenchScrewdriverIcon class="h-8 w-8 text-orange-600" />
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Maintenance Reports</h3>
                  <p class="text-sm text-gray-500">Work orders and maintenance costs</p>
                </div>
              </div>
              <div class="space-y-3">
                <NuxtLink to="/reports/maintenance-summary" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Maintenance Summary
                </NuxtLink>
                <NuxtLink to="/reports/work-orders" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Work Orders Report
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Custom Reports -->
          <div class="card hover:shadow-lg transition-shadow">
            <div class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <ChartBarIcon class="h-8 w-8 text-indigo-600" />
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Analytics</h3>
                  <p class="text-sm text-gray-500">Custom insights and analytics</p>
                </div>
              </div>
              <div class="space-y-3">
                <NuxtLink to="/reports/monthly-summary" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Monthly Summary
                </NuxtLink>
                <NuxtLink to="/reports/custom-reports" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Custom Reports
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Export Options -->
          <div class="card hover:shadow-lg transition-shadow">
            <div class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <DocumentArrowDownIcon class="h-8 w-8 text-gray-600" />
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Export & Print</h3>
                  <p class="text-sm text-gray-500">Download reports in various formats</p>
                </div>
              </div>
              <div class="space-y-3">
                <NuxtLink to="/reports/export" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Advanced Export Options
                </NuxtLink>
                <button @click="quickExport('pdf')" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Quick Export to PDF
                </button>
                <button @click="quickExport('excel')" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Quick Export to Excel
                </button>
                <button @click="printAllReports" class="block text-sm text-primary-600 hover:text-primary-800">
                  → Print Summary
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="mt-12">
          <h3 class="text-lg font-medium text-gray-900 mb-6">Quick Statistics</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="card">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <CurrencyDollarIcon class="h-8 w-8 text-green-600" />
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">This Month Revenue</p>
                    <p class="text-2xl font-bold text-gray-900">{{ currencySymbol }}{{ formatCurrency(quickStats.monthlyRevenue) }}</p>
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
                    <p class="text-sm font-medium text-gray-500">Occupancy Rate</p>
                    <p class="text-2xl font-bold text-gray-900">{{ quickStats.occupancyRate }}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <UserGroupIcon class="h-8 w-8 text-purple-600" />
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Total Tenants</p>
                    <p class="text-2xl font-bold text-gray-900">{{ quickStats.totalTenants }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <ExclamationTriangleIcon class="h-8 w-8 text-red-600" />
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Overdue Payments</p>
                    <p class="text-2xl font-bold text-gray-900">{{ quickStats.overduePayments }}</p>
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
  CurrencyDollarIcon,
  HomeIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { currencySymbol } = useCurrency()



// Quick stats data
const quickStats = ref({
  monthlyRevenue: 0,
  occupancyRate: 0,
  totalTenants: 0,
  overduePayments: 0
})

// Fetch quick stats
const fetchQuickStats = async () => {
  try {
    const response = await $fetch('/api/reports/quick-stats')
    if (response.success) {
      quickStats.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch quick stats:', error)
  }
}

// Quick export functions
const quickExport = (format) => {
  // Generate a quick summary report
  const reportData = {
    title: 'Quick Property Summary',
    generatedAt: new Date().toLocaleString(),
    stats: quickStats.value
  }
  
  if (format === 'pdf') {
    const htmlContent = `
      <html>
      <head>
        <title>Property Summary</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .stat-item { padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>${reportData.title}</h1>
        <p>Generated: ${reportData.generatedAt}</p>
        <div class="stats">
          <div class="stat-item">
            <h3>Monthly Revenue</h3>
            <p>$${formatCurrency(reportData.stats.monthlyRevenue)}</p>
          </div>
          <div class="stat-item">
            <h3>Occupancy Rate</h3>
            <p>${reportData.stats.occupancyRate}%</p>
          </div>
          <div class="stat-item">
            <h3>Total Tenants</h3>
            <p>${reportData.stats.totalTenants}</p>
          </div>
          <div class="stat-item">
            <h3>Overdue Payments</h3>
            <p>${reportData.stats.overduePayments}</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `property-summary-${Date.now()}.html`
    link.click()
    URL.revokeObjectURL(url)
  } else if (format === 'excel') {
    const csvContent = [
      'Property Summary Report',
      `Generated: ${reportData.generatedAt}`,
      '',
      'Metric,Value',
      `Monthly Revenue,$${formatCurrency(reportData.stats.monthlyRevenue)}`,
      `Occupancy Rate,${reportData.stats.occupancyRate}%`,
      `Total Tenants,${reportData.stats.totalTenants}`,
      `Overdue Payments,${reportData.stats.overduePayments}`
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `property-summary-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
}

const printAllReports = () => {
  const printWindow = window.open('', '_blank')
  const reportData = {
    title: 'Property Summary',
    generatedAt: new Date().toLocaleString(),
    stats: quickStats.value
  }
  
  const printContent = `
    <html>
    <head>
      <title>Print Summary</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; page-break-after: avoid; }
        .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .stat-item { padding: 15px; border: 1px solid #ddd; border-radius: 5px; page-break-inside: avoid; }
        .metric-value { font-size: 1.5em; font-weight: bold; color: #333; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>${reportData.title}</h1>
      <p>Generated: ${reportData.generatedAt}</p>
      <div class="stats">
        <div class="stat-item">
          <div>Monthly Revenue</div>
          <div class="metric-value">$${formatCurrency(reportData.stats.monthlyRevenue)}</div>
        </div>
        <div class="stat-item">
          <div>Occupancy Rate</div>
          <div class="metric-value">${reportData.stats.occupancyRate}%</div>
        </div>
        <div class="stat-item">
          <div>Total Tenants</div>
          <div class="metric-value">${reportData.stats.totalTenants}</div>
        </div>
        <div class="stat-item">
          <div>Overdue Payments</div>
          <div class="metric-value">${reportData.stats.overduePayments}</div>
        </div>
      </div>
    </body>
    </html>
  `
  
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Fetch data on mount
onMounted(() => {
  fetchQuickStats()
})
</script>

