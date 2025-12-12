<template>
  <div class="map-container" ref="mapContainer">
    <!-- 顶部进入城市孪生按钮 - 在市级地图或直辖市时显示 -->
    <div class="top-action-bar" v-if="(mapLevel === 'city' && selectedCity) || (mapLevel === 'province' && isDirectMunicipality)">
      <button class="enter-city-twin-btn" @click="enterCityTwinFromTop">
        <span class="icon">🏙️</span>
        <span>进入 {{ selectedCity || selectedProvince }} 数字孪生</span>
      </button>
    </div>

    <div class="controls">
      <!-- 视觉特效下拉菜单 -->
      <div class="dropdown" ref="effectsDropdown">
        <button 
          class="dropdown-btn" 
          @click="toggleDropdown('effects')"
          :class="{ active: openDropdown === 'effects' }"
        >
          <span>✨ 视觉特效</span>
          <span class="badge" v-if="activeEffectsCount > 0">{{ activeEffectsCount }}</span>
          <span class="arrow" :class="{ open: openDropdown === 'effects' }">▼</span>
        </button>
        <div class="dropdown-menu" v-show="openDropdown === 'effects'">
          <button @click="toggleBarChart" :class="{ active: showBarChart }">
            <span class="icon">📊</span> 柱状图特效
          </button>
          <button @click="toggleSideEffect" :class="{ active: showSideEffect }">
            <span class="icon">✨</span> 侧边光效
          </button>
          <button @click="toggleGroundEffect" :class="{ active: showGroundEffect }">
            <span class="icon">💫</span> 地面扩散
          </button>
          <button @click="toggleGearEffect" :class="{ active: showGear }">
            <span class="icon">⭕</span> 光圈特效
          </button>
        </div>
      </div>

      <!-- 导航控制下拉菜单 -->
      <div class="dropdown" ref="navDropdown">
        <button 
          class="dropdown-btn" 
          @click="toggleDropdown('navigation')"
          :class="{ active: openDropdown === 'navigation' }"
        >
          <span>🧭 导航控制</span>
          <span class="badge" v-if="activeNavCount > 0">{{ activeNavCount }}</span>
          <span class="arrow" :class="{ open: openDropdown === 'navigation' }">▼</span>
        </button>
        <div class="dropdown-menu" v-show="openDropdown === 'navigation'">
          <button @click="toggleFlightRoutes" :class="{ active: showFlightRoutes }">
            <span class="icon">✈️</span> 飞机航线
          </button>
          <button @click="toggleGrid" :class="{ active: showGrid }">
            <span class="icon">📐</span> 辅助网格
          </button>
          <button @click="togglePanMode" :class="{ active: isPanMode }">
            <span class="icon">🖱️</span> {{ isPanMode ? '拖动模式' : '旋转模式' }}
          </button>
        </div>
      </div>

      <!-- 区域选择下拉菜单 -->
      <div class="dropdown" ref="regionDropdown">
        <button 
          class="dropdown-btn" 
          @click="toggleDropdown('region')"
          :class="{ active: openDropdown === 'region' }"
        >
          <span>🗺️ 区域选择</span>
          <span class="arrow" :class="{ open: openDropdown === 'region' }">▼</span>
        </button>
        <div class="dropdown-menu" v-show="openDropdown === 'region'">
          <div class="select-wrapper">
            <label>选择省份</label>
            <select v-model="selectedProvince" @change="onProvinceChange">
              <option value="">全国</option>
              <option v-for="p in provinceList" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          
          <div class="select-wrapper" v-if="cityList.length > 0">
            <label>选择区县</label>
            <select v-model="selectedCity" @change="onCityChange">
              <option value="">全部</option>
              <option v-for="c in cityList" :key="c.name" :value="c.name">{{ c.name }}</option>
            </select>
          </div>

          <button @click="resetView" class="reset-btn">
            <span class="icon">🏠</span> 返回全国
          </button>
        </div>
      </div>

      <!-- 数据分类下拉菜单 -->
      <div class="dropdown" ref="dataDropdown">
        <button 
          class="dropdown-btn" 
          @click="toggleDropdown('data')"
          :class="{ active: openDropdown === 'data' }"
        >
          <span>📈 数据展示</span>
          <span class="arrow" :class="{ open: openDropdown === 'data' }">▼</span>
        </button>
        <div class="dropdown-menu" v-show="openDropdown === 'data'">
          <button @click="toggleDataCard" :class="{ active: showDataCard }">
            <span class="icon">💳</span> 数据卡片
          </button>
          <button @click="toggleHeatmap" :class="{ active: showHeatmap }">
            <span class="icon">🌡️</span> 热力图
          </button>
          <button @click="toggleRanking" :class="{ active: showRanking }">
            <span class="icon">🏆</span> 排行榜
          </button>
        </div>
      </div>
    </div>

    <!-- 省份数据卡片 -->
    <div 
      v-if="showDataCard && hoveredProvinceData" 
      class="data-card"
      :style="{ left: cardPosition.x + 'px', top: cardPosition.y + 'px' }"
      @mouseenter="onCardMouseEnter"
      @mouseleave="onCardMouseLeave"
    >
      <div class="card-header">
        <h3>{{ hoveredProvinceData.name }}</h3>
        <div class="card-close" @click="hideDataCard">✕</div>
      </div>
      
      <div class="card-body">
        <div class="data-item">
          <span class="data-label">💰 GDP总量</span>
          <span class="data-value">{{ hoveredProvinceData.data.gdp }}</span>
        </div>
        <div class="data-item">
          <span class="data-label">👥 人口</span>
          <span class="data-value">{{ hoveredProvinceData.data.population }}</span>
        </div>
        <div class="data-item">
          <span class="data-label">📊 增长率</span>
          <span class="data-value growth">{{ hoveredProvinceData.data.growth }}</span>
        </div>
        <div class="data-item">
          <span class="data-label">🏭 主导产业</span>
          <span class="data-value">{{ hoveredProvinceData.data.industry }}</span>
        </div>
        <div class="divider-line"></div>
        <div class="data-item">
          <span class="data-label">🌡️ 实时温度</span>
          <span class="data-value">{{ hoveredProvinceData.data.temperature }}</span>
        </div>
        <div class="data-item">
          <span class="data-label">🌫️ 空气质量</span>
          <span class="data-value">{{ hoveredProvinceData.data.aqi }}</span>
        </div>
      </div>
    </div>

    <!-- 排行榜面板 -->
    <div v-if="showRanking" class="ranking-panel">
      <div class="ranking-header">
        <h3>🏆 {{ rankingTitle }}</h3>
        <div class="ranking-tabs">
          <button 
            @click="rankingType = 'gdp'" 
            :class="{ active: rankingType === 'gdp' }"
          >
            GDP
          </button>
          <button 
            @click="rankingType = 'population'" 
            :class="{ active: rankingType === 'population' }"
          >
            人口
          </button>
          <button 
            @click="rankingType = 'growth'" 
            :class="{ active: rankingType === 'growth' }"
          >
            增长率
          </button>
        </div>
        <div class="ranking-close" @click="showRanking = false">✕</div>
      </div>
      <div class="ranking-body">
        <div 
          v-for="(item, index) in rankedList" 
          :key="item.name"
          class="ranking-item"
          :class="{ 
            'top-1': index === 0, 
            'top-2': index === 1, 
            'top-3': index === 2 
          }"
        >
          <div class="rank-number">
            <span v-if="index < 3" class="medal">{{ ['🥇', '🥈', '🥉'][index] }}</span>
            <span v-else class="rank-text">{{ index + 1 }}</span>
          </div>
          <div class="rank-name">{{ item.name }}</div>
          <div class="rank-value">{{ item.value }}</div>
          <div class="rank-bar">
            <div 
              class="rank-bar-fill" 
              :style="{ width: item.percentage + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import gsap from 'gsap'
import { loadChinaGeoJSON, loadProvinceGeoJSON, loadCityGeoJSON } from '../utils/geoLoader'
import { getAdcode } from '../utils/adcodes'
import { createSideMaterial, createBarMaterial, createGroundMaterial, createTerrainMaterial, createGearMaterial } from '../shaders/mapEffects.js'
import { getBarData } from '../data/barData.js'
import { getRegionData } from '../data/provinceData.js'

// 定义 emit 事件
const emit = defineEmits(['enter-city'])

