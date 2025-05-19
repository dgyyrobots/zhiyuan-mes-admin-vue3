<template>
  <div class="content">
    <div class="card-container">
      <div 
        v-for="(item, index) in cardList"
        :key="index" 
        class="card-item"
        @click="openUrl(item.url)"
      >
        <div class="card-icon">
          <Icon
           :icon="item.icon"
           :size="40"
           />
        </div>
        <div class="card-name">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// 定义卡片项的接口
interface CardItem {
  name: string;
  url: string;
  icon: string;
}

// 卡片数据列表
const cardList = ref<CardItem[]>([
  {
    name: '测试地址1',
    url: 'https://www.example.com/test1',
    icon: 'ep:element-plus'
  },
  {
    name: '测试地址2',
    url: 'https://www.example.com/test2',
    icon: 'ep:element-plus'
  },
  {
    name: '测试地址3',
    url: 'https://www.example.com/test3',
    icon: 'ep:element-plus'
  },
  {
    name: '测试地址4',
    url: 'https://www.example.com/test4',
    icon: 'ep:element-plus'
  },
  {
    name: '测试地址5',
    url: 'https://www.example.com/test5',
    icon: 'ep:element-plus'
  }
]);

// 打开URL到新标签页
const openUrl = (url: string) => {
  window.open(url, '_blank');
};
</script>

<style lang="scss" scoped>
.content {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  min-height: calc(100vh - 160px);
  min-width: calc(100vw - 240px);
  padding: 24px;
}



.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 10px;
}

.card-item {
  width: 220px;
  height: 160px;
  background: white;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: #409EFF;
    transform: translateY(-100%);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    
    &::before {
      transform: translateY(0);
    }
  }
  
  .card-icon {
    margin-bottom: 20px;
    color: #409EFF;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: rgba(64, 158, 255, 0.1);
  }
  
  .card-name {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
}
</style>
