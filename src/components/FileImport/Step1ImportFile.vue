<template>
  <div class="step-body-step1">
    <el-select
      clearable
      :model-value="props.fileTypeSelected"
      @update:model-value="onFileTypeChange"
      placeholder="请选择导入文件类型"
      class="full-width-step1"
      ref="fileTypeSelectRef"
    >
      <el-option value="销售出库订单" label="销售出库订单" />
      <el-option value="物料主数据" label="物料主数据" />
      <el-option value="入库单据" label="入库单据" />
      <el-option value="库存记录" label="库存记录" />
    </el-select>

    <!-- 添加下载模板链接 -->
    <div v-if="props.fileTypeSelected" class="download-template-step1" ref="downloadTemplateRef">
      <el-link type="primary" @click="onDownloadTemplateClick">
        <el-icon><Download /></el-icon>
        下载{{ props.fileTypeSelected }}导入模板
      </el-link>
    </div>

    <!-- 添加带边框的容器 -->
    <div class="import-area-bordered-step1">
      <!-- 导入说明部分 -->
      <div class="import-instructions-step1">
        <div class="instruction-header-step1">
          <el-icon><InfoFilled /></el-icon> 导入说明
        </div>
        <ul class="instruction-list-step1">
          <li>文件仅支持xls、xlsx、csv格式。</li>
          <li>必填项提供默认值，支持用户修改。</li>
          <li>请不要更改或合并单元格操作！</li>
          <li>请不要删除首行标题！</li>
          <li>请不要更改时间和日期格式！</li>
          <li>注意单个Excel文件最大支持100W行。</li>
          <li>注意单个Excel文件最大支持200M。</li>
          <li>物料体积可选择立方厘米（cm³）、立方分米（dm³）、立方米（m³）、默认立方厘米。</li>
        </ul>
      </div>

      <!-- 将 el-card 替换为普通 div -->
      <div>
        <div class="file-select-area-step1" ref="fileUploadAreaRef">
          <el-upload
            class="upload-area-step1"
            drag
            action="#"
            :auto-upload="false"
            :on-change="onFileChange"
            :show-file-list="false"
          >
            <div class="upload-content-step1">
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                拖拽文件到此处或<em>点击上传</em>
              </div>
              <div class="el-upload__tip">
                支持 .xls, .xlsx, .csv 格式文件
              </div>
            </div>
          </el-upload>
        </div>
      </div>
    </div> <!-- 结束带边框的容器 -->

    <!-- 已上传文件列表 -->
    <div class="uploaded-files-step1" v-if="uploadedFiles.length > 0">
      <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item-step1">
        <div class="file-info-step1">
          <span class="file-name-step1">{{ file.name }}</span>
          <span class="file-date-step1">{{ file.date }}</span>
        </div>
        <el-button
          type="danger"
          circle
          plain
          size="small"
          @click="removeFile(index)"
        >
          <el-icon><DeleteIcon /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 上传错误提示 -->
    <div class="upload-error-step1" v-if="uploadError">
      <el-alert
        :title="uploadError"
        type="error"
        show-icon
        :closable="true"
        @close="uploadError = ''"
      ></el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadFile as ElUploadFile } from 'element-plus';
import { UploadFilled, InfoFilled, Delete as DeleteIcon, Download } from '@element-plus/icons-vue';

interface InternalUploadedFile {
  name: string;
  date: string;
  size?: string;
}
const uploadedFiles = ref<InternalUploadedFile[]>([]);
const uploadError = ref('');

const errorMessageTimer = ref<number | null>(null);
const errorMessageDuration = 5000;

const handleLocalErrorMessage = (errorMsg: string) => {
  clearLocalErrorMessageTimer();
  uploadError.value = errorMsg;
  errorMessageTimer.value = window.setTimeout(() => {
    uploadError.value = '';
    errorMessageTimer.value = null;
  }, errorMessageDuration);
};

const clearLocalErrorMessageTimer = () => {
  if (errorMessageTimer.value !== null) {
    window.clearTimeout(errorMessageTimer.value);
    errorMessageTimer.value = null;
  }
};

const props = defineProps<{
  fileTypeSelected: string;
  showGuide: boolean;
  currentGuideStep: number;
  guideCompleted: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:fileTypeSelected', value: string): void;
  (e: 'file-changed-raw', file: ElUploadFile,
    callbacks: {
      showError: (msg: string) => void;
      addFileToList: (fileInfo: InternalUploadedFile) => void;
      clearError: () => void;
    }
  ): void;
  (e: 'request-download-template'): void;
  (e: 'guide-interaction', payload: { type: 'skip' | 'next-step-clicked' | 'completed' }): void;
  (e: 'element-ready', payload: { name: string, element: any }): void;
}>();

