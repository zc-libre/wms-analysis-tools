<template>
  <div class="sidebar-container">
    <div class="project-management-header">
      <el-text tag="h5">项目管理</el-text>
      <el-button type="primary" size="small" :icon="Plus" @click="newProjectVisible = true">
        新建
      </el-button>
    </div>

    <!-- 新建项目对话框 -->
    <NewProjectModal
      v-model:visible="newProjectVisible"
      @save="handleCreateProject"
    />

    <!-- 编辑项目对话框 -->
    <EditProjectModal
      v-model:visible="editProjectVisible"
      :project-data="currentEditProject"
      @save="handleUpdateProject"
    />

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteConfirmVisible"
      title="确认删除"
      width="30%"
      :close-on-click-modal="false"
      class="delete-confirm-dialog"
    >
      <div class="delete-confirm-content">
        <p>确定要删除这个项目吗？该操作无法撤销，项目下的所有文件也将被删除。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteConfirmVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDeleteProject">
            确认删除
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 文件上传对话框 -->
    <FileUploadModal
      v-model:visible="uploadDialogVisible"
      :project-id="currentUploadProjectId"
      @upload="handleFileUpload"
    />

    <div class="project-list">
      <el-card
        v-for="(project, index) in projects"
        :key="index"
        class="project-card"
        :body-style="{ padding: '0px' }"
        :class="{ active: activeProjectId === project.id }"
        @click="setActiveProject(project.id)"
      >
        <div class="project-card-content">
          <div class="project-info">
            <div class="project-title-actions">
              <el-tooltip :content="project.name" placement="top">
                <span  class="project-title">{{ project.name }}</span>
              </el-tooltip>
              <div class="project-actions">
                <el-button
                  link
                  type="primary"
                  size="small"
                  class="action-btn"
                  @click.stop="toggleFiles(project.id)"
                >
                  <el-icon>
                    <component :is="project.filesVisible ? FolderOpened : Folder" />
                  </el-icon>
                </el-button>
                <el-button link type="primary" size="small" class="action-btn" @click.stop="handleEditProject(project)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button link type="danger" size="small" class="action-btn" @click.stop="handleDeleteProject(project)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="project-details">
              <span>{{ project.company }} | {{ project.location }}</span>
            </div>
          </div>

          <el-collapse-transition>
            <div v-show="project.filesVisible" class="file-drawer">
              <div class="file-list-header">
                <el-text size="small" type="info">文件列表</el-text>
                <el-button
                  type="success"
                  plain
                  size="small"
                  :icon="Upload"
                  class="upload-btn"
                  @click.stop="openUploadDialog(project.id)"
                >
                  上传
                </el-button>
              </div>
              <div
                v-for="file in project.files"
                :key="file.id"
                :title="file.name"
                class="file-item"
                :class="{ active: activeFileId === file.id }"
                @click.stop="setActiveFile(file.id)"
              >
                <div class="file-info">
                  <el-icon class="file-icon" color="#67C23A"><Document /></el-icon>
                  <span class="file-name">{{ file.name }}</span>
                </div>
                <div class="file-meta">
                  <span>{{ file.date }} | {{ file.size }}</span>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Plus,
  Folder,
  FolderOpened,
  Edit,
  Delete,
  Upload,
  Document
} from '@element-plus/icons-vue'
import NewProjectModal from './NewProjectModal.vue'
import EditProjectModal from './EditProjectModal.vue'
import FileUploadModal from './FileUploadModal.vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../stores/project'
import { useViewStateStore } from '../stores/viewState'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'

interface File {
  id: string
  name: string
  date: string
  size: string
}

interface Project {
  id: number
  name: string
  company: string
  location: string
  filesVisible: boolean
  files: File[]
}

const activeProjectId = ref(1)
const activeFileId = ref('file1')
const router = useRouter()
const projectStore = useProjectStore()
const viewStateStore = useViewStateStore()
// 从viewStateStore获取activeOrderDataType，以便后续判断当前标签页
const { activeOrderDataType } = storeToRefs(viewStateStore)

