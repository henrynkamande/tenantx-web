<template>
  <BaseCard :hover="hover" class="relative overflow-hidden">
    <!-- Background decoration -->
    <div 
      v-if="variant !== 'default'"
      :class="[
        'absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 rounded-full opacity-10',
        decorationClasses[variant]
      ]"
    />
    
    <div class="relative">
      <div class="flex items-center justify-between">
        <!-- Icon and title -->
        <div class="flex items-center space-x-3">
          <div 
            v-if="icon"
            :class="[
              'flex h-12 w-12 items-center justify-center rounded-lg',
              iconBackgroundClasses[variant]
            ]"
          >
            <Icon :name="icon" :class="['h-6 w-6', iconClasses[variant]]" />
          </div>
          
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-slate-600 truncate">{{ title }}</p>
            <p v-if="subtitle" class="text-xs text-slate-500 truncate">{{ subtitle }}</p>
          </div>
        </div>
        
        <!-- Trend indicator -->
        <div v-if="trend !== undefined" class="flex items-center">
          <div :class="['flex items-center text-sm font-medium', trendClasses]">
            <Icon
              :name="trend >= 0 ? 'trending-up' : 'trending-down'"
              class="h-4 w-4 mr-1"
            />
            {{ Math.abs(trend) }}%
          </div>
        </div>
      </div>
      
      <!-- Value -->
      <div class="mt-4">
        <div class="flex items-baseline">
          <span :class="['text-3xl font-bold', valueClasses[variant]]">
            {{ formattedValue }}
          </span>
          <span v-if="unit" class="ml-2 text-sm font-medium text-slate-500">
            {{ unit }}
          </span>
        </div>
        
        <!-- Description or change -->
        <div v-if="description || change !== undefined" class="mt-2 flex items-center justify-between">
          <p v-if="description" class="text-sm text-slate-600">{{ description }}</p>
          
          <div v-if="change !== undefined" class="flex items-center text-sm">
            <span :class="changeClasses">
              {{ change >= 0 ? '+' : '' }}{{ change }}
              {{ changeUnit }}
            </span>
            <span class="text-slate-500 ml-1">vs last {{ period }}</span>
          </div>
        </div>
      </div>
      
      <!-- Loading overlay -->
      <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
        <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
interface Props {
  title: string
  subtitle?: string
  value: number | string
  unit?: string
  icon?: string
  description?: string
  trend?: number
  change?: number
  changeUnit?: string
  period?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  format?: 'number' | 'currency' | 'percentage'
  loading?: boolean
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  format: 'number',
  period: 'month',
  changeUnit: '',
  loading: false,
  hover: true
})

const iconBackgroundClasses = {
  default: 'bg-slate-100',
  primary: 'bg-blue-100',
  success: 'bg-emerald-100',
  warning: 'bg-amber-100',
  danger: 'bg-red-100',
  info: 'bg-sky-100'
}

const iconClasses = {
  default: 'text-slate-600',
  primary: 'text-blue-600',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  info: 'text-sky-600'
}

const valueClasses = {
  default: 'text-slate-900',
  primary: 'text-blue-900',
  success: 'text-emerald-900',
  warning: 'text-amber-900',
  danger: 'text-red-900',
  info: 'text-sky-900'
}

const decorationClasses = {
  default: 'bg-slate-500',
  primary: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500'
}

const { $formatMoney } = useNuxtApp()

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  
  switch (props.format) {
    case 'currency':
      return $formatMoney(props.value)
    case 'percentage':
      return `${props.value}%`
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(props.value)
  }
})

const trendClasses = computed(() => {
  if (props.trend === undefined) return ''
  return props.trend >= 0 ? 'text-emerald-600' : 'text-red-600'
})

const changeClasses = computed(() => {
  if (props.change === undefined) return 'text-slate-600'
  return props.change >= 0 ? 'text-emerald-600' : 'text-red-600'
})
</script>
