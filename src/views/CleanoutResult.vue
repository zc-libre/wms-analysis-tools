<template>
  <div class="cleanout-result-container">
    <div class="result-header">
      <div class="result-header__title-wrapper">
        <div class="result-header__title">数据文件清洗结果查看</div>
        <el-tooltip content="查看已上传的数据文件清洗结果和详情数据" placement="top" effect="light">
          <el-icon class="result-header__info-icon"><InfoFilled /></el-icon>
        </el-tooltip>
      </div>
    </div>

    <div class="summary-cards">
      <!-- 总文件数 -->
      <div class="summary-card blue-border">
        <div class="card-title">总文件数</div>
        <div class="card-value">{{ totalFiles }}</div>
      </div>
      
      <!-- 上传成功 -->
      <div class="summary-card green-border">
        <div class="card-title">清洗成功</div>
        <div class="card-value">{{ successFiles }}</div>
        <!-- <div class="card-percentage">{{ successPercentage }}</div> -->
        <div class="progress-container">
          <div class="progress-bar green-bg" :style="{ width: successWidth }"></div>
        </div>
      </div>
      
      <!-- 正在清洗 -->
      <div class="summary-card yellow-border">
        <div class="card-title">正在清洗</div>
        <div class="card-value">{{ processingFiles }}</div>
        <!-- <div class="card-percentage">{{ processingPercentage }}</div> -->
        <div class="progress-container">
          <div class="progress-bar yellow-bg" :style="{ width: processingWidth }"></div>
        </div>
      </div>
      
      <!-- 上传失败 -->
      <div class="summary-card red-border">
        <div class="card-title">清洗失败</div>
        <div class="card-value">{{ failedFiles }}</div>
        <!-- <div class="card-percentage">{{ failedPercentage }}</div> -->
        <div class="progress-container">
          <div class="progress-bar red-bg" :style="{ width: failedWidth }"></div>
        </div>
      </div>
      
      <!-- 总数据量 -->
      <div class="summary-card gray-border">
        <div class="card-title">总数据量</div>
        <div class="card-value">{{ totalRecords.toLocaleString() }}</div>
        <div class="data-stats">
          <div class="stat-row">
            <div class="stat-item">
              <span class="stat-label">总</span>
              <span class="stat-value total">{{ totalRecords.toLocaleString() }}</span>
            </div>
          </div>
          <div class="stat-row">
            <div class="stat-item">
              <span class="stat-label">成功:</span>
              <span class="stat-value success">{{ successRecords.toLocaleString() }}</span>
              <span class="stat-percentage">({{ successRecordsPercentage }})</span>
            </div>
          </div>
          <div class="stat-row">
            <div class="stat-item">
              <span class="stat-label">失败:</span>
              <span class="stat-value failed">{{ failedRecords.toLocaleString() }}</span>
              <span class="stat-percentage">({{ failedRecordsPercentage }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签导航栏 -->
    <div class="file-tabs">
      <div 
        class="tab" 
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >所有文件</div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'success' }"
        @click="activeTab = 'success'"
      >仅查看成功</div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'failed' }"
        @click="activeTab = 'failed'"
      >仅查看失败</div>
    </div>

    <!-- 过滤条件 -->
    <div class="filter-section">
      <div class="filter-item">
        <span class="filter-label">文档类型</span>
        <el-select v-model="docType" placeholder="全部类型" clearable class="filter-select">
          <el-option value="all" label="全部类型" />
          <el-option value="order" label="订单文件" />
          <el-option value="inventory" label="库存文件" />
          <el-option value="material" label="物料主数据文件" />
        </el-select>
      </div>
      
      <div class="filter-item">
        <span class="filter-label">上传日期</span>
        <el-select v-model="uploadDate" placeholder="全部时间" clearable class="filter-select">
          <el-option value="all" label="全部时间" />
          <el-option value="today" label="今天" />
          <el-option value="week" label="本周" />
          <el-option value="month" label="本月" />
        </el-select>
      </div>
      
      <div class="filter-item">
        <span class="filter-label">搜索文件名</span>
        <el-input v-model="searchFileName" placeholder="输入文件名..." clearable />
      </div>
      
      <el-button type="primary" class="filter-button">筛选</el-button>
    </div>

    <!-- 文件列表表格 -->
    <div class="file-table-container">
    <el-table :data="filteredFileList" border stripe class="file-table">
      <el-table-column prop="fileName" label="文件名" min-width="180" />
      <el-table-column prop="fileType" label="文件类型"  min-width="120">
        <template #default="scope">
          <el-tag :type="getFileTypeTagType(scope.row.fileType)" size="small" effect="light">
            {{ scope.row.fileType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="uploadDate" label="上传日期" width="120" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <div class="status-tag" :class="getStatusClass(scope.row.status)">
            {{ scope.row.status }}
            <el-icon v-if="scope.row.status === '正在清洗'" class="is-loading"><Loading /></el-icon>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="数据统计" min-width="200">
        <template #default="scope">
          <div class="data-statistics">
            <div v-if="scope.row.totalCount">总数据: {{ scope.row.totalCount }} 条</div>
            <div v-if="scope.row.successCount">清洗成功: {{ scope.row.successCount }} 条</div>
            <div v-if="scope.row.failCount">清洗失败: {{ scope.row.failCount }} 条</div>
            <!-- 这里用v-html渲染HTML，确保换行生效，数据需可信 -->
            <div v-if="scope.row.processingInfo" v-html="scope.row.processingInfo"></div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280">
        <template #default="scope">
          <div class="action-buttons">
            <el-button 
              type="primary" 
              size="small" 
              plain
              @click="downloadOriginal(scope.row)"
            >
              <el-icon><Download /></el-icon>
              下载原始文件
            </el-button>
            <el-button 
              type="success" 
              size="small" 
              plain
              @click="downloadReport(scope.row)"
            >
              <el-icon><Document /></el-icon>
              下载清洗报告
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
</div>
    <!-- 分页组件 -->
    <div class="pagination-container">
        <el-pagination
        background
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[100, 200, 300, 400]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="filteredFileList.length"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Loading, InfoFilled, Download, Document } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../stores/project';

// 组件内变量定义
const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

const projectId = ref<number | null>(null);
const projectName = ref('');
const fileType = ref('');

const docType = ref('all');
const uploadDate = ref('all');
const searchFileName = ref('');
const currentPage = ref(1);
const pageSize = ref(200);
const totalFiles = ref(158);

// 成功、处理中和失败的文件数量
const successFiles = ref(134);
const processingFiles = ref(8);
const failedFiles = ref(16);

// 总数据量相关变量
const totalRecords = ref(287456);
const successRecords = ref(274129);
const failedRecords = ref(13327);
const successRecordsPercentage = computed(() => '95.4%');
const failedRecordsPercentage = computed(() => '4.6%');

// 计算进度条宽度
const successWidth = computed(() => {
  return (successFiles.value / totalFiles.value) * 100 + '%';
});

const processingWidth = computed(() => {
  return (processingFiles.value / totalFiles.value) * 100 + '%';
});

const failedWidth = computed(() => {
  return (failedFiles.value / totalFiles.value) * 100 + '%';
});

// 模拟数据
const fileList = ref([
  {
    id: 1,
    fileName: '2025年4月订单.xlsx',
    fileType: '订单文件',
    uploadDate: '2025-04-25',
    status: '清洗成功',
    totalCount: 1245,
    successCount: 1233,
    failCount: 12
  },
  {
    id: 2,
    fileName: '2025年销售数据.xlsx',
    fileType: '订单文件',
    uploadDate: '2025-04-26',
    status: '正在清洗',
    processingInfo: '文件已提交处理<br>预计完成时间: 5分钟后'
  },
  {
    id: 3,
    fileName: '库存盘点_Q1.xlsx',
    fileType: '库存文件',
    uploadDate: '2025-04-15',
    status: '清洗成功',
    totalCount: 3782,
    successCount: 3774,
    failCount: 8
  },
  {
    id: 4,
    fileName: '物料主数据_更新版.xlsx',
    fileType: '物料主数据文件',
    uploadDate: '2025-04-10',
    status: '清洗成功',
    totalCount: 926,
    successCount: 926,
    failCount: 0
  },
  {
    id: 5,
    fileName: 'Q2季度库存预测.xlsx',
    fileType: '库存文件',
    uploadDate: '2025-04-23',
    status: '正在清洗',
    processingInfo: '文件已提交处理<br>预计完成时间: 12分钟后'
  },
  {
    id: 6,
    fileName: '2025年3月订单.xlsx',
    fileType: '订单文件',
    uploadDate: '2025-04-02',
    status: '清洗成功',
    totalCount: 1543,
    successCount: 1528,
    failCount: 15
  },
  {
    id: 7,
    fileName: '库存异常数据.xlsx',
    fileType: '库存文件',
    uploadDate: '2025-04-20',
    status: '清洗失败',
    totalCount: 0,
    successCount: 0,
    failCount: 0
  },
  {
    id: 8,
    fileName: '物料清单错误数据.xlsx',
    fileType: '物料主数据文件',
    uploadDate: '2025-04-18',
    status: '清洗失败',
    totalCount: 0,
    successCount: 0,
    failCount: 0
  }
]);

// 获取状态对应的CSS类
const getStatusClass = (status: string) => {
  switch (status) {
    case '清洗成功': return 'status-success';
    case '正在清洗': return 'status-processing';
    case '清洗失败': return 'status-failed';
    default: return '';
  }
};

// 页面切换处理
const handlePageChange = (page: number) => {
  currentPage.value = page;
  // 实际应用中这里应该调用API获取对应页的数据
};

// 页面大小变更处理
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  // 重置当前页码
  currentPage.value = 1;
  // 实际应用中这里应该调用API获取对应页的数据
};