const mapContainer = ref(null)
let scene, camera, renderer, labelRenderer, controls
let raycaster, mouse
let mapGroup, barChartGroup, groundMesh, gridHelper, gearMesh
let currentProvinceGroup = null // 当前下钻的省份组
let currentCityGroup = null // 当前下钻的市组
let hoveredProvince = null // 当前悬停的省份
const animatedUniforms = [] // 存储需要更新时间的 uniforms

// 省份列表和选中状态
const provinceList = ref([])
const cityList = ref([]) // 市/区县列表
const selectedProvince = ref('')
const selectedCity = ref('')
const mapLevel = ref('nation') // nation, province, city

// 特效开关状态
const showBarChart = ref(false)
const showSideEffect = ref(true)
const showGroundEffect = ref(true)
const showGrid = ref(true)
const showGear = ref(true)
const isPanMode = ref(true) // 默认开启平移模式
const showFlightRoutes = ref(false) // 飞机航线开关 - 默认关闭

// 飞机航线相关
let flightRoutesGroup = null
const flightPlanes = [] // 存储所有飞机对象

// 下拉菜单状态
const openDropdown = ref(null)

// 数据展示相关
const showDataCard = ref(true) // 默认开启数据卡片
const showHeatmap = ref(false)
const showRanking = ref(false)
const hoveredProvinceData = ref(null)
const cardPosition = ref({ x: 0, y: 0 })
const isCardHovered = ref(false) // 卡片是否被鼠标悬停
let cardHideTimer = null // 卡片隐藏定时器

// 排行榜相关
const rankingType = ref('gdp') // gdp, population, growth
const rankingTitle = computed(() => {
  const titles = {
    'nation': '全国省份排行',
    'province': '省内城市排行',
    'city': '市内区县排行'
  }
  return titles[mapLevel.value] || '数据排行'
})

// 判断是否为直辖市
const isDirectMunicipality = computed(() => {
  const municipalities = ['北京市', '上海市', '天津市', '重庆市']
  return municipalities.includes(selectedProvince.value)
})

// 计算排行榜数据
const rankedList = computed(() => {
  let regions = []
  
  // 根据当前地图层级获取区域列表
  if (mapLevel.value === 'nation') {
    regions = provinceList.value.map(name => ({
      name,
      data: getRegionData(name, 'province')
    }))
  } else if (mapLevel.value === 'province') {
    regions = cityList.value.map(city => ({
      name: city.name,
      data: getRegionData(city.name, 'city')
    }))
  } else if (mapLevel.value === 'city') {
    // 区县级别，从当前显示的区县中获取
    if (currentCityGroup) {
      const districtNames = []
      currentCityGroup.children.forEach(child => {
        if (child.name && child.type === 'Group') {
          districtNames.push(child.name)
        }
      })
      regions = districtNames.map(name => ({
        name,
        data: getRegionData(name, 'district')
      }))
    }
  }
  
  // 根据排序类型提取数值并排序
  const extractValue = (dataStr) => {
    if (!dataStr) return 0
    // 移除单位和符号，提取数字
    const numStr = dataStr.replace(/[^0-9.]/g, '')
    return parseFloat(numStr) || 0
  }
  
  let sortedRegions = []
  
  if (rankingType.value === 'gdp') {
    sortedRegions = regions.sort((a, b) => {
      const aVal = extractValue(a.data.gdp)
      const bVal = extractValue(b.data.gdp)
      return bVal - aVal
    })
  } else if (rankingType.value === 'population') {
    sortedRegions = regions.sort((a, b) => {
      const aVal = extractValue(a.data.population)
      const bVal = extractValue(b.data.population)
      return bVal - aVal
    })
  } else if (rankingType.value === 'growth') {
    sortedRegions = regions.sort((a, b) => {
      const aVal = extractValue(a.data.growth)
      const bVal = extractValue(b.data.growth)
      return bVal - aVal
    })
  }
  
  // 取前10名
  const top10 = sortedRegions.slice(0, 10)
  
  // 计算百分比（用于进度条）
  const maxValue = top10.length > 0 ? extractValue(
    rankingType.value === 'gdp' ? top10[0].data.gdp :
    rankingType.value === 'population' ? top10[0].data.population :
    top10[0].data.growth
  ) : 1
  
  return top10.map(region => ({
    name: region.name,
    value: rankingType.value === 'gdp' ? region.data.gdp :
           rankingType.value === 'population' ? region.data.population :
           region.data.growth,
    percentage: (extractValue(
      rankingType.value === 'gdp' ? region.data.gdp :
      rankingType.value === 'population' ? region.data.population :
      region.data.growth
    ) / maxValue * 100).toFixed(1)
  }))
})

// 计算激活的特效数量
const activeEffectsCount = computed(() => {
  let count = 0
  if (showBarChart.value) count++
  if (showSideEffect.value) count++
  if (showGroundEffect.value) count++
  if (showGear.value) count++
  return count
})

// 计算激活的导航控制数量
const activeNavCount = computed(() => {
  let count = 0
  if (showFlightRoutes.value) count++
  if (showGrid.value) count++
  return count
})

// 切换下拉菜单
const toggleDropdown = (dropdown) => {
  if (openDropdown.value === dropdown) {
    openDropdown.value = null
  } else {
    openDropdown.value = dropdown
  }
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const dropdowns = document.querySelectorAll('.dropdown')
  let clickedInside = false
  
  dropdowns.forEach(dropdown => {
    if (dropdown.contains(event.target)) {
      clickedInside = true
    }
  })
  
  if (!clickedInside) {
    openDropdown.value = null
  }
}

// 切换数据卡片
const toggleDataCard = () => {
  showDataCard.value = !showDataCard.value
  if (!showDataCard.value) {
    hoveredProvinceData.value = null
  }
}

// 切换热力图
const toggleHeatmap = () => {
  showHeatmap.value = !showHeatmap.value
  // TODO: 实现热力图功能
}

// 切换排行榜
const toggleRanking = () => {
  showRanking.value = !showRanking.value
}


// 隐藏数据卡片
const hideDataCard = () => {
  hoveredProvinceData.value = null
  isCardHovered.value = false
  if (cardHideTimer) {
    clearTimeout(cardHideTimer)
    cardHideTimer = null
  }
}

// 卡片鼠标进入
const onCardMouseEnter = () => {
  isCardHovered.value = true
  if (cardHideTimer) {
    clearTimeout(cardHideTimer)
    cardHideTimer = null
  }
}

// 卡片鼠标离开
const onCardMouseLeave = () => {
  isCardHovered.value = false
  // 延迟隐藏，给用户时间移回地图
  cardHideTimer = setTimeout(() => {
    if (!isCardHovered.value) {
      hoveredProvinceData.value = null
    }
  }, 300)
}

// 进入城市孪生
const enterCityTwin = (cityName) => {
  console.log('进入城市孪生:', cityName)
  emit('enter-city', cityName)
}

// 从顶部按钮进入城市孪生（使用当前选中的城市）
const enterCityTwinFromTop = () => {
  if (selectedCity.value) {
    // 使用当前选中的市
    enterCityTwin(selectedCity.value)
  } else if (selectedProvince.value) {
    // 如果是直辖市，使用省份名称
    enterCityTwin(selectedProvince.value)
  }
}

// 检查WebGL支持 - 增强版诊断（绕过扩展干扰）
const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas')
    
    // 尝试多种WebGL上下文选项，绕过扩展拦截
    const contextOptions = [
      { alpha: false, antialias: true, preserveDrawingBuffer: false },
      { alpha: false, antialias: false },
      { failIfMajorPerformanceCaveat: false },
      {} // 空配置
    ]
    
    let gl = null
    
    // 尝试webgl2
    for (const options of contextOptions) {
      gl = canvas.getContext('webgl2', options)
      if (gl) {
        console.log('✅ WebGL2可用，使用配置:', options)
        break
      }
    }
    
    // 如果webgl2失败，尝试webgl
    if (!gl) {
      for (const options of contextOptions) {
        gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options)
        if (gl) {
          console.log('✅ WebGL可用，使用配置:', options)
          break
        }
      }
    }
    
    if (!gl) {
      console.error('❌ WebGL上下文创建失败')
      console.log('浏览器信息:', navigator.userAgent)
      console.log('可用的canvas上下文:', canvas.getContext ? '是' : '否')
      
      // 检查是否是扩展干扰
      console.warn('⚠️ 提示：如果你安装了Vue DevTools或其他开发工具扩展，它们可能会干扰WebGL')
      console.warn('⚠️ 请尝试：1) 禁用浏览器扩展 2) 使用无痕模式 3) 刷新页面')
      
      return false
    }
    
    // 获取WebGL信息
    console.log('WebGL版本:', gl.getParameter(gl.VERSION))
    console.log('WebGL供应商:', gl.getParameter(gl.VENDOR))
    console.log('WebGL渲染器:', gl.getParameter(gl.RENDERER))
    console.log('最大纹理尺寸:', gl.getParameter(gl.MAX_TEXTURE_SIZE))
    
    return true
  } catch (e) {
    console.error('WebGL检查异常:', e)
    console.error('错误堆栈:', e.stack)
    return false
  }
}

