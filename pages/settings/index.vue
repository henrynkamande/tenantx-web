<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p class="text-gray-600 mt-2">Manage your account preferences and settings</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Settings Navigation -->
        <div class="lg:col-span-1">
          <nav class="space-y-1">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                'group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full'
              ]"
            >
              <Icon :name="tab.icon" class="flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
              <span class="truncate">{{ tab.name }}</span>
            </button>
          </nav>
        </div>

        <!-- Settings Content -->
        <div class="lg:col-span-2">
          <!-- Profile Settings -->
          <div v-if="activeTab === 'profile'" class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Profile Information</h3>
              <form @submit.prevent="updateProfile" class="space-y-6">
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      v-model="profileForm.name"
                      type="text"
                      required
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      v-model="profileForm.email"
                      type="email"
                      required
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="profileLoading"
                    class="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {{ profileLoading ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Rent Management Settings -->
          <div v-if="activeTab === 'rent'" class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Rent Management Settings</h3>
              <form @submit.prevent="updateRentSettings" class="space-y-6">
                <div class="space-y-4">
                  <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 class="text-sm font-medium text-blue-900 mb-2">How It Works</h4>
                    <p class="text-sm text-blue-700">
                      Set deadlines for rent payments and penalty percentages for defaulted amounts. 
                      Settings can be applied globally (all properties), per property, or per unit.
                    </p>
                  </div>

                  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Global Rent Deadline</label>
                      <div class="mt-1 relative">
                        <input
                          v-model.number="rentSettings.globalRentDeadline"
                          type="number"
                          min="1"
                          max="31"
                          required
                          class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span class="text-gray-500 text-sm">days</span>
                        </div>
                      </div>
                      <p class="mt-1 text-xs text-gray-500">
                        Number of days after rent due date before marking as defaulted
                      </p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Default Penalty Percentage</label>
                      <div class="mt-1 relative">
                        <input
                          v-model.number="rentSettings.defaultPenaltyPercentage"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          required
                          class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span class="text-gray-500 text-sm">%</span>
                        </div>
                      </div>
                      <p class="mt-1 text-xs text-gray-500">
                        Penalty percentage applied to defaulted rent amounts
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <input
                      v-model="rentSettings.useGlobalSettings"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label class="ml-2 block text-sm text-gray-900">
                      Use these settings as default for all properties and units
                    </label>
                  </div>

                  <div class="border-t border-gray-200 pt-4">
                    <h4 class="text-sm font-medium text-gray-900 mb-3">Payment Status Management</h4>
                    <div class="flex space-x-4">
                      <button
                        type="button"
                        @click="checkDefaultedPayments"
                        :disabled="checkingDefaults"
                        class="bg-yellow-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                      >
                        {{ checkingDefaults ? 'Checking...' : 'Check for Defaulted Payments' }}
                      </button>
                    </div>
                    <p class="mt-2 text-xs text-gray-500">
                      Manually check for payments that have exceeded their deadline and mark them as defaulted
                    </p>
                  </div>
                </div>

                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="rentLoading"
                    class="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {{ rentLoading ? 'Saving...' : 'Save Rent Settings' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Billing Settings -->
          <div v-if="activeTab === 'billing'" class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Billing Settings</h3>
                <NuxtLink 
                  to="/settings/billing" 
                  class="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Open Full Billing Settings
                </NuxtLink>
              </div>
              
              <div class="space-y-6">
                <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 class="text-sm font-medium text-blue-900 mb-2">Multi-Landlord Invoicing</h4>
                  <p class="text-sm text-blue-700 mb-3">
                    Configure your business information, branding, tax settings, invoice numbering, and payment methods for professional invoicing.
                  </p>
                  <ul class="text-sm text-blue-600 space-y-1">
                    <li>• Business Information & Address</li>
                    <li>• Custom Branding & Logo</li>
                    <li>• Tax Settings (VAT/KRA)</li>
                    <li>• Invoice Numbering & Formatting</li>
                    <li>• Payment Methods (M-Pesa, Bank, Card)</li>
                  </ul>
                </div>
                
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center">
                      <Icon name="heroicons:building-office" class="h-5 w-5 text-gray-400 mr-2" />
                      <h4 class="text-sm font-medium text-gray-900">Business Info</h4>
                    </div>
                    <p class="text-sm text-gray-500 mt-1">Company details and contact information</p>
                  </div>
                  
                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center">
                      <Icon name="heroicons:paint-brush" class="h-5 w-5 text-gray-400 mr-2" />
                      <h4 class="text-sm font-medium text-gray-900">Branding</h4>
                    </div>
                    <p class="text-sm text-gray-500 mt-1">Logo, colors, and invoice styling</p>
                  </div>
                  
                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center">
                      <Icon name="heroicons:calculator" class="h-5 w-5 text-gray-400 mr-2" />
                      <h4 class="text-sm font-medium text-gray-900">Tax Settings</h4>
                    </div>
                    <p class="text-sm text-gray-500 mt-1">VAT rates and tax configuration</p>
                  </div>
                  
                  <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center">
                      <Icon name="heroicons:credit-card" class="h-5 w-5 text-gray-400 mr-2" />
                      <h4 class="text-sm font-medium text-gray-900">Payment Methods</h4>
                    </div>
                    <p class="text-sm text-gray-500 mt-1">Configure payment options for tenants</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Invoice Settings -->
          <div v-if="activeTab === 'invoices'" class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Invoice Settings</h3>
                <NuxtLink 
                  to="/invoices" 
                  class="bg-green-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Manage Invoices
                </NuxtLink>
              </div>
              
              <div class="space-y-6">
                <div class="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 class="text-sm font-medium text-green-900 mb-2">Invoice Management Features</h4>
                  <p class="text-sm text-green-700 mb-3">
                    Create, manage, and send professional invoices to your tenants with advanced features.
                  </p>
                  <ul class="text-sm text-green-600 space-y-1">
                    <li>• Create & Send Individual Invoices</li>
                    <li>• Bulk Invoice Generation</li>
                    <li>• PDF Download & Email Delivery</li>
                    <li>• Payment Tracking & Status</li>
                    <li>• Public Tenant View Links</li>
                    <li>• Multi-Currency Support</li>
                  </ul>
                </div>
                
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div class="text-center p-4 border border-gray-200 rounded-lg">
                    <Icon name="heroicons:document-plus" class="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 class="text-sm font-medium text-gray-900">Create Invoices</h4>
                    <p class="text-xs text-gray-500 mt-1">Generate new invoices for tenants</p>
                  </div>
                  
                  <div class="text-center p-4 border border-gray-200 rounded-lg">
                    <Icon name="heroicons:document-arrow-down" class="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 class="text-sm font-medium text-gray-900">PDF Export</h4>
                    <p class="text-xs text-gray-500 mt-1">Download branded PDF invoices</p>
                  </div>
                  
                  <div class="text-center p-4 border border-gray-200 rounded-lg">
                    <Icon name="heroicons:envelope" class="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <h4 class="text-sm font-medium text-gray-900">Email Delivery</h4>
                    <p class="text-xs text-gray-500 mt-1">Send invoices directly to tenants</p>
                  </div>
                </div>
                
                <div class="border-t border-gray-200 pt-4">
                  <h4 class="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div class="flex flex-wrap gap-2">
                    <NuxtLink 
                      to="/invoices/create" 
                      class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-blue-200"
                    >
                      Create New Invoice
                    </NuxtLink>
                    <NuxtLink 
                      to="/invoices?status=draft" 
                      class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-gray-200"
                    >
                      View Draft Invoices
                    </NuxtLink>
                    <NuxtLink 
                      to="/invoices?status=sent" 
                      class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-green-200"
                    >
                      View Sent Invoices
                    </NuxtLink>
                    <NuxtLink 
                      to="/settings/billing" 
                      class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-purple-200"
                    >
                      Configure Billing
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Theme Settings -->
          <div v-if="activeTab === 'appearance'" class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Appearance</h3>
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div
                      v-for="theme in themes"
                      :key="theme.value"
                      @click="selectTheme(theme.value)"
                      :class="[
                        preferences.theme === theme.value
                          ? 'border-blue-500 ring-2 ring-blue-500'
                          : 'border-gray-300',
                        'relative cursor-pointer border rounded-lg p-4 flex flex-col items-center hover:border-gray-400'
                      ]"
                    >
                      <Icon :name="theme.icon" class="h-8 w-8 mb-2" :class="theme.iconColor" />
                      <span class="text-sm font-medium text-gray-900">{{ theme.name }}</span>
                      <span class="text-xs text-gray-500 mt-1">{{ theme.description }}</span>
                      <div
                        v-if="preferences.theme === theme.value"
                        class="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center"
                      >
                        <Icon name="heroicons:check" class="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Language</label>
                  <select
                    v-model="preferences.language"
                    @change="updatePreferences"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Timezone</label>
                  <select
                    v-model="preferences.timezone"
                    @change="updatePreferences"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Currency</label>
                  <select
                    v-model="preferences.currency"
                    @change="updatePreferences"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <optgroup label="Major Currencies">
                      <option value="USD">🇺🇸 US Dollar (USD)</option>
                      <option value="EUR">🇪🇺 Euro (EUR)</option>
                      <option value="GBP">🇬🇧 British Pound (GBP)</option>
                      <option value="JPY">🇯🇵 Japanese Yen (JPY)</option>
                      <option value="CHF">🇨🇭 Swiss Franc (CHF)</option>
                      <option value="CAD">🇨🇦 Canadian Dollar (CAD)</option>
                      <option value="AUD">🇦🇺 Australian Dollar (AUD)</option>
                      <option value="CNY">🇨🇳 Chinese Yuan (CNY)</option>
                    </optgroup>
                    <optgroup label="Americas">
                      <option value="BRL">🇧🇷 Brazilian Real (BRL)</option>
                      <option value="MXN">🇲🇽 Mexican Peso (MXN)</option>
                      <option value="ARS">🇦🇷 Argentine Peso (ARS)</option>
                      <option value="CLP">🇨🇱 Chilean Peso (CLP)</option>
                      <option value="COP">🇨🇴 Colombian Peso (COP)</option>
                      <option value="PEN">🇵🇪 Peruvian Sol (PEN)</option>
                      <option value="UYU">🇺🇾 Uruguayan Peso (UYU)</option>
                    </optgroup>
                    <optgroup label="Europe">
                      <option value="NOK">🇳🇴 Norwegian Krone (NOK)</option>
                      <option value="SEK">🇸🇪 Swedish Krona (SEK)</option>
                      <option value="DKK">🇩🇰 Danish Krone (DKK)</option>
                      <option value="PLN">🇵🇱 Polish Zloty (PLN)</option>
                      <option value="CZK">🇨🇿 Czech Koruna (CZK)</option>
                      <option value="HUF">🇭🇺 Hungarian Forint (HUF)</option>
                      <option value="RON">🇷🇴 Romanian Leu (RON)</option>
                      <option value="BGN">🇧🇬 Bulgarian Lev (BGN)</option>
                      <option value="HRK">🇭🇷 Croatian Kuna (HRK)</option>
                      <option value="RUB">🇷🇺 Russian Ruble (RUB)</option>
                      <option value="TRY">🇹🇷 Turkish Lira (TRY)</option>
                      <option value="UAH">🇺🇦 Ukrainian Hryvnia (UAH)</option>
                    </optgroup>
                    <optgroup label="Asia Pacific">
                      <option value="INR">🇮🇳 Indian Rupee (INR)</option>
                      <option value="SGD">🇸🇬 Singapore Dollar (SGD)</option>
                      <option value="HKD">🇭🇰 Hong Kong Dollar (HKD)</option>
                      <option value="NZD">🇳🇿 New Zealand Dollar (NZD)</option>
                      <option value="KRW">🇰🇷 South Korean Won (KRW)</option>
                      <option value="THB">🇹🇭 Thai Baht (THB)</option>
                      <option value="MYR">🇲🇾 Malaysian Ringgit (MYR)</option>
                      <option value="IDR">🇮🇩 Indonesian Rupiah (IDR)</option>
                      <option value="PHP">🇵🇭 Philippine Peso (PHP)</option>
                      <option value="VND">🇻🇳 Vietnamese Dong (VND)</option>
                      <option value="TWD">🇹🇼 Taiwan Dollar (TWD)</option>
                      <option value="PKR">🇵🇰 Pakistani Rupee (PKR)</option>
                      <option value="BDT">🇧🇩 Bangladeshi Taka (BDT)</option>
                      <option value="LKR">🇱🇰 Sri Lankan Rupee (LKR)</option>
                    </optgroup>
                    <optgroup label="Middle East & Africa">
                      <option value="SAR">🇸🇦 Saudi Riyal (SAR)</option>
                      <option value="AED">🇦🇪 UAE Dirham (AED)</option>
                      <option value="QAR">🇶🇦 Qatari Riyal (QAR)</option>
                      <option value="KWD">🇰🇼 Kuwaiti Dinar (KWD)</option>
                      <option value="BHD">🇧🇭 Bahraini Dinar (BHD)</option>
                      <option value="OMR">🇴🇲 Omani Rial (OMR)</option>
                      <option value="ILS">🇮🇱 Israeli Shekel (ILS)</option>
                      <option value="EGP">🇪🇬 Egyptian Pound (EGP)</option>
                      <option value="ZAR">🇿🇦 South African Rand (ZAR)</option>
                      <option value="NGN">🇳🇬 Nigerian Naira (NGN)</option>
                      <option value="KES">🇰🇪 Kenyan Shilling (KES)</option>
                      <option value="GHS">🇬🇭 Ghanaian Cedi (GHS)</option>
                      <option value="MAD">🇲🇦 Moroccan Dirham (MAD)</option>
                      <option value="TND">🇹🇳 Tunisian Dinar (TND)</option>
                    </optgroup>
                  </select>
                  <p class="mt-2 text-sm text-gray-500">
                    Currency affects how monetary values are displayed throughout the application.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div v-if="activeTab === 'notifications'" class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Notifications</h3>
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p class="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="preferences.notifications.email"
                      @change="updatePreferences"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900">Push Notifications</h4>
                    <p class="text-sm text-gray-500">Receive push notifications in browser</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="preferences.notifications.push"
                      @change="updatePreferences"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900">SMS Notifications</h4>
                    <p class="text-sm text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="preferences.notifications.sms"
                      @change="updatePreferences"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Security Settings -->
          <div v-if="activeTab === 'security'" class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Security</h3>
              <form @submit.prevent="changePassword" class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    v-model="passwordForm.newPassword"
                    type="password"
                    required
                    minlength="6"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    required
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="passwordLoading"
                    class="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {{ passwordLoading ? 'Changing...' : 'Change Password' }}
                  </button>
                </div>
              </form>
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

