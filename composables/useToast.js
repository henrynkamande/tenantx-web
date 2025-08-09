import { ref } from 'vue';

// Global singleton toast state
let globalToasts = null;

function createToastStore() {
  const toasts = ref([]);

  function showToast(message, type = 'success') {
    const id = Math.random();
    toasts.value.push({ id, message, type });

    // Remove toast after 3 seconds
    setTimeout(() => removeToast(id), 3000);
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(toast => toast.id !== id);
  }

  return { toasts, showToast, removeToast };
}

export function useToast() {
  if (!globalToasts) {
    globalToasts = createToastStore();
  }
  return globalToasts;
}
