<template>
  <div class="analysis-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h4>{{ projectName }} - 订单分析任务配置</h4>
      <div class="header-actions">
        <el-dropdown trigger="click">
          <el-button type="primary" plain>
            <el-icon><Document /></el-icon> 加载模板 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>标准配送模板</el-dropdown-item>
              <el-dropdown-item>电商配送模板</el-dropdown-item>
              <el-dropdown-item>批发配送模板</el-dropdown-item>
              <el-dropdown-item>{{ projectName }}配置模板</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="primary" plain @click="showSaveTemplateDialog">
            <el-icon><Folder /></el-icon> 保存为模板
        </el-button>
      </div>
    </div>

    <!-- 整体分析任务配置 -->
    <el-card class="config-card config-card--primary">
      <template #header>
        <div class="card-header">
            <el-icon class="header-icon"><Tickets /></el-icon>
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
              <el-input 
                v-model="taskName" 
                placeholder="请输入任务名称" 
                :class="{'task-name--eiq': taskType === 'eiq', 'task-name--inventory': taskType === 'inventory'}"
              />
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
          <el-icon :class="generalAdvancedVisible ? 'rotate-icon' : ''"><CaretRight /></el-icon>
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
    <el-card class="config-card config-card--primary">
      <template #header>
        <div class="card-header">
            <el-icon class="header-icon"><Management /></el-icon>
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
                  <el-checkbox v-model="orderSourceFile" @change="() => toggleMultiSelect('orderSourceFile')" />
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
                  <el-checkbox v-model="orderSourceSim" @change="() => toggleMultiSelect('orderSourceSim')" />
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
                    <div class="form-row">
                      <div class="form-item">
                        <label class="form-label">多品行单比(行：单)</label>
                        <div class="ratio-input-group">
                          <!-- <span > =</span> -->
                          <el-input-number v-model="lineRatio" :min="1"   />
                          <span>:</span>
                          <el-input-number v-model="orderRatio" :min="1" />
                        </div>
                        <div class="form-text">多品订单中行数与订单数的比例</div>
                      </div>
                      <div class="form-item">
                        <label class="form-label">SKU种类调整模式</label>
                        <el-radio-group v-model="skuAdjustMode" class="sku-adjust-mode">
                          <el-radio label="unchanged">不变</el-radio>
                          <el-radio label="increase">同比增长SKU种类</el-radio>
                        </el-radio-group>
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
                <!-- 可视化时间段容器 -->
                <div class="time-segment-visual" id="working-time-visual"></div>
              </div>
              
              <div class="time-segments">
                <div v-for="(segment, index) in workingTimeSegments" :key="'work-'+index" class="time-segment">
                  <span>时段{{ index + 1 }}：</span>
                  <el-time-picker 
                    v-model="segment.start" 
                    format="HH:mm"
                    placeholder="开始时间"
                    @change="() => updateTimeVisualization('working')" 
                  />
                  <span>-</span>
                  <el-time-picker 
                    v-model="segment.end" 
                    format="HH:mm"
                    placeholder="结束时间"
                    @change="() => updateTimeVisualization('working')" 
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
          
          <!-- 休息时间段 -->
          <div class="mb-4">
            <label class="form-label">休息时间段</label>
            <div class="timeline-container">
              <div class="timeline-visualization">
                <div class="hour-markers">
                  <div v-for="hour in 24" :key="hour" class="hour-marker">
                    <span>{{ hour - 1 }}:00</span>
                  </div>
                </div>
                <!-- 可视化时间段容器 -->
                <div class="time-segment-visual" id="break-time-visual"></div>
              </div>
              
              <div class="time-segments">
                <div v-for="(segment, index) in breakTimeSegments" :key="'break-'+index" class="time-segment">
                  <span>时段{{ index + 1 }}：</span>
                  <el-time-picker 
                    v-model="segment.start" 
                    format="HH:mm"
                    placeholder="开始时间"
                    @change="() => updateTimeVisualization('break')" 
                  />
                  <span>-</span>
                  <el-time-picker 
                    v-model="segment.end" 
                    format="HH:mm"
                    placeholder="结束时间"
                    @change="() => updateTimeVisualization('break')" 
                  />
                  <el-button 
                    type="danger" 
                    circle 
                    plain 
                    size="small"
                    @click="removeTimeSegment(index, 'break')"
                  >
                    <el-icon><DeleteIcon /></el-icon>
                  </el-button>
                </div>
              </div>
              <el-button type="primary" plain size="small" class="mt-2" @click="addTimeSegment('break')">
                <el-icon><PlusIcon /></el-icon> 添加休息时段
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
                <!-- 可视化时间点容器 -->
                <div id="cutoffTimeVisual" class="cutoff-time-visual"></div>
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
                <!-- 可视化时间段容器 -->
                <div class="time-segment-visual" id="push-time-visual"></div>
              </div>
              
              <div class="time-segments">
                <div v-for="(segment, index) in pushTimeSegments" :key="'push-'+index" class="time-segment">
                  <span>时段{{ index + 1 }}：</span>
                  <el-time-picker 
                    v-model="segment.start" 
                    format="HH:mm"
                    placeholder="开始时间"
                    @change="() => updateTimeVisualization('push')" 
                  />
                  <span>-</span>
                  <el-time-picker 
                    v-model="segment.end" 
                    format="HH:mm"
                    placeholder="结束时间"
                    @change="() => updateTimeVisualization('push')" 
                  />
                  <span class="form-label-push">推单数量：</span>
                  <el-input v-model="segment.pushOrderCount"  class="form-item" clearable="true" />
                  <el-button 
                    class="segment-btn-delete"
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
          <el-icon :class="outboundAdvancedVisible ? 'rotate-icon' : ''"><CaretRight /></el-icon>
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
    <el-card class="config-card config-card--primary">
      <template #header>
        <div class="card-header">
            <el-icon class="header-icon"><Shop /></el-icon>
          <!-- <el-icon class="header-icon"><i-ep-box /></el-icon> -->
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
                  <el-checkbox v-model="inventorySourceFile" @change="() => toggleMultiSelect('inventorySourceFile')" />
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
                  <el-checkbox v-model="inventorySourceSim" @change="() => toggleMultiSelect('inventorySourceSim')" />
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
                      <div class="form-item">
                        <label class="form-label">容器混放SKU均值</label>
                        <el-input-number v-model="skuMixAvg" :min="1" :max="999" class="full-width" />
                        <div class="form-text">单个容器中平均的SKU数量</div>
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-item">
                        <label class="form-label">库存深度</label>
                        <el-input v-model="inventoryDepth" placeholder="以逗号分隔，最长10位，默认值为1" class="full-width" />
                        <div class="form-text">以逗号分隔，最长10位，默认值为1</div>
                      </div>
                      <div class="form-item">
                      <label class="form-label">物料热度分类</label>
                      <el-radio-group v-model="materialHeatSource">
                        <el-radio label="masterData">物料主数据</el-radio>
                        <el-radio label="orderData">订单数据分析</el-radio>
                      </el-radio-group>
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
        <el-icon><CloseBold /></el-icon> 取消
      </el-button>
      <div>
        <el-button type="primary" plain class="me-2">
            <el-icon><Folder /></el-icon> 保存配置
        </el-button>
        <el-button type="primary" @click="submitTask">
            <el-icon><CaretRight /></el-icon> 提交任务
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
            <el-icon><InfoFilled /></el-icon> 保存后，配置方案将被保存并可在下次导入时使用。
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
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Delete as DeleteIcon, Plus as PlusIcon, ArrowDown } from '@element-plus/icons-vue';
import { useProjectStore } from '../stores/project'

