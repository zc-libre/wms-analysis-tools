<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { Download, ArrowDown, Refresh, Document, Sell, Goods, Box, Files } from '@element-plus/icons-vue'
import { useViewStateStore } from '@/stores/viewState'
import { storeToRefs } from 'pinia'
// 导入具体类型 - 确保这些名称与 viewState.ts 中导出的名称完全一致
import type { SalesOrderItem, MaterialDataItem, InboundOrderItem, InventoryRecordItem } from '@/stores/viewState'

// 导入子视图组件
import SalesOrder from './SalesOrder.vue'
import MaterialData from './MaterialData.vue'
import InboundOrder from './InboundOrder.vue'
import InventoryRecord from './InventoryRecord.vue'

// 当前激活的 Tab - 改为从 store 控制
const viewStateStore = useViewStateStore()
const { activeOrderDataType, activeOrderData, isLoading } = storeToRefs(viewStateStore)

// 计算属性，用于为每个子组件提供正确类型的数据
const salesOrderItemsFiltered = computed((): SalesOrderItem[] | null => {
  if (activeOrderDataType.value === 'salesOrder' && activeOrderData.value) {
    return activeOrderData.value as SalesOrderItem[]
  }
  return null
})

const materialDataItemsFiltered = computed((): MaterialDataItem[] | null => {
  if (activeOrderDataType.value === 'materialData' && activeOrderData.value) {
    return activeOrderData.value as MaterialDataItem[]
  }
  return null
})

const inboundOrderItemsFiltered = computed((): InboundOrderItem[] | null => {
  if (activeOrderDataType.value === 'inboundOrder' && activeOrderData.value) {
    return activeOrderData.value as InboundOrderItem[]
  }
  return null
})

const inventoryRecordItemsFiltered = computed((): InventoryRecordItem[] | null => {
  if (activeOrderDataType.value === 'inventoryRecord' && activeOrderData.value) {
    return activeOrderData.value as InventoryRecordItem[]
  }
  return null
})

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
        <template v-if="activeOrderDataType === 'salesOrder' || !activeOrderDataType">
          <SalesOrder :items="salesOrderItemsFiltered" :is-loading="isLoading && activeOrderDataType === 'salesOrder'" />
        </template>
        <template v-else-if="activeOrderDataType && activeOrderDataType !== 'salesOrder'">
          <div class="tab-pane-placeholder">
            <el-icon class="empty-icon empty-icon--sales"><Sell /></el-icon>
            <p>当前暂无销售出库订单数据</p>
          </div>
        </template>
      </el-tab-pane>
      <el-tab-pane label="物料主数据" name="materialData">
        <template v-if="activeOrderDataType === 'materialData' || !activeOrderDataType">
          <MaterialData :items="materialDataItemsFiltered" :is-loading="isLoading && activeOrderDataType === 'materialData'" />
        </template>
        <template v-else-if="activeOrderDataType && activeOrderDataType !== 'materialData'">
          <div class="tab-pane-placeholder">
            <el-icon class="empty-icon empty-icon--material"><Goods /></el-icon>
            <p>当前暂无物料主数据数据</p>
          </div>
        </template>
      </el-tab-pane>
      <el-tab-pane label="入库单据" name="inboundOrder">
        <template v-if="activeOrderDataType === 'inboundOrder' || !activeOrderDataType">
          <InboundOrder :items="inboundOrderItemsFiltered" :is-loading="isLoading && activeOrderDataType === 'inboundOrder'" />
        </template>
        <template v-else-if="activeOrderDataType && activeOrderDataType !== 'inboundOrder'">
          <div class="tab-pane-placeholder">
            <el-icon class="empty-icon empty-icon--inbound"><Box /></el-icon>
            <p>当前暂无入库单据数据</p>
          </div>
        </template>
      </el-tab-pane>
      <el-tab-pane label="库存记录" name="inventoryRecord">
        <template v-if="activeOrderDataType === 'inventoryRecord' || !activeOrderDataType">
          <InventoryRecord :items="inventoryRecordItemsFiltered" :is-loading="isLoading && activeOrderDataType === 'inventoryRecord'" />
        </template>
        <template v-else-if="activeOrderDataType && activeOrderDataType !== 'inventoryRecord'">
          <div class="tab-pane-placeholder">
            <el-icon class="empty-icon empty-icon--inventory"><Files /></el-icon>
            <p>当前暂无库存记录数据</p>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.data-management-card {
  border-radius: $border-radius-large;
  transition: all $transition-normal;
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
  font-size: $font-size-medium;
  font-weight: $font-weight-semi-bold;
  text-align: left;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: $spacing-small;
  justify-content: flex-end;
}

