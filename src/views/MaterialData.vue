<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useProjectStore } from '../stores/project'
import { useViewStateStore } from '../stores/viewState'

interface MaterialItem {
  id?: number | string;
  materialCode: string;
  materialName: string;
  specification: string;
  category: string;
  unit: string;
  price: number;
  inventory: number;
}

const router = useRouter()
const projectStore = useProjectStore()
const viewStateStore = useViewStateStore()

// 搜索条件 (UI占位)
const searchForm = reactive({
  sku: '',
  // dateRange: [] // dateRange was not used in the template, removing for now
})
// 处理搜索 - 此方法需要调整或移除，搜索应通知父组件
const handleSearch = () => {
  // currentPage.value = 1;
  // fetchOrderData();
  ElMessage.info('搜索功能需要父组件配合实现，当前仅为UI占位。');
}
const displayData = computed(() => (viewStateStore.activeOrderData as MaterialItem[]) || [])
const isLoading = computed(() => viewStateStore.isLoading)
const currentPage = computed(() => viewStateStore.currentPage)
const pageSize = computed(() => viewStateStore.pageSize)
const totalItems = computed(() => viewStateStore.totalItems)

// 新增订单 - 暂时保留，但可能也需要提升
const handleAddMaterialData = () => {
  const projectId = 0; // 占位项目ID
  const projectName = '物料主数据项目'; // 占位项目名称

  projectStore.setCurrentProject(projectId, projectName);
  projectStore.setFileType('物料主数据');

  // 根据 Sidebar.vue 的逻辑，也设置 sessionStorage
  sessionStorage.setItem('currentProject', JSON.stringify({
    id: projectId,
    name: projectName,
    company: '', // 根据需要填写或留空
    location: '' // 根据需要填写或留空
  }));

  router.push({ name: 'FileImport' });
}
// const handleViewDetail = (row: any) => {
//   ElMessage.info(`查看物料详情：${row.materialCode || row.id} (UI占位)`)
// }

const handleEdit = (row: MaterialItem) => {
  ElMessage.info(`编辑物料：${row.materialCode || row.id} (UI占位)`)
}

const handleDelete = (row: MaterialItem) => {
  ElMessage.info(`删除物料：${row.materialCode || row.id} (UI占位)`)
}

const handlePageChange = (newPage: number) => {
  viewStateStore.setCurrentPage(newPage);
}

const handleSizeChange = (newPageSize: number) => {
  viewStateStore.setPageSize(newPageSize);
}
</script>

<template>
  <div class="view-container">
    <div class="action-bar" v-if="displayData.length > 0">
      <el-form :inline="true" :model="searchForm" class="search-area">
        <el-form-item label="物料编码">
          <el-input v-model="searchForm.sku" placeholder="请输入物料编码" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>

      <div class="operation-buttons">
        <el-button clearable type="success" :icon="Plus" @click="handleAddMaterialData">新增物料主数据</el-button>
      </div>
    </div>
    <div class="table-container">
      <el-empty v-if="!isLoading && (!displayData || displayData.length === 0)" description="暂无物料主数据" />
      <el-table v-else :data="displayData" v-loading="isLoading" stripe height="100%">
        <el-table-column prop="materialCode" label="物料编码" sortable />
        <el-table-column prop="materialName" label="物料名称" sortable />
        <el-table-column prop="specification" label="规格型号" />
        <el-table-column prop="category" label="类别" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="price" label="单价" sortable />
        <el-table-column prop="inventory" label="库存数量" sortable />
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="scope">
            <!-- <el-button type="primary" size="small" link @click="handleViewDetail(scope.row)"> -->
            <!-- 查看详情 -->
            <!-- </el-button> -->
            <el-button 
              type="primary" 
              size="small" 
              :icon="Edit" 
              link
              class="table-operation__button table-operation__button--edit" 
              @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              type="danger" 
              size="small" 
              :icon="Delete" 
              link
              class="table-operation__button table-operation__button--delete" 
              @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-if="!isLoading && displayData.length > 0" class="pagination-container">
      <el-pagination 
        background 
        layout="sizes, prev, pager, next, jumper, ->, total" 
        :total="totalItems"
        :page-size="pageSize" 
        :page-sizes="[50, 100, 200, 500, 1000]"
        :current-page="currentPage" 
        @current-change="handlePageChange"
        @size-change="handleSizeChange" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-direction: row;
  flex-shrink: 0;
  /* Prevent action bar from shrinking */
}

.view-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-container {
  // flex-grow: 1;
  height: 370px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  /* padding-top: 1rem; */
}

.table-operation {
  &__button {
    margin: 0 $spacing-extra-small;
    font-weight: $font-weight-medium;
    
    &--edit {
      color: $color-primary;
      &:hover {
        color: lighten($color-primary, 10%);
      }
    }
    
    &--delete {
      color: $color-danger;
      &:hover {
        color: lighten($color-danger, 10%);
      }
    }
  }
}
</style>