// 初始化 Three.js
const initThree = () => {
  if (!mapContainer.value) {
    console.error('Map container not found!')
    return
  }
  
  // 检查WebGL支持
  if (!checkWebGLSupport()) {
    console.error('WebGL不被支持')
    console.log('🔍 诊断信息：')
    console.log('- 浏览器:', navigator.userAgent)
    console.log('- 平台:', navigator.platform)
    console.log('- 在线状态:', navigator.onLine)
    
    // 尝试获取更多WebGL错误信息
    const testCanvas = document.createElement('canvas')
    const testGl = testCanvas.getContext('webgl', { failIfMajorPerformanceCaveat: false })
    console.log('- WebGL上下文:', testGl ? '可创建' : '无法创建')
    
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(20, 20, 20, 0.95);
      color: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      z-index: 9999;
      max-width: 500px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      border: 2px solid #ff4444;
    `
    errorDiv.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #ff6666;">⚠️ WebGL不可用</h3>
      <p style="margin: 10px 0; line-height: 1.6;">您的浏览器无法启用WebGL，这可能是由于以下原因：</p>
      
      <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
        <p style="margin: 5px 0; font-size: 14px;"><strong>快速解决方案：</strong></p>
        <ol style="margin: 10px 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
          <li>打开 <code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px;">chrome://settings/system</code></li>
          <li>开启"使用硬件加速模式"</li>
          <li>重启浏览器</li>
        </ol>
      </div>
      
      <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
        <p style="margin: 5px 0; font-size: 14px;"><strong>其他可能的解决方法：</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
          <li>访问 <code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px;">chrome://gpu</code> 查看GPU状态</li>
          <li>更新显卡驱动程序</li>
          <li>更新Chrome到最新版本</li>
          <li>检查是否在虚拟机中运行</li>
        </ul>
      </div>
      
      <p style="margin-top: 15px; font-size: 12px; color: #aaa;">
        测试WebGL: <a href="https://get.webgl.org/" target="_blank" style="color: #66ccff;">https://get.webgl.org/</a>
      </p>
      
      <button onclick="window.location.reload()" style="
        margin-top: 15px;
        padding: 10px 20px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      ">重新加载页面</button>
    `
    mapContainer.value.appendChild(errorDiv)
    return
  }
  
  const width = mapContainer.value.clientWidth
  const height = mapContainer.value.clientHeight
  console.log(`Map container size: ${width}x${height}`)

  // 初始化 Raycaster 和 Mouse
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  if (width === 0 || height === 0) {
    console.warn('Map container has 0 width or height!')
  }

  // 场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020912) // 恢复深色背景
  // 添加雾效，实现远处虚化 (颜色与背景一致)
  // Start: 200, End: 500
  scene.fog = new THREE.Fog(0x020912, 200, 500)

  // 相机
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000)
  camera.position.set(0, 40, 40) // 调整为适合俯视的距离
  camera.lookAt(0, 0, 0)

  // 渲染器 - 添加错误处理和多种配置尝试（绕过扩展干扰）
  const rendererConfigs = [
    // 配置1: 标准配置
    { 
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
      preserveDrawingBuffer: false
    },
    // 配置2: 基础配置
    { 
      antialias: false,
      alpha: false,
      failIfMajorPerformanceCaveat: false
    },
    // 配置3: 最小配置
    {
      failIfMajorPerformanceCaveat: false
    },
    // 配置4: 空配置
    {}
  ]
  
  let rendererCreated = false
  
  for (let i = 0; i < rendererConfigs.length; i++) {
    try {
      console.log(`尝试创建渲染器，配置 ${i + 1}:`, rendererConfigs[i])
      renderer = new THREE.WebGLRenderer(rendererConfigs[i])
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      console.log(`✅ 渲染器创建成功，使用配置 ${i + 1}`)
      rendererCreated = true
      break
    } catch (error) {
      console.warn(`配置 ${i + 1} 失败:`, error.message)
      if (i === rendererConfigs.length - 1) {
        console.error('❌ 所有渲染器配置都失败了')
        console.error('最后的错误:', error)
        console.error('错误堆栈:', error.stack)
        
        // 显示错误信息给用户
        const errorDiv = document.createElement('div')
        errorDiv.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(20, 20, 20, 0.95);
          color: white;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          z-index: 9999;
          max-width: 500px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          border: 2px solid #ff4444;
        `
        errorDiv.innerHTML = `
          <h3 style="margin: 0 0 15px 0; color: #ff6666;">⚠️ 渲染器创建失败</h3>
          <p style="margin: 10px 0; line-height: 1.6;">可能是浏览器扩展干扰了WebGL</p>
          
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
            <p style="margin: 5px 0; font-size: 14px;"><strong>🔧 快速解决：</strong></p>
            <ol style="margin: 10px 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
              <li><strong>禁用浏览器扩展</strong>（特别是Vue DevTools）</li>
              <li>或使用<strong>无痕模式</strong>（Cmd+Shift+N）</li>
              <li>刷新页面</li>
            </ol>
          </div>
          
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
            <p style="margin: 5px 0; font-size: 14px;"><strong>其他方法：</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
              <li>打开 <code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px;">chrome://settings/system</code> 开启硬件加速</li>
              <li>访问 <code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px;">chrome://gpu</code> 检查GPU状态</li>
              <li>更新Chrome和显卡驱动</li>
            </ul>
          </div>
          
          <p style="margin-top: 10px; font-size: 12px; color: #ff9999;">
            错误详情: ${error.message}
          </p>
          
          <button onclick="window.location.reload()" style="
            margin-top: 15px;
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          ">重新加载页面</button>
        `
        mapContainer.value.appendChild(errorDiv)
        return
      }
    }
  }
  
  if (!rendererCreated) {
    console.error('渲染器创建失败，无法继续')
    return
  } 
  mapContainer.value.appendChild(renderer.domElement)

  // 标签渲染器
  labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(width, height)
  labelRenderer.domElement.className = 'css2d-container'
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none' // 允许点击穿透
  labelRenderer.domElement.style.zIndex = '10' // 提高 z-index 确保在最上层
  labelRenderer.domElement.style.width = '100%'
  labelRenderer.domElement.style.height = '100%'
  labelRenderer.domElement.style.overflow = 'visible'
  mapContainer.value.appendChild(labelRenderer.domElement)
  
  console.log('labelRenderer 已创建:', labelRenderer.domElement)
  console.log('labelRenderer 容器尺寸:', width, height)
  
  // 添加调试信息：检查 labelRenderer 是否正确渲染
  setTimeout(() => {
    console.log('labelRenderer 子元素数量:', labelRenderer.domElement.children.length)
    if (labelRenderer.domElement.children.length > 0) {
      console.log('第一个子元素:', labelRenderer.domElement.children[0])
      // 查找飞机图标元素
      const planeIcons = labelRenderer.domElement.querySelectorAll('.plane-icon')
      console.log('找到飞机图标数量:', planeIcons.length)
      if (planeIcons.length > 0) {
        console.log('第一个飞机图标:', planeIcons[0])
        console.log('飞机图标的父元素 style:', planeIcons[0].parentElement?.style.cssText)
      }
    }
  }, 2000)

  // 控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  // 设置缩放极限
  controls.minDistance = 10
  controls.maxDistance = 300
  // 限制垂直旋转角度，禁止看到底部 (最大角度设为 90 度或略小)
  controls.maxPolarAngle = Math.PI / 2.5
  
  // 修改鼠标操作习惯：左键平移，右键旋转 (更符合地图浏览习惯)
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE
  }
  
  controls.touches = {
    ONE: THREE.TOUCH.PAN,
    TWO: THREE.TOUCH.DOLLY_ROTATE
  }

  // 灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
  directionalLight.position.set(10, 50, 50)
  scene.add(directionalLight)

  // 辅助坐标轴
  // const axesHelper = new THREE.AxesHelper(50)
  // scene.add(axesHelper)
}

// 生成随机但固定的颜色（基于名称）
const getColor = (name) => {
  const colors = [
    0x00aaff, 0x0088ff, 0x0066ff, 0x0044ff, 
    0x00ccff, 0x00eeff, 0x22ffff, 0x44ffff,
    0x0055aa, 0x0077cc
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash % colors.length)
  return colors[index]
}

// 通用地图渲染函数
const renderMapData = (geoData, targetGroup, level = 'province') => {
  geoData.features.forEach(feature => {
    const name = feature.properties.name
    const adcode = feature.properties.adcode
    const geometry = feature.geometry
    const coordinates = geometry.coordinates

    // 统一将 Polygon 和 MultiPolygon 处理为多边形数组
    let polygons = []
    if (geometry.type === 'Polygon') {
      polygons = [coordinates]
    } else if (geometry.type === 'MultiPolygon') {
      polygons = coordinates
    }

    const regionGroup = new THREE.Group()
    regionGroup.name = name
    if (adcode) {
      regionGroup.userData.adcode = adcode
    }

    const regionColor = getColor(name)

    polygons.forEach(polygon => {
      const shape = new THREE.Shape()
      const points = polygon[0]
      
      points.forEach((point, i) => {
        // 统一投影转换
        const x = (point[0] - 104) * 1.5
        const y = (point[1] - 36) * 1.5
        
        if (i === 0) shape.moveTo(x, y)
        else shape.lineTo(x, y)
      })

      // 根据层级决定厚度
      const depth = level === 'district' ? 1.5 : 3
      
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: depth, // 板块厚度
        bevelEnabled: false
      })

      // 使用地形材质作为顶部材质
      const topMaterial = createTerrainMaterial()
      
      const sideMaterial = createSideMaterial(regionColor)
      animatedUniforms.push(sideMaterial.uniforms)

      const mesh = new THREE.Mesh(geometry, [topMaterial, sideMaterial])
      
      // 旋转使其躺平
      mesh.rotation.x = -Math.PI / 2
      
      regionGroup.add(mesh)
      
      // 绘制轮廓线
      const lineGeometry = new THREE.BufferGeometry()
      const linePoints = []
      points.forEach(point => {
        const x = (point[0] - 104) * 1.5
        const y = (point[1] - 36) * 1.5
        linePoints.push(new THREE.Vector3(x, y, depth + 0.01)) // 稍微高一点
      })
      lineGeometry.setFromPoints(linePoints)
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })
      const line = new THREE.Line(lineGeometry, lineMaterial)
      line.rotation.x = -Math.PI / 2
      regionGroup.add(line)
    })

    targetGroup.add(regionGroup)

    // 添加标签
    const box = new THREE.Box3().setFromObject(regionGroup)
    const center = new THREE.Vector3()
    box.getCenter(center)
    
    // 保存中心点供柱状图使用
    regionGroup.userData.center = center.clone()
    
    const labelDiv = document.createElement('div')
    // 根据层级添加不同的 class，方便 DOM 操作
    let labelClass = 'province-label'
    if (level === 'province') labelClass += ' global-label'
    else if (level === 'city') labelClass += ' city-label'
    else if (level === 'district') labelClass += ' district-label'
    
    labelDiv.className = labelClass
    labelDiv.textContent = name
    labelDiv.style.color = '#ffffff'
    labelDiv.style.fontSize = '12px'
    labelDiv.style.textShadow = '0 0 5px #000000'
    labelDiv.style.pointerEvents = 'none'
    
    const label = new CSS2DObject(labelDiv)
    // 标签高度需根据板块厚度调整，紧贴表面
    // district: depth 1.5 -> label height 1.55
    // others: depth 3.0 -> label height 3.05
    const labelHeight = level === 'district' ? 1.55 : 3.05
    label.position.set(center.x, labelHeight, center.z) 
    
    targetGroup.add(label)
  })
}

// 创建地图
const createMap = async () => {
  console.log('开始加载地图数据...')
  const geoData = await loadChinaGeoJSON()
  if (!geoData) {
    console.error('地图数据加载失败')
    return
  }
  
  // 收集省份列表
  provinceList.value = geoData.features.map(f => f.properties.name)
  
  mapGroup = new THREE.Group()
  renderMapData(geoData, mapGroup, 'province')
  
  // 调整位置使地图居中
  const box = new THREE.Box3().setFromObject(mapGroup)
  const center = box.getCenter(new THREE.Vector3())
  mapGroup.position.x = -center.x
  mapGroup.position.z = -center.z
  
  scene.add(mapGroup)
  
  // 添加辅助网格帮助定位
  gridHelper = new THREE.Group()
  
  // 1. 网格线
  const grid = new THREE.GridHelper(1000, 100, 0x34d4ff, 0x34d4ff)
  grid.material.transparent = true
  grid.material.opacity = 0.3
  gridHelper.add(grid)
  
  // 2. 网格填充背景
  const planeGeometry = new THREE.PlaneGeometry(1000, 1000)
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0x34d4ff,
    transparent: true,
    opacity: 0.05, // 淡淡的填充色
    side: THREE.DoubleSide,
    depthWrite: false // 防止遮挡
  })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -Math.PI / 2
  gridHelper.add(plane)
  
  gridHelper.position.y = -0.5 // 网格放在地图下方
  
  // 默认根据 showGrid 状态显示
  gridHelper.visible = showGrid.value
  
  scene.add(gridHelper)

  // 创建特效
  renderBarCharts(mapGroup)
  createGroundEffect()
  createGearEffect()
  createFlightRoutes()
}

// 鼠标移动事件
const onMouseMove = (event) => {
  let targetGroup = mapGroup
  if (mapLevel.value === 'province') targetGroup = currentProvinceGroup
  else if (mapLevel.value === 'city') targetGroup = currentCityGroup
  
  if (!targetGroup) return

  const rect = mapContainer.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  // 递归检测 targetGroup 下的所有物体
  const intersects = raycaster.intersectObjects(targetGroup.children, true)

  if (intersects.length > 0) {
    const intersect = intersects.find(item => item.object.type === 'Mesh')
    if (intersect) {
      const object = intersect.object.parent 
      
      if (hoveredProvince !== object) {
        if (hoveredProvince) {
          gsap.to(hoveredProvince.position, {
            y: 0,
            duration: 0.5,
            ease: 'power2.out'
          })
        }
        
        hoveredProvince = object
        // 悬停效果
        // 根据层级决定抬起高度
        const hoverHeight = mapLevel.value === 'city' ? 0.4 : 1.8
        gsap.to(hoveredProvince.position, {
          y: hoverHeight, 
          duration: 0.5,
          ease: 'power2.out'
        })
        
        // 显示数据卡片（所有层级都支持）
        if (showDataCard.value) {
          const regionName = object.name
          // 根据当前地图层级获取对应的数据
          let level = 'province'
          if (mapLevel.value === 'province') {
            level = 'city'
          } else if (mapLevel.value === 'city') {
            level = 'district'
          }
          
          const data = getRegionData(regionName, level)
          hoveredProvinceData.value = {
            name: regionName,
            data: data
          }
          
          // 计算卡片位置（鼠标右侧偏移）
          cardPosition.value = {
            x: event.clientX + 20,
            y: event.clientY - 100
          }
        }
      }
    }
  } else {
    if (hoveredProvince) {
      gsap.to(hoveredProvince.position, {
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
      })
      hoveredProvince = null
      
      // 延迟隐藏数据卡片，给用户时间移动到卡片上
      if (showDataCard.value && !isCardHovered.value) {
        cardHideTimer = setTimeout(() => {
          if (!isCardHovered.value) {
            hoveredProvinceData.value = null
          }
        }, 200)
      }
    }
  }
}

// 地图点击事件
const onMapClick = (event) => {
  let targetGroup = mapGroup
  if (mapLevel.value === 'province') targetGroup = currentProvinceGroup
  else if (mapLevel.value === 'city') targetGroup = currentCityGroup
  
  if (!targetGroup) return

  const rect = mapContainer.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(targetGroup.children, true)
  
  if (intersects.length > 0) {
    const intersect = intersects.find(item => item.object.type === 'Mesh')
    if (intersect) {
      const object = intersect.object.parent
      const name = object.name
      
      if (mapLevel.value === 'nation') {
        // 全国地图：点击省份进入省级地图
        if (provinceList.value.includes(name)) {
          selectedProvince.value = name
          onProvinceChange()
        }
      } else if (mapLevel.value === 'province') {
        // 省级地图：点击市进入市级地图
        selectedCity.value = name
        onCityChange()
      } else if (mapLevel.value === 'city') {
        // 市级地图：点击区县（暂时不做处理）
        console.log('点击区县:', name)
      }
    }
  }
}

// 省份切换处理
const onProvinceChange = async () => {
  if (!selectedProvince.value) return
  
  const adcode = getAdcode(selectedProvince.value)
  if (!adcode) {
    console.error('未找到Adcode:', selectedProvince.value)
    return
  }
  
  console.log(`切换省份: ${selectedProvince.value}, adcode: ${adcode}`)
  
  try {
    const provinceData = await loadProvinceGeoJSON(adcode)
    if (!provinceData) throw new Error('Province GeoJSON load failed')
    
    // 更新 mapLevel
    mapLevel.value = 'province'
    
    // 填充市列表
    cityList.value = provinceData.features.map(f => ({
      name: f.properties.name,
      adcode: f.properties.adcode
    }))
    selectedCity.value = ''
    
    // 隐藏全国地图
    if (mapGroup) {
      mapGroup.visible = false
      document.querySelectorAll('.global-label').forEach(el => {
        el.style.visibility = 'hidden'
      })
      // 隐藏全国柱状图标签
      document.querySelectorAll('.global-bar-label').forEach(el => {
        el.style.visibility = 'hidden'
      })
    }
    
    // 如果已有下钻组，移除
    if (currentProvinceGroup) {
      clearGroup(currentProvinceGroup)
      scene.remove(currentProvinceGroup)
      currentProvinceGroup = null
    }
    
    // 如果有市级组，也移除
    if (currentCityGroup) {
      clearGroup(currentCityGroup)
      scene.remove(currentCityGroup)
      currentCityGroup = null
    }
    
    // 创建新的省份组
    currentProvinceGroup = new THREE.Group()
    renderMapData(provinceData, currentProvinceGroup, 'city')
    
    // 缩放和定位逻辑（复用之前的逻辑，或者根据市的数量调整）
    const rawBox = new THREE.Box3().setFromObject(currentProvinceGroup)
    const rawSize = rawBox.getSize(new THREE.Vector3())
    const rawMaxDim = Math.max(rawSize.x, rawSize.z)
    
    const cityCount = provinceData.features.length
    const targetSize = Math.min(10 + cityCount * 3, 90)
    const scaleFactor = targetSize / rawMaxDim
    
    currentProvinceGroup.scale.set(scaleFactor, scaleFactor, scaleFactor)
    
    const box = new THREE.Box3().setFromObject(currentProvinceGroup)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    currentProvinceGroup.position.set(-center.x, -center.y, -center.z)
    scene.add(currentProvinceGroup)
    
    // 渲染柱状图
    renderBarCharts(currentProvinceGroup)
    
    const maxDim = Math.max(size.x, size.z)
    const distance = maxDim * 0.8 
    
    gsap.to(controls.target, {
      x: 0, y: 0, z: 0,
      duration: 1.5
    })
    
    gsap.to(camera.position, { 
      x: 0,
      y: distance + 2,
      z: distance + 2, 
      duration: 1.5,
      onUpdate: () => controls.update() 
    })
    
  } catch (e) {
    console.error('加载省份数据失败', e)
  }
}

// 市级切换处理
const onCityChange = async () => {
  if (!selectedCity.value) return
  
  const city = cityList.value.find(c => c.name === selectedCity.value)
  if (!city || !city.adcode) {
    console.error('未找到市级Adcode', selectedCity.value)
    return
  }
  
  console.log(`切换市: ${city.name}, adcode: ${city.adcode}`)
  
  try {
    const cityData = await loadCityGeoJSON(city.adcode)
    if (!cityData) throw new Error('City GeoJSON load failed')
    
    mapLevel.value = 'city'
    
    // 隐藏省份地图
    if (currentProvinceGroup) {
      currentProvinceGroup.visible = false
      document.querySelectorAll('.city-label').forEach(el => {
        el.style.visibility = 'hidden'
      })
      // 隐藏市级柱状图标签
      document.querySelectorAll('.city-bar-label').forEach(el => {
        el.style.visibility = 'hidden'
      })
    }
    
    // 清理旧的市级组
    if (currentCityGroup) {
      clearGroup(currentCityGroup)
      scene.remove(currentCityGroup)
      currentCityGroup = null
    }
    
    currentCityGroup = new THREE.Group()
    renderMapData(cityData, currentCityGroup, 'district')
    
    // 缩放和定位逻辑（复用之前的逻辑，或者根据区县数量调整）
    const rawBox = new THREE.Box3().setFromObject(currentCityGroup)
    const rawSize = rawBox.getSize(new THREE.Vector3())
    const rawMaxDim = Math.max(rawSize.x, rawSize.z)
    
    // 区县一般较少，可以给大一点的展示空间
    const districtCount = cityData.features.length
    // 根据用户需求：数量多需要缩小，数量少需要放大
    const targetSize = Math.max(40, 90 - districtCount * 2)
    const scaleFactor = targetSize / rawMaxDim
    
    currentCityGroup.scale.set(scaleFactor, scaleFactor, scaleFactor)
    
    const box = new THREE.Box3().setFromObject(currentCityGroup)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    currentCityGroup.position.set(-center.x, -center.y, -center.z)
    scene.add(currentCityGroup)
    
    // 渲染柱状图
    renderBarCharts(currentCityGroup)
    
    const maxDim = Math.max(size.x, size.z)
    const distance = maxDim * 0.8
    
    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.5 })
    gsap.to(camera.position, { 
      x: 0, y: distance + 2, z: distance + 2, 
      duration: 1.5,
      onUpdate: () => controls.update() 
    })
    
  } catch (e) {
    console.error('加载市级数据失败', e)
  }
}

// 辅助函数：清理 Group 资源
const clearGroup = (group) => {
  group.traverse(child => {
    if (child.isMesh) {
      if (child.geometry) child.geometry.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose())
      } else if (child.material) {
        child.material.dispose()
      }
    }
    // 移除 CSS2DObject 的 DOM
    if (child.isCSS2DObject && child.element.parentNode) {
      child.element.parentNode.removeChild(child.element)
    }
  })
}

// 重置视角
const resetView = () => {
  selectedProvince.value = ''
  selectedCity.value = ''
  cityList.value = []
  mapLevel.value = 'nation'
  
  // 移除下钻组
  if (currentProvinceGroup) {
    clearGroup(currentProvinceGroup)
    scene.remove(currentProvinceGroup)
    currentProvinceGroup = null
  }
  
  if (currentCityGroup) {
    clearGroup(currentCityGroup)
    scene.remove(currentCityGroup)
    currentCityGroup = null
  }
  
  // 显示全国地图
  if (mapGroup) {
    mapGroup.visible = true
    // 恢复全国地图标签
    document.querySelectorAll('.global-label').forEach(el => {
      el.style.visibility = 'visible'
    })
    // 恢复全国柱状图标签
    document.querySelectorAll('.global-bar-label').forEach(el => {
      el.style.visibility = 'visible'
    })
    // 重新显示 barCharts
    const bars = mapGroup.children.find(c => c.name === 'barCharts')
    if (bars) bars.visible = showBarChart.value
  }
  
  // 恢复视角
  gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.5 })
  gsap.to(camera.position, { x: 0, y: 40, z: 40, duration: 1.5, onUpdate: () => controls.update() })
}

// 切换柱状图显示
const toggleBarChart = () => {
  showBarChart.value = !showBarChart.value
  
  let targetGroup = mapGroup
  if (mapLevel.value === 'province') targetGroup = currentProvinceGroup
  else if (mapLevel.value === 'city') targetGroup = currentCityGroup
  
  if (targetGroup) {
    const bars = targetGroup.children.find(c => c.name === 'barCharts')
    if (bars) {
      bars.visible = showBarChart.value
      bars.traverse(child => {
        if (child.isCSS2DObject) {
           child.visible = showBarChart.value
           child.element.style.display = showBarChart.value ? 'block' : 'none'
        }
      })
    }
  }
}

// 切换侧边特效
const toggleSideEffect = () => {
  showSideEffect.value = !showSideEffect.value
  const value = showSideEffect.value ? 1.0 : 0.0
  // 更新所有侧边材质的 uniform
  animatedUniforms.forEach(uniforms => {
    if (uniforms.uEffectEnabled) {
      uniforms.uEffectEnabled.value = value
    }
  })
}

// 切换地面特效
const toggleGroundEffect = () => {
  showGroundEffect.value = !showGroundEffect.value
  if (groundMesh) {
    groundMesh.visible = showGroundEffect.value
  }
}

// 切换光圈特效
const toggleGearEffect = () => {
  showGear.value = !showGear.value
  if (gearMesh) {
    gearMesh.visible = showGear.value
  }
}

// 切换网格
const toggleGrid = () => {
  showGrid.value = !showGrid.value
  if (gridHelper) {
    gridHelper.visible = showGrid.value
  }
}

// 切换拖动/旋转模式
const togglePanMode = () => {
  isPanMode.value = !isPanMode.value
  
  if (isPanMode.value) {
    // 平移模式：左键平移，右键旋转
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    }
    controls.touches = {
      ONE: THREE.TOUCH.PAN,
      TWO: THREE.TOUCH.DOLLY_ROTATE
    }
  } else {
    // 旋转模式：左键旋转，右键平移
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    }
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    }
  }
}

// 渲染柱状图
const renderBarCharts = (targetGroup) => {
  // 如果已经存在 barCharts 组，先移除
  const existing = targetGroup.children.find(c => c.name === 'barCharts')
  if (existing) {
    clearGroup(existing)
    targetGroup.remove(existing)
  }

  const barsGroup = new THREE.Group()
  barsGroup.name = 'barCharts'
  barChartGroup = barsGroup // 更新全局引用

  targetGroup.children.forEach(child => {
    if (child.userData && child.userData.center) {
      const name = child.name
      const center = child.userData.center
      const data = getBarData(name)
      
      // 根据层级调整高度比例
      // district: value / 40 (矮一点)
      // others: value / 15
      const heightScale = mapLevel.value === 'city' ? 40 : 15
      const height = data.value / heightScale
      
      // 根据层级调整粗细
      // nation(显示省): 2
      // province(显示市): 1
      // city(显示区): 0.5
      let barSize = 2
      if (mapLevel.value === 'province') barSize = 0.5
      else if (mapLevel.value === 'city') barSize = 0.1
      
      // 改为圆柱体
      const radius = barSize / 2
      const geometry = new THREE.CylinderGeometry(radius, radius, height, 16)
      geometry.translate(0, height / 2, 0)
      
      const material = createBarMaterial(data.color)
      animatedUniforms.push(material.uniforms)
      
      const mesh = new THREE.Mesh(geometry, material)
      
      // 高度调整：区县 1.5，其他 3.0
      const yPos = mapLevel.value === 'city' ? 1.5 : 3.0
      mesh.position.set(center.x, yPos, center.z)
      
      barsGroup.add(mesh)
      
      // Label
      const labelDiv = document.createElement('div')
      let labelClass = 'bar-label'
      // 根据层级添加特定 class
      if (mapLevel.value === 'nation') labelClass += ' global-bar-label'
      else if (mapLevel.value === 'province') labelClass += ' city-bar-label'
      else if (mapLevel.value === 'city') labelClass += ' district-bar-label'
      
      labelDiv.className = labelClass
      labelDiv.textContent = `${data.value}`
      labelDiv.style.color = '#fff'
      labelDiv.style.fontSize = '10px'
      labelDiv.style.background = 'rgba(0,0,0,0.5)'
      labelDiv.style.padding = '2px 4px'
      labelDiv.style.borderRadius = '2px'
      
      const label = new CSS2DObject(labelDiv)
      // 根据层级调整标签偏移
      const labelOffset = mapLevel.value === 'city' ? 0.1 : 0.5
      label.position.set(0, height + labelOffset, 0)
       if (!showBarChart.value) {
        labelDiv.style.display = 'none'
        label.visible = false
      }
      mesh.add(label)
    }
  })
  
  barsGroup.visible = showBarChart.value
  targetGroup.add(barsGroup)
}

// 创建地面粒子扩散特效
const createGroundEffect = () => {
  // 创建一个平面，使用 Shader 模拟扩散波纹
  const geometry = new THREE.PlaneGeometry(100, 100)
  
  const material = createGroundMaterial()
  
  animatedUniforms.push(material.uniforms)
  
  groundMesh = new THREE.Mesh(geometry, material)
  groundMesh.rotation.x = -Math.PI / 2
  groundMesh.position.y = -0.6 // 在网格下方
  scene.add(groundMesh)
}

// 创建光圈特效
const createGearEffect = () => {
  const geometry = new THREE.PlaneGeometry(150, 150)
  const material = createGearMaterial(0x00ffff) // 青色
  
  animatedUniforms.push(material.uniforms)
  
  gearMesh = new THREE.Mesh(geometry, material)
  gearMesh.rotation.x = -Math.PI / 2
  gearMesh.position.y = -0.45 // 在网格上方，地图下方
  gearMesh.visible = showGear.value
  
  scene.add(gearMesh)
}

// 创建飞机航线
const createFlightRoutes = () => {
  flightRoutesGroup = new THREE.Group()
  flightRoutesGroup.name = 'flightRoutes'
  
  // 直接从地图中获取省份的中心坐标（已经转换好的场景坐标）
  const getCityCoords = (provinceName) => {
    if (!mapGroup) return null
    
    // 查找省份组
    const provinceGroup = mapGroup.children.find(child => child.name === provinceName)
    if (!provinceGroup || !provinceGroup.userData.center) return null
    
    const center = provinceGroup.userData.center
    return { x: center.x, z: center.z }
  }
  
  // 定义航线（起点 -> 终点）- 选择多条不同方向的航线
  const routes = [
    { from: '北京市', to: '湖南省', color: 0x00ffff },      // 北到南
    { from: '江苏省', to: '陕西省', color: 0xff6b35 },      // 东到西
    { from: '黑龙江省', to: '广东省', color: 0x00ff88 },    // 东北到南
    { from: '上海市', to: '四川省', color: 0xffaa00 },      // 东到西南
    { from: '辽宁省', to: '云南省', color: 0xff00ff },      // 东北到西南
    { from: '山东省', to: '重庆市', color: 0x00aaff }       // 东到西
  ]
  
  routes.forEach((route, index) => {
    const from = getCityCoords(route.from)
    const to = getCityCoords(route.to)
    
    if (!from || !to) return
    
    // 创建航线路径（使用贝塞尔曲线模拟飞行弧线）
    const start = new THREE.Vector3(from.x, 5, from.z)
    const end = new THREE.Vector3(to.x, 5, to.z)
    
    // 计算中间控制点（向上抬高，形成弧线）
    const midPoint = new THREE.Vector3(
      (start.x + end.x) / 2,
      15 + Math.random() * 5, // 随机高度
      (start.z + end.z) / 2
    )
    
    // 创建二次贝塞尔曲线
    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end)
    
    // 绘制航线
    const points = curve.getPoints(50)
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
    
    // 创建渐变材质的航线
    const lineMaterial = new THREE.LineBasicMaterial({
      color: route.color,
      transparent: true,
      opacity: 0.6,
      linewidth: 2
    })
    
    const line = new THREE.Line(lineGeometry, lineMaterial)
    flightRoutesGroup.add(line)
    
    // 创建流动光效（使用粒子）
    createFlowingParticles(curve, route.color)
    
    // 创建飞机模型
    const plane = createPlane(route.color)
    plane.userData.curve = curve
    plane.userData.progress = Math.random() // 随机起始位置
    plane.userData.speed = 0.0003 + Math.random() * 0.0002 // 随机速度
    flightPlanes.push(plane)
    flightRoutesGroup.add(plane)
    
    console.log(`创建飞机: ${route.from} -> ${route.to}, 颜色: ${route.color.toString(16)}`)
  })
  
  flightRoutesGroup.visible = showFlightRoutes.value
  scene.add(flightRoutesGroup)
}

// 创建飞机图标（使用 Canvas 绘制箭头形状）
const createPlane = (color) => {
  const planeGroup = new THREE.Group()
  
  // 转换颜色为 CSS 格式
  const colorHex = '#' + color.toString(16).padStart(6, '0')
  
  console.log('创建飞机图标, 颜色:', colorHex)
  
  // 创建 Canvas 来绘制飞机图标
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  
  // 保存引用用于旋转
  planeGroup.userData.canvas = canvas
  planeGroup.userData.ctx = ctx
  planeGroup.userData.colorHex = colorHex
  
  // 初始绘制（朝上）
  drawPlaneIcon(ctx, colorHex, 0)
  
  // 创建纹理
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  
  // 创建 Sprite 材质
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 1,
    depthTest: false,
    depthWrite: false
  })
  
  // 创建 Sprite
  const sprite = new THREE.Sprite(spriteMaterial)
  sprite.scale.set(3, 3, 1)
  planeGroup.add(sprite)
  
  planeGroup.userData.sprite = sprite
  planeGroup.userData.texture = texture
  
  console.log('飞机图标创建完成, Sprite:', sprite)
  
  // 添加光晕效果
  const glowGeometry = new THREE.SphereGeometry(0.6, 16, 16)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  planeGroup.add(glow)
  
  return planeGroup
}

// 绘制飞机图标的辅助函数
const drawPlaneIcon = (ctx, colorHex, rotationRad) => {
  // 清空 canvas
  ctx.clearRect(0, 0, 128, 128)
  
  // 绘制光晕背景
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, colorHex + '66')
  gradient.addColorStop(0.5, colorHex + '33')
  gradient.addColorStop(1, 'transparent')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  
  // 保存上下文
  ctx.save()
  
  // 移动到中心并旋转
  ctx.translate(64, 64)
  ctx.rotate(rotationRad)
  
  // 绘制三角形箭头（指向右侧，即0度方向）
  ctx.beginPath()
  ctx.moveTo(40, 0)      // 箭头尖端（右）
  ctx.lineTo(-20, -20)   // 左上角
  ctx.lineTo(-20, 20)    // 左下角
  ctx.closePath()
  
  // 填充白色
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  
  // 描边
  ctx.strokeStyle = colorHex
  ctx.lineWidth = 3
  ctx.stroke()
  
  // 恢复上下文
  ctx.restore()
}

// 创建流动粒子效果
const createFlowingParticles = (curve, color) => {
  const particleCount = 20
  const points = curve.getPoints(particleCount)
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.PointsMaterial({
    color: color,
    size: 0.3,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })
  
  const particles = new THREE.Points(geometry, material)
  flightRoutesGroup.add(particles)
  
  // 添加粒子动画数据
  particles.userData.curve = curve
  particles.userData.offset = Math.random()
}

// 切换飞机航线显示
const toggleFlightRoutes = () => {
  showFlightRoutes.value = !showFlightRoutes.value
  if (flightRoutesGroup) {
    flightRoutesGroup.visible = showFlightRoutes.value
  }
  // 同时控制飞机的显示
  flightPlanes.forEach(plane => {
    plane.visible = showFlightRoutes.value
  })
}

// 动画循环
const clock = new THREE.Clock()
const animate = () => {
  requestAnimationFrame(animate)
  
  const delta = clock.getDelta()
  const time = clock.getElapsedTime()
  
  // 更新所有 Shader 的时间
  animatedUniforms.forEach(uniforms => {
    uniforms.uTime.value = time
  })
  
  // 更新飞机位置
  flightPlanes.forEach((plane, index) => {
    if (plane.userData.curve) {
      plane.userData.progress += plane.userData.speed
      if (plane.userData.progress > 1) {
        plane.userData.progress = 0
      }
      
      // 获取当前位置
      const point = plane.userData.curve.getPoint(plane.userData.progress)
      plane.position.copy(point)
      
      // 获取切线方向，让飞机朝向飞行方向
      const tangent = plane.userData.curve.getTangent(plane.userData.progress)
      
      // 更新 Sprite 的旋转（重新绘制 canvas）
      if (plane.userData.canvas && plane.userData.ctx && plane.userData.colorHex) {
        const ctx = plane.userData.ctx
        const colorHex = plane.userData.colorHex
        
        // 计算旋转角度 - 让飞机机头指向飞行方向
        // 
        // 三角形箭头默认指向右侧（0度），直接使用飞行角度
        const flightAngle = Math.atan2(-tangent.z, tangent.x)
        const rotationRad = -flightAngle  // 不需要偏移
        
        // 调试：偶尔输出角度信息
        if (Math.random() < 0.005) {
          console.log(`飞机 ${index}:`, {
            tangent: { x: tangent.x.toFixed(2), z: tangent.z.toFixed(2) },
            flightAngle: (flightAngle * 180 / Math.PI).toFixed(1) + '°',
            rotationRad: (rotationRad * 180 / Math.PI).toFixed(1) + '°'
          })
        }
        
        // 重新绘制飞机图标
        drawPlaneIcon(ctx, colorHex, rotationRad)
        
        // 更新纹理
        if (plane.userData.texture) {
          plane.userData.texture.needsUpdate = true
        }
      }
      
      // 根据高度变化调整飞机俯仰角（可选）
      if (plane.userData.progress < 0.99) {
        const nextPoint = plane.userData.curve.getPoint(plane.userData.progress + 0.01)
        const heightDiff = nextPoint.y - point.y
        plane.rotation.x = heightDiff * 0.3
      }
    }
  })
  
  // 更新流动粒子
  if (flightRoutesGroup) {
    flightRoutesGroup.children.forEach(child => {
      if (child instanceof THREE.Points && child.userData.curve) {
        const positions = child.geometry.attributes.position.array
        const curve = child.userData.curve
        const offset = (time * 0.1 + child.userData.offset) % 1
        
        for (let i = 0; i < positions.length / 3; i++) {
          const t = (i / (positions.length / 3) + offset) % 1
          const point = curve.getPoint(t)
          positions[i * 3] = point.x
          positions[i * 3 + 1] = point.y
          positions[i * 3 + 2] = point.z
        }
        child.geometry.attributes.position.needsUpdate = true
      }
    })
  }
  
  // 动态调整网格透明度
  if (gridHelper && showGrid.value) {
    const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0))
    const minDis = 50
    const maxDis = 150
    const maxOpacity = 0.4
    
    let currentOpacity = maxOpacity
    if (distance > maxDis) {
      currentOpacity = 0
      gridHelper.visible = false
    } else {
      gridHelper.visible = true
      if (distance > minDis) {
         const t = (distance - minDis) / (maxDis - minDis)
         currentOpacity = maxOpacity * (1 - t)
      }
    }

    if (gridHelper.isGroup) {
      gridHelper.children.forEach(child => {
        if (child.material) {
          if (child.geometry && child.geometry.type === 'PlaneGeometry') {
             child.material.opacity = currentOpacity * 0.2 
          } else {
             child.material.opacity = currentOpacity
          }
        }
      })
    } else if (gridHelper.material) {
       gridHelper.material.opacity = currentOpacity
    }
  }
  
  controls.update()
  
  // 确保相机矩阵是最新的
  camera.updateMatrixWorld()
  
  renderer.render(scene, camera)
  labelRenderer.render(scene, camera)
}

// 窗口大小调整
const onWindowResize = () => {
  if (!mapContainer.value) return
  camera.aspect = mapContainer.value.clientWidth / mapContainer.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(mapContainer.value.clientWidth, mapContainer.value.clientHeight)
  labelRenderer.setSize(mapContainer.value.clientWidth, mapContainer.value.clientHeight)
}

onMounted(() => {
  initThree()
  createMap()
  animate()
  window.addEventListener('resize', onWindowResize)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('click', handleClickOutside)
  if (renderer && renderer.domElement) {
    renderer.domElement.addEventListener('click', onMapClick)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('click', handleClickOutside)
  if (renderer && renderer.domElement) {
    renderer.domElement.removeEventListener('click', onMapClick)
  }
  // 清理定时器
  if (cardHideTimer) {
    clearTimeout(cardHideTimer)
    cardHideTimer = null
  }
  // 清理其他资源...
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 顶部操作栏 */
.top-action-bar {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  animation: slideDown 0.5s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.enter-city-twin-btn {
  background: linear-gradient(135deg, #00aaff, #00ffff);
  border: none;
  color: #000;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 170, 255, 0.4),
              0 0 20px rgba(0, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.enter-city-twin-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s ease;
}

.enter-city-twin-btn:hover::before {
  left: 100%;
}

.enter-city-twin-btn:hover {
  background: linear-gradient(135deg, #00ccff, #00ffff);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 170, 255, 0.6),
              0 0 30px rgba(0, 255, 255, 0.4);
}

.enter-city-twin-btn:active {
  transform: translateY(0);
}

.enter-city-twin-btn .icon {
  font-size: 18px;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  display: flex;
  gap: 15px;
}

/* 下拉菜单容器 */
.dropdown {
  position: relative;
}

/* 下拉按钮 */
.dropdown-btn {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid #00aaff;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 170, 255, 0.2);
}

.dropdown-btn:hover {
  background: rgba(0, 170, 255, 0.3);
  border-color: #00ccff;
  box-shadow: 0 4px 12px rgba(0, 170, 255, 0.4);
  transform: translateY(-1px);
}

.dropdown-btn.active {
  background: rgba(0, 170, 255, 0.4);
  border-color: #00ffff;
  box-shadow: 0 4px 16px rgba(0, 170, 255, 0.6);
}

/* 徽章 */
.badge {
  background: linear-gradient(135deg, #00ffff, #00aaff);
  color: #000;
  font-size: 11px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
}

/* 箭头 */
.arrow {
  font-size: 10px;
  transition: transform 0.3s ease;
  opacity: 0.7;
}

.arrow.open {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 200px;
  background: rgba(2, 9, 18, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid #00aaff;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 170, 255, 0.3);
  animation: slideDown 0.3s ease;
  z-index: 1000;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 下拉菜单内的按钮 */
.dropdown-menu button {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 170, 255, 0.3);
  color: #fff;
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  text-align: left;
}

.dropdown-menu button:last-child {
  margin-bottom: 0;
}

.dropdown-menu button:hover {
  background: rgba(0, 170, 255, 0.2);
  border-color: #00aaff;
  transform: translateX(3px);
}

.dropdown-menu button.active {
  background: rgba(0, 170, 255, 0.4);
  border-color: #00ffff;
  box-shadow: 0 0 12px rgba(0, 170, 255, 0.5);
}

.dropdown-menu button .icon {
  font-size: 16px;
  opacity: 0.9;
}

/* 选择器包装 */
.select-wrapper {
  margin-bottom: 10px;
}

.select-wrapper label {
  display: block;
  color: #00aaff;
  font-size: 12px;
  margin-bottom: 6px;
  font-weight: 500;
}

.select-wrapper select {
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 170, 255, 0.5);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  outline: none;
}

.select-wrapper select:hover {
  background: rgba(0, 170, 255, 0.2);
  border-color: #00aaff;
}

.select-wrapper select:focus {
  border-color: #00ffff;
  box-shadow: 0 0 8px rgba(0, 170, 255, 0.4);
}

.select-wrapper select option {
  background: #020912;
  color: #fff;
  padding: 8px;
}

/* 重置按钮 */
.reset-btn {
  background: rgba(255, 100, 100, 0.2) !important;
  border-color: rgba(255, 100, 100, 0.5) !important;
}

.reset-btn:hover {
  background: rgba(255, 100, 100, 0.3) !important;
  border-color: rgba(255, 100, 100, 0.8) !important;
}

/* 数据卡片 */
.data-card {
  position: fixed;
  min-width: 320px;
  background: linear-gradient(135deg, rgba(2, 9, 18, 0.98), rgba(0, 50, 80, 0.95));
  backdrop-filter: blur(20px);
  border: 2px solid #00aaff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 170, 255, 0.4), 
              0 0 60px rgba(0, 170, 255, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 1000;
  animation: cardFadeIn 0.3s ease;
  pointer-events: auto; /* 确保卡片可以接收鼠标事件 */
  cursor: default; /* 鼠标在卡片上显示默认光标 */
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 170, 255, 0.3);
  background: linear-gradient(90deg, rgba(0, 170, 255, 0.1), transparent);
}

/* 卡片中的按钮样式已移除，现在使用顶部按钮和直接点击 */

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.card-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  opacity: 0.6;
  transition: all 0.2s ease;
  border-radius: 4px;
  font-size: 18px;
}

.card-close:hover {
  opacity: 1;
  background: rgba(255, 100, 100, 0.2);
  color: #ff6464;
}

.card-body {
  padding: 16px 20px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 170, 255, 0.1);
}

.data-item:last-child {
  border-bottom: none;
}

.data-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 6px;
}

.data-value {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  text-align: right;
}

.data-value.growth {
  color: #00ff88;
  text-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
}

.divider-line {
  height: 1px;
  background: linear-gradient(90deg, transparent, #00aaff, transparent);
  margin: 12px 0;
  box-shadow: 0 0 8px rgba(0, 170, 255, 0.3);
}

/* 旧的底部按钮样式（已移除，按钮现在在顶部） */

/* 排行榜面板 */
.ranking-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 380px;
  max-height: calc(100vh - 40px);
  background: linear-gradient(135deg, rgba(2, 9, 18, 0.98), rgba(0, 50, 80, 0.95));
  backdrop-filter: blur(20px);
  border: 2px solid #00aaff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 170, 255, 0.4), 
              0 0 60px rgba(0, 170, 255, 0.2);
  z-index: 1000;
  animation: slideInRight 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.ranking-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 170, 255, 0.3);
  background: linear-gradient(90deg, rgba(0, 170, 255, 0.1), transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.ranking-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  flex: 1;
  min-width: 150px;
}

.ranking-tabs {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px;
  border-radius: 6px;
}

.ranking-tabs button {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.ranking-tabs button:hover {
  color: #fff;
  background: rgba(0, 170, 255, 0.2);
}

.ranking-tabs button.active {
  color: #00ffff;
  background: rgba(0, 170, 255, 0.4);
  box-shadow: 0 0 8px rgba(0, 170, 255, 0.5);
}

.ranking-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  opacity: 0.6;
  transition: all 0.2s ease;
  border-radius: 4px;
  font-size: 18px;
}

.ranking-close:hover {
  opacity: 1;
  background: rgba(255, 100, 100, 0.2);
  color: #ff6464;
}

.ranking-body {
  padding: 12px;
  overflow-y: auto;
  flex: 1;
}

.ranking-item {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  grid-template-rows: auto auto;
  gap: 8px;
  padding: 12px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 170, 255, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.ranking-item:hover {
  background: rgba(0, 170, 255, 0.15);
  border-color: #00aaff;
  transform: translateX(5px);
}

.ranking-item.top-1 {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(0, 0, 0, 0.3));
  border-color: rgba(255, 215, 0, 0.5);
}

.ranking-item.top-2 {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(0, 0, 0, 0.3));
  border-color: rgba(192, 192, 192, 0.5);
}

.ranking-item.top-3 {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(0, 0, 0, 0.3));
  border-color: rgba(205, 127, 50, 0.5);
}

.rank-number {
  grid-row: 1 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.rank-number .medal {
  font-size: 32px;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
}

.rank-number .rank-text {
  font-size: 20px;
  font-weight: bold;
  color: #00aaff;
}

.rank-name {
  grid-column: 2;
  grid-row: 1;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
}

.rank-value {
  grid-column: 3;
  grid-row: 1;
  font-size: 14px;
  font-weight: 600;
  color: #00ffff;
  text-align: right;
  display: flex;
  align-items: center;
}

.rank-bar {
  grid-column: 2 / 4;
  grid-row: 2;
  height: 6px;
  background: rgba(0, 170, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.rank-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00aaff, #00ffff);
  border-radius: 3px;
  transition: width 0.5s ease;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  position: relative;
}

.rank-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 飞机图标样式 */
:deep(.plane-icon) {
  animation: planePulse 2s ease-in-out infinite;
  position: relative !important;
  z-index: 1000;
}

@keyframes planePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}

:deep(.plane-icon svg) {
  display: block;
}

/* 确保 CSS2DRenderer 的容器正确定位 */
:deep(.css2d-container) {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  pointer-events: none !important;
}
</style>
