<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
const props = defineProps<{
  items: any[] | null,
  isLoading: boolean
}>()

const searchForm = reactive({
  code: '',
  // dateRange: [] // dateRange was not used in the template, removing for now
})
const displayData = computed(() => props.items || [])
const handleSearch = () => {
  // currentPage.value = 1;
  // fetchOrderData();
  ElMessage.info('搜索功能需要父组件配合实现，当前仅为UI占位。');
}
const handleAddInventoryRecord = () => {
  ElMessage.info('触发新增库存记录操作 (UI占位)');
}
const handleViewDetail = (row: any) => {
  ElMessage.info(`查看库存记录详情：${row.id} (UI占位)`)
}
</script>

<template>
  <div class="view-container">
    <div class="action-bar" v-if="displayData.length > 0">
      <el-form :inline="true" :model="searchForm" class="search-area">
        <el-form-item label="">
          <el-input 
            v-model="searchForm.code" 
            placeholder="请输入库存记录号/SKU/容器号" 
            clearable 
            @keyup.enter="handleSearch"
          />
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
      <el-empty v-if="!props.isLoading && (!props.items || props.items.length === 0)" description="暂无库存记录数据" />
      <el-table v-else :data="displayData" v-loading="props.isLoading" stripe height="100%">
        <el-table-column prop="id" label="记录ID" sortable />
        <el-table-column prop="sku" label="SKU" sortable />
        <el-table-column prop="materialName" label="物料名称" sortable />
        <el-table-column prop="warehouse" label="仓库" />
        <el-table-column prop="containerId" label="容器ID" />
        <el-table-column prop="quantity" label="数量" sortable />
        <el-table-column prop="lastUpdate" label="最后更新" sortable />
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
</style> 