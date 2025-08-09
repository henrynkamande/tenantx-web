<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <h1 class="text-xl font-semibold text-gray-900">TenantX</h1>
            <nav class="hidden md:flex space-x-8">
              <NuxtLink to="/dashboard" class="text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                Dashboard
              </NuxtLink>
              <NuxtLink to="/properties" class="text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                Properties
              </NuxtLink>
              <NuxtLink to="/tenants" class="text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                Tenants
              </NuxtLink>
              <NuxtLink to="/payments" class="text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                Payments
              </NuxtLink>
              <NuxtLink to="/maintenance" class="text-primary-600 border-b-2 border-primary-600 py-2 px-1 text-sm font-medium">
                Maintenance
              </NuxtLink>
            </nav>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">Welcome, {{ user?.firstName }} {{ user?.lastName }}</span>
            <button @click="handleLogout" class="btn-secondary">
              <ArrowRightOnRectangleIcon class="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Report Maintenance Issue</h2>
            <p class="text-gray-600">Create a new maintenance request</p>
          </div>
          <NuxtLink to="/maintenance" class="btn-outline">
            <ArrowLeftIcon class="h-4 w-4 mr-2" />
            Back to Maintenance
          </NuxtLink>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Issue Information -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Issue Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="label">Property *</label>
                <select
                  v-model="form.propertyId"
                  required
                  class="input-field"
                  @change="onPropertyChange"
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
                  :disabled="!availableUnits.length"
                >
                  <option value="">Select a unit</option>
                  <option v-for="unit in availableUnits" :key="unit._id" :value="unit._id">
                    Unit {{ unit.unitNumber }}
                  </option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="label">Issue Title *</label>
                <input
                  v-model="form.title"
                  type="text"
                  required
                  class="input-field"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div class="md:col-span-2">
                <label class="label">Detailed Description *</label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  required
                  class="input-field"
                  placeholder="Provide detailed information about the maintenance issue..."
                ></textarea>
              </div>

              <div>
                <label class="label">Priority *</label>
                <select
                  v-model="form.priority"
                  required
                  class="input-field"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label class="label">Category</label>
                <select
                  v-model="form.category"
                  class="input-field"
                >
                  <option value="">Select category</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Appliances">Appliances</option>
                  <option value="Flooring">Flooring</option>
                  <option value="Painting">Painting</option>
                  <option value="Windows/Doors">Windows/Doors</option>
                  <option value="Roofing">Roofing</option>
                  <option value="Pest Control">Pest Control</option>
                  <option value="Security">Security</option>
                  <option value="Landscaping">Landscaping</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label class="label">Reported Date</label>
                <input
                  v-model="form.reportedDate"
                  type="date"
                  class="input-field"
                />
              </div>

              <div>
                <label class="label">Status</label>
                <select
                  v-model="form.status"
                  class="input-field"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Cost Information -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Cost Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="label">Estimated Cost</label>
                <input
                  v-model.number="form.estimatedCost"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label class="label">Actual Cost</label>
                <input
                  v-model.number="form.actualCost"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <!-- Assignment Information -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Assignment Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="label">Assigned To</label>
                <input
                  v-model="form.assignedTo"
                  type="text"
                  class="input-field"
                  placeholder="Contractor/Maintenance person name"
                />
              </div>

              <div>
                <label class="label">Contact Information</label>
                <input
                  v-model="form.assignedContact"
                  type="text"
                  class="input-field"
                  placeholder="Phone number or email"
                />
              </div>

              <div>
                <label class="label">Scheduled Date</label>
                <input
                  v-model="form.scheduledDate"
                  type="date"
                  class="input-field"
                />
              </div>

              <div>
                <label class="label">Completed Date</label>
                <input
                  v-model="form.completedDate"
                  type="date"
                  class="input-field"
                />
              </div>
            </div>
          </div>

          <!-- Photos/Documents -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Photos & Documents</h3>
            
            <div>
              <label class="label">Upload Photos</label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <PhotoIcon class="mx-auto h-12 w-12 text-gray-400" />
                  <div class="flex text-sm text-gray-600">
                    <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload photos</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        class="sr-only"
                        multiple
                        accept="image/*"
                        @change="handleFileUpload"
                      />
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>
            </div>

            <div v-if="form.photos.length" class="mt-4">
              <p class="text-sm font-medium text-gray-700 mb-2">Selected Files:</p>
              <ul class="space-y-1">
                <li v-for="(photo, index) in form.photos" :key="index" class="flex items-center justify-between text-sm text-gray-600">
                  <span>{{ photo.name }}</span>
                  <button type="button" @click="removePhoto(index)" class="text-red-600 hover:text-red-800">
                    <XMarkIcon class="h-4 w-4" />
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <!-- Notes -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Additional Notes</h3>
            
            <div>
              <label class="label">Internal Notes</label>
              <textarea
                v-model="form.notes"
                rows="4"
                class="input-field"
                placeholder="Any additional notes for internal use..."
              ></textarea>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-4">
            <NuxtLink to="/maintenance" class="btn-outline">
              Cancel
            </NuxtLink>
            <button
              type="submit"
              :disabled="loading"
              class="btn-primary"
            >
              <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ loading ? 'Creating...' : 'Create Request' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useToast } from '~/composables/useToast'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { showToast } = useToast()



// Form state
const loading = ref(false)
const properties = ref([])
const units = ref([])
const form = reactive({
  propertyId: '',
  unitId: '',
  title: '',
  description: '',
  priority: 'Medium',
  category: '',
  reportedDate: new Date().toISOString().split('T')[0],
  status: 'Open',
  estimatedCost: null,
  actualCost: null,
  assignedTo: '',
  assignedContact: '',
  scheduledDate: '',
  completedDate: '',
  photos: [],
  notes: ''
})

// Computed
const availableUnits = computed(() => {
  return units.value.filter(unit => unit.propertyId === form.propertyId)
})

// Fetch properties on mount
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

// Fetch units when property changes
const onPropertyChange = async () => {
  form.unitId = '' // Reset unit selection
  
  if (form.propertyId) {
    try {
      const response = await $fetch(`/api/properties/${form.propertyId}/units`)
      if (response.success) {
        units.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch units:', error)
    }
  }
}

// Handle file upload
const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    if (file.size <= 10 * 1024 * 1024) { // 10MB limit
      form.photos.push(file)
    } else {
      showToast(`File ${file.name} is too large. Maximum size is 10MB.`, 'error')
    }
  })
}

// Remove photo
const removePhoto = (index) => {
  form.photos.splice(index, 1)
}

// Handle form submission
const handleSubmit = async () => {
  try {
    loading.value = true
    
    // Create FormData for file upload
    const formData = new FormData()
    
    // Add form fields
    Object.keys(form).forEach(key => {
      if (key !== 'photos') {
        formData.append(key, form[key] || '')
      }
    })
    
    // Add photos
    form.photos.forEach((photo, index) => {
      formData.append(`photos`, photo)
    })
    
    const response = await $fetch('/api/maintenance', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      showToast(`Maintenance request '${form.title}' created successfully!`, 'success')
      await navigateTo('/maintenance')
    }
  } catch (error) {
    console.error('Failed to create maintenance request:', error)
    showToast('Failed to create maintenance request. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => {
  fetchProperties()
})
</script>

