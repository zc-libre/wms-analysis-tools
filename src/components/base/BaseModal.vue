<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 模态框标题 */
  title?: string
  /** 是否显示模态框 */
  modelValue: boolean
  /** 模态框宽度 */
  width?: string | number
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否显示底部按钮区域 */
  showFooter?: boolean
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 确认按钮类型 */
  confirmType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 是否在点击确认按钮时关闭模态框 */
  closeOnConfirm?: boolean
  /** 是否在点击蒙层时关闭模态框 */
  closeOnClickModal?: boolean
  /** 确认按钮加载状态 */
  confirmLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '500px',
  showClose: true,
  showFooter: true,
  showCancel: true,
  confirmText: '确定',
  cancelText: '取消',
  confirmType: 'primary',
  closeOnConfirm: true,
  closeOnClickModal: false,
  confirmLoading: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 关闭模态框
const close = () => {
  visible.value = false
}

// 确认按钮点击
const handleConfirm = () => {
  emit('confirm')
  if (props.closeOnConfirm) {
    close()
  }
}

// 取消按钮点击
const handleCancel = () => {
  emit('cancel')
  close()
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :show-close="showClose"
    :close-on-click-modal="closeOnClickModal"
    destroy-on-close
    class="base-modal"
  >
    <!-- 内容插槽 -->
    <slot></slot>
    
    <!-- 底部按钮区域 -->
    <template #footer v-if="showFooter">
      <slot name="footer">
        <div class="base-modal__footer">
          <el-button 
            v-if="showCancel" 
            @click="handleCancel"
          >
            {{ cancelText }}
          </el-button>
          <el-button 
            :type="confirmType" 
            @click="handleConfirm"
            :loading="confirmLoading"
          >
            {{ confirmText }}
          </el-button>
        </div>
      </slot>
    </template>
    
    <!-- 自定义头部插槽 -->
    <template #header v-if="$slots.header">
      <slot name="header"></slot>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.base-modal {
  &__footer {
    display: flex;
    justify-content: flex-end;
    
    .el-button + .el-button {
      margin-left: $spacing-small;
    }
  }
}
</style> 