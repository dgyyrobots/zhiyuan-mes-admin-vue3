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
      <el-table-column align="center" label="ID" prop="id" />
      <el-table-column align="center" label="公司名称" prop="deptName" />
      <el-table-column align="center" label="系统名称" prop="sysName" />
      <el-table-column align="center" label="内网系统访问地址" prop="sysUrl" />
      <el-table-column align="center" label="外网系统访问地址" prop="sysUrlNet" />
      <el-table-column align="center" label="图标地址" prop="sysLogUrl" />
      <el-table-column align="center" label="创建时间" prop="createTime" />
      <el-table-column align="center" label="创建者" prop="createUser" />
      <el-table-column align="center" label="修改者" prop="updateUser" />
      <el-table-column align="center" label="程序编号" prop="pg" />
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
    width="500px"
    @close="cancel"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="公司名称" prop="deptName" :disabled="title === '修改系统地址信息'">
        <el-input v-model="form.deptName" placeholder="请输入公司名称" />
      </el-form-item>
      <el-form-item label="系统名称" prop="sysName" :disabled="title === '修改系统地址信息'">
        <el-input v-model="form.sysName" placeholder="请输入系统名称" />
      </el-form-item>
      <el-form-item label="内网系统地址" prop="sysUrl">
        <el-input v-model="form.sysUrl" placeholder="请输入内网系统访问地址" />
      </el-form-item>
      <el-form-item label="外网系统地址" prop="sysUrlNet">
        <el-input v-model="form.sysUrlNet" placeholder="请输入外网系统访问地址" />
      </el-form-item>
      <el-form-item label="图标地址" prop="sysLogUrl">
        <el-input v-model="form.sysLogUrl" placeholder="请输入图标地址" />
      </el-form-item>
      <el-form-item label="创建者" prop="createUser" disabled>
        <el-input v-model="form.createUser" placeholder="请输入创建者" />
      </el-form-item>
      <el-form-item label="修改者" prop="updateUser" disabled>
        <el-input v-model="form.updateUser" placeholder="请输入修改者" />
      </el-form-item>
      <el-form-item label="程序编号" prop="pg" disabled>
        <el-input v-model="form.pg" placeholder="请输入程序编号" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage } from '@/hooks/web/useMessage'
import * as SystemAddressApi from '@/api/system/netSet'
import { SystemAddressVO } from '@/api/system/netSet'
import { Icon } from '@/components/Icon'

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
  sysUrl: [{ required: true, message: '内网系统访问地址不能为空', trigger: 'blur' }]
})

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
  form.sysLogUrl = undefined;
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

/** 取消按钮 */
const cancel = () => {
  open.value = false;
  reset();
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

/** 初始化 */
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
