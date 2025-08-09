<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <!-- Property Not Found -->
        <div v-else-if="!property" class="text-center py-12">
          <BuildingOfficeIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Property not found</h3>
          <p class="mt-1 text-sm text-gray-500">The property you're looking for doesn't exist.</p>
          <div class="mt-6">
            <NuxtLink to="/properties" class="btn-primary">
              <ArrowLeftIcon class="h-4 w-4 mr-2" />
              Back to Properties
            </NuxtLink>
          </div>
        </div>

        <!-- Property Details -->
        <div v-else>
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ property.name }}</h2>
              <p class="text-gray-600">{{ property.address?.street }}, {{ property.address?.city }}, {{ property.address?.state }}</p>
            </div>
            <div class="flex space-x-3">
              <NuxtLink to="/properties" class="btn-outline">
                <ArrowLeftIcon class="h-4 w-4 mr-2" />
                Back to Properties
              </NuxtLink>
              <NuxtLink :to="`/properties/${property._id}/edit`" class="btn-secondary">
                <PencilIcon class="h-4 w-4 mr-2" />
                Edit Property
              </NuxtLink>
            </div>
          </div>

          <!-- Property Overview -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <!-- Main Info -->
            <div class="lg:col-span-2">
              <div class="card">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Property Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Property Type</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ property.propertyType || 'N/A' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Status</dt>
                    <dd class="mt-1">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="property.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                        {{ property.status || 'Unknown' }}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Total Units</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ property.totalUnits || 0 }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Year Built</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ property.yearBuilt || 'N/A' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Square Footage</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ property.squareFootage ? $formatNumber(property.squareFootage) + ' sq ft' : 'N/A' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Parking Spaces</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ property.parkingSpaces || 0 }}</dd>
                  </div>
                </div>

                <div v-if="property.description" class="mt-6">
                  <dt class="text-sm font-medium text-gray-500">Description</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ property.description }}</dd>
                </div>
              </div>
            </div>

            <!-- Stats Sidebar -->
            <div class="space-y-6">
              <!-- Occupancy Stats -->
              <div class="card">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Occupancy</h3>
                <div class="space-y-4">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Occupied Units</span>
                    <span class="text-sm font-medium text-green-600">{{ property.occupiedUnits || 0 }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Vacant Units</span>
                    <span class="text-sm font-medium text-orange-600">{{ property.vacantUnits || 0 }}</span>
                  </div>
                  <div class="pt-2 border-t">
                    <div class="flex justify-between">
                      <span class="text-sm font-medium text-gray-900">Occupancy Rate</span>
                      <span class="text-sm font-bold text-primary-600">{{ occupancyRate }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Financial Info -->
              <div v-if="hasFinancialInfo" class="card">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Financial</h3>
                <div class="space-y-3">
                  <div v-if="property.purchasePrice" class="flex justify-between">
                    <span class="text-sm text-gray-600">Purchase Price</span>
                    <span class="text-sm font-medium">{{ $formatMoney(property.purchasePrice, 0) }}</span>
                  </div>
                  <div v-if="property.marketValue" class="flex justify-between">
                    <span class="text-sm text-gray-600">Market Value</span>
                    <span class="text-sm font-medium">{{ $formatMoney(property.marketValue, 0) }}</span>
                  </div>
                  <div v-if="property.monthlyRevenue" class="flex justify-between">
                    <span class="text-sm text-gray-600">Monthly Revenue</span>
                    <span class="text-sm font-medium text-green-600">{{ currencySymbol }}{{ formatCurrency(property.monthlyRevenue) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Address Details -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div class="card">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Address</h3>
              <div class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Street Address</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ property.address?.street || 'N/A' }}</dd>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">City</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ property.address?.city || 'N/A' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">State</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ property.address?.state || 'N/A' }}</dd>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">ZIP Code</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ property.address?.zipCode || 'N/A' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Country</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ property.address?.country || 'N/A' }}</dd>
                  </div>
                </div>
              </div>
            </div>

            <!-- Amenities -->
            <div v-if="property.amenities?.length" class="card">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Amenities</h3>
              <div class="grid grid-cols-2 gap-2">
                <div v-for="amenity in property.amenities" :key="amenity" class="flex items-center">
                  <CheckIcon class="h-4 w-4 text-green-500 mr-2" />
                  <span class="text-sm text-gray-700">{{ amenity }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="property.notes" class="card mb-8">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Notes</h3>
            <p class="text-sm text-gray-700">{{ property.notes }}</p>
          </div>

          <!-- Units Section -->
          <div class="card mb-8">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Units</h3>
              <button @click="showAddUnitModal = true" class="btn-primary">
                <PlusIcon class="h-4 w-4 mr-2" />
                Add Unit
              </button>
            </div>
            
            <!-- Loading Units -->
            <div v-if="unitsLoading" class="flex items-center justify-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
            
            <!-- Units List -->
            <div v-else-if="units.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="unit in units" :key="unit._id" class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-medium text-gray-900">Unit {{ unit.unitNumber }}</h4>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        :class="{
                          'bg-green-100 text-green-800': unit.occupancyStatus === 'Occupied',
                          'bg-orange-100 text-orange-800': unit.occupancyStatus === 'Vacant',
                          'bg-red-100 text-red-800': unit.occupancyStatus === 'Under Maintenance'
                        }">
                    {{ unit.occupancyStatus }}
                  </span>
                </div>
                <div class="space-y-1 text-sm text-gray-600">
                  <div>Rent: {{ $formatMoney(unit.rentAmount) }}/month</div>
                  <div>{{ unit.bedrooms }} bed, {{ unit.bathrooms }} bath</div>
                  <div v-if="unit.squareFootage">{{ $formatNumber(unit.squareFootage) }} sq ft</div>
                </div>
              </div>
            </div>
            
            <!-- No Units -->
            <div v-else class="text-center py-8">
              <BuildingOfficeIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">No units yet</h3>
              <p class="mt-1 text-sm text-gray-500">Get started by adding your first unit.</p>
              <div class="mt-6">
                <button @click="showAddUnitModal = true" class="btn-primary">
                  <PlusIcon class="h-4 w-4 mr-2" />
                  Add Unit
                </button>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-4">
            <button @click="deleteProperty" class="btn-danger">
              <TrashIcon class="h-4 w-4 mr-2" />
              Delete Property
            </button>
            <NuxtLink :to="`/properties/${property._id}/edit`" class="btn-primary">
              <PencilIcon class="h-4 w-4 mr-2" />
              Edit Property
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Unit Modal -->
    <div v-if="showAddUnitModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Add New Unit</h3>
            <button @click="showAddUnitModal = false" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          
          <form @submit.prevent="addUnit">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="unitNumber" class="block text-sm font-medium text-gray-700 mb-2">Unit Number *</label>
                <input
                  id="unitNumber"
                  v-model="unitForm.unitNumber"
                  type="text"
                  required
                  class="input-field"
                  placeholder="e.g., 101, A1, etc."
                />
              </div>
              
              <div>
                <label for="rentAmount" class="block text-sm font-medium text-gray-700 mb-2">Monthly Rent ({{ currencySymbol }}) *</label>
                <input
                  id="rentAmount"
                  v-model="unitForm.rentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="input-field"
                  :placeholder="`1200.00 ${currencySymbol}`"
                />
              </div>
              
              <div>
                <label for="bedrooms" class="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                <input
                  id="bedrooms"
                  v-model="unitForm.bedrooms"
                  type="number"
                  min="0"
                  class="input-field"
                  placeholder="1"
                />
              </div>
              
              <div>
                <label for="bathrooms" class="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                <input
                  id="bathrooms"
                  v-model="unitForm.bathrooms"
                  type="number"
                  min="0"
                  step="0.5"
                  class="input-field"
                  placeholder="1"
                />
              </div>
              
              <div>
                <label for="squareFootage" class="block text-sm font-medium text-gray-700 mb-2">Square Footage</label>
                <input
                  id="squareFootage"
                  v-model="unitForm.squareFootage"
                  type="number"
                  min="0"
                  class="input-field"
                  placeholder="800"
                />
              </div>
              
              <div>
                <label for="securityDeposit" class="block text-sm font-medium text-gray-700 mb-2">Security Deposit ({{ currencySymbol }})</label>
                <input
                  id="securityDeposit"
                  v-model="unitForm.securityDeposit"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field"
                  :placeholder="`1200.00 ${currencySymbol}`"
                />
              </div>
              
              <div>
                <label for="occupancyStatus" class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  id="occupancyStatus"
                  v-model="unitForm.occupancyStatus"
                  class="input-field"
                >
                  <option value="Vacant">Vacant</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>
              
              <div>
                <label for="rentDueDay" class="block text-sm font-medium text-gray-700 mb-2">Rent Due Day</label>
                <input
                  id="rentDueDay"
                  v-model="unitForm.rentDueDay"
                  type="number"
                  min="1"
                  max="31"
                  class="input-field"
                  placeholder="1"
                />
              </div>
            </div>
            
            <div class="mb-4">
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                id="description"
                v-model="unitForm.description"
                rows="3"
                class="input-field"
                placeholder="Optional description of the unit..."
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showAddUnitModal = false"
                class="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="unitSubmitting"
                class="btn-primary"
              >
                <span v-if="unitSubmitting">Adding...</span>
                <span v-else>Add Unit</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  BuildingOfficeIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useToast } from '~/composables/useToast'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { user, logout } = useAuth()
