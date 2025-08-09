<template>
  <!-- Main Content -->
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Tenants</h2>
            <p class="text-gray-600">Manage your tenant relationships</p>
          </div>
          <button @click="navigateTo('/tenants/new')" class="btn-primary">
            <UserPlusIcon class="h-5 w-5 mr-2" />
            Add Tenant
          </button>
        </div>

        <!-- Search and Filter -->
        <div class="mb-6 flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search tenants..."
              class="input-field"
            />
          </div>
          <select v-model="statusFilter" class="input-field sm:w-48">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <!-- Tenants Table -->
        <div v-else-if="filteredTenants.length > 0" class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property/Unit
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lease Details
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
                <tr v-for="tenant in filteredTenants" :key="tenant._id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span class="text-sm font-medium text-primary-600">
                            {{ tenant.personalInfo?.firstName?.charAt(0) }}{{ tenant.personalInfo?.lastName?.charAt(0) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ tenant.personalInfo?.firstName }} {{ tenant.personalInfo?.lastName }}
                        </div>
                        <div class="text-sm text-gray-500">{{ tenant.personalInfo?.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ tenant.unitId?.propertyId?.name || 'N/A' }}</div>
                    <div class="text-sm text-gray-500">Unit {{ tenant.unitId?.unitNumber || 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ $formatMoney(tenant.leaseInfo?.rentAmount || 0) }}/month</div>
                    <div class="text-sm text-gray-500">
                      {{ formatDate(tenant.leaseInfo?.startDate) }} - {{ formatDate(tenant.leaseInfo?.endDate) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getStatusClass(tenant.status)">
                      {{ tenant.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button 
                        @click="viewTenant(tenant)" 
                        class="p-1 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                        title="View tenant details"
                      >
                        <EyeIcon class="h-4 w-4" />
                      </button>
                      <button 
                        @click="editTenant(tenant)" 
                        class="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                        title="Edit tenant"
                      >
                        <PencilIcon class="h-4 w-4" />
                      </button>
                      <button 
                        @click="deleteTenant(tenant._id)" 
                        class="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                        title="Delete tenant"
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

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <UserGroupIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No tenants found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ searchTerm || statusFilter ? 'Try adjusting your search criteria.' : 'Get started by adding your first tenant.' }}
          </p>
          <div v-if="!searchTerm && !statusFilter" class="mt-6">
            <button @click="navigateTo('/tenants/new')" class="btn-primary">
              <UserPlusIcon class="h-5 w-5 mr-2" />
              Add Tenant
            </button>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  UserGroupIcon,
  UserPlusIcon,
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
const tenants = ref([])
const searchTerm = ref('')
const statusFilter = ref('')

// Computed
const filteredTenants = computed(() => {
  return tenants.value.filter(tenant => {
    const matchesSearch = !searchTerm.value || 
      `${tenant.personalInfo?.firstName} ${tenant.personalInfo?.lastName}`.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      tenant.personalInfo?.email?.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    const matchesStatus = !statusFilter.value || tenant.status === statusFilter.value
    
    return matchesSearch && matchesStatus
  })
})

// Fetch tenants
const fetchTenants = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/tenants')
    if (response.success) {
      tenants.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch tenants:', error)
  } finally {
    loading.value = false
  }
}

// View tenant details
const viewTenant = (tenant) => {
  navigateTo(`/tenants/${tenant._id}`)
}

// Edit tenant
const editTenant = (tenant) => {
  navigateTo(`/tenants/edit/${tenant._id}`)
}

// Delete tenant
const deleteTenant = async (tenantId) => {
  if (confirm('Are you sure you want to delete this tenant?')) {
    try {
      await $fetch(`/api/tenants/${tenantId}`, { method: 'DELETE' })
      await fetchTenants() // Refresh the list
    } catch (error) {
      console.error('Failed to delete tenant:', error)
      alert('Failed to delete tenant')
    }
  }
}

// Get status class
const getStatusClass = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800'
    case 'Inactive':
      return 'bg-red-100 text-red-800'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
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
  fetchTenants()
})
</script>
