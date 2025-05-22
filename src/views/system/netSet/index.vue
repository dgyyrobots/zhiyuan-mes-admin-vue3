<template>
  <doc-alert title="系统网络设置" url="#" />

  <!-- 搜索工作栏 -->
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="100px"
    >
      <el-form-item label="公司名称" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          class="!w-240px"
          clearable
          placeholder="请输入公司名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="系统名称" prop="sysName">
        <el-input
          v-model="queryParams.sysName"
          class="!w-240px"
          clearable
          placeholder="请输入系统名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button
          v-hasPermi="['system:dj002:create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
        <el-button
          v-hasPermi="['system:dj002:export']"
          :loading="exportLoading"
          plain
          type="warning"
          @click="handleExport"
        >
          <Icon class="mr-5px" icon="ep:download" />
          导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      border
    >
      <el-table-column align="center" label="ID" prop="id" width="70px" />
      <el-table-column align="center" label="公司名称" prop="deptName" />
      <el-table-column align="center" label="系统名称" prop="sysName" />
      <el-table-column align="center" label="内网系统访问地址" prop="sysUrl" />
      <el-table-column align="center" label="外网系统访问地址" prop="sysUrlNet" />
      <el-table-column align="center" label="图标" width="100px">
        <template #default="{ row }">
          <el-avatar 
            v-if="row.sysLogUrl" 
            :src="row.sysLogUrl" 
            :size="40" 
            fit="cover"
            @error="() => true"
          >
            <Icon icon="ep:picture" />
          </el-avatar>
          <el-avatar v-else :size="40">
            <Icon icon="ep:picture" />
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime" />
      <el-table-column align="center" label="创建者" prop="createUser"  width="100px"/>
      <el-table-column align="center" label="修改者" prop="updateUser" width="100px"/>
      <el-table-column align="center" label="程序编号" prop="pg" width="100px"/>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作">
        <template #default="{ row }">
          <el-button
            v-hasPermi="['system:dj002:update']"
            link
            type="primary"
            @click="openForm('update', row.id)"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:dj002:delete']"
            link
            type="danger"
            @click="handleDelete(row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <Pagination
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <el-dialog
    v-model="open"
    :title="title"
    append-to-body
    width="800px"
    @close="handleDialogClose"
    v-if="open"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="公司名称" prop="deptName">
        <el-input v-model="form.deptName" placeholder="请输入公司名称"  :disabled="title === '修改系统地址信息'" />
      </el-form-item>
      <el-form-item label="系统名称" prop="sysName">
        <el-input v-model="form.sysName" placeholder="请输入系统名称"  :disabled="title === '修改系统地址信息'" />
      </el-form-item>
      <el-form-item label="内网系统地址">
        <el-input v-model="form.sysUrl" placeholder="请输入内网系统访问地址" />
      </el-form-item>
      <el-form-item label="外网系统地址" prop="sysUrlNet">
        <el-input v-model="form.sysUrlNet" placeholder="请输入外网系统访问地址" />
      </el-form-item>
      <el-form-item label="图标地址" prop="sysLogUrl">
        <div class="avatar-uploader">
          <CropperAvatar 
            v-model:value="form.sysLogUrl" 
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
      <el-form-item label="创建者" prop="createUser">
        <el-input v-model="form.createUser" placeholder="请输入创建者"   disabled/>
      </el-form-item>
      <el-form-item label="修改者" prop="updateUser">
        <el-input v-model="form.updateUser" placeholder="请输入修改者"  disabled />
      </el-form-item>
      <el-form-item label="程序编号" prop="pg">
        <el-input v-model="form.pg" placeholder="请输入程序编号"  disabled />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 添加一个全屏遮罩，当裁剪对话框打开时显示 -->
  <div ref="fullScreenBlocker" class="full-screen-blocker" style="display: none;"></div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage } from '@/hooks/web/useMessage'
import * as SystemAddressApi from '@/api/system/netSet'
import { SystemAddressVO } from '@/api/system/netSet'
import { Icon } from '@/components/Icon'
import CropperAvatar from '@/components/Cropper/src/CropperAvatar.vue'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import { UploadRequestOptions } from 'element-plus/es/components/upload/src/upload'

