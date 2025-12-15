# 🎬 GLB 动画完全指南

## ✅ 已完成的功能

现在你的汽车展厅**完全支持 GLB 动画**了！

### 新增功能：
1. ✅ 自动检测模型中的动画
2. ✅ 动画控制面板
3. ✅ 播放/暂停动画
4. ✅ 显示动画名称和时长
5. ✅ 停止所有动画按钮
6. ✅ 动画混合器（AnimationMixer）
7. ✅ 实时动画更新

---

## 🎮 如何使用

### 如果模型有动画：
1. 加载模型后，会自动检测动画
2. 底部会显示**动画控制面板**
3. 点击动画按钮即可播放
4. 再次点击可以暂停
5. 点击"停止所有"可以停止所有动画

### 如果模型没有动画：
- 会显示原来的车门/后备箱控制按钮
- 使用几何体创建的动画效果

---

## 🚗 汽车模型常见的动画

### 1. **车门动画**
- 动画名称通常是：
  - `Door_Left_Open`
  - `Door_Right_Open`
  - `DoorAnimation`
  - `LeftDoor`

### 2. **后备箱动画**
- 动画名称通常是：
  - `Trunk_Open`
  - `TrunkAnimation`
  - `Boot`

### 3. **引擎盖动画**
- 动画名称通常是：
  - `Hood_Open`
  - `HoodAnimation`
  - `Bonnet`

### 4. **车轮旋转**
- 动画名称通常是：
  - `Wheel_Rotation`
  - `WheelSpin`
  - `Wheels`

### 5. **整车展示**
- 动画名称通常是：
  - `Turntable`
  - `Showcase`
  - `Rotation`

---

## 📦 如何获取带动画的汽车模型

### 方案1：Sketchfab（推荐）⭐⭐⭐⭐⭐

**搜索技巧：**
```
关键词：
- "car animated"
- "car rigged"
- "car with animations"
- "animated vehicle"
```

**筛选条件：**
- ✅ Downloadable
- ✅ Free
- ✅ Animated（重要！）
- 格式：glTF

**推荐搜索链接：**
- 🔗 https://sketchfab.com/search?features=downloadable&features=animated&q=car&sort_by=-likeCount&type=models

**优质带动画的免费模型示例：**
1. 搜索 "low poly car animated"
2. 搜索 "rigged car free"
3. 搜索 "car door animation"

---

### 方案2：Mixamo（角色动画）

虽然主要是角色，但也有一些车辆：
- 🔗 https://www.mixamo.com/

---

### 方案3：使用 Blender 自己制作动画

如果你有一个静态模型，可以在 Blender 中添加动画：

**步骤：**
1. 导入模型到 Blender
2. 选择车门等部件
3. 添加关键帧动画
4. 导出为 GLB（勾选 "Include Animations"）

---

## 🎨 动画类型详解

### 1. **关键帧动画** (最常见)
```
时间轴：
0s: 车门关闭（旋转角度 0°）
1s: 车门打开（旋转角度 60°）
```

**特点：**
- 简单直接
- 适合车门、后备箱等
- 文件小

### 2. **骨骼动画** (复杂模型)
```
骨骼结构：
Root
├── Body
├── Door_Left (骨骼)
├── Door_Right (骨骼)
└── Trunk (骨骼)
```

**特点：**
- 更灵活
- 可以混合多个动画
- 适合复杂机械

### 3. **变形动画** (特殊效果)
```
变形目标：
- 车身变形
- 轮胎压扁
- 碰撞变形
```

**特点：**
- 适合特效
- 文件较大

---

## 💻 代码工作原理

### 1. **加载模型时检测动画**
```javascript
if (gltf.animations && gltf.animations.length > 0) {
  console.log('发现动画！', gltf.animations.length, '个')
  animations = gltf.animations
  mixer = new THREE.AnimationMixer(carModel)
}
```

### 2. **播放动画**
```javascript
const clip = animations[animIndex]
const action = mixer.clipAction(clip)
action.play()
```

### 3. **更新动画**
```javascript
// 在动画循环中
if (mixer) {
  const delta = clock.getDelta()
  mixer.update(delta)
}
```

---

## 🎯 测试动画

### 测试模型1：带动画的玩具车
```javascript
// 在 CarShowroom.vue 中修改：
const modelPath = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RiggedSimple/glTF-Binary/RiggedSimple.glb'
```

