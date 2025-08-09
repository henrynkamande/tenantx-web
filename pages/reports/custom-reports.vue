<template>
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Custom Reports</h2>
          <p class="text-gray-600">Create, manage, and generate customized reports for your specific needs</p>
        </div>
        <div class="flex space-x-3">
          <button @click="showCreateModal = true" class="btn-primary">
            <PlusIcon class="h-4 w-4 mr-2" />
            Create New Report
          </button>
          <NuxtLink to="/reports" class="btn-outline">
            <ArrowLeftIcon class="h-4 w-4 mr-2" />
            Back to Reports
          </NuxtLink>
        </div>
      </div>

      <!-- Report Templates -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="card">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Report Templates</h3>
            <div class="space-y-3">
              <button 
                v-for="template in reportTemplates" 
                :key="template.id"
                @click="createFromTemplate(template)"
                class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div class="flex items-center">
                  <component :is="template.icon" class="h-5 w-5 mr-3" :class="template.iconColor" />
                  <div>
                    <p class="font-medium text-gray-900">{{ template.name }}</p>
                    <p class="text-sm text-gray-500">{{ template.description }}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Report Builder Guide</h3>
            <div class="space-y-4">
              <div class="flex items-start">
                <div class="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span class="text-xs font-medium text-primary-600">1</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">Select Data Sources</p>
                  <p class="text-xs text-gray-500">Choose from properties, tenants, payments, or maintenance data</p>
                </div>
              </div>
              <div class="flex items-start">
                <div class="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span class="text-xs font-medium text-primary-600">2</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">Configure Filters</p>
                  <p class="text-xs text-gray-500">Apply date ranges, property filters, and other criteria</p>
                </div>
              </div>
              <div class="flex items-start">
                <div class="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span class="text-xs font-medium text-primary-600">3</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">Choose Output Format</p>
                  <p class="text-xs text-gray-500">Generate as table, chart, or export to CSV/PDF</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Saved Reports -->
      <div class="card mb-8">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Saved Reports</h3>
            <div class="flex space-x-2">
              <select v-model="sortBy" class="input text-sm">
                <option value="name">Sort by Name</option>
                <option value="created">Sort by Date Created</option>
                <option value="lastRun">Sort by Last Run</option>
              </select>
            </div>
          </div>

          <div v-if="loading" class="flex items-center justify-center h-32">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>

          <div v-else-if="savedReports.length === 0" class="text-center py-12">
            <ChartBarIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No custom reports</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by creating your first custom report.</p>
            <div class="mt-6">
              <button @click="showCreateModal = true" class="btn-primary">
                <PlusIcon class="h-4 w-4 mr-2" />
                Create Report
              </button>
            </div>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Run
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="report in sortedReports" :key="report.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <component :is="getReportIcon(report.type)" class="h-5 w-5 mr-3 text-gray-400" />
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ report.name }}</div>
                        <div class="text-sm text-gray-500">{{ report.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {{ report.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(report.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ report.lastRun ? formatDate(report.lastRun) : 'Never' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex space-x-2">
                      <button 
                        @click="runReport(report)"
                        class="text-primary-600 hover:text-primary-900"
                        title="Run Report"
                      >
                        <PlayIcon class="h-4 w-4" />
                      </button>
                      <button 
                        @click="editReport(report)"
                        class="text-gray-400 hover:text-gray-600"
                        title="Edit Report"
                      >
                        <PencilIcon class="h-4 w-4" />
                      </button>
                      <button 
                        @click="duplicateReport(report)"
                        class="text-gray-400 hover:text-gray-600"
                        title="Duplicate Report"
                      >
                        <DocumentDuplicateIcon class="h-4 w-4" />
                      </button>
                      <button 
                        @click="deleteReport(report)"
                        class="text-red-400 hover:text-red-600"
                        title="Delete Report"
                      >
                        <TrashIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Recent Report Results -->
      <div v-if="recentResults.length > 0" class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Report Results</h3>
          <div class="space-y-4">
            <div 
              v-for="result in recentResults" 
              :key="result.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center">
                <component :is="getReportIcon(result.type)" class="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ result.reportName }}</p>
                  <p class="text-xs text-gray-500">Generated {{ formatDate(result.generatedAt) }}</p>
                </div>
              </div>
              <div class="flex space-x-2">
                <button 
                  @click="viewResult(result)"
                  class="text-primary-600 hover:text-primary-900 text-sm"
                >
                  View
                </button>
                <button 
                  @click="downloadResult(result)"
                  class="text-gray-400 hover:text-gray-600"
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

  <!-- Create Report Modal -->
  <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Create Custom Report</h3>
          <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="createReport">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
              <input 
                v-model="newReport.name" 
                type="text" 
                class="input w-full" 
                placeholder="Enter report name"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                v-model="newReport.description" 
                class="input w-full" 
                rows="3"
                placeholder="Describe what this report will show"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select v-model="newReport.type" class="input w-full" required>
                <option value="">Select report type</option>
                <option value="financial">Financial Analysis</option>
                <option value="occupancy">Occupancy Analysis</option>
                <option value="maintenance">Maintenance Analysis</option>
                <option value="tenant">Tenant Analysis</option>
                <option value="custom">Custom Query</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data Sources</label>
              <div class="space-y-2">
                <label v-for="source in dataSources" :key="source.id" class="flex items-center">
                  <input 
                    type="checkbox" 
                    :value="source.id"
                    v-model="newReport.dataSources"
                    class="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ source.name }}</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
              <select v-model="newReport.outputFormat" class="input w-full" required>
                <option value="table">Table View</option>
                <option value="chart">Chart View</option>
                <option value="both">Table & Chart</option>
              </select>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" @click="showCreateModal = false" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              Create Report
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon,
  PlusIcon,
  ChartBarIcon,
  PlayIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  HomeIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Data
const loading = ref(true)
const showCreateModal = ref(false)
const sortBy = ref('name')
const savedReports = ref([])
const recentResults = ref([])

// Form data
const newReport = ref({
  name: '',
  description: '',
  type: '',
  dataSources: [],
  outputFormat: 'table'
})

// Report templates
const reportTemplates = ref([
  {
    id: 'monthly-financial',
    name: 'Monthly Financial Summary',
    description: 'Revenue, expenses, and profit analysis by month',
    icon: CurrencyDollarIcon,
    iconColor: 'text-green-600',
    type: 'financial'
  },
  {
    id: 'property-performance',
    name: 'Property Performance Comparison',
    description: 'Compare occupancy and revenue across properties',
    icon: HomeIcon,
    iconColor: 'text-blue-600',
    type: 'occupancy'
  },
  {
    id: 'tenant-retention',
    name: 'Tenant Retention Analysis',
    description: 'Track lease renewals and turnover rates',
    icon: UserGroupIcon,
    iconColor: 'text-purple-600',
    type: 'tenant'
  },
  {
    id: 'maintenance-costs',
    name: 'Maintenance Cost Breakdown',
    description: 'Analyze maintenance expenses by category and property',
    icon: WrenchScrewdriverIcon,
    iconColor: 'text-orange-600',
    type: 'maintenance'
  }
])

// Data sources
const dataSources = ref([
  { id: 'properties', name: 'Properties' },
  { id: 'units', name: 'Units' },
  { id: 'tenants', name: 'Tenants' },
  { id: 'leases', name: 'Leases' },
  { id: 'payments', name: 'Payments' },
  { id: 'maintenance', name: 'Maintenance Requests' }
])

// Computed
const sortedReports = computed(() => {
  const reports = [...savedReports.value]
  return reports.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'lastRun':
        if (!a.lastRun && !b.lastRun) return 0
        if (!a.lastRun) return 1
        if (!b.lastRun) return -1
        return new Date(b.lastRun) - new Date(a.lastRun)
      default:
        return 0
    }
  })
})

// Methods
const fetchSavedReports = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/reports/custom-reports')
    if (response.success) {
      savedReports.value = response.data.reports
      recentResults.value = response.data.recentResults || []
    }
  } catch (error) {
    console.error('Failed to fetch custom reports:', error)
    // Mock data for demo
    savedReports.value = [
      {
        id: '1',
        name: 'Monthly Revenue Analysis',
        description: 'Track monthly revenue trends across all properties',
        type: 'financial',
        createdAt: '2024-01-15T10:00:00Z',
        lastRun: '2024-01-20T14:30:00Z'
      },
      {
        id: '2',
        name: 'Unit Vacancy Report',
        description: 'Analyze vacancy rates and duration by property',
        type: 'occupancy',
        createdAt: '2024-01-10T09:15:00Z',
        lastRun: null
      }
    ]
    recentResults.value = [
      {
        id: 'r1',
        reportName: 'Monthly Revenue Analysis',
        type: 'financial',
        generatedAt: '2024-01-20T14:30:00Z'
      }
    ]
  } finally {
    loading.value = false
  }
}