const projects = ref<Project[]>([
  {
    id: 1,
    name: '南京物流中心项目',
    company: '江苏分公司',
    location: '南京市江宁区',
    filesVisible: true,
    files: [
      { id: 'file1', name: '销售出库订单_202503.xlsx', date: '2025-03-20', size: '3.4MB' },
      { id: 'file2', name: '物料主数据_202502.xlsx', date: '2025-02-15', size: '2.8MB' },
      { id: 'file3', name: '入库单据_202501.xlsx', date: '2025-01-10', size: '3.1MB' },
      { id: 'file4', name: '库存记录_202412.xlsx', date: '2024-12-05', size: '2.9MB' }
    ]
  },
  {
    id: 2,
    name: '上海配送中心项目',
    company: '上海分公司',
    location: '上海市嘉定区',
    filesVisible: false,
    files: [
      { id: 'file5', name: '销售出库订单_202503_SH.xlsx', date: '2025-03-18', size: '4.2MB' },
      { id: 'file6', name: '物料主数据_202502_SH.xlsx', date: '2025-02-12', size: '3.5MB' },
      { id: 'file7', name: '入库单据_202501_SH.xlsx', date: '2025-01-15', size: '2.7MB' }
    ]
  },
  {
    id: 3,
    name: '广州配送中心项目',
    company: '广东分公司',
    location: '广州市番禺区',
    filesVisible: false,
    files: [
      { id: 'file8', name: '销售出库订单_202503_GZ.xlsx', date: '2025-03-19', size: '3.8MB' },
      { id: 'file9', name: '库存记录_202502_GZ.xlsx', date: '2025-02-20', size: '3.2MB' }
    ]
  }
])

const toggleFiles = (projectId: number) => {
  const project = projects.value.find(p => p.id === projectId)
  if (project) {
    project.filesVisible = !project.filesVisible
  }
}

const setActiveProject = (projectId: number) => {
  activeProjectId.value = projectId
  // Optionally collapse others and expand this one
  projects.value.forEach(p => {
      p.filesVisible = p.id === projectId;
  });
}

const setActiveFile = (fileId: string) => {
  activeFileId.value = fileId
  const project = projects.value.find(p => p.files.some(f => f.id === fileId))
  if (project) {
    const file = project.files.find(f => f.id === fileId)
    if (file) {
      let mappedType: string | null = null
      const fileNameLower = file.name.toLowerCase()

      // 根据文件名确定文件类型
      if (fileNameLower.includes('销售出库订单')) {
        mappedType = 'salesOrder'
      } else if (fileNameLower.includes('物料主数据')) {
        mappedType = 'materialData'
      } else if (fileNameLower.includes('入库单据')) {
        mappedType = 'inboundOrder'
      } else if (fileNameLower.includes('库存记录')) {
        mappedType = 'inventoryRecord'
      }

      // 判断当前选中标签页与文件类型是否相同
      if (mappedType && mappedType !== activeOrderDataType.value) {
        console.log(`文件类型 ${mappedType} 与当前选中标签页 ${activeOrderDataType.value || '无'} 不一致，将自动切换标签页`)
      } else if (mappedType && mappedType === activeOrderDataType.value) {
        console.log(`文件类型 ${mappedType} 与当前选中标签页一致，无需切换`)
      } else if (!mappedType) {
        console.log(`无法识别文件 ${file.name} 的类型，将使用默认类型`)
      }

      // 无论是否一致，都设置activeOrderContext，这将触发OrderData.vue中的watch实现自动切换
      viewStateStore.setActiveOrderContext(mappedType, file.name)

      if (mappedType) {
        // 导航到OrderData视图，如果当前不在该视图
        const currentRoute = router.currentRoute.value;
        if (currentRoute.name !== 'OrderData') {
          router.push({ name: 'OrderData' }); 
        }
      } else {
        // 如果文件类型无法识别，可以提供适当的反馈
        ElMessage.warning('无法识别的文件类型');
      }
    }
  }
}

// 新建项目对话框可见性
const newProjectVisible = ref(false)

// 编辑项目对话框可见性
const editProjectVisible = ref(false)
const currentEditProject = ref<Project | null>(null)

// 删除项目确认对话框可见性
const deleteConfirmVisible = ref(false)
const projectToDelete = ref<Project | null>(null)

// 文件上传对话框可见性
const uploadDialogVisible = ref(false)
const currentUploadProjectId = ref<number | null>(null)

// 处理新建项目
const handleCreateProject = (projectData: any) => {
  const newProject = {
    id: projects.value.length + 1,
    name: projectData.name,
    company: projectData.company,
    location: projectData.location,
    filesVisible: false,
    files: []
  }
  projects.value.push(newProject)
}

// 处理编辑项目
const handleEditProject = (project: Project) => {
  currentEditProject.value = { ...project }
  editProjectVisible.value = true
}

// 处理更新项目
const handleUpdateProject = (projectData: any) => {
  const index = projects.value.findIndex(p => p.id === projectData.id)
  if (index !== -1) {
    projects.value[index] = {
      ...projects.value[index],
      name: projectData.name,
      company: projectData.company,
      location: projectData.location
    }
  }
}

