<template>
  <div class="analysis-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h4>南京物流中心项目 - 订单分析任务配置</h4>
      <div class="header-actions">
        <el-dropdown trigger="click">
          <el-button type="primary" plain>
            <i-ep-files /> 加载模板
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>标准配送模板</el-dropdown-item>
              <el-dropdown-item>电商配送模板</el-dropdown-item>
              <el-dropdown-item>批发配送模板</el-dropdown-item>
              <el-dropdown-item>南京项目配置模板</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="primary" plain @click="showSaveTemplateDialog">
          <i-ep-document-add /> 保存为模板
        </el-button>
      </div>
    </div>

    <!-- 整体分析任务配置 -->
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <i-ep-data-analysis class="header-icon" />
          <span>整体分析任务配置</span>
        </div>
      </template>

      <div class="card-body">
        <!-- 基础参数 -->
        <div class="form-section">
          <div class="section-title">基础参数</div>
          <div class="form-row">
            <div class="form-item">
              <label for="taskName" class="form-label">任务名称</label>
              <el-input v-model="taskName" placeholder="请输入任务名称" />
            </div>
            <div class="form-item">
              <label for="taskType" class="form-label">任务类型</label>
              <el-select v-model="taskType" placeholder="选择分析类型" class="full-width">
                <el-option label="命中率分析" value="inventory" />
                <el-option label="订单EIQ分析" value="eiq" />
              </el-select>
            </div>
          </div>
        </div>

        <!-- 高级参数 -->
        <div class="advanced-toggle" @click="toggleAdvanced('generalAdvanced')">
          <el-icon :class="generalAdvancedVisible ? 'rotate-icon' : ''">
            <i-ep-arrow-right />
          </el-icon>
          <span>高级参数</span>
        </div>
        <div class="advanced-params" v-show="generalAdvancedVisible">
          <div class="form-row">
            <div class="form-item">
              <el-switch
                v-model="autoExport"
                active-text="自动导出分析结果"
                @change="toggleExportFormat"
              />
              <div class="export-format-options" v-show="autoExport">
                <label class="form-label mt-2">导出格式</label>
                <el-radio-group v-model="exportFormat">
                  <el-radio label="excel">
                    <i-ep-document class="text-success" /> Excel
                  </el-radio>
                  <el-radio label="pdf">
                    <i-ep-document class="text-danger" /> PDF
                  </el-radio>
                  <el-radio label="ppt">
                    <i-ep-document class="text-warning" /> PPT
                  </el-radio>
                </el-radio-group>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 出库订单相关参数 -->
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <i-ep-box class="header-icon" />
          <span>出库订单相关参数</span>
        </div>
      </template>

      <div class="card-body">
        <!-- 基础参数 -->
        <div class="form-section">
          <div class="section-title">基础参数</div>
          
          <!-- 订单来源 -->
          <div class="mb-4">
            <label class="form-label mb-3">订单来源（可多选）</label>
            <div class="multi-select-panel">
              <!-- 数据文件选项 -->
              <div :class="['multi-select-card', orderSourceFile ? 'active' : '']">
                <div :class="['multi-select-header', orderSourceFile ? 'active' : '']" @click="toggleMultiSelect('orderSourceFile')">
                  <el-checkbox v-model="orderSourceFile" @change="updateOrderSourceOptions" />
                  <span class="multi-select-title">数据文件</span>
                </div>
                <div class="multi-select-body" v-show="orderSourceFile">
                  <label class="form-label">选择订单文件</label>
                  <el-select 
                    v-model="selectedOrderFiles" 
                    multiple 
                    placeholder="请选择订单文件"
                    class="full-width"
                  >
                    <el-option 
                      v-for="(file, index) in orderFileList" 
                      :key="index" 
                      :label="file" 
                      :value="file" 
                    />
                  </el-select>
                </div>
              </div>
              
              <!-- 算法模拟选项 -->
              <div :class="['multi-select-card', orderSourceSim ? 'active' : '']">
                <div :class="['multi-select-header', orderSourceSim ? 'active' : '']" @click="toggleMultiSelect('orderSourceSim')">
                  <el-checkbox v-model="orderSourceSim" @change="updateOrderSourceOptions" />
                  <span class="multi-select-title">算法模拟</span>
                </div>
                <div class="multi-select-body" v-show="orderSourceSim">
                  <div class="parameter-group">
                    <div class="form-row">
                      <div class="form-item">
                        <label class="form-label">日出库订单上限</label>
                        <el-input-number v-model="dailyOrderLimit" :min="1" class="full-width" />
                        <div class="form-text">每日最大处理的订单数量</div>
                      </div>
                      <div class="form-item">
                        <label class="form-label">多品订单占比</label>
                        <el-input-number v-model="multiItemRatio" :min="1" :max="100" class="full-width">
                          <template #suffix>%</template>
                        </el-input-number>
                        <div class="form-text">多品种订单在总订单中的百分比（1-100%）</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 工作站数量 -->
          <div class="mb-4">
            <label class="form-label">工作站数量</label>
            <el-input-number v-model="workstationCount" :min="1" />
            <div class="form-text">设置系统使用的工作站数量</div>
          </div>
          
          <!-- 单工作站格口数量 -->
          <div class="mb-4">
            <label class="form-label">单工作站格口数量 <span class="required-text">必填，最多支持999个格口</span></label>
            <el-input-number v-model="slotCount" :min="1" :max="999" required />
          </div>
          
          <!-- 单品随单拣选 -->
          <div class="mb-4">
            <div class="switch-container">
              <el-switch v-model="singleItemPicking" active-text="单品随单拣选" />
              <div class="form-text">开启后，单品将随订单一起拣选</div>
            </div>
          </div>
          
          <!-- 物料热度分类 -->
          <div class="mb-4">
            <label class="form-label">物料热度分类</label>
            <el-radio-group v-model="materialHeatSource">
              <el-radio label="masterData">物料主数据</el-radio>
              <el-radio label="orderData">订单数据分析</el-radio>
            </el-radio-group>
          </div>
          
          <!-- 工作时间段 -->
          <div class="mb-4">
            <label class="form-label">工作时间段</label>
            <div class="timeline-container">
              <div class="timeline-visualization">
                <div class="hour-markers">
                  <div v-for="hour in 24" :key="hour" class="hour-marker">
                    <span>{{ hour - 1 }}:00</span>
                  </div>
                </div>
                <!-- 可视化时间段 -->
                <div class="time-segment-visual" style="left: 0%; width: 100%;"></div>
              </div>
              
              <div class="time-segments">
                <div v-for="(segment, index) in workingTimeSegments" :key="'work-'+index" class="time-segment">
                  <span>时段{{ index + 1 }}：</span>
                  <el-time-picker 
                    v-model="segment.start" 
                    format="HH:mm"
                    placeholder="开始时间"
                    @change="updateTimeVisualization('working')" 
                  />
                  <span>-</span>
                  <el-time-picker 
                    v-model="segment.end" 
                    format="HH:mm"
                    placeholder="结束时间"
                    @change="updateTimeVisualization('working')" 
                  />
                  <el-button 
                    type="danger" 
                    circle 
                    plain 
                    size="small"
                    @click="removeTimeSegment(index, 'working')"
                  >
                    <el-icon><DeleteIcon /></el-icon>
                  </el-button>
                </div>
              </div>
              <el-button type="primary" plain size="small" class="mt-2" @click="addTimeSegment('working')">
                <el-icon><PlusIcon /></el-icon> 添加工作时段
              </el-button>
            </div>
          </div>
          
          <!-- 订单截单时间 -->
          <div class="mb-4">
            <label class="form-label">订单截单时间</label>
            <div class="timeline-container">
              <div class="timeline-visualization">
                <div class="hour-markers">
                  <div v-for="hour in 24" :key="hour" class="hour-marker">
                    <span>{{ hour - 1 }}:00</span>
                  </div>
                </div>
                <!-- 可视化时间点 -->
                <div id="cutoffTimeVisual"></div>
              </div>
              
              <div class="time-segments">
                <div v-for="(time, index) in cutoffTimes" :key="'cutoff-'+index" class="time-segment">
                  <span>时间点{{ index + 1 }}：</span>
                  <el-time-picker 
                    v-model="time.time" 
                    format="HH:mm"
                    placeholder="截单时间"
                    @change="updateCutoffTimeVisualization" 
                  />
                  <el-button 
                    type="danger" 
                    circle 
                    plain 
                    size="small"
                    @click="removeCutoffTime(index)"
                  >
                    <el-icon><DeleteIcon /></el-icon>
                  </el-button>
                </div>
              </div>
              <el-button type="primary" plain size="small" class="mt-2" @click="addCutoffTime">
                <el-icon><PlusIcon /></el-icon> 添加截单时间点
              </el-button>
            </div>
          </div>
          
          <!-- 推单时间段 -->
          <div class="mb-4">
            <label class="form-label">推单时间段</label>
            <div class="timeline-container">
              <div class="timeline-visualization">
                <div class="hour-markers">
                  <div v-for="hour in 24" :key="hour" class="hour-marker">
                    <span>{{ hour - 1 }}:00</span>
                  </div>
                </div>
                <!-- 可视化时间段 -->
                <div class="time-segment-visual" style="left: 0%; width: 100%;"></div>
              </div>
              
              <div class="time-segments">
                <div v-for="(segment, index) in pushTimeSegments" :key="'push-'+index" class="time-segment">
                  <span>时段{{ index + 1 }}：</span>
                  <el-time-picker 
                    v-model="segment.start" 
                    format="HH:mm"
                    placeholder="开始时间"
                    @change="updateTimeVisualization('push')" 
                  />
                  <span>-</span>
                  <el-time-picker 
                    v-model="segment.end" 
                    format="HH:mm"
                    placeholder="结束时间"
                    @change="updateTimeVisualization('push')" 
                  />
                  <el-button 
                    type="danger" 
                    circle 
                    plain 
                    size="small"
                    @click="removeTimeSegment(index, 'push')"
                  >
                    <el-icon><DeleteIcon /></el-icon>
                  </el-button>
                </div>
              </div>
              <el-button type="primary" plain size="small" class="mt-2" @click="addTimeSegment('push')">
                <el-icon><PlusIcon /></el-icon> 添加推单时段
              </el-button>
            </div>
          </div>
        </div>

        <!-- 高级参数 -->
        <div class="advanced-toggle" @click="toggleAdvanced('outboundAdvanced')">
          <el-icon :class="outboundAdvancedVisible ? 'rotate-icon' : ''">
            <i-ep-arrow-right />
          </el-icon>
          <span>高级参数</span>
        </div>
        <div class="advanced-params" v-show="outboundAdvancedVisible">
          <!-- 考虑物料体积 -->
          <div class="mb-4">
            <div class="switch-container">
              <el-switch v-model="considerVolume" active-text="考虑物料体积" />
              <div class="form-text">开启后，将在分析中考虑物料体积因素</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 库存记录相关参数 -->
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <i-ep-box class="header-icon" />
          <span>库存记录相关参数</span>
        </div>
      </template>

      <div class="card-body">
        <!-- 基础参数 -->
        <div class="form-section">
          <div class="section-title">基础参数</div>
          
          <!-- 库存来源 -->
          <div class="mb-4">
            <label class="form-label mb-3">库存来源（可多选）</label>
            <div class="multi-select-panel">
              <!-- 数据文件选项 -->
              <div :class="['multi-select-card', inventorySourceFile ? 'active' : '']">
                <div :class="['multi-select-header', inventorySourceFile ? 'active' : '']" @click="toggleMultiSelect('inventorySourceFile')">
                  <el-checkbox v-model="inventorySourceFile" @change="updateInventorySourceOptions" />
                  <span class="multi-select-title">数据文件</span>
                </div>
                <div class="multi-select-body" v-show="inventorySourceFile">
                  <label class="form-label">选择库存文件</label>
                  <el-select 
                    v-model="inventoryFileList" 
                    placeholder="请选择库存文件"
                    class="full-width"
                  >
                    <el-option label="库存列表1.excel" value="库存列表1.excel" />
                    <el-option label="库存列表2.excel" value="库存列表2.excel" />
                    <el-option label="历史库存列表.excel" value="历史库存列表.excel" />
                  </el-select>
                </div>
              </div>
              
              <!-- 算法模拟选项 -->
              <div :class="['multi-select-card', inventorySourceSim ? 'active' : '']">
                <div :class="['multi-select-header', inventorySourceSim ? 'active' : '']" @click="toggleMultiSelect('inventorySourceSim')">
                  <el-checkbox v-model="inventorySourceSim" @change="updateInventorySourceOptions" />
                  <span class="multi-select-title">算法模拟</span>
                </div>
                <div class="multi-select-body" v-show="inventorySourceSim">
                  <div class="parameter-group">
                    <div class="form-row">
                      <div class="form-item">
                        <label class="form-label">在库SKU数量</label>
                        <el-input-number v-model="skuCount" :min="1" class="full-width" />
                        <div class="form-text">设置系统中的SKU总数量</div>
                      </div>
                      <div class="form-item">
                        <label class="form-label">箱规（单位：个）</label>
                        <el-input-number v-model="containerCapacity" :min="1" :max="999999" class="full-width" />
                        <div class="form-text">单个容器的最大容量</div>
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-item">
                        <label class="form-label">容器混放SKU上限</label>
                        <el-input-number v-model="skuMixMax" :min="1" :max="999" class="full-width" />
                        <div class="form-text">单个容器中最多的SKU数量</div>
                      </div>
                      <div class="form-item">
                        <label class="form-label">容器混放SKU下限</label>
                        <el-input-number v-model="skuMixMin" :min="1" :max="999" class="full-width" />
                        <div class="form-text">单个容器中最少的SKU数量</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 底部按钮 -->
    <div class="footer-buttons">
      <el-button>
        <el-icon><i-ep-close /></el-icon> 取消
      </el-button>
      <div>
        <el-button type="primary" plain class="me-2">
          <el-icon><i-ep-document-save /></el-icon> 保存配置
        </el-button>
        <el-button type="primary" @click="submitTask">
          <el-icon><i-ep-video-play /></el-icon> 提交任务
        </el-button>
      </div>
    </div>

    <!-- 保存模板对话框 -->
    <el-dialog
      v-model="saveTemplateVisible"
      title="保存为配置模板"
      width="500px"
    >
      <el-form>
        <el-form-item label="模板名称">
          <el-input v-model="templateName" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板描述 (选填)">
          <el-input
            v-model="templateDesc"
            type="textarea"
            :rows="3"
            placeholder="简要描述该模板的用途或特点"
          />
        </el-form-item>
        <div class="dialog-tip">
          <el-icon><i-ep-info-filled /></el-icon> 保存后，配置方案将被保存并可在下次导入时使用。
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="saveTemplateVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTemplate">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Delete as DeleteIcon, Plus as PlusIcon} from '@element-plus/icons-vue';

