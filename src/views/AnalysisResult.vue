<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, onBeforeUnmount, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { 
  ArrowDown, 
  Download, 
  Refresh, 
  Plus, 
  Delete, 
  View, 
  CaretRight,
  Goods,
  TrendCharts,
  Aim,
  DataLine,
  List,
  Monitor,
  Document,
  VideoPause
} from '@element-plus/icons-vue'

// 为分析记录中的数据项定义接口
interface HitRateDataItem {
  dateType: string;
  date: string;
  timeMode: string;
  totalOrders: number;
  totalContainerRuns: number;
  orderPerHour: number;
  containerRunsPerHour: number;
  avgHitRate: number;
  orderPerMinute: number;
  containerRunsPerMinute: number;
  avgHitRateMinute: number;
}

// 新增类型定义
interface AnalysisRecord {
  id: number;
  title: string;
  date: string;
  status: 'completed' | 'processing' | 'failed' | 'paused';
  project: string;
  analysisType?: string;
  selectedFiles?: string[];
}

interface TabItem {
  key: string;
  label: string;
  isDropdown?: boolean;
}



// EI分析数据项接口
interface EIAnalysisDataItem {
  id: number;
  orderLines: number; // 订单行数
  orderCount: number; // 单据数量
  percentage: number; // 单据数量占比
}

interface OrderDetailDataItem {
  date: string;
  orderType: string;
  quantity: number;
  orderCount: number;
  demandCount: number;
  volume: number;
  unitPallet: number;
  unitPiece: number;
  palletToPiece: number;
}

interface PeriodEIQDataItem {
  date: string;
  time: string;
  orderType: string;
  quantity: number;
  orderCount: number;
  demandCount: number;
  volume: number;
  unitLine: number;
}

// 为 recordDataMap 中的每个记录定义接口
interface AnalysisRecordData {
  title: string;
  hitRateData: HitRateDataItem[];
  orderDetailData: OrderDetailDataItem[];
  periodEIQData: PeriodEIQDataItem[];
  eiAnalysisData: EIAnalysisDataItem[];
}

// 图表实例引用
const chartRef = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null
// 存储四个子图表实例
const charts = reactive<{[key: string]: echarts.ECharts | null}>({
  chart1: null,
  chart2: null,
  chart3: null,
  chart4: null,
  periodChart1: null,
  periodChart2: null,
  periodChart3: null,
  periodChart4: null
})

// 数据和状态
const activeTab = ref('dailyEIQ')
const viewMode = ref('table') // 'table' 或 'chart'
const expandedProject = ref('南京物流中心项目')
const selectedDate = ref(new Date())

// 新建分析弹窗相关数据
const showAnalysisDialog = ref(false)
const analysisForm = reactive({
  name: '',
  project: '',
  analysisType: '1', // 默认按项目分析
  selectedFiles: [] // 存储选中的文件
})

// 模拟的文件列表数据
const fileList = reactive([
  { id: 1, name: '销售出库订单_202503.xlsx' },
  { id: 2, name: '销售出库订单_202502.xlsx' },
  { id: 3, name: '销售出库订单_202501.xlsx' }
])