// 处理删除项目
const handleDeleteProject = (project: Project) => {
  projectToDelete.value = project
  deleteConfirmVisible.value = true
}

// 确认删除项目
const confirmDeleteProject = () => {
  if (projectToDelete.value) {
    const index = projects.value.findIndex(p => p.id === projectToDelete.value!.id)
    if (index !== -1) {
      projects.value.splice(index, 1)
      
      // 如果删除的是当前活动项目，则重置活动项目
      if (activeProjectId.value === projectToDelete.value.id) {
        activeProjectId.value = projects.value.length > 0 ? projects.value[0].id : 0
      }
    }
    deleteConfirmVisible.value = false
    projectToDelete.value = null
  }
}

// 打开文件上传对话框
const openUploadDialog = (projectId: number) => {
  // 获取当前项目名称
  const project = projects.value.find(p => p.id === projectId);
  if (!project) return;
  
  // 使用 Pinia store 存储项目信息
  projectStore.setCurrentProject(projectId, project.name);
  
  // 同时将项目信息存储到 sessionStorage
  sessionStorage.setItem('currentProject', JSON.stringify({
    id: project.id,
    name: project.name,
    company: project.company,
    location: project.location
  }));
  
  // 导航到文件导入页面，不再使用查询参数
  router.push({
    name: 'FileImport'
  });
}

// 处理文件上传
const handleFileUpload = (fileData: any) => {
  // 这里实际项目中应该有文件上传的API调用
  // 这里仅做模拟展示
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]
  const newFile = {
    id: `file${Date.now()}`,
    name: fileData.fileName,
    date: dateStr,
    size: '3.0MB'
  }
  
  const projectIndex = projects.value.findIndex(p => p.id === fileData.projectId)
  if (projectIndex !== -1) {
    projects.value[projectIndex].files.push(newFile)
  }
}
</script>

<style scoped lang="scss">
.sidebar-container {
  padding: 15px;
  height: 100%;
  box-sizing: border-box;
}

.project-management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .el-text {
    font-weight: 600;
  }
}

.delete-confirm-dialog {
  .delete-confirm-content {
    margin: 10px 0;
    
    p {
      font-size: 14px;
      line-height: 1.5;
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

.project-list {
  .project-card {
    margin-bottom: 15px;
    cursor: pointer;
    border: 1px solid var(--el-border-color-light);
    transition: all 0.2s ease-in-out;
    border-left: 4px solid transparent; // For active state

    &.active {
       border-left-color: var(--el-color-primary);
       background-color: var(--el-color-primary-light-9);
    }

    &:hover {
       box-shadow: var(--el-box-shadow-light);
    }

    .project-card-content {
        padding: 10px 15px;
    }

    .project-info {
       margin-bottom: 10px;
    }

    .project-title-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }

    .project-title {
      font-weight: 500;
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 150px; // Adjust as needed
      display: inline-block;
    }

    .project-actions {
      display: flex;
      align-items: center;
       .action-btn {
            padding: 2px;
            font-size: 1rem;
            margin-left: 5px;
       }
    }

    .project-details {
      font-size: 0.8rem;
      color: var(--el-text-color-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-drawer {
      padding-left: 10px;
      margin-top: 10px;
      border-left: 2px solid var(--el-border-color-lighter);
      background-color: #fff; // Ensure background contrast
    }

    .file-list-header {
       display: flex;
       justify-content: space-between;
       align-items: center;
       margin-bottom: 8px;
       padding-right: 5px; // Space for button
    }
    .upload-btn {
        padding: 3px 8px;
    }

    .file-item {
      padding: 6px 8px;
      margin-bottom: 6px;
      border-radius: 4px;
      transition: background-color 0.2s;
      background-color: #fdfdfd;
      border: 1px solid var(--el-border-color-extra-light);
      font-size: 0.85rem;

      &:hover {
        background-color: var(--el-color-primary-light-9);
      }

      &.active {
        background-color: var(--el-color-primary-light-8);
        border-left: 3px solid var(--el-color-primary);
        font-weight: 500;
      }

      .file-info {
           display: flex;
           align-items: center;
           margin-bottom: 3px;
      }
      .file-icon {
           margin-right: 6px;
      }
      .file-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
      }
      .file-meta {
          font-size: 0.75rem;
          color: var(--el-text-color-secondary);
          padding-left: 22px; // Align with file name
      }
    }
  }
}
</style> 