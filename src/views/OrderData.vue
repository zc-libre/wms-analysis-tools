<script setup lang="ts">
import { ref } from 'vue'
import { Download, ArrowDown, Refresh, Document } from '@element-plus/icons-vue'

// 导入子视图组件
import SalesOrder from './SalesOrder.vue'
import MaterialData from './MaterialData.vue'
import InboundOrder from './InboundOrder.vue'
import InventoryRecord from './InventoryRecord.vue'

// 当前激活的 Tab
const activeTabName = ref('salesOrder')

// 刷新数据
const refreshData = () => {
  // 此处可根据实际需求实现刷新逻辑
  console.log(`正在刷新${activeTabName.value}数据`)
}
</script>

<template>
  <el-card shadow="hover" class="data-management-card">
    <template #header>
      <div class="card-header">
        <div class="title-container">
          <span class="title">订单数据管理</span>
        </div>
        <div class="header-actions">
          <el-dropdown size="small" class="export-dropdown">
            <el-button type="primary" plain size="small">
              <el-icon class="el-icon--left"><Download /></el-icon> 导出数据 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="Document">导出Excel</el-dropdown-item>
                <el-dropdown-item :icon="Document">导出CSV</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button :icon="Refresh" size="small" type="info" plain @click="refreshData">刷新</el-button>
        </div>
      </div>
    </template>

    <el-tabs v-model="activeTabName" class="data-tabs">
      <el-tab-pane label="销售出库订单" name="salesOrder">
        <SalesOrder />
      </el-tab-pane>
      <el-tab-pane label="物料主数据" name="materialData">
        <MaterialData />
      </el-tab-pane>
      <el-tab-pane label="入库单据" name="inboundOrder">
        <InboundOrder />
      </el-tab-pane>
      <el-tab-pane label="库存记录" name="inventoryRecord">
        <InventoryRecord />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style scoped lang="scss">
.data-management-card {
  border-radius: 8px;
  transition: all 0.3s;
  
  :deep(.el-card__body) {
    padding: 0;
  }
}

.card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.title-container {
  text-align: left;
  flex: 1;
}

.title {
  font-size: 16px;
  font-weight: 600;
  text-align: left;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
}

.export-dropdown {
  margin-right: 0;
}

.data-tabs {
  padding: 0 20px 20px;
  
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  :deep(.el-tabs__item) {
    font-size: 14px;
    padding: 0 20px;
    height: 40px;
    line-height: 40px;
    transition: all 0.3s;
    
    &.is-active {
      font-weight: 600;
    }
    
    &:hover {
      color: var(--el-color-primary);
    }
  }
  
  :deep(.el-tabs__active-bar) {
    height: 3px;
    border-radius: 3px;
  }
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .title-container {
    margin-bottom: 5px;
    width: 100%;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 