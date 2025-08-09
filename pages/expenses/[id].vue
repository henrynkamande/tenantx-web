<template>
  <div>
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center">
            <button @click="navigateTo('/expenses')" class="mr-4 p-2 text-gray-400 hover:text-gray-600">
              <ArrowLeftIcon class="h-6 w-6" />
            </button>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Expense Details</h2>
              <p class="text-gray-600">View expense information and history</p>
            </div>
          </div>
          <div class="flex space-x-3">
            <button 
              v-if="expense && expense.status === 'pending'" 
              @click="approveExpense" 
              class="btn-primary"
            >
              <CheckIcon class="h-5 w-5 mr-2" />
              Approve
            </button>
            <button 
              v-if="expense && expense.status === 'approved'" 
              @click="markAsPaid" 
              class="btn-primary"
            >
              <CurrencyDollarIcon class="h-5 w-5 mr-2" />
              Mark as Paid
            </button>
            <button 
              v-if="expense && expense.receipt" 
              @click="viewReceipt" 
              class="btn-secondary"
            >
              <DocumentTextIcon class="h-5 w-5 mr-2" />
              View Receipt
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <!-- Expense Details -->
        <div v-else-if="expense" class="space-y-6">
          <!-- Status Banner -->
          <div class="card">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <component 
                    :is="getStatusIcon(expense.status)" 
                    :class="getStatusIconClass(expense.status)" 
                    class="h-8 w-8" 
                  />
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Expense Status</h3>
                  <span 
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1"
                    :class="getStatusClass(expense.status)"
                  >
                    {{ expense.status }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold text-gray-900">{{ $formatMoney(expense.amount) }}</div>
                <div class="text-sm text-gray-500">{{ expense.category }}</div>
              </div>
            </div>
          </div>

          <!-- Expense Information Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Basic Information -->
            <div class="card">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Expense Information</h3>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Expense ID</dt>
                  <dd class="text-sm text-gray-900 font-mono">{{ expense._id }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Date</dt>
                  <dd class="text-sm text-gray-900">{{ formatDate(expense.date) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Description</dt>
                  <dd class="text-sm text-gray-900">{{ expense.description }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Category</dt>
                  <dd class="text-sm text-gray-900">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {{ expense.category }}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Amount</dt>
                  <dd class="text-sm text-gray-900 font-semibold">{{ $formatMoney(expense.amount) }}</dd>
                </div>
                <div v-if="expense.vendor">
                  <dt class="text-sm font-medium text-gray-500">Vendor</dt>
                  <dd class="text-sm text-gray-900">{{ expense.vendor }}</dd>
                </div>
              </dl>
            </div>

            <!-- Property Information -->
            <div class="card">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Property Information</h3>
              <dl class="space-y-3">
                <div v-if="expense.property">
                  <dt class="text-sm font-medium text-gray-500">Property Name</dt>
                  <dd class="text-sm text-gray-900">{{ expense.property.name }}</dd>
                </div>
                <div v-if="expense.property?.address">
                  <dt class="text-sm font-medium text-gray-500">Address</dt>
                  <dd class="text-sm text-gray-900">
                    {{ expense.property.address.street }}<br>
                    {{ expense.property.address.city }}, {{ expense.property.address.state }} {{ expense.property.address.zipCode }}
                  </dd>
                </div>
                <div v-if="expense.property">
                  <dt class="text-sm font-medium text-gray-500">Property Type</dt>
                  <dd class="text-sm text-gray-900">{{ expense.property.propertyType }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="expense.notes" class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Notes</h3>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ expense.notes }}</p>
          </div>

          <!-- Receipt Information -->
          <div v-if="expense.receipt" class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Receipt Information</h3>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Filename</dt>
                <dd class="text-sm text-gray-900 font-mono">{{ expense.receipt.filename }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">File Size</dt>
                <dd class="text-sm text-gray-900">{{ formatFileSize(expense.receipt.size) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">File Type</dt>
                <dd class="text-sm text-gray-900">{{ expense.receipt.type }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Uploaded</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(expense.receipt.uploadedAt) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Status History -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Status History</h3>
            <div class="space-y-3">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-6 w-6">
                  <CheckCircleIcon class="h-6 w-6 text-blue-500" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">Created</p>
                  <p class="text-sm text-gray-500">{{ formatDate(expense.createdAt) }}</p>
                </div>
              </div>
              
              <div v-if="expense.approvedAt" class="flex items-center">
                <div class="flex-shrink-0 h-6 w-6">
                  <CheckCircleIcon class="h-6 w-6 text-green-500" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">Approved</p>
                  <p class="text-sm text-gray-500">{{ formatDate(expense.approvedAt) }}</p>
                </div>
              </div>
              
              <div v-if="expense.paidAt" class="flex items-center">
                <div class="flex-shrink-0 h-6 w-6">
                  <CheckCircleIcon class="h-6 w-6 text-blue-600" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">Paid</p>
                  <p class="text-sm text-gray-500">{{ formatDate(expense.paidAt) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="card bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900 mb-4">System Information</h3>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Created</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(expense.createdAt) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(expense.updatedAt) }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="text-center py-12">
          <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Expense not found</h3>
          <p class="mt-1 text-sm text-gray-500">The expense you're looking for doesn't exist or you don't have access to it.</p>
          <div class="mt-6">
            <button @click="navigateTo('/expenses')" class="btn-primary">
              Back to Expenses
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon,
  CheckIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Get expense ID from route
const route = useRoute()
const expenseId = route.params.id

// Get auth store
const { getAuthHeader } = useAuth()

// Data and state
const loading = ref(true)
const expense = ref(null)

// Fetch expense details
const fetchExpense = async () => {
  try {
    loading.value = true
    const response = await $fetch(`/api/expenses/${expenseId}`, {
      headers: getAuthHeader()
    })
    
    if (response.success) {
      expense.value = response.data
    } else {
      expense.value = null
    }
  } catch (error) {
    console.error('Failed to fetch expense:', error)
    expense.value = null
  } finally {
    loading.value = false
  }
}

// Approve expense
const approveExpense = async () => {
  if (!confirm('Approve this expense?')) return
  
  try {
    await $fetch(`/api/expenses/${expenseId}/approve`, {
      method: 'POST',
      headers: getAuthHeader()
    })
    await fetchExpense() // Refresh the expense details
    
    // Show success notification
    useNuxtApp().$toast?.success('Expense approved successfully')
  } catch (error) {
    console.error('Failed to approve expense:', error)
    useNuxtApp().$toast?.error('Failed to approve expense')
  }
}

// Mark expense as paid
const markAsPaid = async () => {
  if (!confirm('Mark this expense as paid?')) return
  
  try {
    await $fetch(`/api/expenses/${expenseId}/pay`, {
      method: 'POST',
      headers: getAuthHeader()
    })
    await fetchExpense() // Refresh the expense details
    
    // Show success notification
    useNuxtApp().$toast?.success('Expense marked as paid')
  } catch (error) {
    console.error('Failed to mark expense as paid:', error)
    useNuxtApp().$toast?.error('Failed to update expense status')
  }
}

// View receipt
const viewReceipt = async () => {
  try {
    const response = await $fetch(`/api/expenses/${expenseId}/receipt`, {
      headers: getAuthHeader()
    })
    if (response.success) {
      window.open(response.data.receiptUrl, '_blank')
    }
  } catch (error) {
    console.error('Failed to view receipt:', error)
    useNuxtApp().$toast?.error('Failed to view receipt')
  }
}

// Get status class
const getStatusClass = (status) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'approved':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get status icon
const getStatusIcon = (status) => {
  switch (status) {
    case 'paid':
      return CheckCircleIcon
    case 'approved':
      return CheckCircleIcon
    case 'pending':
      return ClockIcon
    case 'rejected':
      return XCircleIcon
    default:
      return ExclamationCircleIcon
  }
}

// Get status icon class
const getStatusIconClass = (status) => {
  switch (status) {
    case 'paid':
      return 'text-green-600'
    case 'approved':
      return 'text-blue-600'
    case 'pending':
      return 'text-yellow-600'
    case 'rejected':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

// Format date
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format file size
const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A'
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// Fetch data on mount
onMounted(() => {
  fetchExpense()
})
</script>
