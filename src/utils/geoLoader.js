import { chinaGeoJSON } from '../data/chinaGeoJSON'

// GeoJSON数据加载工具
export async function loadChinaGeoJSON() {
  try {
    // 从阿里云DataV获取中国省份数据
    // 使用 fetch 加载
    const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const geoData = await response.json();
    console.log('在线GeoJSON数据加载成功');
    return geoData;
  } catch (error) {
    console.warn('无法加载在线GeoJSON数据，使用本地数据', error);
    // 回退到本地简化数据
    return chinaGeoJSON;
  }
}

export const loadProvinceGeoJSON = async (adcode) => {
  try {
    // 使用阿里云 DataV 的 GeoJSON 服务 https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=440000_full
    const url = `https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=${adcode}_full`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Network response was not ok')
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error loading province ${adcode} GeoJSON:`, error)
    return null
  }
}
