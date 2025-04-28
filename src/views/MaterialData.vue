<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import BaseTable from '@/components/base/BaseTable.vue'

// 页面标题
const pageTitle = ref('物料数据管理')

// 搜索条件
const searchForm = reactive({
  materialCode: '',
  materialName: '',
  category: ''
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 类别选项
const categoryOptions = [
  { label: '全部', value: '' },
  { label: '原材料', value: '原材料' },
  { label: '半成品', value: '半成品' },
  { label: '成品', value: '成品' },
  { label: '辅料', value: '辅料' },
  { label: '包装材料', value: '包装材料' }
]

// 表格列定义
const columns = [
  { prop: 'materialCode', label: '物料编码', width: '120', sortable: true },
  { prop: 'materialName', label: '物料名称', width: '150' },
  { prop: 'specification', label: '规格型号', width: '120' },
  { prop: 'category', label: '类别', width: '100' },
  { prop: 'unit', label: '单位', width: '80' },
  { prop: 'price', label: '单价', width: '100', formatter: (row: any) => `¥${row.price.toFixed(2)}` },
  { prop: 'inventory', label: '库存数量', width: '100' },
  { prop: 'inventoryAmount', label: '库存金额', width: '120', formatter: (row: any) => `¥${row.inventoryAmount.toFixed(2)}` },
  { prop: 'supplierName', label: '供应商', width: '150' },
  { prop: 'lastPurchaseDate', label: '最近采购日期', width: '150' }
]

// 获取物料数据
const fetchMaterialData = async () => {
  loading.value = true
  
  try {
    // 实际项目中，这里应该调用API接口获取数据
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 生成模拟数据
    const mockData = Array.from({ length: 35 }, (_, index) => ({
      id: index + 1,
      materialCode: `MT${String(10000 + index).substring(1)}`,
      materialName: `物料${index + 1}`,
      specification: `规格${index % 10 + 1}`,
      category: ['原材料', '半成品', '成品', '辅料', '包装材料'][index % 5],
      unit: ['个', '件', '箱', 'kg', 'm²'][index % 5],
      price: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
      inventory: Math.floor(Math.random() * 1000),
      get inventoryAmount() { return this.price * this.inventory },
      supplierName: `供应商${index % 8 + 1}`,
      lastPurchaseDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
    }))
    
    // 根据搜索条件过滤
    const filteredData = mockData.filter(item => {
      return (
        (searchForm.materialCode ? item.materialCode.includes(searchForm.materialCode) : true) &&
        (searchForm.materialName ? item.materialName.includes(searchForm.materialName) : true) &&
        (searchForm.category ? item.category === searchForm.category : true)
      )
    })
    
    // 分页处理
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    
    tableData.value = filteredData.slice(startIndex, endIndex)
    total.value = filteredData.length
  } catch (error) {
    ElMessage.error('获取物料数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索物料
const handleSearch = () => {
  currentPage.value = 1
  fetchMaterialData()
}

// 重置搜索条件
const handleReset = () => {
  searchForm.materialCode = ''
  searchForm.materialName = ''
  searchForm.category = ''
  handleSearch()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchMaterialData()
}

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchMaterialData()
}

// 查看物料详情
const handleViewDetail = (row: any) => {
  ElMessage.info(`查看物料详情：${row.materialName}`)
}

// 新增物料
const handleAddMaterial = () => {
  ElMessage.info('打开新增物料表单')
}

// 编辑物料
const handleEdit = (row: any) => {
  ElMessage.info(`编辑物料：${row.materialName}`)
}

// 导出物料数据
const handleExport = () => {
  ElMessage.success('开始导出物料数据')
}

// 页面加载时获取数据
onMounted(() => {
  fetchMaterialData()
})
</script>

<template>
  <div class="view-container">
    <div class="action-bar">
      <!-- 搜索表单 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="物料编码">
            <el-input 
              v-model="searchForm.materialCode" 
              placeholder="请输入物料编码"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 工具栏 -->
      <div class="operation-buttons">
        <el-button type="primary" @click="handleAddMaterial">
          <el-icon><Plus /></el-icon>
          新增物料
        </el-button>
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>
    
    <!-- 表格 -->
    <div class="table-container">
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
            查看
          </el-button>
          <el-button 
            type="primary" 
            link
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  padding: 20px;
  height: 100%;
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

.search-area {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.operation-buttons {
  display: flex;
  justify-content: flex-end;
}

.table-container {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
</style> 