<template>
  <div class="dashboard">
    <!-- 地图模式 -->
    <template v-if="currentView === 'map'">
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
        <ChinaMap @enter-city="enterCity" />
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <TrafficChart />
        <RealtimeChart />
      </div>
    </template>

    <!-- 城市孪生模式 -->
    <template v-else-if="currentView === 'city'">
      <CityTwin :cityName="selectedCity" @back="backToMap" />
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChinaMap from './components/ChinaMap.vue'
import CityTwin from './components/CityTwin.vue'
import SalesChart from './components/SalesChart.vue'
import CategoryChart from './components/CategoryChart.vue'
import TrafficChart from './components/TrafficChart.vue'
import RealtimeChart from './components/RealtimeChart.vue'

const currentView = ref('map') // 'map' 或 'city'
const selectedCity = ref('')

// 进入城市孪生
const enterCity = (cityName) => {
  selectedCity.value = cityName
  currentView.value = 'city'
}

// 返回地图
const backToMap = () => {
  currentView.value = 'map'
  selectedCity.value = ''
}
</script>