// 创建router实例
const router = useRouter()

// 基本配置
const taskName = ref('南京物流中心项目 - 订单分析任务')
const taskType = ref('inventory') // 'inventory' - 命中率分析, 'eiq' - 订单EIQ分析

// 高级参数控制
const generalAdvancedVisible = ref(false)
const outboundAdvancedVisible = ref(false)
const autoExport = ref(false)
const exportFormat = ref('excel')

// 订单来源
const orderSourceFile = ref(true)
const orderSourceSim = ref(false)
const orderFileList = ref([
  '南京物流中心2025年3月订单数据.excel',
  '南京物流中心2025年2月订单数据.excel',
  '南京物流中心2025年1月订单数据.excel',
  '南京物流中心2024年12月订单数据.excel',
  '南京物流中心2024年11月订单数据.excel',
  '南京物流中心2024年10月订单数据.excel',
  '南京物流中心2024年9月订单数据.excel',
  '南京物流中心2024年8月订单数据.excel'
])
const selectedOrderFiles = ref(['南京物流中心2025年3月订单数据.excel'])

// 出库订单算法模拟参数
const dailyOrderLimit = ref(100)
const multiItemRatio = ref(30)
const workstationCount = ref(1)
const slotCount = ref(1)
const singleItemPicking = ref(false)
const materialHeatSource = ref('masterData')
const considerVolume = ref(false)

