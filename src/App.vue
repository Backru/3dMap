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
        <ChinaMap @enter-city="enterCity" @enter-showroom="enterShowroom" />
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <TrafficChart />
        <RealtimeChart />
      </div>
    </template>

    <!-- 城市孪生模式 -->
    <div v-else-if="currentView === 'city'" class="city-twin-wrapper">
      <CityTwin :cityName="selectedCity" @back="backToMap" />
    </div>

    <!-- 汽车展厅模式 -->
    <div v-else-if="currentView === 'showroom'" class="showroom-wrapper">
      <CarShowroom @back="backToMap" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChinaMap from './components/ChinaMap.vue'
import CityTwin from './components/CityTwin.vue'
import CarShowroom from './components/CarShowroom.vue'
import SalesChart from './components/SalesChart.vue'
import CategoryChart from './components/CategoryChart.vue'
import TrafficChart from './components/TrafficChart.vue'
import RealtimeChart from './components/RealtimeChart.vue'

const currentView = ref('map') // 'map', 'city', 或 'showroom'
const selectedCity = ref('')

// 进入城市孪生
const enterCity = (cityName) => {
  selectedCity.value = cityName
  currentView.value = 'city'
}

// 进入汽车展厅
const enterShowroom = () => {
  currentView.value = 'showroom'
}

// 返回地图
const backToMap = () => {
  currentView.value = 'map'
  selectedCity.value = ''
}
</script>

<style scoped>
/* 城市孪生和展厅包装器 */
.city-twin-wrapper,
.showroom-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}
</style>
