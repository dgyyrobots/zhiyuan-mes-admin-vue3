<template>
  <div class="emergency-order-tracker">
    <h3 class="tracker-title">{{ $t('dashboard.generalManager.emergencyOrders') }}</h3>
    
    <!-- 将表格替换为卡片网格 -->
    <div class="cards-container">
      <!-- 使用卡片展示每个工单 -->
      <div
        v-for="(item, index) in orderData" 
        :key="index"
        @click="showOrderDetail(item)"
        class="order-card">
        <div class="card-header">
          <span class="order-link">{{ item.orderNo }}</span>
          <span :class="['completion-badge', {'up': item.completionRate >= 90, 'down': item.completionRate < 90}]">
            {{ item.completionRate }}%
          </span>
        </div>
        <div class="card-body">
          <span class="info-label">{{ $t('dashboard.generalManager.orderDetail.customer') }}:</span>
          <span class="info-value" :title="item.customer">{{ item.customer }}</span>
          
          <span class="info-label">{{ $t('dashboard.generalManager.orderDetail.deliveryDate') }}:</span>
          <span class="info-value">{{ item.deliveryDate }}</span>
          
          <span class="info-label">{{ $t('dashboard.generalManager.orderDetail.taskQuantity') }}:</span>
          <span class="info-value">{{ item.quantity }}</span>
        </div>
        <div class="card-footer">
          <span class="view-details">
            <img :src="jumpdetailIcon" style="width: 16px;" alt=""/>
          </span>
        </div>
      </div>
      
      <!-- 无数据时显示提示 -->
      <div v-if="orderData.length === 0" class="empty-state">
        {{ $t('dashboard.generalManager.noData') }}
      </div>
    </div>
    
    <!-- 引入工单详情弹框 -->
    <OrderDetailModal 
      v-model:visible="detailModalVisible" 
      :order-detail="selectedOrder" 
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, onMounted, onUnmounted } from 'vue'
import jumpdetailIcon from '@/assets/screen/icon_svg/jumpd.svg';
// 引入详情弹框组件
import OrderDetailModal from './OrderDetailModal.vue'
// 引入API
import { getEmergencyOrderTrackingList } from '@/api/screen/general/index'

const { t } = useI18n()

// 工单数据
const orderData = ref([])
// 选中的工单详情
const selectedOrder = ref({})
// 控制详情弹框显示
const detailModalVisible = ref(false)

// 定时器引用
let refreshTimer = null
// 刷新间隔时间 (1小时 = 60 * 60 * 1000 毫秒)
const REFRESH_INTERVAL = 60 * 60 * 1000

// 显示工单详情
const showOrderDetail = (order) => {
  // 直接使用接口返回的数据，不添加额外的模拟数据
  selectedOrder.value = { ...order }
  detailModalVisible.value = true
}

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

// 数据转换函数 - 将API返回的数据转换为组件需要的格式
const transformApiData = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) {
    return []
  }
  
  return apiData.map((item) => {
    return {
      orderNo: item.工单编号 || '-',
      customer: item.客户名称 || '-',
      customerCode: item.客户编号 || '-',
      deliveryDate: formatDate(item.交货日期),
      quantity: item.任务数量 || 0,
      completionRate: parseFloat(item.完成率 || 0),
      qualifiedQuantity: item.已入库合格量 || 0,
      issuedSets: item.已发料套数 || 0,
      // 如果接口返回了这些字段，直接使用；否则为空
      manager: item.负责人 || '',
      urgency: item.紧急程度 || '',
      remark: item.备注 || ''
    }
  })
}

// 获取紧急工单数据
const fetchData = async () => {
  try {
    // 调用真实API
    const res = await getEmergencyOrderTrackingList({})
    console.log('API返回数据:', res)
    
    if (res && res.length) {
      // 转换API数据为组件需要的格式
      orderData.value = transformApiData(res)
    } else {
      console.warn('API返回数据格式异常:', res)
      orderData.value = []
    }
  } catch (error) {
    console.error('获取紧急工单数据失败:', error)
    orderData.value = []
  }
}

// 设置定时刷新
const setupRefreshTimer = () => {
  // 清除可能存在的旧定时器
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  // 设置新的定时器，每小时刷新一次数据
  refreshTimer = setInterval(() => {
    fetchData()
  }, REFRESH_INTERVAL)
}

