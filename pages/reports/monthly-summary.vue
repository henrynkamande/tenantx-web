<template>
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Monthly Summary Report</h2>
            <p class="text-gray-600">Comprehensive monthly performance overview</p>
          </div>
          <div class="flex space-x-3">
            <!-- Export Dropdown -->
            <div class="relative" ref="exportDropdown">
              <button 
                @click="showExportMenu = !showExportMenu"
                class="btn-outline flex items-center"
              >
                <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
                Export
                <ChevronDownIcon class="h-4 w-4 ml-1" />
              </button>
              
              <div 
                v-if="showExportMenu" 
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
              >
                <div class="py-1">
                  <button 
                    @click="exportToPDF"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <DocumentIcon class="h-4 w-4 mr-2 text-red-500" />
                    Export to PDF
                  </button>
                  <button 
                    @click="exportToExcel"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <TableCellsIcon class="h-4 w-4 mr-2 text-green-500" />
                    Export to Excel
                  </button>
                  <button 
                    @click="exportToCSV"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <DocumentTextIcon class="h-4 w-4 mr-2 text-blue-500" />
                    Export to CSV
                  </button>
                  <hr class="my-1" />
                  <button 
                    @click="printReport"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <PrinterIcon class="h-4 w-4 mr-2 text-gray-500" />
                    Print Report
                  </button>
                </div>
              </div>
            </div>
            
            <NuxtLink to="/reports" class="btn-outline">
              <ArrowLeftIcon class="h-4 w-4 mr-2" />
              Back to Reports
            </NuxtLink>
          </div>
        </div>

        <!-- Month Selector -->
        <div class="card mb-6">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Select Month</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select v-model="selectedYear" class="input" @change="fetchSummaryData">
                  <option v-for="year in availableYears" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select v-model="selectedMonth" class="input" @change="fetchSummaryData">
                  <option v-for="(month, index) in months" :key="index" :value="index + 1">
                    {{ month }}
                  </option>
                </select>
              </div>
              <div class="flex items-end">
                <button @click="fetchSummaryData" class="btn-primary">
                  <MagnifyingGlassIcon class="h-4 w-4 mr-2" />
                  Update Report
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <div v-else>
          <!-- Key Performance Indicators -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="card">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <CurrencyDollarIcon class="h-8 w-8 text-green-600" />
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(summary.totalRevenue) }}</p>
                    <p :class="{
                      'text-xs mt-1': true,
                      'text-green-600': summary.revenueChange >= 0,
                      'text-red-600': summary.revenueChange < 0
                    }">
                      {{ summary.revenueChange >= 0 ? '↑' : '↓' }} {{ Math.abs(summary.revenueChange) }}% vs last month
                    </p>
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
                    <p class="text-2xl font-bold text-gray-900">{{ summary.occupancyRate }}%</p>
                    <p :class="{
                      'text-xs mt-1': true,
                      'text-green-600': summary.occupancyChange >= 0,
                      'text-red-600': summary.occupancyChange < 0
                    }">
                      {{ summary.occupancyChange >= 0 ? '↑' : '↓' }} {{ Math.abs(summary.occupancyChange) }}% vs last month
                    </p>
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
                    <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(summary.maintenanceCosts) }}</p>
                    <p :class="{
                      'text-xs mt-1': true,
                      'text-red-600': summary.maintenanceChange >= 0,
                      'text-green-600': summary.maintenanceChange < 0
                    }">
                      {{ summary.maintenanceChange >= 0 ? '↑' : '↓' }} {{ Math.abs(summary.maintenanceChange) }}% vs last month
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <BanknotesIcon class="h-8 w-8 text-purple-600" />
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Net Income</p>
                    <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(summary.netIncome) }}</p>
                    <p :class="{
                      'text-xs mt-1': true,
                      'text-green-600': summary.netIncomeChange >= 0,
                      'text-red-600': summary.netIncomeChange < 0
                    }">
                      {{ summary.netIncomeChange >= 0 ? '↑' : '↓' }} {{ Math.abs(summary.netIncomeChange) }}% vs last month
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="card">
              <div class="p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Revenue Breakdown</h3>
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Rent Revenue</span>
                    <span class="text-sm font-medium text-gray-900">{{ $formatMoney(summary.rentRevenue) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Late Fees</span>
                    <span class="text-sm font-medium text-gray-900">{{ $formatMoney(summary.lateFees) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Other Income</span>
                    <span class="text-sm font-medium text-gray-900">{{ $formatMoney(summary.otherIncome) }}</span>
                  </div>
                  <div class="border-t pt-4">
                    <div class="flex justify-between items-center">
                      <span class="text-base font-medium text-gray-900">Total Revenue</span>
                      <span class="text-base font-bold text-green-600">{{ $formatMoney(summary.totalRevenue) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Expense Breakdown</h3>
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Maintenance</span>
                    <span class="text-sm font-medium text-red-600">{{ $formatMoney(summary.maintenanceCosts) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Property Management</span>
                    <span class="text-sm font-medium text-red-600">{{ $formatMoney(summary.managementFees) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Insurance</span>
                    <span class="text-sm font-medium text-red-600">{{ $formatMoney(summary.insurance) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Other Expenses</span>
                    <span class="text-sm font-medium text-red-600">{{ $formatMoney(summary.otherExpenses) }}</span>
                  </div>
                  <div class="border-t pt-4">
                    <div class="flex justify-between items-center">
                      <span class="text-base font-medium text-gray-900">Total Expenses</span>
                      <span class="text-base font-bold text-red-600">{{ $formatMoney(summary.totalExpenses) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Monthly Activities -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="card">
              <div class="p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Tenant Activities</h3>
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">New Move-ins</span>
                    <span class="text-sm font-medium text-green-600">{{ summary.newMoveIns }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Move-outs</span>
                    <span class="text-sm font-medium text-red-600">{{ summary.moveOuts }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Lease Renewals</span>
                    <span class="text-sm font-medium text-blue-600">{{ summary.leaseRenewals }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Evictions</span>
                    <span class="text-sm font-medium text-red-600">{{ summary.evictions }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Maintenance Summary</h3>
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">New Requests</span>
                    <span class="text-sm font-medium text-blue-600">{{ summary.newMaintenanceRequests }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Completed</span>
                    <span class="text-sm font-medium text-green-600">{{ summary.completedMaintenance }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Emergency Requests</span>
                    <span class="text-sm font-medium text-red-600">{{ summary.emergencyRequests }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Avg Resolution</span>
                    <span class="text-sm font-medium text-gray-900">{{ summary.avgResolutionTime }} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Property Performance -->
          <div class="card">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Property Performance</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Occupancy
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expenses
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Income
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Work Orders
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="property in propertyPerformance" :key="property._id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{{ property.name }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="text-sm font-medium text-gray-900 mr-2">{{ property.occupancyRate }}%</div>
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
                        {{ $formatMoney(property.revenue) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {{ $formatMoney(property.expenses) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span :class="{
                          'text-green-600': property.netIncome >= 0,
                          'text-red-600': property.netIncome < 0
                        }">
                          {{ $formatMoney(property.netIncome) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ property.workOrders }}
                      </td>
                    </tr>
                  </tbody>
                </table>
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
  CurrencyDollarIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  BanknotesIcon,
  ChevronDownIcon,
  DocumentIcon,
  TableCellsIcon,
  DocumentTextIcon,
  PrinterIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Data
const loading = ref(true)
const summary = ref({})
const propertyPerformance = ref([])
const showExportMenu = ref(false)
const exportDropdown = ref(null)

// Date selection
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)
const availableYears = ref([])
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Initialize available years (current year and 2 years back)
const initializeYears = () => {
  const currentYear = new Date().getFullYear()
  availableYears.value = [currentYear - 2, currentYear - 1, currentYear]
}

// Fetch monthly summary data
const fetchSummaryData = async () => {
  try {
    loading.value = true
    const response = await $fetch(`/api/reports/monthly-summary?year=${selectedYear.value}&month=${selectedMonth.value}`)
    if (response.success) {
      summary.value = response.data.summary
      propertyPerformance.value = response.data.propertyPerformance
    }
  } catch (error) {
    console.error('Failed to fetch monthly summary:', error)
  } finally {
    loading.value = false
  }
}

// Export functions
const exportToCSV = () => {
  if (propertyPerformance.value.length === 0) return

  const reportData = generateReportData()
  const csvContent = convertToCSV(reportData)
  downloadFile(csvContent, 'text/csv', 'csv')
  showExportMenu.value = false
}

const exportToExcel = async () => {
  try {
    // Using a library like xlsx or SheetJS for Excel export
    const reportData = generateReportData()
    const excelContent = await convertToExcel(reportData)
    downloadFile(excelContent, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx')
    showExportMenu.value = false
  } catch (error) {
    console.error('Excel export failed:', error)
  }
}

const exportToPDF = async () => {
  try {
    const reportData = generateReportData()
    const pdfContent = await convertToPDF(reportData)
    downloadFile(pdfContent, 'application/pdf', 'pdf')
    showExportMenu.value = false
  } catch (error) {
    console.error('PDF export failed:', error)
  }
}

const printReport = () => {
  showExportMenu.value = false
  // Create a print-friendly version
  const printWindow = window.open('', '_blank')
  const printContent = generatePrintHTML()
  
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

// Helper functions for export
const generateReportData = () => {
  return {
    title: 'Monthly Summary Report',
    period: `${months[selectedMonth.value - 1]} ${selectedYear.value}`,
    generatedAt: new Date().toLocaleString(),
    summary: summary.value,
    propertyPerformance: propertyPerformance.value
  }
}

const convertToCSV = (data) => {
  const lines = []
  
  // Add header
  lines.push(`"${data.title}"`)
  lines.push(`"Period: ${data.period}"`)
  lines.push(`"Generated: ${data.generatedAt}"`)
  lines.push('')
  
  // Add summary data
  lines.push('"SUMMARY"')
  lines.push('"Metric","Value"')
  lines.push(`"Total Revenue","${data.summary.totalRevenue}"`)
  lines.push(`"Occupancy Rate","${data.summary.occupancyRate}%"`)
  lines.push(`"Maintenance Costs","${data.summary.maintenanceCosts}"`)
  lines.push(`"Net Income","${data.summary.netIncome}"`)
  lines.push('')
  
  // Add property performance
  lines.push('"PROPERTY PERFORMANCE"')
  lines.push('"Property Name","Occupancy Rate (%)","Revenue ($)","Expenses ($)","Net Income ($)","Work Orders"')
  
  data.propertyPerformance.forEach(property => {
    lines.push([
      `"${property.name}"`,
      property.occupancyRate,
      property.revenue,
      property.expenses,
      property.netIncome,
      property.workOrders
    ].join(','))
  })
  
  return lines.join('\n')
}

const convertToExcel = async (data) => {
  // This would require a library like xlsx
  // For now, we'll create a more structured CSV that Excel can import better
  const lines = []
  
  // Summary sheet
  lines.push(`${data.title},,,,`)
  lines.push(`Period: ${data.period},,,,`)
  lines.push(`Generated: ${data.generatedAt},,,,`)
  lines.push(',,,,')  
  lines.push('SUMMARY,,,,') 
  lines.push('Metric,Value,,,')  
  lines.push(`Total Revenue,${data.summary.totalRevenue},,,`)
  lines.push(`Occupancy Rate,${data.summary.occupancyRate}%,,,`)
  lines.push(`Maintenance Costs,${data.summary.maintenanceCosts},,,`)
  lines.push(`Net Income,${data.summary.netIncome},,,`)
  lines.push(',,,,') 
  lines.push('PROPERTY PERFORMANCE,,,,') 
  lines.push('Property Name,Occupancy Rate (%),Revenue ($),Expenses ($),Net Income ($),Work Orders')
  
  data.propertyPerformance.forEach(property => {
    lines.push([
      property.name,
      property.occupancyRate,
      property.revenue,
      property.expenses,
      property.netIncome,
      property.workOrders
    ].join(','))
  })
  
  return lines.join('\n')
}

const convertToPDF = async (data) => {
  // This would require a library like jsPDF
  // For now, we'll create HTML that can be saved as PDF
  const htmlContent = `
    <html>
    <head>
      <title>${data.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; }
        h2 { color: #666; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .summary-item { padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .metric-value { font-size: 1.5em; font-weight: bold; color: #333; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>${data.title}</h1>
      <p><strong>Period:</strong> ${data.period}</p>
      <p><strong>Generated:</strong> ${data.generatedAt}</p>
      
      <h2>Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <div>Total Revenue</div>
          <div class="metric-value">${data.summary.totalRevenue}</div>
        </div>
        <div class="summary-item">
          <div>Occupancy Rate</div>
          <div class="metric-value">${data.summary.occupancyRate}%</div>
        </div>
        <div class="summary-item">
          <div>Maintenance Costs</div>
          <div class="metric-value">${data.summary.maintenanceCosts}</div>
        </div>
        <div class="summary-item">
          <div>Net Income</div>
          <div class="metric-value">${data.summary.netIncome}</div>
        </div>
      </div>
      
      <h2>Property Performance</h2>
      <table>
        <thead>
          <tr>
            <th>Property Name</th>
            <th>Occupancy Rate</th>
            <th>Revenue</th>
            <th>Expenses</th>
            <th>Net Income</th>
            <th>Work Orders</th>
          </tr>
        </thead>
        <tbody>
          ${data.propertyPerformance.map(property => `
            <tr>
              <td>${property.name}</td>
              <td>${property.occupancyRate}%</td>
              <td>${property.revenue}</td>
              <td>${property.expenses}</td>
              <td>${property.netIncome}</td>
              <td>${property.workOrders}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `
  
  return htmlContent
}

const generatePrintHTML = () => {
  const data = generateReportData()
  return convertToPDF(data)
}

const downloadFile = (content, mimeType, extension) => {
  const blob = new Blob([content], { type: mimeType })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  const filename = `monthly-summary-${selectedYear.value}-${selectedMonth.value.toString().padStart(2, '0')}.${extension}`
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}


// Close export menu when clicking outside
const handleClickOutside = (event) => {
  if (exportDropdown.value && !exportDropdown.value.contains(event.target)) {
    showExportMenu.value = false
  }
}

// Initialize
onMounted(() => {
  initializeYears()
  fetchSummaryData()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

