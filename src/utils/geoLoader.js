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
    // 注意：如果接口 403，此处会失败。
    // 如果有本地数据，建议替换为 import dynamic 或 fetch 本地文件
    const url = `https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=${adcode}_full`
    const response = await fetch(url,{referrerPolicy: 'no-referrer'})
    if (!response.ok) throw new Error('Network response was not ok')
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error loading province ${adcode} GeoJSON:`, error)
    // 这里暂时没有备用数据，只能返回 null
    return null
  }
}
