<template>
  <div class="city-twin-container" ref="container">
    <!-- 返回按钮 -->
    <div class="back-button" @click="goBack">
      <span class="icon">←</span>
      <span>返回地图</span>
    </div>

    <!-- 城市信息面板 -->
    <div class="city-info-panel">
      <h2>{{ cityName }}</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">🏙️ 建筑数量</span>
          <span class="value">{{ cityData.buildings }}</span>
        </div>
        <div class="info-item">
          <span class="label">👥 人口</span>
          <span class="value">{{ cityData.population }}</span>
        </div>
        <div class="info-item">
          <span class="label">💰 GDP</span>
          <span class="value">{{ cityData.gdp }}</span>
        </div>
        <div class="info-item">
          <span class="label">🌡️ 温度</span>
          <span class="value">{{ cityData.temperature }}</span>
        </div>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <button @click="toggleBuildings" :class="{ active: showBuildings }">
        🏢 建筑
      </button>
      <button @click="toggleRoads" :class="{ active: showRoads }">
        🛣️ 道路
      </button>
      <button @click="toggleLights" :class="{ active: showLights }">
        💡 灯光
      </button>
      <button @click="toggleParticles" :class="{ active: showParticles }">
        ✨ 粒子
      </button>
      <button @click="resetCamera">
        📷 重置视角
      </button>
    </div>

    <!-- 时间控制 -->
    <div class="time-control">
      <span>🕐 时间：{{ currentTime }}</span>
      <input 
        type="range" 
        min="0" 
        max="24" 
        step="0.5" 
        v-model="timeOfDay" 
        @input="updateTimeOfDay"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'

const props = defineProps({
  cityName: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['back'])

const container = ref(null)
let scene, camera, renderer, controls
let buildingsGroup, roadsGroup, lightsGroup, particlesSystem
let animationId

// 状态
const showBuildings = ref(true)
const showRoads = ref(true)
const showLights = ref(true)
const showParticles = ref(true)
const timeOfDay = ref(12) // 12点（中午）

// 城市数据
const cityData = ref({
  buildings: 1250,
  population: '850万',
  gdp: '¥12,500亿',
  temperature: '22°C'
})

// 当前时间显示
const currentTime = computed(() => {
  const hour = Math.floor(timeOfDay.value)
  const minute = Math.floor((timeOfDay.value % 1) * 60)
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
})

// 初始化场景
const initScene = () => {
  if (!container.value) return

  const width = container.value.clientWidth
  const height = container.value.clientHeight

  // 场景
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x000000, 50, 200)

  // 相机
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(50, 40, 50)
  camera.lookAt(0, 0, 0)

  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.value.appendChild(renderer.domElement)

  // 控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 2.2
  controls.minDistance = 20
  controls.maxDistance = 150

  // 灯光
  setupLights()

  // 创建城市
  createCity()

  // 创建地面
  createGround()

  // 创建粒子系统
  createParticles()

  // 开始动画
  animate()
}

// 设置灯光
const setupLights = () => {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  // 主光源（太阳）
  const sunLight = new THREE.DirectionalLight(0xffffff, 0.8)
  sunLight.position.set(50, 50, 30)
  sunLight.castShadow = true
  sunLight.shadow.camera.left = -50
  sunLight.shadow.camera.right = 50
  sunLight.shadow.camera.top = 50
  sunLight.shadow.camera.bottom = -50
  sunLight.shadow.mapSize.width = 2048
  sunLight.shadow.mapSize.height = 2048
  scene.add(sunLight)

  // 半球光（天空光）
  const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x444444, 0.5)
  scene.add(hemiLight)
}

// 创建城市建筑
const createCity = () => {
  buildingsGroup = new THREE.Group()
  buildingsGroup.name = 'buildings'

  const gridSize = 10
  const spacing = 8

  for (let x = -gridSize / 2; x < gridSize / 2; x++) {
    for (let z = -gridSize / 2; z < gridSize / 2; z++) {
      // 跳过中心区域（留作广场）
      if (Math.abs(x) < 2 && Math.abs(z) < 2) continue

      // 随机决定是否放置建筑
      if (Math.random() > 0.7) continue

      const building = createBuilding()
      building.position.set(
        x * spacing + (Math.random() - 0.5) * 2,
        0,
        z * spacing + (Math.random() - 0.5) * 2
      )
      buildingsGroup.add(building)
    }
  }

  scene.add(buildingsGroup)
}

// 创建单个建筑
const createBuilding = () => {
  const buildingGroup = new THREE.Group()

  // 随机建筑尺寸
  const width = 2 + Math.random() * 3
  const depth = 2 + Math.random() * 3
  const height = 5 + Math.random() * 20

  // 建筑主体
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.6, 0.2, 0.3 + Math.random() * 0.2),
    metalness: 0.5,
    roughness: 0.5
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.y = height / 2
  mesh.castShadow = true
  mesh.receiveShadow = true
  buildingGroup.add(mesh)

  // 建筑顶部发光
  const topGeometry = new THREE.BoxGeometry(width + 0.1, 0.5, depth + 0.1)
  const topMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.6
  })
  const topMesh = new THREE.Mesh(topGeometry, topMaterial)
  topMesh.position.y = height + 0.25
  buildingGroup.add(topMesh)

  // 窗户灯光
  const windowCount = Math.floor(height / 3)
  for (let i = 0; i < windowCount; i++) {
    if (Math.random() > 0.3) {
      const windowLight = new THREE.PointLight(0xffaa00, 0.5, 5)
      windowLight.position.set(
        (Math.random() - 0.5) * width * 0.8,
        (i + 0.5) * 3,
        depth / 2 + 0.1
      )
      buildingGroup.add(windowLight)
    }
  }

  return buildingGroup
}

