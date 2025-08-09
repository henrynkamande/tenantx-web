<template>
  <!-- Main Content -->
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Maintenance</h2>
            <p class="text-gray-600">Manage property maintenance requests</p>
          </div>
          <NuxtLink to="/maintenance/new" class="btn-primary">
            <WrenchScrewdriverIcon class="h-5 w-5 mr-2" />
            Report Issue
          </NuxtLink>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ExclamationTriangleIcon class="h-8 w-8 text-orange-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Open Requests
                  </dt>
                  <dd class="text-lg font-bold text-gray-900">
                    {{ stats.openRequests || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ClockIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    In Progress
                  </dt>
                  <dd class="text-lg font-bold text-gray-900">
                    {{ stats.inProgress || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CheckCircleIcon class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd class="text-lg font-bold text-gray-900">
                    {{ stats.completed || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CurrencyDollarIcon class="h-8 w-8 text-purple-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total Cost
                  </dt>
                  <dd class="text-lg font-bold text-gray-900">
                    {{ $formatMoney(stats.totalCost || 0) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="mb-6 flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search maintenance requests..."
              class="input-field"
            />
          </div>
          <select v-model="statusFilter" class="input-field sm:w-48">
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select v-model="priorityFilter" class="input-field sm:w-48">
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <!-- Maintenance Requests Grid -->
        <div v-else-if="filteredRequests.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div v-for="request in filteredRequests" :key="request._id" class="card hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ request.title }}</h3>
                <p class="text-sm text-gray-600">{{ request.unitId?.propertyId?.name }} - Unit {{ request.unitId?.unitNumber }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      :class="getPriorityClass(request.priority)">
                  {{ request.priority }}
                </span>
                <div class="flex space-x-1">
                  <button @click="viewRequest(request)" class="text-primary-600 hover:text-primary-800">
                    <EyeIcon class="h-4 w-4" />
                  </button>
                  <button @click="editRequest(request)" class="text-blue-600 hover:text-blue-800">
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button @click="deleteRequest(request._id)" class="text-red-600 hover:text-red-800">
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <p class="text-sm text-gray-700 mb-4 line-clamp-3">{{ request.description }}</p>

            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Reported:</span>
                <span class="font-medium">{{ formatDate(request.reportedDate) }}</span>
              </div>
              <div v-if="request.estimatedCost" class="flex justify-between text-sm">
                <span class="text-gray-600">Estimated Cost:</span>
                    <span class="font-medium">{{ $formatMoney(request.estimatedCost) }}</span>
              </div>
              <div v-if="request.assignedTo" class="flex justify-between text-sm">
                <span class="text-gray-600">Assigned to:</span>
                <span class="font-medium">{{ request.assignedTo }}</span>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(request.status)">
                {{ request.status }}
              </span>
              <div class="flex space-x-2">
                <button v-if="request.status === 'Open'" @click="markInProgress(request)" class="text-xs btn-secondary">
                  Start Work
                </button>
                <button v-if="request.status === 'In Progress'" @click="markCompleted(request)" class="text-xs btn-success">
                  Complete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <WrenchScrewdriverIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No maintenance requests found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ searchTerm || statusFilter || priorityFilter ? 'Try adjusting your search criteria.' : 'Get started by reporting your first maintenance issue.' }}
          </p>
          <div v-if="!searchTerm && !statusFilter && !priorityFilter" class="mt-6">
            <NuxtLink to="/maintenance/new" class="btn-primary">
              <WrenchScrewdriverIcon class="h-5 w-5 mr-2" />
              Report Issue
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import {
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})



// Data and state
const loading = ref(true)
const requests = ref([])
const stats = ref({})
const searchTerm = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')

// Computed
const filteredRequests = computed(() => {
  return requests.value.filter(request => {
    const matchesSearch = !searchTerm.value || 
      request.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    const matchesStatus = !statusFilter.value || request.status === statusFilter.value
    const matchesPriority = !priorityFilter.value || request.priority === priorityFilter.value
    
    return matchesSearch && matchesStatus && matchesPriority
  })
})

// Fetch maintenance requests and stats
const fetchRequests = async () => {
  try {
    loading.value = true
    const [requestsResponse, statsResponse] = await Promise.all([
      $fetch('/api/maintenance'),
      $fetch('/api/maintenance/stats')
    ])
    
    if (requestsResponse.success) {
      requests.value = requestsResponse.data
    }
    
    if (statsResponse.success) {
      stats.value = statsResponse.data
    }
  } catch (error) {
    console.error('Failed to fetch maintenance requests:', error)
  } finally {
    loading.value = false
  }
}

// View request details
const viewRequest = (request) => {
  navigateTo(`/maintenance/${request._id}`)
}

// Edit request
const editRequest = (request) => {
  navigateTo(`/maintenance/${request._id}/edit`)
}

// Delete request
const deleteRequest = async (requestId) => {
  if (confirm('Are you sure you want to delete this maintenance request?')) {
    try {
      await $fetch(`/api/maintenance/${requestId}`, { method: 'DELETE' })
      await fetchRequests() // Refresh the list
    } catch (error) {
      console.error('Failed to delete maintenance request:', error)
      alert('Failed to delete maintenance request')
    }
  }
}

// Mark as in progress
const markInProgress = async (request) => {
  try {
    await $fetch(`/api/maintenance/${request._id}`, {
      method: 'PATCH',
      body: { status: 'In Progress' }
    })
    await fetchRequests() // Refresh the list
  } catch (error) {
    console.error('Failed to update status:', error)
    alert('Failed to update status')
  }
}

// Mark as completed
const markCompleted = async (request) => {
  try {
    await $fetch(`/api/maintenance/${request._id}`, {
      method: 'PATCH',
      body: { 
        status: 'Completed',
        completedDate: new Date().toISOString()
      }
    })
    await fetchRequests() // Refresh the list
  } catch (error) {
    console.error('Failed to update status:', error)
    alert('Failed to update status')
  }
}

// Get status class
const getStatusClass = (status) => {
  switch (status) {
    case 'Open':
      return 'bg-red-100 text-red-800'
    case 'In Progress':
      return 'bg-blue-100 text-blue-800'
    case 'Completed':
      return 'bg-green-100 text-green-800'
    case 'Cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get priority class
const getPriorityClass = (priority) => {
  switch (priority) {
    case 'Low':
      return 'bg-green-100 text-green-800'
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'High':
      return 'bg-orange-100 text-orange-800'
    case 'Emergency':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
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

// Fetch data on mount
onMounted(() => {
  fetchRequests()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

