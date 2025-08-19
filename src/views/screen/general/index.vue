<template>
  <div ref="screenContainer" class="general-container">
    <!-- 顶部标题 -->
    <div class="header">
      <div class="logo-container">
        <img src="@/assets/screen/images/logo.png" alt="Logo" class="logo"/>
      </div>
      <h1 class="title">{{ $t('dashboard.generalManager.title') }}</h1>
      <div class="time-container">
        <div class="time">
          <span style="margin-right: 10px;">{{ currentDate }}</span>
          <span>{{ currentTime }}</span>
        </div>
        <!-- 使用 useFullscreen 的全屏按钮 -->
        <button class="fullscreen-btn" @click="toggle">
          <img :src="isFullscreen ? unfullscreenIcon : fullscreenIcon" alt="fullscreen" />
        </button>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <div class="left">
        <div class="left-top">
          <BrandCompletionTable />
        </div>
      </div>
      <div class="center">
        <div class="center-top">
          <ProductionTargets />
        </div>
        <div class="center-bottom">
          <div class="center-bottom-top">
            <MonthlyProductionChart />
          </div>
          <div class="center-bottom-bottom">
            <MonthlySalesChart />
          </div>
        </div>
      </div>
      <div class="right">
        <div class="right-top">
          <EmergencyOrderTracker />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useFullscreen } from '@vueuse/core'
import fullscreenIcon from '@/assets/screen/icon_svg/fullscreen.svg'
import unfullscreenIcon from '@/assets/screen/icon_svg/unfullscreen.svg'
import BrandCompletionTable from './components/BrandCompletionTable.vue'
import MonthlySalesChart from './components/MonthlySalesChart.vue'
import MonthlyProductionChart from './components/MonthlyProductionChart.vue'
import EmergencyOrderTracker from './components/EmergencyOrderTracker.vue'
import ProductionTargets from './components/ProductionTargets.vue'
import { useI18n } from 'vue-i18n'
// 获取容器引用
const screenContainer = ref()
const { t } = useI18n()
// 使用 useFullscreen
const { isFullscreen, toggle } = useFullscreen(screenContainer)

// 当前时间和日期
const currentTime = ref(new Date().toLocaleTimeString())
const currentDate = ref(new Date().toLocaleDateString())
const timeTimer = setInterval(() => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString()
  currentDate.value = now.toLocaleDateString()
}, 1000)

onUnmounted(() => {
  clearInterval(timeTimer)
})
</script>

<style lang="scss" scoped>
@use "sass:math";

.general-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #001529;
  color: #E6F7FF;

  // 全屏状态下的样式
  &:fullscreen {
    background: #001529;
    color: #E6F7FF;
    padding: 0;
    margin: 0;
  }

  .header {
    height: 54px;
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    align-items: center;
    padding: 0;
    background-image: url('@/assets/screen/images/title3.png');
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    border-bottom: 1px solid rgba(#40C4FF, 0.2);
    
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 0 20px 0 0px;
      perspective: 1000px;

      .logo {
        height: 40px;
        width: auto;
        object-fit: contain;
        animation: logoFadeIn 1.5s ease-out, logoRepeat 11s 1.5s infinite;
        opacity: 0;
        transform: scale(0.8) rotateY(90deg);
        transform-style: preserve-3d;
        backface-visibility: visible;
        position: absolute;
        left: 12px;
        top: 6px;
      }
    }
    
    .title {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      color: #E6F7FF;
      text-shadow: 0 0 20px rgba(#40C4FF, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      margin: 0;
    }
    
    .time-container {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      height: 50px;
      width: 220px;
      position: absolute;
      right: 24px;
      top: 0;
      
      .time {
        font-size: 16px;
        color: #40C4FF;
        font-family: 'Digital-7', monospace;
        text-shadow: 0 0 10px rgba(#40C4FF, 0.5);
        line-height: 1.2;
        width: 100%;
      }
      
      .fullscreen-btn {
        background: none;
        border: none;
        outline: none;
        cursor: pointer;
        margin-left: 12px;
        margin-right: 12px;
        display: flex;
        align-items: center;
        
        img {
          width: 18px;
          height: 18px;
          display: block;
        }
      }
    }
  }
  
  .main-content {
    height: calc(100% - 54px);
    width: 100%;
    display: flex;
    flex-direction: row;
    padding-top: 6px;
    
    .left {
      width: 35%;
      
      .left-top {
        width: 100%;
        height: 100%;
        padding: 8px 4px;
      }
    }
    
    .center {
      width: 60%;
      height: 100%;
      
      .center-top {
        width: 100%;
        height: 30%;
        padding: 8px 4px;
      }
      
      .center-bottom {
        width: 100%;
        height: 70%;
        
        .center-bottom-top {
          width: 100%;
          height: calc(35vh - 23.5px);
          padding: 4px 4px;
        }
        
        .center-bottom-bottom {
          width: 100%;
          height: calc(35vh - 23.5px);
          padding: 4px 4px;
        }
      }
    }
    
    .right {
      width: 35%;
      
      .right-top {
        width: 100%;
        height: 100%;
        padding: 8px 4px;
      }
    }
  }
}

// 动画
@keyframes scan {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(40px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(#00A1FF, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(#00A1FF, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(#00A1FF, 0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
    transform: translateY(-100px) scale(1.2);
  }
  100% {
    transform: translateY(-200px) scale(1);
    opacity: 0;
  }
}

@keyframes borderGlow {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.5;
  }
}

@keyframes shine {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}

@keyframes moveVerticalDown {
  0% {
    top: -25%;
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

@keyframes moveHorizontalRight {
  0% {
    left: -25%;
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

@keyframes logoFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.8) rotateY(90deg);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05) rotateY(0deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateY(0deg);
  }
}

@keyframes logoRepeat {
  0%, 90.9% {
    opacity: 1;
    transform: scale(1) rotateY(0deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.8) rotateY(90deg);
  }
}
</style>
  