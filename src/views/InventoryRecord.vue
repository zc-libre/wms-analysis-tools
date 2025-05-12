<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'

// 搜索条件
const searchQuery = ref('')

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)
const totalItems = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 获取库存记录数据
const fetchInventoryData = async () => {
  loading.value = true
  
  try {
    // 实际项目中，这里应该调用API接口获取数据
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据 - 实际项目应通过API获取
    const mockData = [
      { id: '123456789', sku: 'CC_BB_AA', containerId: 'ertyui', quantity: 56789 },
      { id: '123456790', sku: 'DD_EE_FF', containerId: 'asdfgh', quantity: 43210.5 },
      { id: '123456791', sku: 'GG_HH_II', containerId: 'qwerty', quantity: 98765.25 },
      { id: '123456792', sku: 'AA_XX_YY', containerId: 'zxcvbn', quantity: 10000 },
      { id: '123456793', sku: 'BB_YY_ZZ', containerId: 'poiuyt', quantity: 25000.75 },
      { id: '123456794', sku: 'CC_ZZ_AA', containerId: 'mnbvcx', quantity: 500 }
    ]

    // 模拟基于搜索的过滤
    const filteredData = mockData.filter(item =>
      item.id.includes(searchQuery.value) ||
      item.sku.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.containerId.toLowerCase().includes(searchQuery.value.toLowerCase())
    )

    totalItems.value = filteredData.length

    // 模拟分页
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    tableData.value = filteredData.slice(startIndex, endIndex)

  } catch (error) {
    ElMessage.error('获取库存记录失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchInventoryData()
}

// 处理新增
const handleAdd = () => {
  ElMessage.info('触发新增库存记录操作')
}

// 处理编辑
const handleEdit = (row: any) => {
  ElMessage.info(`编辑库存记录：${row.id}, SKU: ${row.sku}`)
}

// 处理删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除 SKU 为 ${row.sku} (编号: ${row.id}) 的库存记录吗?`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessage.success('删除成功')
      fetchInventoryData()
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchInventoryData()
}

// 页面加载时获取数据
onMounted(() => {
  fetchInventoryData()
})
</script>

<template>
  <div class="view-container">
    <!-- 搜索与操作区域 -->
    <div class="action-bar">
      <div class="search-area">
        <el-input
          v-model="searchQuery"
          placeholder="搜索库存记录编号/SKU/容器编号"
          clearable
          style="width: 300px;"
          size="small"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
        <el-button type="primary" size="small" @click="handleSearch">搜索</el-button>
      </div>
          <!-- 工具栏 -->
    <div class="inbound-order__toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增库存记录
      </el-button>
    </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" border stripe height="100%">
        <el-table-column prop="id" label="库存记录编号" width="180" sortable />
        <el-table-column prop="sku" label="SKU" width="180" sortable />
        <el-table-column prop="containerId" label="容器编号" width="180" />
        <el-table-column prop="quantity" label="可用数量" sortable />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link :icon="Edit" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" link :icon="Delete" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页区域 -->
    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalItems"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.view-container {
  // 可以添加一些视图级别的内边距或样式
}

.action-bar {
  // 样式调整间距等
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  flex-direction: row;
}

.table-container {
  background-color: #fff;
  /* padding: 16px; */
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.pagination-container {
 // 样式调整间距等
}

// d-flex 和 gap-2 来自 Bootstrap，如果项目中没有全局引入类似的 utility 类，需要自行实现或用 Element Plus 的 Row/Col 替代
.d-flex { display: flex; }
.justify-content-between { justify-content: space-between; }
.justify-content-end { justify-content: flex-end; }
.gap-2 > *:not(:last-child) { margin-right: 0.5rem; } // 简易模拟 gap
.mt-3 { margin-top: 1rem; }
.mb-3 { margin-bottom: 1rem; }

</style> 