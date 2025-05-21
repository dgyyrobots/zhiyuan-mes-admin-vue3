<template>
  <div :class="getClass" :style="getWrapperStyle">
    <img
      v-show="isReady"
      ref="imgElRef"
      :alt="alt"
      :crossorigin="crossorigin"
      :src="src"
      :style="getImageStyle"
    />
  </div>
</template>
<script lang="ts" setup>
import { CSSProperties, PropType } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { useDesign } from '@/hooks/web/useDesign'
import { propTypes } from '@/utils/propTypes'
import { useDebounceFn } from '@vueuse/core'

defineOptions({ name: 'Cropper' })

type Options = Cropper.Options

const defaultOptions: Options = {
  aspectRatio: 1,
  zoomable: true,
  zoomOnTouch: true,
  zoomOnWheel: true,
  cropBoxMovable: true,
  cropBoxResizable: true,
  toggleDragModeOnDblclick: true,
  autoCrop: true,
  background: true,
  highlight: true,
  center: true,
  responsive: true,
  restore: true,
  checkCrossOrigin: true,
  checkOrientation: true,
  scalable: true,
  modal: true,
  guides: true,
  movable: true,
  rotatable: true
}

const props = defineProps({
  src: propTypes.string.def(''),
  alt: propTypes.string.def(''),
  circled: propTypes.bool.def(false),
  realTimePreview: propTypes.bool.def(true),
  height: propTypes.string.def('360px'),
  crossorigin: {
    type: String as PropType<'' | 'anonymous' | 'use-credentials' | undefined>,
    default: undefined
  },
  imageStyle: { type: Object as PropType<CSSProperties>, default: () => ({}) },
  options: { type: Object as PropType<Options>, default: () => ({}) }
})

const emit = defineEmits(['cropend', 'ready', 'cropendError'])
const attrs = useAttrs()
const imgElRef = ref<ElRef<HTMLImageElement>>()
const cropper = ref<Nullable<Cropper>>()
const isReady = ref(false)

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('cropper-image')
const debounceRealTimeCroppered = useDebounceFn(realTimeCroppered, 80)

const getImageStyle = computed((): CSSProperties => {
  return {
    height: props.height,
    maxWidth: '100%',
    ...props.imageStyle
  }
})

const getClass = computed(() => {
  return [
    prefixCls,
    attrs.class,
    {
      [`${prefixCls}--circled`]: props.circled
    }
  ]
})
const getWrapperStyle = computed((): CSSProperties => {
  return { height: `${props.height}`.replace(/px/, '') + 'px' }
})

onMounted(init)

onUnmounted(() => {
  cropper.value?.destroy()
})

async function init() {
  const imgEl = unref(imgElRef)
  if (!imgEl) {
    console.warn('未找到图片元素');
    return
  }
  
  try {
    // 确保图片已加载
    if (props.src && !imgEl.complete) {
      // 等待图片加载完成
      await new Promise((resolve, reject) => {
        imgEl.onload = resolve;
        imgEl.onerror = reject;
      }).catch(err => {
        console.error('图片加载失败:', err);
        throw new Error('图片加载失败');
      });
    }
    
    cropper.value = new Cropper(imgEl, {
      ...defaultOptions,
      ready: () => {
        isReady.value = true
        try {
          realTimeCroppered()
        } catch (error) {
          console.error('初始预览生成失败:', error);
        }
        emit('ready', cropper.value)
      },
      crop() {
        try {
          debounceRealTimeCroppered()
        } catch (error) {
          console.error('裁剪更新失败:', error);
        }
      },
      zoom() {
        try {
          debounceRealTimeCroppered()
        } catch (error) {
          console.error('缩放更新失败:', error);
        }
      },
      cropmove() {
        try {
          debounceRealTimeCroppered()
        } catch (error) {
          console.error('移动更新失败:', error);
        }
      },
      ...props.options
    })
  } catch (error) {
    console.error('初始化裁剪器失败:', error);
    isReady.value = false
  }
}

// Real-time display preview
function realTimeCroppered() {
  props.realTimePreview && croppered()
}

// event: return base64 and width and height information after cropping
function croppered() {
  if (!cropper.value) {
    return
  }
  try {
    let imgInfo = cropper.value.getData()
    // 尝试获取裁剪后的画布
    let canvas;
    try {
      canvas = props.circled ? getRoundedCanvas() : cropper.value.getCroppedCanvas()
      // 确保画布有效且尺寸不为0
      if (!canvas || canvas.width <= 0 || canvas.height <= 0) {
        console.warn('生成的画布无效或尺寸为0');
        emit('cropendError');
        return;
      }
    } catch (error) {
      console.error('获取裁剪画布失败:', error);
      emit('cropendError');
      return;
    }
    
    // 尝试将画布转换为blob
    canvas.toBlob((blob) => {
      if (!blob) {
        console.warn('无法创建Blob对象');
        emit('cropendError');
        return;
      }
      let fileReader: FileReader = new FileReader()
      fileReader.readAsDataURL(blob)
      fileReader.onloadend = (e) => {
        if (!e.target?.result) {
          console.warn('FileReader结果为空');
          emit('cropendError');
          return;
        }
        emit('cropend', {
          imgBase64: e.target.result,
          imgInfo
        })
      }
      fileReader.onerror = (error) => {
        console.error('FileReader错误:', error);
        emit('cropendError')
      }
    }, 'image/png')
  } catch (error) {
    console.error('图片裁剪过程中发生错误:', error);
    emit('cropendError');
  }
}

// Get a circular picture canvas
function getRoundedCanvas() {
  const sourceCanvas = cropper.value!.getCroppedCanvas()
  if (!sourceCanvas || sourceCanvas.width <= 0 || sourceCanvas.height <= 0) {
    console.warn('源画布无效或尺寸为0');
    const minCanvas = document.createElement('canvas');
    minCanvas.width = 1;
    minCanvas.height = 1;
    return minCanvas;
  }
  
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  const width = sourceCanvas.width
  const height = sourceCanvas.height
  canvas.width = width
  canvas.height = height
  context.imageSmoothingEnabled = true
  context.drawImage(sourceCanvas, 0, 0, width, height)
  context.globalCompositeOperation = 'destination-in'
  context.beginPath()
  context.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true)
  context.fill()
  return canvas
}
</script>
<style lang="scss">
$prefix-cls: #{$namespace}-cropper-image;

.#{$prefix-cls} {
  &--circled {
    .cropper-view-box,
    .cropper-face {
      border-radius: 50%;
    }
  }
}
</style>
