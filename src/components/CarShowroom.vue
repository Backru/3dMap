<template>
  <div class="car-showroom" ref="container">
    <!-- 返回按钮 -->
    <div class="back-button" @click="goBack">
      <span class="icon">←</span>
      <span>返回地图</span>
    </div>

    <!-- 标题 -->
    <div class="title-section">
      <h1 class="car-title">智能电动汽车</h1>
      <p class="car-subtitle">未来出行，触手可及</p>
    </div>

    <!-- 颜色选择器 -->
    <div class="color-selector">
      <h3>选择颜色</h3>
      <div class="color-options">
        <div 
          v-for="color in carColors" 
          :key="color.name"
          class="color-option"
          :class="{ active: selectedColor === color.name }"
          :style="{ background: color.hex }"
          @click="changeColor(color)"
          :title="color.name"
        >
          <span class="checkmark" v-if="selectedColor === color.name">✓</span>
        </div>
      </div>
    </div>

    <!-- 功能控制（仅在几何体模式下显示） -->
    <div class="feature-controls" v-if="!isModelLoaded && currentAnimations.length === 0">
      <button 
        @click="toggleDoor('left')" 
        :class="{ active: doorsOpen.left }"
      >
        {{ doorsOpen.left ? '关闭' : '打开' }}左门
      </button>
      <button 
        @click="toggleDoor('right')" 
        :class="{ active: doorsOpen.right }"
      >
        {{ doorsOpen.right ? '关闭' : '打开' }}右门
      </button>
      <button 
        @click="toggleTrunk" 
        :class="{ active: trunkOpen }"
      >
        {{ trunkOpen ? '关闭' : '打开' }}后备箱
      </button>
    </div>

    <!-- 动画控制（如果模型有动画） -->
    <div class="animation-controls" v-if="isModelLoaded && currentAnimations.length > 0">
      <div class="animation-header">
        <h3>🎬 模型动画</h3>
        <button class="stop-all-btn" @click="stopAllAnimations">停止所有</button>
      </div>
      <div class="animation-list">
        <button 
          v-for="(anim, index) in currentAnimations" 
          :key="index"
          @click="playAnimation(index)"
          :class="{ active: anim.isPlaying }"
          class="animation-btn"
        >
          <span class="anim-icon">{{ anim.isPlaying ? '⏸️' : '▶️' }}</span>
          <span class="anim-name">{{ anim.name }}</span>
          <span class="anim-duration">{{ anim.duration }}s</span>
        </button>
      </div>
    </div>

    <!-- 模型无动画提示 -->
    <div class="no-animation-hint" v-if="isModelLoaded && currentAnimations.length === 0">
      <p>ℹ️ 该模型没有动画</p>
      <p class="hint-sub">可以尝试下载带动画的模型</p>
    </div>

    <!-- 视角切换 -->
    <div class="view-controls">
      <button 
        v-for="view in views" 
        :key="view.name"
        @click="changeView(view)"
        :class="{ active: currentView === view.name }"
      >
        {{ view.label }}
      </button>
    </div>

    <!-- 信息面板 -->
    <div class="info-panel">
      <div class="spec-item">
        <span class="spec-label">最高时速</span>
        <span class="spec-value">210 km/h</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">续航里程</span>
        <span class="spec-value">700 km</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">百公里加速</span>
        <span class="spec-value">3.8 s</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">电池容量</span>
        <span class="spec-value">101 kWh</span>
      </div>
    </div>

    <!-- 操作提示 -->
    <div class="hint">
      <p>💡 拖动鼠标旋转 | 滚轮缩放</p>
      <p class="drive-hint">🚗 按住鼠标左键 = 车辆前进</p>
    </div>

    <!-- 车轮选择器（调试用） -->
    <div class="wheel-selector" v-if="showWheelSelector && modelObjects.length > 0">
      <div class="wheel-selector-header">
        <h3>🔧 选择车轮对象</h3>
        <button @click="showWheelSelector = false" class="close-btn">✕</button>
      </div>
      <div class="wheel-selector-hint">
        <p>从下面列表中选择 4 个车轮对象（通常名称包含 wheel、tire、circle 等）</p>
        <p class="selected-count">已选择: {{ selectedWheelIndices.length }} / 4</p>
      </div>
      <div class="object-list">
        <div 
          v-for="(obj, index) in modelObjects" 
          :key="index"
          class="object-item"
          :class="{ selected: selectedWheelIndices.includes(index) }"
          @click="toggleWheelSelection(index)"
        >
          <span class="object-type">{{ obj.type }}</span>
          <span class="object-name">{{ obj.name || '(无名称)' }}</span>
          <span class="object-pos">Y: {{ obj.worldY.toFixed(2) }}</span>
        </div>
      </div>
      <div class="wheel-selector-footer">
        <button @click="applyWheelSelection" class="apply-btn" :disabled="selectedWheelIndices.length === 0">
          ✓ 应用选择 ({{ selectedWheelIndices.length }})
        </button>
        <button @click="autoSelectWheels" class="auto-btn">
          🤖 自动选择底部4个对象
        </button>
      </div>
    </div>

    <!-- 车轮调试按钮 -->
    <button 
      v-if="isModelLoaded && wheels.length === 0" 
      class="wheel-debug-btn"
      @click="showWheelSelector = true"
    >
      🔧 手动选择车轮
    </button>

    <!-- 速度表 -->
    <div class="speedometer" v-if="carSpeed > 0">
      <div class="speed-value">{{ Math.round(carSpeed * 100) }}</div>
      <div class="speed-label">km/h</div>
      <div class="speed-bar">
        <div class="speed-fill" :style="{ width: (carSpeed / maxSpeed * 100) + '%' }"></div>
      </div>
    </div>

    <!-- 加载进度 -->
    <div v-if="!isModelLoaded && loadingProgress > 0" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h2>加载汽车模型中...</h2>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
        </div>
        <p class="progress-text">{{ loadingProgress }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import gsap from 'gsap'

const emit = defineEmits(['back'])

const container = ref(null)
let scene, camera, renderer, controls
let carBody, leftDoor, rightDoor, trunk
let animationId
let carModel = null  // 存储加载的汽车模型
let isModelLoaded = ref(false)  // 模型加载状态
let loadingProgress = ref(0)  // 加载进度
let mixer = null  // 动画混合器
let animations = []  // 存储所有动画
let currentAnimations = ref([])  // 当前可用的动画列表
const clock = new THREE.Clock()  // 动画时钟

// 车轮选择器
const showWheelSelector = ref(false)
const modelObjects = ref([])
const selectedWheelIndices = ref([])

// 车辆运动相关
const isMouseDown = ref(false)  // 鼠标是否按下
const carSpeed = ref(0)  // 当前速度（响应式）
let wheels = []  // 存储所有车轮
const maxSpeed = 0.5  // 最大速度
const acceleration = 0.01  // 加速度
const deceleration = 0.02  // 减速度

// 隧道环境相关
let tunnelGroup = null  // 隧道组
let roadLines = []  // 道路标线
const tunnelLength = 100  // 隧道长度

// 状态
const selectedColor = ref('曜石黑')  // 改为黑色
const doorsOpen = ref({ left: false, right: false })
const trunkOpen = ref(false)
const currentView = ref('front')

// 颜色选项 - 黑色放在第一位
const carColors = [
  { name: '曜石黑', hex: '#1a1a1a', color: 0x1a1a1a },
  { name: '珍珠白', hex: '#f8f9fa', color: 0xf8f9fa },
  { name: '星空蓝', hex: '#32cce1', color: 0x32cce1 },
  { name: '晨曦金', hex: '#d4af37', color: 0xd4af37 },
  { name: '樱花粉', hex: '#ffc0cb', color: 0xffc0cb },
  { name: '森林绿', hex: '#2d5016', color: 0x2d5016 },
  { name: '火焰红', hex: '#dc2626', color: 0xdc2626 }
]

// 视角选项
const views = [
  { name: 'front', label: '前视图', position: { x: 0, y: 3.5, z: 14 } },
  { name: 'side', label: '侧视图', position: { x: 18, y: 3, z: 2 } },
  { name: 'back', label: '后视图', position: { x: 0, y: 3.5, z: -14 } },
  { name: 'top', label: '俯视图', position: { x: 0, y: 18, z: 6 } }
]

// 初始化场景
const initScene = () => {
  if (!container.value) return

  const width = container.value.clientWidth
  const height = container.value.clientHeight

  // 场景 - 黑色舞台背景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a0a)
  scene.fog = new THREE.Fog(0x0a0a0a, 40, 100)

  // 相机
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.set(8, 4, 12)
  camera.lookAt(0, 1, 0)

  // 渲染器 - 高质量设置
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.physicallyCorrectLights = true
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.3  // 提高曝光度
  container.value.appendChild(renderer.domElement)

  // 控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 6
  controls.maxDistance = 35
  controls.maxPolarAngle = Math.PI / 2.2
  controls.minPolarAngle = Math.PI / 6
  controls.target.set(0, 1.2, 0)
  controls.autoRotate = false
  controls.autoRotateSpeed = 0.5

  // 灯光
  setupLights()

  // 创建地面
  createGround()

  // 创建环境
  createEnvironment()

  // 创建隧道环境
  createTunnelEnvironment()

  // 尝试加载 GLTF 模型，如果失败则使用几何体
  loadCarModel()

  // 添加鼠标事件监听
  setupMouseEvents()

  // 开始动画
  animate()
}

// 创建隧道环境
const createTunnelEnvironment = () => {
  tunnelGroup = new THREE.Group()
  
  // 1. 隧道墙壁（两侧）
  const wallHeight = 8
  const wallLength = tunnelLength
  const wallDistance = 12
  
  // 左墙
  const leftWallGeometry = new THREE.PlaneGeometry(wallLength, wallHeight)
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.3,
    roughness: 0.7,
    side: THREE.DoubleSide
  })
  const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial)
  leftWall.rotation.y = Math.PI / 2
  leftWall.position.set(-wallDistance, wallHeight / 2, -wallLength / 2)
  tunnelGroup.add(leftWall)
  
  // 右墙
  const rightWall = leftWall.clone()
  rightWall.position.x = wallDistance
  tunnelGroup.add(rightWall)
  
  // 2. 隧道顶部
  const ceilingGeometry = new THREE.PlaneGeometry(wallDistance * 2, wallLength)
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    metalness: 0.2,
    roughness: 0.8
  })
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.set(0, wallHeight, -wallLength / 2)
  tunnelGroup.add(ceiling)
  
  // 3. 隧道灯光（顶部灯带）
  for (let i = 0; i < 10; i++) {
    const z = -wallLength + (i * wallLength / 10)
    
    // 左侧灯带
    const leftLightGeometry = new THREE.BoxGeometry(0.3, 0.1, 3)
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xffaa00,
      emissiveIntensity: 1.0
    })
    const leftLight = new THREE.Mesh(leftLightGeometry, lightMaterial)
    leftLight.position.set(-wallDistance + 1, wallHeight - 0.5, z)
    tunnelGroup.add(leftLight)
    
    // 右侧灯带
    const rightLight = leftLight.clone()
    rightLight.position.x = wallDistance - 1
    tunnelGroup.add(rightLight)
    
    // 点光源
    const pointLight = new THREE.PointLight(0xffaa00, 0.5, 15)
    pointLight.position.set(0, wallHeight - 1, z)
    tunnelGroup.add(pointLight)
  }
  
  // 4. 道路标线（白色虚线）
  roadLines = []
  const lineWidth = 0.3
  const lineLength = 3
  const lineGap = 5
  
  for (let i = 0; i < 20; i++) {
    const z = -50 + (i * lineGap)
    
    const lineGeometry = new THREE.PlaneGeometry(lineWidth, lineLength)
    const lineMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    })
    const line = new THREE.Mesh(lineGeometry, lineMaterial)
    line.rotation.x = -Math.PI / 2
    line.position.set(0, 0.02, z)
    
    roadLines.push(line)
    scene.add(line)
  }
  
  // 5. 隧道入口/出口光效
  const portalGeometry = new THREE.RingGeometry(8, 12, 32)
  const portalMaterial = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  })
  const portal = new THREE.Mesh(portalGeometry, portalMaterial)
  portal.position.z = -wallLength
  tunnelGroup.add(portal)
  
  // 复制一个隧道组实现无缝循环
  const tunnelGroup2 = tunnelGroup.clone()
  tunnelGroup2.position.z = -tunnelLength
  scene.add(tunnelGroup2)
  
  scene.add(tunnelGroup)
  
  console.log('🚇 隧道环境已创建')
}

