import request from '@/config/axios'

export interface accountPassVO {
  userName: string,
  password: string,
  sysId : string,
}

// 获取跳转列表
export const getJumpList = (params) => {
  return request.download({ url: '/system/oneLogin/initOneLoginInfo', params })
}

// 修改账号密码
export const registerAccountPwd = async (data: accountPassVO) => {
  return await request.post({ url: '/system/oneLogin/register', data })
}