// 下载原始文件
const downloadOriginal = (file: any) => {
  console.log('下载原始文件:', file.fileName);
  // 实际应用中这里应该调用API下载文件
};

// 下载清洗报告
const downloadReport = (file: any) => {
  console.log('下载清洗报告:', file.fileName);
  // 实际应用中这里应该调用API下载清洗报告
};

// 页面加载时获取数据
onMounted(() => {
  // 从 Pinia store 获取项目信息
  projectId.value = projectStore.currentProjectId;
  projectName.value = projectStore.currentProjectName;
  fileType.value = projectStore.currentFileType;
  
  if (!projectId.value) {
    // 尝试从 sessionStorage 获取项目信息
    const storedProject = sessionStorage.getItem('currentProject');
    if (storedProject) {
      try {
        const projectData = JSON.parse(storedProject);
        projectId.value = projectData.id;
        projectName.value = projectData.name;
        
        // 更新 Pinia store（这样其他组件可以从store中获取数据）
        projectStore.setCurrentProject(projectData.id, projectData.name);
      } catch (e) {
        console.error('解析sessionStorage中的项目数据失败', e);
      }
    }
    
    // 如果还是没有数据，尝试从查询参数获取（向后兼容）
    if (!projectId.value) {
      const id = route.query.id;
      const name = route.query.name;
      const type = route.query.type;
      
      if (id) {
        projectId.value = parseInt(id.toString(), 10);
        projectName.value = name?.toString() || `项目 ${id}`;
        fileType.value = type?.toString() || '';
      } else {
        // 如果没有项目信息，返回首页
        router.push('/');
      }
    }
  }
  
  // 加载数据
  loadData();
});