// 设置鼠标事件
const setupMouseEvents = () => {
  // 鼠标按下
  renderer.domElement.addEventListener('mousedown', (e) => {
    // 只在左键按下时触发
    if (e.button === 0) {
      isMouseDown.value = true
      console.log('🚗 开始加速！')
    }
  })

  // 鼠标松开
  window.addEventListener('mouseup', () => {
    if (isMouseDown.value) {
      isMouseDown.value = false
      console.log('🛑 松开油门，减速中...')
    }
  })

  // 触摸事件支持（移动端）
  renderer.domElement.addEventListener('touchstart', (e) => {
    isMouseDown.value = true
    console.log('🚗 开始加速！')
  })

  window.addEventListener('touchend', () => {
    if (isMouseDown.value) {
      isMouseDown.value = false
      console.log('🛑 松开油门，减速中...')
    }
  })
}

// 加载汽车模型
const loadCarModel = () => {
  const loader = new GLTFLoader()
  
  // 配置 Draco 解码器（用于压缩模型）
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
  loader.setDRACOLoader(dracoLoader)
  
  // 模型路径配置
  // 方案1: 本地模型（推荐）- 将模型文件放在 public/models/car.glb
  const modelPath = '/models/car.glb'
  
  // 方案2: 使用在线测试模型（备用）
  // 这是一个简单的跑车模型，用于测试
//   const modelPath = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ToyCar/glTF-Binary/ToyCar.glb'
  
  // 方案3: 其他在线模型示例
  // const modelPath = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb'
  
  console.log('🚗 开始加载汽车模型...')
  
  loader.load(
    modelPath,
    // 加载成功
    (gltf) => {
      console.log('✅ 模型加载成功！', gltf)
      carModel = gltf.scene
      
      // 检查是否有动画
      if (gltf.animations && gltf.animations.length > 0) {
        console.log('🎬 发现动画！', gltf.animations.length, '个')
        animations = gltf.animations
        
        // 创建动画混合器
        mixer = new THREE.AnimationMixer(carModel)
        
        // 列出所有动画
        currentAnimations.value = gltf.animations.map((clip, index) => ({
          name: clip.name || `动画 ${index + 1}`,
          duration: clip.duration.toFixed(2),
          clip: clip,
          isPlaying: false
        }))
        
        console.log('📋 动画列表:', currentAnimations.value)
      } else {
        console.log('ℹ️ 该模型没有动画')
      }
      
      // 设置模型
      setupLoadedModel(carModel)
      
      // 添加到场景
      scene.add(carModel)
      isModelLoaded.value = true
      
      console.log('🎉 汽车模型已添加到场景')
    },
    // 加载进度
    (progress) => {
      const percent = (progress.loaded / progress.total) * 100
      loadingProgress.value = Math.round(percent)
      console.log(`📦 加载进度: ${loadingProgress.value}%`)
    },
    // 加载失败 - 使用几何体备用方案
    (error) => {
      console.warn('⚠️ 模型加载失败，使用几何体备用方案', error)
      console.log('💡 提示：请将汽车模型文件放在 public/models/car.glb')
      
      // 使用原来的几何体创建方法
      createCar()
      isModelLoaded.value = false
    }
  )
}

