<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, Document, Printer } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../stores/project'

// 定义材料信息接口
interface MaterialInfo {
  property: string;
  value: string;
}

interface InfoItem {
  label: string;
  value: string | number | null;
}

// 新增：定义订单项目接口
interface OrderItem {
  id: string | number;
  customer: string;
  amount: number;
  orderDate: string;
  sku: string;
  orderType: string;
  projectItem: string;
  materialCode: string;
  quantity: number;
  // 根据实际情况，您可能需要添加更多属性或调整现有属性的类型
}

// Define props
const props = defineProps<{
  items: OrderItem[] | null,
  isLoading: boolean
}>()

// 搜索条件 (UI占位)
const searchForm = reactive({
  orderNumber: '',
  sku: '',
  // dateRange: [] // dateRange was not used in the template, removing for now
})

const router = useRouter()
const projectStore = useProjectStore()

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

// 新增订单 - 暂时保留，但可能也需要提升
const handleAddOrder = () => {
  const projectId = 0; // 占位项目ID
  const projectName = '销售订单项目'; // 占位项目名称

  projectStore.setCurrentProject(projectId, projectName);
  projectStore.setFileType('销售出库订单');

  // 根据 Sidebar.vue 的逻辑，也设置 sessionStorage
  sessionStorage.setItem('currentProject', JSON.stringify({
    id: projectId,
    name: projectName,
    company: '', // 根据需要填写或留空
    location: '' // 根据需要填写或留空
  }));

  router.push({ name: 'FileImport' });
}

// 查看订单详情 - 暂时保留
const handleViewDetail = async (row: OrderItem) => {
  try {
    // 显示加载状态
    ElMessage.info(`正在获取订单 ${row.id} 的详情...`);
    
    // 调用模拟API获取详情
    const detail = await fetchOrderDetail(row.id);
    
    // 更新详情数据并显示弹窗
    orderDetail.value = detail;
    detailDialogVisible.value = true;
  } catch (error) {
    console.error('获取订单详情失败:', error);
    ElMessage.error('获取订单详情失败，请稍后重试');
  }
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

// 订单详情弹窗相关
const detailDialogVisible = ref(false)
const orderDetail = ref<{
  id: string;
  sku: string;
  orderType: string;
  quantity: number;
  materialCode: string;
  customer: string;
  deliveryLocation: string;
  deliveryDate: string;
  materials: MaterialInfo[];
}>({
  // 基本信息
  id: '',
  sku: '',
  orderType: '',
  quantity: 0,
  materialCode: '',
  
  // 相关信息
  customer: '',
  deliveryLocation: '',
  deliveryDate: '',
  
  // 物料信息
  materials: []
})

// 模拟API调用获取订单详情
const fetchOrderDetail = async (orderId: string | number): Promise<{
  id: string;
  sku: string;
  orderType: string;
  quantity: number;
  materialCode: string;
  customer: string;
  deliveryLocation: string;
  deliveryDate: string;
  materials: MaterialInfo[];
}> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 模拟API返回的订单详情数据
  return {
    // 基本信息
    id: String(orderId),
    sku: `CC_BB_AA`,
    orderType: '销售出库',
    quantity: 678,
    materialCode: '3456789',
    
    // 相关信息
    customer: '江苏ABC贸易有限公司',
    deliveryLocation: '南京市江宁区',
    deliveryDate: '2025-03-28',
    
    // 物料信息
    materials: [
      {
        property: '物料名称',
        value: '高强度纸箱 A类'
      },
      {
        property: '物料规格',
        value: '30×25×20 cm'
      },
      {
        property: '物料冷热度',
        value: '热'
      },
      {
        property: '单位重量',
        value: '0.5 kg'
      }
    ]
  }
}

