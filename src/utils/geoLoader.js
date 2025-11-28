import provinceData from '../data/province.json'

// GeoJSON数据加载工具
export async function loadChinaGeoJSON() {
  // 由于在线接口 403，改为直接使用本地数据
  console.log('使用本地 province.json 数据')
  return provinceData
}

export const loadProvinceGeoJSON = async (adcode) => {
   try {
      // 使用阿里云 DataV 的 GeoJSON 服务
      const url = `/cities/${adcode}.json`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      return data
    } catch (onlineError) {
      console.error(`Error loading province ${adcode} GeoJSON:`, onlineError)
      return null
    }
}

export const loadCityGeoJSON = async (adcode) => {
try {
      // 使用相对路径，触发 vite.config.js 中的代理
      const url = `/cities/${adcode}.json`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      return data
    } catch (onlineError) {
      console.error(`Error loading city ${adcode} GeoJSON:`, onlineError)
      return null
    }
}
