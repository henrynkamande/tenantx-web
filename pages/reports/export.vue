<template>
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Export & Print Reports</h2>
          <p class="text-gray-600">Configure and download reports in various formats</p>
        </div>
        <div class="flex space-x-3">
          <NuxtLink to="/reports" class="btn-outline">
            <ArrowLeftIcon class="h-4 w-4 mr-2" />
            Back to Reports
          </NuxtLink>
        </div>
      </div>

      <!-- Export Configuration -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Configuration Panel -->
        <div class="lg:col-span-2">
          <div class="card">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-6">Export Configuration</h3>
              
              <!-- Report Selection -->
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Select Report Type</label>
                  <select v-model="exportConfig.reportType" class="input w-full" @change="updateReportFields">
                    <option value="">Choose a report type</option>
                    <option value="monthly-summary">Monthly Summary</option>
                    <option value="payment-history">Payment History</option>
                    <option value="occupancy">Occupancy Report</option>
                    <option value="maintenance">Maintenance Summary</option>
                    <option value="tenant-list">Tenant Directory</option>
                    <option value="custom">Custom Report</option>
                  </select>
                </div>

                <!-- Date Range -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input v-model="exportConfig.startDate" type="date" class="input w-full" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input v-model="exportConfig.endDate" type="date" class="input w-full" />
                  </div>
                </div>

                <!-- Filters -->
                <div v-if="availableFilters.length > 0">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Filters</label>
                  <div class="space-y-3">
                    <div v-for="filter in availableFilters" :key="filter.key" class="flex items-center space-x-3">
                      <input 
                        :id="filter.key"
                        v-model="exportConfig.filters[filter.key]"
                        type="checkbox"
                        class="h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                      <label :for="filter.key" class="text-sm text-gray-700">{{ filter.label }}</label>
                    </div>
                  </div>
                </div>

                <!-- Properties Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Properties</label>
                  <select v-model="exportConfig.propertyId" class="input w-full">
                    <option value="">All Properties</option>
                    <option v-for="property in properties" :key="property._id" :value="property._id">
                      {{ property.name }}
                    </option>
                  </select>
                </div>

                <!-- Output Format -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label 
                      v-for="format in outputFormats" 
                      :key="format.value"
                      class="relative flex items-center justify-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      :class="exportConfig.format === format.value ? 'border-primary-500 bg-primary-50' : 'border-gray-300'"
                    >
                      <input 
                        v-model="exportConfig.format" 
                        :value="format.value" 
                        type="radio" 
                        class="sr-only"
                      />
                      <div class="text-center">
                        <component :is="format.icon" class="h-6 w-6 mx-auto mb-1" :class="format.iconColor" />
                        <span class="text-xs font-medium text-gray-900">{{ format.label }}</span>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Advanced Options -->
                <div class="border-t pt-6">
                  <h4 class="text-md font-medium text-gray-900 mb-3">Advanced Options</h4>
                  <div class="space-y-3">
                    <label class="flex items-center">
                      <input 
                        v-model="exportConfig.includeCharts"
                        type="checkbox"
                        class="h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Include charts and graphs</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        v-model="exportConfig.includeSummary"
                        type="checkbox"
                        class="h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Include executive summary</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        v-model="exportConfig.includeRawData"
                        type="checkbox"
                        class="h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Include raw data tables</span>
                    </label>
                  </div>
                </div>

                <!-- Custom Template -->
                <div v-if="exportConfig.format === 'pdf'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">PDF Template</label>
                  <select v-model="exportConfig.template" class="input w-full">
                    <option value="standard">Standard Template</option>
                    <option value="executive">Executive Summary</option>
                    <option value="detailed">Detailed Report</option>
                    <option value="branded">Branded Template</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview & Actions -->
        <div class="lg:col-span-1">
          <!-- Preview -->
          <div class="card mb-6">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Preview</h3>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <DocumentIcon class="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p class="text-sm text-gray-500">
                  {{ exportConfig.reportType ? `${getReportName(exportConfig.reportType)} Preview` : 'Select a report type to preview' }}
                </p>
                <div v-if="exportConfig.reportType" class="mt-3 text-xs text-gray-400">
                  <p>Format: {{ exportConfig.format?.toUpperCase() || 'Not selected' }}</p>
                  <p>Date Range: {{ formatDateRange() }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Export Actions -->
          <div class="card">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div class="space-y-3">
                <button 
                  @click="generateReport"
                  :disabled="!canGenerate"
                  class="btn-primary w-full"
                  :class="{ 'opacity-50 cursor-not-allowed': !canGenerate }"
                >
                  <PlayIcon class="h-4 w-4 mr-2" />
                  Generate & Download
                </button>
                
                <button 
                  @click="previewReport"
                  :disabled="!canGenerate"
                  class="btn-outline w-full"
                  :class="{ 'opacity-50 cursor-not-allowed': !canGenerate }"
                >
                  <EyeIcon class="h-4 w-4 mr-2" />
                  Preview Report
                </button>
                
                <button 
                  @click="scheduleReport"
                  :disabled="!canGenerate"
                  class="btn-outline w-full"
                  :class="{ 'opacity-50 cursor-not-allowed': !canGenerate }"
                >
                  <ClockIcon class="h-4 w-4 mr-2" />
                  Schedule Report
                </button>
              </div>

              <!-- Save Configuration -->
              <div class="mt-6 pt-6 border-t">
                <button @click="saveConfiguration" class="btn-secondary w-full">
                  <BookmarkIcon class="h-4 w-4 mr-2" />
                  Save Configuration
                </button>
              </div>
            </div>
          </div>

          <!-- Recent Exports -->
          <div v-if="recentExports.length > 0" class="card mt-6">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Exports</h3>
              <div class="space-y-3">
                <div 
                  v-for="export_ in recentExports.slice(0, 5)" 
                  :key="export_.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center">
                    <component :is="getFormatIcon(export_.format)" class="h-4 w-4 mr-2 text-gray-500" />
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ export_.name }}</p>
                      <p class="text-xs text-gray-500">{{ formatDate(export_.createdAt) }}</p>
                    </div>
                  </div>
                  <button 
                    @click="downloadExport(export_)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    <ArrowDownTrayIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Schedule Modal -->
  <div v-if="showScheduleModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Schedule Report</h3>
          <button @click="showScheduleModal = false" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <select v-model="scheduleConfig.frequency" class="input w-full">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input v-model="scheduleConfig.startDate" type="date" class="input w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email Recipients</label>
            <textarea 
              v-model="scheduleConfig.recipients" 
              class="input w-full" 
              rows="3"
              placeholder="Enter email addresses separated by commas"
            ></textarea>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button @click="showScheduleModal = false" class="btn-secondary">
            Cancel
          </button>
          <button @click="createSchedule" class="btn-primary">
            Schedule Report
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon,
  DocumentIcon,
  PlayIcon,
  EyeIcon,
  ClockIcon,
  BookmarkIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentTextIcon,
  TableCellsIcon,
  PrinterIcon,
  PresentationChartLineIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Data
