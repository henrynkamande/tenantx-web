<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Mobile sidebar overlay -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 z-40 lg:hidden"
      @click="sidebarOpen = false"
    >
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
    </div>

    <!-- Sidebar -->
    <div 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Sidebar Header - Hidden on desktop, visible on mobile -->
      <div class="lg:hidden flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-900">TenantX</h1>
        <button 
          @click="sidebarOpen = false"
          class="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="mt-6 px-3">
        <div class="space-y-1">
          <NuxtLink 
            v-for="item in navigation" 
            :key="item.name"
            :to="item.href"
            class="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150"
            :class="isActiveRoute(item.href) 
              ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600' 
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'"
            @click="sidebarOpen = false"
          >
            <component 
              :is="item.icon" 
              class="mr-3 h-5 w-5 flex-shrink-0"
              :class="isActiveRoute(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'"
            />
            {{ item.name }}
          </NuxtLink>
        </div>

        <!-- Reports Submenu -->
        <div class="mt-8">
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Reports
          </h3>
          <div class="mt-2 space-y-1">
            <NuxtLink 
              v-for="report in reportNavigation" 
              :key="report.name"
              :to="report.href"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150"
              :class="isActiveRoute(report.href) 
                ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
              @click="sidebarOpen = false"
            >
              <component 
                :is="report.icon" 
                class="mr-3 h-4 w-4 flex-shrink-0"
                :class="isActiveRoute(report.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'"
              />
              {{ report.name }}
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- Mobile User Section - Only visible on mobile -->
      <div class="lg:hidden absolute bottom-0 w-full p-4 border-t border-gray-200">
        <div class="flex items-center space-x-3 mb-3">
          <div class="flex-shrink-0">
            <div class="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-white">
                {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
              </span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ user?.firstName }} {{ user?.lastName }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ user?.email }}
            </p>
          </div>
        </div>
        <button 
          @click="handleLogout" 
          class="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          <ArrowRightOnRectangleIcon class="h-4 w-4 mr-2" />
          Sign out
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between h-16 px-4 lg:px-6">
          <!-- Mobile menu button -->
          <button 
            @click="sidebarOpen = true"
            class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <Bars3Icon class="h-6 w-6" />
          </button>
          
          <!-- Desktop title -->
          <h1 class="text-lg font-semibold text-gray-900 lg:hidden">TenantX</h1>
          
          <!-- Desktop content -->
          <div class="hidden lg:flex lg:items-center lg:justify-between lg:flex-1">
            <div class="flex items-center space-x-4">
              <h1 class="text-xl font-semibold text-gray-900">TenantX</h1>
              <span class="text-sm text-gray-500">Property Management System</span>
            </div>
            
            <!-- Desktop actions -->
            <div class="flex items-center space-x-4">
              <!-- User info -->
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div class="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-white">
                      {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
                    </span>
                  </div>
                </div>
                <div class="hidden sm:block">
                  <p class="text-sm font-medium text-gray-900">
                    {{ user?.firstName }} {{ user?.lastName }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ user?.email }}
                  </p>
                </div>
              </div>
              
              <!-- Logout button -->
              <button 
                @click="handleLogout" 
                class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
              >
                <ArrowRightOnRectangleIcon class="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
          
          <!-- Mobile spacer -->
          <div class="lg:hidden"></div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div class="px-4 py-6 sm:px-0">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Tenant List Report</h2>
                <p class="text-gray-600">Comprehensive tenant directory and information</p>
              </div>
              <div class="flex space-x-3">
                <button @click="exportToCSV" class="btn-outline">
                  <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
                  Export CSV
                </button>
                <NuxtLink to="/reports" class="btn-outline">
                  <ArrowLeftIcon class="h-4 w-4 mr-2" />
                  Back to Reports
                </NuxtLink>
              </div>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div class="card">
                <div class="p-6">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <UserGroupIcon class="h-8 w-8 text-blue-600" />
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-gray-500">Total Tenants</p>
                      <p class="text-2xl font-bold text-gray-900">{{ summary.totalTenants }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="p-6">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <CheckCircleIcon class="h-8 w-8 text-green-600" />
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-gray-500">Active Tenants</p>
                      <p class="text-2xl font-bold text-gray-900">{{ summary.activeTenants }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="p-6">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <XCircleIcon class="h-8 w-8 text-red-600" />
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-gray-500">Inactive Tenants</p>
                      <p class="text-2xl font-bold text-gray-900">{{ summary.inactiveTenants }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="p-6">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <CurrencyDollarIcon class="h-8 w-8 text-purple-600" />
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-gray-500">Avg Monthly Rent</p>
                      <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(summary.avgMonthlyRent) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Filters -->
            <div class="card mb-6">
              <div class="p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Property</label>
                    <select v-model="filters.propertyId" class="input">
                      <option value="">All Properties</option>
                      <option v-for="property in properties" :key="property._id" :value="property._id">
                        {{ property.name }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select v-model="filters.status" class="input">
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input 
                      v-model="filters.search" 
                      type="text" 
                      placeholder="Search by name or email..."
                      class="input"
                    />
                  </div>
                  <div class="flex items-end">
                    <button @click="applyFilters" class="btn-primary">
                      <MagnifyingGlassIcon class="h-4 w-4 mr-2" />
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <!-- Tenant List Table -->
            <div v-else class="card">
              <div class="p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Tenants ({{ filteredCount }} results)</h3>
            
                <div v-if="tenants.length > 0" class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tenant
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lease
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monthly Rent
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Move-in Date
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="tenant in tenants" :key="tenant._id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                              <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span class="text-sm font-medium text-primary-600">
                                  {{ getInitials(tenant.firstName, tenant.lastName) }}
                                </span>
                              </div>
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900">
                                {{ tenant.firstName }} {{ tenant.lastName }}
                              </div>
                              <div v-if="tenant.emergencyContact" class="text-sm text-gray-500">
                                Emergency: {{ tenant.emergencyContact.name }}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-gray-900">{{ tenant.email }}</div>
                          <div class="text-sm text-gray-500">{{ tenant.phone }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-gray-900">
                            {{ tenant.unitId?.propertyId?.name }}
                          </div>
                          <div class="text-sm text-gray-500">
                            Unit {{ tenant.unitId?.unitNumber }}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div v-if="tenant.currentLease" class="text-sm text-gray-900">
                            {{ formatDate(tenant.currentLease.startDate) }} - {{ formatDate(tenant.currentLease.endDate) }}
                          </div>
                          <div v-else class="text-sm text-gray-500">No active lease</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {{ $formatMoney(tenant.currentLease?.monthlyRent || tenant.unitId?.rentAmount || 0) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span :class="{
                            'inline-flex px-2 py-1 text-xs font-semibold rounded-full': true,
                            'bg-green-100 text-green-800': tenant.status === 'active',
                            'bg-red-100 text-red-800': tenant.status === 'inactive',
                            'bg-gray-100 text-gray-800': !tenant.status
                          }">
                            {{ tenant.status || 'Unknown' }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ formatDate(tenant.currentLease?.startDate || tenant.createdAt) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div v-else class="text-center py-8">
                  <UserGroupIcon class="mx-auto h-12 w-12 text-gray-400" />
                  <h3 class="mt-2 text-sm font-medium text-gray-900">No Tenants Found</h3>
                  <p class="mt-1 text-gray-500">No tenants match the selected criteria.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  Bars3Icon,
  HomeIcon,
  WrenchScrewdriverIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth'
})

// Authentication
const { user, logout } = useAuth()

// Mobile sidebar state
const sidebarOpen = ref(false)

// Navigation helpers
const route = useRoute()

// Main navigation items
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Properties', href: '/properties', icon: BuildingOfficeIcon },
  { name: 'Tenants', href: '/tenants', icon: UserGroupIcon },
  { name: 'Payments', href: '/payments', icon: CurrencyDollarIcon },
  { name: 'Maintenance', href: '/maintenance', icon: WrenchScrewdriverIcon },
]

// Reports navigation items
const reportNavigation = [
  { name: 'Reports Overview', href: '/reports', icon: ChartBarIcon },
  { name: 'Revenue', href: '/reports/revenue', icon: PresentationChartLineIcon },
  { name: 'Occupancy', href: '/reports/occupancy', icon: DocumentChartBarIcon },
  { name: 'Monthly Summary', href: '/reports/monthly-summary', icon: ClipboardDocumentListIcon },
  { name: 'Vacancy', href: '/reports/vacancy', icon: BuildingOfficeIcon },
  { name: 'Tenant List', href: '/reports/tenant-list', icon: UserGroupIcon },
]

const isActiveRoute = (path) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path.startsWith(path)
}

// Handle logout
const handleLogout = async () => {
  sidebarOpen.value = false
  await logout()
}

// Close sidebar when route changes
watch(() => route.path, () => {
  sidebarOpen.value = false
})



// Data
const loading = ref(true)
const properties = ref([])
const tenants = ref([])
const filteredCount = ref(0)
const summary = ref({
  totalTenants: 0,
  activeTenants: 0,
  inactiveTenants: 0,
  avgMonthlyRent: 0
})

// Filters
const filters = ref({
  propertyId: '',
  status: '',
  search: ''
})

// Fetch properties for filter dropdown
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

// Fetch tenant data
const fetchTenantData = async () => {
  try {
    loading.value = true
    const queryParams = new URLSearchParams()
    
    if (filters.value.propertyId) {
      queryParams.append('propertyId', filters.value.propertyId)
    }
    if (filters.value.status) {
      queryParams.append('status', filters.value.status)
    }
    if (filters.value.search) {
      queryParams.append('search', filters.value.search)
    }

    const response = await $fetch(`/api/reports/tenant-list?${queryParams}`)
    if (response.success) {
      tenants.value = response.data.tenants
      filteredCount.value = response.data.filteredCount
      summary.value = response.data.summary
    }
  } catch (error) {
    console.error('Failed to fetch tenant data:', error)
  } finally {
    loading.value = false
  }
}

// Apply filters
const applyFilters = () => {
  fetchTenantData()
}

// Get initials for avatar
const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
}

// Export to CSV
const exportToCSV = () => {
  if (tenants.value.length === 0) return

  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Property',
    'Unit Number',
    'Monthly Rent',
    'Lease Start',
    'Lease End',
    'Status',
    'Move-in Date',
    'Emergency Contact Name',
    'Emergency Contact Phone'
  ]

  const csvContent = [
    headers.join(','),
    ...tenants.value.map(tenant => [
      `"${tenant.firstName || ''}"`,
      `"${tenant.lastName || ''}"`,
      `"${tenant.email || ''}"`,
      `"${tenant.phone || ''}"`,
      `"${tenant.unitId?.propertyId?.name || ''}"`,
      `"${tenant.unitId?.unitNumber || ''}"`,
      tenant.currentLease?.monthlyRent || tenant.unitId?.rentAmount || 0,
      formatDate(tenant.currentLease?.startDate),
      formatDate(tenant.currentLease?.endDate),
      `"${tenant.status || ''}"`,
      formatDate(tenant.currentLease?.startDate || tenant.createdAt),
      `"${tenant.emergencyContact?.name || ''}"`,
      `"${tenant.emergencyContact?.phone || ''}"`
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `tenant-list-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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

// Initialize
onMounted(() => {
  fetchProperties()
  fetchTenantData()
})
</script>

