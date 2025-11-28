<template>
  <div class="chart-container">
    <div class="chart-title">销售趋势</div>
    <div ref="chartRef" style="width: 100%; height: calc(100% - 40px);"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { salesData } from '../data/mockData.js'

const chartRef = ref(null)
let chart = null

const initChart = () => {
  chart = echarts.init(chartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '10%',
      right: '10%',
      top: '20%',
      bottom: '20%'
    },
    xAxis: {
      type: 'category',
      data: salesData.map(item => item.month),
      axisLine: {
        lineStyle: {
          color: '#00d4ff'
        }
      },
      axisLabel: {
        color: '#fff',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#00d4ff'
        }
      },
      axisLabel: {
        color: '#fff',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.2)'
        }
      }
    },
    series: [{
      data: salesData.map(item => item.value),
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#00d4ff',
        width: 3
      },
      itemStyle: {
        color: '#00d4ff',
        borderColor: '#fff',
        borderWidth: 2
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 212, 255, 0.6)' },
          { offset: 1, color: 'rgba(0, 212, 255, 0.1)' }
        ])
      },
      emphasis: {
        itemStyle: {
          color: '#fff',
          borderColor: '#00d4ff',
          borderWidth: 3,
          shadowColor: '#00d4ff',
          shadowBlur: 10
        }
      }
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      textStyle: {
        color: '#fff'
      }
    }
  }
  
  chart.setOption(option)
  
  // 添加动画效果
  let currentIndex = 0
  const timer = setInterval(() => {
    chart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: currentIndex
    })
    currentIndex = (currentIndex + 1) % salesData.length
  }, 2000)
  
  // 保存定时器引用以便清理
  chart._autoTooltipTimer = timer
}

const resizeChart = () => {
  if (chart) {
    chart.resize()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  if (chart) {
    if (chart._autoTooltipTimer) {
      clearInterval(chart._autoTooltipTimer)
    }
    chart.dispose()
  }
  window.removeEventListener('resize', resizeChart)
})
</script>
