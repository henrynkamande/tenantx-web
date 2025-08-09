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
                <h2 class="text-2xl font-bold text-gray-900">Vacancy Report</h2>
                <p class="text-gray-600">Track vacant units and revenue loss analysis</p>
              </div>
              <NuxtLink to="/reports" class="btn-outline">
                <ArrowLeftIcon class="h-4 w-4 mr-2" />
                Back to Reports
              </NuxtLink>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <BuildingOfficeIcon class="h-8 w-8 text-red-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Vacant Units</p>
                  <p class="text-2xl font-bold text-gray-900">{{ summary.vacantUnits }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <ChartBarIcon class="h-8 w-8 text-yellow-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Vacancy Rate</p>
                  <p class="text-2xl font-bold text-gray-900">{{ summary.vacancyRate }}%</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <CurrencyDollarIcon class="h-8 w-8 text-red-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Lost Revenue</p>
                  <p class="text-2xl font-bold text-gray-900">{{ $formatMoney(summary.lostRevenue) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <CalendarIcon class="h-8 w-8 text-purple-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Avg Vacancy Days</p>
                  <p class="text-2xl font-bold text-gray-900">{{ summary.avgVacancyDays }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vacant Units Table -->
        <div class="card mb-8">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Current Vacant Units</h3>
            
            <div v-if="loading" class="flex items-center justify-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <div v-else-if="vacantUnits.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property/Unit
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Rent
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vacant Since
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Vacant
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lost Revenue
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="unit in vacantUnits" :key="unit._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        {{ unit.propertyId?.name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        Unit {{ unit.unitNumber }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ unit.bedrooms }}BR / {{ unit.bathrooms }}BA
                      </div>
                      <div v-if="unit.squareFootage" class="text-sm text-gray-500">
                        {{ unit.squareFootage }} sq ft
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ $formatMoney(unit.rentAmount) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(unit.vacantSince) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ unit.vacantDays }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                    {{ $formatMoney(unit.lostRevenue) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="text-center py-8">
              <BuildingOfficeIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">No Vacant Units</h3>
              <p class="mt-1 text-sm text-gray-500">All units are currently occupied.</p>
            </div>
          </div>
        </div>

        <!-- Property Vacancy Breakdown -->
        <div class="card">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Vacancy by Property</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="property in propertyVacancy" :key="property._id" class="border rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-2">{{ property.name }}</h4>
                <div class="space-y-1 text-sm text-gray-600">
                  <div>Total Units: {{ property.totalUnits }}</div>
                  <div>Vacant: {{ property.vacantUnits }}</div>
                  <div>Vacancy Rate: {{ property.vacancyRate }}%</div>
                  <div class="text-red-600 font-medium">
                    Lost Revenue: {{ $formatMoney(property.lostRevenue) }}
                  </div>
                </div>
              </div>
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
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  XMarkIcon,
  Bars3Icon,
  HomeIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  ClipboardDocumentListIcon
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
const vacantUnits = ref([])
const propertyVacancy = ref([])
const summary = ref({
  vacantUnits: 0,
  vacancyRate: 0,
  lostRevenue: 0,
  avgVacancyDays: 0
})

// Fetch vacancy data
const fetchVacancyData = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/reports/vacancy')
    if (response.success) {
      vacantUnits.value = response.data.vacantUnits
      propertyVacancy.value = response.data.propertyVacancy
      summary.value = response.data.summary
    }
  } catch (error) {
    console.error('Failed to fetch vacancy data:', error)
  } finally {
    loading.value = false
  }
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
  fetchVacancyData()
})
</script>

