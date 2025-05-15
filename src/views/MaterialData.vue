<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  items: any[] | null,
  isLoading: boolean
}>()

const displayData = computed(() => props.items || [])

const handleViewDetail = (row: any) => {
  ElMessage.info(`查看物料详情：${row.materialCode || row.id} (UI占位)`)
}
</script>

<template>
  <div class="view-container">
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