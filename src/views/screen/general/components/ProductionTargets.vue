<template>
    <div class="production-targets">
      <h3 class="title">{{ t('dashboard.generalManager.productionTargets') }}</h3>
      <div class="targets-container">
        <div class="targets-row">
          <div class="target-item">
            <div class="target-label">{{ t('dashboard.generalManager.yearTarget') }}</div>
            <div class="target-value">
                <CountTo
                :startVal="0"
                :endVal="targetData.yearTarget"
                :duration="2000"
                />
           </div>
          </div>
          <div class="target-item">
            <div class="target-label">{{ t('dashboard.generalManager.monthTarget') }}</div>
            <div class="target-value">
                <CountTo
                :startVal="0"
                :endVal="targetData.monthTarget"
                :duration="2000"
                />
            </div>
          </div>
          <div class="target-item">
            <div class="target-label">{{ t('dashboard.generalManager.yearQualityTarget') }}</div>
            <div class="target-value">
              <CountTo
                :startVal="0"
                :endVal="targetData.yearQualityTarget"
                :duration="2000"
                :decimals="1"
              />%
            </div>
          </div>
        </div>
        <div class="targets-row">
          <div class="target-item">
            <div class="target-label">{{ t('dashboard.generalManager.yearCompleted') }}</div>
            <div class="target-value">
                <CountTo
                :startVal="0"
                :endVal="targetData.yearCompleted"
                :duration="2000"
                />
            </div>
          </div>
          <div class="target-item">
            <div class="target-label">{{ t('dashboard.generalManager.monthCompleted') }}</div>
            <div class="target-value">
                <CountTo
                :startVal="0"
                :endVal="targetData.monthCompleted"
                :duration="2000"
                />
             </div>
          </div>
          <div class="target-item">
            <div class="target-label">{{ t('dashboard.generalManager.actualQualityRate') }}</div>
            <div class="target-value">
              <CountTo
                :startVal="0"
                :endVal="targetData.actualQualityRate"
                :duration="2000"
                :decimals="1"
              />%
            </div>
          </div>
        </div>
        <div class="targets-row">
          <div class="target-item">
            <div class="target-label">{{ t('dashboard.generalManager.yearCompletionRate') }}</div>
            <div class="target-value" :class="getCompletionClass(targetData.yearCompletionRate + '%')">
              <CountTo
                :startVal="0"
                :endVal="targetData.yearCompletionRate"
                :duration="2000"
                :decimals="1"
              />%
            </div>
          </div>
          <div class="target-item">
            <div class="target-label">{{ t('dashboard.generalManager.monthCompletionRate') }}</div>
            <div class="target-value" :class="getCompletionClass(targetData.monthCompletionRate + '%')">
              <CountTo
                :startVal="0"
                :endVal="targetData.monthCompletionRate"
                :duration="2000"
                :decimals="1"
              />%
            </div>
          </div>
          <div class="target-item">
            <div class="target-label"></div>
            <div class="target-value"></div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { CountTo } from 'vue3-count-to'
  // 引入API
  import { getMainData } from '@/api/screen/general/index'
  
  const { t } = useI18n()
  
  // 目标数据
  const targetData = ref({
    yearTarget: 0,
    monthTarget: 0,
    yearQualityTarget: 0,
    yearCompleted: 0,
    monthCompleted: 0,
    actualQualityRate: 0,
    yearCompletionRate: 0,
    monthCompletionRate: 0
  })
  
  // 定时器引用
  let refreshTimer = null
  // 刷新间隔时间 (8小时 = 8 * 60 * 60 * 1000 毫秒)
  const REFRESH_INTERVAL = 8 * 60 * 60 * 1000
  
  // 判断完成率，返回对应的CSS类
  const getCompletionClass = (rate) => {
    if (!rate) return ''
    const numRate = typeof rate === 'string' ? parseFloat(rate.replace('%', '')) : rate
    return numRate >= 100 ? 'up' : numRate >= 90 ? 'medium' : 'down'
  }
  
  // 数据转换函数 - 将API返回的数据转换为组件需要的格式
  const transformApiData = (apiData) => {
    console.log(apiData,'dddddddd')
    if (!apiData) {
      return {
        yearTarget: 0,
        monthTarget: 0,
        yearQualityTarget: 0,
        yearCompleted: 0,
        monthCompleted: 0,
        actualQualityRate: 0,
        yearCompletionRate: 0,
        monthCompletionRate: 0
      }
    }
    
    return {
      yearTarget: apiData.年度目标 || 0,
      monthTarget: apiData.月度目标 || 0,
      yearQualityTarget: parseFloat(apiData.合格率目标 || 0),
      yearCompleted: apiData.年度总箱数 || 0,
      monthCompleted: apiData.月度总箱数 || 0,
      actualQualityRate: parseFloat(apiData.合格率百分比 || 0),
      yearCompletionRate: parseFloat(apiData.年度完成率 || 0),
      monthCompletionRate: parseFloat(apiData.月度完成率 || 0)
    }
  }
  
  // 获取生产目标数据
  const fetchData = async () => {
    try {
      // 调用真实API
      const res = await getMainData({})
      
      if (res) {
        // 转换API数据为组件需要的格式
        targetData.value = transformApiData(res)
      } else {
        console.warn('API返回数据格式异常:', res)
        // 如果API调用失败，使用模拟数据作为备用
        targetData.value = {
          yearTarget: 0,
          monthTarget:0,
          yearQualityTarget: 0,
          yearCompleted: 0, 
          monthCompleted: 0,
          actualQualityRate: 0,
          yearCompletionRate: 0,
          monthCompletionRate: 0
        }
      }
    } catch (error) {
      console.error('获取生产目标数据失败:', error)
      // 错误时使用模拟数据
      targetData.value = {
        yearTarget: 0,
        monthTarget: 0,
        yearQualityTarget: 0,
        yearCompleted: 0, 
        monthCompleted: 0,
        actualQualityRate: 0,
        yearCompletionRate: 0,
        monthCompletionRate: 0
      }
    }
  }
  
  // 格式化数字：添加千位分隔符
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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
  
  .production-targets {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 8px 12px; // 减小内边距
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
    
    .title {
      color: #E6F7FF;
      font-size: 16px;
      margin: 0 0 10px 0; 
      font-weight: normal;
      padding: 4px 8px; // 减小内边距
      border-radius: 3px;
      // 添加渐变背景色
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
        background: #5A8DEE;
        border-radius: 2px;
      }
    }
    
    .targets-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      justify-content: space-between;
      
      .targets-row {
        display: flex;
        justify-content: space-between;
        flex: 1;
        position: relative;
        
        // 修改：添加水平分隔线样式
        &:not(:last-child)::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .target-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          position: relative;
          padding: 5px 3px; // 减小内边距
          
          // 修改：调整垂直分隔线样式
          &:not(:last-child)::after {
            content: '';
            position: absolute;
            right: 0;
            top: 10%;
            height: 80%;
            width: 1px;
            background-color: rgba(255, 255, 255, 0.1);
          }
          
          .target-label {
            font-size: 13px; // 减小标签字体
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 6px; // 减小间距
            text-align: center;
            height: 16px; // 减小高度
            display: flex;
            align-items: center;
          }
          
          .target-value {
            font-size: 1.5rem; // 减小数值字体
            font-weight: bold;
            color: #5A8DEE; // 默认蓝色
            text-align: center;
            height: 30px; // 减小高度
            display: flex;
            align-items: center;
            justify-content: center;
            text-shadow: 0 0 10px rgba(90, 141, 238, 0.3); // 添加文字阴影
            
            &.up {
              color: #4caf50;
              text-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
            }
            
            &.medium {
              color: #ff9800;
              text-shadow: 0 0 10px rgba(255, 152, 0, 0.3);
            }
            
            &.down {
              color: #f44336;
              text-shadow: 0 0 10px rgba(244, 67, 54, 0.3);
            }
          }
        }
      }
    }
  }
  </style>
  
