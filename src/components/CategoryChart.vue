<template>
  <div class="chart-container">
    <div class="chart-title">产品分类占比</div>
    <div ref="chartRef" style="width: 100%; height: calc(100% - 40px);"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { categoryData } from '../data/mockData.js'

const chartRef = ref(null)
let chart = null

const initChart = () => {
  chart = echarts.init(chartRef.value)
  
  const colors = ['#00d4ff', '#ff6b35', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
  
  const option = {
    backgroundColor: 'transparent',
    color: colors,
    series: [{
      name: '产品分类',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: categoryData,
      itemStyle: {
        borderRadius: 5,
        borderColor: '#1a2332',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'outside',
        color: '#fff',
        fontSize: 12,
        formatter: '{b}: {c}万'
      },
      labelLine: {
        show: true,
        lineStyle: {
          color: '#00d4ff'
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 212, 255, 0.5)'
        },
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      }
    }],
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      textStyle: {
        color: '#fff'
      },
      formatter: '{b}: {c}万 ({d}%)'
    }
  }
  
  chart.setOption(option)
  
  // 添加自动高亮效果
  let currentIndex = 0
  const timer = setInterval(() => {
    chart.dispatchAction({
      type: 'downplay',
      seriesIndex: 0
    })
    chart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: currentIndex
    })
    currentIndex = (currentIndex + 1) % categoryData.length
  }, 1500)
  
  chart._autoHighlightTimer = timer
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
    if (chart._autoHighlightTimer) {
      clearInterval(chart._autoHighlightTimer)
    }
    chart.dispose()
  }
  window.removeEventListener('resize', resizeChart)
})
</script>
