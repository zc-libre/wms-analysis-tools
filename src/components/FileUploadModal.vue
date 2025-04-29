<template>
  <el-dialog
    v-model="dialogVisible"
    title="上传文件"
    width="35%"
    :close-on-click-modal="false"
    class="upload-dialog"
  >
    <div class="upload-form">
      <el-form label-position="top" >
        <el-form-item label="文件类型" required>
          <el-select v-model="fileTypeSelected" placeholder="请选择文件类型" class="full-width">
            <el-option value="销售出库订单" label="销售出库订单" />
            <el-option value="物料主数据" label="物料主数据" />
            <el-option value="入库单据" label="入库单据" />
            <el-option value="库存记录" label="库存记录" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="选择文件" required>
          <div class="file-select-area" @click="triggerFileSelect">
            <span>选择文件</span>
            <span :class="selectedFileName ? 'selected-text' : 'unselected-text'">
              {{ selectedFileName || '未选择文件' }}
            </span>
          </div>
          <input 
            ref="fileInputRef"
            type="file" 
            accept=".xlsx,.xls,.csv" 
            style="display: none"
            clearable
            @change="handleFileChange"
          />
          <div class="supported-files">
            支持的文件格式: .xlsx, .xls, .csv
          </div>
        </el-form-item>

        <el-form-item label="文件描述">
          <el-input
            v-model="fileDescription"
            type="textarea"
            :rows="3"
            placeholder="可选, 添加文件说明"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="upload">上传</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import type { PropType } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  projectId: {
    type: [Number, Object] as PropType<number | null>,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'upload'])

const dialogVisible = ref(props.visible)
const fileTypeSelected = ref('')
const fileDescription = ref('')
const selectedFileName = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    // 重置表单
    fileTypeSelected.value = ''
    fileDescription.value = ''
    selectedFileName.value = ''
  }
})

// 监听对话框状态变化
watch(() => dialogVisible.value, (newVal) => {
  emit('update:visible', newVal)
})

// 触发文件选择
const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFileName.value = target.files[0].name
  }
}

// 取消上传
const cancel = () => {
  dialogVisible.value = false
}

// 执行上传
const upload = () => {
  if (!fileTypeSelected.value || !selectedFileName.value) {
    return
  }
  
  emit('upload', {
    projectId: props.projectId,
    fileType: fileTypeSelected.value,
    fileName: selectedFileName.value,
    description: fileDescription.value
  })
  
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.upload-dialog {
  .upload-form {
    padding: 10px 0;
  }
  
  .full-width {
    width: 100%;
  }
  
  .file-select-area {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 10px 15px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    height: 40px;
    cursor: pointer;
    width: 100%;
    
    &:hover {
      border-color: var(--el-color-primary);
    }
    
    .unselected-text {
      color: var(--el-text-color-placeholder);
      margin-left: 10px;
    }
    
    .selected-text {
      color: var(--el-text-color-primary);
      margin-left: 10px;
    }
  }
  
  .supported-files {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 8px;
  }
  
  :deep(.el-form-item__label) {
    font-weight: 500;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style> 