<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Billing Settings</h1>
        <p class="text-gray-600 mt-2">Configure your invoicing, branding, and payment methods</p>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <Icon :name="tab.icon" class="w-5 h-5 mr-2 inline" />
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <form @submit.prevent="saveSettings" class="space-y-6">
        <!-- Business Information Tab -->
        <div v-show="activeTab === 'business'" class="space-y-6">
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Business Information</h2>
            
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700">Business/Display Name</label>
                <input
                  v-model="settings.displayName"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your business name"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="settings.email"
                  type="email"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="business@example.com"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  v-model="settings.phone"
                  type="tel"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+254 700 000 000"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Currency</label>
                <select
                  v-model="settings.currency"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>
            
            <!-- Address -->
            <div class="mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Business Address</label>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <input
                    v-model="settings.address.street"
                    type="text"
                    placeholder="Street address"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    v-model="settings.address.city"
                    type="text"
                    placeholder="City"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    v-model="settings.address.state"
                    type="text"
                    placeholder="State/County"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    v-model="settings.address.zipCode"
                    type="text"
                    placeholder="ZIP/Postal Code"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    v-model="settings.address.country"
                    type="text"
                    placeholder="Country"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Branding Tab -->
        <div v-show="activeTab === 'branding'" class="space-y-6">
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Branding</h2>
            
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">Logo URL</label>
                <input
                  v-model="settings.logoUrl"
                  type="url"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/logo.png"
                />
                <p class="mt-2 text-sm text-gray-500">
                  Upload your logo to a hosting service and paste the URL here. Recommended size: 200x80px.
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Brand Color</label>
                <div class="mt-1 flex items-center space-x-3">
                  <input
                    v-model="settings.brandColor"
                    type="color"
                    class="h-10 w-16 border-gray-300 rounded-md"
                  />
                  <input
                    v-model="settings.brandColor"
                    type="text"
                    class="block flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#2563eb"
                  />
                </div>
                <p class="mt-2 text-sm text-gray-500">
                  This color will be used for headers, accents, and branding elements on your invoices.
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Signature URL</label>
                <input
                  v-model="settings.signatureUrl"
                  type="url"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/signature.png"
                />
                <p class="mt-2 text-sm text-gray-500">
                  Optional digital signature image to appear at the bottom of invoices.
                </p>
              </div>
            </div>
          </div>
          
          <!-- Preview -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Invoice Preview</h3>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div 
                class="text-white p-4 rounded-lg mb-4"
                :style="{ backgroundColor: settings.brandColor || '#2563eb' }"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <h1 class="text-xl font-bold">{{ settings.displayName || 'Your Business Name' }}</h1>
                    <p class="opacity-90 text-sm">{{ settings.email || 'business@example.com' }}</p>
                  </div>
                  <div class="text-right">
                    <h2 class="text-lg font-bold">INVOICE</h2>
                    <p class="text-sm">ABC-INV-2024-0001</p>
                  </div>
                </div>
              </div>
              <p class="text-sm text-gray-600 text-center">
                This is how your invoice header will appear with your current branding settings.
              </p>
            </div>
          </div>
        </div>

        <!-- Tax Settings Tab -->
        <div v-show="activeTab === 'tax'" class="space-y-6">
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Tax Settings</h2>
            
            <div class="space-y-6">
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700">KRA PIN</label>
                  <input
                    v-model="settings.kraPin"
                    type="text"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="A000000000A"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">VAT Number</label>
                  <input
                    v-model="settings.vatNumber"
                    type="text"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="20000000000"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700">VAT Rate (%)</label>
                  <input
                    v-model.number="settings.vatRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="16"
                  />
                  <p class="mt-1 text-sm text-gray-500">Standard VAT rate in Kenya is 16%</p>
                </div>
                
                <div class="flex items-center mt-6">
                  <input
                    v-model="settings.taxInclusive"
                    id="tax-inclusive"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="tax-inclusive" class="ml-2 block text-sm text-gray-900">
                    Prices are tax-inclusive
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice Settings Tab -->
        <div v-show="activeTab === 'invoice'" class="space-y-6">
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Invoice Settings</h2>
            
            <div class="space-y-6">
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Default Payment Terms</label>
                  <select
                    v-model="settings.defaultTerms"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 7">Net 7 days</option>
                    <option value="Net 14">Net 14 days</option>
                    <option value="Net 30">Net 30 days</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Grace Period (days)</label>
                  <input
                    v-model.number="settings.graceDays"
                    type="number"
                    min="0"
                    max="30"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="7"
                  />
                  <p class="mt-1 text-sm text-gray-500">Days after due date before late fees apply</p>
                </div>
              </div>
              
              <!-- Late Fee Settings -->
              <div class="border rounded-lg p-4 bg-gray-50">
                <h3 class="text-sm font-medium text-gray-900 mb-3">Late Fee Settings</h3>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Fee Type</label>
                    <select
                      v-model="settings.lateFeeType"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="flat">Flat Amount</option>
                      <option value="percent">Percentage</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Fee Value</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <input
                        v-model.number="settings.lateFeeValue"
                        type="number"
                        min="0"
                        step="0.01"
                        class="block w-full pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="5"
                      />
                      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span class="text-gray-500 sm:text-sm">
                          {{ settings.lateFeeType === 'percent' ? '%' : settings.currency }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Invoice Numbering -->
              <div class="border rounded-lg p-4 bg-gray-50">
                <h3 class="text-sm font-medium text-gray-900 mb-3">Invoice Numbering</h3>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Invoice Prefix</label>
                    <input
                      v-model="settings.invoicePrefix"
                      type="text"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="INV"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Numbering Format</label>
                    <input
                      v-model="settings.invoiceFormat"
                      type="text"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="{LLD}-{PREFIX}-{YYYY}-{SEQ}"
                    />
                  </div>
                </div>
                <p class="mt-2 text-sm text-gray-500">
                  Use placeholders: {LLD} = Landlord code, {PREFIX} = Prefix, {YYYY} = Year, {MM} = Month, {SEQ} = Sequence
                  <br>
                  Example: ABC-INV-2024-0001
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Methods Tab -->
        <div v-show="activeTab === 'payment'" class="space-y-6">
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-medium text-gray-900">Payment Methods</h2>
              <button
                type="button"
                @click="showPaymentMethodModal = true"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add Payment Method
              </button>
            </div>
            
            <div v-if="paymentMethods.length === 0" class="text-center py-12">
              <Icon name="heroicons:credit-card" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">No payment methods configured</h3>
              <p class="text-gray-500 mb-4">Add payment methods to show instructions on your invoices</p>
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="method in paymentMethods"
                :key="method._id"
                class="border rounded-lg p-4 flex items-center justify-between"
              >
                <div class="flex items-center space-x-3">
                  <Icon
                    :name="getPaymentMethodIcon(method.type)"
                    class="w-6 h-6 text-gray-400"
                  />
                  <div>
                    <div class="flex items-center space-x-2">
                      <span class="font-medium">{{ method.label }}</span>
                      <span
                        v-if="method.isDefault"
                        class="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        Default
                      </span>
                    </div>
                    <p class="text-sm text-gray-500">{{ getPaymentMethodDescription(method) }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    v-if="!method.isDefault"
                    @click="setDefaultPaymentMethod(method._id)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Set Default
                  </button>
                  <button
                    @click="editPaymentMethod(method)"
                    class="text-gray-600 hover:text-gray-800"
                  >
                    <Icon name="heroicons:pencil" class="w-4 h-4" />
                  </button>
                  <button
                    @click="deletePaymentMethod(method._id)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="resetSettings"
            class="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            Reset
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Payment Method Modal -->
    <PaymentMethodModal
      v-if="showPaymentMethodModal"
      :method="editingMethod"
      @close="closePaymentMethodModal"
      @save="savePaymentMethod"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const { getAuthHeader, user } = useAuth()
const toast = useToast()

const activeTab = ref('business')
const loading = ref(false)
const showPaymentMethodModal = ref(false)
const editingMethod = ref(null)

const tabs = [
  { id: 'business', name: 'Business Info', icon: 'heroicons:building-office' },
  { id: 'branding', name: 'Branding', icon: 'heroicons:paint-brush' },
  { id: 'tax', name: 'Tax Settings', icon: 'heroicons:calculator' },
  { id: 'invoice', name: 'Invoice Settings', icon: 'heroicons:document-text' },
  { id: 'payment', name: 'Payment Methods', icon: 'heroicons:credit-card' }
]

const settings = ref({
  displayName: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Kenya'
  },
  kraPin: '',
  vatNumber: '',
  vatRate: 16,
  taxInclusive: true,
  logoUrl: '',
  brandColor: '#2563eb',
  signatureUrl: '',
  defaultTerms: 'Net 30',
  graceDays: 7,
  lateFeeType: 'percent',
  lateFeeValue: 5,
  invoicePrefix: 'INV',
  invoiceFormat: '{LLD}-{PREFIX}-{YYYY}-{SEQ}',
  currency: 'KES'
})

const paymentMethods = ref([])

// Load settings on mount
onMounted(async () => {
  await loadSettings()
  await loadPaymentMethods()
})

const loadSettings = async () => {
  try {
    if (!user.value) return
    
    const { data } = await $fetch(`/api/landlords/${user.value._id}/settings`, {
      headers: getAuthHeader()
    })
    
    if (data) {
      Object.assign(settings.value, data)
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

const loadPaymentMethods = async () => {
  try {
    if (!user.value) return
    
    const { data } = await $fetch(`/api/landlords/${user.value._id}/payment-methods`, {
      headers: getAuthHeader()
    })
    
    paymentMethods.value = data || []
  } catch (error) {
    console.error('Error loading payment methods:', error)
  }
}

const saveSettings = async () => {
  loading.value = true
  try {
    if (!user.value) return
    
    await $fetch(`/api/landlords/${user.value._id}/settings`, {
      method: 'PUT',
      body: settings.value,
      headers: getAuthHeader()
    })
    
    // Show success message
    toast.success('Settings saved successfully!', 'Your billing settings have been updated.')
  } catch (error) {
    console.error('Error saving settings:', error)
    toast.error('Failed to save settings', error.message || 'Please try again later.')
  } finally {
    loading.value = false
  }
}

const resetSettings = async () => {
  if (confirm('Are you sure you want to reset all settings to default values?')) {
    await loadSettings()
  }
}

const getPaymentMethodIcon = (type) => {
  const icons = {
    mpesa: 'heroicons:device-phone-mobile',
    bank: 'heroicons:building-library',
    card: 'heroicons:credit-card',
    other: 'heroicons:banknotes'
  }
  return icons[type] || 'heroicons:banknotes'
}

const getPaymentMethodDescription = (method) => {
  switch (method.type) {
    case 'mpesa':
      return method.mpesa.paybill ? `Paybill: ${method.mpesa.paybill}` : `Till: ${method.mpesa.till}`
    case 'bank':
      return `${method.bank.bankName} - ${method.bank.accountNumber}`
    default:
      return method.instructions || 'Custom payment method'
  }
}

const closePaymentMethodModal = () => {
  showPaymentMethodModal.value = false
  editingMethod.value = null
}

const editPaymentMethod = (method) => {
  editingMethod.value = method
  showPaymentMethodModal.value = true
}

const savePaymentMethod = async (methodData) => {
  try {
    if (!user.value) return
    
    if (editingMethod.value) {
      // Update existing method
      // API endpoint for updating would be needed
    } else {
      // Create new method
      await $fetch(`/api/landlords/${user.value._id}/payment-methods`, {
        method: 'POST',
        body: methodData,
        headers: getAuthHeader()
      })
    }
    
    await loadPaymentMethods()
    closePaymentMethodModal()
  } catch (error) {
    console.error('Error saving payment method:', error)
    alert('Failed to save payment method')
  }
}

const setDefaultPaymentMethod = async (methodId) => {
  // Implementation for setting default payment method
  console.log('Set default:', methodId)
}

const deletePaymentMethod = async (methodId) => {
  if (confirm('Are you sure you want to delete this payment method?')) {
    // Implementation for deleting payment method
    console.log('Delete:', methodId)
  }
}
</script>
