import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 单点登录系统信息 */
export interface SsoSystem {
          id: number; // 系统编号
          systemImg: string; // 系统图标
          systemName?: string; // 系统名称
          internalLink?: string; // 内部访问网址
          externalLink?: string; // 外部访问网址
          standby1: string; // 备用1
          standby2: string; // 备用2
          standby3: string; // 备用3
          standby4: string; // 备用4
          standby5: string; // 备用5
  }

// 单点登录系统 API
export const SsoSystemApi = {
  // 查询单点登录系统分页
  getSsoSystemPage: async (params: any) => {
    return await request.get({ url: `/erp/sso-system/page`, params })
  },

  // 查询单点登录系统详情
  getSsoSystem: async (id: number) => {
    return await request.get({ url: `/erp/sso-system/get?id=` + id })
  },

  // 新增单点登录系统
  createSsoSystem: async (data: SsoSystem) => {
    return await request.post({ url: `/erp/sso-system/create`, data })
  },

  // 修改单点登录系统
  updateSsoSystem: async (data: SsoSystem) => {
    return await request.put({ url: `/erp/sso-system/update`, data })
  },

  // 删除单点登录系统
  deleteSsoSystem: async (id: number) => {
    return await request.delete({ url: `/erp/sso-system/delete?id=` + id })
  },

  /** 批量删除单点登录系统 */
  deleteSsoSystemList: async (ids: number[]) => {
    return await request.delete({ url: `/erp/sso-system/delete-list?ids=${ids.join(',')}` })
  },

  // 导出单点登录系统 Excel
  exportSsoSystem: async (params) => {
    return await request.download({ url: `/erp/sso-system/export-excel`, params })
  },
}