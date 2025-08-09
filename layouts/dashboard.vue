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
        <slot />
      </main>
    </div>
    
    <!-- Global Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup>
import {
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Bars3Icon,
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  ClipboardDocumentListIcon,
  ReceiptPercentIcon,
  DocumentTextIcon,
  UsersIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'
import ToastContainer from '~/components/ui/ToastContainer.vue'

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
  { name: 'Expenses', href: '/expenses', icon: ReceiptPercentIcon },
    { name: 'Invoices', href: '/invoices', icon: DocumentTextIcon },
    { name: 'Maintenance', href: '/maintenance', icon: WrenchScrewdriverIcon },
    { name: 'Users', href: '/users', icon: UsersIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

// Reports navigation items
const reportNavigation = [
  { name: 'Reports Overview', href: '/reports', icon: ChartBarIcon },
  { name: 'Revenue', href: '/reports/revenue', icon: PresentationChartLineIcon },
  { name: 'Occupancy', href: '/reports/occupancy', icon: DocumentChartBarIcon },
  { name: 'Maintenance Summary', href: '/reports/maintenance-summary', icon: WrenchScrewdriverIcon },
  { name: 'Tenant Turnover', href: '/reports/tenant-turnover', icon: UserGroupIcon },
  { name: 'Monthly Summary', href: '/reports/monthly-summary', icon: ClipboardDocumentListIcon },
]

const isActiveRoute = (path) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path.startsWith(path)
}

const handleLogout = async () => {
  sidebarOpen.value = false
  await logout()
}

// Close sidebar when route changes
watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>