// 创建地面
const createGround = () => {
  const groundGeometry = new THREE.PlaneGeometry(200, 200)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.8,
    metalness: 0.2
  })

  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // 网格线
  const gridHelper = new THREE.GridHelper(200, 50, 0x00ffff, 0x004466)
  gridHelper.material.transparent = true
  gridHelper.material.opacity = 0.3
  scene.add(gridHelper)

  // 中心广场
  const plazaGeometry = new THREE.CircleGeometry(10, 32)
  const plazaMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a4e,
    emissive: 0x00ffff,
    emissiveIntensity: 0.2
  })
  const plaza = new THREE.Mesh(plazaGeometry, plazaMaterial)
  plaza.rotation.x = -Math.PI / 2
  plaza.position.y = 0.01
  scene.add(plaza)
}

// 创建粒子系统
const createParticles = () => {
  const particleCount = 1000
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100
    positions[i * 3 + 1] = Math.random() * 50
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100

    const color = new THREE.Color()
    color.setHSL(0.5 + Math.random() * 0.2, 1, 0.5)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  })

  particlesSystem = new THREE.Points(geometry, material)
  scene.add(particlesSystem)
}

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 旋转粒子
  if (particlesSystem && showParticles.value) {
    particlesSystem.rotation.y += 0.0005
  }

  controls.update()
  renderer.render(scene, camera)
}

// 更新时间（改变光照）
const updateTimeOfDay = () => {
  const time = timeOfDay.value
  
  // 根据时间调整环境
  let skyColor, fogColor, ambientIntensity, sunIntensity
  
  if (time >= 6 && time < 18) {
    // 白天
    skyColor = 0x87ceeb
    fogColor = 0x87ceeb
    ambientIntensity = 0.6
    sunIntensity = 1.0
  } else if (time >= 18 && time < 20) {
    // 黄昏
    skyColor = 0xff6b35
    fogColor = 0x2a1a4e
    ambientIntensity = 0.3
    sunIntensity = 0.5
  } else {
    // 夜晚
    skyColor = 0x000033
    fogColor = 0x000000
    ambientIntensity = 0.2
    sunIntensity = 0.1
  }
  
  scene.background = new THREE.Color(skyColor)
  scene.fog.color.setHex(fogColor)
  
  // 更新灯光
  scene.traverse((child) => {
    if (child instanceof THREE.AmbientLight) {
      child.intensity = ambientIntensity
    }
    if (child instanceof THREE.DirectionalLight) {
      child.intensity = sunIntensity
    }
  })
}

// 切换建筑显示
const toggleBuildings = () => {
  showBuildings.value = !showBuildings.value
  if (buildingsGroup) {
    buildingsGroup.visible = showBuildings.value
  }
}

// 切换道路显示
const toggleRoads = () => {
  showRoads.value = !showRoads.value
  // TODO: 实现道路显示切换
}

// 切换灯光显示
const toggleLights = () => {
  showLights.value = !showLights.value
  scene.traverse((child) => {
    if (child instanceof THREE.PointLight) {
      child.visible = showLights.value
    }
  })
}

// 切换粒子显示
const toggleParticles = () => {
  showParticles.value = !showParticles.value
  if (particlesSystem) {
    particlesSystem.visible = showParticles.value
  }
}

// 重置相机
const resetCamera = () => {
  gsap.to(camera.position, {
    x: 50,
    y: 40,
    z: 50,
    duration: 1.5,
    ease: 'power2.inOut'
  })
  gsap.to(controls.target, {
    x: 0,
    y: 0,
    z: 0,
    duration: 1.5,
    ease: 'power2.inOut'
  })
}

// 返回地图
const goBack = () => {
  emit('back')
}

// 窗口大小调整
const onWindowResize = () => {
  if (!container.value) return
  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}

onMounted(() => {
  initScene()
  updateTimeOfDay()
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<style scoped>
.city-twin-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid #00aaff;
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(0, 170, 255, 0.3);
  border-color: #00ffff;
  transform: translateX(-5px);
}

.back-button .icon {
  font-size: 20px;
}

.city-info-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid #00aaff;
  border-radius: 12px;
  padding: 20px;
  min-width: 300px;
}

.city-info-panel h2 {
  margin: 0 0 15px 0;
  color: #00ffff;
  font-size: 24px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item .label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.info-item .value {
  font-size: 16px;
  font-weight: bold;
  color: #00ffff;
}

.control-panel {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  gap: 10px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid #00aaff;
  border-radius: 12px;
  padding: 15px;
}

.control-panel button {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 170, 255, 0.5);
  color: #fff;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.control-panel button:hover {
  background: rgba(0, 170, 255, 0.3);
  border-color: #00aaff;
  transform: translateY(-2px);
}

.control-panel button.active {
  background: rgba(0, 170, 255, 0.5);
  border-color: #00ffff;
  box-shadow: 0 0 15px rgba(0, 170, 255, 0.5);
}

.time-control {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid #00aaff;
  border-radius: 12px;
  padding: 15px 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: #fff;
  min-width: 350px;
}

.time-control span {
  font-size: 14px;
  white-space: nowrap;
}

.time-control input[type="range"] {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 170, 255, 0.3);
  outline: none;
  -webkit-appearance: none;
}

.time-control input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #00ffff;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

.time-control input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #00ffff;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}
</style>
""