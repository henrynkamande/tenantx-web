<template>
  <div class="bg-white border-b border-slate-200">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex min-h-16 items-center justify-between py-4 lg:py-6">
        <!-- Left side - Title and description -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center">
            <div 
              v-if="icon" 
              class="mr-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100"
            >
              <Icon :name="icon" class="h-6 w-6 text-blue-600" />
            </div>
            
            <div class="min-w-0 flex-1">
              <nav v-if="breadcrumbs" class="flex mb-2" aria-label="Breadcrumb">
                <ol class="flex items-center space-x-2">
                  <li v-for="(item, index) in breadcrumbs" :key="index" class="flex items-center">
                    <NuxtLink
                      v-if="item.href && index < breadcrumbs.length - 1"
                      :to="item.href"
                      class="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {{ item.label }}
                    </NuxtLink>
                    <span
                      v-else
                      class="text-sm"
                      :class="index === breadcrumbs.length - 1 ? 'text-slate-900 font-medium' : 'text-slate-500'"
                    >
                      {{ item.label }}
                    </span>
                    <Icon
                      v-if="index < breadcrumbs.length - 1"
                      name="chevron-right"
                      class="ml-2 h-4 w-4 text-slate-400"
                    />
                  </li>
                </ol>
              </nav>
              
              <h1 class="text-2xl font-bold text-slate-900 lg:text-3xl">
                {{ title }}
              </h1>
              
              <p v-if="description" class="mt-2 text-slate-600 lg:text-lg">
                {{ description }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Right side - Actions -->
        <div v-if="$slots.actions" class="ml-6 flex items-center space-x-3">
          <slot name="actions" />
        </div>
      </div>
      
      <!-- Bottom section for tabs, filters, etc -->
      <div v-if="$slots.bottom" class="border-t border-slate-200 pt-4 pb-4">
        <slot name="bottom" />
      </div>
    </div>
  </div>
</template>

<script setup>
interface BreadcrumbItem {
  label: string
  href?: string
}

interface Props {
  title: string
  description?: string
  icon?: string
  breadcrumbs?: BreadcrumbItem[]
}

defineProps<Props>()
</script>