const analysisDialogRules = {
  name: [
    { required: true, message: '请输入分析名称', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  project: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ]
}
const analysisFormRef = ref()

// 项目数据
const projectList = reactive([
  {
    id: 1,
    name: '南京物流中心项目',
    company: '江苏分公司',
    location: '南京市江宁区',
    isActive: true
  },
  {
    id: 2,
    name: '上海配送中心项目',
    company: '上海分公司',
    location: '上海市嘉定区',
    isActive: false
  },
  {
    id: 3,
    name: '广州配送中心项目',
    company: '广东分公司',
    location: '广州市番禺区',
    isActive: false
  }
])

// 根据选中的项目筛选分析记录
const filteredAnalysisRecords = computed(() => {
  if (!expandedProject.value) {
    return analysisRecords // 如果没有选中项目，显示所有记录
  }
  return analysisRecords.filter(record => record.project === expandedProject.value)
})

// 分析记录数据
const analysisRecords = reactive<AnalysisRecord[]>([
  {
    id: 1,
    title: '南京3月销售订单分析',
    date: '2025-03-27 14:30',
    status: 'completed' as const, // completed, processing, failed
    project: '南京物流中心项目'
  },
  {
    id: 2,
    title: '南京2月销售订单分析',
    date: '2025-02-15 10:20',
    status: 'completed' as const,
    project: '南京物流中心项目'
  },
  {
    id: 3,
    title: '南京1月销售订单分析',
    date: '2025-01-20 09:15',
    status: 'processing' as const,
    project: '南京物流中心项目'
  }
])

// 当前选中的分析记录ID
const selectedRecordId = ref(1)

// 骨架屏显示控制
const showSkeletonScreen = ref(false)
// 当前处理中的记录 ID
const processingRecordId = ref<number | null>(null)

// 分析记录数据映射 - 为每个记录ID存储对应的完整数据
const recordDataMap = reactive<Record<number, AnalysisRecordData>>({
  // 3月销售订单分析数据
  1: {
    // 标题
    title: '南京3月销售订单分析',
    // 命中率数据
    hitRateData: [
      {
        dateType: '中值日',
        date: '2025-03-06',
        timeMode: '天',
        totalOrders: 2500,
        totalContainerRuns: 1152,
        orderPerHour: 25,
        containerRunsPerHour: 288,
        avgHitRate: 2.17,
        orderPerMinute: 767,
        containerRunsPerMinute: 352,
        avgHitRateMinute: 2.18
      },
      {
        dateType: '均值日',
        date: '2025-03-06',
        timeMode: '天',
        totalOrders: 2500,
        totalContainerRuns: 1152,
        orderPerHour: 625,
        containerRunsPerHour: 288,
        avgHitRate: 2.17,
        orderPerMinute: 767,
        containerRunsPerMinute: 352,
        avgHitRateMinute: 2.18
      },
      {
        dateType: '峰值日',
        date: '2025-03-07',
        timeMode: '天',
        totalOrders: 2700,
        totalContainerRuns: 1262,
        orderPerHour: 85,
        containerRunsPerHour: 316,
        avgHitRate: 2.17,
        orderPerMinute: 840,
        containerRunsPerMinute: 382,
        avgHitRateMinute: 2.18
      }
    ],
    // 订单详情数据
    orderDetailData: [
      {
        date: '2024-10-25',
        orderType: '1',
        quantity: 65,
        orderCount: 17650,
        demandCount: 98750,
        volume: 98750,
        unitPallet: 271.54,
        unitPiece: 1519.23,
        palletToPiece: 5.60
      },
      {
        date: '2024-10-26',
        orderType: '1',
        quantity: 68,
        orderCount: 17960,
        demandCount: 101520,
        volume: 101520,
        unitPallet: 264.12,
        unitPiece: 1492.94,
        palletToPiece: 5.65
      },
      {
        date: '2024-10-27',
        orderType: '1',
        quantity: 63,
        orderCount: 16540,
        demandCount: 95200,
        volume: 95200,
        unitPallet: 262.54,
        unitPiece: 1511.11,
        palletToPiece: 5.76
      },
      {
        date: '2024-10-28',
        orderType: '1',
        quantity: 69,
        orderCount: 18320,
        demandCount: 104500,
        volume: 104500,
        unitPallet: 265.51,
        unitPiece: 1514.49,
        palletToPiece: 5.70
      },
      {
        date: '2024-10-29',
        orderType: '1',
        quantity: 72,
        orderCount: 19250,
        demandCount: 109800,
        volume: 109800,
        unitPallet: 267.36,
        unitPiece: 1525.00,
        palletToPiece: 5.70
      },
      {
        date: '2024-10-30',
        orderType: '1',
        quantity: 70,
        orderCount: 18650,
        demandCount: 106200,
        volume: 106200,
        unitPallet: 266.43,
        unitPiece: 1517.14,
        palletToPiece: 5.69
      },
      {
        date: '2024-10-31',
        orderType: '1',
        quantity: 71,
        orderCount: 18816,
        demandCount: 107442,
        volume: 107442,
        unitPallet: 265.01,
        unitPiece: 1513.27,
        palletToPiece: 5.71
      },
      {
        date: '2024-11-01',
        orderType: '1',
        quantity: 71,
        orderCount: 18242,
        demandCount: 102974,
        volume: 102974,
        unitPallet: 256.93,
        unitPiece: 1450.34,
        palletToPiece: 5.64
      },
      {
        date: '2024-11-02',
        orderType: '1',
        quantity: 74,
        orderCount: 19710,
        demandCount: 113311,
        volume: 113311,
        unitPallet: 266.35,
        unitPiece: 1531.23,
        palletToPiece: 5.75
      },
      {
        date: '2024-11-03',
        orderType: '1',
        quantity: 75,
        orderCount: 19850,
        demandCount: 114250,
        volume: 114250,
        unitPallet: 264.67,
        unitPiece: 1523.33,
        palletToPiece: 5.76
      },
      {
        date: '2024-11-04',
        orderType: '1',
        quantity: 73,
        orderCount: 19420,
        demandCount: 111600,
        volume: 111600,
        unitPallet: 266.03,
        unitPiece: 1528.77,
        palletToPiece: 5.75
      }
    ],
    // 每时段EIQ分析数据
    periodEIQData: [
      {
        date: '2023-10-16',
        time: '09时',
        orderType: '1',
        quantity: 2,
        orderCount: 3,
        demandCount: 4,
        volume: 4,
        unitLine: 1.50
      },
      {
        date: '2023-10-16',
        time: '10时',
        orderType: '1',
        quantity: 10,
        orderCount: 10,
        demandCount: 19,
        volume: 19,
        unitLine: 1.00
      },
      {
        date: '2023-10-16',
        time: '11时',
        orderType: '1',
        quantity: 4,
        orderCount: 4,
        demandCount: 9,
        volume: 9,
        unitLine: 1.00
      },
      {
        date: '2023-10-16',
        time: '12时',
        orderType: '1',
        quantity: 5,
        orderCount: 6,
        demandCount: 15,
        volume: 15,
        unitLine: 1.20
      },
      {
        date: '2023-10-16',
        time: '13时',
        orderType: '1',
        quantity: 7,
        orderCount: 10,
        demandCount: 23,
        volume: 23,
        unitLine: 1.43
      },
      {
        date: '2023-10-16',
        time: '14时',
        orderType: '1',
        quantity: 34,
        orderCount: 155,
        demandCount: 245,
        volume: 245,
        unitLine: 4.56
      },
      {
        date: '2023-10-16',
        time: '15时',
        orderType: '1',
        quantity: 262,
        orderCount: 344,
        demandCount: 599,
        volume: 599,
        unitLine: 1.31
      },
      {
        date: '2023-10-16',
        time: '16时',
        orderType: '1',
        quantity: 55,
        orderCount: 324,
        demandCount: 870,
        volume: 870,
        unitLine: 5.89
      },
      {
        date: '2023-10-16',
        time: '17时',
        orderType: '1',
        quantity: 2,
        orderCount: 2,
        demandCount: 2,
        volume: 2,
        unitLine: 1.00
      },
      {
        date: '2023-10-16',
        time: '19时',
        orderType: '1',
        quantity: 71,
        orderCount: 366,
        demandCount: 838,
        volume: 838,
        unitLine: 5.15
      },
      {
        date: '2023-10-16',
        time: '20时',
        orderType: '1',
        quantity: 39,
        orderCount: 185,
        demandCount: 388,
        volume: 388,
        unitLine: 4.74
      },
      {
        date: '2023-10-16',
        time: '21时',
        orderType: '1',
        quantity: 1,
        orderCount: 7,
        demandCount: 12,
        volume: 12,
        unitLine: 7.00
      }
    ],
    // EI分析数据
    eiAnalysisData: [
      { id: 1, orderLines: 1, orderCount: 17, percentage: 0.016569201 },
      { id: 2, orderLines: 2, orderCount: 1, percentage: 0.000974659 },
      { id: 3, orderLines: 4, orderCount: 1, percentage: 0.000974659 },
      { id: 4, orderLines: 17, orderCount: 1, percentage: 0.000974659 },
      { id: 5, orderLines: 24, orderCount: 1, percentage: 0.000974659 },
      { id: 6, orderLines: 30, orderCount: 1, percentage: 0.000974659 },
      { id: 7, orderLines: 38, orderCount: 1, percentage: 0.000974659 },
      { id: 8, orderLines: 45, orderCount: 1, percentage: 0.000974659 },
      { id: 9, orderLines: 46, orderCount: 1, percentage: 0.000974659 },
      { id: 10, orderLines: 50, orderCount: 1, percentage: 0.000974659 }
    ]
  },
  // 2月销售订单分析数据
  2: {
    // 标题
    title: '南京2月销售订单分析',
    // 命中率数据
    hitRateData: [
      {
        dateType: '中值日',
        date: '2025-02-15',
        timeMode: '天',
        totalOrders: 2200,
        totalContainerRuns: 1050,
        orderPerHour: 22,
        containerRunsPerHour: 262,
        avgHitRate: 2.10,
        orderPerMinute: 733,
        containerRunsPerMinute: 320,
        avgHitRateMinute: 2.29
      },
      {
        dateType: '均值日',
        date: '2025-02-15',
        timeMode: '天',
        totalOrders: 2200,
        totalContainerRuns: 1050,
        orderPerHour: 550,
        containerRunsPerHour: 262,
        avgHitRate: 2.10,
        orderPerMinute: 733,
        containerRunsPerMinute: 320,
        avgHitRateMinute: 2.29
      },
      {
        dateType: '峰值日',
        date: '2025-02-16',
        timeMode: '天',
        totalOrders: 2400,
        totalContainerRuns: 1154,
        orderPerHour: 80,
        containerRunsPerHour: 288,
        avgHitRate: 2.08,
        orderPerMinute: 800,
        containerRunsPerMinute: 350,
        avgHitRateMinute: 2.29
      }
    ],
    // 订单详情数据 - 2月
    orderDetailData: [
      {
        date: '2024-09-25',
        orderType: '1',
        quantity: 60,
        orderCount: 16200,
        demandCount: 90500,
        volume: 90500,
        unitPallet: 270.00,
        unitPiece: 1508.33,
        palletToPiece: 5.59
      },
      {
        date: '2024-09-26',
        orderType: '1',
        quantity: 62,
        orderCount: 16800,
        demandCount: 93800,
        volume: 93800,
        unitPallet: 271.00,
        unitPiece: 1512.90,
        palletToPiece: 5.58
      },
      {
        date: '2024-09-27',
        orderType: '1',
        quantity: 58,
        orderCount: 15900,
        demandCount: 88900,
        volume: 88900,
        unitPallet: 274.14,
        unitPiece: 1532.76,
        palletToPiece: 5.59
      },
      {
        date: '2024-09-28',
        orderType: '1',
        quantity: 65,
        orderCount: 17500,
        demandCount: 97500,
        volume: 97500,
        unitPallet: 269.23,
        unitPiece: 1500.00,
        palletToPiece: 5.57
      },
      {
        date: '2024-09-29',
        orderType: '1',
        quantity: 67,
        orderCount: 18200,
        demandCount: 101300,
        volume: 101300,
        unitPallet: 271.64,
        unitPiece: 1511.94,
        palletToPiece: 5.57
      }
    ],
    // 每时段EIQ分析数据 - 2月
    periodEIQData: [
      {
        date: '2025-02-15',
        time: '09时',
        orderType: '1',
        quantity: 3,
        orderCount: 4,
        demandCount: 5,
        volume: 5,
        unitLine: 1.33
      },
      {
        date: '2025-02-15',
        time: '10时',
        orderType: '1',
        quantity: 12,
        orderCount: 14,
        demandCount: 24,
        volume: 24,
        unitLine: 1.17
      },
      {
        date: '2025-02-15',
        time: '11时',
        orderType: '1',
        quantity: 5,
        orderCount: 6,
        demandCount: 12,
        volume: 12,
        unitLine: 1.20
      },
      {
        date: '2025-02-15',
        time: '12时',
        orderType: '1',
        quantity: 6,
        orderCount: 8,
        demandCount: 18,
        volume: 18,
        unitLine: 1.33
      },
      {
        date: '2025-02-15',
        time: '13时',
        orderType: '1',
        quantity: 9,
        orderCount: 15,
        demandCount: 30,
        volume: 30,
        unitLine: 1.67
      }
    ],
    // EI分析数据 - 2月
    eiAnalysisData: [
      { id: 1, orderLines: 1, orderCount: 15, percentage: 0.015243902 },
      { id: 2, orderLines: 2, orderCount: 2, percentage: 0.002032520 },
      { id: 3, orderLines: 5, orderCount: 1, percentage: 0.001016260 },
      { id: 4, orderLines: 16, orderCount: 1, percentage: 0.001016260 },
      { id: 5, orderLines: 22, orderCount: 1, percentage: 0.001016260 },
      { id: 6, orderLines: 31, orderCount: 1, percentage: 0.001016260 },
      { id: 7, orderLines: 35, orderCount: 1, percentage: 0.001016260 },
      { id: 8, orderLines: 42, orderCount: 1, percentage: 0.001016260 }
    ]
  },
  // 1月销售订单分析数据
  3: {
    // 标题
    title: '南京1月销售订单分析',
    // 命中率数据
    hitRateData: [
      {
        dateType: '中值日',
        date: '2025-01-15',
        timeMode: '天',
        totalOrders: 2000,
        totalContainerRuns: 980,
        orderPerHour: 20,
        containerRunsPerHour: 245,
        avgHitRate: 2.04,
        orderPerMinute: 667,
        containerRunsPerMinute: 300,
        avgHitRateMinute: 2.22
      },
      {
        dateType: '均值日',
        date: '2025-01-15',
        timeMode: '天',
        totalOrders: 2000,
        totalContainerRuns: 980,
        orderPerHour: 500,
        containerRunsPerHour: 245,
        avgHitRate: 2.04,
        orderPerMinute: 667,
        containerRunsPerMinute: 300,
        avgHitRateMinute: 2.22
      },
      {
        dateType: '峰值日',
        date: '2025-01-16',
        timeMode: '天',
        totalOrders: 2200,
        totalContainerRuns: 1080,
        orderPerHour: 73,
        containerRunsPerHour: 270,
        avgHitRate: 2.04,
        orderPerMinute: 733,
        containerRunsPerMinute: 328,
        avgHitRateMinute: 2.24
      }
    ],
    // 订单详情数据 - 正在进行中，数据较少
    orderDetailData: [
      {
        date: '2024-08-25',
        orderType: '1',
        quantity: 55,
        orderCount: 14850,
        demandCount: 83050,
        volume: 83050,
        unitPallet: 270.00,
        unitPiece: 1510.00,
        palletToPiece: 5.59
      },
      {
        date: '2024-08-26',
        orderType: '1',
        quantity: 58,
        orderCount: 15660,
        demandCount: 87420,
        volume: 87420,
        unitPallet: 270.00,
        unitPiece: 1507.24,
        palletToPiece: 5.58
      },
      {
        date: '2024-08-27',
        orderType: '1',
        quantity: 52,
        orderCount: 14040,
        demandCount: 78000,
        volume: 78000,
        unitPallet: 270.00,
        unitPiece: 1500.00,
        palletToPiece: 5.56
      }
    ],
    // 每时段EIQ分析数据 - 1月，正在进行中
    periodEIQData: [
      {
        date: '2025-01-15',
        time: '09时',
        orderType: '1',
        quantity: 1,
        orderCount: 2,
        demandCount: 3,
        volume: 3,
        unitLine: 2.00
      },
      {
        date: '2025-01-15',
        time: '10时',
        orderType: '1',
        quantity: 8,
        orderCount: 10,
        demandCount: 18,
        volume: 18,
        unitLine: 1.25
      },
      {
        date: '2025-01-15',
        time: '11时',
        orderType: '1',
        quantity: 3,
        orderCount: 5,
        demandCount: 8,
        volume: 8,
        unitLine: 1.67
      }
    ],
    // EI分析数据 - 1月，正在进行中
    eiAnalysisData: [
      { id: 1, orderLines: 1, orderCount: 10, percentage: 0.012195122 },
      { id: 2, orderLines: 3, orderCount: 1, percentage: 0.001219512 },
      { id: 3, orderLines: 8, orderCount: 1, percentage: 0.001219512 },
      { id: 4, orderLines: 14, orderCount: 1, percentage: 0.001219512 },
      { id: 5, orderLines: 19, orderCount: 1, percentage: 0.001219512 }
    ]
  }
})

// 命中率数据
const hitRateData = reactive<HitRateDataItem[]>(recordDataMap[selectedRecordId.value].hitRateData)

// 订单详情数据
const orderDetailData = reactive<OrderDetailDataItem[]>(recordDataMap[selectedRecordId.value].orderDetailData)

// 每时段EIQ分析数据
const periodEIQData = reactive<PeriodEIQDataItem[]>(recordDataMap[selectedRecordId.value].periodEIQData)

// EI分析数据
const eiAnalysisData = reactive<EIAnalysisDataItem[]>(recordDataMap[selectedRecordId.value].eiAnalysisData)

// 图表初始化状态跟踪
const chartInitStatus = ref({
  isInitializing: false,
  pendingTab: '',
  retryCount: 0,
  maxRetries: 5
})

// 初始化图表
const initChart = () => {
  if (!chartRef.value) {
    console.error('图表容器引用不存在')
    return
  }
  
  try {
    // 根据激活的选项卡渲染不同图表
    nextTick(() => {
      renderChart()
    })
  } catch (error) {
    console.error('初始化图表时出错:', error)
  }
}

// 清理已有的图表实例
const clearCharts = () => {
  try {
    console.log('清理图表实例...');
    
    // 清理主图表
    if (myChart) {
      try {
        console.log('销毁主图表实例');
        myChart.dispose();
      } catch (e) {
        console.error('销毁主图表时出错:', e);
      } finally {
        myChart = null;
      }
    }
    
    // 清理子图表
    Object.keys(charts).forEach(key => {
      if (charts[key]) {
        try {
          console.log(`销毁图表${key}实例`);
          charts[key]?.dispose();
        } catch (e) {
          console.error(`销毁图表${key}时出错:`, e);
        } finally {
          charts[key] = null;
        }
      }
    });
  } catch (error) {
    console.error('清理图表时出现错误:', error);
  }
}

// 渲染图表
const renderChart = () => {
  try {
    // 先清理已有的图表实例
    clearCharts()
    
    console.log('正在渲染图表，当前选项卡:', activeTab.value)
    
    // 设置初始化状态
    chartInitStatus.value = {
      isInitializing: true,
      pendingTab: activeTab.value,
      retryCount: 0,
      maxRetries: 5
    }
    
    // 使用递归函数确保DOM已准备就绪
    const initChartWhenReady = () => {
      // 检查是否超过最大重试次数
      if (chartInitStatus.value.retryCount >= chartInitStatus.value.maxRetries) {
        console.error('初始化图表超过最大重试次数');
        chartInitStatus.value.isInitializing = false;
        return;
      }
      
      chartInitStatus.value.retryCount++;
      console.log(`图表初始化尝试 #${chartInitStatus.value.retryCount}`);
      
      // 使用nextTick确保DOM更新
      nextTick(() => {
        // 修改为支持多图表布局
        if (activeTab.value === 'dailyEIQ') {
          // 获取日期和数据
          const dates = orderDetailData.map(item => item.date)
          const orderCounts = orderDetailData.map(item => item.orderCount)
          const quantities = orderDetailData.map(item => item.quantity)
          const demandCounts = orderDetailData.map(item => item.demandCount)
          const unitPallets = orderDetailData.map(item => item.unitPallet)
          
          // 检查容器是否存在
          const chartContainers = [
            document.getElementById('chart1'),
            document.getElementById('chart2'),
            document.getElementById('chart3'),
            document.getElementById('chart4')
          ]
          
          // 验证容器是否全部存在且可见
          if (chartContainers.some(container => 
            !container || 
            container.offsetParent === null ||
            container.clientWidth === 0 ||
            container.clientHeight === 0
          )) {
            console.log('图表容器尚未准备好、不可见或无有效尺寸，将在稍后重试');
            setTimeout(initChartWhenReady, 200);
            return;
          }
          
          console.log('所有图表容器已准备就绪');
          
          // 创建四个图表
          charts.chart1 = echarts.init(chartContainers[0]!)
          charts.chart2 = echarts.init(chartContainers[1]!)
          charts.chart3 = echarts.init(chartContainers[2]!)
          charts.chart4 = echarts.init(chartContainers[3]!)
          
          // 图表1：订单行数趋势
          const option1: echarts.EChartsOption = {
            title: {
              text: '订单行数趋势',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: (params: any) => {
                console.log('params', params)
                return `日期: ${params.name}<br/>订单行数: ${params.data.toLocaleString()}`
              },
              backgroundColor: 'rgba(50,50,50,0.9)',
              borderWidth: 0,
              textStyle: {
                color: '#fff'
              }
            },
            xAxis: {
              type: 'category',
              data: dates,
              axisLabel: {
                rotate: 45,
                fontSize: 10
              }
            },
            yAxis: {
              type: 'value',
              name: '订单行数'
            },
            series: [
              {
                name: '订单行数',
                type: 'bar',
                data: orderCounts,
                itemStyle: {
                  color: '#5470c6'  // 蓝色
                }
              }
            ],
            grid: {
              top: 60,
              left: 50,
              right: 20,
              bottom: 60
            }
          }
          
          // 图表2：单据数量趋势
          const option2: echarts.EChartsOption = {
            title: {
              text: '单据数量趋势',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: (params: unknown) => {
                
                return `日期: ${params.name}<br/>单据数量: ${params.data.toLocaleString()}`
              },
              backgroundColor: 'rgba(50,50,50,0.9)',
              borderWidth: 0,
              textStyle: {
                color: '#fff'
              }
            },
            xAxis: {
              type: 'category',
              data: dates,
              axisLabel: {
                rotate: 45,
                fontSize: 10
              }
            },
            yAxis: {
              type: 'value',
              name: '单据数量'
            },
            series: [
              {
                name: '单据数量',
                type: 'bar',  // 改为柱状图
                data: quantities,
                itemStyle: {
                  color: '#91cc75'  // 绿色
                }
              }
            ],
            grid: {
              top: 60,
              left: 50,
              right: 20,
              bottom: 60
            }
          }
          
          // 图表3：需求数量趋势
          const option3: echarts.EChartsOption = {
            title: {
              text: '需求数量趋势',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: (params: any) => {
                return `日期: ${params.name}<br/>需求数量: ${params.data.toLocaleString()}`
              },
              backgroundColor: 'rgba(50,50,50,0.9)',
              borderWidth: 0,
              textStyle: {
                color: '#fff'
              }
            },
            xAxis: {
              type: 'category',
              data: dates,
              axisLabel: {
                rotate: 45,
                fontSize: 10
              }
            },
            yAxis: {
              type: 'value',
              name: '需求数量'
            },
            series: [
              {
                name: '需求数量',
                type: 'bar',
                data: demandCounts,
                itemStyle: {
                  color: '#fac858'  // 黄色
                }
              }
            ],
            grid: {
              top: 60,
              left: 50,
              right: 20,
              bottom: 60
            }
          }
          
          // 图表4：单均行趋势
          const option4: echarts.EChartsOption = {
            title: {
              text: '单均行趋势',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: (params: any) => {
                return `日期: ${params.name}<br/>单均行: ${params.data.toFixed(2)}`
              },
              backgroundColor: 'rgba(50,50,50,0.9)',
              borderWidth: 0,
              textStyle: {
                color: '#fff'
              }
            },
            xAxis: {
              type: 'category',
              data: dates,
              axisLabel: {
                rotate: 45,
                fontSize: 10
              }
            },
            yAxis: {
              type: 'value',
              name: '单均行'
            },
            series: [
              {
                name: '单均行',
                type: 'bar',  // 改为柱状图
                data: unitPallets,
                itemStyle: {
                  color: '#9a60b4'  // 紫色
                }
              }
            ],
            grid: {
              top: 60,
              left: 50,
              right: 20,
              bottom: 60
            }
          }
          
          try {
            // 设置图表选项
            charts.chart1?.setOption(option1)
            charts.chart2?.setOption(option2)
            charts.chart3?.setOption(option3)
            charts.chart4?.setOption(option4)
            
            // 添加延迟，确保ECharts内部结构完全更新
            setTimeout(() => {
              // 验证所有图表是否正确配置
              const chartKeys = ['chart1', 'chart2', 'chart3', 'chart4'];
              let allChartsValid = true;
              for (const key of chartKeys) {
                if (!isChartValidForResize(charts[key])) {
                  console.error(`图表${key}配置验证失败`);
                  allChartsValid = false;
                }
              }
              
              if (allChartsValid) {
                console.log('dailyEIQ 四个图表已成功初始化并验证通过');
              } else {
                console.warn('dailyEIQ 部分图表配置可能存在问题');
              }
              
              // 初始化完成
              chartInitStatus.value.isInitializing = false;
            }, 100); // 50ms延迟确保内部结构更新
          } catch (error) {
            console.error('设置图表选项时出错:', error);
            // 初始化失败
            chartInitStatus.value.isInitializing = false;
          }
        } else if (activeTab.value === 'periodEIQ') {
          // 获取时间和数据
          const times = periodEIQData.map(item => item.time)
          const orderCounts = periodEIQData.map(item => item.orderCount)
          const quantities = periodEIQData.map(item => item.quantity)
          const demandCounts = periodEIQData.map(item => item.demandCount)
          const unitLines = periodEIQData.map(item => item.unitLine)
          
          // 检查容器是否存在
          const chartContainers = [
            document.getElementById('periodChart1'),
            document.getElementById('periodChart2'),
            document.getElementById('periodChart3'),
            document.getElementById('periodChart4')
          ]
          
          // 验证容器是否全部存在且可见
          if (chartContainers.some(container => 
            !container || 
            container.offsetParent === null ||
            container.clientWidth === 0 ||
            container.clientHeight === 0
          )) {
            console.log('每时段EIQ分析的图表容器尚未准备好、不可见或无有效尺寸，将在稍后重试');
            setTimeout(initChartWhenReady, 200);
            return;
          }
          
          console.log('所有每时段EIQ分析图表容器已准备就绪');
          
          // 创建四个图表
          charts.periodChart1 = echarts.init(chartContainers[0]!)
          charts.periodChart2 = echarts.init(chartContainers[1]!)
          charts.periodChart3 = echarts.init(chartContainers[2]!)
          charts.periodChart4 = echarts.init(chartContainers[3]!)
          
          // 图表1：订单行数分布
          const option1: echarts.EChartsOption = {
            title: {
              text: '订单行数分布',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: (params: any) => {
                return `时间: ${params.name}<br/>订单行数: ${params.data.toLocaleString()}`
              },
              backgroundColor: 'rgba(50,50,50,0.9)',
              borderWidth: 0,
              textStyle: {
                color: '#fff'
              }
            },
            xAxis: {
              type: 'category',
              data: times,
              axisLabel: {
                rotate: 45,
                fontSize: 10
              }
            },
            yAxis: {
              type: 'value',
              name: '订单行数'
            },
            series: [
              {
                name: '订单行数',
                type: 'bar',
                data: orderCounts,
                itemStyle: {
                  color: '#5470c6'  // 蓝色
                }
              }
            ],
            grid: {
              top: 60,
              left: 50,
              right: 20,
              bottom: 60
            }
          }
          
          // 图表2：单据数量分布
          const option2: echarts.EChartsOption = {
            title: {
              text: '单据数量分布',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: (params: any) => {
                return `时间: ${params.name}<br/>单据数量: ${params.data.toLocaleString()}`
              },
              backgroundColor: 'rgba(50,50,50,0.9)',
              borderWidth: 0,
              textStyle: {
                color: '#fff'
              }
            },
            xAxis: {
              type: 'category',
              data: times,
              axisLabel: {
                rotate: 45,
                fontSize: 10
              }
            },
            yAxis: {
              type: 'value',
              name: '单据数量'
            },
            series: [
              {
                name: '单据数量',
                type: 'bar',
                data: quantities,
                itemStyle: {
                  color: '#ee6666'  // 粉色
                }
              }
            ],
            grid: {
              top: 60,
              left: 50,
              right: 20,
              bottom: 60
            }
          }
          
          // 图表3：需求数量分布
          const option3: echarts.EChartsOption = {
            title: {
              text: '需求数量分布',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: (params: any) => {
                return `时间: ${params.name}<br/>需求数量: ${params.data.toLocaleString()}`
              },
              backgroundColor: 'rgba(50,50,50,0.9)',
              borderWidth: 0,
              textStyle: {
                color: '#fff'
              }
            },
            xAxis: {
              type: 'category',
              data: times,
              axisLabel: {
                rotate: 45,
                fontSize: 10
              }
            },
            yAxis: {
              type: 'value',
              name: '需求数量'
            },
            series: [
              {
                name: '需求数量',
                type: 'bar',
                data: demandCounts,
                itemStyle: {
                  color: '#73c0de'  // 青色
                }
              }
            ],
            grid: {
              top: 60,
              left: 50,
              right: 20,
              bottom: 60
            }
          }
          
          // 图表4：单均行分布
          const option4: echarts.EChartsOption = {
            title: {
              text: '单均行分布',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: (params: any) => {
                return `时间: ${params.name}<br/>单均行: ${params.data.toFixed(2)}`
              },
              backgroundColor: 'rgba(50,50,50,0.9)',
              borderWidth: 0,
              textStyle: {
                color: '#fff'
              }
            },
            xAxis: {
              type: 'category',
              data: times,
              axisLabel: {
                rotate: 45,
                fontSize: 10
              }
            },
            yAxis: {
              type: 'value',
              name: '单均行'
            },
            series: [
              {
                name: '单均行',
                type: 'bar',
                data: unitLines,
                itemStyle: {
                  color: '#9a60b4'  // 紫色
                }
              }
            ],
            grid: {
              top: 60,
              left: 50,
              right: 20,
              bottom: 60
            }
          }
          
          try {
            // 设置图表选项
            charts.periodChart1?.setOption(option1)
            charts.periodChart2?.setOption(option2)
            charts.periodChart3?.setOption(option3)
            charts.periodChart4?.setOption(option4)
            
            // 添加延迟，确保ECharts内部结构完全更新
            setTimeout(() => {
              // 验证所有每时段EIQ分析图表是否正确配置
              const periodChartKeys = ['periodChart1', 'periodChart2', 'periodChart3', 'periodChart4'];
              let allPeriodChartsValid = true;
              for (const key of periodChartKeys) {
                if (!isChartValidForResize(charts[key])) {
                  console.error(`图表${key}配置验证失败`);
                  allPeriodChartsValid = false;
                }
              }
              
              if (allPeriodChartsValid) {
                console.log('periodEIQ 四个图表已成功初始化并验证通过');
              } else {
                console.warn('periodEIQ 部分图表配置可能存在问题');
              }
              
              // 初始化完成
              chartInitStatus.value.isInitializing = false;
            }, 50); // 50ms延迟确保内部结构更新
          } catch (error) {
            console.error('设置图表选项时出错:', error);
            // 初始化失败
            chartInitStatus.value.isInitializing = false;
          }
        } else {
          // 获取对应选项卡的图表容器
          const containerId = `chart-${activeTab.value}`;
          const container = document.getElementById(containerId);
          
          if (!container || 
            container.offsetParent === null ||
            container.clientWidth === 0 ||
            container.clientHeight === 0
          ) {
            console.log(`图表容器 ${containerId} 尚未准备好、不可见或无有效尺寸，将在稍后重试`);
            setTimeout(initChartWhenReady, 200);
            return;
          }
          
          console.log(`容器 ${containerId} 已准备就绪，初始化图表`);
          
          try {
            // 为其他类型的图表创建新的实例
            myChart = echarts.init(container);
            
            let option: echarts.EChartsOption;
            
            // 根据激活的选项卡设置不同的图表配置
            if (activeTab.value === 'orderTypeEIQ') {
              // 订单类型分析图表配置
              option = {
                title: {
                  text: '订单类型分析',
                  left: 'center'
                },
                tooltip: {
                  trigger: 'item'
                },
                legend: {
                  bottom: 10
                },
                series: [
                  {
                    name: '订单类型',
                    type: 'pie',
                    radius: '50%',
                    data: [
                      { value: 1048, name: '类型1' },
                      { value: 735, name: '类型2' },
                      { value: 580, name: '类型3' },
                      { value: 484, name: '类型4' },
                      { value: 300, name: '类型5' }
                    ],
                    emphasis: {
                      itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                      }
                    }
                  }
                ]
              }
            } else if (activeTab.value === 'EAnalysis') {
              // EI分析图表配置 - 修改为饼图显示订单行数分布
              
              // 定义订单行数范围
              const orderLinesRanges = [
                { min: 1, max: 20, name: '1-20' },
                { min: 21, max: 40, name: '21-40' },
                { min: 41, max: 60, name: '41-60' },
                { min: 61, max: 80, name: '61-80' },
                { min: 81, max: 100, name: '81-100' },
                { min: 101, max: 120, name: '101-120' },
                { min: 121, max: 140, name: '121-140' },
                { min: 141, max: 160, name: '141-160' },
                { min: 161, max: 180, name: '161-180' },
                { min: 181, max: 200, name: '181-200' }
              ]
              
              // 按订单行数范围统计数据
              const rangeCountMap = new Map(orderLinesRanges.map(range => [range.name, 0]))
              
              // 遍历eiAnalysisData，计算每个范围的单据数量
              eiAnalysisData.forEach(item => {
                const orderLines = item.orderLines
                const orderCount = item.orderCount
                
                for (const range of orderLinesRanges) {
                  if (orderLines >= range.min && orderLines <= range.max) {
                    rangeCountMap.set(range.name, (rangeCountMap.get(range.name) || 0) + orderCount)
                    break
                  }
                }
              })
              
              // 转换为饼图所需的数据格式
              const pieData = Array.from(rangeCountMap).map(([name, value]) => ({
                name,
                value
              }))
              
              option = {
                title: {
                  text: '订单行数与单据数量分布',
                  left: 'center'
                },
                tooltip: {
                  trigger: 'item',
                  formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                  orient: 'vertical',
                  right: 10,
                  top: 'center',
                  data: orderLinesRanges.map(range => range.name),
                  textStyle: {
                    fontSize: 12,
                    color: '#333'
                  },
                  itemGap: 12,
                  itemWidth: 16,
                  itemHeight: 10,
                  borderRadius: 2,
                  padding: 10,
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderColor: '#eee',
                  borderWidth: 1,
                  formatter: '{name}'
                },
                series: [
                  {
                    name: '单据数量',
                    type: 'pie',
                    radius: '65%',
                    center: ['50%', '45%'],
                    data: pieData,
                    emphasis: {
                      itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                      }
                    },
                    label: {
                      formatter: '{b}: {d}%'
                    }
                  }
                ],
                color: [
                  '#FF9EB5', // 粉色
                  '#8ABEF2', // 浅蓝
                  '#FDDD60', // 浅黄
                  '#73D8CF', // 浅绿
                  '#B887F5', // 紫色
                  '#FFB86E', // 橙色
                  '#D4D4D4', // 浅灰
                  '#9AC3F9', // 蓝色
                  '#66C1B8', // 青色
                  '#E4A77E'  // 棕色
                ],
                // 添加图表说明文本
                graphic: [
                  {
                    type: 'text',
                    left: 'center',
                    bottom: '0',
                    z: 100,
                    style: {
                      text: '本图表根据订单行数区间展示单据数量分布情况',
                      fill: '#666',
                      fontSize: 12
                    }
                  }
                ]
              }
            } else if (activeTab.value === 'QAnalysis') {
              // EQ分析图表配置 - 修改为饼图显示订单需求数量分布
              
              // 定义订单需求数量范围
              const orderDemandRanges = [
                { min: 0, max: 100, name: '0-100' },
                { min: 101, max: 200, name: '101-200' },
                { min: 201, max: 300, name: '201-300' },
                { min: 301, max: 400, name: '301-400' },
                { min: 401, max: 500, name: '401-500' },
                { min: 501, max: 600, name: '501-600' },
                { min: 601, max: 700, name: '601-700' },
                { min: 701, max: Infinity, name: '>700' }
              ]
              
              // 模拟数据 - 在实际场景中应从API获取
              const demandDistribution = [
                { name: '0-100', value: 20 },
                { name: '101-200', value: 120 },
                { name: '201-300', value: 220 },
                { name: '301-400', value: 150 },
                { name: '401-500', value: 80 },
                { name: '501-600', value: 30 },
                { name: '601-700', value: 10 },
                { name: '>700', value: 5 }
              ]
              
              option = {
                title: {
                  text: '订单需求数量与单据数量分布',
                  left: 'center'
                },
                tooltip: {
                  trigger: 'item',
                  formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                  orient: 'vertical',
                  right: 15,
                  top: 'center',
                  data: orderDemandRanges.map(range => range.name),
                  textStyle: {
                    fontSize: 12,
                    color: '#333'
                  },
                  itemGap: 12,
                  itemWidth: 16,
                  itemHeight: 10,
                  borderRadius: 2,
                  padding: 10,
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderColor: '#eee',
                  borderWidth: 1,
                  formatter: '{name}'
                },
                series: [
                  {
                    name: '单据数量',
                    type: 'pie',
                    radius: '65%',
                    center: ['50%', '45%'],
                    data: demandDistribution,
                    emphasis: {
                      itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                      }
                    },
                    label: {
                      formatter: '{b}: {d}%'
                    }
                  }
                ],
                color: [
                  '#FF9EB5', // 粉色
                  '#8ABEF2', // 浅蓝
                  '#FDDD60', // 浅黄
                  '#73D8CF', // 浅绿
                  '#B887F5', // 紫色
                  '#FFB86E', // 橙色
                  '#D4D4D4', // 浅灰
                  '#9AC3F9'  // 蓝色
                ],
                // 添加图表说明文本
                graphic: [
                  {
                    type: 'text',
                    left: 'center',
                    bottom: '0',
                    z: 100,
                    style: {
                      text: '本图表根据订单需求数量区间展示单据数量分布情况',
                      fill: '#666',
                      fontSize: 12
                    }
                  }
                ]
              }
            } else if (activeTab.value === 'singleProductAnalysis') {
              option = {
                title: {
                  text: '单品分析',
                  left: 'center'
                },
                tooltip: {
                  trigger: 'axis',
                  axisPointer: {
                    type: 'shadow'
                  }
                },
                legend: {
                  data: ['销售数量', '销售频次'],
                  bottom: 10
                },
                xAxis: {
                  type: 'category',
                  data: ['商品A', '商品B', '商品C', '商品D', '商品E', '商品F'],
                  axisLabel: {
                    rotate: 45,
                    interval: 0
                  }
                },
                yAxis: [
                  {
                    type: 'value',
                    name: '数量',
                    position: 'left'
                  },
                  {
                    type: 'value',
                    name: '频次',
                    position: 'right'
                  }
                ],
                series: [
                  {
                    name: '销售数量',
                    type: 'bar',
                    data: [320, 302, 301, 334, 390, 330],
                    itemStyle: {
                      color: '#5470c6'
                    }
                  },
                  {
                    name: '销售频次',
                    type: 'line',
                    yAxisIndex: 1,
                    data: [12, 15, 8, 10, 18, 11],
                    itemStyle: {
                      color: '#ee6666'
                    }
                  }
                ]
              }
            } else if (activeTab.value === 'salesMovementAnalysis') {
              option = {
                title: {
                  text: '动销分析',
                  left: 'center'
                },
                tooltip: {
                  trigger: 'item'
                },
                legend: {
                  orient: 'vertical',
                  left: 'left'
                },
                series: [
                  {
                    name: '动销情况',
                    type: 'pie',
                    radius: '50%',
                    data: [
                      { value: 65, name: '正常动销商品' },
                      { value: 20, name: '低动销商品' },
                      { value: 15, name: '滞销商品' }
                    ],
                    emphasis: {
                      itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                      }
                    }
                  }
                ]
              }
            } else if (activeTab.value === 'hitRateAnalysisConclusion') {
              const dateTypes = hitRateData.map(item => item.dateType)
              const hitRates = hitRateData.map(item => item.avgHitRate)
              
              option = {
                title: {
                  text: '命中率分析结论',
                  left: 'center'
                },
                tooltip: {
                  trigger: 'axis',
                  formatter: '{b}: {c}%'
                },
                xAxis: {
                  type: 'category',
                  data: dateTypes
                },
                yAxis: {
                  type: 'value',
                  name: '命中率(%)',
                  axisLabel: {
                    formatter: '{value}%'
                  }
                },
                series: [
                  {
                    name: '平均命中率',
                    type: 'bar',
                    data: hitRates.map(rate => (rate * 100).toFixed(2)),
                    itemStyle: {
                      color: '#5470c6'
                    },
                    label: {
                      show: true,
                      position: 'top',
                      formatter: '{c}%'
                    }
                  }
                ]
              }
            } else if (activeTab.value === 'overallHitRate') {
              option = {
                title: {
                  text: '整体命中率',
                  left: 'center'
                },
                tooltip: {
                  trigger: 'axis'
                },
                legend: {
                  data: ['上午', '下午', '晚上'],
                  bottom: 10
                },
                xAxis: {
                  type: 'category',
                  boundaryGap: false,
                  data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                },
                yAxis: {
                  type: 'value',
                  name: '命中率(%)',
                  axisLabel: {
                    formatter: '{value}%'
                  }
                },
                series: [
                  {
                    name: '上午',
                    type: 'line',
                    data: [92.1, 93.5, 91.8, 94.2, 95.1, 90.8, 89.5],
                    smooth: true
                  },
                  {
                    name: '下午',
                    type: 'line',
                    data: [88.3, 90.1, 91.5, 89.7, 92.3, 88.5, 87.2],
                    smooth: true
                  },
                  {
                    name: '晚上',
                    type: 'line',
                    data: [85.2, 86.4, 87.8, 86.5, 88.2, 84.6, 83.9],
                    smooth: true
                  }
                ]
              }
            } else if (activeTab.value === 'overallHitRateDetail') {
              option = {
                title: {
                  text: '整体命中率明细',
                  left: 'center'
                },
                tooltip: {
                  trigger: 'axis'
                },
                legend: {
                  data: ['订单数', '命中率'],
                  bottom: 10
                },
                xAxis: {
                  type: 'category',
                  data: ['09时', '10时', '11时', '12时', '13时', '14时', '15时', '16时', '17时', '18时', '19时', '20时'],
                  axisLabel: {
                    rotate: 45,
                    interval: 0
                  }
                },
                yAxis: [
                  {
                    type: 'value',
                    name: '订单数',
                    position: 'left'
                  },
                  {
                    type: 'value',
                    name: '命中率(%)',
                    position: 'right',
                    axisLabel: {
                      formatter: '{value}%'
                    }
                  }
                ],
                series: [
                  {
                    name: '订单数',
                    type: 'bar',
                    data: [120, 200, 150, 80, 70, 110, 130, 165, 145, 90, 60, 40]
                  },
                  {
                    name: '命中率',
                    type: 'line',
                    yAxisIndex: 1,
                    data: [90.2, 92.5, 91.3, 89.8, 88.5, 90.6, 92.3, 93.5, 92.8, 91.2, 89.6, 88.9]
                  }
                ]
              }
            } else if (activeTab.value === 'workstationHitRate') {
              option = {
                title: {
                  text: '工作站命中率',
                  left: 'center'
                },
                tooltip: {
                  trigger: 'axis',
                  axisPointer: {
                    type: 'shadow'
                  }
                },
                legend: {
                  data: ['命中率'],
                  bottom: 10
                },
                grid: {
                  left: '3%',
                  right: '4%',
                  bottom: '15%',
                  containLabel: true
                },
                xAxis: {
                  type: 'category',
                  data: ['工作站A', '工作站B', '工作站C', '工作站D', '工作站E', '工作站F'],
                  axisLabel: {
                    interval: 0
                  }
                },
                yAxis: {
                  type: 'value',
                  name: '命中率(%)',
                  axisLabel: {
                    formatter: '{value}%'
                  }
                },
                series: [
                  {
                    name: '命中率',
                    type: 'bar',
                    data: [95.2, 92.4, 88.7, 90.5, 94.3, 91.8],
                    itemStyle: {
                      color: function(params: unknown) {
                        // 根据值的大小设置不同的颜色
                        const value = (params as {value: number}).value;
                        if (typeof value === 'number') {
                          if (value >= 93) return '#67C23A';  // 绿色
                          if (value >= 90) return '#E6A23C';  // 黄色
                        }
                        return '#F56C6C';  // 红色
                      }
                    },
                    label: {
                      show: true,
                      position: 'top',
                      formatter: '{c}%'
                    }
                  }
                ]
              }
            } else if (activeTab.value === 'workstationHitRateDetail') {
              option = {
                title: {
                  text: '工作站命中率明细',
                  left: 'center'
                },
                tooltip: {
                  trigger: 'axis'
                },
                legend: {
                  data: ['工作站A', '工作站B', '工作站C'],
                  bottom: 10
                },
                xAxis: {
                  type: 'category',
                  data: ['09时', '10时', '11时', '12时', '13时', '14时', '15时', '16时'],
                  axisLabel: {
                    rotate: 45,
                    interval: 0
                  }
                },
                yAxis: {
                  type: 'value',
                  name: '命中率(%)',
                  axisLabel: {
                    formatter: '{value}%'
                  }
                },
                series: [
                  {
                    name: '工作站A',
                    type: 'line',
                    data: [95.2, 94.8, 96.1, 95.5, 93.2, 94.7, 96.5, 95.8],
                    smooth: true
                  },
                  {
                    name: '工作站B',
                    type: 'line',
                    data: [92.4, 93.1, 91.8, 92.7, 94.2, 93.5, 92.9, 93.8],
                    smooth: true
                  },
                  {
                    name: '工作站C',
                    type: 'line',
                    data: [88.7, 89.2, 87.5, 88.3, 90.1, 89.5, 88.9, 89.7],
                    smooth: true
                  }
                ]
              }
            } else {
              // 默认图表配置，防止option为undefined
              option = {
                title: {
                  text: '默认图表',
                  left: 'center'
                },
                tooltip: {
                  trigger: 'axis'
                },
                xAxis: {
                  type: 'category',
                  data: ['无数据']
                },
                yAxis: {
                  type: 'value'
                },
                series: [
                  {
                    type: 'bar',
                    data: [0]
                  }
                ]
              }
            }
            
            // 使用配置项设置图表
            myChart.setOption(option);
            
            // 添加延迟，确保ECharts内部结构完全更新
            setTimeout(() => {
              // 验证主图表是否正确配置
              if (isChartValidForResize(myChart)) {
                console.log(`${activeTab.value} 图表已成功初始化并验证通过`);
              } else {
                console.warn(`${activeTab.value} 图表配置可能存在问题`);
              }
              
              // 初始化完成
              chartInitStatus.value.isInitializing = false;
            }, 50); // 50ms延迟确保内部结构更新
          } catch (error) {
            console.error('设置图表选项时出错:', error);
            // 初始化失败
            chartInitStatus.value.isInitializing = false;
          }
        }
      });
    };
    
    // 开始初始化过程
    initChartWhenReady();
  } catch (error) {
    console.error('渲染图表时出错:', error);
    chartInitStatus.value.isInitializing = false;
  }
}