defineOptions({ name: 'SystemNetSet' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

// 列表相关
const loading = ref(true)
const exportLoading = ref(false)
const total = ref(0)
const list = ref<SystemAddressVO[]>([])
const queryFormRef = ref()

// 查询参数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  deptName: undefined,
  sysName: undefined,
  sysUrl: undefined,
  sysUrlNet: undefined,
  sysLogUrl: undefined,
  createTime: [],
  createUser: undefined,
  updateUser: undefined,
  pg: undefined
})

// 表单相关
const open = ref(false)
const title = ref('')
const formRef = ref()
const form = reactive<Partial<SystemAddressVO>>({})
const rules = reactive({
  // 可以根据需要添加表单验证规则
  sysName: [{ required: true, message: '系统名称不能为空', trigger: 'blur' }],
})

// 添加对裁剪组件的引用
const cropperRef = ref(null);

// 添加遮罩层引用
const fullScreenBlocker = ref<HTMLElement | null>(null);

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const res = await SystemAddressApi.getSystemAddressPage(queryParams)
    console.log('获取列表数据:', res)
    // 处理不同的响应格式
    if (res.list) {
      // 直接返回了列表和总数
      list.value = res.list
      total.value = res.total
    } else if (res.data && res.data.list) {
      // 数据在data对象中
      list.value = res.data.list
      total.value = res.data.total
    } else {
      // 兜底处理
      list.value = []
      total.value = 0
      console.error('未知的响应格式:', res)
    }
  } catch (error) {
    console.error('获取列表失败:', error)
    message.error('获取数据列表失败')
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 表单重置 */
const reset = () => {
  // 创建一个空的表单对象
  const emptyForm: Partial<SystemAddressVO> = {};
  // 完全替换form对象，而不是逐个字段设置为undefined
  Object.keys(form).forEach(key => {
    delete form[key as keyof typeof form];
  });
  
  // 确保所有字段都被清空
  form.id = undefined;
  form.sysId = undefined;
  form.sysCode = undefined;
  form.sysName = undefined;
  form.sysUrl = undefined;
  form.sysUrlNet = undefined;
  form.sysLog = undefined;
  form.sysLogUrl = undefined; // 清空图片地址
  form.createTime = undefined;
  form.updateTime = undefined;
  form.deptName = undefined;
  form.createUser = undefined;
  form.updateUser = undefined;
  form.pg = undefined;
  
  // 重置表单验证状态
  formRef.value?.resetFields();
  console.log('表单已重置:', form);
}

/** 清理所有遮罩和裁剪弹框 */
const cleanupOverlaysAndCroppers = () => {
  console.log('清理所有遮罩和裁剪弹框');
  
  // 隐藏全屏遮罩
  if (fullScreenBlocker.value) {
    fullScreenBlocker.value.style.display = 'none';
  }
  
  // 查找并关闭所有裁剪相关的对话框
  document.querySelectorAll('.el-dialog__wrapper').forEach((dialog) => {
    if ((dialog as HTMLElement).querySelector('.namespace--cropper-am')) {
      (dialog as HTMLElement).style.display = 'none';
    }
  });
  
  // 清理无用的遮罩层
  document.querySelectorAll('.el-overlay').forEach((overlay) => {
    // 检查关联的对话框是否已隐藏或不存在
    const nextElement = overlay.nextElementSibling as HTMLElement;
    if (!nextElement || 
        !nextElement.classList.contains('el-dialog__wrapper') || 
        nextElement.style.display === 'none') {
      (overlay as HTMLElement).style.display = 'none';
    }
  });
};

/** 确保系统设置对话框关闭时清理遮罩 */
const ensureCleanupOnDialogClose = () => {
  // 如果系统设置对话框已经关闭，则清理遮罩
  if (!open.value) {
    cleanupOverlaysAndCroppers();
  }
};

/** 对话框关闭处理（包括ESC键、点击遮罩等方式关闭） */
const handleDialogClose = () => {
  console.log('对话框关闭处理');
  cancel();
  
  // 清理所有遮罩和裁剪弹框
  cleanupOverlaysAndCroppers();
}

/** 取消按钮 */
const cancel = () => {
  open.value = false;
  reset();
  
  // 清理所有遮罩和裁剪弹框
  cleanupOverlaysAndCroppers();
}

/** 新增/修改按钮操作 */
const openForm = async (type: string, id?: number) => {
  // 先重置表单，确保没有缓存数据
  await reset();
  
  if (type === 'create') {
    title.value = '添加系统地址信息';
    // 确保表单已完全清空
    console.log('新增时的表单初始状态:', form);
    open.value = true;
  } else if (type === 'update' && id) {
    try {
      title.value = '修改系统地址信息'
      loading.value = true
      const res = await SystemAddressApi.getSystemAddress(id)
      // 确保res.data存在，并打印详细信息便于调试
      console.log('获取到的数据:', res)
      // 解决数据绑定问题，适应不同的响应格式
      const data = res.data || res
      // 使用对象合并而不是Object.assign
      form.id = data.id
      form.sysId = data.sysId
      form.sysCode = data.sysCode
      form.sysName = data.sysName
      form.sysUrl = data.sysUrl
      form.sysUrlNet = data.sysUrlNet
      form.sysLog = data.sysLog
      form.sysLogUrl = data.sysLogUrl
      form.deptName = data.deptName
      form.createUser = data.createUser
      form.updateUser = data.updateUser
      form.pg = data.pg
      // 打印绑定后的表单数据
      console.log('表单数据:', form)
      open.value = true
    } catch (error) {
      console.error('获取数据失败:', error)
      message.error('获取数据失败')
    } finally {
      loading.value = false
    }
  }
}

/** 提交按钮 */
const submitForm = async () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    try {
      if (form.id) {
        // 修改
        await SystemAddressApi.updateSystemAddress(form as SystemAddressVO)
        message.success('修改成功')
      } else {
        // 新增
        await SystemAddressApi.createSystemAddress(form as SystemAddressVO)
        message.success('新增成功')
      }
      open.value = false
      await getList()
    } catch (error) {
      console.error('提交失败:', error)
      message.error('操作失败')
    }
  })
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    await message.confirm('是否确认删除系统地址信息编号为"' + id + '"的数据项?')
    await SystemAddressApi.deleteSystemAddress(id)
    message.success('删除成功')
    await getList()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 处理查询参数
    const params = { ...queryParams }
    // 使用可选类型，避免TypeScript错误
    const exportParams: Record<string, any> = { ...params }
    // 安全地移除分页参数
    if ('pageNo' in exportParams) {
      delete exportParams.pageNo
    }
    if ('pageSize' in exportParams) {
      delete exportParams.pageSize
    }
    
    await message.confirm('是否确认导出所有系统地址信息数据项?')
    exportLoading.value = true
    const res = await SystemAddressApi.exportSystemAddressExcel(exportParams)
    
    // 假设你的项目中有一个 $download 工具
    // @ts-ignore
    window.$download?.excel(res, '系统地址信息.xls')
  } catch (error) {
    console.error('导出失败:', error)
  } finally {
    exportLoading.value = false
  }
}