const properties = ref([])
const recentExports = ref([])
const showScheduleModal = ref(false)

// Export configuration
const exportConfig = ref({
  reportType: '',
  startDate: '',
  endDate: '',
  propertyId: '',
  format: 'pdf',
  includeCharts: true,
  includeSummary: true,
  includeRawData: true,
  template: 'standard',
  filters: {}
})

// Schedule configuration
const scheduleConfig = ref({
  frequency: 'monthly',
  startDate: '',
  recipients: ''
})

// Output formats
const outputFormats = ref([
  { 
    value: 'pdf', 
    label: 'PDF', 
    icon: DocumentIcon, 
    iconColor: 'text-red-500' 
  },
  { 
    value: 'excel', 
    label: 'Excel', 
    icon: TableCellsIcon, 
    iconColor: 'text-green-500' 
  },
  { 
    value: 'csv', 
    label: 'CSV', 
    icon: DocumentTextIcon, 
    iconColor: 'text-blue-500' 
  },
  { 
    value: 'print', 
    label: 'Print', 
    icon: PrinterIcon, 
    iconColor: 'text-gray-500' 
  }
])

// Available filters based on report type
const availableFilters = computed(() => {
  const filterMap = {
    'payment-history': [
      { key: 'includeOverdue', label: 'Include overdue payments' },
      { key: 'groupByProperty', label: 'Group by property' },
      { key: 'includeTenantDetails', label: 'Include tenant details' }
    ],
    'occupancy': [
      { key: 'includeVacant', label: 'Include vacant units' },
      { key: 'showHistorical', label: 'Show historical data' }
    ],
    'maintenance': [
      { key: 'includeCompleted', label: 'Include completed requests' },
      { key: 'groupByPriority', label: 'Group by priority' },
      { key: 'includeCosts', label: 'Include cost breakdown' }
    ]
  }
  
  return filterMap[exportConfig.value.reportType] || []
})

