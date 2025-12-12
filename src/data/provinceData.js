// 生成随机数据的辅助函数
const generateRandomData = (name, level = 'province') => {
  const baseGDP = level === 'province' ? Math.random() * 5 + 0.5 : level === 'city' ? Math.random() * 0.5 + 0.1 : Math.random() * 0.05 + 0.01
  const basePopulation = level === 'province' ? Math.random() * 5000 + 500 : level === 'city' ? Math.random() * 500 + 50 : Math.random() * 50 + 10
  const growth = (Math.random() * 8 + 1).toFixed(1)
  const temp = Math.floor(Math.random() * 30 + 5)
  const aqiValue = Math.floor(Math.random() * 100 + 30)
  const aqiLevel = aqiValue < 50 ? '优' : aqiValue < 100 ? '良' : '轻度污染'
  
  const industries = ['制造业', '服务业', '农业', '旅游业', '科技产业', '商贸', '物流', '文化产业']
  const industry = industries[Math.floor(Math.random() * industries.length)]
  
  return {
    gdp: level === 'province' ? `${baseGDP.toFixed(2)}万亿` : level === 'city' ? `${(baseGDP * 1000).toFixed(0)}亿` : `${(baseGDP * 100).toFixed(0)}亿`,
    population: level === 'province' ? `${basePopulation.toFixed(0)}万` : level === 'city' ? `${basePopulation.toFixed(0)}万` : `${basePopulation.toFixed(0)}万`,
    growth: `+${growth}%`,
    industry: industry,
    temperature: `${temp}°C`,
    aqi: `${aqiLevel} ${aqiValue}`
  }
}

