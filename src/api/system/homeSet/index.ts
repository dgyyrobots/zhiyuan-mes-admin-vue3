import request from '@/config/axios'

export interface accountPassVO {
  userName: string,
  password: string,
  sysId : string,
}
export interface loginVO {
  userName: string,
  password: string,
  net: string,
}
export interface  mesloginVO {
  net: string,
  account: string,
  appId: string,
}
// 获取跳转列表
export const getJumpList = async () => {
  return await request.download({ url: '/system/oneLogin/initOneLoginInfo'})
}

// 修改账号密码
export const registerAccountPwd = async (data: accountPassVO) => {
  return await request.post({ url: '/system/oneLogin/register', data })
}

// 澳美登录
export const amMesAutoLogin = async (data: loginVO) => {
  return await request.post({ url: '/system/oneLogin/amMesAutoLogin', data })
}

// 智源MES登录
export const zyMesAutoLogin = async (data: mesloginVO) => {
  return await request.post({ url: '/system/oneLogin/zyMesAutoLogin', data })
}

// 东合NES登录
export const dhMesAutoLogin = async (data: mesloginVO) => {
  return await request.post({ url: '/system/oneLogin/dhMesAutoLogin', data })
}
// 智源hr登录
export const zyHrAutoLogin = async (data: loginVO) => {
  return await request.post({ url: '/system/oneLogin/zyHrAutoLogin', data })
}