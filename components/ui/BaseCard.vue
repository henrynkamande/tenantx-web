<template>
  <div 
    :class="[
      'bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200',
      hover && 'hover:shadow-md hover:border-slate-300',
      padding && paddingClasses[padding],
      !padding && 'p-6'
    ]"
  >
    <slot />
  </div>
</template>

<script setup>
interface Props {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  hover: false,
  padding: 'md'
})

const paddingClasses = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10'
}
</script>
