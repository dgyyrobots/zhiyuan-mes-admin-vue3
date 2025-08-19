<template>
  <div class="monthly-sales-chart">
    <h3 class="chart-title">{{ t('dashboard.generalManager.monthlySales') }}</h3>
    <div class="chart-content">
      <div class="chart-container" ref="chartRef"></div>
      <div v-if="!chartData.xAxis.length" class="no-data">
        {{ t('dashboard.generalManager.noData') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useI18n } from '/@/hooks/web/useI18n'
import { useLocaleStoreWithOut } from '@/store/modules/locale'
import { getSalesOrderTracking } from '@/api/screen/general/index'
// 图表引用
const chartRef = ref(null)
let chart = null

const localeStore = useLocaleStoreWithOut()
const { t } = useI18n()

// 图表数据
const chartData = ref({
  xAxis: [],
  targetData: [],
  actualData: [],
  completionRateData: []
})

// 表格数据
const tableData = ref([])

// 定时器引用
let refreshTimer = null
// 刷新间隔时间 (8小时 = 8 * 60 * 60 * 1000 毫秒)
const REFRESH_INTERVAL = 8 * 60 * 60 * 1000

// 格式化数字：保留整数并添加千位分隔符
const formatInteger = (num) => {
  if (num === null || num === undefined) return '-'
  // 先四舍五入为整数
  const roundedNum = Math.round(num)
  // 转为字符串并添加千位分隔符
  return roundedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 更新图表
const updateChart = () => {
  if (!chart) return

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        // 自定义提示框内容
        let result = params[0].name + '<br/>';
        params.forEach(item => {
          let colorSpan = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${item.color};"></span>`;
          let value = item.seriesName === t('dashboard.generalManager.completionRatio') ? 
                      item.value + '%' : 
                      item.value + ' ' + t('dashboard.generalManager.quantity').replace(' (万箱)', '');
          result += colorSpan + item.seriesName + ': ' + value + '<br/>';
        });
        return result;
      },
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: [t('dashboard.generalManager.target'), t('dashboard.generalManager.actualValue'), t('dashboard.generalManager.completionRatio')],
      textStyle: {
        color: '#fff'
      },
      right: '5%',
      top: '0%'
    },
    grid: {
      top: '15%',
      left: '5%',
      right: '5%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.value.xAxis,
      axisLine: {
        lineStyle: {
          color: '#0B3E5E'
        }
      },
      axisLabel: {
        color: '#fff',
        fontSize: 12,
        interval: 0
      }
    },
    yAxis: [
      {
        type: 'value',
        name: t('dashboard.generalManager.quantity'),
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255,255,255,0.08)',
            width: 1,
            type: 'solid'
          }
        },
        axisLabel: {
          color: '#fff',
          fontSize: 12,
          formatter: '{value}',
          margin: 18,
        }
      },
      {
        type: 'value',
        name: t('dashboard.generalManager.ratio'),
        min: 0,
        // 修改最大值为动态计算，确保能显示所有数据
        max: function(value) {
          // 取最大完成率的1.2倍，确保有足够空间，且最小不低于100%
          return Math.max(100, Math.ceil(Math.max(...chartData.value.completionRateData) * 1.2));
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          color: '#fff',
          fontSize: 12,
          formatter: '{value}%'
        }
      }
    ],
    series: [
        {
          name: t('dashboard.generalManager.target'),
          type: 'bar',
          data: chartData.value.targetData,
          barWidth: 12,
          itemStyle: {
            color: '#FF9F43'
          },
          // 修改标签显示逻辑
          label: {
            show: true,
            position: ['-60%', '60%'],
            formatter: function(params) {
              // 如果值为0，返回空字符串，否则返回值
              return params.value > 0 ? params.value : '';
            },
            fontSize: 12,
            color: '#FF9F43',
            fontWeight: 'bold',
            distance: 5,
            backgroundColor: 'rgba(0, 31, 61, 0.7)',
            padding: [2, 4],
            borderRadius: 2
          }
        },
        {
          name: t('dashboard.generalManager.actualValue'),
          type: 'bar',
          data: chartData.value.actualData,
          barWidth: 12,
          itemStyle: {
            color: '#5A8DEE'
          },
          // 修改标签显示逻辑
          label: {
            show: true,
            position: ['60%', '40%'],
            formatter: function(params) {
              // 如果值为0，返回空字符串，否则返回值
              return params.value > 0 ? params.value : '';
            },
            fontSize: 12,
            color: '#5A8DEE',
            fontWeight: 'bold',
            distance: 5,
            backgroundColor: 'rgba(0, 31, 61, 0.7)',
            padding: [2, 4],
            borderRadius: 2
          }
        },
        {
          name: t('dashboard.generalManager.completionRatio'),
          type: 'line',
          yAxisIndex: 1,
          data: chartData.value.completionRateData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#FFCE3A'
          },
          lineStyle: {
            width: 3,
            color: '#FFCE3A'
          },
          // 完成比例标签保持不变
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%',
            fontSize: 12,
            color: '#FFCE3A',
            fontWeight: 'bold',
            distance: 5,
            backgroundColor: 'rgba(0, 31, 61, 0.7)',
            padding: [2, 4],
            borderRadius: 2
          }
        }
      ]
  }
  
  chart.setOption(option)
}

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    updateChart()
    window.addEventListener('resize', handleResize)
  }
}