// 省份核心数据模拟
export const getProvinceData = (provinceName) => {
  const dataMap = {
    '北京市': {
      gdp: '4.16万亿',
      population: '2189万',
      growth: '+5.2%',
      industry: '服务业',
      temperature: '15°C',
      aqi: '良 68'
    },
    '上海市': {
      gdp: '4.32万亿',
      population: '2487万',
      growth: '+5.5%',
      industry: '金融业',
      temperature: '18°C',
      aqi: '优 45'
    },
    '广东省': {
      gdp: '12.91万亿',
      population: '1.27亿',
      growth: '+4.8%',
      industry: '制造业',
      temperature: '25°C',
      aqi: '良 72'
    },
    '江苏省': {
      gdp: '11.64万亿',
      population: '8505万',
      growth: '+5.8%',
      industry: '制造业',
      temperature: '16°C',
      aqi: '良 65'
    },
    '浙江省': {
      gdp: '7.35万亿',
      population: '6577万',
      growth: '+6.0%',
      industry: '数字经济',
      temperature: '17°C',
      aqi: '优 52'
    },
    '山东省': {
      gdp: '8.31万亿',
      population: '1.01亿',
      growth: '+5.5%',
      industry: '重工业',
      temperature: '14°C',
      aqi: '良 78'
    },
    '河南省': {
      gdp: '5.88万亿',
      population: '9872万',
      growth: '+4.3%',
      industry: '农业',
      temperature: '15°C',
      aqi: '良 82'
    },
    '四川省': {
      gdp: '5.38万亿',
      population: '8372万',
      growth: '+4.2%',
      industry: '电子信息',
      temperature: '16°C',
      aqi: '优 58'
    },
    '湖北省': {
      gdp: '5.01万亿',
      population: '5844万',
      growth: '+5.3%',
      industry: '汽车制造',
      temperature: '17°C',
      aqi: '良 70'
    },
    '湖南省': {
      gdp: '4.60万亿',
      population: '6622万',
      growth: '+4.5%',
      industry: '工程机械',
      temperature: '18°C',
      aqi: '良 75'
    },
    '福建省': {
      gdp: '4.88万亿',
      population: '4188万',
      growth: '+5.0%',
      industry: '电子信息',
      temperature: '20°C',
      aqi: '优 48'
    },
    '安徽省': {
      gdp: '4.29万亿',
      population: '6127万',
      growth: '+5.2%',
      industry: '新能源',
      temperature: '16°C',
      aqi: '良 68'
    },
    '河北省': {
      gdp: '3.98万亿',
      population: '7448万',
      growth: '+3.8%',
      industry: '钢铁',
      temperature: '13°C',
      aqi: '良 85'
    },
    '陕西省': {
      gdp: '2.98万亿',
      population: '3956万',
      growth: '+4.3%',
      industry: '能源化工',
      temperature: '14°C',
      aqi: '良 72'
    },
    '江西省': {
      gdp: '2.75万亿',
      population: '4518万',
      growth: '+4.7%',
      industry: '有色金属',
      temperature: '18°C',
      aqi: '优 55'
    },
    '辽宁省': {
      gdp: '2.75万亿',
      population: '4229万',
      growth: '+3.0%',
      industry: '装备制造',
      temperature: '10°C',
      aqi: '良 78'
    },
    '重庆市': {
      gdp: '2.73万亿',
      population: '3213万',
      growth: '+6.1%',
      industry: '汽车制造',
      temperature: '17°C',
      aqi: '良 68'
    },
    '云南省': {
      gdp: '2.72万亿',
      population: '4721万',
      growth: '+4.4%',
      industry: '旅游业',
      temperature: '16°C',
      aqi: '优 42'
    },
    '广西壮族自治区': {
      gdp: '2.52万亿',
      population: '5037万',
      growth: '+4.1%',
      industry: '有色金属',
      temperature: '22°C',
      aqi: '优 50'
    },
    '山西省': {
      gdp: '2.19万亿',
      population: '3481万',
      growth: '+4.0%',
      industry: '煤炭',
      temperature: '12°C',
      aqi: '良 88'
    },
    '内蒙古自治区': {
      gdp: '2.16万亿',
      population: '2400万',
      growth: '+4.2%',
      industry: '能源',
      temperature: '8°C',
      aqi: '良 75'
    },
    '贵州省': {
      gdp: '1.92万亿',
      population: '3852万',
      growth: '+4.8%',
      industry: '大数据',
      temperature: '15°C',
      aqi: '优 45'
    },
    '新疆维吾尔自治区': {
      gdp: '1.60万亿',
      population: '2589万',
      growth: '+5.1%',
      industry: '石油化工',
      temperature: '12°C',
      aqi: '良 70'
    },
    '天津市': {
      gdp: '1.57万亿',
      population: '1363万',
      growth: '+4.0%',
      industry: '先进制造',
      temperature: '14°C',
      aqi: '良 80'
    },
    '黑龙江省': {
      gdp: '1.50万亿',
      population: '3099万',
      growth: '+2.6%',
      industry: '农业',
      temperature: '5°C',
      aqi: '优 58'
    },
    '吉林省': {
      gdp: '1.29万亿',
      population: '2347万',
      growth: '+3.2%',
      industry: '汽车',
      temperature: '8°C',
      aqi: '良 72'
    },
    '甘肃省': {
      gdp: '1.02万亿',
      population: '2492万',
      growth: '+4.5%',
      industry: '有色金属',
      temperature: '11°C',
      aqi: '良 68'
    },
    '海南省': {
      gdp: '0.64万亿',
      population: '1008万',
      growth: '+9.2%',
      industry: '旅游业',
      temperature: '26°C',
      aqi: '优 35'
    },
    '宁夏回族自治区': {
      gdp: '0.47万亿',
      population: '725万',
      growth: '+5.3%',
      industry: '能源化工',
      temperature: '10°C',
      aqi: '良 75'
    },
    '青海省': {
      gdp: '0.33万亿',
      population: '595万',
      growth: '+2.3%',
      industry: '清洁能源',
      temperature: '6°C',
      aqi: '优 40'
    },
    '西藏自治区': {
      gdp: '0.21万亿',
      population: '364万',
      growth: '+9.5%',
      industry: '旅游业',
      temperature: '8°C',
      aqi: '优 30'
    },
    '香港特别行政区': {
      gdp: '2.86万亿',
      population: '741万',
      growth: '+3.2%',
      industry: '金融服务',
      temperature: '24°C',
      aqi: '良 62'
    },
    '澳门特别行政区': {
      gdp: '0.36万亿',
      population: '68万',
      growth: '+80.5%',
      industry: '博彩旅游',
      temperature: '23°C',
      aqi: '良 58'
    },
    '台湾省': {
      gdp: '4.20万亿',
      population: '2345万',
      growth: '+2.9%',
      industry: '半导体',
      temperature: '22°C',
      aqi: '良 65'
    }
  }
  
  // 如果找不到数据，生成随机数据
  return dataMap[provinceName] || generateRandomData(provinceName, 'province')
}

