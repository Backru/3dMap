// 模拟的省市区统计数据
const staticData = {
  '北京市': { value: 100, color: 0xff0000 },
  '上海市': { value: 90, color: 0x00ff00 },
  '深圳市': { value: 85, color: 0x0000ff },
  '成都市': { value: 80, color: 0xff00ff },
  '武汉市': { value: 75, color: 0xffff00 },
  '西安市': { value: 70, color: 0x00ffff },
  '广州市': { value: 88, color: 0xffaa00 },
  '杭州市': { value: 82, color: 0x00aaff },
  '南京市': { value: 78, color: 0xaa00ff },
  '重庆市': { value: 85, color: 0xff00aa }
}

// 获取颜色的辅助函数
const getRandomColor = () => {
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff, 0xff00ff, 0xffaa00, 0x00aaff]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 获取柱状图数据
// 如果有静态数据则返回，否则生成随机数据
export const getBarData = (name) => {
  // 尝试匹配（支持模糊匹配，如 "北京" -> "北京市"）
  const key = Object.keys(staticData).find(k => k.includes(name) || name.includes(k))
  
  if (key) {
    return staticData[key]
  }
  
  // 生成随机数据
  return {
    value: Math.floor(Math.random() * 60) + 20, // 20-80
    color: getRandomColor()
  }
}
