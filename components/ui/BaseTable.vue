<template>
  <BaseCard padding="none">
    <!-- Table Header -->
    <div v-if="title || $slots.header" class="px-6 py-4 border-b border-slate-200 bg-slate-50">
      <div class="flex items-center justify-between">
        <div>
          <h3 v-if="title" class="text-lg font-semibold text-slate-900">{{ title }}</h3>
          <p v-if="subtitle" class="mt-1 text-sm text-slate-600">{{ subtitle }}</p>
        </div>
        <div v-if="$slots.header" class="flex items-center space-x-3">
          <slot name="header" />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="px-6 py-12 text-center">
      <div class="inline-flex items-center justify-center">
        <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="ml-3 text-slate-600 font-medium">{{ loadingText }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!data || data.length === 0" class="px-6 py-12 text-center">
      <div class="mx-auto h-12 w-12 text-slate-400 mb-4">
        <Icon :name="emptyIcon" class="h-12 w-12" />
      </div>
      <h3 class="text-sm font-medium text-slate-900 mb-1">{{ emptyTitle }}</h3>
      <p class="text-sm text-slate-500">{{ emptyDescription }}</p>
      <div v-if="$slots.empty" class="mt-6">
        <slot name="empty" />
      </div>
    </div>

    <!-- Table Content -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right',
                column.sortable && 'cursor-pointer hover:bg-slate-100 transition-colors'
              ]"
              @click="column.sortable && handleSort(column.key)"
            >
              <div class="flex items-center">
                {{ column.label }}
                <div v-if="column.sortable" class="ml-2 flex flex-col">
                  <Icon
                    name="chevron-up"
                    :class="[
                      'h-3 w-3 transition-colors',
                      sortBy === column.key && sortOrder === 'asc' ? 'text-blue-600' : 'text-slate-400'
                    ]"
                  />
                  <Icon
                    name="chevron-down"
                    :class="[
                      'h-3 w-3 -mt-1 transition-colors',
                      sortBy === column.key && sortOrder === 'desc' ? 'text-blue-600' : 'text-slate-400'
                    ]"
                  />
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200">
          <tr
            v-for="(row, index) in paginatedData"
            :key="getRowKey(row, index)"
            class="hover:bg-slate-50 transition-colors"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-6 py-4 whitespace-nowrap text-sm',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right'
              ]"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="getValue(row, column.key)"
                :index="index"
              >
                <span :class="column.cellClass">
                  {{ formatValue(getValue(row, column.key), column) }}
                </span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="paginated && data && data.length > pageSize"
      class="px-6 py-4 border-t border-slate-200 bg-slate-50"
    >
      <div class="flex items-center justify-between">
        <div class="text-sm text-slate-700">
          Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, data.length) }} of {{ data.length }} results
        </div>
        <div class="flex items-center space-x-2">
          <BaseButton
            variant="outline"
            size="sm"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Previous
          </BaseButton>
          <BaseButton
            variant="outline"
            size="sm"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
interface Column {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  cellClass?: string
  format?: 'currency' | 'date' | 'datetime' | 'number'
}

interface Props {
  title?: string
  subtitle?: string
  columns: Column[]
  data?: any[]
  loading?: boolean
  loadingText?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: string
  paginated?: boolean
  pageSize?: number
  rowKey?: string | ((row: any, index: number) => string)
}

const props = withDefaults(defineProps<Props>(), {
  loadingText: 'Loading data...',
  emptyTitle: 'No data available',
  emptyDescription: 'There are no items to display at this time.',
  emptyIcon: 'table-cells',
  paginated: false,
  pageSize: 25,
  rowKey: 'id'
})

const emit = defineEmits<{
  sort: [key: string, order: 'asc' | 'desc']
}>()

// Sorting
const sortBy = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Pagination
const currentPage = ref(1)

const sortedData = computed(() => {
  if (!props.data || !sortBy.value) return props.data || []
  
  return [...props.data].sort((a, b) => {
    const aVal = getValue(a, sortBy.value)
    const bVal = getValue(b, sortBy.value)
    
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const paginatedData = computed(() => {
  if (!props.paginated) return sortedData.value
  
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return sortedData.value.slice(start, end)
})

const totalPages = computed(() => {
  if (!props.paginated || !props.data) return 1
  return Math.ceil(props.data.length / props.pageSize)
})

const handleSort = (key: string) => {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortOrder.value = 'asc'
  }
  emit('sort', key, sortOrder.value)
}

const getValue = (row: any, key: string) => {
  return key.split('.').reduce((obj, k) => obj?.[k], row)
}

const getRowKey = (row: any, index: number) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row, index)
  }
  return getValue(row, props.rowKey) || index
}

const formatValue = (value: any, column: Column) => {
  if (value == null) return '-'
  
  switch (column.format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'datetime':
      return new Date(value).toLocaleString()
    case 'number':
      return new Intl.NumberFormat('en-US').format(value)
    default:
      return value
  }
}
</script>
