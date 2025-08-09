<template>
  <BaseChart
    :chart-id="chartId"
    type="line"
    :data="chartData"
    :options="chartOptions"
    :height="height"
  />
</template>

<script setup>
import BaseChart from './BaseChart.vue'

const { formatCurrency, getCurrencySymbol, getUserCurrency } = useCurrency()

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
  }
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset, index) => ({
    label: dataset.label,
    data: dataset.data,
    borderColor: dataset.borderColor || getDefaultColor(index),
    backgroundColor: dataset.backgroundColor || getDefaultColor(index, 0.1),
    tension: 0.4,
    fill: dataset.fill || false,
    pointBackgroundColor: dataset.borderColor || getDefaultColor(index),
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6,
    ...dataset
  }))
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
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || ''
          const value = props.currency 
            ? formatCurrency(context.parsed.y, getUserCurrency(), { showSymbol: false, showCode: true })
            : context.parsed.y
          return `${label}: ${value}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => {
          if (!props.currency) return value
          const symbol = getCurrencySymbol(getUserCurrency())
          return `${symbol}${new Intl.NumberFormat().format(value)}`
        }
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
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