onMounted(() => {
  // 初始加载数据
  fetchData()
  // 设置定时刷新
  setupRefreshTimer()
})

onUnmounted(() => {
  // 组件卸载时清除定时器
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style lang="scss" scoped>
//  @use "@/assets/screen/styles/_variables" as *;

.emergency-order-tracker {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px 14px;
  background-color: #001f3d;
  border-radius: 4px;
  position: relative;
  // 增强边框效果
  border: 1px solid rgba(9, 155, 229, 0.6);
  box-shadow: 0 0 5px rgba(9, 155, 229, 0.3), inset 0 0 5px rgba(9, 155, 229, 0.2);
  
  // 添加发光效果
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 4px;
    pointer-events: none;
    box-shadow: 0 0 8px rgba(157, 78, 221, 0.5);
    z-index: -1;
  }
  
  .tracker-title {
    color: #E6F7FF;
    font-size: 16px;
    margin: 0 0 15px 0;
    font-weight: normal;
    padding: 6px 10px;
    border-radius: 3px;
    // 添加渐变背景色
    background: linear-gradient(90deg, rgba(157, 78, 221, 0.3) 0%, rgba(157, 78, 221, 0.1) 70%, rgba(157, 78, 221, 0) 100%);
    position: relative;
    
    // 添加左侧装饰线
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 70%;
      background: #9d4edd;
      border-radius: 2px;
    }
  }
  
  // 卡片容器样式
  .cards-container {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); // 增加最小宽度
    gap: 8px;
    padding: 4px;
      // 使用 grid-auto-rows 控制行高
    grid-auto-rows: min-content; // 让行高适应内容
    // 或者设置固定行高
    // grid-auto-rows: 180px;
    
    // 设置合适的高度
    height: fit-content;
    min-height: 300px;
    // 卡片样式
    .order-card {
      background-color: rgba(0, 31, 63, 0.5);
      border: 1px solid rgba(90, 141, 238, 0.3);
      border-radius: 6px;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      min-height: 160px; // 设置最小高度确保卡片大小一致
      max-height: 180px;
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(90, 141, 238, 0.3);
        border-color: rgba(90, 141, 238, 0.6);
      }
      
      .card-header {
        padding: 12px 16px;
        background: linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%);
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        
        .order-link {
          color: #5A8DEE;
          font-weight: 500;
          position: relative;
          font-size: 15px;
          white-space: nowrap; // 防止工单号换行
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 70%; // 限制最大宽度
          
          &::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 0.5px;
            background-color: rgba(90, 141, 238, 0.7);
            transform: scaleX(1);
            transition: transform 0.3s ease, opacity 0.3s ease;
          }
        }
        
        .completion-badge {
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 500;
          min-width: 45px; // 确保徽章有足够宽度
          text-align: center;
        }

         .up {
            background-color: rgba(76, 175, 80, 0.2);
            color: #4caf50;
          }
          
          .down {
            background-color: rgba(244, 67, 54, 0.2);
            color: #f44336;
          }
      }
      
      .card-body {
      padding: 12px 16px;
      flex: 1;
      display: grid;
      grid-template-columns: minmax(80px, auto) 1fr; // 修改为自适应宽度
      gap: 8px 12px;
      align-items: center;
      
      .info-label {
        color: #8BB4F7;
        font-size: 14px;
        text-align: justify;
        text-align-last: justify;
        white-space: nowrap; // 防止换行
        min-width: 80px; // 设置最小宽度
      }
      
      .info-value {
        color: #E6F7FF;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
      
      .card-footer {
        padding: 8px 16px; // 减小底部内边距
        display: flex;
        justify-content: flex-end;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.1);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        
        .view-details {
          font-size: 13px;
          color: #5A8DEE;
        }
        
        .arrow-icon {
          margin-left: 6px;
          color: #5A8DEE;
          transition: transform 0.3s ease;
        }
        
        &:hover .arrow-icon {
          transform: translateX(3px);
        }
      }
      
      &:active {
        transform: translateY(-1px);
      }
    }
    
    // 空状态样式
    .empty-state {
      grid-column: 1 / -1;
      padding: 40px;
      text-align: center;
      color: #8BB4F7;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 6px;
      border: 1px dashed rgba(255, 255, 255, 0.1);
    }
    
    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(157, 78, 221, 0.5);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(157, 78, 221, 0.7);
    }
  }
}
</style>