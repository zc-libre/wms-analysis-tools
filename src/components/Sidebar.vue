<template>
  <div class="sidebar-container">
    <div class="project-management-header">
      <el-text tag="h5">项目管理</el-text>
      <el-button type="primary" size="small" :icon="Plus">
        新建
      </el-button>
    </div>

    <div class="project-list">
      <el-card
        v-for="(project, index) in projects"
        :key="project.id"
        class="project-card"
        :body-style="{ padding: '0px' }"
        :class="{ active: activeProjectId === project.id }"
        @click="setActiveProject(project.id)"
      >
        <div class="project-card-content">
          <div class="project-info">
            <div class="project-title-actions">
              <el-tooltip :content="project.name" placement="top">
                <span class="project-title">{{ project.name }}</span>
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
                <el-button link type="primary" size="small" class="action-btn">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button link type="danger" size="small" class="action-btn">
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
                >
                  上传
                </el-button>
              </div>
              <div
                v-for="file in project.files"
                :key="file.id"
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

const projects = ref<Project[]>([
  {
    id: 1,
    name: '南京物流中心项目',
    company: '江苏分公司',
    location: '南京市江宁区',
    filesVisible: true,
    files: [
      { id: 'file1', name: '销售出库订单_202503.xlsx', date: '2025-03-20', size: '3.4MB' },
      { id: 'file2', name: '销售出库订单_202502.xlsx', date: '2025-02-15', size: '2.8MB' },
      { id: 'file3', name: '销售出库订单_202501.xlsx', date: '2025-01-10', size: '3.1MB' }
    ]
  },
  {
    id: 2,
    name: '上海配送中心项目',
    company: '上海分公司',
    location: '上海市嘉定区',
    filesVisible: false,
    files: [
      { id: 'file4', name: '销售出库订单_202503_SH.xlsx', date: '2025-03-18', size: '4.2MB' },
      { id: 'file5', name: '销售出库订单_202502_SH.xlsx', date: '2025-02-12', size: '3.5MB' }
    ]
  },
   {
    id: 3,
    name: '广州配送中心项目',
    company: '广东分公司',
    location: '广州市番禺区',
    filesVisible: false,
    files: [
      { id: 'file6', name: '销售出库订单_202503_GZ.xlsx', date: '2025-03-19', size: '3.8MB' }
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