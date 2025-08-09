<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">
          {{ method ? 'Edit Payment Method' : 'Add Payment Method' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
      </div>

      <form @submit.prevent="save" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
          <select 
            v-model="formData.type" 
            required
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Type</option>
            <option value="mpesa">M-Pesa</option>
            <option value="bank">Bank Transfer</option>
            <option value="card">Card/Online</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
          <input
            v-model="formData.label"
            type="text"
            required
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., M-Pesa Paybill, KCB Bank"
          />
        </div>

        <!-- M-Pesa Specific Fields -->
        <div v-if="formData.type === 'mpesa'" class="space-y-4 border rounded-lg p-4 bg-green-50">
          <h4 class="font-medium text-green-800">M-Pesa Details</h4>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Paybill Number</label>
              <input
                v-model="formData.mpesa.paybill"
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123456"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Till Number</label>
              <input
                v-model="formData.mpesa.till"
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="567890"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Account Reference Hint</label>
            <input
              v-model="formData.mpesa.accountRefHint"
              type="text"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Use Invoice Number as reference"
            />
          </div>
        </div>

        <!-- Bank Transfer Specific Fields -->
        <div v-if="formData.type === 'bank'" class="space-y-4 border rounded-lg p-4 bg-blue-50">
          <h4 class="font-medium text-blue-800">Bank Transfer Details</h4>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input
                v-model="formData.bank.bankName"
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Kenya Commercial Bank"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <input
                v-model="formData.bank.branch"
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nairobi Branch"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
            <input
              v-model="formData.bank.accountName"
              type="text"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your Business Name"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                v-model="formData.bank.accountNumber"
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1234567890"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">SWIFT Code</label>
              <input
                v-model="formData.bank.swift"
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="KCBLKENX"
              />
            </div>
          </div>
        </div>

        <!-- Other/Custom Payment Method -->
        <div v-if="formData.type === 'other' || formData.type === 'card'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Payment Instructions</label>
            <textarea
              v-model="formData.instructions"
              rows="4"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide detailed instructions for this payment method..."
            ></textarea>
          </div>
        </div>

        <!-- Options -->
        <div class="space-y-3">
          <div class="flex items-center">
            <input
              v-model="formData.isDefault"
              id="is-default"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="is-default" class="ml-2 block text-sm text-gray-900">
              Set as default payment method
            </label>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              v-model.number="formData.order"
              type="number"
              min="0"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <p class="text-xs text-gray-500 mt-1">Lower numbers appear first on invoices</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Saving...' : 'Save Payment Method' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  method: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)

const formData = ref({
  type: '',
  label: '',
  mpesa: {
    paybill: '',
    till: '',
    accountRefHint: 'Use Invoice Number as reference'
  },
  bank: {
    bankName: '',
    accountName: '',
    accountNumber: '',
    branch: '',
    swift: ''
  },
  instructions: '',
  isDefault: false,
  order: 0
})

// Initialize form with existing data if editing
onMounted(() => {
  if (props.method) {
    Object.assign(formData.value, {
      type: props.method.type,
      label: props.method.label,
      mpesa: { ...props.method.mpesa },
      bank: { ...props.method.bank },
      instructions: props.method.instructions || '',
      isDefault: props.method.isDefault,
      order: props.method.order || 0
    })
  }
})

const save = async () => {
  loading.value = true
  try {
    // Clean up the data based on type
    const cleanData = {
      type: formData.value.type,
      label: formData.value.label,
      isDefault: formData.value.isDefault,
      order: formData.value.order
    }

    // Add type-specific data
    if (formData.value.type === 'mpesa') {
      cleanData.mpesa = formData.value.mpesa
    } else if (formData.value.type === 'bank') {
      cleanData.bank = formData.value.bank
    } else if (formData.value.instructions) {
      cleanData.instructions = formData.value.instructions
    }

    emit('save', cleanData)
  } catch (error) {
    console.error('Error saving payment method:', error)
  } finally {
    loading.value = false
  }
}

// Reset form when type changes
watch(() => formData.value.type, (newType) => {
  if (newType !== 'mpesa') {
    formData.value.mpesa = {
      paybill: '',
      till: '',
      accountRefHint: 'Use Invoice Number as reference'
    }
  }
  if (newType !== 'bank') {
    formData.value.bank = {
      bankName: '',
      accountName: '',
      accountNumber: '',
      branch: '',
      swift: ''
    }
  }
  if (newType !== 'other' && newType !== 'card') {
    formData.value.instructions = ''
  }
})
</script>
