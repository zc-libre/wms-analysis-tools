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

    <!-- 批量删除文件确认对话框 (对应清单步骤 18) -->
    <el-dialog
      v-model="batchDeleteConfirmVisible"
      title="确认批量删除"
      width="30%"
      :close-on-click-modal="false"
      class="batch-delete-confirm-dialog" 
    >
      <div class="delete-confirm-content">
        <p v-if="projectForBatchDeleteId !== null">
          确定要删除选中的 {{ selectedFileCount(projectForBatchDeleteId).value }} 个文件吗？该操作无法撤销。
        </p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDeleteConfirmVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmBatchDeleteFiles">
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
                <div>
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
                  <el-checkbox 
                    :model-value="selectedFiles[project.id]?.has(file.id)"
                    @change="toggleFileSelection(project.id, file.id)"
                    @click.stop 
                    class="file-checkbox"
                  />
                  <el-icon class="file-icon" color="#67C23A"><Document /></el-icon>
                  <span class="file-name">{{ file.name }}</span>
                </div>
                <div class="file-meta">
                  <span>{{ file.date }} | {{ file.size }}</span>
                </div>
              </div>
              <div class="file-list-actions">
                  <el-button
                    v-if="hasSelectedFiles(project.id).value"
                    type="danger"
                    plain
                    size="small"
                    :icon="Delete"
                    class="batch-delete-btn"
                    @click.stop="handleBatchDeleteFiles(project.id)"
                  >
                    批量删除
                  </el-button>
              </div>
            </div>
          </el-collapse-transition>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
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

interface NewProjectData {
  name: string;
  company: string;
  location: string;
}

interface UpdateProjectData {
  id: number;
  name: string;
  company: string;
  location: string;
}

interface FileUploadData {
  projectId: number;
  fileName: string;
}

const activeProjectId = ref(1)
const activeFileId = ref('file1')
const router = useRouter()
const projectStore = useProjectStore()
const viewStateStore = useViewStateStore()
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

const selectedFiles = ref<Record<number, Set<string>>>({});
const batchDeleteConfirmVisible = ref(false)
const projectForBatchDeleteId = ref<number | null>(null)

watchEffect(() => {
  projects.value.forEach(project => {
    if (!selectedFiles.value[project.id]) {
      selectedFiles.value[project.id] = new Set();
    }
  });
});

const hasSelectedFiles = (projectId: number) => computed(() => {
  return selectedFiles.value[projectId] && selectedFiles.value[projectId].size > 0;
});

const selectedFileCount = (projectId: number | null) => computed(() => {
  if (projectId === null || !selectedFiles.value[projectId]) {
    return 0;
  }
  return selectedFiles.value[projectId].size;
});

const toggleFileSelection = (projectId: number, fileId: string) => {
  if (!selectedFiles.value[projectId]) {
    selectedFiles.value[projectId] = new Set();
  }
  const projectSelectedFiles = selectedFiles.value[projectId];
  if (projectSelectedFiles.has(fileId)) {
    projectSelectedFiles.delete(fileId);
  } else {
    projectSelectedFiles.add(fileId);
  }
};

const handleBatchDeleteFiles = (projectId: number) => {
  if (selectedFileCount(projectId).value === 0) {
    ElMessage.warning('请至少选择一个文件进行删除。');
    return;
  }
  projectForBatchDeleteId.value = projectId;
  batchDeleteConfirmVisible.value = true;
};

const confirmBatchDeleteFiles = () => {
  if (projectForBatchDeleteId.value === null) return;

  const projectId = projectForBatchDeleteId.value;
  const project = projects.value.find(p => p.id === projectId);

  if (project && selectedFiles.value[projectId]) {
    const filesToDeleteIdsSet = selectedFiles.value[projectId];
    const numberOfFilesToDelete = filesToDeleteIdsSet.size; // 获取实际选中的文件数量

    if (numberOfFilesToDelete > 0) {
      project.files = project.files.filter(file => !filesToDeleteIdsSet.has(file.id));
      ElMessage.success(`成功删除了 ${numberOfFilesToDelete} 个文件。`);
    } else {
      // 此情况理论上不应发生，因为批量删除按钮的显示依赖于 hasSelectedFiles
      ElMessage.info('没有选中需要删除的文件。');
    }
    filesToDeleteIdsSet.clear(); // 清空当前项目的选中文件集合
  }
  batchDeleteConfirmVisible.value = false;
  projectForBatchDeleteId.value = null;
};