// 打印订单详情
const handlePrintOrderDetail = () => {
  // 创建打印内容样式
  const printStyle = document.createElement('style')
  printStyle.innerHTML = `
    .print-container {
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    .print-title {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ccc;
    }
    .print-section {
      margin-bottom: 15px;
    }
    .print-section-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #eee;
    }
    .print-info-list {
      display: flex;
      flex-wrap: wrap;
    }
    .print-info-item {
      width: 50%;
      margin-bottom: 8px;
      display: flex;
    }
    .print-info-label {
      font-weight: bold;
      margin-right: 8px;
      color: #666;
    }
    .print-info-value {
      color: #333;
    }
    .print-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .print-table th, .print-table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    .print-table th {
      background-color: #f2f2f2;
    }
    @media print {
      button {
        display: none;
      }
    }
  `

  // 创建打印内容
  const printContent = document.createElement('div')
  printContent.classList.add('print-container')
  
  // 标题
  const title = document.createElement('div')
  title.classList.add('print-title')
  title.textContent = '订单详情'
  printContent.appendChild(title)
  
  // 基本信息
  const basicInfo = document.createElement('div')
  basicInfo.classList.add('print-section')
  const basicTitle = document.createElement('div')
  basicTitle.classList.add('print-section-title')
  basicTitle.textContent = '基本信息'
  basicInfo.appendChild(basicTitle)
  
  const basicInfoList = document.createElement('div')
  basicInfoList.classList.add('print-info-list')
  
  const basicItems: InfoItem[] = [
    { label: '单据编号', value: orderDetail.value.id },
    { label: 'SKU', value: orderDetail.value.sku },
    { label: '单据类型', value: orderDetail.value.orderType },
    { label: '需求数量', value: orderDetail.value.quantity },
    { label: '物料编号', value: orderDetail.value.materialCode }
  ]
  
  basicItems.forEach(item => {
    const infoItem = document.createElement('div')
    infoItem.classList.add('print-info-item')
    
    const label = document.createElement('span')
    label.classList.add('print-info-label')
    label.textContent = `${item.label}:`
    
    const value = document.createElement('span')
    value.classList.add('print-info-value')
    value.textContent = item.value !== null ? String(item.value) : '';
    
    infoItem.appendChild(label)
    infoItem.appendChild(value)
    basicInfoList.appendChild(infoItem)
  })
  
  basicInfo.appendChild(basicInfoList)
  printContent.appendChild(basicInfo)
  
  // 相关信息
  const relatedInfo = document.createElement('div')
  relatedInfo.classList.add('print-section')
  const relatedTitle = document.createElement('div')
  relatedTitle.classList.add('print-section-title')
  relatedTitle.textContent = '相关信息'
  relatedInfo.appendChild(relatedTitle)
  
  const relatedInfoList = document.createElement('div')
  relatedInfoList.classList.add('print-info-list')
  
  const relatedItems: InfoItem[] = [
    { label: '客户名称', value: orderDetail.value.customer },
    { label: '交货地点', value: orderDetail.value.deliveryLocation },
    { label: '交货日期', value: orderDetail.value.deliveryDate }
  ]
  
  relatedItems.forEach(item => {
    const infoItem = document.createElement('div')
    infoItem.classList.add('print-info-item')
    
    const label = document.createElement('span')
    label.classList.add('print-info-label')
    label.textContent = `${item.label}:`
    
    const value = document.createElement('span')
    value.classList.add('print-info-value')
    value.textContent = item.value !== null ? String(item.value) : '';
    
    infoItem.appendChild(label)
    infoItem.appendChild(value)
    relatedInfoList.appendChild(infoItem)
  })
  
  relatedInfo.appendChild(relatedInfoList)
  printContent.appendChild(relatedInfo)
  
  // 物料信息
  const materialInfo = document.createElement('div')
  materialInfo.classList.add('print-section')
  const materialTitle = document.createElement('div')
  materialTitle.classList.add('print-section-title')
  materialTitle.textContent = '物料信息'
  materialInfo.appendChild(materialTitle)
  
  const table = document.createElement('table')
  table.classList.add('print-table')
  
  // 表头
  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr')
  
  const propHeader = document.createElement('th')
  propHeader.textContent = '物料属性'
  headerRow.appendChild(propHeader)
  
  const valueHeader = document.createElement('th')
  valueHeader.textContent = '值'
  headerRow.appendChild(valueHeader)
  
  thead.appendChild(headerRow)
  table.appendChild(thead)
  
  // 表格内容
  const tbody = document.createElement('tbody')
  
  orderDetail.value.materials.forEach((material: MaterialInfo) => {
    const row = document.createElement('tr')
    
    const propCell = document.createElement('td')
    propCell.textContent = material.property
    row.appendChild(propCell)
    
    const valueCell = document.createElement('td')
    valueCell.textContent = material.value
    row.appendChild(valueCell)
    
    tbody.appendChild(row)
  })
  
  table.appendChild(tbody)
  materialInfo.appendChild(table)
  printContent.appendChild(materialInfo)
  
  // 创建打印窗口
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write('<html><head><title>订单详情</title></head><body>')
    printWindow.document.head.appendChild(printStyle)
    printWindow.document.body.appendChild(printContent.cloneNode(true))
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    
    // 等待图片加载完成后打印
    printWindow.setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 300)
  } else {
    ElMessage.error('打印窗口创建失败，请检查浏览器是否阻止弹出窗口')
  }
}
</script>

