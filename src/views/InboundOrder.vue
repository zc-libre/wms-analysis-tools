<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import BaseTable from '@/components/base/BaseTable.vue'

// 页面标题
const pageTitle = ref('入库单据管理')

// 搜索条件
const searchForm = reactive({
  orderNumber: '',
  supplier: '',
  status: '',
  dateRange: [] as string[]
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '待入库', value: 'pending' },
  { label: '部分入库', value: 'partial' },
  { label: '已入库', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

// 表格列定义
const columns = [
  { prop: 'orderNumber', label: '入库单号', width: '150', sortable: true },
  { prop: 'relatedOrder', label: '关联单号', width: '150' },
  { prop: 'orderType', label: '单据类型', width: '120' },
  { prop: 'supplierName', label: '供应商', width: '150' },
  { prop: 'orderDate', label: '单据日期', width: '120' },
  { prop: 'plannedDate', label: '计划入库日期', width: '120' },
  { prop: 'actualDate', label: '实际入库日期', width: '120' },
  { prop: 'totalAmount', label: '总金额', width: '120', formatter: (row: any) => `¥${row.totalAmount.toFixed(2)}` },
  { prop: 'itemCount', label: '物料种类', width: '100' },
  { prop: 'warehouseName', label: '入库仓库', width: '120' },
  { prop: 'status', label: '状态', width: '100', formatter: (row: any) => {
    const statusMap: Record<string, string> = {
      pending: '待入库',
      partial: '部分入库',
      completed: '已入库',
      cancelled: '已取消'
    }
    return statusMap[row.status] || row.status
  }}
]

// 模拟获取入库单据数据
const fetchInboundOrderData = async () => {
  loading.value = true
  
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 模拟返回数据
    const mockData = Array.from({ length: 45 }, (_, index) => ({
      id: index + 1,
      orderNumber: `INB${String(10000 + index).substring(1)}`,
      relatedOrder: index % 3 === 0 ? `PO${String(10000 + index).substring(1)}` : '',
      orderType: ['采购入库', '生产入库', '调拨入库', '退货入库'][index % 4],
      supplierName: `供应商${index % 10 + 1}`,
      orderDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      plannedDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      actualDate: Math.random() > 0.7 ? `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : '',
      totalAmount: parseFloat((Math.random() * 50000 + 1000).toFixed(2)),
      itemCount: Math.floor(Math.random() * 20) + 1,
      warehouseName: `仓库${index % 5 + 1}`,
      status: ['pending', 'partial', 'completed', 'cancelled'][Math.floor(Math.random() * 4)],
      creator: `用户${index % 8 + 1}`,
      approver: index % 2 === 0 ? `审核员${index % 5 + 1}` : '',
      notes: index % 4 === 0 ? `这是入库单${index + 1}的备注信息` : '',
      items: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, itemIndex) => ({
        id: itemIndex + 1,
        materialCode: `MT${String(10000 + itemIndex).substring(1)}`,
        materialName: `物料${itemIndex + 1}`,
        specification: `规格${itemIndex % 10 + 1}`,
        quantity: Math.floor(Math.random() * 100) + 1,
        unit: ['个', '件', '箱', 'kg', 'm²'][itemIndex % 5],
        price: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
        get amount() { return this.quantity * this.price },
        actualQuantity: Math.random() > 0.7 ? Math.floor(Math.random() * 100) + 1 : 0,
        locationCode: `A${itemIndex % 5 + 1}-B${itemIndex % 3 + 1}-C${itemIndex % 4 + 1}`
      }))
    }))
    
    // 根据搜索条件过滤
    const filteredData = mockData.filter(item => {
      const dateRangeFilter = searchForm.dateRange && searchForm.dateRange.length === 2
        ? new Date(item.orderDate) >= new Date(searchForm.dateRange[0]) && 
          new Date(item.orderDate) <= new Date(searchForm.dateRange[1])
        : true
      
      return (
        (searchForm.orderNumber ? item.orderNumber.includes(searchForm.orderNumber) : true) &&
        (searchForm.supplier ? item.supplierName.includes(searchForm.supplier) : true) &&
        (searchForm.status ? item.status === searchForm.status : true) &&
        dateRangeFilter
      )
    })
    
    // 分页处理
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    
    tableData.value = filteredData.slice(startIndex, endIndex)
    total.value = filteredData.length
  } catch (error) {
    console.error('获取入库单据失败', error)
    ElMessage.error('获取入库单据失败')
  } finally {
    loading.value = false
  }
}

// 搜索入库单
const handleSearch = () => {
  currentPage.value = 1
  fetchInboundOrderData()
}

// 重置搜索条件
const handleReset = () => {
  searchForm.orderNumber = ''
  searchForm.supplier = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchInboundOrderData()
}

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchInboundOrderData()
}

// 查看入库单详情
const handleViewDetail = (row: any) => {
  ElMessage.info(`查看入库单详情：${row.orderNumber}`)
  // 实际项目中应打开详情模态框
}

// 编辑入库单
const handleEdit = (row: any) => {
  if (row.status === 'completed' || row.status === 'cancelled') {
    ElMessage.warning('已完成或已取消的入库单不可编辑')
    return
  }
  
  ElMessage.info(`编辑入库单：${row.orderNumber}`)
  // 实际项目中应打开编辑模态框
}

// 新增入库单
const handleAddInbound = () => {
  ElMessage.info('新增入库单')
  // 实际项目中应打开新增模态框
}

// 导出数据
const handleExport = () => {
  ElMessage.success('开始导出入库单数据')
  // 实际项目中应调用导出API
}

// 页面加载时获取数据
onMounted(() => {
  fetchInboundOrderData()
})
</script>

<template>
  <div class="inbound-order">
    <div class="inbound-order__header">
      <h2 class="inbound-order__title">{{ pageTitle }}</h2>
      
      <!-- 搜索表单 -->
      <div class="inbound-order__search">
        <el-form :inline="true" :model="searchForm" class="inbound-order__form">
          <el-form-item label="入库单号">
            <el-input 
              v-model="searchForm.orderNumber" 
              placeholder="请输入入库单号"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item label="供应商">
            <el-input 
              v-model="searchForm.supplier" 
              placeholder="请输入供应商"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select 
              v-model="searchForm.status" 
              placeholder="请选择状态"
              clearable
            >
              <el-option
                v-for="option in statusOptions.filter(o => o.value !== '')"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="单据日期">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <!-- 工具栏 -->
    <div class="inbound-order__toolbar">
      <el-button type="primary" @click="handleAddInbound">
        <el-icon><Plus /></el-icon>
        新增入库单
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>
    
    <!-- 表格 -->
    <div class="inbound-order__table">
      <base-table
        :data="tableData"
        :loading="loading"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        show-index
        show-operation
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      >
        <el-table-column
          v-for="column in columns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :sortable="column.sortable"
          :formatter="column.formatter"
        />
        
        <template #operation="{ row }">
          <el-button 
            type="primary" 
            link
            @click="handleViewDetail(row)"
          >
            查看详情
          </el-button>
          <el-button 
            type="primary" 
            link
            @click="handleEdit(row)"
            :disabled="row.status === 'completed' || row.status === 'cancelled'"
          >
            编辑
          </el-button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style scoped>
.inbound-order {
  padding: 20px;
  height: 100%;
}

.inbound-order__header {
  margin-bottom: 20px;
}

.inbound-order__title {
  font-size: 24px;
  margin-bottom: 16px;
}

.inbound-order__search {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.inbound-order__toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
}

.inbound-order__table {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
</style> 