// 工作时间段
const workingTimeSegments = ref([
  { start: new Date(2023, 0, 1, 0, 0), end: new Date(2023, 0, 1, 23, 59) }
])

// 截单时间
const cutoffTimes = ref([
  { time: new Date(2023, 0, 1, 12, 0) }
])

// 推单时间段
const pushTimeSegments = ref([
  { start: new Date(2023, 0, 1, 0, 0), end: new Date(2023, 0, 1, 23, 59) }
])

// 库存来源
const inventorySourceFile = ref(false)
const inventorySourceSim = ref(true)
const inventoryFileList = ref('')

// 库存算法模拟参数
const skuCount = ref(1000)
const containerCapacity = ref(100)
const skuMixMax = ref(10)
const skuMixMin = ref(1)
const skuMixAvg = ref(5)
const inventoryDepth = ref('1')

// 模板保存
const saveTemplateVisible = ref(false)
const templateName = ref('')
const templateDesc = ref('')

// 方法 - 提交任务并跳转到结果页面
const submitTask = () => {
  // 这里可以添加任务提交相关逻辑
  router.push('/analysis-result')
}

// 方法 - 高级参数展开/折叠
const toggleAdvanced = (section: string) => {
  if (section === 'generalAdvanced') {
    generalAdvancedVisible.value = !generalAdvancedVisible.value
  } else if (section === 'outboundAdvanced') {
    outboundAdvancedVisible.value = !outboundAdvancedVisible.value
  }
}