const activeTab = ref('profile')
const profileLoading = ref(false)
const passwordLoading = ref(false)
const rentLoading = ref(false)
const checkingDefaults = ref(false)

const tabs = [
  { id: 'profile', name: 'Profile', icon: 'heroicons:user' },
  { id: 'rent', name: 'Rent Management', icon: 'heroicons:home' },
  { id: 'billing', name: 'Billing Settings', icon: 'heroicons:credit-card' },
  { id: 'invoices', name: 'Invoice Settings', icon: 'heroicons:document-text' },
  { id: 'appearance', name: 'Appearance', icon: 'heroicons:paint-brush' },
  { id: 'notifications', name: 'Notifications', icon: 'heroicons:bell' },
  { id: 'security', name: 'Security', icon: 'heroicons:lock-closed' }
]

const themes = [
  {
    name: 'Light',
    value: 'light',
    description: 'Light theme',
    icon: 'heroicons:sun',
    iconColor: 'text-yellow-500'
  },
  {
    name: 'Dark',
    value: 'dark',
    description: 'Dark theme',
    icon: 'heroicons:moon',
    iconColor: 'text-gray-700'
  },
  {
    name: 'System',
    value: 'system',
    description: 'Follow system',
    icon: 'heroicons:computer-desktop',
    iconColor: 'text-blue-500'
  }
]

