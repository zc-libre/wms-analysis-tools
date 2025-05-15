<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  items: any[] | null,
  isLoading: boolean
}>()

const displayData = computed(() => props.items || [])

// Removed: pageTitle, searchForm, statusOptions, columns, tableData, loading, total, currentPage, pageSize, 
// fetchInboundOrderData, handleSearch, handleReset, handleCurrentChange, handleSizeChange, 
// handleEdit, handleAddInbound, handleExport, onMounted call.

const handleViewDetail = (row: any) => {
  ElMessage.info(`查看入库单据详情：${row.orderNumber || row.id} (UI占位)`)
}
</script>

<template>
  <div class="view-container">
    <!-- Search and action bars are removed as data/actions are now handled by parent/store -->
    <div class="table-container">
      <el-empty v-if="!props.isLoading && (!props.items || props.items.length === 0)" description="暂无入库单据数据" />
      <el-table v-else :data="displayData" v-loading="props.isLoading" stripe height="100%">
        <el-table-column prop="orderNumber" label="入库单号" sortable width="160"/>
        <el-table-column prop="relatedOrder" label="关联单号" width="160"/>
        <el-table-column prop="orderType" label="单据类型" width="120"/>
        <el-table-column prop="supplierName" label="供应商" width="180"/>
        <el-table-column prop="orderDate" label="单据日期" sortable width="120"/>
        <el-table-column prop="plannedDate" label="计划入库日期" sortable width="140"/>
        <el-table-column prop="actualDate" label="实际入库日期" sortable width="140"/>
        <el-table-column prop="totalAmount" label="总金额" sortable width="120"/>
        <el-table-column prop="itemCount" label="物料种类" width="100"/>
        <el-table-column prop="warehouseName" label="入库仓库" width="120"/>
        <el-table-column prop="status" label="状态" sortable width="100"/>
        <el-table-column label="操作" fixed="right" width="100">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handleViewDetail(scope.row)">
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
        @current-change="(page: number) => ElMessage.info(`分页变化: ${page} (UI占位)`)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.view-container { height: 100%; display: flex; flex-direction: column; }
.table-container { flex-grow: 1; overflow: hidden; margin-bottom: 1rem; }
.pagination-container { display: flex; justify-content: flex-end; flex-shrink: 0; padding-top: 1rem; }
</style> 