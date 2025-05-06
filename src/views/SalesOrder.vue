<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, View, Document } from '@element-plus/icons-vue'

// 搜索条件
const searchForm = reactive({
  orderNumber: '',
  sku: '',
  dateRange: []
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)
const totalItems = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 获取销售出库订单数据
const fetchOrderData = async () => {
  loading.value = true
  
  try {
    // 实际项目中，这里应该调用API接口获取数据
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据 - 实际项目应通过API获取
    const mockData = Array.from({ length: 9 }, (_, index) => ({
      id: `12345678${index + 1}`,
      sku: ['CC_BB_AA', 'DD_EE_FF', 'GG_HH_II'][index % 3],
      orderType: '销售出库',
      projectItem: `项目${Math.floor(index / 3) + 1}`,
      orderDate: `2025-03-${25 - index} ${(15 - index % 7) % 12 + 9}:${10 + index * 5}:40`,
      materialCode: `345678${9 - index % 3}`,
      quantity: 678 - index * 50 + (index % 3 === 2 ? 0.75 : (index % 3 === 1 ? 0.5 : 0))
    }))

    // 模拟基于搜索条件的过滤
    const filteredData = mockData.filter(item => {
      const matchOrderNumber = !searchForm.orderNumber || item.id.includes(searchForm.orderNumber);
      const matchSku = !searchForm.sku || item.sku.includes(searchForm.sku);
      
      // 日期范围过滤
      let matchDate = true;
      if (searchForm.dateRange && searchForm.dateRange.length === 2) {
        const orderDate = new Date(item.orderDate);
        const startDate = new Date(searchForm.dateRange[0]);
        const endDate = new Date(searchForm.dateRange[1]);
        matchDate = orderDate >= startDate && orderDate <= endDate;
      }
      
      return matchOrderNumber && matchSku && matchDate;
    });

    totalItems.value = filteredData.length;

    // 模拟分页
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    tableData.value = filteredData.slice(startIndex, endIndex);
  } catch (error) {
    ElMessage.error('获取销售出库订单失败');
  } finally {
    loading.value = false;
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchOrderData();
}

// 重置搜索
const handleReset = () => {
  searchForm.orderNumber = '';
  searchForm.sku = '';
  searchForm.dateRange = [];
  currentPage.value = 1;
  fetchOrderData();
}

// 新增订单
const handleAddOrder = () => {
  ElMessage.info('触发新增销售出库订单操作');
}

// 查看订单详情
const handleViewDetail = (row: any) => {
  ElMessage.info(`查看订单详情：${row.id}`);
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchOrderData();
}

// 页面加载时获取数据
onMounted(() => {
  fetchOrderData();
})
</script>

<template>
  <div class="view-container">
    <!-- 搜索与操作区域 -->
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
        
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      
      <div class="operation-buttons">
        <el-button clearable type="success" :icon="Plus" @click="handleAddOrder">新增订单</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" stripe height="100%">
        <el-table-column prop="id" label="单据编号"  sortable />
        <el-table-column prop="sku" label="SKU"  sortable />
        <el-table-column prop="orderType" label="单据类型" />
        <el-table-column prop="projectItem" label="单据项"  />
        <el-table-column prop="orderDate" label="单据时间" width="160" sortable />
        <el-table-column prop="materialCode" label="物料编号" />
        <el-table-column prop="quantity" label="需求数量"  sortable />
        <el-table-column label="操作"  fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link :icon="Document" @click="handleViewDetail(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页区域 -->
    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalItems"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.view-container {
  height: 100%;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-direction: row;
}

.search-area {
  flex: 1;
  min-width: 300px;
}

.operation-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 0px;
}

.table-container {
  margin-bottom: 1rem;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}

// Utilities
.d-flex { display: flex; }
.justify-content-between { justify-content: space-between; }
.justify-content-end { justify-content: flex-end; }
.mb-3 { margin-bottom: 1rem; }
.mt-3 { margin-top: 1rem; }
</style> 