<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="系统图标" prop="systemImg">
        <el-input v-model="formData.systemImg" placeholder="请输入系统图标" />
      </el-form-item>
      <el-form-item label="系统名称" prop="systemName">
        <el-input v-model="formData.systemName" placeholder="请输入系统名称" />
      </el-form-item>
      <el-form-item label="内部访问网址" prop="internalLink">
        <el-input v-model="formData.internalLink" placeholder="请输入内部访问网址" />
      </el-form-item>
      <el-form-item label="外部访问网址" prop="externalLink">
        <el-input v-model="formData.externalLink" placeholder="请输入外部访问网址" />
      </el-form-item>
      <el-form-item label="备用1" prop="standby1">
        <el-input v-model="formData.standby1" placeholder="请输入备用1" />
      </el-form-item>
      <el-form-item label="备用2" prop="standby2">
        <el-input v-model="formData.standby2" placeholder="请输入备用2" />
      </el-form-item>
      <el-form-item label="备用3" prop="standby3">
        <el-input v-model="formData.standby3" placeholder="请输入备用3" />
      </el-form-item>
      <el-form-item label="备用4" prop="standby4">
        <el-input v-model="formData.standby4" placeholder="请输入备用4" />
      </el-form-item>
      <el-form-item label="备用5" prop="standby5">
        <el-input v-model="formData.standby5" placeholder="请输入备用5" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { SsoSystemApi, SsoSystem } from '@/api/erp/ssosystem'

/** 单点登录系统 表单 */
defineOptions({ name: 'SsoSystemForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  systemImg: undefined,
  systemName: undefined,
  internalLink: undefined,
  externalLink: undefined,
  standby1: undefined,
  standby2: undefined,
  standby3: undefined,
  standby4: undefined,
  standby5: undefined,
})
const formRules = reactive({
  systemName: [{ required: true, message: '系统名称不能为空', trigger: 'blur' }],
  internalLink: [{ required: true, message: '内部访问网址不能为空', trigger: 'blur' }],
  externalLink: [{ required: true, message: '外部访问网址不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await SsoSystemApi.getSsoSystem(id)
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
    const data = formData.value as unknown as SsoSystem
    if (formType.value === 'create') {
      await SsoSystemApi.createSsoSystem(data)
      message.success(t('common.createSuccess'))
    } else {
      await SsoSystemApi.updateSsoSystem(data)
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
    systemImg: undefined,
    systemName: undefined,
    internalLink: undefined,
    externalLink: undefined,
    standby1: undefined,
    standby2: undefined,
    standby3: undefined,
    standby4: undefined,
    standby5: undefined,
  }
  formRef.value?.resetFields()
}
</script>