// 设置加载的模型
const setupLoadedModel = (model) => {
  // 计算模型边界
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  
  // 缩放模型到合适大小（假设目标大小约为 8 单位）
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = 8 / maxDim
  model.scale.setScalar(scale)
  
  // 居中模型
  model.position.x = -center.x * scale
  model.position.y = -box.min.y * scale  // 让车底部贴地
  model.position.z = -center.z * scale
  
  // 遍历模型，设置材质和阴影
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
      
      // 如果材质存在，增强其质感
      if (child.material) {
        // 保存原始材质
        const originalMaterial = child.material
        
        // 如果是车漆材质（通常颜色较鲜艳）
        if (originalMaterial.color && originalMaterial.color.getHSL({}).s > 0.3) {
          // 升级为物理材质
          child.material = new THREE.MeshPhysicalMaterial({
            color: originalMaterial.color,
            metalness: 0.95,
            roughness: 0.05,
            clearcoat: 1.0,
            clearcoatRoughness: 0.03,
            reflectivity: 1.0,
            envMapIntensity: 2.0,
            sheen: 0.5,
            sheenRoughness: 0.5,
            sheenColor: new THREE.Color(0xffffff)
          })
        } else {
          // 其他材质也增强一下
          if (originalMaterial.metalness !== undefined) {
            originalMaterial.envMapIntensity = 1.5
          }
        }
      }
    }
  })
  
  // 保存引用以便后续操作
  carBody = model
  
  // 查找并保存车轮引用（用于旋转动画）
  wheels = []
  
  console.log('🔍 开始查找车轮...')
  console.log('📋 模型所有子对象：')
  
  // 收集所有对象信息
  const allObjects = []
  model.traverse((child) => {
    const worldPos = new THREE.Vector3()
    child.getWorldPosition(worldPos)
    
    const info = {
      type: child.type,
      name: child.name || '(无名称)',
      isMesh: child.isMesh,
      localPosition: child.position.clone(),
      worldPosition: worldPos,
      geometry: child.geometry ? child.geometry.type : null,
      vertexCount: child.geometry ? child.geometry.attributes.position?.count : 0
    }
    allObjects.push({ child, info })
    
    // 打印详细信息（包括局部坐标和几何信息）
    if (child.isMesh) {
      console.log(`  - ${info.type}: "${info.name}" | 局部: (${child.position.x.toFixed(2)}, ${child.position.y.toFixed(2)}, ${child.position.z.toFixed(2)}) | 世界: (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}, ${worldPos.z.toFixed(2)}) | 顶点: ${info.vertexCount}`)
    } else {
      console.log(`  - ${info.type}: "${info.name}" | 位置: (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}, ${worldPos.z.toFixed(2)})`)
    }
  })
  
  // 方法1: 通过名称识别车轮
  model.traverse((child) => {
    if (child.isMesh || child.isGroup || child.isObject3D) {
      const name = child.name.toLowerCase()
      
      // 扩展车轮识别关键词
      const wheelKeywords = [
        'wheel', 'tire', 'rim', 'roue', 'rueda',  // 多语言
        '轮', '车轮', 'tyre',
        'fl_wheel', 'fr_wheel', 'rl_wheel', 'rr_wheel',  // 常见命名
        'front_left', 'front_right', 'rear_left', 'rear_right',
        'wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr',
        'lf', 'rf', 'lr', 'rr',  // 缩写
        'pneu', 'rad',  // 其他语言
        'circle'  // 有些模型用 circle 命名圆形部件
      ]
      
      // 检查是否包含任何车轮关键词
      const isWheel = wheelKeywords.some(keyword => name.includes(keyword))
      
      if (isWheel) {
        wheels.push(child)
        console.log('✅ 通过名称找到车轮:', child.name, '类型:', child.type)
      }
    }
  })
  
  console.log('📐 模型尺寸:', size)
  console.log('📍 模型位置:', model.position)
  console.log('🔍 模型缩放:', scale)
  console.log('🎡 通过名称找到车轮数量:', wheels.length)
  
  // 方法2: 如果没找到车轮，尝试通过局部位置识别（车辆四角）
  if (wheels.length === 0) {
    console.warn('⚠️ 未找到命名的车轮，尝试通过局部位置识别...')
    
    const candidates = []
    model.traverse((child) => {
      if (child.isMesh) {
        const localPos = child.position
        const worldPos = new THREE.Vector3()
        child.getWorldPosition(worldPos)
        
        // 计算局部位置到中心的距离
        const localDistFromCenter = Math.sqrt(localPos.x * localPos.x + localPos.z * localPos.z)
        
        // 车轮通常在底部（y较小）且距离中心有一定距离
        // 使用局部坐标判断
        if (localPos.y < 0.5 && localDistFromCenter > 0.5) {
          candidates.push({
            child,
            localPos: localPos.clone(),
            worldPos,
            localDistFromCenter,
            localY: localPos.y,
            vertexCount: child.geometry?.attributes.position?.count || 0
          })
        }
      }
    })
    
    // 按局部 y 坐标排序
    candidates.sort((a, b) => a.localY - b.localY)
    
    console.log('🔍 底部候选对象（按局部Y排序）:', candidates.length)
    candidates.slice(0, 10).forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.child.name || '未命名'} | 局部: (${c.localPos.x.toFixed(2)}, ${c.localPos.y.toFixed(2)}, ${c.localPos.z.toFixed(2)}) | 顶点: ${c.vertexCount}`)
    })
    
    // 尝试找到4个角落的对象（前左、前右、后左、后右）
    if (candidates.length >= 4) {
      // 使用局部坐标按 x 和 z 坐标分组
      const leftFront = candidates.filter(c => c.localPos.x < -0.5 && c.localPos.z > 0.5).sort((a, b) => b.localDistFromCenter - a.localDistFromCenter)[0]
      const rightFront = candidates.filter(c => c.localPos.x > 0.5 && c.localPos.z > 0.5).sort((a, b) => b.localDistFromCenter - a.localDistFromCenter)[0]
      const leftRear = candidates.filter(c => c.localPos.x < -0.5 && c.localPos.z < -0.5).sort((a, b) => b.localDistFromCenter - a.localDistFromCenter)[0]
      const rightRear = candidates.filter(c => c.localPos.x > 0.5 && c.localPos.z < -0.5).sort((a, b) => b.localDistFromCenter - a.localDistFromCenter)[0]
      
      if (leftFront) {
        wheels.push(leftFront.child)
        console.log('✅ 识别左前轮:', leftFront.child.name || '未命名', '局部位置:', leftFront.localPos)
      }
      if (rightFront) {
        wheels.push(rightFront.child)
        console.log('✅ 识别右前轮:', rightFront.child.name || '未命名', '局部位置:', rightFront.localPos)
      }
      if (leftRear) {
        wheels.push(leftRear.child)
        console.log('✅ 识别左后轮:', leftRear.child.name || '未命名', '局部位置:', leftRear.localPos)
      }
      if (rightRear) {
        wheels.push(rightRear.child)
        console.log('✅ 识别右后轮:', rightRear.child.name || '未命名', '局部位置:', rightRear.localPos)
      }
    }
    
    console.log('🎡 通过位置识别到车轮数量:', wheels.length)
  }
  
  // 方法3: 通过分析几何体边界框识别车轮
  if (wheels.length === 0) {
    console.warn('⚠️ 尝试通过几何体边界框识别车轮...')
    
    const meshCandidates = []
    
    model.traverse((child) => {
      if (child.isMesh && child.geometry) {
        // 计算几何体边界框
        if (!child.geometry.boundingBox) {
          child.geometry.computeBoundingBox()
        }
        
        const bbox = child.geometry.boundingBox
        const vertexCount = child.geometry.attributes.position?.count || 0
        
        // 计算边界框的尺寸
        const width = bbox.max.x - bbox.min.x
        const height = bbox.max.y - bbox.min.y
        const depth = bbox.max.z - bbox.min.z
        
        // 计算边界框中心（局部坐标）
        const center = new THREE.Vector3()
        bbox.getCenter(center)
        
        // 转换到世界坐标
        const worldCenter = center.clone().applyMatrix4(child.matrixWorld)
        
        meshCandidates.push({
          child,
          name: child.name,
          vertexCount,
          bbox,
          width,
          height,
          depth,
          localCenter: center,
          worldCenter,
          // 判断是否可能是轮胎的特征
          // 轮胎特征：高度和深度接近（圆形），宽度较小（轮胎厚度）
          isRoundish: Math.abs(height - depth) < Math.max(height, depth) * 0.3 && width < Math.max(height, depth) * 0.5,
          isBottomPart: worldCenter.y < 1.0,  // 在底部
          hasEnoughVertices: vertexCount > 1000 && vertexCount < 12000  // 顶点数合理
        })
      }
    })
    
    console.log('🔍 分析所有 Mesh 的边界框:')
    meshCandidates.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name} | 顶点: ${m.vertexCount} | 尺寸: ${m.width.toFixed(2)}×${m.height.toFixed(2)}×${m.depth.toFixed(2)} | 中心Y: ${m.worldCenter.y.toFixed(2)} | 圆形: ${m.isRoundish} | 底部: ${m.isBottomPart}`)
    })
    
    // 筛选可能是轮胎的对象
    // 方法1: 严格筛选
    let wheelCandidates = meshCandidates.filter(m => 
      m.isBottomPart && m.hasEnoughVertices && m.isRoundish
    )
    
    console.log('🎯 轮胎候选对象（严格）:', wheelCandidates.length)
    
    // 方法2: 如果严格筛选没找到，使用宽松条件
    if (wheelCandidates.length === 0) {
      console.log('⚠️ 严格筛选失败，使用宽松条件...')
      
      // 查找：底部 + 顶点数合理 + 高度和深度接近（不要求宽度）
      wheelCandidates = meshCandidates.filter(m => {
        const heightDepthRatio = Math.abs(m.height - m.depth) / Math.max(m.height, m.depth)
        const isCircular = heightDepthRatio < 0.1  // 高度和深度差异小于10%
        const isThin = m.width < Math.max(m.height, m.depth) * 1.5  // 宽度相对较小
        
        return m.isBottomPart && m.hasEnoughVertices && isCircular && isThin
      })
      
      console.log('🎯 轮胎候选对象（宽松）:', wheelCandidates.length)
    }
    
    // 方法3: 如果还是没找到，直接查找特定特征
    if (wheelCandidates.length === 0) {
      console.log('⚠️ 宽松筛选失败，查找圆形对象...')
      
      wheelCandidates = meshCandidates.filter(m => {
        // 高度和深度几乎相等（圆形）
        const heightDepthDiff = Math.abs(m.height - m.depth)
        const isCircular = heightDepthDiff < 0.3  // 差异小于0.3单位
        
        return m.isBottomPart && m.vertexCount > 2000 && m.vertexCount < 4000 && isCircular
      })
      
      console.log('🎯 轮胎候选对象（圆形特征）:', wheelCandidates.length)
    }
    
    // 方法4: 如果只找到3个，放宽顶点数范围找第4个
    if (wheelCandidates.length === 3) {
      console.log('⚠️ 只找到3个轮胎，尝试找第4个...')
      
      const additionalCandidates = meshCandidates.filter(m => {
        const heightDepthDiff = Math.abs(m.height - m.depth)
        const isCircular = heightDepthDiff < 0.5  // 放宽到0.5
        const notAlreadySelected = !wheelCandidates.includes(m)
        
        return m.isBottomPart && m.vertexCount > 1500 && m.vertexCount < 5000 && isCircular && notAlreadySelected
      })
      
      console.log('🔍 额外候选:', additionalCandidates.length)
      additionalCandidates.forEach((m, i) => {
        console.log(`  额外 ${i + 1}. ${m.name} | 顶点: ${m.vertexCount} | 尺寸: ${m.width.toFixed(2)}×${m.height.toFixed(2)}×${m.depth.toFixed(2)}`)
      })
      
      if (additionalCandidates.length > 0) {
        wheelCandidates.push(additionalCandidates[0])
        console.log('✅ 添加第4个轮胎:', additionalCandidates[0].name)
      }
    }
    
    wheelCandidates.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name} | 顶点: ${m.vertexCount} | 尺寸: ${m.width.toFixed(2)}×${m.height.toFixed(2)}×${m.depth.toFixed(2)} | 中心: (${m.worldCenter.x.toFixed(2)}, ${m.worldCenter.y.toFixed(2)}, ${m.worldCenter.z.toFixed(2)})`)
    })
    
    // 如果找到4个或更多候选，选择最外围的4个
    if (wheelCandidates.length >= 4) {
      // 按到中心的距离排序（轮胎通常在外围）
      wheelCandidates.sort((a, b) => {
        const distA = Math.sqrt(a.worldCenter.x ** 2 + a.worldCenter.z ** 2)
        const distB = Math.sqrt(b.worldCenter.x ** 2 + b.worldCenter.z ** 2)
        return distB - distA
      })
      
      // 选择四个角落的轮胎
      const leftFront = wheelCandidates.find(m => m.worldCenter.x < 0 && m.worldCenter.z > 0)
      const rightFront = wheelCandidates.find(m => m.worldCenter.x > 0 && m.worldCenter.z > 0)
      const leftRear = wheelCandidates.find(m => m.worldCenter.x < 0 && m.worldCenter.z < 0)
      const rightRear = wheelCandidates.find(m => m.worldCenter.x > 0 && m.worldCenter.z < 0)
      
      if (leftFront) {
        wheels.push(leftFront.child)
        console.log('✅ 识别左前轮:', leftFront.name)
      }
      if (rightFront) {
        wheels.push(rightFront.child)
        console.log('✅ 识别右前轮:', rightFront.name)
      }
      if (leftRear) {
        wheels.push(leftRear.child)
        console.log('✅ 识别左后轮:', leftRear.name)
      }
      if (rightRear) {
        wheels.push(rightRear.child)
        console.log('✅ 识别右后轮:', rightRear.name)
      }
    } else if (wheelCandidates.length > 0) {
      // 如果候选少于4个，全部使用
      wheelCandidates.forEach(m => {
        wheels.push(m.child)
        console.log('✅ 添加轮胎候选:', m.name)
      })
    }
    
    console.log('🎡 通过边界框识别到车轮数量:', wheels.length)
  }
  
  // 最终结果
  if (wheels.length === 0) {
    console.error('❌ 无法识别车轮！')
    console.error('💡 请点击右下角的"手动选择车轮"按钮')
    
    // 准备对象列表供 UI 选择
    modelObjects.value = allObjects.map(({ child, info }) => ({
      child: child,
      type: info.type,
      name: info.name,
      worldY: info.worldPosition.y,
      isMesh: info.isMesh
    })).sort((a, b) => a.worldY - b.worldY)  // 按 Y 坐标排序
    
    console.log('💡 已准备对象列表，共', modelObjects.value.length, '个对象')
  } else {
    console.log('✅ 成功识别车轮！总数:', wheels.length)
    wheels.forEach((wheel, i) => {
      console.log(`  车轮 ${i + 1}:`, wheel.name || '未命名', '类型:', wheel.type)
    })
  }
}

// 切换车轮选择
const toggleWheelSelection = (index) => {
  const idx = selectedWheelIndices.value.indexOf(index)
  if (idx > -1) {
    selectedWheelIndices.value.splice(idx, 1)
  } else {
    selectedWheelIndices.value.push(index)
  }
}

// 自动选择底部4个对象
const autoSelectWheels = () => {
  selectedWheelIndices.value = []
  // 选择 Y 坐标最小的前4个对象
  for (let i = 0; i < Math.min(4, modelObjects.value.length); i++) {
    selectedWheelIndices.value.push(i)
  }
}

// 应用车轮选择
const applyWheelSelection = () => {
  wheels = []
  selectedWheelIndices.value.forEach(index => {
    const obj = modelObjects.value[index]
    wheels.push(obj.child)
    console.log('✅ 手动选择车轮:', obj.name, '类型:', obj.type)
  })
  
  console.log('🎡 已设置车轮数量:', wheels.length)
  showWheelSelector.value = false
  selectedWheelIndices.value = []
}

// 设置灯光 - 舞台效果
const setupLights = () => {
  // 极低的环境光 - 营造戏剧性
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15)
  scene.add(ambientLight)

  // 主聚光灯 - 从上方照射车身
  const mainSpot = new THREE.SpotLight(0xffffff, 2.5)
  mainSpot.position.set(0, 30, 0)
  mainSpot.angle = Math.PI / 4
  mainSpot.penumbra = 0.5
  mainSpot.decay = 2
  mainSpot.distance = 50
  mainSpot.castShadow = true
  mainSpot.shadow.mapSize.width = 4096
  mainSpot.shadow.mapSize.height = 4096
  mainSpot.shadow.camera.near = 10
  mainSpot.shadow.camera.far = 50
  mainSpot.shadow.bias = -0.0001
  scene.add(mainSpot)

  // 前方聚光灯 - 照亮车头
  const frontSpot = new THREE.SpotLight(0xffffff, 1.8)
  frontSpot.position.set(0, 12, 20)
  frontSpot.angle = Math.PI / 5
  frontSpot.penumbra = 0.6
  frontSpot.decay = 2
  frontSpot.distance = 40
  frontSpot.target.position.set(0, 1, 0)
  scene.add(frontSpot)
  scene.add(frontSpot.target)

  // 侧面聚光灯 - 左侧
  const leftSpot = new THREE.SpotLight(0xffffff, 1.5)
  leftSpot.position.set(-15, 10, 5)
  leftSpot.angle = Math.PI / 6
  leftSpot.penumbra = 0.7
  leftSpot.decay = 2
  leftSpot.distance = 35
  leftSpot.target.position.set(0, 1, 0)
  scene.add(leftSpot)
  scene.add(leftSpot.target)

  // 侧面聚光灯 - 右侧
  const rightSpot = new THREE.SpotLight(0xffffff, 1.5)
  rightSpot.position.set(15, 10, 5)
  rightSpot.angle = Math.PI / 6
  rightSpot.penumbra = 0.7
  rightSpot.decay = 2
  rightSpot.distance = 35
  rightSpot.target.position.set(0, 1, 0)
  scene.add(rightSpot)
  scene.add(rightSpot.target)

  // 后方补光 - 轮廓光
  const backRim = new THREE.DirectionalLight(0xffffff, 0.8)
  backRim.position.set(0, 8, -15)
  scene.add(backRim)

  // 地面反射光
  const groundLight = new THREE.PointLight(0xffffff, 0.6, 30)
  groundLight.position.set(0, 0.5, 0)
  scene.add(groundLight)

  // 车底氛围光 - 根据车身颜色变化
  const underGlow = new THREE.PointLight(0x00aaff, 0.8, 12)
  underGlow.position.set(0, 0.3, 0)
  scene.add(underGlow)
  
  // 保存引用以便后续根据颜色调整
  scene.userData.underGlow = underGlow
}

// 创建汽车
const createCar = () => {
  const carGroup = new THREE.Group()

  // 车身
  carBody = createCarBody()
  carGroup.add(carBody)

  // 左门
  leftDoor = createDoor('left')
  leftDoor.position.set(-2.2, 0.8, 0)
  carGroup.add(leftDoor)

  // 右门
  rightDoor = createDoor('right')
  rightDoor.position.set(2.2, 0.8, 0)
  carGroup.add(rightDoor)

  // 后备箱
  trunk = createTrunk()
  trunk.position.set(0, 1, -4)
  carGroup.add(trunk)

  // 车轮
  createWheels(carGroup)

  // 车灯
  createLights(carGroup)

  // 后视镜
  createMirrors(carGroup)

  // 车标和细节
  createDetails(carGroup)

  scene.add(carGroup)
}

// 创建后视镜
const createMirrors = (carGroup) => {
  const createMirror = (x) => {
    const mirrorGroup = new THREE.Group()
    
    // 镜臂
    const armGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.4, 8)
    const armMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2
    })
    const arm = new THREE.Mesh(armGeometry, armMaterial)
    arm.rotation.z = x > 0 ? -Math.PI / 6 : Math.PI / 6
    arm.position.x = x > 0 ? 0.15 : -0.15
    mirrorGroup.add(arm)
    
    // 镜面外壳
    const housingGeometry = new THREE.BoxGeometry(0.35, 0.25, 0.15)
    const housingMaterial = new THREE.MeshStandardMaterial({
      color: carColors[0].color,
      metalness: 0.9,
      roughness: 0.1
    })
    const housing = new THREE.Mesh(housingGeometry, housingMaterial)
    housing.position.x = x > 0 ? 0.3 : -0.3
    housing.castShadow = true
    mirrorGroup.add(housing)
    
    // 镜面
    const mirrorGeometry = new THREE.PlaneGeometry(0.28, 0.2)
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      metalness: 1.0,
      roughness: 0.05
    })
    const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial)
    mirror.position.set(x > 0 ? 0.38 : -0.38, 0, 0)
    mirror.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2
    mirrorGroup.add(mirror)
    
    // 转向灯（集成在后视镜）
    const indicatorGeometry = new THREE.BoxGeometry(0.15, 0.05, 0.05)
    const indicatorMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.3
    })
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial)
    indicator.position.set(x > 0 ? 0.3 : -0.3, -0.15, 0)
    mirrorGroup.add(indicator)
    
    mirrorGroup.position.set(x, 1.8, 1.5)
    return mirrorGroup
  }
  
  carGroup.add(createMirror(-2.0))
  carGroup.add(createMirror(2.0))
}

// 创建细节装饰
const createDetails = (carGroup) => {
  // 前格栅
  const grilleGeometry = new THREE.BoxGeometry(2.5, 0.6, 0.1)
  const grilleMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.9,
    roughness: 0.3
  })
  const grille = new THREE.Mesh(grilleGeometry, grilleMaterial)
  grille.position.set(0, 0.8, 3.95)
  carGroup.add(grille)
  
  // 格栅横条
  for (let i = 0; i < 5; i++) {
    const barGeometry = new THREE.BoxGeometry(2.3, 0.03, 0.05)
    const barMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 1.0,
      roughness: 0.1
    })
    const bar = new THREE.Mesh(barGeometry, barMaterial)
    bar.position.set(0, 0.55 + i * 0.12, 4.0)
    carGroup.add(bar)
  }
  
  // 车标（圆形）
  const logoGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 32)
  const logoMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 1.0,
    roughness: 0.05,
    emissive: 0x4444ff,
    emissiveIntensity: 0.2
  })
  const logo = new THREE.Mesh(logoGeometry, logoMaterial)
  logo.rotation.x = Math.PI / 2
  logo.position.set(0, 1.15, 4.02)
  carGroup.add(logo)
  
  // 车标内圈
  const logoInnerGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.06, 32)
  const logoInner = new THREE.Mesh(logoInnerGeometry, new THREE.MeshStandardMaterial({
    color: 0x0066ff,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x0066ff,
    emissiveIntensity: 0.5
  }))
  logoInner.rotation.x = Math.PI / 2
  logoInner.position.set(0, 1.15, 4.03)
  carGroup.add(logoInner)
  
  // 后车标
  const rearLogo = logo.clone()
  rearLogo.position.set(0, 1.3, -3.75)
  carGroup.add(rearLogo)
  
  // 门把手已在 createDoor 中添加
  
  // 雨刷器
  const wiperGeometry = new THREE.CapsuleGeometry(0.02, 1.2, 4, 8)
  const wiperMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.6,
    roughness: 0.4
  })
  const leftWiper = new THREE.Mesh(wiperGeometry, wiperMaterial)
  leftWiper.rotation.z = Math.PI / 2
  leftWiper.rotation.y = -0.3
  leftWiper.position.set(-0.6, 2.05, 2.2)
  carGroup.add(leftWiper)
  
  const rightWiper = leftWiper.clone()
  rightWiper.rotation.y = 0.3
  rightWiper.position.x = 0.6
  carGroup.add(rightWiper)
  
  // 排气管
  const exhaustGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 16)
  const exhaustMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.9,
    roughness: 0.3
  })
  
  const leftExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial)
  leftExhaust.rotation.x = Math.PI / 2
  leftExhaust.position.set(-0.8, 0.4, -3.7)
  carGroup.add(leftExhaust)
  
  const rightExhaust = leftExhaust.clone()
  rightExhaust.position.x = 0.8
  carGroup.add(rightExhaust)
  
  // 充电口盖（电动车特征）
  const chargingPortGeometry = new THREE.CircleGeometry(0.15, 32)
  const chargingPortMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff88,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x00ff88,
    emissiveIntensity: 0.3
  })
  const chargingPort = new THREE.Mesh(chargingPortGeometry, chargingPortMaterial)
  chargingPort.rotation.y = -Math.PI / 2
  chargingPort.position.set(-1.95, 1.0, 1.0)
  carGroup.add(chargingPort)
}

// 创建车身
const createCarBody = () => {
  const bodyGroup = new THREE.Group()

  // 高级车漆材质 - 物理渲染
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: carColors[0].color,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 1.0,           // 清漆层
    clearcoatRoughness: 0.03, // 清漆粗糙度
    reflectivity: 1.0,        // 反射率
    envMapIntensity: 2.0,     // 环境贴图强度
    sheen: 0.5,               // 光泽
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color(0xffffff)
  })

  // 玻璃材质 - 高级透明效果
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    metalness: 0.0,
    roughness: 0.0,
    transparent: true,
    opacity: 0.15,
    transmission: 0.98,      // 透光率
    thickness: 0.5,
    ior: 1.5,                // 折射率（玻璃）
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMapIntensity: 1.5
  })

  // 1. 主车身底座 - 使用圆角矩形
  const bodyShape = new THREE.Shape()
  const width = 3.8
  const length = 7.5
  const radius = 0.3
  
  bodyShape.moveTo(-width/2 + radius, -length/2)
  bodyShape.lineTo(width/2 - radius, -length/2)
  bodyShape.quadraticCurveTo(width/2, -length/2, width/2, -length/2 + radius)
  bodyShape.lineTo(width/2, length/2 - radius)
  bodyShape.quadraticCurveTo(width/2, length/2, width/2 - radius, length/2)
  bodyShape.lineTo(-width/2 + radius, length/2)
  bodyShape.quadraticCurveTo(-width/2, length/2, -width/2, length/2 - radius)
  bodyShape.lineTo(-width/2, -length/2 + radius)
  bodyShape.quadraticCurveTo(-width/2, -length/2, -width/2 + radius, -length/2)
  
  const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, {
    depth: 1.2,
    bevelEnabled: true,
    bevelThickness: 0.15,
    bevelSize: 0.15,
    bevelSegments: 8
  })
  
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.rotation.x = Math.PI / 2
  body.position.y = 0.6
  body.castShadow = true
  body.receiveShadow = true
  bodyGroup.add(body)

  // 2. 车顶 - 流线型设计
  const roofCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 2.5),
    new THREE.Vector3(0, 0.8, 1.5),
    new THREE.Vector3(0, 1.0, 0),
    new THREE.Vector3(0, 0.9, -1.5),
    new THREE.Vector3(0, 0.6, -3)
  ])
  
  const roofShape = new THREE.Shape()
  roofShape.moveTo(-1.6, 0)
  roofShape.lineTo(1.6, 0)
  roofShape.lineTo(1.4, 1)
  roofShape.lineTo(-1.4, 1)
  roofShape.closePath()
  
  const roofGeometry = new THREE.ExtrudeGeometry(roofShape, {
    steps: 30,
    bevelEnabled: false,
    extrudePath: roofCurve
  })
  
  const roof = new THREE.Mesh(roofGeometry, bodyMaterial)
  roof.position.y = 1.2
  roof.castShadow = true
  bodyGroup.add(roof)

  // 3. 前挡风玻璃 - 弧形
  const windshieldGeometry = new THREE.CylinderGeometry(1.8, 1.8, 3.2, 32, 1, true, 0, Math.PI)
  const windshield = new THREE.Mesh(windshieldGeometry, glassMaterial)
  windshield.rotation.z = Math.PI / 2
  windshield.rotation.y = Math.PI / 2
  windshield.position.set(0, 2.0, 1.8)
  windshield.scale.y = 0.8
  bodyGroup.add(windshield)

  // 4. 后挡风玻璃
  const rearWindowGeometry = new THREE.CylinderGeometry(1.6, 1.6, 3.0, 32, 1, true, 0, Math.PI)
  const rearWindow = new THREE.Mesh(rearWindowGeometry, glassMaterial)
  rearWindow.rotation.z = Math.PI / 2
  rearWindow.rotation.y = -Math.PI / 2
  rearWindow.position.set(0, 1.8, -2.2)
  rearWindow.scale.y = 0.6
  bodyGroup.add(rearWindow)

  // 5. 引擎盖 - 流线型
  const hoodCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 1.5, 2.5),
    new THREE.Vector3(0, 1.3, 3.2),
    new THREE.Vector3(0, 1.0, 3.8)
  )
  
  const hoodPoints = hoodCurve.getPoints(20)
  const hoodShape2 = new THREE.Shape()
  hoodShape2.moveTo(-1.8, 0)
  hoodShape2.lineTo(1.8, 0)
  hoodShape2.lineTo(1.6, 0.2)
  hoodShape2.lineTo(-1.6, 0.2)
  hoodShape2.closePath()
  
  const hoodGeometry = new THREE.ExtrudeGeometry(hoodShape2, {
    steps: 20,
    bevelEnabled: false,
    extrudePath: hoodCurve
  })
  
  const hood = new THREE.Mesh(hoodGeometry, bodyMaterial)
  hood.castShadow = true
  bodyGroup.add(hood)

  // 6. 前保险杠 - 运动风格
  const bumperGeometry = new THREE.CylinderGeometry(0.15, 0.2, 3.5, 16)
  const bumper = new THREE.Mesh(bumperGeometry, bodyMaterial)
  bumper.rotation.z = Math.PI / 2
  bumper.position.set(0, 0.5, 4.0)
  bumper.castShadow = true
  bodyGroup.add(bumper)

  // 7. 后保险杠
  const rearBumperGeometry = new THREE.CylinderGeometry(0.2, 0.15, 3.5, 16)
  const rearBumper = new THREE.Mesh(rearBumperGeometry, bodyMaterial)
  rearBumper.rotation.z = Math.PI / 2
  rearBumper.position.set(0, 0.5, -3.8)
  rearBumper.castShadow = true
  bodyGroup.add(rearBumper)

  // 8. 侧裙边
  const sideskirtGeometry = new THREE.BoxGeometry(0.1, 0.3, 6)
  const leftSkirt = new THREE.Mesh(sideskirtGeometry, bodyMaterial)
  leftSkirt.position.set(-1.95, 0.4, 0)
  leftSkirt.castShadow = true
  bodyGroup.add(leftSkirt)
  
  const rightSkirt = leftSkirt.clone()
  rightSkirt.position.x = 1.95
  bodyGroup.add(rightSkirt)

  // 9. 车顶天线
  const antennaGeometry = new THREE.CylinderGeometry(0.03, 0.05, 0.4, 8)
  const antennaMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.8,
    roughness: 0.2
  })
  const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial)
  antenna.position.set(0.8, 2.8, -1.5)
  bodyGroup.add(antenna)

  return bodyGroup
}

// 创建车门
const createDoor = (side) => {
  const doorGroup = new THREE.Group()
  
  const doorMaterial = new THREE.MeshPhysicalMaterial({
    color: carColors[0].color,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    reflectivity: 1.0,
    envMapIntensity: 2.0,
    sheen: 0.5,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color(0xffffff)
  })

  // 车门主体 - 使用弧形
  const doorShape = new THREE.Shape()
  doorShape.moveTo(0, 0)
  doorShape.lineTo(0, 1.0)
  doorShape.quadraticCurveTo(0, 1.2, 0.1, 1.2)
  doorShape.lineTo(1.8, 1.2)
  doorShape.lineTo(1.9, 0)
  doorShape.closePath()
  
  const doorGeometry = new THREE.ExtrudeGeometry(doorShape, {
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3
  })
  
  const door = new THREE.Mesh(doorGeometry, doorMaterial)
  door.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2
  door.position.set(0, 0, -0.95)
  door.castShadow = true
  doorGroup.add(door)

  // 车窗 - 弧形玻璃
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    metalness: 0.1,
    roughness: 0.05,
    transparent: true,
    opacity: 0.25,
    transmission: 0.95
  })
  
  const windowGeometry = new THREE.PlaneGeometry(1.5, 0.7)
  const window = new THREE.Mesh(windowGeometry, glassMaterial)
  window.position.set(side === 'left' ? -0.08 : 0.08, 0.4, 0)
  window.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2
  doorGroup.add(window)

  // 门把手
  const handleGeometry = new THREE.CapsuleGeometry(0.03, 0.3, 4, 8)
  const handleMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 1.0,
    roughness: 0.1
  })
  const handle = new THREE.Mesh(handleGeometry, handleMaterial)
  handle.rotation.z = Math.PI / 2
  handle.position.set(side === 'left' ? -0.12 : 0.12, 0.5, 0.5)
  doorGroup.add(handle)

  return doorGroup
}

// 创建后备箱
const createTrunk = () => {
  const trunkGroup = new THREE.Group()
  
  const trunkMaterial = new THREE.MeshPhysicalMaterial({
    color: carColors[0].color,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    reflectivity: 1.0,
    envMapIntensity: 2.0,
    sheen: 0.5,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color(0xffffff)
  })

  // 后备箱盖 - 流线型
  const trunkShape = new THREE.Shape()
  const tw = 3.6
  const tl = 1.3
  const tr = 0.2
  
  trunkShape.moveTo(-tw/2 + tr, 0)
  trunkShape.lineTo(tw/2 - tr, 0)
  trunkShape.quadraticCurveTo(tw/2, 0, tw/2, tr)
  trunkShape.lineTo(tw/2, tl - tr)
  trunkShape.quadraticCurveTo(tw/2, tl, tw/2 - tr, tl)
  trunkShape.lineTo(-tw/2 + tr, tl)
  trunkShape.quadraticCurveTo(-tw/2, tl, -tw/2, tl - tr)
  trunkShape.lineTo(-tw/2, tr)
  trunkShape.quadraticCurveTo(-tw/2, 0, -tw/2 + tr, 0)
  
  const trunkGeometry = new THREE.ExtrudeGeometry(trunkShape, {
    depth: 0.8,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 5
  })
  
  const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial)
  trunkMesh.rotation.x = Math.PI / 2
  trunkMesh.position.y = 0.4
  trunkMesh.castShadow = true
  trunkGroup.add(trunkMesh)

  // 后尾灯装饰条
  const lightStripGeometry = new THREE.BoxGeometry(3.2, 0.08, 0.3)
  const lightStripMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2
  })
  const lightStrip = new THREE.Mesh(lightStripGeometry, lightStripMaterial)
  lightStrip.position.set(0, 0.9, -0.65)
  trunkGroup.add(lightStrip)

  return trunkGroup
}

// 创建车轮
const createWheels = (carGroup) => {
  wheels = []  // 清空车轮数组
  
  const wheelPositions = [
    { x: -1.9, z: 2.8 },  // 左前
    { x: 1.9, z: 2.8 },   // 右前
    { x: -1.9, z: -2.8 }, // 左后
    { x: 1.9, z: -2.8 }   // 右后
  ]

  wheelPositions.forEach((pos, index) => {
    const wheelGroup = new THREE.Group()
    
    // 保存车轮引用用于旋转动画
    wheels.push(wheelGroup)
    
    // 轮胎 - 更真实的造型
    const tireGeometry = new THREE.TorusGeometry(0.55, 0.25, 16, 32)
    const tireMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.3,
      roughness: 0.9
    })
    const tire = new THREE.Mesh(tireGeometry, tireMaterial)
    tire.rotation.y = Math.PI / 2
    tire.castShadow = true
    wheelGroup.add(tire)

    // 轮毂底盘
    const hubBaseGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.15, 32)
    const hubBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      metalness: 0.9,
      roughness: 0.1
    })
    const hubBase = new THREE.Mesh(hubBaseGeometry, hubBaseMaterial)
    hubBase.rotation.z = Math.PI / 2
    wheelGroup.add(hubBase)

    // 轮毂辐条 - 5辐设计
    const spokeGeometry = new THREE.BoxGeometry(0.08, 0.6, 0.12)
    const spokeMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 1.0,
      roughness: 0.05
    })
    
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial)
      spoke.rotation.z = (i * Math.PI * 2) / 5
      spoke.position.x = 0.05
      wheelGroup.add(spoke)
    }

    // 中心盖
    const centerCapGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.18, 32)
    const centerCapMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 1.0,
      roughness: 0.05
    })
    const centerCap = new THREE.Mesh(centerCapGeometry, centerCapMaterial)
    centerCap.rotation.z = Math.PI / 2
    wheelGroup.add(centerCap)

    // 刹车盘
    const brakeDiscGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 32)
    const brakeDiscMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.3
    })
    const brakeDisc = new THREE.Mesh(brakeDiscGeometry, brakeDiscMaterial)
    brakeDisc.rotation.z = Math.PI / 2
    brakeDisc.position.x = -0.1
    wheelGroup.add(brakeDisc)

    // 刹车卡钳
    const caliperGeometry = new THREE.BoxGeometry(0.15, 0.25, 0.1)
    const caliperMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      metalness: 0.7,
      roughness: 0.3
    })
    const caliper = new THREE.Mesh(caliperGeometry, caliperMaterial)
    caliper.position.set(-0.08, 0.3, 0)
    wheelGroup.add(caliper)

    wheelGroup.rotation.z = Math.PI / 2
    wheelGroup.position.set(pos.x, 0.6, pos.z)
    
    // 右侧车轮需要翻转
    if (index % 2 === 1) {
      wheelGroup.rotation.x = Math.PI
    }
    
    carGroup.add(wheelGroup)
  })
}

// 创建车灯
const createLights = (carGroup) => {
  // 前大灯组 - 现代LED设计
  const createHeadlight = (x) => {
    const headlightGroup = new THREE.Group()
    
    // 主灯壳
    const housingGeometry = new THREE.BoxGeometry(0.5, 0.35, 0.25)
    const housingMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2
    })
    const housing = new THREE.Mesh(housingGeometry, housingMaterial)
    headlightGroup.add(housing)
    
    // LED灯条 - 日间行车灯
    const drlGeometry = new THREE.BoxGeometry(0.4, 0.08, 0.02)
    const drlMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.0,
      metalness: 0.5,
      roughness: 0.1
    })
    const drl = new THREE.Mesh(drlGeometry, drlMaterial)
    drl.position.set(0, 0.12, 0.13)
    headlightGroup.add(drl)
    
    // 主光源
    const mainLightGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.15, 16)
    const mainLightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffee,
      emissive: 0xffffee,
      emissiveIntensity: 0.8,
      metalness: 0.3,
      roughness: 0.1
    })
    const mainLight = new THREE.Mesh(mainLightGeometry, mainLightMaterial)
    mainLight.rotation.x = Math.PI / 2
    mainLight.position.set(0, -0.08, 0.08)
    headlightGroup.add(mainLight)
    
    // 透镜效果
    const lensGeometry = new THREE.SphereGeometry(0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2)
    const lensMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.05,
      transparent: true,
      opacity: 0.4,
      transmission: 0.9
    })
    const lens = new THREE.Mesh(lensGeometry, lensMaterial)
    lens.rotation.x = -Math.PI / 2
    lens.position.set(0, -0.08, 0.13)
    headlightGroup.add(lens)
    
    headlightGroup.position.set(x, 1.1, 3.7)
    return headlightGroup
  }
  
  carGroup.add(createHeadlight(-1.4))
  carGroup.add(createHeadlight(1.4))

  // 尾灯组 - LED贯穿式
  const createTaillight = (x) => {
    const taillightGroup = new THREE.Group()
    
    // 灯壳
    const housingGeometry = new THREE.BoxGeometry(0.45, 0.4, 0.15)
    const housingMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2
    })
    const housing = new THREE.Mesh(housingGeometry, housingMaterial)
    taillightGroup.add(housing)
    
    // LED灯带 - 竖向设计
    const ledGeometry = new THREE.BoxGeometry(0.08, 0.3, 0.02)
    const ledMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.1
    })
    
    // 三条LED灯带
    for (let i = -1; i <= 1; i++) {
      const led = new THREE.Mesh(ledGeometry, ledMaterial)
      led.position.set(i * 0.12, 0, 0.08)
      taillightGroup.add(led)
    }
    
    // 外壳透明罩
    const coverGeometry = new THREE.BoxGeometry(0.48, 0.43, 0.05)
    const coverMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff3333,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.3,
      transmission: 0.7
    })
    const cover = new THREE.Mesh(coverGeometry, coverMaterial)
    cover.position.z = 0.1
    taillightGroup.add(cover)
    
    taillightGroup.position.set(x, 1.0, -3.7)
    return taillightGroup
  }
  
  carGroup.add(createTaillight(-1.4))
  carGroup.add(createTaillight(1.4))

  // 转向灯
  const turnSignalGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16)
  const turnSignalMaterial = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xffaa00,
    emissiveIntensity: 0.5,
    metalness: 0.5,
    roughness: 0.2
  })
  
  // 前转向灯
  const frontLeftTurn = new THREE.Mesh(turnSignalGeometry, turnSignalMaterial)
  frontLeftTurn.rotation.z = Math.PI / 2
  frontLeftTurn.position.set(-1.7, 0.9, 3.5)
  carGroup.add(frontLeftTurn)
  
  const frontRightTurn = frontLeftTurn.clone()
  frontRightTurn.position.x = 1.7
  carGroup.add(frontRightTurn)
  
  // 后转向灯
  const rearLeftTurn = new THREE.Mesh(turnSignalGeometry, turnSignalMaterial)
  rearLeftTurn.rotation.z = Math.PI / 2
  rearLeftTurn.position.set(-1.7, 0.9, -3.5)
  carGroup.add(rearLeftTurn)
  
  const rearRightTurn = rearLeftTurn.clone()
  rearRightTurn.position.x = 1.7
  carGroup.add(rearRightTurn)

  // 雾灯
  const fogLightGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16)
  const fogLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffaa,
    emissive: 0xffffaa,
    emissiveIntensity: 0.3,
    metalness: 0.5,
    roughness: 0.2
  })
  
  const leftFog = new THREE.Mesh(fogLightGeometry, fogLightMaterial)
  leftFog.rotation.x = Math.PI / 2
  leftFog.position.set(-1.2, 0.6, 3.9)
  carGroup.add(leftFog)
  
  const rightFog = leftFog.clone()
  rightFog.position.x = 1.2
  carGroup.add(rightFog)
}

// 创建地面 - 简洁版（无装饰）
const createGround = () => {
  // 不创建任何地面元素
  // 车辆将悬浮在纯黑色背景中
  console.log('✨ 使用纯净背景，无地面装饰')
}

// 创建环境贴图
const createEnvironment = () => {
  // 创建环境贴图 - 模拟工作室环境
  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()
  
  // 创建渐变环境贴图
  const envScene = new THREE.Scene()
  const envGeometry = new THREE.SphereGeometry(500, 60, 40)
  envGeometry.scale(-1, 1, 1)
  
  const envMaterial = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x222222) },
      bottomColor: { value: new THREE.Color(0x000000) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide
  })
  
  const envMesh = new THREE.Mesh(envGeometry, envMaterial)
  envScene.add(envMesh)
  
  const envCamera = new THREE.PerspectiveCamera()
  const envRT = pmremGenerator.fromScene(envScene)
  scene.environment = envRT.texture
  
  envScene.remove(envMesh)
  envGeometry.dispose()
  envMaterial.dispose()
  
  // 添加一些装饰性的光柱
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const radius = 25
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8, 16)
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.0
    })
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial)
    pillar.position.set(x, 4, z)
    pillar.castShadow = true
    scene.add(pillar)

    // 顶部灯光
    const light = new THREE.PointLight(0xffffff, 0.3, 20)
    light.position.set(x, 8, z)
    scene.add(light)
  }
}

// 切换颜色
const changeColor = (color) => {
  selectedColor.value = color.name
  
  const updateMaterialColor = (child) => {
    if (child.isMesh && child.material) {
      // 检查是否是车身材质
      const material = child.material
      
      // 如果有 clearcoat 属性（我们添加的高级材质）
      if (material.clearcoat !== undefined) {
        gsap.to(material.color, {
          r: new THREE.Color(color.color).r,
          g: new THREE.Color(color.color).g,
          b: new THREE.Color(color.color).b,
          duration: 0.8,
          ease: 'power2.inOut'
        })
        
        // 更新光泽颜色
        if (material.sheenColor) {
          gsap.to(material.sheenColor, {
            r: new THREE.Color(color.color).r * 0.5,
            g: new THREE.Color(color.color).g * 0.5,
            b: new THREE.Color(color.color).b * 0.5,
            duration: 0.8,
            ease: 'power2.inOut'
          })
        }
      }
      // 对于加载的模型，尝试识别车身材质
      else if (material.color) {
        // 检查材质名称或颜色饱和度
        const materialName = material.name?.toLowerCase() || ''
        const hsl = {}
        material.color.getHSL(hsl)
        
        // 如果是车身材质（名称包含关键词或颜色饱和度高）
        if (materialName.includes('paint') || 
            materialName.includes('body') || 
            materialName.includes('car') ||
            hsl.s > 0.3) {
          gsap.to(material.color, {
            r: new THREE.Color(color.color).r,
            g: new THREE.Color(color.color).g,
            b: new THREE.Color(color.color).b,
            duration: 0.8,
            ease: 'power2.inOut'
          })
        }
      }
    }
  }
  
  // 更新车身（支持几何体和加载的模型）
  if (carBody) {
    carBody.traverse(updateMaterialColor)
  }
  
  // 更新车门（如果存在）
  if (leftDoor) {
    leftDoor.traverse(updateMaterialColor)
  }
  if (rightDoor) {
    rightDoor.traverse(updateMaterialColor)
  }
  if (trunk) {
    trunk.traverse(updateMaterialColor)
  }

  // 更新车底氛围光颜色
  if (scene.userData.underGlow) {
    gsap.to(scene.userData.underGlow.color, {
      r: new THREE.Color(color.color).r,
      g: new THREE.Color(color.color).g,
      b: new THREE.Color(color.color).b,
      duration: 0.8,
      ease: 'power2.inOut'
    })
  }
}

// 切换车门
const toggleDoor = (side) => {
  // 检查车门是否存在（几何体模式）
  const door = side === 'left' ? leftDoor : rightDoor
  if (!door) {
    console.warn('车门不存在，可能使用的是加载的模型')
    return
  }
  
  const isOpen = doorsOpen.value[side]
  const targetRotation = isOpen ? 0 : (side === 'left' ? Math.PI / 3 : -Math.PI / 3)
  
  gsap.to(door.rotation, {
    y: targetRotation,
    duration: 1,
    ease: 'power2.inOut'
  })
  
  doorsOpen.value[side] = !isOpen
}

// 切换后备箱
const toggleTrunk = () => {
  // 检查后备箱是否存在（几何体模式）
  if (!trunk) {
    console.warn('后备箱不存在，可能使用的是加载的模型')
    return
  }
  
  const targetRotation = trunkOpen.value ? 0 : -Math.PI / 4
  
  gsap.to(trunk.rotation, {
    x: targetRotation,
    duration: 1,
    ease: 'power2.inOut'
  })
  
  trunkOpen.value = !trunkOpen.value
}

// 切换视角
const changeView = (view) => {
  currentView.value = view.name
  
  gsap.to(camera.position, {
    x: view.position.x,
    y: view.position.y,
    z: view.position.z,
    duration: 1.8,
    ease: 'power3.inOut'
  })
  
  gsap.to(controls.target, {
    x: 0,
    y: 1.2,
    z: 0,
    duration: 1.8,
    ease: 'power3.inOut'
  })
}

// 播放动画
const playAnimation = (animIndex) => {
  if (!mixer || !animations[animIndex]) return
  
  const clip = animations[animIndex]
  const action = mixer.clipAction(clip)
  
  // 如果已经在播放，则停止
  if (currentAnimations.value[animIndex].isPlaying) {
    action.stop()
    currentAnimations.value[animIndex].isPlaying = false
    console.log('⏸️ 停止动画:', clip.name)
  } else {
    // 播放动画
    action.reset()
    action.play()
    currentAnimations.value[animIndex].isPlaying = true
    console.log('▶️ 播放动画:', clip.name)
  }
}

// 停止所有动画
const stopAllAnimations = () => {
  if (!mixer) return
  
  mixer.stopAllAction()
  currentAnimations.value.forEach(anim => {
    anim.isPlaying = false
  })
  console.log('⏹️ 停止所有动画')
}

// 更新车辆运动
const updateCarMovement = () => {
  // 加速或减速
  if (isMouseDown.value) {
    // 按住鼠标，加速
    carSpeed.value = Math.min(carSpeed.value + acceleration, maxSpeed)
  } else {
    // 松开鼠标，减速
    carSpeed.value = Math.max(carSpeed.value - deceleration, 0)
  }

  // 更新位置
  if (carSpeed.value > 0) {
    // 车保持在原地
    // 注意：GLB 模型的轮胎旋转需要在 Blender 中预先制作动画
    // 这里我们只移动环境来制造运动的错觉
    
    // 移动隧道环境（向后移动，制造车前进的错觉）
    if (tunnelGroup) {
      tunnelGroup.position.z += carSpeed.value
      
      // 如果隧道移动太远，重置位置（无缝循环）
      if (tunnelGroup.position.z > tunnelLength) {
        tunnelGroup.position.z = 0
      }
    }

    // 移动地面网格（制造地面移动效果）
    if (roadLines) {
      roadLines.forEach(line => {
        line.position.z += carSpeed.value
        // 重置位置实现循环
        if (line.position.z > 50) {
          line.position.z = -50
        }
      })
    }
  }
}

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate)
  
  // 更新动画
  if (mixer) {
    const delta = clock.getDelta()
    mixer.update(delta)
  }

  // 更新车辆运动
  updateCarMovement()
  
  controls.update()
  renderer.render(scene, camera)
}

// 返回
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
  window.addEventListener('resize', onWindowResize)
  
  // 暴露一个全局函数，允许手动指定车轮
  window.setWheelsByName = (wheelNames) => {
    if (!carBody) {
      console.error('❌ 模型尚未加载')
      return
    }
    
    wheels = []
    wheelNames.forEach(name => {
      carBody.traverse((child) => {
        if (child.name === name) {
          wheels.push(child)
          console.log('✅ 手动添加车轮:', name)
        }
      })
    })
    
    console.log('🎡 手动设置车轮数量:', wheels.length)
  }
  
  console.log('💡 提示：如果车轮未自动识别，可以在控制台使用以下命令手动指定：')
  console.log('   window.setWheelsByName(["wheel_name_1", "wheel_name_2", "wheel_name_3", "wheel_name_4"])')
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
.car-showroom {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000000;
  overflow: hidden;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-weight: 600;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateX(-5px);
}

.back-button .icon {
  font-size: 20px;
}

.title-section {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 100;
}

.car-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0;
  color: #fff;
  text-shadow: 0 0 20px rgba(255,255,255,0.3);
  letter-spacing: 8px;
}

.car-subtitle {
  font-size: 18px;
  color: #aaa;
  margin: 5px 0 0 0;
  letter-spacing: 2px;
}

.color-selector {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  padding: 15px 30px;
  border-radius: 50px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.color-selector h3 {
  display: none;
}

.color-options {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,255,255,0.2);
  position: relative;
}

.color-option::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255,255,255,0.3), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.color-option:hover {
  transform: scale(1.15) translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.6),
              inset 0 1px 0 rgba(255,255,255,0.3);
}

.color-option:hover::before {
  opacity: 1;
}

.color-option.active {
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2),
              0 6px 20px rgba(0,0,0,0.6),
              inset 0 1px 0 rgba(255,255,255,0.4);
  transform: scale(1.2) translateY(-5px);
}

.checkmark {
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 0 3px rgba(0,0,0,0.5);
}

.feature-controls {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  gap: 15px;
}

.feature-controls button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.feature-controls button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.feature-controls button.active {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.view-controls {
  position: absolute;
  top: 150px;
  left: 30px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.view-controls button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 100px;
}

.view-controls button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.view-controls button.active {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.info-panel {
  position: absolute;
  bottom: 30px;
  right: 30px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.spec-label {
  font-size: 12px;
  color: #999;
  letter-spacing: 0.5px;
}

.spec-value {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 10px rgba(255,255,255,0.3);
}

.hint {
  position: absolute;
  bottom: 30px;
  left: 30px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  color: #aaa;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hint p {
  margin: 0;
}

.hint .drive-hint {
  margin-top: 5px;
  color: #00aaff;
  font-weight: 600;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* 速度表 */
.speedometer {
  position: absolute;
  top: 30px;
  right: 30px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px);
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #00aaff;
  box-shadow: 0 0 30px rgba(0, 170, 255, 0.5);
  text-align: center;
  min-width: 100px;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.speed-value {
  font-size: 48px;
  font-weight: 700;
  color: #00ffff;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
  line-height: 1;
  margin-bottom: 5px;
}

.speed-label {
  font-size: 14px;
  color: #aaa;
  margin-bottom: 10px;
}

.speed-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.speed-fill {
  height: 100%;
  background: linear-gradient(90deg, #00aaff, #00ffff);
  border-radius: 3px;
  transition: width 0.1s ease;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

/* 加载界面 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: #fff;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #00aaff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-content h2 {
  font-size: 24px;
  margin: 0 0 20px 0;
  font-weight: 600;
}

.progress-bar {
  width: 300px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin: 0 auto 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00aaff, #00ffff);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 170, 255, 0.5);
}

.progress-text {
  font-size: 18px;
  color: #00aaff;
  margin: 0;
  font-weight: 600;
}

/* 动画控制面板 */
.animation-controls {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 400px;
  max-width: 600px;
}

.animation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.animation-header h3 {
  margin: 0;
  font-size: 16px;
  color: #fff;
  font-weight: 600;
}

.stop-all-btn {
  background: rgba(255, 100, 100, 0.2);
  border: 1px solid rgba(255, 100, 100, 0.4);
  color: #ff6464;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.stop-all-btn:hover {
  background: rgba(255, 100, 100, 0.3);
  border-color: rgba(255, 100, 100, 0.6);
}

.animation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.animation-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.animation-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.animation-btn.active {
  background: rgba(0, 170, 255, 0.2);
  border-color: rgba(0, 170, 255, 0.5);
  box-shadow: 0 0 20px rgba(0, 170, 255, 0.3);
}

.anim-icon {
  font-size: 16px;
  min-width: 24px;
}

.anim-name {
  flex: 1;
  font-weight: 500;
}

.anim-duration {
  font-size: 12px;
  color: #00aaff;
  background: rgba(0, 170, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

/* 滚动条样式 */
.animation-list::-webkit-scrollbar {
  width: 6px;
}

.animation-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.animation-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.animation-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 无动画提示 */
.no-animation-hint {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  padding: 20px 30px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.no-animation-hint p {
  margin: 0;
  color: #aaa;
  font-size: 14px;
}

.no-animation-hint .hint-sub {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

/* 车轮调试按钮 */
.wheel-debug-btn {
  position: absolute;
  bottom: 30px;
  right: 250px;
  z-index: 100;
  background: rgba(255, 165, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 165, 0, 0.4);
  color: #ffaa00;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.wheel-debug-btn:hover {
  background: rgba(255, 165, 0, 0.3);
  border-color: rgba(255, 165, 0, 0.6);
  transform: translateY(-2px);
}

/* 车轮选择器 */
.wheel-selector {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 165, 0, 0.5);
  border-radius: 16px;
  width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.wheel-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 165, 0, 0.3);
}

.wheel-selector-header h3 {
  margin: 0;
  font-size: 18px;
  color: #ffaa00;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 100, 100, 0.2);
  border: 1px solid rgba(255, 100, 100, 0.4);
  color: #ff6464;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 100, 100, 0.4);
  transform: rotate(90deg);
}

.wheel-selector-hint {
  padding: 16px 24px;
  background: rgba(255, 165, 0, 0.1);
  border-bottom: 1px solid rgba(255, 165, 0, 0.2);
}

.wheel-selector-hint p {
  margin: 0;
  color: #ccc;
  font-size: 13px;
  line-height: 1.6;
}

.selected-count {
  margin-top: 8px !important;
  color: #ffaa00 !important;
  font-weight: 600;
  font-size: 14px !important;
}

.object-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  max-height: 400px;
}

.object-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.object-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 165, 0, 0.3);
  transform: translateX(5px);
}

.object-item.selected {
  background: rgba(255, 165, 0, 0.2);
  border-color: rgba(255, 165, 0, 0.6);
  box-shadow: 0 0 20px rgba(255, 165, 0, 0.3);
}

.object-type {
  font-size: 11px;
  color: #888;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 60px;
  text-align: center;
}

.object-name {
  flex: 1;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

.object-pos {
  font-size: 12px;
  color: #00aaff;
  background: rgba(0, 170, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 60px;
  text-align: center;
}

.wheel-selector-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 165, 0, 0.3);
}

.apply-btn, .auto-btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.apply-btn {
  background: rgba(0, 255, 0, 0.2);
  border: 1px solid rgba(0, 255, 0, 0.4);
  color: #00ff88;
}

.apply-btn:hover:not(:disabled) {
  background: rgba(0, 255, 0, 0.3);
  border-color: rgba(0, 255, 0, 0.6);
  transform: translateY(-2px);
}

.apply-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.auto-btn {
  background: rgba(0, 170, 255, 0.2);
  border: 1px solid rgba(0, 170, 255, 0.4);
  color: #00aaff;
}

.auto-btn:hover {
  background: rgba(0, 170, 255, 0.3);
  border-color: rgba(0, 170, 255, 0.6);
  transform: translateY(-2px);
}

/* 滚动条样式 */
.object-list::-webkit-scrollbar {
  width: 8px;
}

.object-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.object-list::-webkit-scrollbar-thumb {
  background: rgba(255, 165, 0, 0.3);
  border-radius: 4px;
}

.object-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 165, 0, 0.5);
}
</style>
