<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Invoices</h1>
        <p class="text-gray-600 mt-2">View and download your invoices</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Outstanding Amount</p>
              <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(stats.outstanding) }}</p>
            </div>
            <div class="bg-red-100 p-3 rounded-full">
              <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Paid This Month</p>
              <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(stats.paidThisMonth) }}</p>
            </div>
            <div class="bg-green-100 p-3 rounded-full">
              <Icon name="heroicons:currency-dollar" class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Overdue Count</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.overdueCount }}</p>
            </div>
            <div class="bg-orange-100 p-3 rounded-full">
              <Icon name="heroicons:clock" class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select v-model="filters.status" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select v-model="filters.dateRange" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">All Time</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="this_year">This Year</option>
            </select>
          </div>
          
          <div class="flex items-end">
            <button
              @click="applyFilters"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2"
            >
              Apply Filters
            </button>
            <button
              @click="clearFilters"
              class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Invoices Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-flex items-center">
            <Icon name="heroicons:arrow-path" class="animate-spin h-5 w-5 mr-3" />
            Loading invoices...
          </div>
        </div>
        
        <div v-else-if="invoices.length === 0" class="p-8 text-center text-gray-500">
          No invoices found.
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="invoice in invoices" :key="invoice._id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ invoice.invoiceNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getPropertyName(invoice.propertyId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ $formatMoney(invoice.totalAmount || invoice.total) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(invoice.issueDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(invoice.dueDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(invoice.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ invoice.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="viewInvoice(invoice._id)"
                    class="text-blue-600 hover:text-blue-900"
                    title="View Invoice"
                  >
                    <Icon name="heroicons:eye" class="w-5 h-5 inline" />
                    View
                  </button>
                  <button
                    @click="downloadInvoice(invoice._id)"
                    class="text-purple-600 hover:text-purple-900"
                    title="Download PDF"
                  >
                    <Icon name="heroicons:arrow-down-tray" class="w-5 h-5 inline" />
                    Download
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payment Methods Help -->
      <div v-if="landlordInfo && landlordInfo.paymentMethods?.length > 0" class="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 class="text-lg font-semibold text-blue-900 mb-4">Payment Methods</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="method in landlordInfo.paymentMethods" :key="method._id" class="bg-white p-4 rounded-lg border border-blue-200">
            <h4 class="font-medium text-blue-800 mb-2">{{ method.label }}</h4>
            <div v-if="method.type === 'mpesa'" class="text-sm text-gray-600">
              <p v-if="method.mpesa.paybill"><strong>Paybill:</strong> {{ method.mpesa.paybill }}</p>
              <p v-if="method.mpesa.till"><strong>Till:</strong> {{ method.mpesa.till }}</p>
              <p><strong>Reference:</strong> Use Invoice Number</p>
            </div>
            <div v-else-if="method.type === 'bank'" class="text-sm text-gray-600">
              <p v-if="method.bank.bankName"><strong>Bank:</strong> {{ method.bank.bankName }}</p>
              <p v-if="method.bank.accountNumber"><strong>Account:</strong> {{ method.bank.accountNumber }}</p>
              <p v-if="method.bank.accountName"><strong>Name:</strong> {{ method.bank.accountName }}</p>
            </div>
            <div v-else class="text-sm text-gray-600">
              <p>{{ method.instructions }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const { getAuthHeader } = useAuth()

const loading = ref(true)
const invoices = ref([])
const properties = ref([])
const landlordInfo = ref(null)
const stats = ref({
  outstanding: 0,
  paidThisMonth: 0,
  overdueCount: 0
})

const filters = ref({
  status: '',
  dateRange: ''
})

// Fetch tenant's invoices
const fetchInvoices = async () => {
  try {
    loading.value = true
    const { data } = await $fetch('/api/tenant/invoices', {
      query: filters.value,
      headers: getAuthHeader()
    })
    invoices.value = data
  } catch (error) {
    console.error('Error fetching invoices:', error)
    invoices.value = []
  } finally {
    loading.value = false
  }
}

// Fetch tenant's properties for reference
const fetchProperties = async () => {
  try {
    const { data } = await $fetch('/api/tenant/properties', {
      headers: getAuthHeader()
    })
    properties.value = data
  } catch (error) {
    console.error('Error fetching properties:', error)
  }
}

// Fetch landlord info for payment methods
const fetchLandlordInfo = async () => {
  try {
    const { data } = await $fetch('/api/tenant/landlord-info', {
      headers: getAuthHeader()
    })
    landlordInfo.value = data
  } catch (error) {
    console.error('Error fetching landlord info:', error)
  }
}

// Fetch invoice stats
const fetchStats = async () => {
  try {
    const { data } = await $fetch('/api/tenant/invoice-stats', {
      headers: getAuthHeader()
    })
    stats.value = data
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

// Actions
const viewInvoice = async (id) => {
  try {
    const { data } = await $fetch(`/api/invoices/${id}/view`, {
      headers: getAuthHeader()
    })
    window.open(data.invoiceUrl, '_blank')
  } catch (error) {
    console.error('Error viewing invoice:', error)
    alert('Failed to view invoice. Please try again.')
  }
}

const downloadInvoice = async (id) => {
  try {
    const headers = {
      ...getAuthHeader(),
      'Accept': 'application/json'
    }
    
    const response = await $fetch(`/api/invoices/${id}/download`, {
      headers
    })
    
    if (response.success && response.data) {
      // Create download link
      const link = document.createElement('a')
      link.href = response.data.downloadUrl
      link.download = response.data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      throw new Error('Invalid response format')
    }
  } catch (error) {
    console.error('Error downloading invoice:', error)
    alert('Failed to download invoice. Please try again.')
  }
}

const applyFilters = () => {
  fetchInvoices()
}

const clearFilters = () => {
  filters.value = {
    status: '',
    dateRange: ''
  }
  fetchInvoices()
}

// Helpers
const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const getStatusClass = (status) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPropertyName = (propertyId) => {
  const property = properties.value.find(p => p._id === propertyId)
  return property ? property.name : 'Unknown Property'
}

// Initialize
onMounted(() => {
  Promise.all([
    fetchInvoices(),
    fetchProperties(),
    fetchLandlordInfo(),
    fetchStats()
  ])
})
</script>
