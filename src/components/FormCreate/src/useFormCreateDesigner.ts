import {
  useDictSelectRule,
  useEditorRule,
  useSelectRule,
  useUploadFileRule,
  useUploadImgRule,
  useUploadImgsRule
} from './config'
import { Ref } from 'vue'
import { Menu } from '@/components/FormCreate/src/type'
import { apiSelectRule } from '@/components/FormCreate/src/config/selectRule'
import { useUserStore } from '@/store/modules/user'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { generateUUID } from '@/utils'
import { localeProps, makeRequiredRule } from '@/components/FormCreate/src/utils'
import { selectRule } from '@/components/FormCreate/src/config/selectRule'

/**
 * 表单设计器增强 hook
 * 新增
 * - 文件上传
 * - 单图上传
 * - 多图上传
 * - 字典选择器
 * - 用户选择器
 * - 部门选择器
 * - 富文本
 */
/**
 * 创建带默认当前用户的用户选择器规则
 */
const createUserSelectRule = () => {
  const { wsCache } = useCache()
  const userStore = useUserStore()
  
  // 获取当前用户ID
  const getCurrentUserId = () => {
    
    // 优先从store获取
    if (userStore.getUser && userStore.getUser.id) {
      return userStore.getUser.id
    }
    
    // 从缓存获取
    const userInfo = wsCache.get(CACHE_KEY.USER)
    if (userInfo && userInfo.user && userInfo.user.id) {
      return userInfo.user.id
    }
    
    return null
  }
  
  return {
    icon: 'icon-user-o',
    label: '用户选择器',
    name: 'UserSelect',
    event: ['click', 'change', 'visibleChange', 'clear', 'blur', 'focus'],
    rule() {
      const currentUserId = getCurrentUserId()
      return {
        type: 'UserSelect',
        field: generateUUID(),
        title: '用户选择器',
        info: '',
        $required: false,
        value: currentUserId, // 设置默认值为当前用户ID
        // 添加表单配置，确保在预览和填写时都显示默认值
        props: {
          defaultValue: currentUserId // 额外的默认值配置
        }
      }
    },
    props(_, { t }) {
      return localeProps(t, 'UserSelect.props', [
        makeRequiredRule(),
        {
          type: 'switch',
          field: 'defaultCurrentUser',
          title: '默认选中当前用户',
          value: true
        },
        {
          type: 'switch',
          field: 'clearable',
          title: '可清空',
          value: true
        },
        ...selectRule
      ])
    }
  }
}

/**
 * 创建带默认当前日期的日期选择器规则
 */
const createDatePickerRule = () => {
  // 获取当前日期
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0] // 格式化为 YYYY-MM-DD
  }
  
  return {
    icon: 'icon-calendar',
    label: '日期选择器',
    name: 'DatePicker',
    event: ['change', 'blur', 'focus'],
    rule() {
      const currentDate = getCurrentDate()
      return {
        type: 'DatePicker',
        field: generateUUID(),
        title: '日期选择器',
        info: '',
        $required: false,
        value: currentDate, // 设置默认值为当前日期
        props: {
          type: 'date',
          valueFormat: 'YYYY-MM-DD',
          placeholder: '请选择日期',
          clearable: true,
          defaultValue: currentDate // 额外的默认值配置
        }
      }
    },
    props(_, { t }) {
      return localeProps(t, 'DatePicker.props', [
        makeRequiredRule(),
        {
          type: 'switch',
          field: 'defaultCurrentDate',
          title: '默认选中当前日期',
          value: true
        },
        {
          type: 'switch',
          field: 'clearable',
          title: '可清空',
          value: true
        },
        {
          type: 'select',
          field: 'type',
          title: '日期类型',
          value: 'date',
          options: [
            { label: '日期', value: 'date' },
            { label: '日期时间', value: 'datetime' },
            { label: '日期范围', value: 'daterange' },
            { label: '日期时间范围', value: 'datetimerange' }
          ]
        },
        {
          type: 'input',
          field: 'valueFormat',
          title: '值格式',
          value: 'YYYY-MM-DD'
        },
        {
          type: 'input',
          field: 'placeholder',
          title: '占位符',
          value: '请选择日期'
        }
      ])
    }
  }
}

export const useFormCreateDesigner = async (designer: Ref) => {
  const editorRule = useEditorRule()
  const uploadFileRule = useUploadFileRule()
  const uploadImgRule = useUploadImgRule()
  const uploadImgsRule = useUploadImgsRule()

  /**
   * 构建表单组件
   */
  const buildFormComponents = () => {
    // 移除自带的上传组件规则，使用 uploadFileRule、uploadImgRule、uploadImgsRule 替代
    designer.value?.removeMenuItem('upload')
    // 移除自带的富文本组件规则，使用 editorRule 替代
    designer.value?.removeMenuItem('fc-editor')
    const components = [editorRule, uploadFileRule, uploadImgRule, uploadImgsRule]
    components.forEach((component) => {
      // 插入组件规则
      designer.value?.addComponent(component)
      // 插入拖拽按钮到 `main` 分类下
      designer.value?.appendMenuItem('main', {
        icon: component.icon,
        name: component.name,
        label: component.label
      })
    })
  }

  // 使用自定义的用户选择器规则
  const userSelectRule = createUserSelectRule()
  // 添加日期选择器规则
  const datePickerRule = createDatePickerRule()
  const deptSelectRule = useSelectRule({
    name: 'DeptSelect',
    label: '部门选择器',
    icon: 'icon-address-card-o'
  })
  const dictSelectRule = useDictSelectRule()
  const apiSelectRule0 = useSelectRule({
    name: 'ApiSelect',
    label: '接口选择器',
    icon: 'icon-server',
    props: [...apiSelectRule],
    event: ['click', 'change', 'visibleChange', 'clear', 'blur', 'focus']
  })

  /**
   * 构建系统字段菜单
   */
  const buildSystemMenu = () => {
    // 移除自带的下拉选择器组件，使用 currencySelectRule 替代
    // designer.value?.removeMenuItem('select')
    // designer.value?.removeMenuItem('radio')
    // designer.value?.removeMenuItem('checkbox')
    const components = [userSelectRule, datePickerRule, deptSelectRule, dictSelectRule, apiSelectRule0]
    const menu: Menu = {
      name: 'system',
      title: '系统字段',
      list: components.map((component) => {
        // 插入组件规则
        designer.value?.addComponent(component)
        // 插入拖拽按钮到 `system` 分类下
        return {
          icon: component.icon,
          name: component.name,
          label: component.label
        }
      })
    }
    designer.value?.addMenu(menu)
  }

  onMounted(async () => {
    await nextTick()
    buildFormComponents()
    buildSystemMenu()
  })
}
