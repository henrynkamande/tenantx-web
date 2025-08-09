<template>
  <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Edit Tenant</h2>
          <p class="text-gray-600">Edit tenant details</p>
        </div>
        <NuxtLink to="/tenants" class="btn-outline">
          <ArrowLeftIcon class="h-4 w-4 mr-2" />
          Back to Tenants
        </NuxtLink>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Personal Information -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-6">Personal Information</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="label">First Name *</label>
              <input
                v-model="form.firstName"
                type="text"
                required
                class="input-field"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label class="label">Last Name *</label>
              <input
                v-model="form.lastName"
                type="text"
                required
                class="input-field"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label class="label">Email *</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="input-field"
                placeholder="Email address"
              />
            </div>

            <div>
              <label class="label">Phone Number *</label>
              <input
                v-model="form.phone"
                type="tel"
                required
                class="input-field"
                placeholder="Phone number"
              />
            </div>

          </div>
        </div>

        <!-- Property & Unit Assignment -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-6">Property & Unit Assignment</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="label">Property *</label>
              <select
                v-model="form.propertyId"
                @change="onPropertyChange"
                required
                class="input-field"
              >
                <option value="">Select a property</option>
                <option v-for="property in properties" :key="property._id" :value="property._id">
                  {{ property.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="label">Unit *</label>
              <select
                v-model="form.unitId"
                required
                class="input-field"
                :disabled="!form.propertyId"
              >
                <option value="">{{ form.propertyId ? 'Select a unit' : 'Select property first' }}</option>
                <option v-for="unit in availableUnits" :key="unit._id" :value="unit._id">
                  Unit {{ unit.unitNumber }} - {{ unit.bedrooms }}BR/{{ unit.bathrooms }}BA - {{ currencySymbol }}{{ unit.rentAmount }}/month
                </option>
              </select>
              <p v-if="form.propertyId && availableUnits.length === 0" class="text-sm text-amber-600 mt-1">
                No available units in this property
              </p>
            </div>

          </div>
        </div>

        <!-- Lease Information -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-6">Lease Information</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="label">Monthly Rent ({{ currencySymbol }}) *</label>
              <input
                v-model.number="form.rentAmount"
                type="number"
                required
                min="0"
                step="0.01"
                class="input-field"
                :placeholder="`0.00 ${currencySymbol}`"
              />
            </div>

            <div>
              <label class="label">Lease Start Date *</label>
              <input
                v-model="form.leaseStart"
                type="date"
                required
                class="input-field"
              />
            </div>

            <div>
              <label class="label">Lease End Date</label>
              <input
                v-model="form.leaseEnd"
                type="date"
                class="input-field"
              />
              <p class="text-sm text-gray-500 mt-1">Leave empty for month-to-month lease</p>
            </div>

            <div>
              <label class="label">Lease Status *</label>
              <select
                v-model="form.status"
                required
                class="input-field"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
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
              placeholder="Any additional notes about the tenant..."
            ></textarea>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4">
          <NuxtLink to="/tenants" class="btn-outline">
            Cancel
          </NuxtLink>
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary"
          >
            <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            {{ loading ? 'Updating...' : 'Update Tenant' }}
          </button>
        </div>
      </form>
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
const route = useRoute()
const tenantId = route.params.id

// Form state
const loading = ref(false)
const properties = ref([])
const units = ref([])
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  propertyId: '',
  unitId: '',
  rentAmount: null,
  leaseStart: '',
  leaseEnd: '',
  status: 'Active',
  notes: ''
})

// Computed properties
const availableUnits = computed(() => {
  if (!form.propertyId) return []
  return units.value.filter(unit => {
    const unitPropertyId = typeof unit.propertyId === 'object' ? unit.propertyId._id : unit.propertyId
    return unitPropertyId === form.propertyId && (unit.occupancyStatus === 'Vacant' || unit._id === form.unitId)
  })
})

// Fetch properties and units
const fetchProperties = async () => {
  try {
    const response = await $fetch('/api/properties')
    if (response.success) {
      properties.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch properties:', error)
  }
}

const fetchUnits = async () => {
  try {
    const response = await $fetch('/api/properties/units')
    if (response.success) {
      units.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch units:', error)
  }
}

// Fetch tenant data
const fetchTenant = async () => {
  try {
    const response = await $fetch(`/api/tenants/${tenantId}`)
    if (response.success) {
      const tenant = response.data

      // Populate personal and lease info from the fetched tenant data
      form.firstName = tenant.personalInfo.firstName
      form.lastName = tenant.personalInfo.lastName
      form.email = tenant.personalInfo.email
      form.phone = tenant.personalInfo.phone
      form.rentAmount = tenant.leaseInfo.monthlyRent
      form.leaseStart = tenant.leaseInfo.leaseStartDate ? tenant.leaseInfo.leaseStartDate.substring(0, 10) : ''
      form.leaseEnd = tenant.leaseInfo.leaseEndDate ? tenant.leaseInfo.leaseEndDate.substring(0, 10) : ''
      form.status = tenant.status
      form.notes = tenant.notes || ''

      // Populate property and unit IDs
      const tenantUnitId = tenant.unitId?._id || tenant.unitId
      form.unitId = tenantUnitId

      // Find the unit in the fetched units list to determine its property.
      // This is more robust than checking the shape of the tenant.unitId object.
      const assignedUnit = units.value.find(u => u._id === tenantUnitId)
      if (assignedUnit) {
        form.propertyId = assignedUnit.propertyId?._id || assignedUnit.propertyId
      }
    }
  } catch (error) {
    console.error('Failed to fetch tenant:', error)
  }
}

// Handle property change
const onPropertyChange = () => {
  form.unitId = '' // Reset unit selection when property changes
}

// Handle form submission
const handleSubmit = async () => {
  try {
    loading.value = true
    
    const tenantData = {
      personalInfo: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone
      },
      unitId: form.unitId,
      leaseInfo: {
        monthlyRent: form.rentAmount,
        leaseStartDate: form.leaseStart,
        leaseEndDate: form.leaseEnd || null
      },
      status: form.status,
      notes: form.notes
    }

    const response = await $fetch(`/api/tenants/${tenantId}`, {
      method: 'PUT',
      body: tenantData
    })

    if (response.success) {
      showToast(`Tenant ${form.firstName} ${form.lastName} updated successfully!`, 'success')
      await navigateTo('/tenants')
    }
  } catch (error) {
    console.error('Failed to update tenant:', error)
    showToast('Failed to update tenant. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

// Fetch data on mount
onMounted(async () => {
  await fetchProperties()
  await fetchUnits()
  await fetchTenant()
})
</script>
