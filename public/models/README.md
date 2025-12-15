# 🚗 汽车模型使用指南

## 📦 如何获取免费汽车模型

### 方案1：Sketchfab（推荐）⭐

**网址：** https://sketchfab.com/

**步骤：**
1. 访问 Sketchfab
2. 搜索 "car" 或 "vehicle"
3. 在左侧筛选器中选择：
   - ✅ Downloadable（可下载）
   - ✅ Free（免费）
   - 格式选择：glTF
4. 找到喜欢的模型，点击 Download
5. 选择 "glTF" 格式下载

**推荐搜索关键词：**
- `sports car free`
- `electric car free`
- `sedan car free`
- `low poly car`（低面数，性能更好）

**优质免费模型示例：**
- 🔗 https://sketchfab.com/3d-models/car-free-download
- 搜索 "Porsche 911" + Free
- 搜索 "Tesla Model 3" + Free

---

### 方案2：Poly Pizza

**网址：** https://poly.pizza/

**特点：**
- 完全免费
- 无需注册
- 质量较低，但适合测试

**步骤：**
1. 访问 poly.pizza
2. 搜索 "car"
3. 点击模型，下载 GLB 格式

---

### 方案3：Quaternius（完全免费）

**网址：** https://quaternius.com/

**特点：**
- 100% 免费
- CC0 许可（可商用）
- 低面数风格

**步骤：**
1. 访问网站
2. 找到 "Ultimate Vehicles Pack"
3. 下载并解压
4. 使用 Blender 导出为 GLB

---

### 方案4：使用我提供的测试模型

我可以帮你创建一个简单的测试模型配置。

---

## 📁 文件放置位置

将下载的模型文件放在：

```
public/
  └── models/
      └── car.glb  ← 放这里
```

**支持的格式：**
- ✅ `.glb`（推荐，单文件）
- ✅ `.gltf`（需要额外的纹理文件）

---

## 🔧 模型要求

**推荐规格：**
- 文件大小：< 50MB
- 面数：< 100K 三角面
- 格式：GLB（压缩）
- 包含材质和纹理

**如果模型太大：**
可以使用在线工具压缩：
- https://gltf.report/ （查看模型信息）
- https://glb.ee/ （在线压缩）

---

## 🎨 模型颜色修改

代码会自动识别车漆材质并应用颜色选择器。

如果颜色不变，可能需要在 Blender 中：
1. 选择车身材质
2. 确保材质名称包含 "paint" 或 "body"
3. 重新导出

---

## 🚀 快速测试

**方案A：使用 Sketchfab 的免费模型**

1. 访问：https://sketchfab.com/3d-models/low-poly-car-40967deb7d8d4c6daa7398e0d98b7c32
2. 点击 Download → glTF
3. 解压后找到 `.glb` 文件
4. 重命名为 `car.glb`
5. 放入 `public/models/` 文件夹
6. 刷新页面

**方案B：使用简单的测试模型**

我可以帮你创建一个简单的测试配置，使用在线 CDN 的模型。

---

## ⚠️ 常见问题

**Q: 模型不显示？**
- 检查浏览器控制台是否有错误
- 确认文件路径正确：`public/models/car.glb`
- 检查文件大小是否过大

**Q: 模型太大或太小？**
- 代码会自动缩放，但可能需要调整
- 在 `setupLoadedModel` 函数中修改 `scale` 值

**Q: 模型没有颜色？**
- 确保模型包含材质
- 检查模型是否有纹理贴图

**Q: 加载很慢？**
- 使用 GLB 格式（已压缩）
- 使用在线工具压缩模型
- 考虑使用低面数模型

---

## 📝 推荐的免费汽车模型

### 1. 低面数跑车
- 🔗 搜索 "low poly sports car" on Sketchfab
- 文件小，加载快
- 适合展示

### 2. 现代电动车
- 🔗 搜索 "electric vehicle" on Sketchfab
- 风格现代
- 类似特斯拉

### 3. 经典轿车
- 🔗 搜索 "sedan car" on Sketchfab
- 通用造型
- 适合商业展示

---

## 🎯 下一步

1. 从 Sketchfab 下载一个免费模型
2. 放入 `public/models/car.glb`
3. 刷新页面查看效果
4. 如果需要调整，修改 `setupLoadedModel` 函数

---

## 💡 提示

如果你找到了好的模型但不知道如何使用，可以：
1. 告诉我模型的 URL
2. 我帮你调整代码以适配该模型
3. 或者我帮你创建一个使用在线 CDN 模型的版本

---

**需要帮助？** 
- 告诉我你下载了哪个模型
- 或者让我帮你配置一个在线测试模型