// 城市核心数据模拟
export const getCityData = (cityName) => {
  // 部分主要城市的真实数据
  const cityDataMap = {
    // 北京市辖区
    '东城区': { gdp: '3200亿', population: '79万', growth: '+5.5%', industry: '金融服务', temperature: '15°C', aqi: '良 65' },
    '西城区': { gdp: '5100亿', population: '110万', growth: '+5.8%', industry: '金融服务', temperature: '15°C', aqi: '良 68' },
    '朝阳区': { gdp: '7000亿', population: '345万', growth: '+6.2%', industry: '商务服务', temperature: '15°C', aqi: '良 70' },
    '海淀区': { gdp: '9500亿', population: '348万', growth: '+7.5%', industry: '科技创新', temperature: '14°C', aqi: '良 62' },
    
    // 上海市辖区
    '黄浦区': { gdp: '2800亿', population: '65万', growth: '+5.2%', industry: '金融商贸', temperature: '18°C', aqi: '优 45' },
    '浦东新区': { gdp: '13500亿', population: '568万', growth: '+7.8%', industry: '金融科技', temperature: '18°C', aqi: '优 48' },
    '徐汇区': { gdp: '2200亿', population: '108万', growth: '+5.5%', industry: '科技服务', temperature: '18°C', aqi: '优 42' },
    
    // 广东省主要城市
    '广州市': { gdp: '2.88万亿', population: '1868万', growth: '+5.2%', industry: '商贸服务', temperature: '25°C', aqi: '良 68' },
    '深圳市': { gdp: '3.24万亿', population: '1768万', growth: '+6.0%', industry: '科技创新', temperature: '26°C', aqi: '优 52' },
    '珠海市': { gdp: '3800亿', population: '244万', growth: '+5.8%', industry: '高端制造', temperature: '25°C', aqi: '优 45' },
    '佛山市': { gdp: '1.27万亿', population: '955万', growth: '+5.5%', industry: '制造业', temperature: '25°C', aqi: '良 72' },
    '东莞市': { gdp: '1.12万亿', population: '1047万', growth: '+5.1%', industry: '电子制造', temperature: '25°C', aqi: '良 70' },
    
    // 江苏省主要城市
    '南京市': { gdp: '1.69万亿', population: '942万', growth: '+5.8%', industry: '科技服务', temperature: '16°C', aqi: '良 65' },
    '苏州市': { gdp: '2.40万亿', population: '1275万', growth: '+5.6%', industry: '制造业', temperature: '16°C', aqi: '良 68' },
    '无锡市': { gdp: '1.49万亿', population: '749万', growth: '+5.5%', industry: '制造业', temperature: '16°C', aqi: '良 70' },
    '常州市': { gdp: '9500亿', population: '536万', growth: '+5.2%', industry: '装备制造', temperature: '16°C', aqi: '良 72' },
    
    // 浙江省主要城市
    '杭州市': { gdp: '1.87万亿', population: '1237万', growth: '+6.5%', industry: '数字经济', temperature: '17°C', aqi: '优 50' },
    '宁波市': { gdp: '1.57万亿', population: '954万', growth: '+5.5%', industry: '港口物流', temperature: '17°C', aqi: '优 48' },
    '温州市': { gdp: '8000亿', population: '967万', growth: '+5.0%', industry: '轻工制造', temperature: '18°C', aqi: '优 52' },
    
    // 山东省主要城市
    '济南市': { gdp: '1.20万亿', population: '932万', growth: '+5.5%', industry: '装备制造', temperature: '14°C', aqi: '良 75' },
    '青岛市': { gdp: '1.49万亿', population: '1026万', growth: '+5.8%', industry: '海洋经济', temperature: '13°C', aqi: '优 58' },
    '烟台市': { gdp: '9200亿', population: '710万', growth: '+5.2%', industry: '制造业', temperature: '13°C', aqi: '优 55' },
    
    // 四川省主要城市
    '成都市': { gdp: '2.08万亿', population: '2119万', growth: '+6.0%', industry: '电子信息', temperature: '16°C', aqi: '良 68' },
    '绵阳市': { gdp: '3600亿', population: '489万', growth: '+4.8%', industry: '电子科技', temperature: '15°C', aqi: '优 52' },
    
    // 湖北省主要城市
    '武汉市': { gdp: '1.89万亿', population: '1365万', growth: '+6.8%', industry: '光电子', temperature: '17°C', aqi: '良 70' },
    
    // 湖南省主要城市
    '长沙市': { gdp: '1.37万亿', population: '1024万', growth: '+6.5%', industry: '工程机械', temperature: '18°C', aqi: '良 72' },
    
    // 河南省主要城市
    '郑州市': { gdp: '1.29万亿', population: '1282万', growth: '+5.5%', industry: '交通枢纽', temperature: '15°C', aqi: '良 80' },
    
    // 陕西省主要城市
    '西安市': { gdp: '1.14万亿', population: '1316万', growth: '+6.5%', industry: '科技教育', temperature: '14°C', aqi: '良 75' },
    
    // 重庆市辖区
    '渝中区': { gdp: '1500亿', population: '65万', growth: '+6.5%', industry: '金融商贸', temperature: '17°C', aqi: '良 68' },
    '江北区': { gdp: '1400亿', population: '95万', growth: '+6.8%', industry: '商务服务', temperature: '17°C', aqi: '良 70' },
    '渝北区': { gdp: '2100亿', population: '180万', growth: '+7.2%', industry: '汽车制造', temperature: '17°C', aqi: '良 65' }
  }
  
  // 如果找不到数据，生成随机数据
  return cityDataMap[cityName] || generateRandomData(cityName, 'city')
}

