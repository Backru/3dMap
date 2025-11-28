import provinceData from '../data/province.json'

// GeoJSON数据加载工具
export async function loadChinaGeoJSON() {
  // 由于在线接口 403，改为直接使用本地数据
  console.log('使用本地 province.json 数据')
  return provinceData
}

export const loadProvinceGeoJSON = async (adcode) => {
  try {
    // 优先加载本地数据
    // Vite 支持动态导入
    const module = await import(`../data/provinces/${adcode}.json`)
    return module.default
  } catch (error) {
    console.warn(`本地未找到 ${adcode} 数据，尝试在线加载...`, error)
    try {
      // 使用阿里云 DataV 的 GeoJSON 服务
      const url = `https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=${adcode}_full`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      return data
    } catch (onlineError) {
      console.error(`Error loading province ${adcode} GeoJSON:`, onlineError)
      return null
    }
  }
}

export const loadCityGeoJSON = async (adcode) => {
  try {
    // 优先加载本地数据
    const module = await import(`../data/cities/${adcode}.json`)
    return module.default
  } catch (error) {
    console.warn(`本地未找到市级 ${adcode} 数据，尝试在线加载...`)
    try {
      const url = `https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=${adcode}_full`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      return data
    } catch (onlineError) {
      console.error(`Error loading city ${adcode} GeoJSON:`, onlineError)
      return null
    }
  }
}
