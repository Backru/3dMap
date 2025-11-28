<template>
  <div class="chart-container">
    <div class="chart-title">实时访问统计</div>
    <div ref="chartRef" style="width: 100%; height: calc(100% - 40px);"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { realtimeData } from '../data/mockData.js'

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
      data: realtimeData.map(item => item.time),
      axisLine: {
        lineStyle: {
          color: '#00d4ff'
        }
      },
      axisLabel: {
        color: '#fff',
        fontSize: 10
      }
    },
    yAxis: [
      {
        type: 'value',
        name: 'PV',
        position: 'left',
        axisLine: {
          lineStyle: {
            color: '#00d4ff'
          }
        },
        axisLabel: {
          color: '#fff',
          fontSize: 10
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 212, 255, 0.2)'
          }
        }
      },
      {
        type: 'value',
        name: 'UV',
        position: 'right',
        axisLine: {
          lineStyle: {
            color: '#ff6b35'
          }
        },
        axisLabel: {
          color: '#fff',
          fontSize: 10
        }
      }
    ],
    series: [
      {
        name: 'PV',
        type: 'bar',
        yAxisIndex: 0,
        data: realtimeData.map(item => item.pv),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00d4ff' },
            { offset: 1, color: 'rgba(0, 212, 255, 0.3)' }
          ]),
          borderRadius: [2, 2, 0, 0]
        },
        emphasis: {
          itemStyle: {
            shadowColor: '#00d4ff',
            shadowBlur: 10
          }
        }
      },
      {
        name: 'UV',
        type: 'line',
        yAxisIndex: 1,
        data: realtimeData.map(item => item.uv),
        lineStyle: {
          color: '#ff6b35',
          width: 3
        },
        itemStyle: {
          color: '#ff6b35',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 107, 53, 0.4)' },
            { offset: 1, color: 'rgba(255, 107, 53, 0.1)' }
          ])
        },
        smooth: true
      }
    ],
    legend: {
      data: ['PV', 'UV'],
      textStyle: {
        color: '#fff'
      },
      top: '5%'
    },
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
  
  // 实时数据更新效果
  const updateData = () => {
    const newData = realtimeData.map(item => ({
      ...item,
      pv: item.pv + Math.floor(Math.random() * 20 - 10),
      uv: item.uv + Math.floor(Math.random() * 15 - 7)
    }))
    
    chart.setOption({
      series: [
        {
          data: newData.map(item => Math.max(0, item.pv))
        },
        {
          data: newData.map(item => Math.max(0, item.uv))
        }
      ]
    })
  }
  
  const timer = setInterval(updateData, 3000)
  chart._updateTimer = timer
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
    if (chart._updateTimer) {
      clearInterval(chart._updateTimer)
    }
    chart.dispose()
  }
  window.removeEventListener('resize', resizeChart)
})
</script>
