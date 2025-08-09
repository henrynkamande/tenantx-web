<template>
  <span :class="badgeClasses">
    <Icon v-if="icon" :name="icon" :class="iconClasses" />
    <slot />
  </span>
</template>

<script setup>
interface Props {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  icon?: string
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm'
})

const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors duration-200'

const variantClasses = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-blue-100 text-blue-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800', 
  danger: 'bg-red-100 text-red-800',
  info: 'bg-sky-100 text-sky-800',
  neutral: 'bg-gray-100 text-gray-800'
}

const sizeClasses = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-sm'
}

const badgeClasses = computed(() => [
  baseClasses,
  variantClasses[props.variant],
  sizeClasses[props.size],
  props.dot && 'pl-1.5'
])

const iconClasses = computed(() => {
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-4 h-4'
  }
  
  return [
    iconSizes[props.size],
    'mr-1'
  ]
})
</script>