const fileTypeSelectRef = ref<any>(null);
const downloadTemplateRef = ref<HTMLElement | null>(null);
const fileUploadAreaRef = ref<HTMLElement | null>(null);

const onFileTypeChange = (value: string) => {
  emit('update:fileTypeSelected', value);
};

const onFileChange = (uploadFile: ElUploadFile) => {
  const rawFile = uploadFile.raw;
  if (!rawFile) {
    handleLocalErrorMessage('无法获取原始文件数据。');
    return;
  }

  if (uploadedFiles.value.some(f => f.name === rawFile.name)) {
    handleLocalErrorMessage(`文件 "${rawFile.name}" 已存在于列表中。`);
    return;
  }
  
  emit('file-changed-raw', uploadFile, {
    showError: handleLocalErrorMessage,
    addFileToList: (fileInfo: InternalUploadedFile) => {
      uploadedFiles.value.push(fileInfo);
      uploadError.value = '';
      clearLocalErrorMessageTimer();
    },
    clearError: () => {
      uploadError.value = '';
      clearLocalErrorMessageTimer();
    }
  });
};

const onDownloadTemplateClick = () => {
  emit('request-download-template');
};

const removeFile = (index: number) => {
  if (uploadedFiles.value[index]) {
    ElMessage.success(`文件 "${uploadedFiles.value[index].name}" 已移除。`);
  }
  uploadedFiles.value.splice(index, 1);
  uploadError.value = '';
  clearLocalErrorMessageTimer();
};

onMounted(() => {
  nextTick(() => {
    if (fileTypeSelectRef.value?.$el) {
       emit('element-ready', { name: 'fileTypeSelect', element: fileTypeSelectRef.value.$el });
    } else if (fileTypeSelectRef.value) {
       emit('element-ready', { name: 'fileTypeSelect', element: fileTypeSelectRef.value });
    }

    if (downloadTemplateRef.value) {
      emit('element-ready', { name: 'downloadTemplate', element: downloadTemplateRef.value });
    }
    if (fileUploadAreaRef.value) {
      emit('element-ready', { name: 'fileUploadArea', element: fileUploadAreaRef.value });
    }
  });
});

watch(() => props.currentGuideStep, () => {
  if (props.showGuide && !props.guideCompleted) {
    // This logic remains complex and highly dependent on specific guide needs.
    // For now, relying on onMounted emits.
  }
});

watch(() => props.fileTypeSelected, (newType, oldType) => {
  if (newType !== oldType && uploadedFiles.value.length > 0) {
    console.log('File type changed, uploaded files might need to be cleared depending on UX requirements.')
  }
});

</script>

<style scoped lang="scss">
// Copied and adapted styles from FileImport.vue for Step 1
// Renamed classes to be unique to this component to avoid potential conflicts if global styles exist.
// Using a common prefix like -step1 is a simple way.
.step-body-step1 {
  // Basic structure, can be enhanced
}

.full-width-step1 {
  width: 20%; // Original was 20%
  margin-bottom: 10px;
}

.download-template-step1 {
  margin: 10px 0 15px;
}

.import-area-bordered-step1 {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #fff;
}

.import-instructions-step1 {
  margin-bottom: 20px;
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #409EFF; // Assuming $primary-color equivalent

  .instruction-header-step1 {
    margin-bottom: 10px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .instruction-list-step1 {
    padding-left: 20px;
    margin: 0;

    li {
      margin-bottom: 5px;
      color: #666;
    }
  }
}

.file-select-area-step1 {
  padding: 10px;
}

.upload-area-step1 {
  width: 100%;

  .upload-content-step1 {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 0;
  }

  .el-icon--upload {
    font-size: 50px;
    color: #8c939d;
    margin-bottom: 16px;
  }

  .el-upload__text {
    font-size: 16px;
    color: #606266;
    margin-bottom: 10px;

    em {
      color: #409EFF; // Assuming $primary-color equivalent
      font-style: normal;
      margin-left: 4px;
      cursor: pointer;
    }
  }

  .el-upload__tip {
    font-size: 14px;
    color: #909399;
    text-align: center;
  }
}

.uploaded-files-step1 {
  margin-top: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #ebeef5;

  .file-item-step1 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }

    .file-info-step1 {
      display: flex;
      align-items: center;
      gap: 20px;

      .file-name-step1 {
        font-weight: 500;
        color: #303133;
      }

      .file-date-step1 {
        color: #909399;
        font-size: 13px;
      }
    }
  }
}

.upload-error-step1 {
  margin-top: 15px;

  .el-alert {
    border-radius: 4px;
  }
}
</style> 