import request from '@/config/axios'

export interface SystemAddressVO {
  id: number
  sysId: string
  sysCode: string
  sysName: string
  sysUrl: string
  sysUrlNet: string
  sysLog: string
  sysLogUrl: string
  createTime: Date
  updateTime: Date
  deptName: string
  createUser: string
  updateUser: string
  pg: string
}

// 创建系统地址信息
export const createSystemAddress = (data: SystemAddressVO) => {
  return request.post({ url: '/system/dj002/create', data })
}

// 更新系统地址信息
export const updateSystemAddress = (data: SystemAddressVO) => {
  return request.put({ url: '/system/dj002/update', data })
}

// 删除系统地址信息
export const deleteSystemAddress = (id: number) => {
  return request.delete({ url: '/system/dj002/delete?id=' + id })
}

// 获得系统地址信息
export const getSystemAddress = (id: number) => {
  return request.get({ url: '/system/dj002/get?id=' + id })
}

// 获得系统地址信息分页
export const getSystemAddressPage = (params: any) => {
  return request.get({ url: '/system/dj002/page', params })
}

// 导出系统地址信息 Excel
export const exportSystemAddressExcel = (params: any) => {
  return request.get({ 
    url: '/system/dj002/export-excel', 
    params,
    responseType: 'blob'
  })
}
