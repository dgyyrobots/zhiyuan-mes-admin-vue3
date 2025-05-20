<template>
  <div class="content">
    <div class="card-container">
      <div 
        v-for="(item, index) in cardList"
        :key="index" 
        class="card-item"
      >
        <div class="card-content" @click="openUrl(item.sysUrl)">
          <div class="card-icon">
            <el-avatar
             :src="item.sysLogUrl"
             :size="70"
             />
          </div>
          <div class="card-name">{{ item.sysName }}</div>
        </div>
        <div class="card-setting" @click.stop="openSettingDialog(item)">
          <Icon icon="ep:setting" :size="16" />
        </div>
      </div>
    </div>

    <!-- 设置弹框 -->
    <el-dialog
      v-model="dialogVisible"
      title="账号设置"
      width="450px"
    >
      <el-form :model="settingForm" label-width="80px">
        <el-form-item label="账号">
          <el-input v-model="settingForm.userName" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input 
            v-model="settingForm.password" 
            :type="passwordVisible ? 'text' : 'password'" 
            placeholder="请输入密码">
            <template #suffix>
              <el-icon 
                class="password-eye" 
                @click.stop="passwordVisible = !passwordVisible">
                <View v-if="passwordVisible" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSettings">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import * as HomeApi from '@/api/system/homeSet';
import { View, Hide } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
// 定义卡片项的接口
interface CardItem {
  userName: string;
  password: string;
  sysId:string,
}

// 卡片数据列表
const cardList = ref<CardItem[]>([
  // {
  //   name: '测试地址1',
  //   url: 'https://www.example.com/test1',
  //   icon: 'ep:element-plus'
  // },
  // {
  //   name: '测试地址2',
  //   url: 'https://www.example.com/test2',
  //   icon: 'ep:element-plus'
  // },
  // {
  //   name: '测试地址3',
  //   url: 'https://www.example.com/test3',
  //   icon: 'ep:element-plus'
  // },
  // {
  //   name: '测试地址4',
  //   url: 'https://www.example.com/test4',
  //   icon: 'ep:element-plus'
  // },
  // {
  //   name: '测试地址5',
  //   url: 'https://www.example.com/test5',
  //   icon: 'ep:element-plus'
  // }
]);

// 打开URL到新标签页
const openUrl = (url: string) => {
  window.open(url, '_blank');
};

// 设置弹框相关
const dialogVisible = ref(false);
const currentItem = ref<CardItem | null>(null);
const passwordVisible = ref(false); // 控制密码显示/隐藏
const settingForm = reactive({
  userName: '',
  password: '',
  sysId:""
});

// 打开设置弹框
const openSettingDialog = (item: CardItem) => {
  currentItem.value = item;
  // 这里可以根据实际情况加载已保存的账号密码
  settingForm.userName = item.userName;
  settingForm.password = item.password;
  settingForm.sysId = item.sysId ;
  dialogVisible.value = true;
};

// 保存设置
const saveSettings = async () => {
  if (currentItem.value) {
    try {
      const params = {
        userName: settingForm.userName,
        password: settingForm.password,
        sysId: settingForm.sysId
      };
      
      const res = await HomeApi.registerAccountPwd(params);
      
      if (res=== '账号密码设置完成') {
        ElMessage.success('账号密码保存成功');
        // 更新当前项的账号密码
        if (currentItem.value) {
          currentItem.value.userName = settingForm.userName;
          currentItem.value.password = settingForm.password;
        }
      } else {
        ElMessage.error(res.msg || '保存失败');
      }
    } catch (error) {
      console.error('保存账号密码出错:', error);
      ElMessage.error('保存失败，请稍后重试');
    }
  }
  dialogVisible.value = false;
};

const getList = async () => {
  console.log('getList111111')
  const res = await HomeApi.getJumpList()
  console.log(res,'ddddddddddddd')
  if (res.code === 0) {
    cardList.value = res.data
  }
}
onMounted(async () => {
  await getList()
})
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
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
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
  
  .card-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
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
  
  .card-setting {
    position: absolute;
    right: 10px;
    bottom: 10px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #666;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(64, 158, 255, 0.2);
      color: #409EFF;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.password-eye {
  cursor: pointer;
  color: #909399;
  
  &:hover {
    color: #409EFF;
  }
}
</style>
