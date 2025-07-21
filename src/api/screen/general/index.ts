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

