<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
          <!-- Header -->
          <div class="flex justify-between items-center mb-8">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Expense Management</h1>
              <p class="text-gray-600 mt-2">Track and manage property expenses</p>
            </div>
            <button
              @click="showAddExpense = true"
              class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Icon name="heroicons:plus" class="w-5 h-5" />
              Add Expense
            </button>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">This Month</p>
                  <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(stats.thisMonth) }}</p>
                </div>
                <div class="bg-red-100 p-3 rounded-full">
                  <Icon name="heroicons:currency-dollar" class="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Last Month</p>
                  <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(stats.lastMonth) }}</p>
                </div>
                <div class="bg-orange-100 p-3 rounded-full">
                  <Icon name="heroicons:chart-bar" class="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p class="text-2xl font-bold text-gray-900">{{ stats.pendingCount }}</p>
                </div>
                <div class="bg-yellow-100 p-3 rounded-full">
                  <Icon name="heroicons:clock" class="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Total YTD</p>
                  <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(stats.yearToDate) }}</p>
                </div>
                <div class="bg-blue-100 p-3 rounded-full">
                  <Icon name="heroicons:calculator" class="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-white p-6 rounded-lg shadow mb-6">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select v-model="filters.category" class="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">All Categories</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="utilities">Utilities</option>
                  <option value="insurance">Insurance</option>
                  <option value="marketing">Marketing</option>
                  <option value="legal">Legal</option>
                  <option value="other">Other</option>
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
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select v-model="filters.status" class="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <input
                  v-model="filters.dateFrom"
                  type="date"
                  class="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <input
                  v-model="filters.dateTo"
                  type="date"
                  class="w-full border border-gray-300 rounded-md px-3 py-2"
                />
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

          <!-- Expenses Table -->
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
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
                  <tr v-for="expense in expenses" :key="expense._id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(expense.date) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <p class="font-medium">{{ expense.description }}</p>
                        <p class="text-gray-500" v-if="expense.vendor">{{ expense.vendor }}</p>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {{ expense.category }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ getPropertyName(expense.propertyId) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ $formatMoney(expense.amount) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusClass(expense.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ expense.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        @click="viewExpense(expense)"
                        class="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        v-if="expense.status === 'pending'"
                        @click="approveExpense(expense._id)"
                        class="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                      <button
                        v-if="expense.status === 'approved'"
                        @click="markAsPaid(expense._id)"
                        class="text-blue-600 hover:text-blue-900"
                      >
                        Mark Paid
                      </button>
                      <button
                        v-if="expense.receipt"
                        @click="viewReceipt(expense._id)"
                        class="text-purple-600 hover:text-purple-900"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Add Expense Modal -->
          <div v-if="showAddExpense" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Add New Expense</h3>
                <button @click="showAddExpense = false" class="text-gray-400 hover:text-gray-600">
                  <Icon name="heroicons:x-mark" class="w-6 h-6" />
                </button>
              </div>
              
              <form @submit.prevent="submitExpense" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    v-model="newExpense.date"
                    type="date"
                    required
                    class="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    v-model="newExpense.description"
                    type="text"
                    required
                    class="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter expense description"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select v-model="newExpense.category" required class="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select Category</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="utilities">Utilities</option>
                    <option value="insurance">Insurance</option>
                    <option value="marketing">Marketing</option>
                    <option value="legal">Legal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Property</label>
                  <select v-model="newExpense.propertyId" required class="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select Property</option>
                    <option v-for="property in properties" :key="property._id" :value="property._id">
                      {{ property.name }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    v-model="newExpense.amount"
                    type="number"
                    step="0.01"
                    required
                    class="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  <input
                    v-model="newExpense.vendor"
                    type="text"
                    class="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Vendor name (optional)"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Receipt</label>
                  <input
                    @change="handleFileUpload"
                    type="file"
                    accept="image/*,.pdf"
                    class="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    v-model="newExpense.notes"
                    rows="3"
                    class="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Additional notes (optional)"
                  ></textarea>
                </div>
                
                <div class="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    @click="showAddExpense = false"
                    class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    :disabled="loading"
                  >
                    {{ loading ? 'Adding...' : 'Add Expense' }}
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

const showAddExpense = ref(false)
const loading = ref(false)
const expenses = ref([])
const properties = ref([])
const stats = ref({
  thisMonth: 0,
  lastMonth: 0,
  pendingCount: 0,
  yearToDate: 0
})

const filters = ref({
  category: '',
  property: '',
  status: '',
  dateFrom: '',
  dateTo: ''
})

const newExpense = ref({
  date: new Date().toISOString().split('T')[0],
  description: '',
  category: '',
  propertyId: '',
  amount: '',
  vendor: '',
  notes: '',
  receipt: null
})

// Get auth composable
const { getAuthHeader } = useAuth()

// Fetch data
const fetchExpenses = async () => {
  try {
    const { data } = await $fetch('/api/expenses', {
      query: filters.value,
      headers: getAuthHeader()
    })
    expenses.value = data
  } catch (error) {
    console.error('Error fetching expenses:', error)
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
    const { data } = await $fetch('/api/expenses/stats', {
      headers: getAuthHeader()
    })
    stats.value = data
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

// Actions
const submitExpense = async () => {
  loading.value = true
  try {
    await $fetch('/api/expenses', {
      method: 'POST',
      headers: getAuthHeader(),
      body: newExpense.value
    })
    
    showAddExpense.value = false
    newExpense.value = {
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: '',
      propertyId: '',
      amount: '',
      vendor: '',
      notes: '',
      receipt: null
    }
    
    await Promise.all([fetchExpenses(), fetchStats()])
  } catch (error) {
    console.error('Error adding expense:', error)
  } finally {
    loading.value = false
  }
}

const approveExpense = async (id) => {
  try {
    await $fetch(`/api/expenses/${id}/approve`, { 
      method: 'POST',
      headers: getAuthHeader()
    })
    await fetchExpenses()
  } catch (error) {
    console.error('Error approving expense:', error)
  }
}

const markAsPaid = async (id) => {
  try {
    await $fetch(`/api/expenses/${id}/pay`, { 
      method: 'POST',
      headers: getAuthHeader()
    })
    await fetchExpenses()
    // Generate receipt after payment
    await generateReceipt(id)
  } catch (error) {
    console.error('Error marking as paid:', error)
  }
}

const generateReceipt = async (id) => {
  try {
    const { data } = await $fetch(`/api/expenses/${id}/receipt`, { 
      method: 'POST',
      headers: getAuthHeader()
    })
    // Open receipt in new window
    window.open(data.receiptUrl, '_blank')
  } catch (error) {
    console.error('Error generating receipt:', error)
  }
}

const viewReceipt = async (id) => {
  try {
    const { data } = await $fetch(`/api/expenses/${id}/receipt`, {
      headers: getAuthHeader()
    })
    window.open(data.receiptUrl, '_blank')
  } catch (error) {
    console.error('Error viewing receipt:', error)
  }
}

const applyFilters = () => {
  fetchExpenses()
}

const clearFilters = () => {
  filters.value = {
    category: '',
    property: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  }
  fetchExpenses()
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    newExpense.value.receipt = file
  }
}


const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPropertyName = (propertyId) => {
  const property = properties.value.find(p => p._id === propertyId)
  return property ? property.name : 'Unknown'
}

const viewExpense = (expense) => {
  navigateTo(`/expenses/${expense._id}`)
}

// Initialize
onMounted(() => {
  Promise.all([fetchExpenses(), fetchProperties(), fetchStats()])
})
</script>
