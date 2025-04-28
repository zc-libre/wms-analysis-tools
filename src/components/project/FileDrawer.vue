<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Delete, Download, Upload } from '@element-plus/icons-vue'

// 定义props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  project: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

// 文件列表数据
const fileList = ref<any[]>([])
const loading = ref(false)
const uploadVisible = ref(false)

// 模拟获取项目文件数据
const fetchProjectFiles = async () => {
  if (!props.project) return
  
  loading.value = true
  
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // 模拟返回数据
    const mockData = Array.from({ length: props.project.fileCount || 5 }, (_, index) => ({
      id: index + 1,
      name: `文件${index + 1}.${['doc', 'pdf', 'xlsx', 'jpg', 'zip'][index % 5]}`,
      size: Math.floor(Math.random() * 10000) + 50,
      uploadTime: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      uploadBy: `上传人${index % 3 + 1}`
    }))
    
    fileList.value = mockData
  } catch (error) {
    console.error('获取项目文件失败', error)
    ElMessage.error('获取项目文件失败')
  } finally {
    loading.value = false
  }
}

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + 'MB'
  }
}

// 根据文件类型获取图标
const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  
  switch (extension) {
    case 'pdf':
      return 'icon-pdf'
    case 'doc':
    case 'docx':
      return 'icon-word'
    case 'xls':
    case 'xlsx':
      return 'icon-excel'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'icon-image'
    case 'zip':
    case 'rar':
      return 'icon-zip'
    default:
      return 'icon-file'
  }
}

// 下载文件
const handleDownload = (file: any) => {
  ElMessage.success(`开始下载文件：${file.name}`)
  // 实际项目中应调用下载接口
}

// 删除文件
const handleDelete = (file: any) => {
  ElMessageBox.confirm(
    `确定要删除文件"${file.name}"吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 模拟删除操作
      fileList.value = fileList.value.filter(item => item.id !== file.id)
      ElMessage.success('文件删除成功')
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 打开上传模态框
const openUploadModal = () => {
  uploadVisible.value = true
}

// 抽屉可见性
const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

// 当项目变化时获取文件数据
watch([() => props.project, () => props.modelValue], ([project, visible]) => {
  if (project && visible) {
    fetchProjectFiles()
  }
})
</script>

<template>
  <el-drawer
    v-model="visible"
    :title="`项目文件 - ${project?.name || ''}`"
    size="50%"
    :destroy-on-close="false"
  >
    <template #header>
      <div class="file-drawer__header">
        <h3 class="file-drawer__title">项目文件 - {{ project?.name }}</h3>
        <el-button type="primary" @click="openUploadModal">
          <el-icon><Upload /></el-icon>
          上传文件
        </el-button>
      </div>
    </template>
    
    <div class="file-drawer__content">
      <!-- 加载中 -->
      <div v-if="loading" class="file-drawer__loading">
        <el-skeleton :rows="5" animated />
      </div>
      
      <!-- 文件列表 -->
      <template v-else>
        <div v-if="fileList.length === 0" class="file-drawer__empty">
          <el-empty description="暂无文件" />
        </div>
        
        <el-table v-else :data="fileList" style="width: 100%">
          <el-table-column label="文件名" min-width="220">
            <template #default="{ row }">
              <div class="file-item">
                <el-icon><Document /></el-icon>
                <span class="file-name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="大小" width="100">
            <template #default="{ row }">
              {{ formatFileSize(row.size) }}
            </template>
          </el-table-column>
          
          <el-table-column label="上传时间" width="180">
            <template #default="{ row }">
              {{ row.uploadTime }}
            </template>
          </el-table-column>
          
          <el-table-column label="上传人" width="120">
            <template #default="{ row }">
              {{ row.uploadBy }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                :icon="Download"
                @click="handleDownload(row)"
              >
                下载
              </el-button>
              <el-button
                type="danger"
                link
                :icon="Delete"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </div>
    
    <!-- 上传文件模态框 -->
    <el-dialog
      v-model="uploadVisible"
      title="上传文件"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-upload
        class="file-upload"
        drag
        action="#"
        :auto-upload="false"
        multiple
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持任意类型文件，单文件大小不超过10MB
          </div>
        </template>
      </el-upload>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadVisible = false">取消</el-button>
          <el-button type="primary" @click="uploadVisible = false">
            确认上传
          </el-button>
        </span>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<style scoped>
.file-drawer__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.file-drawer__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.file-drawer__content {
  padding: 16px 0;
}

.file-drawer__loading {
  padding: 20px;
}

.file-drawer__empty {
  padding: 30px 0;
}

.file-item {
  display: flex;
  align-items: center;
}

.file-name {
  margin-left: 8px;
}

.file-upload {
  width: 100%;
}
</style> 