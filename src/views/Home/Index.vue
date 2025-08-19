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
        :class="{ 'loading': loadingStates[item.id] }"
        @click="(event) => { addClickAnimation(event); openUrl(item); }"
      >
        <div class="card-content">
          <div class="card-icon">
            <el-avatar
             :src="item.systemImg"
             :size="70"
             />
            <!-- Loading 遮罩层 -->
            <div v-if="loadingStates[item.id]" class="loading-overlay">
              <el-icon class="loading-spinner">
                <Loading />
              </el-icon>
            </div>
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
      width="650px"
    >
      <el-form :model="settingForm" label-width="80px" autocomplete="off">
          <!-- 隐藏的假输入框,防止浏览器自动填充账号密码 -->
        <input type="text" style="display: none;" />
        <input type="password" style="display: none;" />
        <el-form-item label="账号">
          <el-input v-model="settingForm.userName" placeholder="请输入账号"  :disabled="currentItem.systemName==='集团ERP系统'" autocomplete="off"   :name="'username_' + Math.random().toString(36).substr(2, 9)"/>
          <span class="tips" v-if="currentItem.systemName==='集团企业邮箱'">提示: 请输入正确的邮箱前缀；如 test@amvig.com.cn，需输入test</span>
        </el-form-item>
        <el-form-item v-if="currentItem?.systemName === '集团ERP系统'" label="租户">
          <el-select
            v-model="settingForm.tenantName"
            placeholder="请选择租户名称"
            clearable
            filterable
            style="width: 100%"
            autocomplete="off"
            name="tenant-select-no-autofill"
          >
            <el-option
              v-for="item in tenantOptions"
              :key="item.id"
              :label="item.name"
              :value="item.tenantName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" v-show="currentItem?.systemName !== '集团ERP系统'">
          <el-input 
            v-model="settingForm.password" 
            :type="passwordVisible ? 'text' : 'password'" 
            autocomplete="new-password"
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
import { View, Hide, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as LoginApi from '@/api/login';
import { useUserStore } from '@/store/modules/user';
import { oneOf } from 'vue-types';
// 定义卡片项的接口
interface CardItem {
  userName: string;
  password: string;
  tenantName?: string; // 新增租户名称字段
  id: string;
  systemName: string;
  systemImg: string;
  internalLink: string;
  externalLink: string;
}

// 卡片数据列表
const cardList = ref<CardItem[]>([]);
const tenantOptions = ref([]);
// 获取用户store
const userStore = useUserStore();
const user = computed(() => userStore.user);
// 添加loading状态管理
const loadingStates = ref<Record<string, boolean>>({});

// 设置loading状态
const setCardLoading = (cardId: string, loading: boolean) => {
  loadingStates.value[cardId] = loading;
};
// 获取租户列表
const getTenantNameOptions = async () => {
  try {
    const res = await LoginApi.getTenantNameList();
    tenantOptions.value = res;
    console.log( tenantOptions.value ,'  tenantOptions.value = res;')
  } catch (error) {
    console.error('获取租户列表失败:', error);
  }
};
// 添加点击动画效果
 const addClickAnimation = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    const cardContent = target.querySelector('.card-content') as HTMLElement;
    const cardIcon = target.querySelector('.card-icon') as HTMLElement;
    
    // 检查元素是否存在
    if (!cardContent || !cardIcon) {
      console.warn('Card elements not found');
      return;
    }
   
   // 添加点击动画类
   cardContent.style.transform = 'scale(0.95)';
   cardIcon.style.transform = 'scale(1.15)';
  
  // 创建涟漪效果
  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(64, 158, 255, 0.3);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  `;
  
  const rect = cardIcon.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = '50%';
  ripple.style.top = '50%';
  ripple.style.marginLeft = -size / 2 + 'px';
  ripple.style.marginTop = -size / 2 + 'px';
  
  cardIcon.appendChild(ripple);
  
  // 恢复动画
  setTimeout(() => {
    cardContent.style.transform = '';
    cardIcon.style.transform = '';
  }, 150);
  
  // 清理涟漪元素
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 600);
};

// 打开URL到新标签页
const openUrl = async (item: CardItem) => {
  const url = networkType.value==='内网'? item.internalLink : item.externalLink;
  if(!url) {
    ElMessage.error(`未获取跳转路径,请切换成${networkType.value==='内网'?'外网':'内网'}模式!`);
    return;
  }
  
  // 设置loading状态
  setCardLoading(item.id, true);
  
  try {
    switch (item.systemName) {
      case '澳美MES':
        const accessToken = await SsoSystemApi.getSsoSystemToken({
          inside: networkType.value==='内网'?true:false,
          id:item.id
        });
        if (accessToken) {
          window.open(`${url}login?tenant-id=${158}&token=${accessToken}`, '_blank');
        } else {
          ElMessage.error(accessToken?.msg || '自动登录失败');
        }
        break;

      case '智源MES':
        const zyres = await SsoSystemApi.getSsoSystemToken({
          inside: networkType.value==='内网'?true:false,
          id:item.id
        });
        if (zyres) {
          window.open(`${url}outside/oauth_login/action:login/access_token:` + zyres, "_blank");
        } else {
          ElMessage.error(zyres?.msg || '自动登录失败');
        }
        break;

      case '东合MES':
        const dhres = await SsoSystemApi.getSsoSystemToken({
          inside: networkType.value==='内网'?true:false,
          id:item.id
        });
        if (dhres) {
          window.open(`${url}outside/oauth_login/action:login/access_token:` + dhres, "_blank");
        } else {
          ElMessage.error(dhres?.msg || '自动登录失败');
        }
        break;

      case '智源HR':
        const hrres = await SsoSystemApi.getSsoSystemToken({
          inside: networkType.value==='内网'?true:false,
          id:item.id
        });
        if (hrres) {
          window.open(`${window.location.origin}/hrAutoLogin?encJsonData=${encodeURIComponent(hrres)}`, '_blank');
        } else {
          ElMessage.error(hrres?.msg || '自动登录失败');
        }
        break;

      case '集团OA系统':
        const oares = await SsoSystemApi.getSsoSystemToken({
          inside: networkType.value==='内网'?true:false,
          id:item.id
        });
        if (oares) {
          window.open(`${window.location.origin}/amAutoLogin?logininfo=${oares}`, '_blank');
        } else {
          ElMessage.error(oares?.msg || '自动登录失败');
        }
        break;

      case '集团企业邮箱':
        const emailres = await SsoSystemApi.getSsoSystemToken({
          inside: networkType.value==='内网'?true:false,
          id:item.id
        });
        if (emailres) {
          window.open(`https://entryhz.qiye.163.com/login/ssoLogin?sso_token=${emailres}&lang=0`, '_blank');
        } else {
          ElMessage.error(emailres?.msg || '自动登录失败');
        }
        break;


        case '集团ERP系统':
        const ERP_res = await SsoSystemApi.getSsoSystemToken({
          inside: networkType.value==='内网'?true:false,
          id:item.id
        });
        console.log(typeof ERP_res==='string','typeof ERP_res')
        if(ERP_res && typeof ERP_res==='string'){
          const erpObj = JSON.parse(ERP_res);
          const erp_url = erpObj.payload.std_data.parameter.url
          console.log(erp_url,'erp_url')
          window.open(`${erp_url}`, '_blank');
        }
        break;
        
      default:
        window.open(item.internalLink, '_blank');
        break;
    }
  } catch (error) {
    console.error('自动登录出错:', error);
    setCardLoading(item.id, false);
    ElMessage.error('自动登录失败');
  } finally {
    // 无论成功失败都要清除loading状态
    setCardLoading(item.id, false);
  }
};

