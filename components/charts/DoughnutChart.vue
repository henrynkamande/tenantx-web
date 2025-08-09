<template>
  <BaseChart
    :chart-id="chartId"
    type="doughnut"
    :data="chartData"
    :options="chartOptions"
    :height="height"
  />
</template>

<script setup>
import BaseChart from './BaseChart.vue'

const props = defineProps({
  chartId: {
    type: String,
    required: true
  },
  labels: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  backgroundColor: {
    type: Array,
    default: () => []
  },
  height: {
    type: Number,
    default: 300
  },
  title: {
    type: String,
    default: ''
  },
  showPercentages: {
    type: Boolean,
    default: true
  },
  centerText: {
    type: String,
    default: ''
  }
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    data: props.data,
    backgroundColor: props.backgroundColor.length > 0 
      ? props.backgroundColor 
      : getDefaultColors(props.data.length),
    borderWidth: 2,
    borderColor: '#fff',
    hoverBorderWidth: 3,
    hoverBorderColor: '#fff'
  }]
}))

const chartOptions = computed(() => ({
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
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || ''
          const value = context.parsed
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return props.showPercentages 
            ? `${label}: ${value} (${percentage}%)`
            : `${label}: ${value}`
        }
      }
    }
  },
  cutout: '60%',
  maintainAspectRatio: false
}))

const getDefaultColors = (count) => {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
  ]
  
  return Array.from({ length: count }, (_, i) => colors[i % colors.length])
}
</script>
