<template>
  <div class="emergency-order-tracker">
    <h3 class="tracker-title">紧急工单跟踪</h3>
    
    <!-- 将表格替换为卡片网格 -->
    <div class="cards-container">
      <!-- 使用卡片展示每个工单 -->
      <div
v-for="(item, index) in orderData" :key="index"
           @click="showOrderDetail(item)"
           class="order-card">
        <div class="card-header">
          <span class="order-link">{{ item.orderNo }}</span>
          <span :class="['completion-badge', {'up': item.completionRate >= 100, 'down': item.completionRate < 100}]">
            {{ item.completionRate }}%
          </span>
        </div>
        <div class="card-body">
          <div class="info-item">
            <span class="info-label">客&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;户:</span>
            <span class="info-value">{{ item.customer }}</span>
          </div>
          <!-- 修改这里：将交货日期和工单数量放在同一行 -->
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">交货日期:</span>
              <span class="info-value" style="padding-left: 10px;">{{ item.deliveryDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">工单数量:</span>
              <span class="info-value">{{ item.quantity }}</span>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <span class="view-details">
            <img :src="jumpdetailIcon" style="width: 16px;" alt=""/>
          </span>
        </div>
      </div>
      
      <!-- 无数据时显示提示 -->
      <div v-if="orderData.length === 0" class="empty-state">
        暂无紧急工单数据
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
import { ref, onMounted, onUnmounted } from 'vue'
import jumpdetailIcon from '@/assets/screen/icon_svg/jumpd.svg';
// 引入详情弹框组件
import OrderDetailModal from './OrderDetailModal.vue'
// 假设有这个API
// import { getEmergencyOrders } from '@/api/orders.js'

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
  // 扩展工单数据，添加更多详情信息
  selectedOrder.value = {
    ...order,
    // 添加额外的详情信息
    manager: getRandomManager(),
    urgency: getRandomUrgency(),
    remark: getRandomRemark()
  }
  detailModalVisible.value = true
}

// 随机生成负责人（模拟数据）
const getRandomManager = () => {
  const managers = ['张经理', '李工程师', '王主管', '赵组长', '刘技术员']
  return managers[Math.floor(Math.random() * managers.length)]
}

// 随机生成紧急程度（模拟数据）
const getRandomUrgency = () => {
  return Math.floor(Math.random() * 3) + 1 // 1-3
}

// 随机生成备注（模拟数据）
const getRandomRemark = () => {
  const remarks = [
    '客户要求尽快交付',
    '需要特殊包装',
    '已与客户确认交期',
    '需要提前准备原材料',
    '客户可能会提前验收',
    ''
  ]
  return remarks[Math.floor(Math.random() * remarks.length)]
}

// 获取紧急工单数据
const fetchData = async () => {
  try {
    // 实际项目中应该调用API
    // const res = await getEmergencyOrders()
    // if (res && res.code === 0 && res.data) {
    //   orderData.value = res.data
    // }
    
    // 模拟数据
    orderData.value = [
      { orderNo: 'JG-2025-0001', customer: '客户A', deliveryDate: '2025-12-25', quantity: 500, completionRate: 85 },
      { orderNo: 'JG-2025-0002', customer: '客户B', deliveryDate: '2025-12-26', quantity: 300, completionRate: 100 },
      { orderNo: 'JG-2025-0003', customer: '客户C', deliveryDate: '2025-12-27', quantity: 800, completionRate: 65 },
      { orderNo: 'JG-2025-0004', customer: '客户D', deliveryDate: '2025-12-28', quantity: 200, completionRate: 90 },
      { orderNo: 'JG-2025-0005', customer: '客户E', deliveryDate: '2025-12-29', quantity: 450, completionRate: 30 },
      { orderNo: 'JG-2025-0006', customer: '客户F', deliveryDate: '2025-12-30', quantity: 600, completionRate: 0 }
    ]
  } catch (error) {
    console.error('获取紧急工单数据失败:', error)
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
    gap: 16px;
    padding: 4px;
    
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
          
          &.up {
            background-color: rgba(76, 175, 80, 0.2);
            color: #4caf50;
          }
          
          &.down {
            background-color: rgba(244, 67, 54, 0.2);
            color: #f44336;
          }
        }
      }
      
      .card-body {
        padding: 12px 16px;
        flex: 1;
        
        // 添加行样式
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          
          .info-item {
            flex: 1;
            margin-bottom: 0;
            
            &:first-child {
              margin-right: 10px;
            }
            
            .info-label {
              width: auto;
              margin-right: 4px;
            }
            
            .info-value {
              max-width: 100px; // 限制值的最大宽度
            }
          }
        }
        
        .info-item {
          display: flex;
          margin-bottom: 8px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .info-label {
            color: #8BB4F7;
            width: 70px;
            flex-shrink: 0;
            font-size: 14px;
          }
          
          .info-value {
            color: #E6F7FF;
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 14px;
          }
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