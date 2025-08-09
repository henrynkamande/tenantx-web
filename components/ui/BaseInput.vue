<template>
  <div class="space-y-2">
    <label 
      v-if="label" 
      :for="inputId"
      class="block text-sm font-medium text-slate-700"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <div class="relative">
      <div 
        v-if="iconLeft" 
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <Icon :name="iconLeft" class="h-4 w-4 text-slate-400" />
      </div>
      
      <component
        :is="tag"
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        v-bind="$attrs"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      >
        <slot v-if="tag === 'select'" />
      </component>
      
      <div 
        v-if="iconRight" 
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
      >
        <Icon :name="iconRight" class="h-4 w-4 text-slate-400" />
      </div>
    </div>
    
    <p v-if="error" class="text-sm text-red-600 flex items-center">
      <Icon name="exclamation-circle" class="h-4 w-4 mr-1" />
      {{ error }}
    </p>
    
    <p v-else-if="hint" class="text-sm text-slate-500">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
interface Props {
  modelValue?: string | number
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
  iconLeft?: string
  iconRight?: string
  tag?: 'input' | 'select' | 'textarea'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  tag: 'input',
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: Event]
  focus: [event: Event]
}>()

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const baseClasses = 'block w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed'

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base'
}

const inputClasses = computed(() => [
  baseClasses,
  sizeClasses[props.size],
  props.iconLeft && 'pl-10',
  props.iconRight && 'pr-10',
  props.error && 'border-red-300 focus:border-red-500 focus:ring-red-500'
])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