const { currencySymbol } = useCurrency()
const route = useRoute()
const { showToast } = useToast()

// Data and state
const loading = ref(true)
const property = ref(null)
const units = ref([])
const unitsLoading = ref(false)
const showAddUnitModal = ref(false)
const unitSubmitting = ref(false)

// Unit form data
const unitForm = ref({
  unitNumber: '',
  rentAmount: '',
  bedrooms: 1,
  bathrooms: 1,
  squareFootage: '',
  securityDeposit: '',
  occupancyStatus: 'Vacant',
  rentDueDay: 1,
  description: ''
})

// Computed properties
const occupancyRate = computed(() => {
  if (!property.value?.totalUnits || property.value.totalUnits === 0) return 0
  return Math.round((property.value.occupiedUnits / property.value.totalUnits) * 100)
})

const hasFinancialInfo = computed(() => {
  return property.value?.purchasePrice || property.value?.marketValue || property.value?.monthlyRevenue
})

// Fetch property details
const fetchProperty = async () => {
  try {
    loading.value = true
    const response = await $fetch(`/api/properties/${route.params.id}`)
    if (response.success) {
      property.value = response.data
      // Fetch units after property is loaded
      await fetchUnits()
    }
  } catch (error) {
    console.error('Failed to fetch property:', error)
    if (error.statusCode === 404) {
      property.value = null
    }
  } finally {
    loading.value = false
  }
}

