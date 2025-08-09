<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Create Invoice</h1>
        <p class="text-gray-600 mt-2">Generate a new invoice for your tenants</p>
      </div>

      <!-- Coming Soon Notice -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="text-center py-12">
            <Icon name="heroicons:document-plus" class="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Invoice Creation Coming Soon</h3>
            <p class="text-gray-500 mb-6">
              The invoice creation interface is currently being developed. 
              In the meantime, you can configure your billing settings to prepare for invoicing.
            </p>
            
            <div class="flex justify-center space-x-4">
              <NuxtLink 
                to="/settings/billing" 
                class="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Configure Billing Settings
              </NuxtLink>
              
              <NuxtLink 
                to="/invoices" 
                class="bg-gray-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                View Existing Invoices
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Preview -->
      <div class="mt-8 bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Planned Features</h3>
          
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center mb-2">
                <Icon name="heroicons:user-group" class="h-5 w-5 text-blue-500 mr-2" />
                <h4 class="text-sm font-medium text-gray-900">Tenant Selection</h4>
              </div>
              <p class="text-xs text-gray-500">Choose from your tenant list with property details</p>
            </div>
            
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center mb-2">
                <Icon name="heroicons:calculator" class="h-5 w-5 text-green-500 mr-2" />
                <h4 class="text-sm font-medium text-gray-900">Line Items</h4>
              </div>
              <p class="text-xs text-gray-500">Add rent, utilities, and other charges</p>
            </div>
            
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center mb-2">
                <Icon name="heroicons:paint-brush" class="h-5 w-5 text-purple-500 mr-2" />
                <h4 class="text-sm font-medium text-gray-900">Custom Branding</h4>
              </div>
              <p class="text-xs text-gray-500">Automatic branding from your settings</p>
            </div>
            
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center mb-2">
                <Icon name="heroicons:currency-dollar" class="h-5 w-5 text-yellow-500 mr-2" />
                <h4 class="text-sm font-medium text-gray-900">Tax Calculation</h4>
              </div>
              <p class="text-xs text-gray-500">Automatic VAT and tax calculations</p>
            </div>
            
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center mb-2">
                <Icon name="heroicons:envelope" class="h-5 w-5 text-red-500 mr-2" />
                <h4 class="text-sm font-medium text-gray-900">Send Options</h4>
              </div>
              <p class="text-xs text-gray-500">Email delivery with PDF attachment</p>
            </div>
            
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center mb-2">
                <Icon name="heroicons:eye" class="h-5 w-5 text-indigo-500 mr-2" />
                <h4 class="text-sm font-medium text-gray-900">Preview</h4>
              </div>
              <p class="text-xs text-gray-500">Real-time invoice preview with branding</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})
</script>
