<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Add New Property</h2>
            <p class="text-gray-600">Create a new property in your portfolio</p>
          </div>
          <NuxtLink to="/properties" class="btn-outline">
            <ArrowLeftIcon class="h-4 w-4 mr-2" />
            Back to Properties
          </NuxtLink>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Basic Information -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="label">Property Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="input-field"
                  placeholder="Enter property name"
                />
              </div>

              <div>
                <label class="label">Property Type *</label>
                <select
                  v-model="form.propertyType"
                  required
                  class="input-field"
                >
                  <option value="">Select property type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="label">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="input-field"
                  placeholder="Property description (optional)"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Address Information</h3>
            
            <div class="grid grid-cols-1 gap-6">
              <div>
                <label class="label">Street Address *</label>
                <input
                  v-model="form.address.street"
                  type="text"
                  required
                  class="input-field"
                  placeholder="Enter street address"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="label">City *</label>
                  <input
                    v-model="form.address.city"
                    type="text"
                    required
                    class="input-field"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label class="label">State *</label>
                  <input
                    v-model="form.address.state"
                    type="text"
                    required
                    class="input-field"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label class="label">ZIP Code *</label>
                  <input
                    v-model="form.address.zipCode"
                    type="text"
                    required
                    class="input-field"
                    placeholder="ZIP Code"
                  />
                </div>
              </div>

              <div>
                <label class="label">Country</label>
                <input
                  v-model="form.address.country"
                  type="text"
                  class="input-field"
                  placeholder="Country (optional)"
                />
              </div>
            </div>
          </div>

          <!-- Property Details -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Property Details</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label class="label">Total Units *</label>
                <input
                  v-model.number="form.totalUnits"
                  type="number"
                  required
                  min="1"
                  class="input-field"
                  placeholder="Number of units"
                />
              </div>


              <div>
                <label class="label">Square Footage</label>
                <input
                  v-model.number="form.squareFootage"
                  type="number"
                  min="0"
                  class="input-field"
                  placeholder="Total sq ft"
                />
              </div>

              <div>
                <label class="label">Lot Size</label>
                <input
                  v-model="form.lotSize"
                  type="text"
                  class="input-field"
                  placeholder="e.g., 0.25 acres"
                />
              </div>

              <div>
                <label class="label">Parking Spaces</label>
                <input
                  v-model.number="form.parkingSpaces"
                  type="number"
                  min="0"
                  class="input-field"
                  placeholder="Number of spaces"
                />
              </div>

              <div>
                <label class="label">Property Status</label>
                <select
                  v-model="form.status"
                  class="input-field"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Financial Information -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Financial Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="label">Purchase Price ({{ currencySymbol }})</label>
                <input
                  v-model.number="form.purchasePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field"
                  :placeholder="`0.00 ${currencySymbol}`"
                />
              </div>

              <div>
                <label class="label">Purchase Date</label>
                <input
                  v-model="form.purchaseDate"
                  type="date"
                  class="input-field"
                />
              </div>

              <div>
                <label class="label">Market Value ({{ currencySymbol }})</label>
                <input
                  v-model.number="form.marketValue"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field"
                  :placeholder="`0.00 ${currencySymbol}`"
                />
              </div>

              <div>
                <label class="label">Monthly Insurance ({{ currencySymbol }})</label>
                <input
                  v-model.number="form.monthlyInsurance"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field"
                  :placeholder="`0.00 ${currencySymbol}`"
                />
              </div>

              <div>
                <label class="label">Monthly Property Tax ({{ currencySymbol }})</label>
                <input
                  v-model.number="form.monthlyPropertyTax"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field"
                  :placeholder="`0.00 ${currencySymbol}`"
                />
              </div>

              <div>
                <label class="label">Monthly HOA Fee ({{ currencySymbol }})</label>
                <input
                  v-model.number="form.monthlyHOA"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field"
                  :placeholder="`0.00 ${currencySymbol}`"
                />
              </div>
            </div>
          </div>

          <!-- Amenities -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Amenities</h3>
            
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <label v-for="amenity in availableAmenities" :key="amenity" class="flex items-center">
                <input
                  v-model="form.amenities"
                  type="checkbox"
                  :value="amenity"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-2 text-sm text-gray-700">{{ amenity }}</span>
              </label>
            </div>
          </div>

          <!-- Notes -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Additional Notes</h3>
            
            <div>
              <label class="label">Notes</label>
              <textarea
                v-model="form.notes"
                rows="4"
                class="input-field"
                placeholder="Any additional notes about the property..."
              ></textarea>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-4">
            <NuxtLink to="/properties" class="btn-outline">
              Cancel
            </NuxtLink>
            <button
              type="submit"
              :disabled="loading"
              class="btn-primary"
            >
              <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ loading ? 'Creating...' : 'Create Property' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon
} from '@heroicons/vue/24/outline'
import { useToast } from '~/composables/useToast'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { currencySymbol } = useCurrency()
const { showToast } = useToast()



// Form state
const loading = ref(false)
const form = reactive({
  name: '',
  propertyType: '',
  description: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  },
  totalUnits: 1,
  squareFootage: null,
  lotSize: '',
  parkingSpaces: 0,
  status: 'Active',
  purchasePrice: null,
  purchaseDate: '',
  marketValue: null,
  monthlyInsurance: null,
  monthlyPropertyTax: null,
  monthlyHOA: null,
  amenities: [],
  notes: ''
})

// Available amenities
const availableAmenities = [
  'Pool', 'Gym/Fitness Center', 'Laundry Facilities', 'Parking Garage',
  'Elevator', 'Balcony/Patio', 'Air Conditioning', 'Heating',
  'Dishwasher', 'In-Unit Laundry', 'Walk-in Closet', 'Hardwood Floors',
  'Carpet', 'Tile Flooring', 'Fireplace', 'Garden/Yard',
  'Pet Friendly', 'Storage Unit', 'Concierge', 'Security System',
  'Gated Community', 'Playground', 'Business Center', 'Clubhouse'
]

// Handle form submission
const handleSubmit = async () => {
  try {
    loading.value = true
    
    const response = await $fetch('/api/properties', {
      method: 'POST',
      body: form
    })

    if (response.success) {
      showToast(`Property '${form.name}' created successfully!`, 'success')
      await navigateTo('/properties')
    }
  } catch (error) {
    console.error('Failed to create property:', error)
    showToast('Failed to create property. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}
</script>