const createFromTemplate = (template) => {
  newReport.value = {
    name: template.name,
    description: template.description,
    type: template.type,
    dataSources: getDefaultDataSources(template.type),
    outputFormat: 'both'
  }
  showCreateModal.value = true
}

const getDefaultDataSources = (type) => {
  switch (type) {
    case 'financial':
      return ['properties', 'payments']
    case 'occupancy':
      return ['properties', 'units', 'tenants']
    case 'tenant':
      return ['tenants', 'leases']
    case 'maintenance':
      return ['properties', 'maintenance']
    default:
      return []
  }
}

const createReport = async () => {
  try {
    const response = await $fetch('/api/reports/custom-reports', {
      method: 'POST',
      body: newReport.value
    })
    
    if (response.success) {
      savedReports.value.push(response.data)
      showCreateModal.value = false
      resetForm()
    }
  } catch (error) {
    console.error('Failed to create report:', error)
    // For demo, add to local array
    const mockReport = {
      id: Date.now().toString(),
      ...newReport.value,
      createdAt: new Date().toISOString(),
      lastRun: null
    }
    savedReports.value.push(mockReport)
    showCreateModal.value = false
    resetForm()
  }
}

const resetForm = () => {
  newReport.value = {
    name: '',
    description: '',
    type: '',
    dataSources: [],
    outputFormat: 'table'
  }
}