// 设置弹框相关
const dialogVisible = ref(false);
const currentItem = ref<CardItem | null>(null);
const passwordVisible = ref(false); // 控制密码显示/隐藏
const settingForm = reactive({
  userName: '',
  password: '',
  tenantName: '',
  id:""
});

// 打开设置弹框
const openSettingDialog = async (item: CardItem) => {
  if (item.systemName === '集团ERP系统') {
    await getTenantNameOptions();
  }
  
  currentItem.value = item;
  // 这里可以根据实际情况加载已保存的账号密码
  settingForm.userName =item.systemName === '集团ERP系统'?user.value.username : item.userName;
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
        password: currentItem.value.systemName === '集团ERP系统'?settingForm.tenantName:settingForm.password,
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
  const res = await SsoSystemApi.getSsoSystemPage()
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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:active {
      transform: scale(0.95);
    }
    
    &:hover {
      .card-icon {
        transform: scale(1.1);
        background: rgba(64, 158, 255, 0.2);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      }
      
      .card-name {
        color: #409EFF;
        transform: translateY(-2px);
      }
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
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.6s ease;
    }
    
    &:active::before {
      width: 100%;
      height: 100%;
    }
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      
      .loading-spinner {
        font-size: 24px;
        color: #409EFF;
        animation: spin 1s linear infinite;
      }
    }
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

// Loading旋转动画
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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
.tips {
  font-size: 14px;
  color: #f56c6c;
}

// 涟漪动画关键帧
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

// 弹性点击动画
@keyframes bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

// 图标脉冲动画
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}
</style>