### 测试模型2：带动画的机器人
```javascript
const modelPath = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF-Binary/CesiumMan.glb'
```

---

## 🔧 高级功能

### 1. **循环播放**
```javascript
action.setLoop(THREE.LoopRepeat)  // 循环
action.setLoop(THREE.LoopOnce)    // 播放一次
```

### 2. **播放速度**
```javascript
action.timeScale = 2.0  // 2倍速
action.timeScale = 0.5  // 0.5倍速
```

### 3. **混合多个动画**
```javascript
const action1 = mixer.clipAction(clip1)
const action2 = mixer.clipAction(clip2)
action1.play()
action2.play()
```

### 4. **动画完成回调**
```javascript
mixer.addEventListener('finished', (e) => {
  console.log('动画播放完成！')
})
```

---

## 📝 实际案例

### 案例1：汽车展示动画

**模型包含的动画：**
1. `Showcase` - 整车旋转展示（10秒）
2. `Door_Left` - 左门打开（2秒）
3. `Door_Right` - 右门打开（2秒）
4. `Trunk` - 后备箱打开（2秒）

**使用方式：**
1. 加载模型
2. 点击 "Showcase" 开始旋转展示
3. 点击 "Door_Left" 打开左门
4. 点击 "Trunk" 打开后备箱

---

### 案例2：产品演示

**动画序列：**
```
1. 整车展示（自动旋转）
2. 打开所有车门
3. 展示内饰
4. 关闭车门
5. 展示外观细节
```

**实现方式：**
可以按顺序播放动画，或使用动画混合。

---

## ⚠️ 常见问题

### Q: 模型有动画但不显示控制面板？
**A:** 
1. 检查浏览器控制台
2. 确认 `gltf.animations` 不为空
3. 检查动画是否正确导出

### Q: 动画播放不流畅？
**A:** 
1. 检查帧率（FPS）
2. 降低模型复杂度
3. 检查动画关键帧数量

### Q: 动画播放速度不对？
**A:** 
```javascript
action.timeScale = 1.0  // 调整这个值
```

### Q: 如何让动画循环播放？
**A:** 
在 `playAnimation` 函数中添加：
```javascript
action.setLoop(THREE.LoopRepeat)
```

### Q: 如何同时播放多个动画？
**A:** 
点击多个动画按钮即可，它们会同时播放。

---

## 🎨 推荐的带动画汽车模型

### 1. **低面数动画车**
- 搜索：`low poly car animated free`
- 特点：文件小，加载快
- 适合：Web展示

### 2. **写实动画车**
- 搜索：`realistic car rigged free`
- 特点：细节丰富
- 适合：产品展示

### 3. **卡通动画车**
- 搜索：`cartoon car animated free`
- 特点：风格化，有趣
- 适合：游戏、儿童产品

---

## 📊 动画性能优化

### 1. **减少关键帧**
- 只保留必要的关键帧
- 使用插值减少数据量

### 2. **使用 Draco 压缩**
- 导出时启用 Draco 压缩
- 可以减少 50-90% 文件大小

### 3. **限制同时播放的动画数量**
- 不要同时播放太多动画
- 停止不需要的动画

---

## 🚀 下一步

1. **测试当前的在线模型** - 看看是否有动画
2. **从 Sketchfab 下载带动画的模型** - 搜索 "car animated"
3. **放入 public/models/car.glb**
4. **刷新页面查看动画控制面板**
5. **点击动画按钮播放**

---

## 💡 提示

**如何判断模型是否有动画？**

在 Sketchfab 上：
- 查看模型预览，如果有动画会自动播放
- 查看模型描述，通常会说明
- 下载前可以在网页上预览

**如何在 Blender 中查看动画？**
1. 导入 GLB 文件
2. 切换到 "Animation" 工作区
3. 查看时间轴是否有关键帧

---

## 🎉 总结

现在你的汽车展厅：
- ✅ 完全支持 GLB 动画
- ✅ 自动检测和显示动画
- ✅ 可以播放/暂停动画
- ✅ 显示动画信息
- ✅ 支持多个动画同时播放
- ✅ 有漂亮的动画控制面板

**刷新页面试试吧！** 🚗✨

如果你找到了带动画的模型但不知道如何使用，随时告诉我！
