<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 按钮类型 */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | ''
  /** 按钮大小 */
  size?: 'large' | 'default' | 'small'
  /** 是否为朴素按钮 */
  plain?: boolean
  /** 是否为圆角按钮 */
  round?: boolean
  /** 是否为圆形按钮 */
  circle?: boolean
  /** 是否为文字按钮 */
  text?: boolean
  /** 是否为链接按钮 */
  link?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示加载中 */
  loading?: boolean
  /** 按钮图标 */
  icon?: string
  /** 是否自动获取焦点 */
  autofocus?: boolean
  /** 按钮原生 type 属性 */
  nativeType?: 'button' | 'submit' | 'reset'
  /** 自定义权限标识 */
  permission?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: '',
  size: 'default',
  plain: false,
  round: false,
  circle: false,
  text: false,
  link: false,
  disabled: false,
  loading: false,
  autofocus: false,
  nativeType: 'button'
})

const emit = defineEmits<{
  (e: 'click', evt: MouseEvent): void
}>()

// 处理按钮点击事件
const handleClick = (evt: MouseEvent) => {
  if (props.disabled || props.loading) return
  emit('click', evt)
}

// 是否有权限（实际项目中应从权限store中获取）
const hasPermission = computed(() => {
  if (!props.permission) return true
  // 实际项目中在这里检查权限
  return true
})

// 是否显示按钮
const showButton = computed(() => {
  return hasPermission.value
})
</script>

<template>
  <el-button
    v-if="showButton"
    :type="type"
    :size="size"
    :plain="plain"
    :round="round"
    :circle="circle"
    :text="text"
    :link="link"
    :disabled="disabled"
    :loading="loading"
    :autofocus="autofocus"
    :native-type="nativeType"
    class="base-button"
    @click="handleClick"
  >
    <el-icon v-if="icon && !loading">
      <component :is="icon" />
    </el-icon>
    <slot></slot>
  </el-button>
</template>

<style lang="scss" scoped>
.base-button {
  // 自定义按钮样式可以在这里添加
  
  // 图标和文本的间距
  .el-icon {
    & + span {
      margin-left: 4px;
    }
  }
}
</style> 