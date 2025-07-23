<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <!-- <el-form-item label="系统图标" prop="systemImg">
        <el-input v-model="formData.systemImg" placeholder="请输入系统图标" />
      </el-form-item> -->


      <el-form-item label="图标地址" prop="systemImg">
        <div class="avatar-uploader">
          <CropperAvatar 
            v-model:value="formData.systemImg" 
            :showBtn="true" 
            btnText="上传图标"
            class="cropper-highest-z" 
            @change="handleAvatarChange" 
            ref="cropperRef"
          />
          <div class="avatar-tip">
            <p>点击图像或按钮可上传新图标</p>
            <p>支持JPG、PNG格式，建议尺寸120×120像素</p>
          </div>
        </div>
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
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { SsoSystemApi, SsoSystem } from '@/api/erp/ssosystem'
import { useUpload } from '@/components/UploadFile/src/useUpload'
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
  }
  formRef.value?.resetFields()
}


/** 处理头像上传成功的回调 -- 上传图片到服务器*/
// const handleAvatarChange = async ({ source, data, filename }) => {
//   console.log('头像上传成功', source);

//   try {
//     // 使用接口上传图片而不是直接使用base64
//     const { httpRequest } = useUpload()
//     const logoUrl = ((await httpRequest({
//       file: data,
//       filename: 'sysLogo.png',
//     } as UploadRequestOptions)) as unknown as { data: string }).data

//     // 使用接口返回的URL替代base64
//     formData.value.systemImg = logoUrl;
//     console.log('图片上传成功，URL:', logoUrl);
//   } catch (error) {
//     console.error('图片上传失败:', error);
//     message.error('图片上传失败');
//   }
  
//   // 不关闭弹框
//   // handleCropperClose();
  
//   // 不隐藏遮罩
//   // if (fullScreenBlocker.value) {
//   //   fullScreenBlocker.value.style.display = 'none';
//   // }
// }
/** 处理头像上传成功的回调-- 上传图片直接使用base64 */
const handleAvatarChange = async ({ source, data, filename }) => {
  console.log('头像上传成功', source);

  try {
    // 直接使用base64格式，不再上传到接口
    if (source && typeof source === 'string') {
      // 如果source是base64格式，直接使用
      formData.value.systemImg = source;
      console.log('使用base64格式图片');
    } else if (data) {
      // 如果data是File对象，转换为base64
      const reader = new FileReader();
      reader.onload = (e) => {
        formData.value.systemImg = e.target?.result as string;
        console.log('图片转换为base64成功');
      };
      reader.onerror = () => {
        console.error('图片转换为base64失败');
        message.error('图片处理失败');
      };
      reader.readAsDataURL(data);
    } else {
      console.error('未找到有效的图片数据');
      message.error('图片数据无效');
    }
  } catch (error) {
    console.error('图片处理失败:', error);
    message.error('图片处理失败');
  }
};
</script>


<!-- 使用更强制的方式设置z-index -->
<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

// 添加头像上传组件的样式
.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;

  .avatar-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 10px;
    text-align: center;
    line-height: 1.5;
    
    p {
      margin: 0;
      padding: 0;
    }
  }
  
  // 覆盖头像组件的hover效果
  :deep(.user-info-head:hover::after) {
    display: none !important; // 完全移除hover效果
  }
  
  // 可选：添加自定义hover效果
  :deep(.user-info-head) {
    &:hover {
      opacity: 0.9;
      transition: opacity 0.3s;
    }
    
    // 确保图片保持椭圆形
    .img-circle {
      border-radius: inherit; // 使用父元素的border-radius
      object-fit: cover; // 确保图片比例正确
    }
  }
}
</style>

<!-- 确保CropperAvatar在需要时能获取焦点 -->
<style>
/* 全局样式覆盖，确保图像裁剪弹窗总是在最上层 */
/* 设置标准弹窗的基础层级 */
.el-dialog__wrapper {
  z-index: 2000 !important; 
}

/* 特别针对图像裁剪使用最高层级，确保它覆盖其他弹窗 */
.el-dialog__wrapper .el-dialog__body .namespace--cropper-am {
  position: relative;
}

/* 当图像裁剪弹窗出现时，确保它是最上层 */
body .el-dialog__wrapper:last-of-type {
  z-index: 9999 !important; /* 使用非常高的值确保位于顶层 */
}

/* 裁剪相关的遮罩层也要提升层级 */
body .el-overlay:last-of-type {
  z-index: 9998 !important;
}

/* 确保裁剪操作的弹窗在最上层 */
.el-message-box__wrapper {
  z-index: 10000 !important;
}

