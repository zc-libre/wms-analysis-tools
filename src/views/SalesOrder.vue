<script setup lang="ts">
import { reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, Document } from '@element-plus/icons-vue'

// Define props
const props = defineProps<{
  items: any[] | null,
  isLoading: boolean
}>()

// 搜索条件 (UI占位)
const searchForm = reactive({
  orderNumber: '',
  sku: '',
  // dateRange: [] // dateRange was not used in the template, removing for now
})

// 表格数据现在直接来自 props.items
// const tableData = ref<any[]>([])
// const loading = ref(false) // Replaced by props.isLoading
// const totalItems = ref(0) // Pagination logic needs rework if data is from props
// const currentPage = ref(1)
// const pageSize = ref(10)

// 计算属性，用于在模板中更方便地访问 items
const displayData = computed(() => props.items || [])

// 获取销售出库订单数据 - 此方法不再由此组件负责
/*
const fetchOrderData = async () => {
  // ... (logic removed) ...
}
*/

// 处理搜索 - 此方法需要调整或移除，搜索应通知父组件
const handleSearch = () => {
  // currentPage.value = 1;
  // fetchOrderData();
  ElMessage.info('搜索功能需要父组件配合实现，当前仅为UI占位。');
}

// 重置按钮在模板中没有了，对应函数也可以移除
/*
const handleReset = () => {
  searchForm.orderNumber = '';
  searchForm.sku = '';
  ElMessage.info('重置功能需要父组件配合实现，当前仅为UI占位。');
}
*/

// 新增订单 - 暂时保留，但可能也需要提升
const handleAddOrder = () => {
  ElMessage.info('触发新增销售出库订单操作 (UI占位)');
}

// 查看订单详情 - 暂时保留
const handleViewDetail = (row: any) => {
  ElMessage.info(`查看订单详情：${row.id} (UI占位)`);
}

// 处理分页变化 - 此方法需要调整或移除，分页应由父组件或store处理
const handlePageChange = (page: number) => {
  // currentPage.value = page;
  // fetchOrderData();
  ElMessage.info(`分页变化: ${page} (功能需父组件配合，UI占位)`);
}

// 页面加载时获取数据 - 不再需要
/*
onMounted(() => {
  // fetchOrderData();
})
*/
</script>

<template>
  <div class="view-container">
    <div class="action-bar">
      <el-form :inline="true" :model="searchForm" class="search-area">
        <el-form-item label="单据编号">
          <el-input 
            v-model="searchForm.orderNumber" 
            placeholder="请输入单据编号" 
            clearable 
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="SKU">
          <el-input 
            v-model="searchForm.sku" 
            placeholder="请输入SKU" 
            clearable 
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      
      <div class="operation-buttons">
        <el-button clearable type="success" :icon="Plus" @click="handleAddOrder">新增订单</el-button>
      </div>
    </div>

    <div class="table-container">
      <el-empty v-if="!props.isLoading && (!props.items || props.items.length === 0)" description="暂无销售出库订单数据" />
      <el-table v-else :data="displayData" v-loading="props.isLoading" stripe height="100%">
        <el-table-column prop="id" label="单据编号" sortable />
        <el-table-column prop="customer" label="客户" sortable />
        <el-table-column prop="amount" label="金额" sortable />
        <el-table-column prop="orderDate" label="单据时间" width="160" sortable />
        <el-table-column prop="sku" label="SKU" sortable />
        <el-table-column prop="orderType" label="单据类型" />
        <el-table-column prop="projectItem" label="单据项"  />
        <el-table-column prop="materialCode" label="物料编号" />
        <el-table-column prop="quantity" label="需求数量" sortable />
        <el-table-column label="操作" fixed="right" width="100">
          <template #default="scope">
            <el-button type="primary" size="small" link :icon="Document" @click="handleViewDetail(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="!props.isLoading && displayData.length > 0" class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next, jumper, ->, total"
        :total="displayData.length" 
        :page-size="10" 
        :current-page="1"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.view-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-direction: row;
  flex-shrink: 0; /* Prevent action bar from shrinking */
}

.search-area {
  flex: 1;
  min-width: 300px;
  display: flex; /* Align items in search area */
  gap: 10px; /* Add gap between search form items */
}

.operation-buttons {
  display: flex;
  gap: 0.5rem;
  /* margin-top: 0px; */ /* Removed as el-form-item might handle alignment */
}

.table-container {
  margin-bottom: 1rem;
  flex-grow: 1; /* Allow table to take available space */
  overflow: hidden; /* Prevent table from overflowing container */
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0; /* Prevent pagination from shrinking */
  padding-top: 1rem; /* Add some space above pagination */
}

// Utilities (can be removed if not used elsewhere or defined globally)
/*
.d-flex { display: flex; }
.justify-content-between { justify-content: space-between; }
.justify-content-end { justify-content: flex-end; }
.mb-3 { margin-bottom: 1rem; }
.mt-3 { margin-top: 1rem; }
*/
</style> 