// 防抖resize函数，防止频繁调用
let resizeTimeout: number | null = null;
const throttledResize = (chart: echarts.ECharts, chartName: string) => {
  // 清除之前的定时器
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  
  resizeTimeout = setTimeout(() => {
    try {
      chart.resize();
      console.log(`${chartName} resize成功`);
    } catch (error) {
      console.error(`${chartName} throttled resize时出错:`, error);
      // 尝试重试一次
      setTimeout(() => {
        try {
          if (chart && typeof chart.resize === 'function') {
            chart.resize();
            console.log(`${chartName} 重试resize成功`);
          }
        } catch (retryError) {
          console.error(`${chartName} 重试resize仍然失败:`, retryError);
        }
      }, 100);
    }
  }, 16); // 约60fps的频率
}

// 验证图表是否可以安全进行resize操作
const isChartValidForResize = (chart: echarts.ECharts | null): boolean => {
  if (!chart) {
    return false;
  }
  
  try {
    // 检查图表实例是否有有效的配置
    const option = chart.getOption();
    if (!option) {
      console.warn('图表实例存在但没有有效配置');
      return false;
    }
    
    // 检查是否有series配置
    const series = option.series;
    if (!series || !Array.isArray(series) || series.length === 0) {
      console.warn('图表配置中缺少有效的series');
      return false;
    }
    
    // 检查series中是否有必要的属性
    const firstSeries = series[0];
    if (!firstSeries || typeof firstSeries.type === 'undefined') {
      console.warn('图表series配置不完整，缺少type属性');
      return false;
    }
    
    // 额外检查：确保图表实例不是处于销毁状态
    try {
      chart.getWidth();  // 这个调用会在图表被销毁时抛出异常
      chart.getHeight(); // 同上
    } catch (error) {
      console.warn('图表实例可能已被销毁或尚未完全初始化',error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('检查图表状态时出错:', error);
    return false;
  }
}

// 处理图表resize
const handleChartResize = () => {
  try {
    if (activeTab.value === 'dailyEIQ') {
      Object.keys(charts).forEach(key => {
        if (key.startsWith('chart') && charts[key] && typeof charts[key]?.resize === 'function') {
          // 使用新的图表状态验证
          if (!isChartValidForResize(charts[key])) {
            console.log(`图表${key}未完全配置，跳过本次resize`);
            return;
          }
          // 使用防抖resize函数
          throttledResize(charts[key]!, key);
        }
      });
    } else if (activeTab.value === 'periodEIQ') {
      Object.keys(charts).forEach(key => {
        if (key.startsWith('periodChart') && charts[key] && typeof charts[key]?.resize === 'function') {
          // 使用新的图表状态验证
          if (!isChartValidForResize(charts[key])) {
            console.log(`图表${key}未完全配置，跳过本次resize`);
            return;
          }
          // 使用防抖resize函数
          throttledResize(charts[key]!, key);
        }
      });
    } else {
      // 对主图表执行相同的检查
      if (myChart && typeof myChart.resize === 'function') {
        // 使用新的图表状态验证
        if (!isChartValidForResize(myChart)) {
          console.log('主图表未完全配置，跳过本次resize');
          return;
        }
        // 使用防抖resize函数
        throttledResize(myChart, '主图表');
      } else if (myChart) {
        console.warn('主图表存在但未完全初始化');
      }
    }
  } catch (error) {
    console.error('处理图表大小调整时出错:', error);
  }
}

// 导出数据
const exportData = () => {
  try {
    ElMessage.success('数据导出成功')
  } catch {
    ElMessage.error('数据导出失败')
  }
}

// 重新分析
const reAnalyze = () => {
  ElMessage.info('正在重新分析数据...')
  // 这里可以添加重新分析数据的逻辑
}

// 安全添加事件监听器（防止重复添加）
const safeAddEventListener = (event: string, handler: (event: Event) => void) => {
  // 先移除，再添加，防止重复
  window.removeEventListener(event, handler);
  window.addEventListener(event, handler);
  console.log(`已添加${event}事件监听器`);
}

// 安全移除事件监听器
const safeRemoveEventListener = (event: string, handler: (event: Event) => void) => {
  try {
    window.removeEventListener(event, handler);
    console.log(`已移除${event}事件监听器`);
  } catch (error) {
    console.error(`移除${event}事件监听器时出错:`, error);
  }
}

// 更新resize事件监听器
const updateResizeListener = () => {
  // 移除所有现有监听器
  safeRemoveEventListener('resize', handleResize);
  safeRemoveEventListener('resize', handleChartResize);
  
  // 根据当前状态添加合适的监听器
  if (viewMode.value === 'chart') {
    if (activeTab.value === 'dailyEIQ' || activeTab.value === 'periodEIQ') {
      safeAddEventListener('resize', handleChartResize);
    } else {
      safeAddEventListener('resize', handleResize);
    }
  }
}

// 监听选项卡变化
watch(activeTab, (newTab, oldTab) => {
  console.log(`选项卡从 ${oldTab} 更改为 ${newTab}`);
  // 如果当前处于图表视图，需要重新渲染图表
  if (viewMode.value === 'chart') {
    // 如果正在进行图表初始化，先等待当前初始化完成
    if (chartInitStatus.value.isInitializing) {
      console.log('上一个图表正在初始化中，等待完成后再处理新选项卡');
      // 使用setTimeout而不是立即调用，避免可能的递归问题
      const checkAndRenderNewTab = () => {
        if (chartInitStatus.value.isInitializing) {
          console.log('等待上一个图表初始化完成...');
          setTimeout(checkAndRenderNewTab, 100);
        } else {
          console.log('上一个图表初始化已完成，开始渲染新选项卡');
          handleTabChange(newTab);
        }
      };
      
      setTimeout(checkAndRenderNewTab, 100);
    } else {
      // 直接处理选项卡切换
      handleTabChange(newTab);
    }
  }
});

// 监听视图模式变化
watch(viewMode, (newMode, oldMode) => { // 让 TypeScript 自动推断参数类型
  console.log(`视图模式从 ${oldMode} 更改为 ${newMode}`);
  if (newMode === 'chart') {
    // 确保当前没有正在进行的图表初始化
    if (!chartInitStatus.value.isInitializing) {
      switchViewMode(newMode as 'table' | 'chart'); // 使用类型断言
    } else {
      console.log('有图表正在初始化中，等待完成后再切换视图模式');
      const checkAndSwitchMode = () => {
        if (chartInitStatus.value.isInitializing) {
          setTimeout(checkAndSwitchMode, 100);
        } else {
          switchViewMode(newMode as 'table' | 'chart'); // 使用类型断言
        }
      };
      setTimeout(checkAndSwitchMode, 100);
    }
  } else {
    // 切换到表格视图不需要等待图表初始化
    switchViewMode(newMode as 'table' | 'chart'); // 使用类型断言
  }
});

// 切换选项卡
const handleTabChange = (tab: string) => {
  activeTab.value = tab;
  
  if (viewMode.value === 'chart') {
    // 移除现有监听器
    safeRemoveEventListener('resize', handleResize);
    safeRemoveEventListener('resize', handleChartResize);
    
    // 添加延迟，确保切换动画完成后再渲染图表
    // 增加延迟时间，确保DOM渲染完成
    setTimeout(() => {
      try {
        renderChart();
        // 添加合适的事件监听器
        updateResizeListener();
      } catch (error) {
        console.error('选项卡切换渲染图表时出错:', error);
      }
    }, 350); // 使用更长的延迟
  }
}

// 切换视图模式（表格/图表）
const switchViewMode = (mode: 'table' | 'chart') => {
  console.log('切换视图模式:', mode);
  
  // 移除所有现有监听器
  safeRemoveEventListener('resize', handleResize);
  safeRemoveEventListener('resize', handleChartResize);
  
  if (mode === 'chart') {
    // 添加延迟，确保过渡动画完成后再初始化图表
    setTimeout(() => {
      try {
        console.log('准备初始化图表');
        initChart();
        //renderChart();
        // 添加合适的事件监听器
        updateResizeListener();
      } catch (error) {
        console.error('切换到图表视图时出错:', error);
      }
    }, 600); // 动画持续500ms，延迟600ms确保完全完成
  }
}

// 监听窗口大小变化
const handleResize = () => {
  myChart?.resize()
}

// 切换项目展开/折叠
const toggleProject = (projectName: string) => {
  if (expandedProject.value === projectName) {
    expandedProject.value = ''
    // 可以在这里添加额外逻辑，例如清除选中状态
    console.log('取消选择项目')
  } else {
    expandedProject.value = projectName
    console.log('选择项目:', projectName)
    // 可以在这里添加额外逻辑，如更新其他相关数据
  }
}

// 查看分析记录
const viewAnalysisRecord = (record: AnalysisRecord) => {
  try {
    console.log(`加载分析记录: ${record.title}, ID: ${record.id}`)
    
    // 如果记录正在处理中，显示骨架屏
    if (record.status === 'processing') {
      ElMessage({
        message: `分析记录"${record.title}"正在处理中，数据可能不完整`,
        type: 'warning'
      })
      
      // 设置选中的记录 ID
      selectedRecordId.value = record.id
      // 更新页面标题
      const headerTitleProcessing = document.querySelector('.page-header-title');
      if (headerTitleProcessing) {
        headerTitleProcessing.textContent = recordDataMap[record.id].title;
      }
      
      // 显示骨架屏
      showSkeletonScreen.value = true
      processingRecordId.value = record.id
      
      return // 不加载数据，直接返回
    } else {
      ElMessage({
        message: `已加载分析记录: ${record.title}`,
        type: 'success'
      })
      
      // 如果此前显示骨架屏，现在加载完整数据，则隐藏骨架屏
      showSkeletonScreen.value = false
      processingRecordId.value = null
    }
    
    // 更新选中的记录ID
    selectedRecordId.value = record.id
    
    // 更新页面标题和各个数据集
    const headerTitleRecord = document.querySelector('.page-header-title');
    if (headerTitleRecord) {
      headerTitleRecord.textContent = recordDataMap[record.id].title;
    }
    
    // 清空并重新填充数据数组
    hitRateData.splice(0, hitRateData.length, ...recordDataMap[record.id].hitRateData)
    orderDetailData.splice(0, orderDetailData.length, ...recordDataMap[record.id].orderDetailData)
    periodEIQData.splice(0, periodEIQData.length, ...recordDataMap[record.id].periodEIQData)
    eiAnalysisData.splice(0, eiAnalysisData.length, ...recordDataMap[record.id].eiAnalysisData)
    
    // 如果当前是图表视图，需要重新渲染图表
    if (viewMode.value === 'chart') {
      // 延迟执行，确保数据已更新
      setTimeout(() => {
        renderChart()
      }, 100)
    }
  } catch (error) {
    console.error('加载分析记录时出错:', error)
    ElMessage.error('加载分析记录时出错')
  }
}

// 删除分析记录
const deleteAnalysisRecord = (record: AnalysisRecord) => {
  ElMessageBox.confirm(
    `确定要删除分析记录"${record.title}"吗？`, 
    '提示', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 在实际项目中，这里应该调用API删除记录
    const index = analysisRecords.findIndex(item => item.id === record.id)
    if (index !== -1) {
      analysisRecords.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 新建分析任务
const createNewAnalysis = () => {
  // 设置默认值
  analysisForm.name = ''
  analysisForm.project = expandedProject.value || projectList[0].name
  analysisForm.analysisType = '1'
  analysisForm.selectedFiles = []
  
  // 显示弹窗
  showAnalysisDialog.value = true
}

// 提交分析任务
const submitAnalysis = () => {
  // 添加文件选择验证
  if (analysisForm.analysisType === '2' && analysisForm.selectedFiles.length === 0) {
    ElMessage.warning('请至少选择一个文件进行分析')
    return
  }
  
  analysisFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // 创建新的分析记录ID (简单地取最大ID + 1)
      const newId = Math.max(...analysisRecords.map(record => record.id)) + 1
      
      // 获取当前时间
      const now = new Date()
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      
      // 创建新的分析记录
      const newRecord: AnalysisRecord = {
        id: newId,
        title: analysisForm.name,
        date: dateStr,
        status: 'processing' as const, // 新创建的分析记录状态为"处理中"
        project: analysisForm.project,
        analysisType: analysisForm.analysisType,
        selectedFiles: analysisForm.analysisType === '2' ? [...analysisForm.selectedFiles] : []
      }
      
      // 添加到分析记录列表
      analysisRecords.unshift(newRecord)
      
      // 创建新记录的数据结构
      recordDataMap[newId] = {
        title: analysisForm.name,
        hitRateData: [],
        orderDetailData: [],
        periodEIQData: [],
        eiAnalysisData: []
      }
      
      // 关闭弹窗
      showAnalysisDialog.value = false
      
      // 提示用户
      ElMessage.success(`已创建新的分析任务: ${analysisForm.name}`)
      
      // 自动展开对应的项目
      expandedProject.value = analysisForm.project
    } else {
      console.log('表单验证失败');
      return false
    }
  })
}

// 取消分析
const cancelAnalysis = () => {
  showAnalysisDialog.value = false
}

// 组件挂载完成后执行
onMounted(() => {
  // 设置页面标题为当前选中记录的标题
  nextTick(() => {
    try {
      // 设置页面标题
      const headerTitleMounted = document.querySelector('.page-header-title');
      if (headerTitleMounted) {
        headerTitleMounted.textContent = recordDataMap[selectedRecordId.value].title;
      }
      
      // 如果默认显示图表，初始化图表
      if (viewMode.value === 'chart') {
        // 给予额外的时间让DOM完全渲染
        setTimeout(() => {
          initChart();
          // 使用安全的事件监听器管理
          updateResizeListener();
        }, 300);
      }
    } catch (error) {
      console.error('组件挂载初始化时出错:', error);
    }
  });
});

// 在组件销毁前清理图表和监听器
onBeforeUnmount(() => {
  try {
    // 清理图表实例
    clearCharts();
    
    // 移除所有事件监听器
    safeRemoveEventListener('resize', handleResize);
    safeRemoveEventListener('resize', handleChartResize);
  } catch (error) {
    console.error('组件卸载清理资源时出错:', error);
  }
});

// 处理日期变化
const handleDateChange = (date: Date) => {
  selectedDate.value = date
  if (viewMode.value === 'chart') {
    // 使用setTimeout确保DOM已更新
    setTimeout(() => {
      renderChart()
    }, 100)
  }
}

// 添加更多选项的子菜单映射
const moreTabsMap = {
  singleProductAnalysis: '单品分析',
  salesMovementAnalysis: '动销分析',
  hitRateAnalysisConclusion: '命中率分析结论',
  overallHitRate: '整体命中率',
  overallHitRateDetail: '整体命中率明细',
  workstationHitRate: '工作站命中率',
  workstationHitRateDetail: '工作站命中率明细'
}

// 为 moreTabsMap 的键定义类型
type MoreTabsMapKey = keyof typeof moreTabsMap;

// 判断当前选中的选项卡是否为更多子菜单中的选项
const isMoreSubmenuActive = computed(() => {
  return Object.keys(moreTabsMap).includes(activeTab.value);
})

// 新增计算属性，用于安全获取当前更多子菜单的标签
const currentMoreTabLabel = computed(() => {
  if (isMoreSubmenuActive.value) {
    // 此处 activeTab.value 理论上已经是 MoreTabsMapKey 的一种
    // 因为 isMoreSubmenuActive 的判断逻辑确保了这一点
    return moreTabsMap[activeTab.value as MoreTabsMapKey];
  }
  return ''; // 如果不是更多子菜单激活，返回空字符串或默认值
});

// 检查选项卡是否为当前激活状态
const isActiveTab = (tab: TabItem) => {
  if (tab.isDropdown) {
    // 只有当activeTab是moreTabsMap中的键（表示选中了"更多"子菜单中的某个选项）
    // 并且tab.key是'more'（确保只有"更多"选项才会显示蓝色标注）时才返回true
    return tab.key === 'more' && Object.keys(moreTabsMap).includes(activeTab.value);
  }
  return activeTab.value === tab.key;
}

// 在deleteAnalysisRecord方法之后添加新方法
// 删除项目下所有分析记录
const deleteAllAnalysisRecords = () => {
  // 检查是否选中项目
  if (!expandedProject.value) {
    ElMessage.warning('请先选择一个项目')
    return
  }

  ElMessageBox.confirm(
    `该操作将删除"${expandedProject.value}"项目下的所有分析记录，确认要删除吗？`, 
    '提示', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 计算删除前的记录数
    const beforeCount = analysisRecords.length
    
    // 过滤掉当前项目下的所有记录
    const newRecords = analysisRecords.filter(record => record.project !== expandedProject.value)
    
    // 计算删除的记录数
    const deletedCount = beforeCount - newRecords.length
    
    // 更新分析记录数组
    analysisRecords.length = 0
    analysisRecords.push(...newRecords)
    
    if (deletedCount > 0) {
      ElMessage.success(`成功删除${deletedCount}条分析记录`)
    } else {
      ElMessage.info('没有找到可删除的分析记录')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 暂停分析
const pauseAnalysis = (record: AnalysisRecord) => {
  ElMessageBox.confirm(
    `确定要暂停此分析吗？`, 
    '提示', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    try {
      console.log(`暂停分析: ${record.title}, ID: ${record.id}`)
      
      // 在实际项目中，这里应该调用API暂停分析任务
      record.status = 'paused'
      
      ElMessage({
        message: `已暂停分析任务: ${record.title}`,
        type: 'success'
      })
    } catch (error) {
      console.error('暂停分析任务时出错:', error)
      ElMessage.error('暂停分析任务失败')
    }
  }).catch(() => {
    // 用户取消操作
    console.log('用户取消暂停分析')
  })
}

// 恢复分析
const resumeAnalysis = (record: AnalysisRecord) => {
  ElMessageBox.confirm(
    `确定要继续分析吗？`, 
    '提示', 
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    try {
      console.log(`恢复分析: ${record.title}, ID: ${record.id}`)
      
      // 在实际项目中，这里应该调用API恢复分析任务
      record.status = 'processing'
      
      ElMessage({
        message: `已恢复分析任务: ${record.title}`,
        type: 'success'
      })
    } catch (error) {
      console.error('恢复分析任务时出错:', error)
      ElMessage.error('恢复分析任务失败')
    }
  }).catch(() => {
    // 用户取消操作
    console.log('用户取消恢复分析')
  })
}

// 处理记录状态按钮的点击
const handleStatusAction = (record: AnalysisRecord) => {
  if (record.status === 'processing') {
    // 处理分析中状态 - 暂停
    pauseAnalysis(record);
  } else if (record.status === 'paused') {
    // 处理暂停状态 - 恢复
    resumeAnalysis(record);
  } else {
    // 处理其他状态(completed等) - 查看
    viewAnalysisRecord(record);
  }
}

// 获取状态按钮的提示文本
const getStatusButtonTitle = (record: AnalysisRecord) => {
  if (record.status === 'processing') {
    return '暂停分析';
  } else if (record.status === 'paused') {
    return '继续分析';
  } else {
    return '查看分析';
  }
}
</script>

<template>
  <div class="analysis-container">
    <!-- 左侧边栏 -->
    <div class="sidebar">
      <!-- 项目信息 -->
      <div class="sidebar-section">
        <div class="sidebar-header">
          <span class="section-title">项目信息</span>
          <el-button type="primary" size="small" @click="createNewAnalysis">
            <el-icon><Plus /></el-icon>
            新建分析
          </el-button>
        </div>
        
        <!-- 项目列表 -->
        <div class="project-list">
          <div 
            v-for="project in projectList" 
            :key="project.id" 
            class="project-item"
            :class="{ 'active': expandedProject === project.name }"
            @click="toggleProject(project.name)"
          >
            <div class="project-header">
              <span class="project-name">{{ project.name }}</span>
              <el-icon :class="{ 'is-expanded': expandedProject === project.name }"><CaretRight /></el-icon>
            </div>
            <div class="project-details" v-if="expandedProject === project.name">
              <span>{{ project.company }} | {{ project.location }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分析记录 -->
      <div class="sidebar-section">
        <div class="sidebar-header">
          <span class="section-title">分析记录</span>
          <el-button type="text" size="small" icon="delete" class="delete-btn" @click="deleteAllAnalysisRecords">
          </el-button>
        </div>
        
        <!-- 当前选中项目 -->
        <div v-if="expandedProject" class="selected-project-info">
          当前项目: {{ expandedProject }}
        </div>
        
        <!-- 记录列表 -->
        <div class="analysis-records">
          <template v-if="filteredAnalysisRecords.length > 0">
            <div 
              v-for="record in filteredAnalysisRecords" 
              :key="record.id"
              class="record-item"
              :class="{ 'selected-record': selectedRecordId === record.id }"
              @click="viewAnalysisRecord(record)"
            >
              <div class="record-title">{{ record.title }}</div>
              <div class="record-info">
                <span class="record-date">{{ record.date }}</span>
                <div class="record-status" v-if="record.status === 'completed'">已完成</div>
                <div class="record-status processing" v-else-if="record.status === 'processing'">
                  <span class="status-icon"></span>分析中
                </div>
                <div class="record-status paused" v-else-if="record.status === 'paused'">
                  已暂停
                </div>
              </div>
              <div class="record-actions">
                <!-- 状态按钮：根据记录状态显示不同按钮和功能 -->
                <el-button 
                  type="text" 
                  @click.stop="handleStatusAction(record)"
                  :title="getStatusButtonTitle(record)"
                >
                  <el-icon v-if="record.status === 'processing'"><VideoPause /></el-icon>
                  <el-icon v-else-if="record.status === 'paused'"><CaretRight /></el-icon>
                  <el-icon v-else><View /></el-icon>
                </el-button>
                <el-button type="text" @click.stop="deleteAnalysisRecord(record)" title="删除">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          <div v-else class="empty-record-tip">
            该项目暂无分析记录
          </div>
        </div>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="page-header-title">南京3月销售订单分析</div>
        <div class="header-actions">
          <el-button type="primary" @click="reAnalyze">
            <el-icon><Refresh /></el-icon>
            重新分析
          </el-button>
          <el-button type="primary" @click="exportData">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>

      <!-- 命中率分析结论 -->
      <div class="section-card">
        <h3 class="section-title">命中率分析结论</h3>
        <!-- 骨架屏 -->
        <div v-if="showSkeletonScreen" class="skeleton-table-container">
          <div class="skeleton-message skeleton-message-small">
            <div class="skeleton-spinner skeleton-spinner-small"></div>
            <p>命中率分析正在进行中，请稍后查看结果</p>
          </div>
          <div class="skeleton-table">
            <div class="skeleton-header"></div>
            <div class="skeleton-row" v-for="i in 3" :key="i"></div>
          </div>
        </div>
        <!-- 实际表格内容 -->
        <el-table v-else :data="hitRateData" border style="width: 100%">
          <el-table-column prop="dateType" label="日期类型" width="120" fixed="left"/>
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="timeMode" label="时效模式" width="100" />
          <el-table-column prop="totalOrders" label="全天总订单行" width="120" />
          <el-table-column prop="totalContainerRuns" label="全天总容器搬运次数" width="160" />
          <el-table-column prop="orderPerHour" label="订单行/h" width="100" />
          <el-table-column prop="containerRunsPerHour" label="容器搬运次数/h" width="150" />
          <el-table-column prop="avgHitRate" label="平均命中率(行)" width="150" />
          <el-table-column prop="orderPerMinute" label="订单行/m" width="100" />
          <el-table-column prop="containerRunsPerMinute" label="容器搬运次数/m" width="150" />
          <el-table-column prop="avgHitRateMinute" label="平均命中率(分)" width="150" />
        </el-table>
      </div>

      <!-- 分析选项卡 -->
      <div class="tab-section">
        <div class="tab-header">
          <div 
            v-for="(tab, index) in [
              { key: 'dailyEIQ', label: '每日EIQ分析' },
              { key: 'periodEIQ', label: '每时段EIQ分析' },
              { key: 'orderTypeEIQ', label: '订单结构分析' },
              { key: 'EAnalysis', label: 'EI分析' },
              { key: 'QAnalysis', label: 'EQ分析' },
              { key: 'more', label: '更多', isDropdown: true }
            ]" 
            :key="index"
            :class="['tab-item', isActiveTab(tab) ? 'active' : '']"
            @click="!tab.isDropdown && handleTabChange(tab.key)"
          >
            <template v-if="!tab.isDropdown">
              {{ tab.label }}
            </template>
            <template v-else>
              <el-dropdown @command="handleTabChange">
                <span class="more-button">
                  {{ isMoreSubmenuActive ? currentMoreTabLabel : tab.label }} <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="singleProductAnalysis">
                      <el-icon><Goods /></el-icon>
                      单品分析
                    </el-dropdown-item>
                    <el-dropdown-item command="salesMovementAnalysis">
                      <el-icon><TrendCharts /></el-icon>
                      动销分析
                    </el-dropdown-item>
                    <el-dropdown-item command="hitRateAnalysisConclusion">
                      <el-icon><Aim /></el-icon>
                      命中率分析结论
                    </el-dropdown-item>
                    <el-dropdown-item command="overallHitRate">
                      <el-icon><DataLine /></el-icon>
                      整体命中率
                    </el-dropdown-item>
                    <el-dropdown-item command="overallHitRateDetail">
                      <el-icon><List /></el-icon>
                      整体命中率明细
                    </el-dropdown-item>
                    <el-dropdown-item command="workstationHitRate">
                      <el-icon><Monitor /></el-icon>
                      工作站命中率
                    </el-dropdown-item>
                    <el-dropdown-item command="workstationHitRateDetail">
                      <el-icon><Document /></el-icon>
                      工作站命中率明细
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </div>
        </div>

        <!-- 控制面板区域 - 包含日期选择器、视图切换和导出按钮 -->
        <div class="control-panel">
          
          <div class="control-panel-content">
            <template v-if="activeTab === 'periodEIQ'">
                <div class="date-picker-container" v-if=" activeTab === 'periodEIQ'">
            <span class="filter-label">选择日期：</span>
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateChange"
              style="width: 160px;"
            />
          </div>
                
              <div class="control-panel-content-item">
                <el-radio-group v-model="viewMode" @change="(mode: 'table' | 'chart') => switchViewMode(mode)" size="small">
                  <el-radio-button label="table">表格视图</el-radio-button>
                  <el-radio-button label="chart">图表视图</el-radio-button>
                </el-radio-group>
                <el-button type="primary" size="small" @click="exportData">
                  <el-icon><Download /></el-icon>
                  导出数据
                </el-button>
              </div>
            </template>
            <template v-else>
                <div class="action-buttons">
              <el-radio-group v-model="viewMode" @change="(mode: 'table' | 'chart') => switchViewMode(mode)" size="small">
                <el-radio-button label="table">表格视图</el-radio-button>
                <el-radio-button label="chart">图表视图</el-radio-button>
              </el-radio-group>
              <el-button type="primary" size="small" @click="exportData">
                <el-icon><Download /></el-icon>
                导出数据
              </el-button>
            </div>
            </template>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="tab-content">
          <!-- 使用transition组件包裹不同选项卡视图 -->
          <transition name="tab-fade" mode="out-in">
            <!-- 根据activeTab判断显示哪个选项卡内容 -->
            <div :key="activeTab" class="tab-pane">
              <!-- 使用transition组件包裹图表/表格视图切换 -->
              <transition name="fade-transform" mode="out-in">
                <!-- 表格视图 -->
                <div v-if="viewMode === 'table'" class="table-view" key="table">
                  <!-- 骨架屏 -->
                  <div v-if="showSkeletonScreen" class="skeleton-screen">
                    <div class="skeleton-message">
                      <div class="skeleton-spinner"></div>
                      <p>数据分析正在进行中，请稍后查看结果</p>
                    </div>
                    <div class="skeleton-table">
                      <div class="skeleton-header"></div>
                      <div class="skeleton-row" v-for="i in 8" :key="i"></div>
                    </div>
                  </div>
                  
                  <!-- 实际表格内容 -->
                  <template v-else>
                    <el-table v-if="activeTab === 'dailyEIQ'" :data="orderDetailData" border style="width: 100%">
                      <el-table-column prop="date" label="日期" min-width="150" fixed="left"/>
                      <el-table-column prop="orderType" label="订单类型" min-width="120" />
                      <el-table-column prop="quantity" label="单据数量" min-width="100" />
                      <el-table-column prop="orderCount" label="订单行数" min-width="100" />
                      <el-table-column prop="demandCount" label="需求数量" min-width="100" />
                      <el-table-column prop="volume" label="发货体积(cm³)" min-width="150" />
                      <el-table-column prop="unitPallet" label="单均行" min-width="100" />
                      <el-table-column prop="unitPiece" label="单均个" min-width="100" />
                      <el-table-column prop="palletToPiece" label="行均个" min-width="100" />
                    </el-table>
                    
                    <el-table v-else-if="activeTab === 'periodEIQ'" :data="periodEIQData" border style="width: 100%">
                      <el-table-column prop="date" label="日期" min-width="120" fixed="left"/>
                      <el-table-column prop="time" label="时间" min-width="100" />
                      <el-table-column prop="orderType" label="订单类型" min-width="100" />
                      <el-table-column prop="quantity" label="单据数量" min-width="100" />
                      <el-table-column prop="orderCount" label="订单行数" min-width="100" />
                      <el-table-column prop="demandCount" label="需求数量" min-width="100" />
                      <el-table-column prop="volume" label="发货体积(cm³)" min-width="150" />
                      <el-table-column prop="unitLine" label="单均行" min-width="100" />
                    </el-table>
                    
                    <!-- 单品分析 -->
                    <el-table v-else-if="activeTab === 'singleProductAnalysis'" :data="orderDetailData" border style="width: 100%">
                      <el-table-column prop="date" label="日期" min-width="120" fixed="left"/>
                      <el-table-column prop="orderType" label="商品编码" min-width="120" />
                      <el-table-column prop="quantity" label="商品名称" min-width="150" />
                      <el-table-column prop="orderCount" label="单位" min-width="80" />
                      <el-table-column prop="demandCount" label="销售数量" min-width="100" />
                      <el-table-column prop="volume" label="销售频次" min-width="100" />
                      <el-table-column prop="unitPallet" label="销售占比" min-width="100" />
                    </el-table>
                    
                    <!-- 动销分析 -->
                    <el-table v-else-if="activeTab === 'salesMovementAnalysis'" :data="orderDetailData" border style="width: 100%">
                      <el-table-column prop="date" label="日期" min-width="120" fixed="left"/>
                      <el-table-column prop="orderType" label="动销率" min-width="100" />
                      <el-table-column prop="quantity" label="动销频次" min-width="100" />
                      <el-table-column prop="orderCount" label="商品数量" min-width="100" />
                      <el-table-column prop="demandCount" label="滞销商品" min-width="100" />
                    </el-table>
                    
                    <!-- 命中率分析结论 -->
                    <el-table v-else-if="activeTab === 'hitRateAnalysisConclusion'" :data="hitRateData" border style="width: 100%">
                      <el-table-column prop="dateType" label="日期类型" min-width="120" fixed="left"/>
                      <el-table-column prop="date" label="日期" min-width="120" />
                      <el-table-column prop="timeMode" label="时效模式" min-width="100" />
                      <el-table-column prop="totalOrders" label="全天总订单行" min-width="120" />
                      <el-table-column prop="totalContainerRuns" label="全天总容器搬运次数" min-width="160" />
                      <el-table-column prop="avgHitRate" label="平均命中率" min-width="120" />
                    </el-table>
                    
                    <!-- EI分析表格 -->
                    <el-table v-else-if="activeTab === 'EAnalysis'" :data="eiAnalysisData" border style="width: 100%">
                      <el-table-column prop="id" label="编号" min-width="100" fixed="left"/>
                      <el-table-column prop="orderLines" label="订单行数" min-width="120" />
                      <el-table-column prop="orderCount" label="单据数量" min-width="120" />
                      <el-table-column prop="percentage" label="单据数量占比" min-width="150">
                        <template #default="scope">
                          {{ (scope.row.percentage * 100).toFixed(8) }}%
                        </template>
                      </el-table-column>
                    </el-table>
                    
                    <!-- EQ分析表格 -->
                    <el-table v-else-if="activeTab === 'QAnalysis'" :data="eiAnalysisData" border style="width: 100%">
                      <el-table-column prop="id" label="编号" min-width="100" fixed="left"/>
                      <el-table-column prop="orderLines" label="订单需求数量" min-width="120" />
                      <el-table-column prop="orderCount" label="单据数量" min-width="120" />
                      <el-table-column prop="percentage" label="单据数量占比" min-width="150">
                        <template #default="scope">
                          {{ (scope.row.percentage * 100).toFixed(8) }}%
                        </template>
                      </el-table-column>
                    </el-table>
                    
                    <!-- 整体命中率 -->
                    <el-table v-else-if="activeTab === 'overallHitRate'" :data="orderDetailData" border style="width: 100%">
                      <el-table-column prop="date" label="日期" min-width="120" fixed="left"/>
                      <el-table-column prop="orderType" label="时段" min-width="100" />
                      <el-table-column prop="quantity" label="任务类型" min-width="100" />
                      <el-table-column prop="orderCount" label="订单数" min-width="100" />
                      <el-table-column prop="demandCount" label="命中率" min-width="100" />
                    </el-table>
                    
                    <!-- 整体命中率明细 -->
                    <el-table v-else-if="activeTab === 'overallHitRateDetail'" :data="orderDetailData" border style="width: 100%">
                      <el-table-column prop="date" label="日期" min-width="120" fixed="left"/>
                      <el-table-column prop="orderType" label="时段" min-width="100" />
                      <el-table-column prop="quantity" label="任务类型" min-width="100" />
                      <el-table-column prop="orderCount" label="订单号" min-width="150" />
                      <el-table-column prop="demandCount" label="商品编码" min-width="120" />
                      <el-table-column prop="volume" label="商品名称" min-width="180" />
                      <el-table-column prop="unitPallet" label="命中率" min-width="100" />
                    </el-table>
                    
                    <!-- 工作站命中率 -->
                    <el-table v-else-if="activeTab === 'workstationHitRate'" :data="orderDetailData" border style="width: 100%">
                      <el-table-column prop="date" label="日期" min-width="120" fixed="left"/>
                      <el-table-column prop="orderType" label="工作站" min-width="120" />
                      <el-table-column prop="quantity" label="任务类型" min-width="100" />
                      <el-table-column prop="orderCount" label="订单数" min-width="100" />
                      <el-table-column prop="demandCount" label="命中率" min-width="100" />
                    </el-table>
                    
                    <!-- 工作站命中率明细 -->
                    <el-table v-else-if="activeTab === 'workstationHitRateDetail'" :data="orderDetailData" border style="width: 100%">
                      <el-table-column prop="date" label="日期" min-width="120" fixed="left"/>
                      <el-table-column prop="orderType" label="工作站" min-width="120" />
                      <el-table-column prop="quantity" label="任务类型" min-width="100" />
                      <el-table-column prop="orderCount" label="订单号" min-width="150" />
                      <el-table-column prop="demandCount" label="商品编码" min-width="120" />
                      <el-table-column prop="volume" label="商品名称" min-width="180" />
                      <el-table-column prop="unitPallet" label="命中率" min-width="100" />
                    </el-table>
                    
                    <el-table v-else :data="orderDetailData" border style="width: 100%">
                      <el-table-column prop="date" label="日期" min-width="150" fixed="left"/>
                      <el-table-column prop="orderType" label="订单类型" min-width="120" />
                      <el-table-column prop="quantity" label="单据数量" min-width="100" />
                      <el-table-column prop="orderCount" label="订单行数" min-width="100" />
                      <el-table-column prop="demandCount" label="需求数量" min-width="100" />
                      <el-table-column prop="volume" label="发货体积(cm³)" min-width="150" />
                      <el-table-column prop="unitPallet" label="单均行" min-width="100" />
                      <el-table-column prop="unitPiece" label="单均个" min-width="100" />
                      <el-table-column prop="palletToPiece" label="行均个" min-width="100" />
                    </el-table>
                  </template>
                </div>

                <!-- 图表视图 -->
                <div v-else class="chart-view" key="chart">
                  <!-- 骨架屏 -->
                  <div v-if="showSkeletonScreen" class="skeleton-screen">
                    <div class="skeleton-message">
                      <div class="skeleton-spinner"></div>
                      <p>数据分析正在进行中，请稍后查看结果</p>
                    </div>
                    <div class="skeleton-chart">
                      <div class="skeleton-chart-header"></div>
                      <div class="skeleton-chart-body"></div>
                    </div>
                  </div>
                  
                  <!-- 实际图表内容 -->
                  <template v-else>
                    <div v-if="activeTab === 'dailyEIQ' || activeTab === 'periodEIQ'" class="filter-info">
                      当前数据日期: {{ selectedDate ? new Date(selectedDate).toLocaleDateString() : '全部' }}
                    </div>
                    <div ref="chartRef" class="chart-container">
                      <div v-if="activeTab === 'dailyEIQ'" class="chart-grid">
                        <div class="chart-row">
                          <div id="chart1" class="chart-item"></div>
                          <div id="chart2" class="chart-item"></div>
                        </div>
                        <div class="chart-row">
                          <div id="chart3" class="chart-item"></div>
                          <div id="chart4" class="chart-item"></div>
                        </div>
                      </div>
                      <div v-else-if="activeTab === 'periodEIQ'" class="chart-grid">
                        <div class="chart-row">
                          <div id="periodChart1" class="chart-item"></div>
                          <div id="periodChart2" class="chart-item"></div>
                        </div>
                        <div class="chart-row">
                          <div id="periodChart3" class="chart-item"></div>
                          <div id="periodChart4" class="chart-item"></div>
                        </div>
                      </div>
                      <div v-else class="single-chart-container">
                        <!-- 为每个选项卡提供一个具有唯一ID的容器 -->
                        <div v-if="activeTab === 'orderTypeEIQ'" id="chart-orderTypeEIQ" class="chart-full"></div>
                        <div v-else-if="activeTab === 'EAnalysis'" id="chart-EAnalysis" class="chart-full"></div>
                        <div v-else-if="activeTab === 'QAnalysis'" id="chart-QAnalysis" class="chart-full"></div>
                        <!-- 新增选项卡的图表容器 -->
                        <div v-else-if="activeTab === 'singleProductAnalysis'" id="chart-singleProductAnalysis" class="chart-full"></div>
                        <div v-else-if="activeTab === 'salesMovementAnalysis'" id="chart-salesMovementAnalysis" class="chart-full"></div>
                        <div v-else-if="activeTab === 'hitRateAnalysisConclusion'" id="chart-hitRateAnalysisConclusion" class="chart-full"></div>
                        <div v-else-if="activeTab === 'overallHitRate'" id="chart-overallHitRate" class="chart-full"></div>
                        <div v-else-if="activeTab === 'overallHitRateDetail'" id="chart-overallHitRateDetail" class="chart-full"></div>
                        <div v-else-if="activeTab === 'workstationHitRate'" id="chart-workstationHitRate" class="chart-full"></div>
                        <div v-else-if="activeTab === 'workstationHitRateDetail'" id="chart-workstationHitRateDetail" class="chart-full"></div>
                        <div v-else id="chart-default" class="chart-full"></div>
                      </div>
                    </div>
                  </template>
                </div>
              </transition>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 新建分析弹窗 -->
  <el-dialog
    v-model="showAnalysisDialog"
    title="新建分析"
    width="600px"
    :close-on-click-modal="false"
    :show-close="true"
  >
    <el-form
      ref="analysisFormRef"
      :model="analysisForm"
      :rules="analysisDialogRules"
      label-width="80px"
      status-icon
    >
      <el-form-item label="分析名称" prop="name">
        <el-input v-model="analysisForm.name" placeholder="请输入分析名称"></el-input>
      </el-form-item>
      <el-form-item label="选择项目" prop="project">
        <el-select v-model="analysisForm.project" placeholder="请选择项目" style="width: 100%">
          <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="分析范围">
        <el-radio-group v-model="analysisForm.analysisType">
          <el-radio label="1">按项目分析（分析该项目下的所有订单数据）</el-radio>
          <el-radio label="2">选择特定文件分析</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <!-- 选择文件区域，只有当选择"选择特定文件分析"时显示 -->
  
        <div class="file-selection-container" v-if="analysisForm.analysisType === '2'">
          <div class="file-selection-header">选择文件</div>
          <div class="file-selection-list">
            <el-checkbox-group v-model="analysisForm.selectedFiles">
              <div v-for="file in fileList" :key="file.id" class="file-item">
                <el-checkbox :label="file.name">{{ file.name }}</el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </div>
     
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelAnalysis">取消</el-button>
        <el-button type="primary" @click="submitAnalysis">提交分析</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.analysis-container {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 250px;
  background-color: #f9f9f9;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 20px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.project-list {
  display: flex;
  flex-direction: column;
}

.project-item {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #303133;
  font-weight: 500;
}

.project-name {
  margin-right: 10px;
}

.project-details {
  font-size: 0.85em;
  color: #909399;
  margin-top: 5px;
  margin-left: 5px;
}

.analysis-records {
  display: flex;
  flex-direction: column;
}

.record-item {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.record-item:hover {
  background-color: #f5f7fa;
}

.record-title {
  margin-bottom: 5px;
  font-weight: 500;
  color: #303133;
}

.record-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85em;
  color: #909399;
}

.record-status {
  display: inline-block;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.85em;
  background-color: #67c23a;
  color: white;
}

.record-status.processing {
  background-color: #e6a23c;
  display: flex;
  align-items: center;
  border-radius: 12px;
  padding: 2px 8px;
  box-shadow: 0 0 5px rgba(230, 162, 60, 0.5);
  animation: pulse 2s infinite;
}

.record-status.paused {
  background-color: #909399;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(230, 162, 60, 0.7);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(230, 162, 60, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(230, 162, 60, 0);
  }
}

.status-icon {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
  margin-right: 5px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
}

.record-actions {
  margin-top: 5px;
  display: flex;
  justify-content: flex-end;
}

.record-actions .el-button {
  padding: 4px;
}

.delete-btn {
  color: #f56c6c;
}

.main-content {
  flex: 1;
  padding: 10px;
  height: 100%;
  overflow: auto;
  background-color: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.page-header-title {
  margin: 0;
  font-weight: 500;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.section-card {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  padding: 15px;
}

.section-title {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
}

.tab-section {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 5px 15px;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 15px;
}

.tab-item {
  padding: 10px 20px;
  cursor: pointer;
  position: relative;
  color: #606266;
  transition: color 0.3s ease;
}

.tab-item.active {
  color: #409eff;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #409eff;
  transform-origin: center;
  animation: tabActivate 0.3s ease-out forwards;
}

@keyframes tabActivate {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.more-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
  height: 100%;
  outline: none !important;
}

:deep(.el-dropdown) {
  outline: none !important;
}

:deep(.el-dropdown:focus) {
  outline: none !important;
}

:deep(.el-dropdown:focus-visible) {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

.selected-project-info {
  font-size: 14px;
  color: #409eff;
  padding: 5px 10px;
  margin-bottom: 10px;
  background-color: #ecf5ff;
  border-radius: 4px;
  text-align: center;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 5px 0;
  border-bottom: 1px dashed #e4e7ed;
}

.control-panel-content {
  width: 100%;
  display: flex;
    justify-content: space-between;
}

.control-panel-content-item {
    display: flex;
    justify-content: space-around;
}
.control-panel-content-item div{
    margin-right: 10px;
}

.date-picker-container {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 8px;
  font-size: 14px;
  color: #606266;
}

.action-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
    width: 100%;
}

.tab-content {
  position: relative;
  min-height: 500px;
}

.tab-pane {
  width: 100%;
  position: relative;
}

.chart-view {
  /* height: 500px; */
  position: relative;
  overflow: hidden;
}

.filter-info {
  margin-bottom: 10px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.table-view {
  overflow-x: auto;
}

.project-header .el-icon {
  transition: transform 0.3s;
}

.project-header .is-expanded {
  transform: rotate(90deg);
}

.record-status.processing {
  background-color: #e6a23c;
  display: flex;
  align-items: center;
}

.status-icon {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
  margin-right: 5px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
}

/* 修改网格布局样式 */
.chart-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 5px;
  margin-top: 10px;
  z-index: 1000;
  gap: 20px;
}

.chart-row {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 50%;
  gap: 20px;
}

.chart-item {
  width: 100%;
  height: 100%;
  min-height: 220px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 10px;
  display: block;
  z-index: 1000;
  flex: 1;
}

/* 选项卡内容切换动画 */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: all 0.4s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

视图切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.5s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 确保动画过程中容器高度保持一致并且容器始终可见 */
.chart-view, .table-view {
  min-height: 500px;
  position: relative;
}

/* 确保图表容器在动画过渡期间保持可见 */
.fade-transform-enter-active .chart-container,
.fade-transform-leave-active .chart-container,
.tab-fade-enter-active .chart-container,
.tab-fade-leave-active .chart-container {
  position: relative;
  min-height: 500px;
}

/* 添加单图表容器样式 */
.single-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-full {
  width: 100%;
  height: 500px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 10px;
}

/* 选中的记录项样式 */
.selected-record {
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
  position: relative;
}

.selected-record::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background-color: #409eff;
  animation: fadeInLeft 0.3s ease-out;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 记录项的悬停效果增强 */
.record-item:hover:not(.selected-record) {
  background-color: #f5f7fa;
  border-left: 3px solid #e6e6e6;
}

/* 对话框样式 */
.dialog-footer {
  text-align: right;
  margin-top: 15px;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

:deep(.el-radio) {
  margin-right: 20px;
  margin-bottom: 8px;
}

:deep(.el-dialog__body) {
  padding: 20px 20px 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

/* 文件选择区域样式 */
.file-selection-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 0;
  margin-top: 8px;
  width: 560px;
  margin-left: 10px;
}

.file-selection-header {
  padding: 8px 12px;
  font-weight: 500;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.file-selection-list {
  padding: 8px 12px;
  max-height: 180px;
  overflow-y: auto;
}

.file-item {
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.file-item:last-child {
  border-bottom: none;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
}

.empty-record-tip {
  padding: 20px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  background-color: #f8f8f8;
  border-radius: 4px;
  margin: 10px;
  border: 1px dashed #e0e0e0;
}

/* 视图切换按钮和导出数据按钮样式增强 */
.control-panel :deep(.el-radio-button__inner) {
  height: 33px;
  line-height: 33px;
  padding: 0 16px;
  font-size: 14px;
  box-sizing: border-box;
}

.control-panel .el-button[type="primary"][size="small"] {
  height: 33px;
  line-height: 1;
  padding: 0 16px;
  font-size: 14px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

/* 调整按钮组和导出按钮的垂直对齐 */
.control-panel .el-radio-group,
.control-panel .el-button {
  vertical-align: middle;
  height: 33px;
  font-size: 14px;
}

/* 确保图标和文本对齐 */
.control-panel .el-button .el-icon {
  margin-right: 6px;
  font-size: 16px;
}

/* 为视图切换按钮添加过渡效果 */
.control-panel :deep(.el-radio-button__inner) {
  transition: all 0.3s;
}

.control-panel :deep(.el-radio-button__original) {
  opacity: 0;
}

/* 调整tab-item中的dropdown样式 */
.tab-item .el-dropdown {
  height: 100%;
  display: flex;
  align-items: center;
}

/* 添加下拉菜单项样式，使图标与文字对齐 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 8px 16px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 10px;
  font-size: 16px;
}

.skeleton-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
  min-height: 400px;
  overflow: hidden;
}

.skeleton-message {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding: 15px 25px;
  background-color: #f0f9ff;
  border-radius: 6px;
  border-left: 4px solid #409eff;
  width: 100%;
  max-width: 600px;
}

.skeleton-message p {
  margin: 0;
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.skeleton-spinner {
  width: 28px;
  height: 28px;
  border: 4px solid rgba(64, 158, 255, 0.2);
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.skeleton-table {
  width: 100%;
  animation: pulse 1.5s infinite;
}

.skeleton-header {
  height: 50px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  margin-bottom: 15px;
  border-radius: 4px;
}

.skeleton-row {
  height: 40px;
  background: linear-gradient(90deg, #f5f5f5 25%, #e8e8e8 50%, #f5f5f5 75%);
  margin-bottom: 10px;
  border-radius: 4px;
  opacity: 0.8;
}

.skeleton-row:nth-child(even) {
  opacity: 0.6;
}

.skeleton-chart {
  width: 100%;
  height: 400px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  animation: pulse 1.5s infinite;
}

.skeleton-chart-header {
  height: 50px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  margin-bottom: 15px;
}

.skeleton-chart-body {
  height: calc(100% - 65px);
  background-color: #f9f9f9;
  position: relative;
  overflow: hidden;
}

.skeleton-chart-body::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    #f0f0f0,
    #f0f0f0 10px,
    #f5f5f5 10px,
    #f5f5f5 20px
  );
  opacity: 0.4;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.skeleton-table-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
  min-height: 200px;
  overflow: hidden;
}

.skeleton-message-small {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #f0f9ff;
  border-radius: 6px;
  border-left: 4px solid #409eff;
  width: 100%;
  max-width: 500px;
}

.skeleton-spinner-small {
  width: 22px;
  height: 22px;
  border: 3px solid rgba(64, 158, 255, 0.2);
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 15px;
}
</style>