import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 单点登录用户信息 */
export interface SsoUsers {
          id: number; // 编号
          userId: number; // 用户ID
          systemId?: number; // 单点登录系统id
          userName?: string; // 用户名称
          password?: string; // 密码
          standby1: string; // 备用1
          standby2: string; // 备用2
          standby3: string; // 备用3
          standby4: string; // 备用4
          standby5: string; // 备用5
  }

// 单点登录用户 API
export const SsoUsersApi = {
  // 查询单点登录用户分页
  getSsoUsersPage: async (params: any) => {
    return await request.get({ url: `/erp/sso-users/page`, params })
  },

  // 查询单点登录用户详情
  getSsoUsers: async (id: number) => {
    return await request.get({ url: `/erp/sso-users/get?id=` + id })
  },

  // 新增单点登录用户
  createSsoUsers: async (data: SsoUsers) => {
    return await request.post({ url: `/erp/sso-users/create`, data })
  },

  // 修改单点登录用户
  updateSsoUsers: async (data: SsoUsers) => {
    return await request.put({ url: `/erp/sso-users/update`, data })
  },

  // 删除单点登录用户
  deleteSsoUsers: async (id: number) => {
    return await request.delete({ url: `/erp/sso-users/delete?id=` + id })
  },

  /** 批量删除单点登录用户 */
  deleteSsoUsersList: async (ids: number[]) => {
    return await request.delete({ url: `/erp/sso-users/delete-list?ids=${ids.join(',')}` })
  },

  // 导出单点登录用户 Excel
  exportSsoUsers: async (params) => {
    return await request.download({ url: `/erp/sso-users/export-excel`, params })
  },
}