// 加载清洗数据
const loadData = () => {
  // 这里是加载数据的逻辑
  // 使用 projectId.value 和 fileType.value 获取相应数据
};

// 获取文件类型标签类型
const getFileTypeTagType = (fileType: string) => {
  switch (fileType) {
    case '订单文件': return 'success';
    case '库存文件': return 'info';
    case '物料主数据文件': return 'warning';
    default: return '';
  }
};

// 添加activeTab状态变量和标签点击功能
const activeTab = ref('all');

// 将filteredFileList修改为计算属性，根据activeTab状态筛选文件数据
const filteredFileList = computed(() => {
  if (activeTab.value === 'all') {
    return fileList.value;
  } else if (activeTab.value === 'success') {
    return fileList.value.filter(file => file.status === '清洗成功');
  } else if (activeTab.value === 'failed') {
    return fileList.value.filter(file => file.status === '清洗失败');
  }
  return fileList.value;
});
</script>

<style scoped>
.cleanout-result-container {
  padding: 10px;
  background-color: #f5f7fa;
  /*min-height: 100vh;*/
  height:100%;
}

.result-header {
  margin-bottom: 12px;
  
  .result-header__title-wrapper {
    display: flex;
    align-items: center;
  }
  
  .result-header__title {
    font-size: 20px;
    color: #333;
    margin: 0 8px 0 0;
  }
  
  .result-header__info-icon {
    font-size: 16px;
    color: #909399;
    cursor: pointer;
    
    .result-header__info-icon:hover {
      color: #409EFF;
    }
  }
}

.summary-cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 15px;
  height:120px;
}

.summary-card {
  flex: 1;
  min-width: 200px;
  background-color: #fff;
  border-radius: 4px;
  padding:5px 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  height:100%;
}

.blue-border {
  border-left: 4px solid #409eff;
}

.green-border {
  border-left: 4px solid #67c23a;
}

.yellow-border {
  border-left: 4px solid #e6a23c;
}

.red-border {
  border-left: 4px solid #f56c6c;
}

.gray-border {
  border-left: 4px solid #909399;
}

.card-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 3px;
}

.card-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.card-percentage {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  margin-bottom: 8px;
}

.progress-container {
  background-color: #f0f2f5;
  height: 4px;
  border-radius: 2px;
  margin-top: 8px;
  width: 100%;
}

.progress-bar {
  height: 4px;
  border-radius: 2px;
}

.green-bg {
  background-color: #67c23a;
}

.yellow-bg {
  background-color: #e6a23c;
}

.red-bg {
  background-color: #f56c6c;
}

.data-stats {
  
}

.stat-row {
  display: flex;
  margin-bottom: 4px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-label {
  min-width: 40px;
  color: #606266;
  font-size: 12px;
}

.stat-value {
  font-weight: 600;
  font-size: 12px;
  margin-right: 4px;
}

.stat-value.total {
  color: #409eff;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.failed {
  color: #f56c6c;
}

.stat-percentage {
  color: #909399;
  font-size: 12px;
}

.file-tabs {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.tab {
  padding: 3px 10px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  border-bottom: 2px solid transparent;
  margin-right: 24px;
}

.tab.active {
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.filter-item {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  margin-right: 10px;
  white-space: nowrap;
}

.filter-select {
  flex: 1;
}

.filter-button {
  height: 40px;
}

.file-table {
  margin-bottom: 16px;
  height:100%;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-tag .is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.status-success {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status-processing {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.status-failed {
  background-color: #fef0f0;
  color: #f56c6c;
}

.data-statistics {
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
.file-table-container {
    height:calc(100% - 300px);
}
</style> 