.export-dropdown {
  margin-right: 0;
}

.data-tabs {
  padding: 0 $spacing-large $spacing-large;
  height: 100%;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: $border-radius-base;
  
  .el-tab-pane {
    height: 100%;
  }
  
  :deep(.el-tabs__header) {
    margin-bottom: $spacing-large;
    border-bottom: 1px solid $color-border-lighter;
    background: rgba(255, 255, 255, 0.8);
    border-radius: $border-radius-base $border-radius-base 0 0;
    // padding: $spacing-small 0;
    backdrop-filter: blur(10px);
  }

  :deep(.el-tabs__nav-wrap) {
    &::after {
      display: none;
    }
  }
  :deep(.el-tabs__nav) {
    height: 50px;
    align-items: center;
  }
  :deep( .el-tabs__item:nth-child(2)) {
    padding-left: 24px;
  }
  :deep( .el-tabs__item:last-child) {
    padding-right: 24px;
  }
  :deep(.el-tabs__item) {
    font-size: $font-size-base;
     padding: $spacing-small $spacing-large;
    height: 40px;
    line-height: 28px;
    margin-left: $spacing-small;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
    border: 1px solid rgba(220, 223, 230, 0.6);
    border-radius: $border-radius-large;
    color: $color-text-regular;
    font-weight: $font-weight-medium;
    transition: all $transition-normal cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    box-shadow: 
      0 1px 3px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    
    &:hover {
      background: linear-gradient(145deg, rgba(64, 158, 255, 0.12) 0%, rgba(255, 255, 255, 0.95) 100%);
      border-color: rgba(64, 158, 255, 0.4);
      color: darken($color-primary, 8%);
      transform: translateY(-2px) scale(1.02);
      box-shadow: 
        0 6px 20px rgba(64, 158, 255, 0.2),
        0 2px 8px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }
    
    &.is-active {
      background: linear-gradient(145deg, $color-primary 0%, lighten($color-primary, 12%) 50%, darken($color-primary, 2%) 100%);
      border-color: darken($color-primary, 5%);
      color: $color-bg-white;
      font-weight: $font-weight-semi-bold;
      transform: translateY(-3px) scale(1.05);
      box-shadow: 
        0 8px 25px rgba(64, 158, 255, 0.35),
        0 4px 12px rgba(64, 158, 255, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1);
      z-index: 2;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%);
        border-radius: inherit;
        pointer-events: none;
      }
      
      // &::after {
      //   content: '';
      //   position: absolute;
      //   bottom: -6px;
      //   left: 50%;
      //   transform: translateX(-50%);
      //   width: 6px;
      //   height: 6px;
      //   background: linear-gradient(135deg, $color-primary 0%, lighten($color-primary, 10%) 100%);
      //   border-radius: 50%;
      //   box-shadow: 0 2px 6px rgba(64, 158, 255, 0.4);
      // }
    }
  }
  
  :deep(.el-tabs__active-bar) {
    height: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    transition: none;
    bottom: 0;
  }
}