// 方法 - 切换导出格式选项显示
const toggleExportFormat = () => {
  // 自动处理由el-switch触发
}

// 方法 - 切换多选卡片
const toggleMultiSelect = (optionId: string) => {
  if (optionId === 'orderSourceFile') {
    orderSourceFile.value = !orderSourceFile.value
    updateOrderSourceOptions()
  } else if (optionId === 'orderSourceSim') {
    orderSourceSim.value = !orderSourceSim.value
    updateOrderSourceOptions()
  } else if (optionId === 'inventorySourceFile') {
    inventorySourceFile.value = !inventorySourceFile.value
    updateInventorySourceOptions()
  } else if (optionId === 'inventorySourceSim') {
    inventorySourceSim.value = !inventorySourceSim.value
    updateInventorySourceOptions()
  }
}

// 方法 - 更新订单来源选项
const updateOrderSourceOptions = () => {
  // 确保至少选择一个选项
  if (!orderSourceFile.value && !orderSourceSim.value) {
    orderSourceFile.value = true
  }
}

// 方法 - 更新库存来源选项
const updateInventorySourceOptions = () => {
  // 确保至少选择一个选项
  if (!inventorySourceFile.value && !inventorySourceSim.value) {
    inventorySourceSim.value = true
  }
}

// 方法 - 添加时间段
const addTimeSegment = (timeType: string) => {
  const newSegment = { 
    start: new Date(2023, 0, 1, 8, 0), 
    end: new Date(2023, 0, 1, 17, 0) 
  }
  
  if (timeType === 'working') {
    workingTimeSegments.value.push(newSegment)
    updateTimeVisualization('working')
  } else if (timeType === 'push') {
    pushTimeSegments.value.push(newSegment)
    updateTimeVisualization('push')
  }
}