const runReport = async (report) => {
  try {
    const response = await $fetch(`/api/reports/custom-reports/${report.id}/run`, {
      method: 'POST'
    })
    
    if (response.success) {
      // Update last run time
      report.lastRun = new Date().toISOString()
      
      // Add to recent results
      recentResults.value.unshift({
        id: Date.now().toString(),
        reportName: report.name,
        type: report.type,
        generatedAt: report.lastRun
      })
      
      // Navigate to results view
      await navigateTo(`/reports/custom-reports/${report.id}/results`)
    }
  } catch (error) {
    console.error('Failed to run report:', error)
    // Mock success for demo
    report.lastRun = new Date().toISOString()
    recentResults.value.unshift({
      id: Date.now().toString(),
      reportName: report.name,
      type: report.type,
      generatedAt: report.lastRun
    })
  }
}

const editReport = (report) => {
  newReport.value = { ...report }
  showCreateModal.value = true
}

const duplicateReport = (report) => {
  const duplicate = {
    ...report,
    id: Date.now().toString(),
    name: `${report.name} (Copy)`,
    createdAt: new Date().toISOString(),
    lastRun: null
  }
  savedReports.value.push(duplicate)
}

const deleteReport = (report) => {
  if (confirm(`Are you sure you want to delete "${report.name}"?`)) {
    const index = savedReports.value.findIndex(r => r.id === report.id)
    if (index > -1) {
      savedReports.value.splice(index, 1)
    }
  }
}

const viewResult = (result) => {
  // Navigate to result view
  navigateTo(`/reports/custom-reports/results/${result.id}`)
}

const downloadResult = (result) => {
  // Trigger download
  console.log('Downloading result:', result.id)
}

const getReportIcon = (type) => {
  switch (type) {
    case 'financial':
      return CurrencyDollarIcon
    case 'occupancy':
      return HomeIcon
    case 'tenant':
      return UserGroupIcon
    case 'maintenance':
      return WrenchScrewdriverIcon
    default:
      return DocumentTextIcon
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Initialize
onMounted(() => {
  fetchSavedReports()
})
</script>
