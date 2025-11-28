<template>
  <div class="dashboard">
    <!-- 头部 -->
    <div class="header">
      <h1>智能数据可视化大屏</h1>
    </div>

    <!-- 左侧面板 -->
    <div class="left-panel">
      <SalesChart />
      <CategoryChart />
    </div>

    <!-- 中间地图区域 -->
    <div class="center-panel">
      <ChinaMap />
    </div>

    <!-- 右侧面板 -->
    <div class="right-panel">
      <TrafficChart />
      <RealtimeChart />
    </div>
  </div>
</template>

<script setup>
import ChinaMap from './components/ChinaMap.vue'
import SalesChart from './components/SalesChart.vue'
import CategoryChart from './components/CategoryChart.vue'
import TrafficChart from './components/TrafficChart.vue'
import RealtimeChart from './components/RealtimeChart.vue'
</script>