const toggleFiles = (projectId: number) => {
  const project = projects.value.find(p => p.id === projectId)
  if (project) {
    project.filesVisible = !project.filesVisible
    if (!project.filesVisible && selectedFiles.value[project.id]?.size > 0) {
      selectedFiles.value[project.id].clear();
    }
  }
}

const setActiveProject = (projectId: number) => {
  activeProjectId.value = projectId
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

      if (fileNameLower.includes('销售出库订单')) {
        mappedType = 'salesOrder'
      } else if (fileNameLower.includes('物料主数据')) {
        mappedType = 'materialData'
      } else if (fileNameLower.includes('入库单据')) {
        mappedType = 'inboundOrder'
      } else if (fileNameLower.includes('库存记录')) {
        mappedType = 'inventoryRecord'
      }

      if (mappedType && mappedType !== activeOrderDataType.value) {
        console.log(`文件类型 ${mappedType} 与当前选中标签页 ${activeOrderDataType.value || '无'} 不一致，将自动切换标签页`)
      } else if (mappedType && mappedType === activeOrderDataType.value) {
        console.log(`文件类型 ${mappedType} 与当前选中标签页一致，无需切换`)
      } else if (!mappedType) {
        console.log(`无法识别文件 ${file.name} 的类型，将使用默认类型`)
      }

      viewStateStore.setActiveOrderContext(mappedType, file.name)

      if (mappedType) {
        const currentRoute = router.currentRoute.value;
        if (currentRoute.name !== 'OrderData') {
          router.push({ name: 'OrderData' }); 
        }
      } else {
        ElMessage.warning('无法识别的文件类型');
      }
    }
  }
}

const newProjectVisible = ref(false)
const editProjectVisible = ref(false)
const currentEditProject = ref<Project | null>(null)
const deleteConfirmVisible = ref(false)
const projectToDelete = ref<Project | null>(null)
const uploadDialogVisible = ref(false)
const currentUploadProjectId = ref<number | null>(null)

const handleCreateProject = (projectData: NewProjectData) => {
  const newProject: Project = {
    id: projects.value.length > 0 ? Math.max(...projects.value.map(p => p.id)) + 1 : 1,
    name: projectData.name,
    company: projectData.company,
    location: projectData.location,
    filesVisible: false,
    files: []
  }
  projects.value.push(newProject)
}

const handleEditProject = (project: Project) => {
  currentEditProject.value = { ...project }
  editProjectVisible.value = true
}

const handleUpdateProject = (projectData: UpdateProjectData) => {
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

const handleDeleteProject = (project: Project) => {
  projectToDelete.value = project
  deleteConfirmVisible.value = true
}

const confirmDeleteProject = () => {
  if (projectToDelete.value) {
    const deletedProjectId = projectToDelete.value.id;
    const index = projects.value.findIndex(p => p.id === deletedProjectId)
    if (index !== -1) {
      projects.value.splice(index, 1)
      
      if (activeProjectId.value === deletedProjectId) {
        activeProjectId.value = projects.value.length > 0 ? projects.value[0].id : 0
      }
      if (selectedFiles.value[deletedProjectId]) {
        delete selectedFiles.value[deletedProjectId];
      }
    }
    deleteConfirmVisible.value = false
    projectToDelete.value = null
  }
}

const openUploadDialog = (projectId: number) => {
  const project = projects.value.find(p => p.id === projectId);
  if (!project) return;
  
  projectStore.setCurrentProject(projectId, project.name);
  
  sessionStorage.setItem('currentProject', JSON.stringify({
    id: project.id,
    name: project.name,
    company: project.company,
    location: project.location
  }));
  
  router.push({
    name: 'FileImport'
  });
}

const handleFileUpload = (fileData: FileUploadData) => {
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
    border-left: 4px solid transparent;

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
      max-width: 150px;
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
      background-color: #fff;
    }

    .file-list-header {
       display: flex;
       justify-content: space-between;
       align-items: center;
       margin-bottom: 8px;
       padding-right: 5px;
    }
    
    .upload-btn {
        padding: 3px 8px;
    }

    .file-list-actions {
      margin-top: 10px;
      padding-right: 5px;
      text-align: right;

      .batch-delete-btn {
        // Specific styles for the button in its new container, if needed.
        // For now, it will inherit global batch-delete-btn styles or element-plus defaults.
      }
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
          padding-left: 22px;
      }

      .file-checkbox {
        margin-right: 8px;
      }
    }
  }
}
</style> 