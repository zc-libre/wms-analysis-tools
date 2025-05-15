<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

const props = defineProps<{
  items: any[] | null,
  isLoading: boolean
}>()
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
const displayData = computed(() => props.items || [])
// 新增订单 - 暂时保留，但可能也需要提升
const handleAddMaterialData = () => {
  ElMessage.info('触发新增物料主数据操作 (UI占位)');
}
const handleViewDetail = (row: any) => {
  ElMessage.info(`查看物料详情：${row.materialCode || row.id} (UI占位)`)
}
</script>

<template>
  <div class="view-container">
    <div class="action-bar" v-if="displayData.length > 0">
      <el-form :inline="true" :model="searchForm" class="search-area">
        <el-form-item label="物料编码">
          <el-input 
            v-model="searchForm.sku" 
            placeholder="请输入物料编码" 
            clearable 
            @keyup.enter="handleSearch"
          />
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
      <el-empty v-if="!props.isLoading && (!props.items || props.items.length === 0)" description="暂无物料主数据" />
      <el-table v-else :data="displayData" v-loading="props.isLoading" stripe height="100%">
        <el-table-column prop="materialCode" label="物料编码" sortable />
        <el-table-column prop="materialName" label="物料名称" sortable />
        <el-table-column prop="specification" label="规格型号" />
        <el-table-column prop="category" label="类别" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="price" label="单价" sortable />
        <el-table-column prop="inventory" label="库存数量" sortable />
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
.view-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.table-container {
  flex-grow: 1;
  overflow: hidden;
  margin-bottom: 1rem;
}
.pagination-container {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  padding-top: 1rem;
}
</style> 