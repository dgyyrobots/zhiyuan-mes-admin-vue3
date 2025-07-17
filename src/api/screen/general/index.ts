import request from '@/config/axios'



export const getMainData = (params) => {
  return request.get({ url: '/erp/dashboard-executive/getMainInfo', params })
}
