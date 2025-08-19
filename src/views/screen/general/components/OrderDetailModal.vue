<template>
    <div class="order-detail-modal" v-if="visible">
      <div class="modal-backdrop" @click="handleClose"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ t('dashboard.generalManager.orderDetail.title') }}</h3>
          <button class="close-btn" @click="handleClose">×</button>
        </div>
        <div class="modal-body" v-loading="loading">
          <div class="detail-grid">
            <!-- 第一行 -->
            <div class="detail-item">
              <span class="item-label">{{ t('dashboard.generalManager.orderDetail.orderNo') }}:</span>
              <span class="item-value">{{ detailData.orderNo || orderDetail.orderNo }}</span>
            </div>
            <div class="detail-item">
              <span class="item-label">{{ t('dashboard.generalManager.orderDetail.customer') }}:</span>
              <span class="item-value">{{ detailData.customer || orderDetail.customer }}</span>
            </div>
            <div class="detail-item">
              <span class="item-label">{{ t('dashboard.generalManager.orderDetail.customerCode') }}:</span>
              <span class="item-value">{{ detailData.customerCode || orderDetail.customerCode }}</span>
            </div>
            
            <!-- 第二行 -->
            <div class="detail-item">
              <span class="item-label">{{ t('dashboard.generalManager.orderDetail.taskQuantity') }}:</span>
              <span class="item-value">{{ detailData.quantity || orderDetail.quantity }}</span>
            </div>
            <div class="detail-item">
              <span class="item-label">{{ t('dashboard.generalManager.orderDetail.deliveryDate') }}:</span>
              <span class="item-value">{{ detailData.deliveryDate || orderDetail.deliveryDate }}</span>
            </div>
            <div class="detail-item">
              <span class="item-label">{{ t('dashboard.generalManager.orderDetail.qualifiedQuantity') }}:</span>
              <span class="item-value">{{ detailData.qualifiedQuantity || orderDetail.qualifiedQuantity }}</span>
            </div>
            <!-- 第三行 -->

            <div class="detail-item">
              <span class="item-label">{{ t('dashboard.generalManager.orderDetail.issuedSets') }}:</span>
              <span class="item-value">{{ detailData.issuedSets || orderDetail.issuedSets }}</span>
            </div>
            <div class="detail-item">
              <span class="item-label">{{ t('dashboard.generalManager.orderDetail.completionRate') }}:</span>
              <span class="item-value">{{ detailData.completionRate || orderDetail.completionRate }}%</span>
            </div>
          </div>
        </div>

            <!-- 添加工序进度表格 -->
            <div class="process-table-container">
            <table class="process-table">
                <thead>
                <tr>
                    <th>{{ t('dashboard.generalManager.orderDetail.processTable.process') }}</th>
                    <th>{{ t('dashboard.generalManager.orderDetail.processTable.planQuantity') }}</th>
                    <th>{{ t('dashboard.generalManager.orderDetail.processTable.completedQuantity') }}</th>
                    <th>{{ t('dashboard.generalManager.orderDetail.processTable.completionRate') }}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(process, index) in (detailData.processes || orderDetail.processes || defaultProcesses)" :key="index">
                    <td>{{ process.name }}</td>
                    <td>{{ process.planQuantity || '-' }}</td>
                    <td>{{ process.completedQuantity || '-' }}</td>
                    <td>{{ process.completionRate || '-' }}</td>
                </tr>
                </tbody>
            </table>
            </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="handleClose">{{ t('dashboard.generalManager.orderDetail.close') }}</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import { useI18n } from '/@/hooks/web/useI18n'
  // 引入API
  import { getEmergencyOrderTrackingDetail } from '@/api/screen/general/index'
  
  const { t } = useI18n()
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    orderDetail: {
      type: Object,
      default: () => ({})
    }
  })
  
  const emit = defineEmits(['update:visible'])
  
  // 详情数据
  const detailData = ref({})
  // 加载状态
  const loading = ref(false)
  
  // 时间戳转换为日期字符串
  const formatDate = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
  
  // 数据转换函数
  const transformDetailData = (apiData) => {
    if (!apiData) return {}
    
    return {
      orderNo: apiData.工单编号 || apiData.orderNo,
      customer: apiData.客户名称 || apiData.customer,
      customerCode: apiData.客户编号 || apiData.customerCode,
      productName: apiData.产品名称 || apiData.productName,
      quantity: apiData.任务数量 || apiData.quantity,
      deliveryDate: formatDate(apiData.交货日期) || apiData.deliveryDate,
      qualifiedQuantity: apiData.已入库合格量 || apiData.qualifiedQuantity,
      issuedSets: apiData.已发料套数 || apiData.issuedSets,
      completionRate: parseFloat(apiData.完成率 || apiData.completionRate || 0),
      // 转换工序数据
      processes: transformProcessData(apiData)
    }
  }
  
  // 新增工序数据转换函数
  const transformProcessData = (apiData) => {
    // 如果apiData直接是工序数组（如您提供的数据结构）
    if (Array.isArray(apiData)) {
      return apiData.map(process => ({
        name: process.工序名称 || process.name,
        planQuantity: formatNumber(process.计划数量 || process.planQuantity),
        completedQuantity: formatNumber(process.完工数量 || process.completedQuantity),
        completionRate: formatPercentage(process['完成率\'完成率'] || process.completionRate)
      }))
    }
    
    // 如果apiData包含工序数组
    if (apiData && apiData.data && Array.isArray(apiData.data)) {
      return apiData.data.map(process => ({
        name: process.工序名称 || process.name,
        planQuantity: formatNumber(process.计划数量 || process.planQuantity),
        completedQuantity: formatNumber(process.完工数量 || process.completedQuantity),
        completionRate: formatPercentage(process['完成率\'完成率'] || process.completionRate)
      }))
    }
    
    return []
  }
  
  // 数字格式化函数
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'string' && value.includes('E')) {
      // 处理科学计数法，如 0E-10
      const num = parseFloat(value)
      return num === 0 ? '0' : num.toString()
    }
    return parseFloat(value).toLocaleString()
  }
  
  // 百分比格式化函数
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '-'
    const num = parseFloat(value)
    return num === 0 ? '0%' : `${(num).toFixed(1)}%`
  }
  
  // 获取工单详情
  const fetchOrderDetail = async (orderNo) => {
    if (!orderNo) return
    
    loading.value = true
    try {
      const res = await getEmergencyOrderTrackingDetail({ orderNo })
      console.log('工单详情API返回数据:', res)
      
      if (res && res.length) {
        // 如果返回的是工序数据数组
          detailData.value = {
            ...detailData.value,
            processes: transformProcessData(res)
          }
      } else {
        console.warn('获取工单详情失败:', res)
        detailData.value.processes = []
      }
    } catch (error) {
      console.error('获取工单详情失败:', error)
          detailData.value.processes = []
    } finally {
      loading.value = false
    }
  }
  
  // 监听弹框显示状态和工单数据变化
  watch(
    () => [props.visible, props.orderDetail?.orderNo],
    ([visible, orderNo]) => {
      if (visible && orderNo) {
        // 弹框打开时获取详情数据
        fetchOrderDetail(orderNo)
      } else {
        // 弹框关闭时清空详情数据
        detailData.value = {}
      }
    },
    { immediate: true }
  )
  
  const handleClose = () => {
    emit('update:visible', false)
  }
  
  // 默认工序列表
  const defaultProcesses = []
  </script>
  
  <style lang="scss" scoped>
  //  @use "@/assets/screen/styles/_variables" as *;
  
  .order-detail-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    
    .modal-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(2px);
    }
    
    .modal-content {
      position: relative;
      width: 1100px;
      max-width: 90%;
      background-color: #001f3d;
      border-radius: 6px;
      box-shadow: 0 0 20px rgba(9, 155, 229, 0.5);
      border: 1px solid rgba(9, 155, 229, 0.6);
      z-index: 1001;
      animation: modalFadeIn 0.3s ease-out;
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        
        .modal-title {
          color: #E6F7FF;
          font-size: 18px;
          margin: 0;
          font-weight: normal;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: #8BB4F7;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          
          &:hover {
            color: #E6F7FF;
          }
        }
      }
      
      .modal-body {
        padding: 20px;
        
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          
           
          .detail-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          
          .item-label {
            color: #8BB4F7;
            font-size: 16px;
            margin-right: 12px;
            white-space: nowrap;
            min-width: 100px;
            text-align: justify;
            text-align-last: justify;
            display: inline-block;
          }
          
          .item-value {
            color: #E6F7FF;
            font-size: 16px;
            font-weight: 500;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        }
      }
            /* 添加工序表格样式 */
        .process-table-container {
        margin-top: 25px;
        padding: 0 20px;
                
        .process-table {
          width: 100%;
          border-collapse: collapse;
          
          th, td {
            padding: 10px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          th {
            background-color: rgba(0, 0, 0, 0.2);
            color: #8BB4F7;
            font-weight: normal;
          }
          
          td {
            color: #E6F7FF;
          }
          
          // 添加完成率的颜色样式
          td:last-child {
            &:not(:contains('-')) {
              &:contains('0%') {
                color: #f44336; // 红色，表示未开始
              }
              &:contains('100%') {
                color: #4caf50; // 绿色，表示已完成
              }
              &:not(:contains('0%')):not(:contains('100%')) {
                color: #ff9800; // 橙色，表示进行中
              }
            }
          }
          
          tr:nth-child(even) {
            background-color: rgba(255, 255, 255, 0.03);
          }
          
          tr:hover {
            background-color: rgba(90, 141, 238, 0.1);
          }
          
          // 添加表头底部边框加强
          thead tr {
            border-bottom: 2px solid rgba(90, 141, 238, 0.3);
          }
        }
      }
      .modal-footer {
        padding: 15px 20px;
        display: flex;
        justify-content: flex-end;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        
        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
          
          &.btn-primary {
            background-color: #5A8DEE;
            color: white;
            border: none;
            
            &:hover {
              background-color:#4a7dde;
            }
          }
        }
      }
    }
  }
  
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .modal-content {
    // 添加内容区域的滚动条样式
    max-height: 90vh;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(90, 141, 238, 0.5);
      border-radius: 3px;
    }
  }
  </style>