// 方法 - 删除时间段
const removeTimeSegment = (index: number, timeType: string) => {
  if (timeType === 'working' && workingTimeSegments.value.length > 1) {
    workingTimeSegments.value.splice(index, 1)
    updateTimeVisualization('working')
  } else if (timeType === 'push' && pushTimeSegments.value.length > 1) {
    pushTimeSegments.value.splice(index, 1)
    updateTimeVisualization('push')
  }
}

// 方法 - 添加截单时间点
const addCutoffTime = () => {
  cutoffTimes.value.push({ time: new Date(2023, 0, 1, 16, 0) })
  updateCutoffTimeVisualization()
}

// 方法 - 删除截单时间点
const removeCutoffTime = (index: number) => {
  if (cutoffTimes.value.length > 1) {
    cutoffTimes.value.splice(index, 1)
    updateCutoffTimeVisualization()
  }
}

// 方法 - 更新截单时间点可视化
const updateCutoffTimeVisualization = () => {
  // 实现在Vue组件中通常使用DOM操作或专门的可视化库
  // 这里是简化版的实现
  const visualContainer = document.getElementById('cutoffTimeVisual')
  if (!visualContainer) return
  
  // 清除现有的可视化
  visualContainer.innerHTML = ''
  
  // 处理每个时间点
  cutoffTimes.value.forEach((timeObj) => {
    if (!timeObj.time) return
    
    // 转换时间为分钟数
    const hours = timeObj.time.getHours()
    const minutes = timeObj.time.getMinutes()
    const totalMinutes = hours * 60 + minutes
    
    // 计算位置百分比
    const positionPercent = (totalMinutes / (24 * 60)) * 100
    
    // 创建可视化元素
    const visualElement = document.createElement('div')
    visualElement.style.position = 'absolute'
    visualElement.style.height = '30px'
    visualElement.style.width = '4px'
    visualElement.style.backgroundColor = '#dc3545'
    visualElement.style.left = `${positionPercent}%`
    visualElement.style.top = '10px'
    visualElement.style.borderRadius = '2px'
    
    visualContainer.appendChild(visualElement)
  })
}

