<template>
    <div class="order-detail-modal" v-if="visible">
      <div class="modal-backdrop" @click="handleClose"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">工单详情</h3>
          <button class="close-btn" @click="handleClose">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <!-- 第一行 -->
            <div class="detail-item">
              <span class="item-label">工&nbsp;&nbsp;单&nbsp;&nbsp;号:</span>
              <span class="item-value">{{ orderDetail.orderNo }}</span>
            </div>
            <div class="detail-item">
              <span class="item-label">客&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;户:</span>
              <span class="item-value">{{ orderDetail.customer }}</span>
            </div>
            <div class="detail-item">
              <span class="item-label">订单日期:</span>
              <span class="item-value">{{ orderDetail.orderDate }}</span>
            </div>
            
            <!-- 第二行 -->
            <div class="detail-item">
              <span class="item-label">产品名称:</span>
              <span class="item-value">{{ orderDetail.productName }}</span>
            </div>
            <div class="detail-item">
              <span class="item-label">订单数量:</span>
              <span class="item-value">{{ orderDetail.quantity }}</span>
            </div>
            <div class="detail-item">
              <span class="item-label">交货日期:</span>
              <span class="item-value">{{ orderDetail.deliveryDate }}</span>
            </div>
            
            <!-- 第三行 -->
            <div class="detail-item">
              <span class="item-label">入库数量:</span>
              <span class="item-value">{{ orderDetail.stockQuantity }}</span>
            </div>
          </div>
        </div>

            <!-- 添加工序进度表格 -->
            <div class="process-table-container">
            <table class="process-table">
                <thead>
                <tr>
                    <th>工序</th>
                    <th>计划数量</th>
                    <th>完工数量</th>
                    <th>完成率</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(process, index) in orderDetail.processes || defaultProcesses" :key="index">
                    <td>{{ process.name }}</td>
                    <td>{{ process.planQuantity || '-' }}</td>
                    <td>{{ process.completedQuantity || '-' }}</td>
                    <td>{{ process.completionRate || '-' }}</td>
                </tr>
                </tbody>
            </table>
            </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="handleClose">关闭</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import {  ref } from 'vue'
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    orderDetail: {
      type: Object,
      default: () => ({
        // 添加默认的工单详情数据
        orderNo: 'JG-2025-0001',
        customer: '客户A',
        orderDate: '2025-12-01',
        productName: '高档彩盒',
        quantity: 500,
        deliveryDate: '2025-12-25',
        stockQuantity: 0,
        processes: [
          { name: '印刷', planQuantity: 500, completedQuantity: 150, completionRate: '30%' },
          { name: '单门', planQuantity: 500, completedQuantity: 0, completionRate: '0%' },
          { name: '喷码', planQuantity: 500, completedQuantity: 0, completionRate: '0%' },
          { name: '烫金', planQuantity: 500, completedQuantity: 0, completionRate: '0%' },
          { name: '模切', planQuantity: 500, completedQuantity: 0, completionRate: '0%' },
          { name: '品检', planQuantity: 500, completedQuantity: 0, completionRate: '0%' },
          { name: '包装', planQuantity: 500, completedQuantity: 0, completionRate: '0%' }
        ]
      })
    }
  })
  
  const emit = defineEmits(['update:visible'])
  
  const handleClose = () => {
    emit('update:visible', false)
  }
  
  // 默认工序列表 - 修改为包含更多数据的版本
  const defaultProcesses = [
    { name: '印刷', planQuantity: 500, completedQuantity: 150, completionRate: '30%' },
    { name: '单门', planQuantity: 500, completedQuantity: 0, completionRate: '0%' },
    { name: '喷码', planQuantity: 500, completedQuantity: 0, completionRate: '0%' },
    { name: '烫金', planQuantity: 500, completedQuantity: 0, completionRate: '0%' },
    { name: '模切', planQuantity: 500, completedQuantity: 0, completionRate: '0%' },
    { name: '品检', planQuantity: 500, completedQuantity: 0, completionRate: '0%' },
    { name: '包装', planQuantity: 500, completedQuantity: 0, completionRate: '0%' }
  ]
  </script>
  
  <style lang="scss" scoped>
  //  @use "@/assets/screen/styles/_variables" as *;
  
  .order-detail-modal {
    position: absolute;
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
      width: 900px;
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
          flex-direction: row; // 修改为行内显示
          align-items: center; // 垂直居中对齐
          
          .item-label {
            color: #8BB4F7;
            font-size: 16px;
            margin-right: 8px; // 添加右侧间距
            white-space: nowrap; // 防止标签换行
            width: 80px;
          }
          
          .item-value {
            color: #E6F7FF;
            font-size: 16px;
            font-weight: 500;
            flex: 1; // 让值占据剩余空间
            overflow: hidden; // 防止溢出
            text-overflow: ellipsis; // 文本溢出时显示省略号
          }
        }
        }
      }
            /* 添加工序表格样式 */
        .process-table-container {
        margin-top: 25px;
        padding: 0 20px; // 添加左右内边距，与上方内容对齐
                
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