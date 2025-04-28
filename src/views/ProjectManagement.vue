<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProjectCard from '@/components/project/ProjectCard.vue'
import NewProjectModal from '@/components/project/NewProjectModal.vue'
import EditProjectModal from '@/components/project/EditProjectModal.vue'
import FileDrawer from '@/components/project/FileDrawer.vue'

// 页面标题
const pageTitle = ref('项目管理')

// 搜索条件
const searchForm = reactive({
  name: '',
  manager: '',
  status: ''
})

// 项目列表数据
const projectList = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

// 新增项目模态框可见性
const newProjectModalVisible = ref(false)

// 编辑项目模态框可见性
const editProjectModalVisible = ref(false)
const currentProject = ref<any>(null)

// 文件抽屉可见性
const fileDrawerVisible = ref(false)
const currentProjectFiles = ref<any>(null)

// 项目状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '进行中', value: 'inProgress' },
  { label: '已完成', value: 'completed' },
  { label: '已暂停', value: 'paused' },
  { label: '已取消', value: 'cancelled' }
]

// 模拟获取项目数据
const fetchProjectData = async () => {
  loading.value = true
  
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 模拟返回数据
    const mockData = Array.from({ length: 35 }, (_, index) => ({
      id: index + 1,
      name: `项目${index + 1}`,
      code: `PRJ${String(10000 + index).substring(1)}`,
      manager: `负责人${index % 5 + 1}`,
      department: `部门${index % 8 + 1}`,
      startDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      endDate: index % 10 === 0 ? null : `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      status: ['inProgress', 'completed', 'paused', 'cancelled'][Math.floor(Math.random() * 4)],
      description: `这是项目${index + 1}的详细描述，包含项目背景、目标和范围等信息。`,
      progress: Math.floor(Math.random() * 100),
      team: Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, memberIndex) => `成员${memberIndex + 1}`),
      fileCount: Math.floor(Math.random() * 10)
    }))
    
    // 根据搜索条件过滤
    const filteredData = mockData.filter(item => {
      return (
        (searchForm.name ? item.name.includes(searchForm.name) || item.code.includes(searchForm.name) : true) &&
        (searchForm.manager ? item.manager.includes(searchForm.manager) : true) &&
        (searchForm.status ? item.status === searchForm.status : true)
      )
    })
    
    // 分页处理
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    
    projectList.value = filteredData.slice(startIndex, endIndex)
    total.value = filteredData.length
  } catch (error) {
    console.error('获取项目数据失败', error)
    // 实际项目中应显示错误提示
    ElMessage.error('获取项目数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索项目
const handleSearch = () => {
  currentPage.value = 1
  fetchProjectData()
}

// 重置搜索条件
const handleReset = () => {
  searchForm.name = ''
  searchForm.manager = ''
  searchForm.status = ''
  handleSearch()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchProjectData()
}

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchProjectData()
}

// 打开新增项目模态框
const handleAddProject = () => {
  newProjectModalVisible.value = true
}

// 新增项目成功回调
const handleProjectAdded = () => {
  fetchProjectData()
  ElMessage.success('项目创建成功')
}

// 查看项目文件
const handleViewFiles = (project: any) => {
  currentProjectFiles.value = project
  fileDrawerVisible.value = true
}

// 编辑项目
const handleEditProject = (project: any) => {
  currentProject.value = { ...project }
  editProjectModalVisible.value = true
}

// 编辑项目成功回调
const handleProjectEdited = () => {
  fetchProjectData()
  ElMessage.success('项目更新成功')
}

// 删除项目
const handleDeleteProject = (project: any) => {
  ElMessageBox.confirm(
    `确定要删除项目"${project.name}"吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 模拟删除操作
      setTimeout(() => {
        fetchProjectData()
        ElMessage.success('项目删除成功')
      }, 500)
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 页面加载时获取数据
onMounted(() => {
  fetchProjectData()
})
</script>

<template>
  <div class="project-management">
    <div class="project-management__header">
      <h2 class="project-management__title">{{ pageTitle }}</h2>
      
      <!-- 搜索表单 -->
      <div class="project-management__search">
        <el-form :inline="true" :model="searchForm" class="project-management__form">
          <el-form-item label="项目名称/编号">
            <el-input 
              v-model="searchForm.name" 
              placeholder="请输入项目名称或编号"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item label="负责人">
            <el-input 
              v-model="searchForm.manager" 
              placeholder="请输入负责人"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择项目状态" clearable>
              <el-option
                v-for="option in statusOptions.filter(o => o.value !== '')"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <!-- 工具栏 -->
    <div class="project-management__toolbar">
      <el-button type="primary" @click="handleAddProject">
        <el-icon><Plus /></el-icon>
        新增项目
      </el-button>
    </div>
    
    <!-- 项目列表 -->
    <div class="project-management__content">
      <el-row :gutter="20">
        <el-col 
          v-for="project in projectList" 
          :key="project.id" 
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6"
          :xl="6"
          class="project-management__card-wrapper"
        >
          <project-card
            :project="project"
            @view-files="handleViewFiles"
            @edit="handleEditProject"
            @delete="handleDeleteProject"
          />
        </el-col>
      </el-row>
      
      <!-- 空状态 -->
      <el-empty 
        v-if="!loading && projectList.length === 0" 
        description="暂无项目数据" 
      />
      
      <!-- 分页器 -->
      <div class="project-management__pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 加载中 -->
    <div v-if="loading" class="project-management__loading">
      <el-skeleton :rows="10" animated />
    </div>
    
    <!-- 新增项目模态框 -->
    <new-project-modal
      v-model="newProjectModalVisible"
      @success="handleProjectAdded"
    />
    
    <!-- 编辑项目模态框 -->
    <edit-project-modal
      v-model="editProjectModalVisible"
      :project="currentProject"
      @success="handleProjectEdited"
    />
    
    <!-- 项目文件抽屉 -->
    <file-drawer
      v-model="fileDrawerVisible"
      :project="currentProjectFiles"
    />
  </div>
</template>

<style scoped>
.project-management {
  padding: 20px;
  height: 100%;
}

.project-management__header {
  margin-bottom: 20px;
}

.project-management__title {
  font-size: 24px;
  margin-bottom: 16px;
}

.project-management__search {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.project-management__toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
}

.project-management__content {
  position: relative;
  min-height: 200px;
}

.project-management__card-wrapper {
  margin-bottom: 20px;
}

.project-management__pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.project-management__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}
</style> 