const profileForm = ref({
  name: '',
  email: ''
})

const preferences = ref({
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  currency: 'USD',
  notifications: {
    email: true,
    push: true,
    sms: false
  }
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Rent settings form
const rentSettings = ref({
  globalRentDeadline: 5,
  defaultPenaltyPercentage: 5,
  useGlobalSettings: true
})

// Get user data from auth store
const { $pinia } = useNuxtApp()
const authStore = useAuthStore($pinia)
const { setCurrency } = useCurrency()

// Initialize forms with current user data
onMounted(async () => {
  if (authStore.landlord) {
    profileForm.value.name = `${authStore.landlord.firstName} ${authStore.landlord.lastName}`
    profileForm.value.email = authStore.landlord.email
    
    // Map landlord preferences to our form structure
    preferences.value = {
      theme: 'system', // Default since landlord model doesn't have theme
      language: authStore.landlord.language || 'en',
      timezone: authStore.landlord.timezone || 'UTC',
      currency: authStore.landlord.preferredCurrency || 'KES',
      notifications: {
        email: true, // Default values since landlord model doesn't have these
        push: true,
        sms: false
      }
    }
    
    // Load rent settings
    await loadRentSettings()
  }
})

// Actions
const updateProfile = async () => {
  profileLoading.value = true
  try {
    // Update landlord profile
    const [firstName, ...lastNameParts] = profileForm.value.name.split(' ')
    const lastName = lastNameParts.join(' ')
    
    await $fetch(`/api/landlords/${authStore.landlord.id}`, {
      method: 'PUT',
      body: {
        firstName,
        lastName,
        email: profileForm.value.email
      }
    })
    
    // Update auth store
    await authStore.fetchUser()
    
    alert('Profile updated successfully')
  } catch (error) {
    console.error('Error updating profile:', error)
    alert('Error updating profile')
  } finally {
    profileLoading.value = false
  }
}

const selectTheme = async (theme) => {
  preferences.value.theme = theme
  await updatePreferences()
  
  // Apply theme immediately
  applyTheme(theme)
}

const updatePreferences = async () => {
  try {
    // Update landlord preferences including currency
    await $fetch(`/api/landlords/${authStore.landlord.id}`, {
      method: 'PUT',
      body: {
        language: preferences.value.language,
        timezone: preferences.value.timezone,
        preferredCurrency: preferences.value.currency
      }
    })
    
    // Update currency system
    setCurrency(preferences.value.currency)
    
    // Update auth store landlord data
    if (authStore.landlord) {
      authStore.landlord.preferredCurrency = preferences.value.currency
      authStore.landlord.language = preferences.value.language
      authStore.landlord.timezone = preferences.value.timezone
    }
    
    // Apply theme if it changed
    if (preferences.value.theme) {
      applyTheme(preferences.value.theme)
    }
    
    console.log('Preferences updated successfully')
  } catch (error) {
    console.error('Error updating preferences:', error)
    
    // For demo purposes, still apply theme locally even if API call fails
    if (preferences.value.theme) {
      applyTheme(preferences.value.theme)
      console.log('Theme applied locally (demo mode)')
    }
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('New passwords do not match')
    return
  }
  
  passwordLoading.value = true
  try {
    await $fetch(`/api/users/${currentUser.value._id}/password`, {
      method: 'PUT',
      body: {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      }
    })
    
    // Reset form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    alert('Password changed successfully')
  } catch (error) {
    console.error('Error changing password:', error)
    alert('Error changing password')
  } finally {
    passwordLoading.value = false
  }
}

// Theme application logic
const applyTheme = (theme) => {
  const html = document.documentElement
  
  if (theme === 'dark') {
    html.classList.add('dark')
  } else if (theme === 'light') {
    html.classList.remove('dark')
  } else if (theme === 'system') {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
  
  // Store theme preference
  localStorage.setItem('theme', theme)
}

// Rent settings functions
const loadRentSettings = async () => {
  try {
    const response = await $fetch('/api/settings/rent-settings')
    if (response.success) {
      rentSettings.value = {
        globalRentDeadline: response.data.globalRentDeadline || 5,
        defaultPenaltyPercentage: response.data.defaultPenaltyPercentage || 5,
        useGlobalSettings: response.data.useGlobalSettings !== undefined ? response.data.useGlobalSettings : true
      }
    }
  } catch (error) {
    console.error('Error loading rent settings:', error)
  }
}

const updateRentSettings = async () => {
  rentLoading.value = true
  try {
    const response = await $fetch('/api/settings/rent-settings', {
      method: 'PUT',
      body: {
        globalRentDeadline: rentSettings.value.globalRentDeadline,
        defaultPenaltyPercentage: rentSettings.value.defaultPenaltyPercentage,
        useGlobalSettings: rentSettings.value.useGlobalSettings
      }
    })
    
    if (response.success) {
      alert('Rent settings updated successfully')
    }
  } catch (error) {
    console.error('Error updating rent settings:', error)
    alert('Error updating rent settings')
  } finally {
    rentLoading.value = false
  }
}

const checkDefaultedPayments = async () => {
  checkingDefaults.value = true
  try {
    const response = await $fetch('/api/payments/check-defaults', {
      method: 'POST'
    })
    
    if (response.success) {
      alert('Defaulted payments check completed successfully')
    }
  } catch (error) {
    console.error('Error checking defaulted payments:', error)
    alert('Error checking defaulted payments')
  } finally {
    checkingDefaults.value = false
  }
}

// Initialize theme on component mount
onMounted(() => {
  const storedTheme = localStorage.getItem('theme')
  if (storedTheme) {
    preferences.value.theme = storedTheme
    applyTheme(storedTheme)
  } else {
    applyTheme(preferences.value.theme)
  }
})
</script>