// 区县核心数据模拟
export const getDistrictData = (districtName) => {
  // 部分区县的数据示例
  const districtDataMap = {
    // 这里可以添加一些具体的区县数据
    '天河区': { gdp: '5200亿', population: '180万', growth: '+6.5%', industry: '商务服务', temperature: '25°C', aqi: '良 68' },
    '越秀区': { gdp: '3500亿', population: '115万', growth: '+5.8%', industry: '商贸金融', temperature: '25°C', aqi: '良 70' },
    '海珠区': { gdp: '2100亿', population: '180万', growth: '+5.5%', industry: '文化创意', temperature: '25°C', aqi: '良 72' },
    
    '南山区': { gdp: '7500亿', population: '179万', growth: '+7.5%', industry: '科技创新', temperature: '26°C', aqi: '优 48' },
    '福田区': { gdp: '5200亿', population: '165万', growth: '+6.8%', industry: '金融服务', temperature: '26°C', aqi: '优 50' },
    '龙岗区': { gdp: '5100亿', population: '420万', growth: '+6.5%', industry: '电子制造', temperature: '26°C', aqi: '优 52' }
  }
  
  // 如果找不到数据，生成随机数据
  return districtDataMap[districtName] || generateRandomData(districtName, 'district')
}

// 统一的数据获取接口，根据地图层级自动选择
export const getRegionData = (regionName, level = 'province') => {
  switch (level) {
    case 'nation':
    case 'province':
      return getProvinceData(regionName)
    case 'city':
      return getCityData(regionName)
    case 'district':
      return getDistrictData(regionName)
    default:
      return getProvinceData(regionName)
  }
}
