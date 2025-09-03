import type { App } from 'vue'
// 👇使用 form-create 需额外全局引入 element plus 组件
import {
  // ElAutocomplete,
  // ElButton,
  // ElCascader,
  // ElCheckbox,
  // ElCheckboxButton,
  // ElCheckboxGroup,
  // ElCol,
  // ElColorPicker,
  // ElDatePicker,
  // ElDialog,
  // ElForm,
  // ElInput,
  // ElInputNumber,
  // ElPopover,
  // ElRadio,
  // ElRadioButton,
  // ElRadioGroup,
  // ElRate,
  // ElRow,
  // ElSelect,
  // ElSlider,
  // ElSwitch,
  // ElTimePicker,
  // ElTooltip,
  // ElTree,
  // ElUpload,
  // ElIcon,
  // ElProgress,
  // 以上会由 @form-create/element-ui/auto-import 自动引入
  ElAlert,
  ElTransfer,
  ElAside,
  ElContainer,
  ElDivider,
  ElHeader,
  ElMain,
  ElPopconfirm,
  ElTable,
  ElTableColumn,
  ElTabPane,
  ElTabs,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElBadge,
  ElTag,
  ElText,
  ElMenu,
  ElMenuItem,
  ElFooter,
  ElMessage,
  ElCollapse,
  ElCollapseItem,
  ElCard,
  // ElFormItem,
  // ElOption
} from 'element-plus'
import FcDesigner from '@form-create/designer'
import formCreate from '@form-create/element-ui'
import install from '@form-create/element-ui/auto-import'

//======================= 自定义组件 =======================
import { UploadFile, UploadImg, UploadImgs } from '@/components/UploadFile'
import { useApiSelect } from '@/components/FormCreate'
import { Editor } from '@/components/Editor'
import DictSelect from '@/components/FormCreate/src/components/DictSelect.vue'
import { useCache, CACHE_KEY } from '@/hooks/web/useCache'
const { wsCache } = useCache()
// 创建带默认值的 UserSelect
// const createUserSelectWithDefault = () => {
//   return useApiSelect({
//     name: 'UserSelect',
//     labelField: 'nickname',
//     valueField: 'id',
//     url: '/system/user/simple-list',
//     // 可以在这里添加默认值逻辑
//     defaultValue: () => {
//      const currentUser = getCurrentUserFromCache()
//       return currentUser?.id || null
//     }
//   })
// }
// 创建普通的 UserSelect（不带默认值）

const UserSelect = useApiSelect({
  name: 'UserSelect',
  labelField: 'nickname',
  valueField: 'id',
  url: '/system/user/simple-list'
})
// 获取当前用户信息
const getCurrentUserFromCache = () => {
  const userInfo = wsCache.get(CACHE_KEY.USER)
  if (userInfo && userInfo.user) {
    return {
      id: userInfo.user.id,
      nickname: userInfo.user.nickname
    }
  }

  console.log(userInfo,'userInfo')
  return null
}
// const UserSelect = createUserSelectWithDefault()

const DeptSelect = useApiSelect({
  name: 'DeptSelect',
  labelField: 'name',
  valueField: 'id',
  url: '/system/dept/simple-list'
})
const ApiSelect = useApiSelect({
  name: 'ApiSelect'
})

const components = [
  ElAlert,
  ElTransfer,
  ElAside,
  ElContainer,
  ElDivider,
  ElHeader,
  ElMain,
  ElPopconfirm,
  ElTable,
  ElTableColumn,
  ElTabPane,
  ElTabs,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElBadge,
  ElTag,
  ElText,
  ElMenu,
  ElMenuItem,
  ElFooter,
  ElMessage,
  // ElFormItem,
  // ElOption,
  UploadImg,
  UploadImgs,
  UploadFile,
  DictSelect,
  UserSelect,
  DeptSelect,
  ApiSelect,
  Editor,
  ElCollapse,
  ElCollapseItem,
  ElCard,
]

// 参考 http://www.form-create.com/v3/element-ui/auto-import.html 文档
export const setupFormCreate = (app: App<Element>) => {
  components.forEach((component) => {
    app.component(component.name, component)
  })
  formCreate.use(install)
  app.use(formCreate)
  app.use(FcDesigner)
}
