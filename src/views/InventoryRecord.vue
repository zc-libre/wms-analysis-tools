<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useProjectStore } from '../stores/project'
import { useRouter } from 'vue-router'
import { useViewStateStore } from '../stores/viewState'

interface InventoryItem {
  id: number | string;
  sku: string;
  materialName: string;
  warehouse: string;
  containerId: string;
  quantity: number;
  lastUpdate: string;
}

const projectStore = useProjectStore()
const router = useRouter()
const viewStateStore = useViewStateStore()

const searchForm = reactive({
  code: '',
  // dateRange: [] // dateRange was not used in the template, removing for now
})
const displayData = computed(() => (viewStateStore.activeOrderData as InventoryItem[]) || [])
const isLoading = computed(() => viewStateStore.isLoading)
const currentPage = computed(() => viewStateStore.currentPage)
const pageSize = computed(() => viewStateStore.pageSize)
const totalItems = computed(() => viewStateStore.totalItems)

const handleSearch = () => {
  // currentPage.value = 1;
  // fetchOrderData();
  ElMessage.info('搜索功能需要父组件配合实现，当前仅为UI占位。');
}
const handleAddInventoryRecord = () => {
  const projectId = 0; // 占位项目ID
  const projectName = '库存记录项目'; // 占位项目名称

  projectStore.setCurrentProject(projectId, projectName);
  projectStore.setFileType('库存记录');

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
//   ElMessage.info(`查看库存记录详情：${row.id} (UI占位)`)
// }
const handleEdit = (row: InventoryItem) => {
  ElMessage.info(`编辑库存记录：${row.id} (UI占位)`)
}

const handleDelete = (row: InventoryItem) => {
  ElMessage.info(`删除库存记录：${row.id} (UI占位)`)
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
        <el-form-item label="">
          <el-input v-model="searchForm.code" placeholder="请输入库存记录号/SKU/容器号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>

      <div class="operation-buttons">
        <el-button clearable type="success" :icon="Plus" @click="handleAddInventoryRecord">新增库存记录</el-button>
      </div>
    </div>
    <div class="table-container">
      <el-empty v-if="!isLoading && (!displayData || displayData.length === 0)" description="暂无库存记录数据" />
      <el-table v-else :data="displayData" v-loading="isLoading" stripe height="100%">
        <el-table-column prop="id" label="记录ID" sortable />
        <el-table-column prop="sku" label="SKU" sortable />
        <el-table-column prop="materialName" label="物料名称" sortable />
        <el-table-column prop="warehouse" label="仓库" />
        <el-table-column prop="containerId" label="容器ID" />
        <el-table-column prop="quantity" label="数量" sortable />
        <el-table-column prop="lastUpdate" label="最后更新" sortable />
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="scope">
            <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
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
</style>