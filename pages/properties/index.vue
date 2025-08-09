<template>
  <!-- Main Content -->
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Properties</h2>
            <p class="text-gray-600">Manage your property portfolio</p>
          </div>
          <NuxtLink to="/properties/new" class="btn-primary">
            <PlusIcon class="h-5 w-5 mr-2" />
            Add Property
          </NuxtLink>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <!-- Properties Grid -->
        <div v-else-if="properties.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="property in properties" :key="property._id" class="card hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ property.name }}</h3>
                <p class="text-sm text-gray-600">{{ property.address.street }}, {{ property.address.city }}</p>
              </div>
              <div class="flex space-x-2">
                <button @click="editProperty(property)" class="text-blue-600 hover:text-blue-800">
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button @click="deleteProperty(property._id)" class="text-red-600 hover:text-red-800">
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Type:</span>
                <span class="font-medium">{{ property.propertyType }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Total Units:</span>
                <span class="font-medium">{{ property.totalUnits }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Occupied:</span>
                <span class="font-medium text-green-600">{{ property.occupiedUnits || 0 }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Monthly Revenue:</span>
                <span class="font-medium text-green-600">{{ currencySymbol }}{{ formatCurrency(property.monthlyRevenue || 0) }}</span>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="property.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                {{ property.status }}
              </span>
              <NuxtLink :to="`/properties/${property._id}`" class="text-primary-600 hover:text-primary-800 text-sm font-medium">
                View Details →
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <BuildingOfficeIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No properties</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by adding your first property.</p>
          <div class="mt-6">
            <NuxtLink to="/properties/new" class="btn-primary">
              <PlusIcon class="h-5 w-5 mr-2" />
              Add Property
            </NuxtLink>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { navigateTo } from '#app'
import { useToast } from '~/composables/useToast'

import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { currencySymbol } = useCurrency()
const { showToast } = useToast()

// Data and state
const loading = ref(true)
const properties = ref([])

// Fetch properties
const fetchProperties = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/properties')
    if (response.success) {
      properties.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch properties:', error)
  } finally {
    loading.value = false
  }
}

// Edit property
const editProperty = (property) => {
  navigateTo(`/properties/${property._id}/edit`)
}

// Delete property
const deleteProperty = async (propertyId) => {
  if (confirm('Are you sure you want to delete this property?')) {
    try {
      const response = await $fetch(`/api/properties/${propertyId}`, { method: 'DELETE' })
      showToast('Property deleted successfully!', 'success')
      await fetchProperties() // Refresh the list
    } catch (error) {
      console.error('Failed to delete property:', error)
      showToast('Failed to delete property. Please try again.', 'error')
    }
  }
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
  fetchProperties()
})
</script>
