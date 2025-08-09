<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
            getToastClasses(toast.type)
          ]"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <Icon
                  :name="getToastIcon(toast.type)"
                  :class="[
                    'w-6 h-6',
                    getIconClasses(toast.type)
                  ]"
                />
              </div>
              <div class="ml-3 w-0 flex-1">
                <p :class="['text-sm font-medium', getTitleClasses(toast.type)]">
                  {{ toast.title }}
                </p>
                <p v-if="toast.message" class="mt-1 text-sm text-gray-500">
                  {{ toast.message }}
                </p>
                <div v-if="toast.actions && toast.actions.length" class="mt-3 flex space-x-3">
                  <button
                    v-for="action in toast.actions"
                    :key="action.label"
                    @click="action.action()"
                    class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    {{ action.label }}
                  </button>
                </div>
              </div>
              <div class="ml-4 flex-shrink-0 flex">
                <button
                  @click="removeToast(toast.id)"
                  class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Icon name="heroicons:x-mark" class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
const { toasts, removeToast } = useToast()

const getToastClasses = (type) => {
  const classes = {
    success: 'border-l-4 border-green-400',
    error: 'border-l-4 border-red-400',
    warning: 'border-l-4 border-yellow-400',
    info: 'border-l-4 border-blue-400'
  }
  return classes[type] || classes.info
}

const getToastIcon = (type) => {
  const icons = {
    success: 'heroicons:check-circle',
    error: 'heroicons:x-circle',
    warning: 'heroicons:exclamation-triangle',
    info: 'heroicons:information-circle'
  }
  return icons[type] || icons.info
}

const getIconClasses = (type) => {
  const classes = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }
  return classes[type] || classes.info
}

const getTitleClasses = (type) => {
  const classes = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900'
  }
  return classes[type] || classes.info
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
