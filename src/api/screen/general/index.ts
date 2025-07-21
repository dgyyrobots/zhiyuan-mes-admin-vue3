import request from '@/config/axios'



export const getMainData = (params) => {
  return request.get({ url: '/erp/dashboard-executive/getMainInfo', params })
}

// 紧急工单列表
export const getEmergencyOrderTrackingList = (params) => {
  return request.get({ url: '/erp/dashboard-executive/getEmergencyOrderTracking', params })
}

// 紧急工单详情
export const getEmergencyOrderTrackingDetail = (params) => {
  return request.get({ url: '/erp/dashboard-executive/selectEmergencyOrderTrackingByOrderNo', params })
}

// 品牌 
export const getBrandList = (params) => {
  return request.get({ url: '/erp/dashboard-executive/getBrandCompletionRate', params })
}
// 销售看板
export const getSalesOrderTracking = (params) => {
  return request.get({ url: '/erp/dashboard-executive/getSalesOrderTracking', params })
}

// 生产看板
export const getOutputOrderTracking = (params) => {
  return request.get({ url: '/erp/dashboard-executive/getOutputOrderTracking', params })
}

