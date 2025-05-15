<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Download, ArrowDown, Refresh, Document } from '@element-plus/icons-vue'
import { useViewStateStore } from '@/stores/viewState'
import { storeToRefs } from 'pinia'

// 导入子视图组件
import SalesOrder from './SalesOrder.vue'
import MaterialData from './MaterialData.vue'
import InboundOrder from './InboundOrder.vue'
import InventoryRecord from './InventoryRecord.vue'

// 当前激活的 Tab - 改为从 store 控制
const viewStateStore = useViewStateStore()
const { activeOrderDataType, activeOrderData, isLoading } = storeToRefs(viewStateStore)

// 将 activeTabName 直接绑定到 activeOrderDataType
// 这确保了每次 activeOrderDataType 变化时，activeTabName 会同步更新
const activeTabName = ref(activeOrderDataType.value || 'salesOrder')

// 监听 activeOrderDataType 变化 - 使用 immediate: true 确保初始化时也会执行
watch(activeOrderDataType, (newType) => {
  if (newType) {
    // 立即更新标签页，确保与数据类型匹配
    activeTabName.value = newType
    console.log(`标签页已切换到: ${newType}`)
  } else {
    // 如果没有特定文件上下文，重置到默认tab
    activeTabName.value = 'salesOrder'
  }
}, { immediate: true, deep: true })

// 在组件挂载时，如果没有激活的订单数据类型，则自动加载第一个项目的第一个文件数据
onMounted(async () => {
  if (!viewStateStore.activeOrderDataType) {
    // 设置第一个标签页为默认类型
    const defaultType = 'salesOrder'
    
    // 加载第一个项目的第一个文件数据
    try {
      const loaded = await viewStateStore.loadFirstProjectFirstFile(defaultType)
      if (!loaded) {
        console.log('未能加载初始数据，可能没有默认项目或文件')
      }
    } catch (error) {
      console.error('加载初始数据失败:', error)
    }
  }
})

// 刷新数据
const refreshData = () => {
  if (viewStateStore.activeOrderDataType) {
      viewStateStore.fetchActiveOrderData()
  } else {
      // 如果没有明确的 activeOrderDataType，尝试使用当前标签页类型
      if(activeTabName.value) {
          viewStateStore.fetchActiveOrderData()
          console.log(`尝试刷新当前激活数据类型: ${viewStateStore.activeOrderDataType || '未指定'}`)
      }
  }
}
</script>

<template>
  <el-card shadow="hover" class="data-management-card">
    <template #header>
      <div class="card-header">
        <div class="title-container">
          <span class="title">订单数据管理</span>
          <el-tag v-if="viewStateStore.activeOrderDataFileName" type="info" size="small" style="margin-left: 10px;">
            当前文件: {{ viewStateStore.activeOrderDataFileName }}
          </el-tag>
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
          <el-button :icon="Refresh" size="small" type="info" plain @click="refreshData" :loading="isLoading">刷新</el-button>
        </div>
      </div>
    </template>

    <el-tabs v-model="activeTabName" class="data-tabs">
      <el-tab-pane label="销售出库订单" name="salesOrder">
        <SalesOrder :items="activeOrderDataType === 'salesOrder' ? activeOrderData : null" :is-loading="isLoading && activeOrderDataType === 'salesOrder'" />
      </el-tab-pane>
      <el-tab-pane label="物料主数据" name="materialData">
        <MaterialData :items="activeOrderDataType === 'materialData' ? activeOrderData : null" :is-loading="isLoading && activeOrderDataType === 'materialData'" />
      </el-tab-pane>
      <el-tab-pane label="入库单据" name="inboundOrder">
        <InboundOrder :items="activeOrderDataType === 'inboundOrder' ? activeOrderData : null" :is-loading="isLoading && activeOrderDataType === 'inboundOrder'" />
      </el-tab-pane>
      <el-tab-pane label="库存记录" name="inventoryRecord">
        <InventoryRecord :items="activeOrderDataType === 'inventoryRecord' ? activeOrderData : null" :is-loading="isLoading && activeOrderDataType === 'inventoryRecord'" />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style scoped lang="scss">
.data-management-card {
  border-radius: 8px;
  transition: all 0.3s;
  height: 100%;
  
  :deep(.el-card__body) {
    padding: 0;
    height: calc(100% - 60px);
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
  height: 100%;
  
  .el-tab-pane {
    height: 100%;
  }
  
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