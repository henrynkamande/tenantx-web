<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
          <!-- Header -->
          <div class="flex justify-between items-center mb-8">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Invoice Management</h1>
              <p class="text-gray-600 mt-2">Create and manage tenant invoices</p>
            </div>
            <button
              @click="showCreateInvoice = true"
              class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Icon name="heroicons:plus" class="w-5 h-5" />
              Create Invoice
            </button>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Outstanding</p>
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
                  <p class="text-sm font-medium text-gray-600">Overdue</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.overdueCount }}</p>
                </div>
                <div class="bg-orange-100 p-3 rounded-full">
                  <Icon name="heroicons:clock" class="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(stats.totalRevenue) }}</p>
                </div>
                <div class="bg-blue-100 p-3 rounded-full">
                  <Icon name="heroicons:chart-bar" class="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-white p-6 rounded-lg shadow mb-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select v-model="filters.status" class="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tenant</label>
                <select v-model="filters.tenant" class="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">All Tenants</option>
                  <option v-for="tenant in tenants" :key="tenant._id" :value="tenant._id">
                    {{ getTenantDisplayName(tenant) }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Property</label>
                <select v-model="filters.property" class="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">All Properties</option>
                  <option v-for="property in properties" :key="property._id" :value="property._id">
                    {{ property.name }}
                  </option>
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
            </div>
            
            <div class="mt-4 flex gap-2">
              <button
                @click="applyFilters"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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

          <!-- Invoices Table -->
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
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
                      {{ getTenantName(invoice.tenantId) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ getPropertyName(invoice.propertyId) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ $formatMoney(invoice.totalAmount) }}
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
                      >
                        View
                      </button>
                      <button
                        v-if="invoice.status === 'draft'"
                        @click="sendInvoice(invoice._id)"
                        class="text-green-600 hover:text-green-900"
                      >
                        Send
                      </button>
                      <button
                        v-if="['sent', 'overdue'].includes(invoice.status)"
                        @click="markAsPaid(invoice._id)"
                        class="text-blue-600 hover:text-blue-900"
                      >
                        Mark Paid
                      </button>
                      <button
                        @click="downloadInvoice(invoice._id)"
                        class="text-purple-600 hover:text-purple-900"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Create Invoice Modal -->
          <div v-if="showCreateInvoice" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Create New Invoice</h3>
                <button @click="showCreateInvoice = false" class="text-gray-400 hover:text-gray-600">
                  <Icon name="heroicons:x-mark" class="w-6 h-6" />
                </button>
              </div>
              
              <form @submit.prevent="submitInvoice" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Property*</label>
                    <select 
                      v-model="newInvoice.propertyId" 
                      @change="onPropertyChange"
                      required 
                      class="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select Property First</option>
                      <option v-for="property in properties" :key="property._id" :value="property._id">
                        {{ property.name }}
                      </option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tenant*</label>
                    <select 
                      v-model="newInvoice.tenantId" 
                      required 
                      class="w-full border border-gray-300 rounded-md px-3 py-2"
                      :disabled="!newInvoice.propertyId"
                    >
                      <option value="">{{ newInvoice.propertyId ? 'Select Tenant' : 'Select Property First' }}</option>
                      <option v-for="tenant in filteredTenants" :key="tenant._id" :value="tenant._id">
                        {{ getTenantDisplayName(tenant) }}
                      </option>
                    </select>
                    <p v-if="newInvoice.propertyId && filteredTenants.length === 0" class="text-sm text-red-600 mt-1">
                      No tenants found for this property
                    </p>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                    <input
                      v-model="newInvoice.issueDate"
                      type="date"
                      required
                      class="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      v-model="newInvoice.dueDate"
                      type="date"
                      required
                      class="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Invoice Items</label>
                  <div class="space-y-2">
                    <div v-for="(item, index) in newInvoice.items" :key="index" class="grid grid-cols-12 gap-2 items-end">
                      <div class="col-span-4">
                        <input
                          v-model="item.description"
                          type="text"
                          placeholder="Description"
                          required
                          class="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div class="col-span-2">
                        <input
                          v-model="item.quantity"
                          type="number"
                          placeholder="Qty"
                          required
                          min="1"
                          class="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div class="col-span-3">
                        <input
                          v-model="item.rate"
                          type="number"
                          step="0.01"
                          placeholder="Rate"
                          required
                          class="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div class="col-span-2">
                        <span class="text-sm font-medium">{{ $formatMoney(item.quantity * item.rate) }}</span>
                      </div>
                      <div class="col-span-1">
                        <button
                          type="button"
                          @click="removeItem(index)"
                          class="text-red-600 hover:text-red-900"
                        >
                          <Icon name="heroicons:trash" class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    @click="addItem"
                    class="mt-2 text-blue-600 hover:text-blue-900 flex items-center gap-1"
                  >
                    <Icon name="heroicons:plus" class="w-4 h-4" />
                    Add Item
                  </button>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                    <input
                      v-model="newInvoice.taxRate"
                      type="number"
                      step="0.01"
                      min="0"
                      class="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                    <input
                      v-model="newInvoice.discount"
                      type="number"
                      step="0.01"
                      min="0"
                      class="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    v-model="newInvoice.notes"
                    rows="3"
                    class="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Additional notes (optional)"
                  ></textarea>
                </div>
                
                <!-- Invoice Total -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{{ $formatMoney(calculateSubtotal()) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Discount:</span>
                      <span>-{{ $formatMoney(newInvoice.discount || 0) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Tax:</span>
                      <span>{{ $formatMoney(calculateTax()) }}</span>
                    </div>
                    <div class="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{{ $formatMoney(calculateTotal()) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    @click="showCreateInvoice = false"
                    class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    :disabled="loading"
                  >
                    {{ loading ? 'Creating...' : 'Create Invoice' }}
                  </button>
                </div>
              </form>
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

const showCreateInvoice = ref(false)
const loading = ref(false)
const invoices = ref([])
const tenants = ref([])
const properties = ref([])
const stats = ref({
  outstanding: 0,
  paidThisMonth: 0,
  overdueCount: 0,
  totalRevenue: 0
})

const filters = ref({
  status: '',
  tenant: '',
  property: '',
  dateRange: ''
})

const newInvoice = ref({
  tenantId: '',
  propertyId: '',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  items: [
    { description: 'Monthly Rent', quantity: 1, rate: 0 }
  ],
  taxRate: 0,
  discount: 0,
  notes: ''
})

// Computed property to filter tenants based on selected property
const filteredTenants = computed(() => {
  if (!newInvoice.value.propertyId) {
    return [];
  }
  return tenants.value.filter(tenant => {
    if (tenant.unitId && tenant.unitId.propertyId) {
      return tenant.unitId.propertyId._id === newInvoice.value.propertyId;
    }
    return false;
  });
});

// Fetch data with authentication headers
const fetchInvoices = async () => {
  try {
    const { data } = await $fetch('/api/invoices', {
      query: filters.value,
      headers: getAuthHeader()
    })
    invoices.value = data
  } catch (error) {
    console.error('Error fetching invoices:', error)
  }
}

const fetchTenants = async () => {
  try {
    const { data } = await $fetch('/api/tenants', {
      headers: getAuthHeader()
    })
    tenants.value = data
  } catch (error) {
    console.error('Error fetching tenants:', error)
  }
}

const fetchProperties = async () => {
  try {
    const { data } = await $fetch('/api/properties', {
      headers: getAuthHeader()
    })
    properties.value = data
  } catch (error) {
    console.error('Error fetching properties:', error)
  }
}

const fetchStats = async () => {
  try {
    const { data } = await $fetch('/api/invoices/stats', {
      headers: getAuthHeader()
    })
    stats.value = data
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

// Property change handler - clear tenant selection when property changes
const onPropertyChange = () => {
  newInvoice.value.tenantId = '';
}

// Actions
const submitInvoice = async () => {
  loading.value = true
  try {
    const invoiceData = {
      ...newInvoice.value,
      subtotal: calculateSubtotal(),
      taxAmount: calculateTax(),
      totalAmount: calculateTotal()
    }
    
    await $fetch('/api/invoices', {
      method: 'POST',
      body: invoiceData,
      headers: getAuthHeader()
    })
    
    showCreateInvoice.value = false
    resetForm()
    await Promise.all([fetchInvoices(), fetchStats()])
  } catch (error) {
    console.error('Error creating invoice:', error)
  } finally {
    loading.value = false
  }
}

const sendInvoice = async (id) => {
  try {
    await $fetch(`/api/invoices/${id}/send`, { 
      method: 'POST',
      headers: getAuthHeader()
    })
    await fetchInvoices()
  } catch (error) {
    console.error('Error sending invoice:', error)
  }
}

const markAsPaid = async (id) => {
  try {
    await $fetch(`/api/invoices/${id}/pay`, { 
      method: 'POST',
      headers: getAuthHeader()
    })
    await fetchInvoices()
    // Generate receipt after payment
    await generateReceipt(id)
  } catch (error) {
    console.error('Error marking as paid:', error)
  }
}

const generateReceipt = async (id) => {
  try {
    const { data } = await $fetch(`/api/invoices/${id}/receipt`, { 
      method: 'POST',
      headers: getAuthHeader()
    })
    window.open(data.receiptUrl, '_blank')
  } catch (error) {
    console.error('Error generating receipt:', error)
  }
}

const viewInvoice = async (id) => {
  try {
    const { data } = await $fetch(`/api/invoices/${id}/view`, {
      headers: getAuthHeader()
    })
    window.open(data.invoiceUrl, '_blank')
  } catch (error) {
    console.error('Error viewing invoice:', error)
  }
}

const downloadInvoice = async (id) => {
  try {
    const { data } = await $fetch(`/api/invoices/${id}/download`, {
      headers: getAuthHeader()
    })
    // Create download link
    const link = document.createElement('a')
    link.href = data.downloadUrl
    link.download = data.filename
    link.click()
  } catch (error) {
    console.error('Error downloading invoice:', error)
  }
}

// Form helpers
const addItem = () => {
  newInvoice.value.items.push({
    description: '',
    quantity: 1,
    rate: 0
  })
}

const removeItem = (index) => {
  newInvoice.value.items.splice(index, 1)
}

const calculateSubtotal = () => {
  return newInvoice.value.items.reduce((sum, item) => {
    return sum + (item.quantity * item.rate)
  }, 0)
}

const calculateTax = () => {
  const subtotal = calculateSubtotal() - (newInvoice.value.discount || 0)
  return subtotal * (newInvoice.value.taxRate || 0) / 100
}

const calculateTotal = () => {
  return calculateSubtotal() - (newInvoice.value.discount || 0) + calculateTax()
}

const resetForm = () => {
  newInvoice.value = {
    tenantId: '',
    propertyId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [
      { description: 'Monthly Rent', quantity: 1, rate: 0 }
    ],
    taxRate: 0,
    discount: 0,
    notes: ''
  }
}

const applyFilters = () => {
  fetchInvoices()
}

const clearFilters = () => {
  filters.value = {
    status: '',
    tenant: '',
    property: '',
    dateRange: ''
  }
  fetchInvoices()
}

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

// Fixed function to get tenant name from personalInfo
const getTenantName = (tenantId) => {
  const tenant = tenants.value.find(t => t._id === tenantId)
  return tenant ? `${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}` : 'Unknown'
}

// Helper function for displaying tenant names in dropdowns
const getTenantDisplayName = (tenant) => {
  return `${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}`
}

const getPropertyName = (propertyId) => {
  const property = properties.value.find(p => p._id === propertyId)
  return property ? property.name : 'Unknown'
}

// Initialize
onMounted(() => {
  Promise.all([fetchInvoices(), fetchTenants(), fetchProperties(), fetchStats()])
})
</script>