// 方法 - 更新时间轴可视化
const updateTimeVisualization = (timeType: string) => {
  // 简化处理不同类型的时间轴可视化
  // 此处使用timeType参数用于区分不同的时间轴类型
  console.log(`更新${timeType}时间轴可视化`);
  // 在实际应用中可能需要更复杂的可视化实现
}

// 方法 - 显示保存模板对话框
const showSaveTemplateDialog = () => {
  saveTemplateVisible.value = true
}

// 方法 - 保存模板
const saveTemplate = () => {
  if (!templateName.value) {
    // 显示错误提示
    return
  }
  
  // 模拟保存操作
  alert(`配置模板"${templateName.value}"保存成功！`)
  saveTemplateVisible.value = false
  
  // 清空表单
  templateName.value = ''
  templateDesc.value = ''
}

// 初始化
onMounted(() => {
  updateOrderSourceOptions()
  updateInventorySourceOptions()
  updateTimeVisualization('working')
  updateTimeVisualization('push')
  updateCutoffTimeVisualization()
  
  // 模拟使用skuMixAvg和inventoryDepth进行初始化设置
  console.log(`初始化容器混放SKU均值: ${skuMixAvg.value}`)
  console.log(`初始化库存深度: ${inventoryDepth.value}`)
})
</script>

<style scoped lang="scss">
.analysis-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

