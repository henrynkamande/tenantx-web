<template>
  <BaseChart
    :chart-id="chartId"
    type="bar"
    :data="chartData"
    :options="chartOptions"
    :height="height"
  />
</template>

<script setup>
const props = defineProps({
  chartId: {
    type: String,
    required: true
  },
  labels: {
    type: Array,
    required: true
  },
  datasets: {
    type: Array,
    required: true
  },
  height: {
    type: Number,
    default: 300
  },
  title: {
    type: String,
    default: ''
  },
  currency: {
    type: Boolean,
    default: false
  },
  horizontal: {
    type: Boolean,
    default: false
  }
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset, index) => ({
    label: dataset.label,
    data: dataset.data,
    backgroundColor: dataset.backgroundColor || getDefaultColor(index, 0.8),
    borderColor: dataset.borderColor || getDefaultColor(index),
    borderWidth: 1,
    borderRadius: 4,
    borderSkipped: false,
    ...dataset
  }))
}))

const chartOptions = computed(() => ({
  indexAxis: props.horizontal ? 'y' : 'x',
  plugins: {
    title: {
      display: !!props.title,
      text: props.title,
      font: {
        size: 16,
        weight: 'bold'
      }
    },
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || ''
          const value = props.currency 
            ? `$${new Intl.NumberFormat().format(context.parsed.y || context.parsed.x)}`
            : (context.parsed.y || context.parsed.x)
          return `${label}: ${value}`
        }
      }
    }
  },
  scales: {
    [props.horizontal ? 'x' : 'y']: {
      beginAtZero: true,
      ticks: {
        callback: (value) => {
          return props.currency 
            ? `$${new Intl.NumberFormat().format(value)}`
            : value
        }
      }
    }
  }
}))

const getDefaultColor = (index, alpha = 1) => {
  const colors = [
    `rgba(59, 130, 246, ${alpha})`, // blue
    `rgba(16, 185, 129, ${alpha})`, // green  
    `rgba(245, 101, 101, ${alpha})`, // red
    `rgba(168, 85, 247, ${alpha})`, // purple
    `rgba(251, 191, 36, ${alpha})`, // yellow
    `rgba(236, 72, 153, ${alpha})`, // pink
  ]
  return colors[index % colors.length]
}
</script>
