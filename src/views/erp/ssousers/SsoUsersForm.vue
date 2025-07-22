<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="110px"
      v-loading="formLoading"
    >
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="单点登录系统" prop="systemId">
        <el-select 
          v-model="formData.systemId" 
          placeholder="请选择单点登录系统"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in systemOptions"
            :key="item.id"
            :label="item.systemName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="formData.userName" placeholder="请输入用户名称" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="formData.password" placeholder="请输入密码" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { SsoUsersApi, SsoUsers } from '@/api/erp/ssousers'
import { SsoSystemApi, SsoSystem } from '@/api/erp/ssosystem'
/** 单点登录用户 表单 */
defineOptions({ name: 'SsoUsersForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const systemOptions = ref<SsoSystem[]>([]) // 系统选项列表

const formData = ref({
  id: undefined,
  userId: undefined,
  systemId: undefined,
  userName: undefined,
  password: undefined,
})
const formRules = reactive({
  systemId: [{ required: true, message: '单点登录系统不能为空', trigger: 'change' }],
  userName: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 获取系统列表 */
const getSystemList = async () => {
  try {
    const data = await SsoSystemApi.getSsoSystemPage({})
    systemOptions.value = data.list || []
  } catch (error) {
    console.error('获取系统列表失败:', error)
    systemOptions.value = []
  }
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  
  // 获取系统列表
  await getSystemList()
  
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await SsoUsersApi.getSsoUsers(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as SsoUsers
    if (formType.value === 'create') {
      await SsoUsersApi.createSsoUsers(data)
      message.success(t('common.createSuccess'))
    } else {
      await SsoUsersApi.updateSsoUsers(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    userId: undefined,
    systemId: undefined,
    userName: undefined,
    password: undefined,
  }
  formRef.value?.resetFields()
}
</script>