// 顶部导航栏
.top-bar {
  background-color: #fff;
  border-bottom: 1px solid #dee2e6;
  padding: 10px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.system-title {
  font-weight: 600;
  color: #0d6efd;
  font-size: 1.1rem;
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h4 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  .header-actions {
    display: flex;
    gap: 10px;
  }
}

// 卡片样式
.config-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px 20px;
    border-bottom: 1px solid rgba(0,0,0,.1);
    
    span {
      font-size: 16px;
      font-weight: 600;
      color: #0d6efd;
    }
    
    .header-icon {
      color: #0d6efd;
    }
  }
  
  .card-body {
    padding: 20px;
  }
}

// 表单部分
.form-section {
  margin-bottom: 25px;
  
  .section-title {
    font-weight: 600;
    margin-bottom: 15px;
    color: #495057;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    border-bottom: 1px solid #e9ecef;
    font-size: 16px;
  }
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  
  .form-item {
    flex: 1;
  }
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.form-text {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 5px;
}

.required-text {
  color: #dc3545;
  font-size: 0.875rem;
  margin-left: 8px;
}

.full-width {
  width: 100%;
}

// 高级参数区域
.advanced-toggle {
  cursor: pointer;
  color: #0d6efd;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 8px 0;
  margin-bottom: 8px;
  
  &:hover {
    color: #0a58ca;
  }
  
  .rotate-icon {
    transform: rotate(90deg);
  }
}

.advanced-params {
  background-color: #f8f9fa;
  border-left: 3px solid #0d6efd;
  padding: 20px;
  margin-top: 10px;
  margin-bottom: 20px;
  border-radius: 0 10px 10px 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

// 多选卡片样式
.multi-select-panel {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.multi-select-card {
  flex: 1;
  min-width: 300px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #dee2e6;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
  
  &.active {
    border-color: #0d6efd;
    box-shadow: 0 0 0 1px #0d6efd, 0 4px 12px rgba(13, 110, 253, 0.15);
  }
}

.multi-select-header {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  cursor: pointer;
  
  &.active {
    background-color: #e7f1ff;
    border-bottom-color: #b8daff;
  }
}

.multi-select-title {
  font-weight: 600;
  margin-left: 10px;
  color: #495057;
}

.multi-select-body {
  padding: 15px;
}

// 参数组
.parameter-group {
  padding: 18px;
  background-color: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

// 时间轴相关样式
.timeline-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #dee2e6;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.timeline-visualization {
  position: relative;
  height: 50px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid #dee2e6;
}

.hour-markers {
  display: flex;
  position: absolute;
  width: 100%;
  height: 100%;
}

.hour-marker {
  flex: 1;
  position: relative;
  border-right: 1px dashed #ced4da;
  
  &:last-child {
    border-right: none;
  }
  
  span {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    color: #6c757d;
  }
}

.time-segment-visual {
  height: 20px;
  background-color: rgba(13, 110, 253, 0.2);
  position: absolute;
  border-radius: 4px;
  top: 15px;
  z-index: 1;
}

.time-segments {
  margin-top: 25px;
}

.time-segment {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 12px 15px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #edf7ff;
    border-color: #a8caff;
  }
}

// 底部按钮区域
.footer-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding: 20px 0;
  
  .btn {
    min-width: 120px;
  }
}

// 开关容器
.switch-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

// 对话框样式
.dialog-tip {
  color: #6c757d;
  font-size: 14px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

// 工具类
.mb-4 {
  margin-bottom: 24px;
}

.mt-2 {
  margin-top: 12px;
}

.me-2 {
  margin-right: 12px;
}

.me-3 {
  margin-right: 16px;
}

// 修复flex布局
.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.align-items-center {
  align-items: center;
}

.text-success {
  color: #28a745;
}

.text-danger {
  color: #dc3545;
}

.text-warning {
  color: #ffc107;
}
</style> 