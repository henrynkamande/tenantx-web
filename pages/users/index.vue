<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
          <p class="text-gray-600 mt-2">Manage users, roles, and permissions</p>
        </div>
        <button
          @click="showCreateUser = true"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          <Icon name="heroicons:plus" class="w-5 h-5" />
          Add User
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            </div>
            <div class="bg-blue-100 p-3 rounded-full">
              <Icon name="heroicons:users" class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Active Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.active }}</p>
            </div>
            <div class="bg-green-100 p-3 rounded-full">
              <Icon name="heroicons:check-circle" class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Admins</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.admins }}</p>
            </div>
            <div class="bg-purple-100 p-3 rounded-full">
              <Icon name="heroicons:key" class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Inactive Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.inactive }}</p>
            </div>
            <div class="bg-red-100 p-3 rounded-full">
              <Icon name="heroicons:x-circle" class="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search by name or email"
              class="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select v-model="filters.role" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="accountant">Accountant</option>
              <option value="maintenance">Maintenance</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select v-model="filters.isActive" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          
          <div class="flex items-end">
            <button
              @click="applyFilters"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2"
            >
              Apply
            </button>
            <button
              @click="clearFilters"
              class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user._id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{ getUserInitials(user.name) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getRoleClass(user.role)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="editUser(user)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    @click="toggleUserStatus(user._id, !user.isActive)"
                    :class="user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                  >
                    {{ user.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button
                    @click="deleteUser(user._id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="previousPage"
              :disabled="pagination.page === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="pagination.page === pagination.pages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
                {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
                {{ pagination.total }} results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="previousPage"
                  :disabled="pagination.page === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  @click="nextPage"
                  :disabled="pagination.page === pagination.pages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit User Modal -->
      <div v-if="showCreateUser || showEditUser" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">{{ showEditUser ? 'Edit User' : 'Create New User' }}</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <Icon name="heroicons:x-mark" class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="submitUser" class="space-y-6">
            <!-- Basic Information -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  v-model="userForm.name"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  v-model="userForm.email"
                  type="email"
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4" v-if="!showEditUser">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  v-model="userForm.password"
                  type="password"
                  required
                  minlength="6"
                  class="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  v-model="userForm.confirmPassword"
                  type="password"
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select v-model="userForm.role" required class="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="accountant">Accountant</option>
                <option value="maintenance">Maintenance</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            
            <!-- Custom Permissions -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-4">Permissions</h4>
              <div class="space-y-4">
                <div v-for="(module, moduleName) in userForm.permissions" :key="moduleName" class="border rounded-lg p-4">
                  <h5 class="font-medium text-gray-900 mb-2 capitalize">{{ moduleName }}</h5>
                  <div class="grid grid-cols-4 gap-2">
                    <label v-for="(permission, permissionName) in module" :key="permissionName" class="flex items-center">
                      <input
                        v-model="userForm.permissions[moduleName][permissionName]"
                        type="checkbox"
                        class="mr-2"
                      />
                      <span class="text-sm capitalize">{{ permissionName }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                :disabled="loading"
              >
                {{ loading ? 'Saving...' : (showEditUser ? 'Update User' : 'Create User') }}
              </button>
            </div>
          </form>
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

const showCreateUser = ref(false)
const showEditUser = ref(false)
const loading = ref(false)
const users = ref([])
const stats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  admins: 0
})

const filters = ref({
  search: '',
  role: '',
  isActive: ''
})

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

const userForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  permissions: {
    properties: { view: false, create: false, edit: false, delete: false },
    tenants: { view: false, create: false, edit: false, delete: false },
    payments: { view: false, create: false, edit: false, delete: false },
    expenses: { view: false, create: false, edit: false, delete: false, approve: false },
    invoices: { view: false, create: false, edit: false, delete: false, send: false },
    maintenance: { view: false, create: false, edit: false, delete: false, assign: false },
    reports: { view: false, export: false },
    users: { view: false, create: false, edit: false, delete: false }
  }
})

// Fetch data
const fetchUsers = async () => {
  try {
    const { data, pagination: paginationData } = await $fetch('/api/users', {
      query: { ...filters.value, ...pagination.value }
    })
    users.value = data
    pagination.value = paginationData
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const fetchStats = async () => {
  try {
    // Calculate stats from users data
    stats.value.total = users.value.length
    stats.value.active = users.value.filter(u => u.isActive).length
    stats.value.inactive = users.value.filter(u => !u.isActive).length
    stats.value.admins = users.value.filter(u => u.role === 'admin').length
  } catch (error) {
    console.error('Error calculating stats:', error)
  }
}

// Actions
const submitUser = async () => {
  if (!showEditUser.value && userForm.value.password !== userForm.value.confirmPassword) {
    alert('Passwords do not match')
    return
  }
  
  loading.value = true
  try {
    if (showEditUser.value) {
      await $fetch(`/api/users/${userForm.value._id}`, {
        method: 'PUT',
        body: {
          name: userForm.value.name,
          email: userForm.value.email,
          role: userForm.value.role,
          permissions: userForm.value.permissions
        }
      })
    } else {
      await $fetch('/api/users', {
        method: 'POST',
        body: {
          name: userForm.value.name,
          email: userForm.value.email,
          password: userForm.value.password,
          role: userForm.value.role,
          companyId: 'default', // Replace with actual company ID
          customPermissions: userForm.value.permissions
        }
      })
    }
    
    closeModal()
    await fetchUsers()
    await fetchStats()
  } catch (error) {
    console.error('Error saving user:', error)
    alert('Error saving user')
  } finally {
    loading.value = false
  }
}

const editUser = (user) => {
  userForm.value = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: { ...user.permissions }
  }
  showEditUser.value = true
}

const toggleUserStatus = async (userId, isActive) => {
  try {
    await $fetch(`/api/users/${userId}`, {
      method: 'PUT',
      body: { isActive }
    })
    await fetchUsers()
    await fetchStats()
  } catch (error) {
    console.error('Error updating user status:', error)
  }
}

const deleteUser = async (userId) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await $fetch(`/api/users/${userId}`, { method: 'DELETE' })
      await fetchUsers()
      await fetchStats()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }
}

const closeModal = () => {
  showCreateUser.value = false
  showEditUser.value = false
  userForm.value = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    permissions: {
      properties: { view: false, create: false, edit: false, delete: false },
      tenants: { view: false, create: false, edit: false, delete: false },
      payments: { view: false, create: false, edit: false, delete: false },
      expenses: { view: false, create: false, edit: false, delete: false, approve: false },
      invoices: { view: false, create: false, edit: false, delete: false, send: false },
      maintenance: { view: false, create: false, edit: false, delete: false, assign: false },
      reports: { view: false, export: false },
      users: { view: false, create: false, edit: false, delete: false }
    }
  }
}

const applyFilters = () => {
  pagination.value.page = 1
  fetchUsers()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    role: '',
    isActive: ''
  }
  pagination.value.page = 1
  fetchUsers()
}

const previousPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--
    fetchUsers()
  }
}

const nextPage = () => {
  if (pagination.value.page < pagination.value.pages) {
    pagination.value.page++
    fetchUsers()
  }
}

// Utility functions
const getUserInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getRoleClass = (role) => {
  const classes = {
    admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    accountant: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    viewer: 'bg-gray-100 text-gray-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

// Initialize
onMounted(() => {
  fetchUsers().then(fetchStats)
})
</script>
