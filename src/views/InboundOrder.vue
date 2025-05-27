<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { InboundOrderItem } from '../stores/viewState'
import { useProjectStore } from '../stores/project'
import { useRouter } from 'vue-router'
import { useViewStateStore } from '../stores/viewState'

const projectStore = useProjectStore()
const router = useRouter()
const viewStateStore = useViewStateStore()

const searchForm = reactive({
  orderNumber: '',
  // dateRange: [] // dateRange was not used in the template, removing for now
})
const displayData = computed(() => (viewStateStore.activeOrderData as InboundOrderItem[]) || [])
const isLoading = computed(() => viewStateStore.isLoading)
const currentPage = computed(() => viewStateStore.currentPage)
const pageSize = computed(() => viewStateStore.pageSize)
const totalItems = computed(() => viewStateStore.totalItems)

// Removed: pageTitle, searchForm, statusOptions, columns, tableData, loading, total, currentPage, pageSize, 
// fetchInboundOrderData, handleSearch, handleReset, handleCurrentChange, handleSizeChange, 
// handleEdit, handleAddInbound, handleExport, onMounted call.
// 处理搜索 - 此方法需要调整或移除，搜索应通知父组件
const handleSearch = () => {
  // currentPage.value = 1;
  // fetchOrderData();
  ElMessage.info('搜索功能需要父组件配合实现，当前仅为UI占位。');
}
const handleAddInboundOrder = () => {
  const projectId = 0; // 占位项目ID
  const projectName = '入库单据项目'; // 占位项目名称

  projectStore.setCurrentProject(projectId, projectName);
  projectStore.setFileType('入库单据');

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
//   ElMessage.info(`查看入库单据详情：${row.orderNumber || row.id} (UI占位)`)
// }
const handleEdit = (row: InboundOrderItem) => {
  ElMessage.info(`编辑入库单据：${row.orderNumber} (UI占位)`)
}

const handleDelete = (row: InboundOrderItem) => {
  ElMessage.info(`删除入库单据：${row.orderNumber} (UI占位)`)
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
        <el-form-item label="单据编号">
          <el-input v-model="searchForm.orderNumber" placeholder="请输入单据编号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>

      <div class="operation-buttons">
        <el-button clearable type="success" :icon="Plus" @click="handleAddInboundOrder">新增入库单据</el-button>
      </div>
    </div>
    <div class="table-container">
      <el-empty v-if="!isLoading && (!displayData || displayData.length === 0)" description="暂无入库单据数据" />
      <el-table v-else :data="displayData" v-loading="isLoading" stripe height="100%">
        <el-table-column prop="orderNumber" label="入库单号" sortable width="160" />
        <el-table-column prop="relatedOrder" label="关联单号" width="160" />
        <el-table-column prop="orderType" label="单据类型" width="120" />
        <el-table-column prop="supplierName" label="供应商" width="180" />
        <el-table-column prop="orderDate" label="单据日期" sortable width="120" />
        <el-table-column prop="plannedDate" label="计划入库日期" sortable width="140" />
        <el-table-column prop="actualDate" label="实际入库日期" sortable width="140" />
        <el-table-column prop="totalAmount" label="总金额" sortable width="120" />
        <el-table-column prop="itemCount" label="物料种类" width="100" />
        <el-table-column prop="warehouseName" label="入库仓库" width="120" />
        <el-table-column prop="status" label="状态" sortable width="100" />
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
  height: 370px;
  // flex-grow: 1;
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