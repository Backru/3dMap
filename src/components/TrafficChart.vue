<template>
  <div class="chart-container">
    <div class="chart-title">流量来源分析</div>
    <div ref="chartRef" style="width: 100%; height: calc(100% - 40px);"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { trafficData } from '../data/mockData.js'

const chartRef = ref(null)
let chart = null

const initChart = () => {
  chart = echarts.init(chartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '15%',
      right: '10%',
      top: '20%',
      bottom: '15%'
    },
    xAxis: {
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
    yAxis: {
      type: 'category',
      data: trafficData.map(item => item.name),
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
    series: [{
      data: trafficData.map((item, index) => ({
        value: item.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#00d4ff' },
            { offset: 1, color: '#007bff' }
          ])
        }
      })),
      type: 'bar',
      barWidth: '60%',
      itemStyle: {
        borderRadius: [0, 5, 5, 0]
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#ff6b35' },
            { offset: 1, color: '#feca57' }
          ]),
          shadowColor: '#00d4ff',
          shadowBlur: 10
        }
      },
      label: {
        show: true,
        position: 'right',
        color: '#fff',
        fontSize: 12,
        formatter: '{c}'
      }
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      textStyle: {
        color: '#fff'
      },
      formatter: '{b}: {c}'
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
    currentIndex = (currentIndex + 1) % trafficData.length
  }, 2500)
  
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