.tab-pane-placeholder {
  padding: $spacing-large;
  text-align: center;
  color: $color-text-placeholder;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: $font-size-base;
  
  .empty-icon {
    font-size: 60px;
    margin-bottom: $spacing-large;
    color: rgba(64, 158, 255, 0.3);
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.2) 0%, rgba(100, 180, 255, 0.1) 100%);
    padding: $spacing-large;
    border-radius: 50%;
    box-shadow: 
      0 4px 12px rgba(64, 158, 255, 0.1),
      inset 0 2px 4px rgba(255, 255, 255, 0.6);
    animation: pulse 3s infinite ease-in-out;
    transition: all $transition-normal;
    position: relative;
    
    &--sales {
      color: rgba(103, 194, 58, 0.4);
      background: linear-gradient(135deg, rgba(103, 194, 58, 0.2) 0%, rgba(145, 213, 112, 0.1) 100%);
      box-shadow: 
        0 4px 12px rgba(103, 194, 58, 0.1),
        inset 0 2px 4px rgba(255, 255, 255, 0.6);
    }
    
    &--material {
      color: rgba(230, 162, 60, 0.4);
      background: linear-gradient(135deg, rgba(230, 162, 60, 0.2) 0%, rgba(241, 196, 115, 0.1) 100%);
      box-shadow: 
        0 4px 12px rgba(230, 162, 60, 0.1),
        inset 0 2px 4px rgba(255, 255, 255, 0.6);
    }
    
    &--inbound {
      color: rgba(144, 147, 153, 0.4);
      background: linear-gradient(135deg, rgba(144, 147, 153, 0.2) 0%, rgba(184, 187, 193, 0.1) 100%);
      box-shadow: 
        0 4px 12px rgba(144, 147, 153, 0.1),
        inset 0 2px 4px rgba(255, 255, 255, 0.6);
    }
    
    &--inventory {
      color: rgba(245, 108, 108, 0.4);
      background: linear-gradient(135deg, rgba(245, 108, 108, 0.2) 0%, rgba(250, 154, 154, 0.1) 100%);
      box-shadow: 
        0 4px 12px rgba(245, 108, 108, 0.1),
        inset 0 2px 4px rgba(255, 255, 255, 0.6);
    }
    
    &:hover {
      transform: scale(1.1) translateY(-5px);
      box-shadow: 
        0 8px 20px rgba(64, 158, 255, 0.2),
        inset 0 2px 6px rgba(255, 255, 255, 0.8);
    }
    
    &--sales:hover {
      box-shadow: 
        0 8px 20px rgba(103, 194, 58, 0.2),
        inset 0 2px 6px rgba(255, 255, 255, 0.8);
    }
    
    &--material:hover {
      box-shadow: 
        0 8px 20px rgba(230, 162, 60, 0.2),
        inset 0 2px 6px rgba(255, 255, 255, 0.8);
    }
    
    &--inbound:hover {
      box-shadow: 
        0 8px 20px rgba(144, 147, 153, 0.2),
        inset 0 2px 6px rgba(255, 255, 255, 0.8);
    }
    
    &--inventory:hover {
      box-shadow: 
        0 8px 20px rgba(245, 108, 108, 0.2),
        inset 0 2px 6px rgba(255, 255, 255, 0.8);
    }
  }
  
  p {
    font-size: $font-size-medium;
    color: $color-text-secondary;
    margin-top: $spacing-small;
    opacity: 0.8;
    max-width: 240px;
    line-height: 1.5;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.6);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.8);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.6);
  }
}

@media (max-width: $breakpoint-sm) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-small;
  }
  
  .title-container {
    margin-bottom: $spacing-extra-small;
    width: 100%;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .data-tabs {
    padding: 0 $spacing-base $spacing-base;
    
    :deep(.el-tabs__item) {
      font-size: $font-size-small;
      // padding: $spacing-extra-small $spacing-base;
      height: 38px;
      line-height: 24px;
      margin-right: $spacing-extra-small;
    }
  }
  
  .tab-pane-placeholder {
    .empty-icon {
      font-size: 48px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    p {
      font-size: $font-size-base;
      max-width: 200px;
    }
  }
}
</style> 