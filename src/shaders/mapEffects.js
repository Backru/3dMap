import * as THREE from 'three'

// 侧边特效 Shader
const sideVertexShader = `
  varying vec3 vPosition;
  #include <fog_pars_vertex>
  void main() {
    vPosition = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`

const sideFragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uEffectEnabled; // 0.0: 关闭, 1.0: 开启
  varying vec3 vPosition;
  #include <fog_pars_fragment>
  
  void main() {
    // ExtrudeGeometry 的挤压方向是 Z 轴（旋转前）
    float z = vPosition.z;
    
    // 基础颜色
    vec3 color = uColor * (0.5 + z * 1.5);
    
    // 只有开启特效时才显示扫描线
    if (uEffectEnabled > 0.5) {
      float scanSpeed = 0.5; // 降低速度
      float scanZ = mod(uTime * scanSpeed, 3.0); // 范围匹配 depth: 3
      float scanWidth = 0.1; // 加宽扫描线
      
      if (z > scanZ && z < scanZ + scanWidth) {
        color += vec3(0.6, 0.8, 1.0) * 2.0;
      }
    }
    
    gl_FragColor = vec4(color, 1.0);
    #include <fog_fragment>
  }
`

// 柱状图 Shader
const barVertexShader = `
  varying vec3 vPosition;
  varying vec2 vUv;
  #include <fog_pars_vertex>
  void main() {
    vUv = uv;
    vPosition = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`

const barFragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  #include <fog_pars_fragment>
  
  void main() {
    // 垂直渐变
    float strength = vUv.y;
    
    // 呼吸效果
    float pulse = 0.8 + 0.2 * sin(uTime * 3.0);
    
    vec3 color = uColor * pulse;
    
    // 顶部高亮
    if (vUv.y > 0.95) {
      color += vec3(0.5);
    }
    
    gl_FragColor = vec4(color, 0.6 + 0.4 * strength); // 底部半透明，顶部不透明
    #include <fog_fragment>
  }
`

// 地面波纹 Shader
const groundVertexShader = `
  varying vec2 vUv;
  #include <fog_pars_vertex>
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`

const groundFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  #include <fog_pars_fragment>
  
  void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);
    
    // 扩散波纹
    float wave = 0.0;
    float speed = 0.2; // 降低速度
    for(float i=0.0; i<3.0; i++) {
      float t = uTime * speed - i * 0.3;
      float r = mod(t, 1.0); // 0 to 1
      float width = 0.02;
      if(dist > r && dist < r + width) {
        float alpha = 1.0 - r; // 越远越淡
        wave += alpha * 0.5;
      }
    }
    
    vec3 color = vec3(0.0, 0.5, 1.0);
    gl_FragColor = vec4(color, wave);
    #include <fog_fragment>
  }