// 创建router实例
const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()

// 组件内变量定义
const projectId = ref<number | null>(null)
const projectName = ref('')
const fileType = ref('')

// 基本配置
const taskName = ref('')  // 将在onMounted中根据projectName设置
const taskType = ref('inventory') // 'inventory' - 命中率分析, 'eiq' - 订单EIQ分析

// 监听taskType变化，自动更新taskName
watch(taskType, (newType) => {
  const projectPrefix = projectName.value ? `${projectName.value} - ` : ''
  if (newType === 'inventory') {
    taskName.value = `${projectPrefix}命中率分析`
  } else if (newType === 'eiq') {
    taskName.value = `${projectPrefix}订单EIQ分析`
  }
})

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
const lineRatio = ref(1)  // 多品行单比中的行比例
const orderRatio = ref(1)  // 多品行单比中的单比例
const skuAdjustMode = ref('unchanged')  // SKU种类调整模式：'unchanged'-不变, 'increase'-同比增长
const workstationCount = ref(1)
const slotCount = ref(1)
const singleItemPicking = ref(false)
const materialHeatSource = ref('masterData')
const considerVolume = ref(false)

// 工作时间段
const workingTimeSegments = ref<WorkingTimeSegment[]>([
  { start: new Date(2023, 0, 1, 8, 0), end: new Date(2023, 0, 1, 18, 0) }
])