/* 覆盖CropperAvatar组件内部定义的样式 */
.el-dialog.is-fullscreen {
  z-index: 9999 !important;
}

/* 当裁剪对话框打开时应用的样式 - 通过JS应用类名 */
.cropper-dialog-wrapper {
  z-index: 19999 !important;
  background-color: rgba(0, 0, 0, 0.6) !important;
}

/* 当裁剪对话框打开时，其他对话框禁用事件 */
.disable-events {
  pointer-events: none !important;
}

/* 确保裁剪对话框内容完全不透明 */
.cropper-dialog-wrapper .el-dialog {
  background: white !important;
  min-width: 800px !important;
  min-height: 500px !important;
}

/* 确保弹窗内容不会溢出 */
.el-dialog__body {
  overflow: hidden !important;
}

/* 隐藏底层对话框的表单项 */
.hide-form-items .el-form-item {
  visibility: hidden !important;
}

/* 添加裁剪组件对话框的额外样式确保完全覆盖 */
.el-dialog.is-fullscreen {
  width: 90vw !important;
  height: 90vh !important;
  margin: 5vh auto !important;
  border-radius: 4px !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

/* 修复对话框内容区域，确保完全覆盖 */
.el-dialog.is-fullscreen .el-dialog__body {
  flex: 1 !important;
  overflow: auto !important;
  padding: 20px !important;
  background-color: white !important;
}

/* 添加透明度过渡效果 */
.el-dialog, .el-overlay {
  transition: opacity 0.3s ease !important;
}

/* 确保裁剪对话框的背景完全不透明 */
.cropper-dialog-wrapper .el-dialog__body {
  background-color: white !important;
  overflow: visible !important;
}

/* 确保裁剪对话框的内容区域完全覆盖 */
.namespace--cropper-am {
  position: relative !important;
  z-index: 1 !important;
  background-color: white !important;
}

/* 添加全屏遮罩样式 */
.full-screen-blocker {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 9000; /* 降低z-index值，确保低于裁剪弹框 */
  pointer-events: none; /* 更改为none，不拦截鼠标事件 */
}

/* 确保裁剪对话框所有部分都有背景 */
.el-dialog__wrapper:has(.namespace--cropper-am) .el-dialog {
  background-color: white !important;
}

.el-dialog__wrapper:has(.namespace--cropper-am) .el-dialog__header,
.el-dialog__wrapper:has(.namespace--cropper-am) .el-dialog__body,
.el-dialog__wrapper:has(.namespace--cropper-am) .el-dialog__footer {
  background-color: white !important;
  position: relative;
  z-index: 1;
}

/* 覆盖底层对话框的透明度 */
.el-dialog__wrapper {
  transition: opacity 0.3s ease !important;
}

/* 当裁剪对话框打开时，隐藏其他对话框 */
.cropper-open-mode .el-dialog__wrapper:not(:has(.namespace--cropper-am)) {
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
}

/* 强制裁剪对话框的所有部分不透明 */
.el-overlay {
  z-index: 2000 !important;
}

.el-dialog__wrapper {
  z-index: 2001 !important;
}

/* 特别设置裁剪对话框的层级 */
.el-dialog__wrapper.cropper-dialog-wrapper {
  z-index: 30000 !important;
}

.el-overlay + .el-dialog__wrapper.cropper-dialog-wrapper {
  z-index: 30000 !important;
}

/* 确保裁剪对话框的footer也有背景色 */
.el-dialog__footer {
  background-color: white !important;
  position: relative !important;
  z-index: 2 !important;
}

/* 确保裁剪对话框的遮罩也处于高层级 */
.el-overlay.is-message-box {
  z-index: 29999 !important;
}

/* 确保裁剪组件相关元素的层级高于遮罩 */
.namespace--cropper-am,
.el-dialog__wrapper:has(.namespace--cropper-am),
.el-dialog__wrapper .namespace--cropper-am,
body .el-dialog__wrapper:has(.namespace--cropper-am) {
  z-index: 30000 !important; /* 确保高于遮罩层 */
  position: relative;
}

/* 确保裁剪对话框的遮罩也处于高层级 */
.el-overlay.is-message-box {
  z-index: 29999 !important;
}

/* 确保裁剪组件可以正常接收点击事件 */
.cropper-highest-z {
  position: relative;
  z-index: 30001 !important; /* 确保在最顶层 */
  pointer-events: auto !important;
}

/* 确保裁剪对话框内的按钮和元素可点击 */
.el-dialog__wrapper:has(.namespace--cropper-am) * {
  pointer-events: auto !important;
}
</style>