`

// Simplex 2D Noise
const noiseFunctions = `
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`

const terrainVertexShader = `
  varying vec3 vPosition;
  varying vec2 vUv;
  #include <fog_pars_vertex>
  void main() {
    vUv = uv;
    vPosition = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`

const terrainFragmentShader = `
  uniform float uTime;
  varying vec3 vPosition;
  #include <fog_pars_fragment>
  
  ${noiseFunctions}

  void main() {
    // 坐标归一化处理 (粗略估计中国地图的坐标范围)
    // vPosition 是相对于中心点 (104, 36) 的偏移
    // x 范围约 -45(西) 到 +45(东)
    // y 范围约 -25(南) 到 +25(北)
    // 注意：在 Shape 中，y 对应纬度。在 Shader 中 vPosition.y 就是纬度方向的偏移
    
    float px = vPosition.x;
    float py = vPosition.y;
    
    // --- 地理区域掩码 (Masks) ---
    
    // 1. 青藏高原区域 (大致在西南部)
    // x < -10, y < 5 且 y > -15
    float plateauMask = smoothstep(0.0, -15.0, px) * smoothstep(-20.0, 10.0, py);
    
    // 2. 西北荒漠区域 (大致在西北部)
    // x < -5, y > 5
    float desertMask = smoothstep(5.0, -15.0, px) * smoothstep(0.0, 10.0, py);
    
    // 3. 东南平原与丘陵 (默认背景)
    
    // --- 噪声生成细节 ---
    float scale = 0.3; // 增加噪声频率，更细碎
    float detail = snoise(vPosition.xy * scale);
    detail += snoise(vPosition.xy * scale * 2.0) * 0.5;
    detail += snoise(vPosition.xy * scale * 4.0) * 0.25;
    detail += abs(snoise(vPosition.xy * scale * 8.0)) * 0.1; // 增加一些锐利的高频细节
    
    // --- 颜色定义 (写实风格) ---
    
    // 绿色系 (平原/森林) - 低饱和度
    vec3 colorPlains = vec3(0.22, 0.35, 0.18); // 深绿
    vec3 colorForest = vec3(0.15, 0.28, 0.15); // 更深绿
    
    // 黄色系 (荒漠/戈壁)
    vec3 colorDesert = vec3(0.55, 0.48, 0.35); // 土黄
    vec3 colorSand = vec3(0.65, 0.58, 0.45);   // 浅沙色
    
    // 褐色系 (高原/山脉)
    vec3 colorMountain = vec3(0.35, 0.30, 0.25); // 灰褐
    vec3 colorRock = vec3(0.25, 0.22, 0.20);     // 深岩石
    
    // 白色 (雪)
    vec3 colorSnow = vec3(0.95, 0.95, 0.98);

    // --- 混合逻辑 ---
    
    vec3 finalColor = colorPlains;
    
    // 1. 基础纹理：混合深浅绿
    finalColor = mix(colorPlains, colorForest, smoothstep(-0.5, 0.5, detail));
    
    // 2. 应用西北荒漠
    vec3 desertColor = mix(colorDesert, colorSand, detail * 0.5 + 0.5);
    finalColor = mix(finalColor, desertColor, desertMask * 0.9); // 90% 覆盖
    
    // 3. 应用青藏高原 (海拔极高)
    // 高原本身有山脉起伏
    float mountainHeight = detail * 0.8 + plateauMask * 1.5; // 高原区域整体抬高
    
    vec3 mountainColor = mix(colorMountain, colorRock, smoothstep(0.0, 1.0, detail));
    
    // 雪线逻辑
    float snowLine = 0.8; // 噪声值大于此值出现雪
    // 在高原区域雪线降低
    float localSnowLine = snowLine - plateauMask * 0.3; 
    
    vec3 highAltitudeColor = mix(mountainColor, colorSnow, smoothstep(localSnowLine, localSnowLine + 0.1, detail));
    
    // 将高原山脉叠加到主色上
    finalColor = mix(finalColor, highAltitudeColor, plateauMask);
    
    // 4. 增加局部地形起伏的阴影感 (伪光照)
    // 计算简单的法线效果或对比度
    float shade = snoise(vPosition.xy * scale * 10.0 + vec2(1.0, 1.0)); // 偏移一点作为光源方向
    finalColor *= (0.85 + shade * 0.15); // 增加颗粒感
    
    gl_FragColor = vec4(finalColor, 1.0);
    #include <fog_fragment>
  }
`

// 创建侧边材质
export const createSideMaterial = (color) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      uEffectEnabled: { value: 1.0 },
      ...THREE.UniformsLib.fog // 重要：合并 fog uniforms
    },
    vertexShader: sideVertexShader,
    fragmentShader: sideFragmentShader,
    fog: true // 开启 fog
  })
}

// 创建地形材质
export const createTerrainMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      ...THREE.UniformsLib.fog
    },
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    fog: true
  })
}

// 创建柱状图材质
export const createBarMaterial = (color) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      ...THREE.UniformsLib.fog
    },
    vertexShader: barVertexShader,
    fragmentShader: barFragmentShader,
    transparent: true,
    depthWrite: false,
    fog: true
  })
}

// 齿轮光圈 Shader
const gearVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const gearFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 center = vec2(0.5);
    vec2 pos = vUv - center;
    float r = length(pos) * 2.0; // 归一化半径 0~1 (对应平面中心到边缘)
    float a = atan(pos.y, pos.x);

    // 旋转动画
    float angle = a - uTime * 0.2; // 逆时针慢速旋转

    // 齿轮形状
    // 基础半径 0.85, 波动幅度 0.05, 16个齿
    float gearShape = 0.85 + 0.05 * cos(angle * 16.0);
    
    // 绘制圆环
    // 外圈：r < gearShape
    // 内圈：r > 0.7
    float outer = smoothstep(gearShape + 0.01, gearShape, r);
    float inner = smoothstep(0.7, 0.71, r);
    
    float ring = outer * inner;
    
    // 内部装饰圈
    float deco = smoothstep(0.66, 0.65, r) * smoothstep(0.64, 0.65, r);
    
    // 组合并添加呼吸效果
    float alpha = (ring + deco) * (0.8 + 0.2 * sin(uTime));
    
    vec3 color = uColor * (1.0 + ring); // 边缘更亮

    gl_FragColor = vec4(color, alpha);
  }
`

// 创建地面材质
export const createGroundMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      ...THREE.UniformsLib.fog
    },
    vertexShader: groundVertexShader,
    fragmentShader: groundFragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: true
  })
}

// 创建齿轮材质
export const createGearMaterial = (color) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) }
    },
    vertexShader: gearVertexShader,
    fragmentShader: gearFragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending // 发光叠加效果
  })
}