/** 处理头像上传成功的回调 */
const handleAvatarChange = async ({ source, data, filename }) => {
  console.log('头像上传成功', source);

  try {
    // 使用接口上传图片而不是直接使用base64
    const { httpRequest } = useUpload()
    const logoUrl = ((await httpRequest({
      file: data,
      filename: 'sysLogo.png',
    } as UploadRequestOptions)) as unknown as { data: string }).data

    // 使用接口返回的URL替代base64
    form.sysLogUrl = logoUrl;
    console.log('图片上传成功，URL:', logoUrl);
  } catch (error) {
    console.error('图片上传失败:', error);
    message.error('图片上传失败');
  }
  
  // 不关闭弹框
  // handleCropperClose();
  
  // 不隐藏遮罩
  // if (fullScreenBlocker.value) {
  //   fullScreenBlocker.value.style.display = 'none';
  // }
}

/** 监听CropperAvatar的打开和关闭事件 */
const handleCropperOpen = () => {
  console.log('裁剪器打开');
  // 显示全屏遮罩
  if (fullScreenBlocker.value) {
    fullScreenBlocker.value.style.display = 'block';
  }
  
  // 强制性解决方案：当裁剪对话框打开时临时隐藏底层对话框
  setTimeout(() => {
    // 隐藏所有非裁剪对话框
    const allDialogs = document.querySelectorAll('.el-dialog__wrapper');
    allDialogs.forEach((dialog) => {
      if (!dialog.querySelector('.namespace--cropper-am')) {
        // 保存原来的display值
        dialog.setAttribute('data-original-display', (dialog as HTMLElement).style.display);
        // 临时隐藏
        (dialog as HTMLElement).style.display = 'none';
      } else {
        // 确保裁剪对话框在最前
        (dialog as HTMLElement).style.zIndex = '29999';
        // 找到对应遮罩
        const overlays = document.querySelectorAll('.el-overlay');
        overlays.forEach((overlay) => {
          if (overlay.nextElementSibling === dialog) {
            (overlay as HTMLElement).style.zIndex = '29998';
          }
        });
      }
    });
  }, 10);
};

