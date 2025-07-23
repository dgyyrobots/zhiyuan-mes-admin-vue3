<template>
  <div class="content">
    <div class="network-switch">
      <span class="network-label">网络类型：</span>
      <el-select 
        v-model="networkType" 
        placeholder="请选择网络类型"
        style="width: 120px"
        @change="handleNetworkChange"
      >
        <el-option label="内网" value="内网" />
        <el-option label="外网" value="外网" />
      </el-select>
    </div>
    <div class="card-container">
      <div 
        v-for="(item, index) in cardList"
        :key="index" 
        class="card-item"
      >
        <div class="card-content" @click="openUrl(item)">
          <div class="card-icon">
            <el-avatar
             :src="item.systemImg"
             :size="70"
             />
          </div>
          <div class="card-name">{{ item.systemName }}</div>
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
import { SsoSystemApi } from '@/api/erp/ssosystem';
import { SsoUsersApi } from '@/api/erp/ssousers';

import * as HomeApi from '@/api/system/homeSet';
import { View, Hide } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
// 定义卡片项的接口
interface CardItem {
  userName: string;
  password: string;
  id:string,
  systemName:string,
  systemImg:string,
  internalLink:string,
  externalLink:string
}

// 卡片数据列表
const cardList = ref<CardItem[]>([]);

// 打开URL到新标签页
const openUrl = async (item: CardItem) => {

  const url = networkType.value==='内网'? item.internalLink : item.externalLink  // externalLink 是外网, internalLink 是内网
  if(!url) {
    ElMessage.error(`未获取跳转路径,请切换成${networkType.value==='内网'?'外网':'内网'}模式!`);
    return;
  }
  try {
    switch (item.systemName) {
      case '澳美MES':
        // 调用自动登录接口
        const accessToken = await SsoSystemApi.getSsoSystemToken({
          inside: networkType.value==='内网'?true:false,
          id:item.id
        });
        if (accessToken) {
          // 参照main.html中的URL格式，使用token参数
          window.open(`${url}login?tenant-id=${158}&token=${accessToken}`, '_blank');
        } else {
          ElMessage.error(accessToken?.msg || '自动登录失败');
        }
        break;

        case '智源MES':
          // 调用自动登录接口
          const zyres = await SsoSystemApi.getSsoSystemToken({
            inside: networkType.value==='内网'?true:false,
            id:item.id
          });
          const zy_accessToken = zyres
          if (zy_accessToken) {
            window.open(`${url}outside/oauth_login/action:login/access_token:` + zy_accessToken, "_blank");
          } else {
          ElMessage.error(zyres?.msg || '自动登录失败');
        }
        break;

        case '东合MES':
        // 调用自动登录接口
         const dhres = await SsoSystemApi.getSsoSystemToken({
            inside: networkType.value==='内网'?true:false,
            id:item.id
          });
         const dh_accessToken = dhres
          if (dh_accessToken) {
            window.open(`${url}outside/oauth_login/action:login/access_token:` + dh_accessToken, "_blank");
          } else {
          ElMessage.error(dhres?.msg || '自动登录失败');
        }
        break;

        case '智源HR':
        // 调用自动登录接口
         const hrres = await SsoSystemApi.getSsoSystemToken({
            inside: networkType.value==='内网'?true:false,
            id:item.id
          });
          const hr_accessToken = hrres
          if (hr_accessToken) {
            // 使用window.open在新标签页中打开
            window.open(`${window.location.origin}/HRAutoLogin?encJsonData=${encodeURIComponent(hr_accessToken)}`, '_blank');

            // window.open(`http://172.16.12.101:9000/ammes/HRAutoLogin.html?encJsonData=${encodeURIComponent(hr_accessToken)}`, '_blank');
          } else {
          ElMessage.error(hrres?.msg || '自动登录失败');
        }
        break;
      default:
        // 其他系统的处理逻辑
        window.open(item.internalLink, '_blank');
        break;
    }
  } catch (error) {
    console.error('自动登录出错:', error);
    ElMessage.error('自动登录失败，请稍后重试');
  }
};

// 设置弹框相关
const dialogVisible = ref(false);
const currentItem = ref<CardItem | null>(null);
const passwordVisible = ref(false); // 控制密码显示/隐藏
const settingForm = reactive({
  userName: '',
  password: '',
  id:""
});

// 打开设置弹框
const openSettingDialog = (item: CardItem) => {
  currentItem.value = item;
  // 这里可以根据实际情况加载已保存的账号密码
  settingForm.userName = item.userName;
  settingForm.password = item.password;
  settingForm.id = item.id ;
  dialogVisible.value = true;
};

// 保存设置
const saveSettings = async () => {
  if (currentItem.value) {
    try {
      const params = {
        userName: settingForm.userName,
        password: settingForm.password,
        systemId: settingForm.id
      };
      
      // const res = await HomeApi.registerAccountPwd(params);
      const res = await SsoUsersApi.addOrUpdateSsoUsers(params);
      
      if (res && res.code=== 0) {
        ElMessage.success('账号密码保存成功');
        // 更新当前项的账号密码
        if (currentItem.value) {
          currentItem.value.userName = settingForm.userName;
          currentItem.value.password = settingForm.password;
        }
        // 重新请求列表数据，刷新页面
        await getList();
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

// 在 script 部分添加
// 网络类型选择
const networkType = ref(localStorage.getItem('networkType') || '内网');

// 处理网络类型切换
const handleNetworkChange = async () => {
  // 将选择保存到本地存储
  localStorage.setItem('networkType', networkType.value);
};

const getList = async () => {
  console.log('getList111111')
  const res = await SsoSystemApi.getSsoSystemPage()
  console.log(res,'ddddddddddddd')
  if (res.list) {
    cardList.value = res.list
  } else {
   cardList.value = []
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

.network-switch {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  justify-content: flex-start;
  padding-right: 10px;
}

.network-label {
  margin-right: 10px;
  font-size: 14px;
  color: #606266;
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