// 休息时间段
const breakTimeSegments = ref<BreakTimeSegment[]>([
  { start: new Date(2023, 0, 1, 12, 0), end: new Date(2023, 0, 1, 13, 30) }
])

// 截单时间
const cutoffTimes = ref([
  { time: new Date(2023, 0, 1, 12, 0) }
])

// 推单时间段
const pushTimeSegments = ref<PushTimeSegment[]>([
  { start: new Date(2023, 0, 1, 0, 0), end: new Date(2023, 0, 1, 23, 59), pushOrderCount: '0' }
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
  const baseSegment: BaseTimeSegment = { 
    start: new Date(2023, 0, 1, 8, 0), 
    end: new Date(2023, 0, 1, 17, 0) 
  };
  
  if (timeType === 'working') {
    workingTimeSegments.value.push(baseSegment);
  } else if (timeType === 'push') {
    const pushSegment: PushTimeSegment = { 
      ...baseSegment, 
      pushOrderCount: '0' 
    };
    pushTimeSegments.value.push(pushSegment);
  } else if (timeType === 'break') {
    breakTimeSegments.value.push(baseSegment);
  }

  // 延迟一下更新可视化，确保DOM已更新
  nextTick(() => {
    updateTimeVisualization(timeType);
  });
}

// 方法 - 删除时间段
const removeTimeSegment = (index: number, timeType: string) => {
  if (timeType === 'working' && workingTimeSegments.value.length > 1) {
    workingTimeSegments.value.splice(index, 1)
  } else if (timeType === 'push' && pushTimeSegments.value.length > 1) {
    pushTimeSegments.value.splice(index, 1)
  } else if (timeType === 'break' && breakTimeSegments.value.length > 1) {
    breakTimeSegments.value.splice(index, 1)
  }

  // 延迟一下更新可视化，确保DOM已更新
  nextTick(() => {
    updateTimeVisualization(timeType)
  })
}

// 方法 - 添加截单时间点
const addCutoffTime = () => {
  cutoffTimes.value.push({ time: new Date(2023, 0, 1, 16, 0) })
  
  // 延迟一下更新可视化，确保DOM已更新
  nextTick(() => {
    updateCutoffTimeVisualization()
  })
}

// 方法 - 删除截单时间点
const removeCutoffTime = (index: number) => {
  if (cutoffTimes.value.length > 1) {
    cutoffTimes.value.splice(index, 1)
    
    // 延迟一下更新可视化，确保DOM已更新
    nextTick(() => {
      updateCutoffTimeVisualization()
    })
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
  // 获取要处理的时间段数组
  let timeSegments: BaseTimeSegment[] = [];
  let visualElementId = '';
  
  if (timeType === 'working') {
    timeSegments = workingTimeSegments.value;
    visualElementId = 'working-time-visual';
  } else if (timeType === 'break') {
    timeSegments = breakTimeSegments.value;
    visualElementId = 'break-time-visual';
  } else if (timeType === 'push') {
    timeSegments = pushTimeSegments.value;
    visualElementId = 'push-time-visual';
  }
  
  // 通过ID直接查找可视化元素
  const visualElement = document.getElementById(visualElementId);
  if (!visualElement) {
    console.error(`找不到可视化元素ID: ${visualElementId}`);
    return;
  }
  
  console.log(`找到${timeType}可视化容器`, visualElement);
  
  // 如果没有时间段数据，清空可视化
  if (timeSegments.length === 0) {
    visualElement.innerHTML = '';
    return;
  }
  
  // 合并所有时间段
  const visualSegments: {start: number, end: number}[] = [];
  timeSegments.forEach(segment => {
    if (!segment.start || !segment.end) return;
    
    const startHour = segment.start.getHours();
    const startMinute = segment.start.getMinutes();
    const endHour = segment.end.getHours();
    const endMinute = segment.end.getMinutes();
    
    const startPercentage = (startHour * 60 + startMinute) / (24 * 60) * 100;
    const endPercentage = (endHour * 60 + endMinute) / (24 * 60) * 100;
    
    visualSegments.push({
      start: startPercentage,
      end: endPercentage
    });
  });
  
  // 清空现有的可视化元素
  visualElement.innerHTML = '';
  
  // 为每个时间段创建可视化区域
  visualSegments.forEach(segment => {
    const width = segment.end - segment.start;
    
    // 创建具有明确样式的视觉元素
    const segmentEl = document.createElement('div');
    segmentEl.className = 'time-segment-block';
    segmentEl.style.position = 'absolute';
    segmentEl.style.left = `${segment.start}%`;
    segmentEl.style.width = `${width}%`;
    segmentEl.style.height = '20px';
    segmentEl.style.backgroundColor = 'rgba(13, 110, 253, 0.5)';
    segmentEl.style.borderRadius = '4px';
    
    console.log(`添加时间段: ${segment.start}% - ${segment.end}%, 宽度: ${width}%`);
    visualElement.appendChild(segmentEl);
  });
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
  // 滚动到页面顶部 - 使用nextTick确保DOM更新后滚动生效
  nextTick(() => {
    // 使用更直接的DOM方法
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0 // 针对Safari浏览器
  })
  
  // 从 Pinia store 获取项目信息
  projectId.value = projectStore.currentProjectId
  projectName.value = projectStore.currentProjectName
  fileType.value = projectStore.currentFileType
  
  if (!projectId.value) {
    // 尝试从 sessionStorage 获取项目信息
    const storedProject = sessionStorage.getItem('currentProject')
    if (storedProject) {
      try {
        const projectData = JSON.parse(storedProject)
        projectId.value = projectData.id
        projectName.value = projectData.name
        
        // 更新 Pinia store（这样其他组件可以从store中获取数据）
        projectStore.setCurrentProject(projectData.id, projectData.name)
      } catch (e) {
        console.error('解析sessionStorage中的项目数据失败', e)
      }
    }
    
    // 尝试从查询参数获取数据（向后兼容）
    if (!projectId.value) {
      const id = route.query.id
      const name = route.query.name
      const type = route.query.type
      
      if (id) {
        projectId.value = parseInt(id.toString(), 10)
        projectName.value = name?.toString() || `项目 ${id}`
        fileType.value = type?.toString() || ''
      } else {
        // 如果没有项目信息，返回首页
        router.push('/')
      }
    }
  }
  
  // 根据当前项目名称和任务类型设置初始任务名称
  const projectPrefix = projectName.value ? `${projectName.value} - ` : ''
  if (taskType.value === 'inventory') {
    taskName.value = `${projectPrefix}命中率分析`
  } else if (taskType.value === 'eiq') {
    taskName.value = `${projectPrefix}订单EIQ分析`
  }
  
  // 加载分析数据
  loadAnalysisData()
  
  updateOrderSourceOptions()
  updateInventorySourceOptions()
  
  // 在组件挂载后，初始化所有时间段可视化图表
  nextTick(() => {
    updateTimeVisualization('working')
    updateTimeVisualization('break')
    updateTimeVisualization('push')
    updateCutoffTimeVisualization()
  })
  
  // 模拟使用skuMixAvg和inventoryDepth进行初始化设置
  console.log(`初始化容器混放SKU均值: ${skuMixAvg.value}`)
  console.log(`初始化库存深度: ${inventoryDepth.value}`)
})

// 加载分析数据
const loadAnalysisData = () => {
  // 这里是加载数据的逻辑
  // 使用 projectId.value 和 fileType.value 获取相应数据
}

// 定义时间段接口
interface BaseTimeSegment {
  start: Date;
  end: Date;
}

interface PushTimeSegment extends BaseTimeSegment {
  pushOrderCount: string;
}

type WorkingTimeSegment = BaseTimeSegment;
type BreakTimeSegment = BaseTimeSegment;
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
  
  // 主要卡片样式
  &--primary {
    border: 1px solid #e6f0ff;
    box-shadow: 0 4px 15px rgba(13, 110, 253, 0.1);
    
    &:hover {
      box-shadow: 0 6px 18px rgba(13, 110, 253, 0.18);
    }
    
    .card-header {
      background-color: #f0f7ff;
      
      span {
        color: #0d6efd;
        font-size: 18px;
      }
      
      .header-icon {
        color: #0d6efd;
        font-size: 20px;
      }
    }
  }
  
  .card-header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 14px;
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

// 任务名称样式
.task-name {
  &--eiq {
    :deep(.el-input__wrapper) {
      background-color: #f0f7ff;
      border: 1px solid #b8daff;
      box-shadow: 0 0 0 1px #b8daff;
      
      &:hover, &:focus {
        box-shadow: 0 0 0 1px #0d6efd;
      }
    }
    
    :deep(.el-input__inner) {
      color: #0d6efd;
      font-weight: 500;
    }
  }
  
  &--inventory {
    :deep(.el-input__wrapper) {
      background-color: #f8f9fa;
      
      &:hover, &:focus {
        box-shadow: 0 0 0 1px #6c757d;
      }
    }
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
  gap: 8px;
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
  margin-left: 14px;
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
  overflow: visible; /* 允许子元素溢出 */
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
  position: absolute;
  top: 15px;
  width: 100%;
  z-index: 1;
  pointer-events: none; /* 确保不会阻止其他元素的点击事件 */
}

.time-segment-block {
  position: absolute;
  height: 20px;
  background-color: rgba(13, 110, 253, 0.5);
  border-radius: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 5;
  
  &:hover {
    background-color: rgba(13, 110, 253, 0.7);
    box-shadow: 0 3px 6px rgba(0,0,0,0.15);
  }
}

/* 截单时间点可视化 */
.cutoff-time-visual {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
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
.segment-btn-delete {
  margin-left: 20px;
}
  .form-item {
    width: 300px;
  }
  .form-label-push {
    margin-left: 20px;
  }

// 底部按钮区域
.footer-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 10px 0;
  
  .btn {
    min-width: 120px;
  }
}

// 按钮图标间距 - 新增
:deep(.el-button) {
  .el-icon {
    margin-right: 8px;
    
    & + span {
      margin-left: 4px;
    }
    
    &.el-icon--right {
      margin-right: 0;
      margin-left: 8px;
    }
  }
  
  i {
    margin-right: 8px;
  }
}

// el-radio 和 el-checkbox 中的图标间距调整
:deep(.el-radio), :deep(.el-checkbox) {
  i, .el-icon {
    margin-right: 8px;
    vertical-align: middle;
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
  gap: 12px;
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

// 多品行单比样式
.ratio-input-group {
  display: flex;
  align-items: center;
  gap: 5px;
  
  :deep(.el-input-number) {
    width: 100px;
    
    .el-input__wrapper {
      padding: 0 2px;
    }
  }
  
  span {
    color: #606266;
  }
}

.sku-adjust-mode {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

// 时段操作按钮间距
.time-segment {
  & > .el-button {
    :deep(.el-icon) {
      margin: 0; // 圆形按钮内不需要间距
    }
  }
}

// 添加时段按钮的图标间距
.mt-2 {
  &.el-button {
    :deep(.el-icon) {
      margin-right: 6px; // 适当调整添加按钮的图标间距
    }
  }
}
</style> 