const handleCropperClose = () => {
  console.log('裁剪器关闭');
  // 隐藏全屏遮罩
  if (fullScreenBlocker.value) {
    fullScreenBlocker.value.style.display = 'none';
  }
  
  // 还原底层对话框
  setTimeout(() => {
    const allDialogs = document.querySelectorAll('.el-dialog__wrapper');
    allDialogs.forEach((dialog) => {
      const originalDisplay = dialog.getAttribute('data-original-display');
      if (originalDisplay !== null) {
        (dialog as HTMLElement).style.display = originalDisplay;
        dialog.removeAttribute('data-original-display');
      }
    });
    
    // 确保遮罩也被清理
    document.querySelectorAll('.el-overlay').forEach((overlay) => {
      if (!(overlay.nextElementSibling as HTMLElement)?.classList.contains('el-dialog__wrapper') || 
          ((overlay.nextElementSibling as HTMLElement)?.style.display === 'none')) {
        (overlay as HTMLElement).style.display = 'none';
      }
    });
    
    // 强制确保遮罩被隐藏
    if (fullScreenBlocker.value) {
      fullScreenBlocker.value.style.display = 'none';
    }
  }, 10);
};

/** 监听弹框开关状态，控制遮罩的显示与隐藏
 * 
 * 这里使用watch来监听open变量的变化，当open变量为false时，隐藏遮罩，并清理可能存在的遮罩。
 */
watch(open, (newVal) => {
  if (!newVal) {
    console.log('弹框关闭，隐藏遮罩');
    cleanupOverlaysAndCroppers();
  }
});

/** 初始化 */
onMounted(() => {
  getList()
  
  // 监听点击事件来检测对话框的打开和关闭
  document.body.addEventListener('click', (e) => {
    // 检查是否点击的是CropperAvatar
    if ((e.target as Element)?.closest('.cropper-highest-z')) {
      // 延迟执行，等待对话框打开
      setTimeout(handleCropperOpen, 100);
    }
    
    // 检查是否点击了对话框外部区域（可能导致对话框关闭）
    const isClickOutside = !(e.target as Element)?.closest('.el-dialog') && 
                         (e.target as Element)?.closest('.el-overlay');
    if (isClickOutside && open.value) {
      // 如果是点击对话框外部区域，并且对话框当前是打开状态
      setTimeout(ensureCleanupOnDialogClose, 100);
    }
  });
  
  // 监听对话框关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // ESC键关闭对话框
      setTimeout(handleCropperClose, 100);
      
      // 确保清理遮罩和弹框
      setTimeout(ensureCleanupOnDialogClose, 100);
    }
  });
  
  // 监听DOM变化，检测对话框的添加和移除
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // 检测新添加的节点
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if ((node as Element)?.classList?.contains('el-dialog__wrapper')) {
            // 检查是否包含裁剪组件
            if ((node as Element).querySelector('.namespace--cropper-am')) {
              handleCropperOpen();
            }
          }
        });
      }
      
      // 检测移除的节点
      if (mutation.removedNodes.length) {
        mutation.removedNodes.forEach((node) => {
          if ((node as Element)?.classList?.contains('el-dialog__wrapper')) {
            // 检查是否包含裁剪组件
            if ((node as Element).querySelector('.namespace--cropper-am')) {
              handleCropperClose();
            }
          }
        });
      }
    });
  });
  
  // 开始观察body的变化
  observer.observe(document.body, { childList: true, subtree: true });
});

/** 组件卸载前清理 */
onBeforeUnmount(() => {
  // 确保清理所有遮罩和裁剪弹框
  cleanupOverlaysAndCroppers();
});
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