<template>
  <div class="view-container">
    <div class="action-bar" v-if="displayData.length > 0">
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
          <el-button type="primary" :icon="Search" @click="handleSearch" class="search-area__button search-area__button--search">搜索</el-button>
        </el-form-item>
      </el-form>
      
      <div class="operation-buttons">
        <el-button clearable type="success" :icon="Plus" @click="handleAddOrder" class="operation-buttons__button operation-buttons__button--add">新增订单</el-button>
      </div>
    </div>

    <div class="table-container">
      <el-empty v-if="!props.isLoading && (!props.items || props.items.length === 0)" description="暂无销售出库订单数据" />
      <el-table v-else :data="displayData" v-loading="props.isLoading" stripe height="100%">
        <el-table-column prop="id" label="单据编号" sortable width="160" />
        <el-table-column prop="customer" label="客户" sortable width="160" />
        <el-table-column prop="amount" label="金额" sortable />
        <el-table-column prop="orderDate" label="单据时间" width="160" sortable />
        <el-table-column prop="sku" label="SKU" sortable width="160"/>
        <el-table-column prop="orderType" label="单据类型" width="160" />
        <el-table-column prop="projectItem" label="单据项" width="160"  />
        <el-table-column prop="materialCode" label="物料编号" width="160" />
        <el-table-column prop="quantity" label="需求数量" width="120" sortable />
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
    
    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="850px"
      top="5vh"
      destroy-on-close
      class="order-detail-dialog"
      :modal-append-to-body="true"
      :append-to-body="true"
    >
      <el-icon class="order-detail-dialog__close" @click="detailDialogVisible = false">
      </el-icon>
      
      <div class="order-detail-dialog__content">
        <!-- 基本信息和相关信息合并为两列布局 -->
        <div class="order-detail-dialog__info-wrapper">
          <!-- 基本信息 -->
          <div class="order-detail-dialog__section order-detail-dialog__section--half">
            <h3 class="order-detail-dialog__section-title">基本信息</h3>
            <div class="order-detail-dialog__info-list">
              <div class="order-detail-dialog__info-item">
                <span class="order-detail-dialog__info-label">单据编号:</span>
                <span class="order-detail-dialog__info-value">{{ orderDetail.id }}</span>
              </div>
              <div class="order-detail-dialog__info-item">
                <span class="order-detail-dialog__info-label">SKU:</span>
                <span class="order-detail-dialog__info-value">{{ orderDetail.sku }}</span>
              </div>
              <div class="order-detail-dialog__info-item">
                <span class="order-detail-dialog__info-label">单据类型:</span>
                <span class="order-detail-dialog__info-value">{{ orderDetail.orderType }}</span>
              </div>
              <div class="order-detail-dialog__info-item">
                <span class="order-detail-dialog__info-label">需求数量:</span>
                <span class="order-detail-dialog__info-value">{{ orderDetail.quantity }}</span>
              </div>
              <div class="order-detail-dialog__info-item">
                <span class="order-detail-dialog__info-label">物料编号:</span>
                <span class="order-detail-dialog__info-value">{{ orderDetail.materialCode }}</span>
              </div>
            </div>
          </div>
          
          <!-- 相关信息 -->
          <div class="order-detail-dialog__section order-detail-dialog__section--half">
            <h3 class="order-detail-dialog__section-title">相关信息</h3>
            <div class="order-detail-dialog__info-list">
              <div class="order-detail-dialog__info-item">
                <span class="order-detail-dialog__info-label">客户名称:</span>
                <span class="order-detail-dialog__info-value">{{ orderDetail.customer }}</span>
              </div>
              <div class="order-detail-dialog__info-item">
                <span class="order-detail-dialog__info-label">交货地点:</span>
                <span class="order-detail-dialog__info-value">{{ orderDetail.deliveryLocation }}</span>
              </div>
              <div class="order-detail-dialog__info-item">
                <span class="order-detail-dialog__info-label">交货日期:</span>
                <span class="order-detail-dialog__info-value">{{ orderDetail.deliveryDate }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 物料信息 -->
        <div class="order-detail-dialog__section">
          <h3 class="order-detail-dialog__section-title">物料信息</h3>
          <el-table :data="orderDetail.materials" border size="small" stripe>
            <el-table-column prop="property" label="物料属性" width="220" />
            <el-table-column prop="value" label="值" />
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <div class="order-detail-dialog__footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" :icon="Printer" @click="handlePrintOrderDetail">打印</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

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
  
  &__button {
    &--search {
      background-color: $color-primary;
      border-color: $color-primary;
      
      &:hover, &:focus {
        background-color: lighten($color-primary, 10%);
        border-color: lighten($color-primary, 10%);
      }
      
      &:active {
        background-color: darken($color-primary, 10%);
        border-color: darken($color-primary, 10%);
      }
    }
  }
}