// Fetch units for this property
const fetchUnits = async () => {
  try {
    unitsLoading.value = true
    const response = await $fetch(`/api/properties/${route.params.id}/units`)
    if (response.success) {
      units.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch units:', error)
  } finally {
    unitsLoading.value = false
  }
}

// Delete property
const deleteProperty = async () => {
  if (confirm(`Are you sure you want to delete "${property.value.name}"? This action cannot be undone.`)) {
    try {
      await $fetch(`/api/properties/${route.params.id}`, { method: 'DELETE' })
      await navigateTo('/properties')
    } catch (error) {
      console.error('Failed to delete property:', error)
      alert('Failed to delete property')
    }
  }
}

// Add unit function
const addUnit = async () => {
  try {
    unitSubmitting.value = true
    
    // Prepare the unit data
    const unitData = {
      landlordId: user.value._id || user.value.id,
      unitNumber: unitForm.value.unitNumber,
      rentAmount: parseFloat(unitForm.value.rentAmount),
      bedrooms: parseInt(unitForm.value.bedrooms) || 1,
      bathrooms: parseFloat(unitForm.value.bathrooms) || 1,
      squareFootage: unitForm.value.squareFootage ? parseInt(unitForm.value.squareFootage) : undefined,
      securityDeposit: unitForm.value.securityDeposit ? parseFloat(unitForm.value.securityDeposit) : undefined,
      occupancyStatus: unitForm.value.occupancyStatus,
      rentDueDay: parseInt(unitForm.value.rentDueDay) || 1,
      description: unitForm.value.description || undefined
    }
    
    // Submit to API
    const response = await $fetch(`/api/properties/${route.params.id}/units`, {
      method: 'POST',
      body: unitData
    })
    
    if (response.success) {
      // Add the new unit to the list
      units.value.push(response.data)
      
      // Reset form
      unitForm.value = {
        unitNumber: '',
        rentAmount: '',
        bedrooms: 1,
        bathrooms: 1,
        squareFootage: '',
        securityDeposit: '',
        occupancyStatus: 'Vacant',
        rentDueDay: 1,
        description: ''
      }
      
      // Close modal
      showAddUnitModal.value = false
      
      // Show success message
      showToast(`Unit ${unitData.unitNumber} added successfully!`, 'success')
    }
  } catch (error) {
    console.error('Failed to add unit:', error)
    
    // Show user-friendly error messages
    let errorMessage = 'Failed to add unit. Please try again.'
    
    if (error.statusCode === 400) {
      if (error.data?.message?.includes('duplicate') || error.data?.message?.includes('already exists')) {
        errorMessage = `Unit ${unitForm.value.unitNumber} already exists. Please use a different unit number.`
      } else if (error.data?.message?.includes('validation')) {
        errorMessage = 'Please check that all required fields are filled correctly.'
      } else if (error.data?.message) {
        errorMessage = error.data.message
      }
    } else if (error.statusCode === 401) {
      errorMessage = 'You are not authorized to add units. Please log in again.'
    } else if (error.statusCode === 403) {
      errorMessage = 'You do not have permission to add units to this property.'
    } else if (error.statusCode === 404) {
      errorMessage = 'Property not found. Please refresh the page and try again.'
    } else if (error.statusCode >= 500) {
      errorMessage = 'Server error. Please try again in a few moments.'
    } else if (!navigator.onLine) {
      errorMessage = 'No internet connection. Please check your connection and try again.'
    }
    
    showToast(errorMessage, 'error')
  } finally {
    unitSubmitting.value = false
  }
}

// Fetch data on mount
onMounted(() => {
  fetchProperty()
})
</script>
