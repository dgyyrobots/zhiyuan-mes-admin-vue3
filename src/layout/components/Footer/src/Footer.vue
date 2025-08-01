<script lang="ts" setup>
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'

// eslint-disable-next-line vue/no-reserved-component-names
defineOptions({ name: 'Footer' })

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('footer')
const appStore = useAppStore()
const title = computed(() => appStore.getTitle)
const currentYear = computed(() => new Date().getFullYear())

// 直接使用全局常量，无需环境变量
const version = __APP_VERSION__
</script>

<template>
  <div
    :class="prefixCls"
    class="h-[var(--app-footer-height)] bg-[var(--app-content-bg-color)] text-center leading-[var(--app-footer-height)] text-[var(--el-text-color-placeholder)] dark:bg-[var(--el-bg-color)] overflow-hidden"
  >
    <span class="text-14px">Copyright ©{{ currentYear }} {{ title }} v{{ version }}</span>
  </div>
</template>