// 处理窗口大小变化
const handleResize = () => {
  chart?.resize()
}
// 国际化月份格式化函数
const formatMonthWithLocale = (monthNumber) => {
  const currentLang = localeStore.getCurrentLocale.lang
  
  // 获取月份数组
  const months = t('dashboard.generalManager.months')
  
  // 如果有月份数组且索引有效，使用数组中的值
  if (Array.isArray(months) && months[monthNumber - 1]) {
    return months[monthNumber - 1]
  }
  
  // 回退方案：根据语言返回不同格式
  if (currentLang === 'en') {
    const englishMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return englishMonths[monthNumber - 1] || `Month ${monthNumber}`
  } else {
    // 默认中文
    return `${monthNumber}月`
  }
}
// 模拟数据，实际项目中应该从API获取
const fetchData = async () => {
  try {
    // 调用真实API
    const res = await getSalesOrderTracking()
    console.log(res, 'API返回数据')
    
    let processedData = []
    
    // 处理API返回的数据
    if (res &&res .length) {
      // 如果返回的是数组
      if (Array.isArray(res)) {
        processedData = res.map(item => ({
          month: formatMonth(item.月份),
          target: parseFloat((parseFloat(item.目标值) / 10000).toFixed(2)), // 转换为万箱并保留2位小数
          actual: parseFloat((parseFloat(item.配套烟箱数量) / 10000).toFixed(2)), // 转换为万箱并保留2位小数
          completionRate: parseFloat(parseFloat(item.完成率).toFixed(2)) // 保留2位小数
        }))
      } 
    }
    
    // 如果没有数据，使用备用数据
    if (processedData.length === 0) {
      console.warn('API未返回有效数据，使用备用数据')
      processedData = [
        { month: '1', target: 0, actual: 0, completionRate: 0 },
        { month: '2', target: 0, actual: 0, completionRate: 0  },
        { month: '3', target: 0, actual: 0, completionRate: 0  },
        { month: '4', target: 0, actual: 0, completionRate: 0 },
        { month: '5', target: 0, actual: 0, completionRate: 0  },
        { month: '6', target: 0, actual: 0, completionRate: 0 },
        { month: '7', target: 0, actual: 0, completionRate: 0  },
        { month: '8', target: 0, actual: 0, completionRate: 0  },
        { month: '9', target: 0, actual: 0, completionRate: 0  },
        { month: '10',target: 0, actual: 0, completionRate: 0  },
        { month: '11',target: 0, actual: 0, completionRate: 0 },
        { month: '12',target: 0, actual: 0, completionRate: 0  }
      ]
    }
    
    // 设置表格数据
    tableData.value = processedData.map(item => ({
      month: item.month + '月',
      target: item.target,
      actual: item.actual,
      completionRate: item.completionRate.toFixed(2)
    }))
    
    // 设置图表数据
    chartData.value.xAxis = processedData.map(item => formatMonthWithLocale(parseInt(item.month)))
    chartData.value.targetData = processedData.map(item => item.target)
    chartData.value.actualData = processedData.map(item => item.actual)
    chartData.value.completionRateData = processedData.map(item => parseFloat(item.completionRate.toFixed(2)))
    
    // 添加日志，查看最大完成率
    console.log('最大完成率:', Math.max(...chartData.value.completionRateData), '%')
        
    initChart()
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

// 新增月份格式化函数
const formatMonth = (monthStr) => {
  if (!monthStr) return ''
  // 处理 "2025-01" 格式，提取月份
  if (monthStr.includes('-')) {
    const parts = monthStr.split('-')
    return parts[1] ? parseInt(parts[1]).toString() : ''
  }
  return monthStr
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
  // 清理事件监听
  window.removeEventListener('resize', handleResize)
  // 销毁图表实例
  chart?.dispose()
  // 组件卸载时清除定时器
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style lang="scss" scoped>
//  @use "@/assets/screen/styles/_variables" as *;

.monthly-sales-chart {
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
  
  .chart-title {
    color: #E6F7FF;
    font-size: 16px;
    margin: 0 0 15px 0;
    font-weight: normal;
    padding: 6px 10px;
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
  
  .chart-content {
    height: 100%;
    position: relative;
    
    .chart-container {
      width: 100%;
      height: 100%;
      position: relative;
      opacity: 0;
      animation: fadeIn 0.5s ease-out forwards;
    }
    
    .no-data {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #86c9f2;
      font-size: 14px;
      text-align: center;
      z-index: 99;
      pointer-events: none;
      opacity: 0;
      animation: fadeIn 0.5s ease-out forwards;
    }
  }
  
  .table-container {
    height: 50%;
    position: relative;
    overflow: auto;
    margin-top: 10px;
    
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      
      thead {
        position: sticky;
        top: 0;
        z-index: 10;
        background-color: #001f3d;
        
        th {
          position: sticky;
          top: 0;
          background-color: rgba(0, 0, 0, 0.2);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 8px 4px;
        }
      }
      
      tbody {
        max-height: 100%;
      }
      
      th, td {
        padding: 8px 4px;
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>