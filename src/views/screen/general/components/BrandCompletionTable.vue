<template>
  <div class="brand-completion-table">
    <h3 class="table-title">{{ t('dashboard.generalManager.brandCompletion') }}</h3>
    <div class="table-container">
      <table v-if="tableData.length > 0">
        <thead>
          <tr>
            <th class="brand-name">{{ t('dashboard.generalManager.brandName') }}</th>
            <th>{{ t('dashboard.generalManager.target') }}</th>
            <th>
              <el-tooltip
              class="box-item"
              effect="dark"
              :content="t('dashboard.generalManager.supportingBoxes')"
              placement="top-start"
            >
              {{ t('dashboard.generalManager.supportingBoxes') }}
            </el-tooltip>
         </th>
          <th>
              <el-tooltip
              class="box-item"
              effect="dark"
              :content="t('dashboard.generalManager.completionRate')"
              placement="top-start"
            >
              {{ t('dashboard.generalManager.completionRate') }}
            </el-tooltip>
         </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in tableData" :key="index">
            <td>{{ item.brandName }}</td>
            <td>{{ item.target }}</td>
            <td>{{ item.boxNum }}</td>
            <td>
              <span :class="{'up': item.completionRate >= 0, 'down': item.completionRate < 0}">
                {{ item.completionRate }}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-data">
        {{ t('dashboard.generalManager.noData') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getBrandList } from '@/api/screen/general/index'

const { t } = useI18n()

// 表格数据
const tableData = ref([])

// 定时器引用
let refreshTimer = null
// 刷新间隔时间 (8小时 = 8 * 60 * 60 * 1000 毫秒)
const REFRESH_INTERVAL = 8 * 60 * 60 * 1000

const fetchData = async () => {
  try {
    const res = await getBrandList()
    console.log(res,'rrrrr')
    if (res) {
      // 转换接口数据为表格所需格式
      tableData.value = res.map(item => ({
        brandName: item['品牌名称'],
        target: formatInteger(item['品牌目标']),
        boxNum: formatInteger(item['配套烟箱'].toFixed(0)),
        completionRate: parseFloat(item['品牌完成率']).toFixed(2)
      }))
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    // 保留默认数据以防接口失败
  }
}
// 格式化数字：保留整数
const formatInteger = (num) => {
  if (num === null || num === undefined) return '-'
  // 先四舍五入为整数
  const roundedNum = Math.round(num)
  // 转为字符串并添加千位分隔符
  return roundedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
// 设置定时刷新
const setupRefreshTimer = () => {
  // 清除可能存在的旧定时器
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  // 设置新的定时器，每8小时刷新一次数据
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

.brand-completion-table {
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
  
  .table-title {
    color: #E6F7FF;
    font-size: 16px;
    margin: 0 0 10px 0;
    font-weight: normal;
    // 添加渐变背景和内边距，参考YearlyTrendChart
    padding: 6px 10px;
    border-radius: 3px;
    background: linear-gradient(90deg, rgba(65, 105, 225, 0.3) 0%, rgba(65, 105, 225, 0.1) 70%, rgba(65, 105, 225, 0) 100%);
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
      background: #78b4ff; // 使用表格中的蓝色
      border-radius: 2px;
    }
  }
  
  .table-container {
    flex: 1;
    position: relative;
    overflow: auto;
    .no-data {
    position: absolute;
    top: 8%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #8BB4F7;
    font-size: 16px;
    text-align: center;
    z-index: 99;
    pointer-events: none;
    opacity: 0;
    animation: fadeIn 0.5s ease-out forwards;
  }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed; // 添加固定表格布局
      
      thead {
        position: sticky;
        top: 0;
        z-index: 10;
        background-color: #001f3d;
        
        th {
          position: sticky;
          top: 0;
          background-color: rgba(0, 0, 0, 0.2);
          white-space: nowrap; // 防止文本换行
          overflow: hidden;
          text-overflow: ellipsis; // 超出部分显示省略号
          padding: 8px 4px; // 减小内边距
        }
        
        .brand-name {
          width: 40%; // 品牌名称列宽度较大
        }
      }
      
      tbody {
        max-height: 100%;
      }
      
      th, td {
        padding: 10px 8px;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      th {
        color: #8BB4F7;
        font-size: 14px;
        font-weight: normal;
      }
      
      td {
        color: #E6F7FF;
        font-size: 14px;
      }
      
      tbody tr:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
      
      .up {
        color: #4caf50;
      }
      
      .down {
        color: #f44336;
      }
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
      background: rgba(102, 153, 204, 0.5);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(102, 153, 204, 0.7);
    }
  }
}
</style>