.operation-buttons {
  display: flex;
  gap: 0.5rem;
  /* margin-top: 0px; */ /* Removed as el-form-item might handle alignment */
  
  &__button {
    transition: all $transition-normal;
    font-weight: $font-weight-medium;
    
    &--add {
      background-color: $color-success;
      border-color: $color-success;
      padding: $spacing-small $spacing-base;
      font-size: $font-size-base;
      box-shadow: $shadow-light;
      
      &:hover, &:focus {
        background-color: lighten($color-success, 10%);
        border-color: lighten($color-success, 10%);
        transform: translateY(-2px);
        box-shadow: $shadow-hover;
      }
      
      &:active {
        background-color: darken($color-success, 10%);
        border-color: darken($color-success, 10%);
        transform: translateY(0);
      }
      
      .el-icon {
        margin-right: $spacing-small;
        font-size: $font-size-medium;
        vertical-align: middle;
      }
    }
  }
}

.table-container {
  margin-bottom: 1rem;
  height: 370px;
  // flex-grow: 1; /* Allow table to take available space */
  overflow: hidden; /* Prevent table from overflowing container */
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0; /* Prevent pagination from shrinking */
  /* padding-top: 1rem; Add some space above pagination */
}

// 订单详情弹窗样式
.order-detail-dialog {
  &__close {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 20px;
    cursor: pointer;
    color: #909399;
    z-index: 2001;
    
    &:hover {
      color: #409EFF;
    }
  }
  
  &__content {
    padding: 0 10px;
  }
  
  &__info-wrapper {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
  }
  
  &__section {
    margin-bottom: 15px;
    
    &--half {
      width: 48%;
    }
  }
  
  &__section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #EBEEF5;
    color: #303133;
  }
  
  &__info-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  &__info-item {
    display: flex;
    align-items: center;
  }
  
  &__info-label {
    color: #606266;
    margin-right: 8px;
    min-width: 80px;
  }
  
  &__info-value {
    color: #303133;
    font-weight: 500;
  }
  
  &__footer {
    text-align: right;
    padding-top: 5px;
  }
}

/* 覆盖 Element Plus 对话框样式 */
:deep(.el-dialog) {
  margin: 5vh auto !important;
  display: flex !important;
  flex-direction: column !important;
}

:deep(.el-dialog__header) {
  padding: 15px 20px !important;
  margin-right: 0 !important;
}

:deep(.el-dialog__body) {
  overflow: visible !important;
  padding: 10px 20px !important;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 15px !important;
}

:deep(.el-table) {
  font-size: 13px !important;
}

/* 优化表格在不滚动情况下的展示 */
:deep(.el-table) {
  max-height: none !important;
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