// Computed
const canGenerate = computed(() => {
  return exportConfig.value.reportType && exportConfig.value.format
})

// Methods
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

const fetchRecentExports = async () => {
  try {
    const response = await $fetch('/api/reports/exports/recent')
    if (response.success) {
      recentExports.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch recent exports:', error)
    // Mock data for demo
    recentExports.value = [
      {
        id: '1',
        name: 'Monthly Summary - December 2024',
        format: 'pdf',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Payment History Report',
        format: 'excel',
        createdAt: '2024-01-14T15:30:00Z'
      }
    ]
  }
}

const updateReportFields = () => {
  // Reset filters when report type changes
  exportConfig.value.filters = {}
  
  // Set default date range based on report type
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  exportConfig.value.startDate = firstDay.toISOString().split('T')[0]
  exportConfig.value.endDate = lastDay.toISOString().split('T')[0]
}

const getReportName = (type) => {
  const names = {
    'monthly-summary': 'Monthly Summary',
    'payment-history': 'Payment History',
    'occupancy': 'Occupancy Report',
    'maintenance': 'Maintenance Summary',
    'tenant-list': 'Tenant Directory',
    'custom': 'Custom Report'
  }
  return names[type] || 'Unknown Report'
}

const formatDateRange = () => {
  if (!exportConfig.value.startDate || !exportConfig.value.endDate) {
    return 'Not specified'
  }
  
  const start = new Date(exportConfig.value.startDate).toLocaleDateString()
  const end = new Date(exportConfig.value.endDate).toLocaleDateString()
  return `${start} - ${end}`
}

const generateReport = async () => {
  try {
    const response = await $fetch('/api/reports/export', {
      method: 'POST',
      body: exportConfig.value
    })
    
    if (response.success) {
      // Trigger download
      const link = document.createElement('a')
      link.href = response.data.downloadUrl
      link.download = response.data.filename
      link.click()
      
      // Refresh recent exports
      fetchRecentExports()
    }
  } catch (error) {
    console.error('Failed to generate report:', error)
    
    // Mock download for demo
    const filename = `${exportConfig.value.reportType}-${Date.now()}.${exportConfig.value.format}`
    const content = `Mock ${exportConfig.value.format.toUpperCase()} content for ${getReportName(exportConfig.value.reportType)}`
    
    const blob = new Blob([content], { 
      type: exportConfig.value.format === 'pdf' ? 'application/pdf' : 'text/plain' 
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }
}

const previewReport = () => {
  // Open preview in new window
  const previewWindow = window.open('', '_blank')
  previewWindow.document.write(`
    <html>
      <head><title>Report Preview</title></head>
      <body>
        <h1>${getReportName(exportConfig.value.reportType)} Preview</h1>
        <p>Date Range: ${formatDateRange()}</p>
        <p>Format: ${exportConfig.value.format.toUpperCase()}</p>
        <p>This is a preview of your report. The actual report will contain your data.</p>
      </body>
    </html>
  `)
  previewWindow.document.close()
}

const scheduleReport = () => {
  showScheduleModal.value = true
}

const createSchedule = async () => {
  try {
    const scheduleData = {
      ...exportConfig.value,
      schedule: scheduleConfig.value
    }
    
    const response = await $fetch('/api/reports/schedule', {
      method: 'POST',
      body: scheduleData
    })
    
    if (response.success) {
      showScheduleModal.value = false
      // Show success message
      alert('Report scheduled successfully!')
    }
  } catch (error) {
    console.error('Failed to schedule report:', error)
    // Mock success for demo
    showScheduleModal.value = false
    alert('Report scheduled successfully! (Demo)')
  }
}

const saveConfiguration = () => {
  // Save current configuration to local storage or API
  localStorage.setItem('exportConfig', JSON.stringify(exportConfig.value))
  alert('Configuration saved!')
}

const getFormatIcon = (format) => {
  const iconMap = {
    pdf: DocumentIcon,
    excel: TableCellsIcon,
    csv: DocumentTextIcon,
    print: PrinterIcon
  }
  return iconMap[format] || DocumentIcon
}

const downloadExport = (export_) => {
  // Mock download
  alert(`Downloading ${export_.name}`)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Initialize
onMounted(() => {
  fetchProperties()
  fetchRecentExports()
  
  // Load saved configuration
  const saved = localStorage.getItem('exportConfig')
  if (saved) {
    try {
      exportConfig.value = { ...exportConfig.value, ...JSON.parse(saved) }
    } catch (error) {
      console.error('Failed to load saved configuration:', error)
    }
  }
})
</script>
