<template>
  <div class="file-import-container">
    <div class="import-header">
      <h2>文件导入</h2>
      <p>请按照步骤导入并处理您的数据文件</p>
    </div>

    <el-steps :active="activeStep - 1" finish-status="success" class="import-steps">
      <el-step title="导入文件" />
      <el-step title="字段映射" />
      <el-step title="字段处理规则" />
    </el-steps>

    <div class="step-content">
      <!-- 步骤1: 导入文件 -->
      <div v-if="activeStep === 1" class="step-body">
        <el-select 
          clearable 
          v-model="fileTypeSelected" 
          placeholder="请选择导入文件类型" 
          class="full-width"
          ref="fileTypeSelect"
        >
            <el-option value="销售出库订单" label="销售出库订单" />
            <el-option value="物料主数据" label="物料主数据" />
            <el-option value="入库单据" label="入库单据" />
            <el-option value="库存记录" label="库存记录" />
          </el-select>
        
        <!-- 添加下载模板链接 -->
        <div v-if="fileTypeSelected" class="download-template" ref="downloadTemplate">
          <el-link type="primary" @click="handleDownloadTemplate">
            <el-icon><Download /></el-icon>
            下载{{ fileTypeSelected }}导入模板
          </el-link>
        </div>
        
        <!-- 添加带边框的容器 -->
        <div class="import-area-bordered">
          <!-- 导入说明部分 -->
          <div class="import-instructions">
            <div class="instruction-header">
              <el-icon><InfoFilled /></el-icon> 导入说明
            </div>
            <ul class="instruction-list">
              <li>文件仅支持xls、xlsx、csv格式。</li>
              <li>必须项目提供账单信息、支持用户修改。</li>
              <li>请不要更改或合并单元格操作！</li>
              <li>请不要删除各行标题！</li>
              <li>请不要更改的日期日期格式！</li>
              <li>注意单个Excel文件最大支持100W行。</li>
              <li>注意单个Excel文件最大支持200M。</li>
              <li>物料体积可选择立方厘米（cm³）、立方分米（dm³）、立方米（m³）、默认立方厘米。</li>
            </ul>
          </div>

          <!-- 将 el-card 替换为普通 div -->
          <div> 
            <div class="file-select-area" ref="fileUploadArea">
              <el-upload
                class="upload-area"
                drag
                action="#"
                :auto-upload="false"
                :on-change="handleFileChange"
                :show-file-list="false"
              >
                <div class="upload-content">
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="el-upload__text">
                    拖拽文件到此处或<em>点击上传</em>
                  </div>
                  <div class="el-upload__tip">
                    支持 .xls, .xlsx, .csv 格式文件
                  </div>
                </div>
              </el-upload>
            </div>
          </div>
        </div> <!-- 结束带边框的容器 -->

        <!-- 已上传文件列表 -->
        <div class="uploaded-files" v-if="uploadedFiles.length > 0">
          <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-date">{{ file.date }}</span>
            </div>
            <el-button 
              type="danger" 
              circle 
              plain 
              size="small"
              @click="removeFile(index)"
            >
              <el-icon><DeleteIcon /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 上传错误提示 -->
        <div class="upload-error" v-if="uploadError">
          <el-alert
            :title="uploadError"
            type="error"
            show-icon
            :closable="false"
          ></el-alert>
        </div>
      </div>

      <!-- 步骤2: 字段映射 -->
      <div v-if="activeStep === 2" class="step-body">
        <div class="mapping-title">字段映射处理</div>
        
        <!-- 映射说明 -->
        <div class="mapping-instructions">
          <div class="instruction-header">
            <el-icon><InfoFilled /></el-icon> 映射说明
          </div>
          <ul class="instruction-list">
            <li>请将上传文件中的原始字段与系统目标字段进行映射。</li>
            <li>可以选择已保存的映射方案快速完成配置。</li>
            <li>支持将多个原始字段映射到一个目标字段。</li>
            <li>必填字段（单据编号，SKU，单据时间，物料编号，需求数量）必须完成映射。</li>
            <li>点击保存后，映射方案将被保存并可在下次导入时使用。</li>
          </ul>
        </div>
        
        <!-- 选择映射方案 -->
        <div class="scheme-selection">
          <div class="scheme-select">
            <el-select 
              v-model="selectedMappingScheme" 
              placeholder="-- 请选择 --" 
              clearable
              class="scheme-select-input"
            >
              <el-option 
                v-for="scheme in mappingSchemes" 
                :key="scheme.id" 
                :label="scheme.name" 
                :value="scheme.id" 
              />
            </el-select>
            <el-button 
              type="danger" 
              circle 
              plain 
              size="small" 
              :disabled="!selectedMappingScheme"
              @click="deleteScheme"
            >
              <el-icon><DeleteIcon /></el-icon>
            </el-button>
          </div>
          <el-button 
            type="primary" 
            plain 
            class="save-scheme-btn" 
            @click="saveCurrentScheme"
          >
            <el-icon><Document /></el-icon> 保存当前方案
          </el-button>
        </div>
        
        <!-- 新增：方案名称和描述输入区域，仅在未选择方案时显示 (MOVED HERE) -->
        <div v-if="!selectedMappingScheme" class="new-scheme-inputs">
          <el-form label-position="top">
            <el-form-item label="方案名称" required>
              <el-input 
                v-model="newSchemeName" 
                placeholder="输入方案名称，例如：物流中心映射方案" 
              />
            </el-form-item>
            <el-form-item label="方案描述 (选填)">
              <el-input 
                type="textarea"
                v-model="newSchemeDescription" 
                placeholder="简要描述该方案的用途或特点" 
                :rows="2"
              />
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 添加映射字段按钮 -->
        <el-button 
          type="primary" 
          plain 
          class="add-field-btn"
          @click="addMappingField"
        >
          <el-icon class="el-icon--left"><Plus /></el-icon>添加映射字段
        </el-button>
        
        <!-- 映射表格 -->
        <div class="mapping-table">
          <el-table :data="mappingData" border>
            <el-table-column label="文件原始字段" min-width="180">
              <template #default="scope">
                <div :class="{ 'sku-source-field': scope.row.isSkuSource, 'sku-field-container': scope.row.targetField === 'sku' && !scope.row.isSkuSource }">
                  <div v-for="(field, index) in scope.row.sourceField" :key="index" class="source-field-row">
                    <el-select 
                      v-model="scope.row.sourceField[index]" 
                      placeholder="选择文件字段"
                      filterable
                    >
                      <el-option
                        v-for="item in sourceFields"
                        :key="item"
                        :label="item"
                        :value="item"
                      />
                    </el-select>
                    <!-- 添加删除按钮，但第一个源字段不显示 -->
                    <el-button 
                      v-if="index > 0"
                      type="danger" 
                      circle 
                      plain 
                      size="small"
                      @click="removeSourceField(scope.$index, index)"
                    >
                      <el-icon><DeleteIcon /></el-icon>
                    </el-button>
                  </div>
                  <span v-if="scope.row.isSkuSource" class="sku-source-label">SKU源字段</span>
                  <!-- 添加源字段按钮，仅在SKU字段行显示 -->
                  <div v-if="scope.row.targetField === 'sku' && !scope.row.isSkuSource" class="add-source-btn-container">
                    <el-button 
                      type="success" 
                       
                      size="small"
                      class="add-source-btn"
                      @click="addSkuSourceField(scope.$index)"
                    >
                    <el-icon><Plus /></el-icon>
                    添加源字段
                    </el-button>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="系统目标字段" min-width="180">
              <template #default="scope">
                <el-select 
                  v-if="scope.row.isSourceField"
                  v-model="scope.row.targetField" 
                  placeholder="选择目标字段"
                  filterable
                >
                  <el-option
                    v-for="item in targetFields"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <el-input v-else v-model="scope.row.targetFieldText" placeholder="填写目标字段" />
              </template>
            </el-table-column>
            
            <el-table-column label="是否必填" width="100" align="center">
              <template #default="scope">
                <el-tag 
                  v-if="scope.row.isSourceField" 
                  type="danger" 
                  effect="plain" 
                  size="small"
                  class="required-tag"
                >必填</el-tag>
                <el-switch v-else v-model="scope.row.isRequired" />
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="80" align="center">
              <template #default="scope">
                <el-button 
                  type="danger" 
                  circle 
                  plain 
                  size="small"
                  @click="removeMappingField(scope.$index)"
                  :disabled="scope.row.isSourceField && !scope.row.isSkuSource"
                >
                  <el-icon><DeleteIcon /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 步骤3: 字段处理规则 -->
      <div v-if="activeStep === 3" class="step-body">
        <div class="mapping-title">字段处理规则</div>
        
        <!-- 处理规则说明 -->
        <div class="mapping-instructions">
          <div class="instruction-header">
            <el-icon><InfoFilled /></el-icon> 处理规则说明
          </div>
          <ul class="instruction-list">
            <li>所有需要个性化处理的字段处理规则，以及如何处理数据导入冲突。</li>
            <li>可以选择已保存的映射方案快速完成配置。</li>
            <li>字段处理环节对数据进行预处理，可以在下一步导入时对数据有更好的控制。</li>
            <li>开启单特字段选项后，相应字段导入将使用配置好的规则处理对应数据。</li>
            <li>处理规则会影响到，数据导入时系统的对数据的解析方式。</li>
          </ul>
        </div>
        
        <!-- 选择映射方案 -->
        <div class="scheme-selection">
          <div class="scheme-select">
            <el-select 
              v-model="selectedMappingScheme" 
              placeholder="-- 请选择 --" 
              clearable
              class="scheme-select-input"
            >
              <el-option 
                v-for="scheme in mappingSchemes" 
                :key="scheme.id" 
                :label="scheme.name" 
                :value="scheme.id" 
              />
            </el-select>
            <el-button 
              type="danger" 
              circle 
              plain 
              size="small" 
              :disabled="!selectedMappingScheme"
              @click="deleteScheme"
            >
              <el-icon><DeleteIcon /></el-icon>
            </el-button>
          </div>
          <el-button 
            type="primary" 
            plain 
            class="save-scheme-btn" 
            @click="saveCurrentScheme"
          >
            <el-icon><Document /></el-icon> 保存当前方案
          </el-button>
        </div>
        
        <!-- 基础编号 - 特殊字符处理 -->
        <div class="rule-section">
          <div class="rule-section-header">
            <i class="el-icon circle-icon"></i> 基础编号 - 特殊字符处理
          </div>
          
          <div class="rule-options">
            <p class="rule-description">注意：开启后，系统将进行特殊字符处理，将特殊字符去除（如横线、空格、下划线等）。建议开启此选项，避免因特殊字符导致系统不能识别相同物料。</p>
            
            <div class="special-chars-section">
              <div class="option-grid">
                <div class="option-row">
                  <span class="label">外部编码</span>
                  <el-switch v-model="processingRules.externalCode" />
                </div>
                <div class="option-row">
                  <span class="label">包装代码</span>
                  <el-switch v-model="processingRules.packagingCode" />
                </div>
                <div class="option-row">
                  <span class="label">网格代码</span>
                  <el-switch v-model="processingRules.gridCode" />
                </div>
                <div class="option-row">
                  <span class="label">生产日期</span>
                  <el-switch v-model="processingRules.productionDate" />
                </div>
                <div class="option-row">
                  <span class="label">保质期</span>
                  <el-switch v-model="processingRules.shelfLife" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- SKU合并规则 -->
        <div class="rule-section">
          <div class="rule-section-header">
            <i class="el-icon circle-icon"></i> SKU合并规则
          </div>
          
          <div class="rule-content">
            <p class="rule-description">可以设置SKU合并规则，精确控制</p>
            
            <div class="sku-section">
              <div class="sku-input-container">
                <span class="label">标准SKU值：</span>
                <el-input v-model="processingRules.skuInput" placeholder="填写标准SKU值" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- 表格规则 - 默认值 -->
        <div class="collapsible-rule-section">
          <div class="collapsible-header" @click="toggleRule('tableRule')">
            <div class="header-left">
              <el-switch v-model="processingRules.tableRule.enabled" />
              <span class="rule-title">表格规则 - 默认值</span>
            </div>
            <el-icon>
              <component :is="processingRules.tableRule.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.tableRule.collapsed" class="collapsible-content">
            <div class="option-row">
              <el-radio v-model="processingRules.tableRule.option" :label="1">取最大值</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.tableRule.option" :label="2">平均值取整</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.tableRule.option" :label="3">取小值取整</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 物料规格 - 合并规则设置 -->
        <div class="collapsible-rule-section">
          <div class="collapsible-header" @click="toggleRule('materialSpec')">
            <div class="header-left">
              <el-switch v-model="processingRules.materialSpec.enabled" />
              <span class="rule-title">物料规格 - 合并规则设置</span>
            </div>
            <el-icon>
              <component :is="processingRules.materialSpec.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.materialSpec.collapsed" class="collapsible-content">
            <div class="option-row">
              <el-radio v-model="processingRules.materialSpec.option" :label="1">开启平均值</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.materialSpec.option" :label="2">中位数取整</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.materialSpec.option" :label="3">取小值取整</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 物料编号 - 合并规则设置 -->
        <div class="collapsible-rule-section">
          <div class="collapsible-header" @click="toggleRule('materialCode')">
            <div class="header-left">
              <el-switch v-model="processingRules.materialCode.enabled" />
              <span class="rule-title">物料编号 - 合并规则设置</span>
            </div>
            <el-icon>
              <component :is="processingRules.materialCode.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.materialCode.collapsed" class="collapsible-content">
            <div class="option-row">
              <el-radio v-model="processingRules.materialCode.option" :label="1">取认设置值</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 订单状态 - 合并规则设置 -->
        <div class="collapsible-rule-section">
          <div class="collapsible-header" @click="toggleRule('orderStatus')">
            <div class="header-left">
              <el-switch v-model="processingRules.orderStatus.enabled" />
              <span class="rule-title">订单状态 - 合并规则设置</span>
            </div>
            <el-icon>
              <component :is="processingRules.orderStatus.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.orderStatus.collapsed" class="collapsible-content">
            <div class="option-row">
              <el-radio v-model="processingRules.orderStatus.option" :label="1">取认设置值</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 上架波次号 - 合并规则设置 -->
        <div class="collapsible-rule-section">
          <div class="collapsible-header" @click="toggleRule('shelfWaveNumber')">
            <div class="header-left">
              <el-switch v-model="processingRules.shelfWaveNumber.enabled" />
              <span class="rule-title">上架波次号 - 合并规则设置</span>
            </div>
            <el-icon>
              <component :is="processingRules.shelfWaveNumber.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.shelfWaveNumber.collapsed" class="collapsible-content">
            <div class="option-row">
              <el-radio v-model="processingRules.shelfWaveNumber.option" :label="1">取认设置值</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.shelfWaveNumber.option" :label="2">保持生成</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 单个单据 - 合并规则设置 -->
        <div class="collapsible-rule-section">
          <div class="collapsible-header" @click="toggleRule('singleOrder')">
            <div class="header-left">
              <el-switch v-model="processingRules.singleOrder.enabled" />
              <span class="rule-title">单个单据 - 合并规则设置</span>
            </div>
            <el-icon>
              <component :is="processingRules.singleOrder.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.singleOrder.collapsed" class="collapsible-content">
            <div class="option-row">
              <el-radio v-model="processingRules.singleOrder.option" :label="1">取认设置值</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.singleOrder.option" :label="2">保持生成</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 物料分类 - 合并规则设置 -->
        <div class="collapsible-rule-section">
          <div class="collapsible-header" @click="toggleRule('materialCategory')">
            <div class="header-left">
              <el-switch v-model="processingRules.materialCategory.enabled" />
              <span class="rule-title">物料分类 - 合并规则设置</span>
            </div>
            <el-icon>
              <component :is="processingRules.materialCategory.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.materialCategory.collapsed" class="collapsible-content">
            <div class="option-row">
              <el-radio v-model="processingRules.materialCategory.option" :label="1">取认设置值</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.materialCategory.option" :label="2">保持生成</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 包装长度 - 合并规则设置 -->
        <div class="collapsible-rule-section">
          <div class="collapsible-header" @click="toggleRule('packagingLength')">
            <div class="header-left">
              <el-switch v-model="processingRules.packagingLength.enabled" />
              <span class="rule-title">包装长度 - 合并规则设置</span>
            </div>
            <el-icon>
              <component :is="processingRules.packagingLength.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.packagingLength.collapsed" class="collapsible-content">
            <div class="option-row">
              <el-radio v-model="processingRules.packagingLength.option" :label="1">取认设置值</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.packagingLength.option" :label="2">保持生成</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 包装规格 - 合并规则设置 -->
        <div class="collapsible-rule-section">
          <div class="collapsible-header" @click="toggleRule('packagingSpec')">
            <div class="header-left">
              <el-switch v-model="processingRules.packagingSpec.enabled" />
              <span class="rule-title">包装规格 - 合并规则设置</span>
            </div>
            <el-icon>
              <component :is="processingRules.packagingSpec.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.packagingSpec.collapsed" class="collapsible-content">
            <div class="option-row">
              <el-radio v-model="processingRules.packagingSpec.option" :label="1">取认设置值</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.packagingSpec.option" :label="2">保持生成</el-radio>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加映射字段弹窗 -->
    <el-dialog
      v-model="showAddFieldDialog"
      title="可选映射字段"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-checkbox-group v-model="fieldsToAdd">
        <el-checkbox
          v-for="field in availableFieldsForAdding"
          :key="field.value"
          :label="field.value"
          border
          style="margin: 5px;"
        >
          {{ field.label }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddFieldDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmAddFieldSelection">
            确认添加
          </el-button>
        </span>
      </template>
    </el-dialog>

    <div class="step-actions">
      <div class="left-actions">
        <el-button @click="goBack"><el-icon><ArrowLeft /></el-icon> 返回</el-button>
      </div>
      <div class="right-actions">
        
        <el-button v-if="activeStep === 1 || activeStep === 3" type="primary" plain @click="viewDetails">
          <el-icon><Document /></el-icon> 查看明细
        </el-button>
        <el-button 
          v-if="activeStep < 3" 
          type="primary" 
          @click="nextStep"
          ref="nextStepButton"
        >下一步<el-icon class="el-icon--right"><ArrowRight /></el-icon></el-button>
        <el-button v-if="activeStep === 3 || activeStep === 1" type="danger" plain @click="cancelOperation">取消操作</el-button>
        <el-button v-if="activeStep === 3" type="success" @click="completeImport">完成导入</el-button>
      </div>
    </div>
    
    <!-- 文件处理进度对话框 -->
    <el-dialog
      v-model="showProcessingDialog"
      title="处理文件"
      width="550px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="processing-dialog-content">
        <h3 class="processing-title">正在处理文件数据</h3>
        
        <el-progress 
          :percentage="processingPercentage" 
          :stroke-width="18"
          :status="processingComplete ? 'success' : ''"
        ></el-progress>
        
        <div class="processing-steps">
          <div class="processing-step" :class="{ 'active': currentStep >= 1, 'complete': currentStep > 1 }">
            <div class="step-circle">1</div>
            <div class="step-name">解析数据</div>
          </div>
          <div class="processing-step" :class="{ 'active': currentStep >= 2, 'complete': currentStep > 2 }">
            <div class="step-circle">2</div>
            <div class="step-name">验证字段</div>
          </div>
          <div class="processing-step" :class="{ 'active': currentStep >= 3, 'complete': currentStep > 3 }">
            <div class="step-circle">3</div>
            <div class="step-name">准备导入</div>
          </div>
          <div class="processing-step" :class="{ 'active': currentStep >= 4, 'complete': currentStep > 4 }">
            <div class="step-circle">4</div>
            <div class="step-name">完成</div>
          </div>
        </div>
        
        <div class="processing-notice">
          文件较大时处理可能需要几分钟，请耐心等待...
        </div>
      </div>
    </el-dialog>
    
    <!-- 引导提示组件 -->
    <Teleport to="body">
      <div v-if="showGuide && !guideCompleted && activeStep === 1" class="guide-container">
        <div class="guide-spotlight" :style="spotlightStyle"></div>
        <div class="guide-popup" :style="guidePopupStyle">
          <div class="guide-header">
            <span class="guide-step">步骤 {{ currentGuideStep }}/{{ guideSteps.length }}</span>
            <el-button class="guide-close" type="text" @click="skipGuide">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="guide-content">
            <h3>{{ getCurrentGuide().title }}</h3>
            <p>{{ getCurrentGuide().content }}</p>
          </div>
          <div class="guide-footer">
            <el-button 
              v-if="currentGuideStep > 1" 
              type="text" 
              @click="currentGuideStep--"
            >上一步</el-button>
            <el-button 
              v-if="currentGuideStep < guideSteps.length" 
              type="primary" 
              @click="nextGuideStep"
            >了解</el-button>
            <el-button 
              v-else 
              type="success" 
              @click="completeGuide"
            >完成</el-button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled, InfoFilled, Delete as DeleteIcon, Document, Download, Close, Plus, ArrowDown, ArrowRight, ArrowLeft } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const fileTypeSelected = ref('')
// 步骤控制
const activeStep = ref(1);

// 引导相关状态
const showGuide = ref(true); // 是否显示引导
const currentGuideStep = ref(1); // 当前引导步骤
const guideCompleted = ref(false); // 引导是否完成

// 将图标组件添加到变量中以便在模板中使用
const icons = {
  ArrowDown,
  ArrowRight
};

// 引导步骤数据
const guideSteps = [
  {
    id: 1,
    title: '第一步：选择文件类型',
    content: '请先从下拉菜单中选择您需要导入的文件类型，不同的文件类型有不同的模板格式。',
    target: 'fileTypeSelect',
    placement: 'bottom'
  },
  {
    id: 2,
    title: '第二步：下载模板',
    content: '点击下载按钮获取导入模板。您需要按照模板格式准备数据，确保数据能正确导入系统。',
    target: 'downloadTemplate',
    placement: 'bottom'
  },
  {
    id: 3,
    title: '第三步：上传文件',
    content: '请将按照模板格式准备好的文件拖拽到此区域或点击上传。支持Excel和CSV格式的文件。',
    target: 'fileUploadArea',
    placement: 'top'
  },
  {
    id: 4,
    title: '最后一步：继续',
    content: '文件上传并验证成功后，点击"下一步"按钮进入字段映射环节。',
    target: 'nextStepButton',
    placement: 'left'
  }
];

// 获取当前引导步骤
const getCurrentGuide = () => {
  const step = guideSteps.find(step => step.id === currentGuideStep.value) || guideSteps[0];
  
  // 动态调整引导内容，使其更加上下文相关
  if (step.id === 1 && fileTypeSelected.value) {
    step.content = `您已选择 "${fileTypeSelected.value}"，现在可以下载对应的模板文件了。`;
  } else if (step.id === 2 && fileTypeSelected.value) {
    step.content = `请下载 "${fileTypeSelected.value}" 的导入模板，按照模板格式准备您的数据文件，以保证导入成功。`;
  } else if (step.id === 3 && uploadedFiles.value.length > 0) {
    step.content = '文件已上传成功！您可以点击页面上的"下一步"按钮继续操作。';
  } else if (step.id === 4 && uploadedFiles.value.length > 0) {
    step.content = `您已成功上传 ${uploadedFiles.value.length} 个文件，点击"下一步"按钮进入字段映射环节。`;
  }
  
  return step;
};

// 引导相关元素引用
const fileTypeSelect = ref(null);
const downloadTemplate = ref(null);
const fileUploadArea = ref(null);
const nextStepButton = ref(null);

// 引导弹出框样式
const guidePopupStyle = ref({});
// 目标元素高亮样式
const spotlightStyle = ref({});

// 更新引导弹出框位置和目标元素高亮
const updateGuidePosition = async () => {
  await nextTick();
  
  const currentGuide = getCurrentGuide();
  const targetRefName = currentGuide.target;
  const targetElement = targetRefName ? eval(targetRefName).value : null;
  
  if (targetElement && targetElement.$el) {
    const rect = targetElement.$el.getBoundingClientRect();
    const placement = currentGuide.placement;
    
    // 计算视口尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 考虑滚动位置，更新高亮区域样式
    spotlightStyle.value = {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
    };
    
    // 弹出框的尺寸（根据不同屏幕大小调整）
    const popupWidth = Math.min(320, viewportWidth * 0.8);
    const popupHeight = 150; // 估计高度
    const arrowSize = 10; // 箭头大小
    const margin = 15; // 与目标元素的间距
    
    let top, left;
    
    // 智能计算最佳放置位置，避免溢出屏幕
    // 优先使用指定的位置，但如果空间不足则自动调整
    if (placement === 'top' && rect.top > popupHeight + margin + arrowSize) {
      // 顶部有足够空间
      top = rect.top - popupHeight - margin - arrowSize;
      left = rect.left + rect.width / 2 - popupWidth / 2;
    } else if (placement === 'bottom' && viewportHeight - rect.bottom > popupHeight + margin + arrowSize) {
      // 底部有足够空间
      top = rect.bottom + margin + arrowSize;
      left = rect.left + rect.width / 2 - popupWidth / 2;
    } else if (placement === 'left' && rect.left > popupWidth + margin + arrowSize) {
      // 左侧有足够空间
      top = rect.top + rect.height / 2 - popupHeight / 2;
      left = rect.left - popupWidth - margin - arrowSize;
    } else if (placement === 'right' && viewportWidth - rect.right > popupWidth + margin + arrowSize) {
      // 右侧有足够空间
      top = rect.top + rect.height / 2 - popupHeight / 2;
      left = rect.right + margin + arrowSize;
    } else {
      // 根据可用空间自动选择位置
      if (viewportHeight - rect.bottom > popupHeight + margin + arrowSize) {
        // 放底部
        top = rect.bottom + margin + arrowSize;
        left = rect.left + rect.width / 2 - popupWidth / 2;
        currentGuide.placement = 'bottom';
      } else if (rect.top > popupHeight + margin + arrowSize) {
        // 放顶部
        top = rect.top - popupHeight - margin - arrowSize;
        left = rect.left + rect.width / 2 - popupWidth / 2;
        currentGuide.placement = 'top';
      } else if (viewportWidth - rect.right > popupWidth + margin + arrowSize) {
        // 放右侧
        top = rect.top + rect.height / 2 - popupHeight / 2;
        left = rect.right + margin + arrowSize;
        currentGuide.placement = 'right';
      } else if (rect.left > popupWidth + margin + arrowSize) {
        // 放左侧
        top = rect.top + rect.height / 2 - popupHeight / 2;
        left = rect.left - popupWidth - margin - arrowSize;
        currentGuide.placement = 'left';
      } else {
        // 居中显示（最后手段）
        top = (viewportHeight - popupHeight) / 2;
        left = (viewportWidth - popupWidth) / 2;
        currentGuide.placement = 'center';
      }
    }
    
    // 确保弹出框不超出屏幕
    top = Math.max(margin, Math.min(viewportHeight - popupHeight - margin, top));
    left = Math.max(margin, Math.min(viewportWidth - popupWidth - margin, left));
    
    guidePopupStyle.value = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${popupWidth}px`,
      zIndex: 1002,
      opacity: 1,
      transform: 'scale(1)',
      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
    };
    
    // 添加箭头类，根据位置动态设置
    setTimeout(() => {
      const popup = document.querySelector('.guide-popup');
      if (popup) {
        popup.className = `guide-popup guide-placement-${currentGuide.placement}`;
      }
    }, 0);
  }
};

// 监听引导步骤变化，更新位置
watch(currentGuideStep, () => {
  updateGuidePosition();
});

// 监听窗口尺寸变化，更新引导位置
window.addEventListener('resize', () => {
  if (showGuide.value && !guideCompleted.value) {
    updateGuidePosition();
  }
});

// 引导相关方法
const nextGuideStep = () => {
  currentGuideStep.value++;
};

const completeGuide = () => {
  guideCompleted.value = true;
};

const skipGuide = () => {
  guideCompleted.value = true;
};

// 引导自动下一步函数
const autoAdvanceGuide = () => {
  // 仅当引导开启且未完成时生效
  if (!showGuide.value || guideCompleted.value) return;
  
  const currentStep = currentGuideStep.value;
  const hasFilesUploaded = uploadedFiles.value.length > 0;
  
  // 根据不同条件自动进入下一步
  if (currentStep === 1 && fileTypeSelected.value) {
    // 第一步完成，自动进入第二步
    setTimeout(() => {
      currentGuideStep.value = 2;
    }, 800);
  } else if (currentStep === 2 && hasFilesUploaded) {
    // 如果已经上传了文件，自动进入第四步
    setTimeout(() => {
      currentGuideStep.value = 4;
    }, 800);
  } else if (currentStep === 3 && hasFilesUploaded) {
    // 第三步完成，自动进入第四步
    setTimeout(() => {
      currentGuideStep.value = 4;
    }, 800);
  }
};

// 持续监听用户交互
const setupInteractionObserver = () => {
  // 监控文件选择变化
  watch(fileTypeSelected, () => {
    updateGuidePosition();
    autoAdvanceGuide();
  });
  
  // 监控文件上传变化
  watch(uploadedFiles, () => {
    updateGuidePosition();
    autoAdvanceGuide();
  });
  
  // 监控步骤变化
  watch(activeStep, () => {
    if (activeStep.value > 1 && showGuide.value && !guideCompleted.value) {
      completeGuide();
    }
  });
  
  // 设置DOM变化监听，实时追踪目标元素变化
  nextTick(() => {
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(() => {
        if (showGuide.value && !guideCompleted.value) {
          updateGuidePosition();
        }
      });
      
      // 监听整个步骤内容区域
      const stepContent = document.querySelector('.step-content');
      if (stepContent) {
        observer.observe(stepContent, { 
          childList: true, 
          subtree: true, 
          attributes: true,
          attributeFilter: ['style', 'class']
        });
      }
    }
  });
  
  // 监听滚动事件，保持引导框位置与目标元素同步
  window.addEventListener('scroll', () => {
    if (showGuide.value && !guideCompleted.value) {
      updateGuidePosition();
    }
  }, { passive: true });
  
  // 监听焦点变化
  document.addEventListener('focusin', () => {
    if (showGuide.value && !guideCompleted.value) {
      // 如果焦点在某个相关元素上，更新引导位置
      updateGuidePosition();
    }
  });
};

// 文件处理进度相关
const showProcessingDialog = ref(false);
const processingPercentage = ref(0);
const currentStep = ref(1);
const processingComplete = ref(false);

// 导入文件相关数据
const projectId = ref<number | null>(null);
const projectName = ref('');

const selectedFile = ref(null);

// 上传文件相关
interface UploadedFile {
  name: string;
  date: string;
  size?: string;
}

const uploadedFiles = ref<UploadedFile[]>([
]);
const uploadError = ref('');

// 字段映射相关数据
// {{ 定义映射项接口 }}
interface MappingItem {
  sourceField: Array<string>;
  targetField: string;
  previewData: string;
  isRequired: boolean;
  isSourceField: boolean;
  targetFieldText?: string; // 添加可选的 targetFieldText
  isLocked?: boolean; // 添加 isLocked 属性
  parentIndex?: number; // 添加 parentIndex 用于标识子SKU源字段对应的父项索引
  isSkuSource?: boolean; // 添加 isSkuSource 标识是否为SKU的额外源字段
}

const mappingData = ref<MappingItem[]>([
  { sourceField: ['item_sku'], targetField: 'sku', previewData: 'SKU12345', isRequired: true, isSourceField: true, isLocked: true },
  { sourceField: ['order_id'], targetField: 'orderNumber', previewData: 'ORD-2023-001', isRequired: true, isSourceField: true },
  { sourceField: ['quantity'], targetField: 'quantity', previewData: '10', isRequired: true, isSourceField: true },
  { sourceField: ['order_date'], targetField: 'orderDate', previewData: '2023-05-15', isRequired: true, isSourceField: true },
  { sourceField: ['material_code'], targetField: 'materialCode', previewData: 'M-2023-001', isRequired: true, isSourceField: true },
]);

// 源文件字段
const sourceFields = ref([
  'order_id',
  'customer_order',
  'item_sku',
  'quantity',
  'order_date',
  'material_code'
]);

// 可选的目标字段
const targetFields = ref([
  { value: 'orderNumber', label: '单据编号' },
  { value: 'sku', label: 'SKU' },
  { value: 'quantity', label: '数量' },
  { value: 'orderDate', label: '单据时间' },
  { value: 'materialCode', label: '物料编码' },
  { value: 'customerOrder', label: '客户订单' },
]);

// 映射方案相关数据
const mappingSchemes = ref([
  { id: 1, name: '默认方案' },
  { id: 2, name: '销售订单映射' },
  { id: 3, name: '库存记录映射' }
]);
const selectedMappingScheme = ref<number | null>(null);

// {{ 添加新方案名称和描述的 ref }}
const newSchemeName = ref('');
const newSchemeDescription = ref('');

// {{ 添加弹窗控制和数据 ref }}
const showAddFieldDialog = ref(false);
const fieldsToAdd = ref<string[]>([]);
const availableFieldsForAdding = ref([
  { label: '单据类型', value: 'documentType' }, // TODO: 确认实际的 value
  { label: '单据项', value: 'documentItem' },     // TODO: 确认实际的 value
  { label: '物料编号', value: 'materialCode' },   // 假设与 targetFields 一致
  { label: '订单优先级', value: 'orderPriority' }, // TODO: 确认实际的 value
  { label: '上级波次编号', value: 'parentWaveNumber' }, // TODO: 确认实际的 value
  { label: '物料冷热度', value: 'materialTemperature' }, // TODO: 确认实际的 value
]);

// 字段映射相关方法
const addMappingField = () => {
  // {{ 修改：不再直接添加，而是打开弹窗 }}
  fieldsToAdd.value = []; // 重置选项
  showAddFieldDialog.value = true;
};

// 为SKU字段添加源字段
const addSkuSourceField = (parentIndex: number) => {
  // 找到父SKU项
  const parentItem = mappingData.value[parentIndex];
  
  // 只有当目标字段为SKU时才添加
  if (parentItem.targetField !== 'sku') return;
  
  // 添加新字段
  parentItem.sourceField.push('');
  
  // 添加后获取焦点效果
  nextTick(() => {
    // 等待DOM更新后找到新添加的字段行
    const sourceFieldRows = document.querySelectorAll(`.source-field-row`);
    const newRowIndex = parentItem.sourceField.length - 1;
    
    if (sourceFieldRows && sourceFieldRows.length > newRowIndex) {
      // 获取新添加行的select元素
      const selectElement = sourceFieldRows[newRowIndex].querySelector('.el-select');
      if (selectElement) {
        // 添加一个临时的高亮动画类
        selectElement.classList.add('highlight-field');
        
        // 一段时间后移除高亮效果
        setTimeout(() => {
          selectElement.classList.remove('highlight-field');
        }, 1500);
      }
    }
  });
};

// 删除特定行的特定源字段
const removeSourceField = (rowIndex: number, fieldIndex: number) => {
  // 找到对应行
  const row = mappingData.value[rowIndex];
  
  // 检查是否至少有一个源字段，如果只有一个则不允许删除
  if (row.sourceField.length <= 1) {
    ElMessage.warning('至少需要保留一个源字段');
    return;
  }
  
  // 获取要删除的元素的DOM引用
  const sourceFieldRows = document.querySelectorAll(`.source-field-row`);
  if (sourceFieldRows[fieldIndex]) {
    // 添加fadeOut动画类
    const fieldRow = sourceFieldRows[fieldIndex] as HTMLElement;
    fieldRow.style.animation = 'fadeOut 0.3s forwards';
    
    // 等待动画完成后再删除数据
    setTimeout(() => {
      // 从sourceField数组中删除指定索引的元素
      row.sourceField.splice(fieldIndex, 1);
    }, 280); // 稍微短于动画时间，使切换更流畅
  } else {
    // 如果找不到DOM元素，直接删除
    row.sourceField.splice(fieldIndex, 1);
  }
};

// {{ 新增：处理弹窗确认 }}
const confirmAddFieldSelection = () => {
  fieldsToAdd.value.forEach(targetFieldValue => {
    // 简单检查是否已存在该目标字段的映射 (可优化)
    const exists = mappingData.value.some(item => item.targetField === targetFieldValue);
    if (!exists) {
      const availableFieldsOptions = availableFieldsForAdding.value.filter(field => field.value === targetFieldValue);
      mappingData.value.push({
        sourceField: [],
        targetField: targetFieldValue,
        previewData: '', // 可能需要根据字段类型设置默认预览
        isRequired: false, // 假设新添加的都不是必填，或者需要额外逻辑判断
        isSourceField: false,
        targetFieldText: availableFieldsOptions.find(option => option.value === targetFieldValue)?.label || targetFieldValue
      });
      // const availableFieldsOptions = availableFieldsForAdding.value.filter(field => field.value !== targetFieldValue);
      // targetFields.value.push(...availableFieldsOptions);
    }
  });
  showAddFieldDialog.value = false;
};

const removeMappingField = (index: number) => {
  // 不允许删除必填字段
  if (mappingData.value[index].isRequired) {
    return;
  }
  
  // 删除字段及其可能的子源字段
  const item = mappingData.value[index];
  
  // 如果删除的是SKU字段，需要同时删除其所有源字段
  if (item.targetField === 'sku' && !item.isSkuSource) {
    // 找到所有关联的SKU源字段并删除
    const childIndices: number[] = [];
    mappingData.value.forEach((field, idx) => {
      if (field.isSkuSource && field.parentIndex === index) {
        childIndices.push(idx);
      }
    });
    
    // 从后向前删除，避免索引变化问题
    for (let i = childIndices.length - 1; i >= 0; i--) {
      mappingData.value.splice(childIndices[i], 1);
    }
  }
  
  // 删除当前项
  mappingData.value.splice(index, 1);
  
  // 如果删除的是父项，需要更新子项的parentIndex
  if (!item.isSkuSource) {
    // 计算删除后索引的偏移量
    mappingData.value.forEach((field) => {
      if (field.parentIndex !== undefined && field.parentIndex > index) {
        field.parentIndex--;
      }
    });
  }
};

const saveCurrentScheme = () => {
  ElMessage.success('当前映射方案已保存');
};

const deleteScheme = () => {
  if (!selectedMappingScheme.value) {
    return;
  }
  
  const index = mappingSchemes.value.findIndex(scheme => scheme.id === selectedMappingScheme.value);
  if (index !== -1) {
    mappingSchemes.value.splice(index, 1);
    selectedMappingScheme.value = null;
    ElMessage.success('映射方案已删除');
  }
};

// 文件变更处理
const handleFileChange = (file: any) => {
  selectedFile.value = file;
  
  // 验证文件
  const validationResult = validateFile(file);
  if (!validationResult.valid) {
    uploadError.value = validationResult.error || '文件验证失败';
    return;
  }
  
  // 清除之前的错误信息
  uploadError.value = '';
  
  // 模拟添加文件到上传列表
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  uploadedFiles.value.push({
    name: file.name,
    date: formattedDate
  });
  
  // 启动文件处理进度模拟
  simulateFileProcessing();
  
  // 自动更新引导位置
  updateGuidePosition();
  
  // 文件上传后，根据当前引导步骤自动前进
  if (showGuide.value && !guideCompleted.value) {
    // 如果当前是步骤3（上传文件），则自动进入步骤4
    if (currentGuideStep.value === 3) {
      setTimeout(() => {
        currentGuideStep.value = 4;
      }, 800);
    }
  }
};

// 删除上传的文件
const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1);
  // 清除错误信息
  uploadError.value = '';
};

// 检查文件是否有效
const validateFile = (file: any): { valid: boolean, error?: string } => {
  // 检查文件类型
  const allowedTypes = ['.xlsx', '.xls', '.csv'];
  const fileName = file.name.toLowerCase();
  const isValidType = allowedTypes.some(type => fileName.endsWith(type));
  
  if (!isValidType) {
    return {
      valid: false,
      error: `不支持的文件格式: ${fileName}。请上传 xlsx、xls 或 csv 格式的文件。`
    };
  }
  
  // 这里可以添加更多的文件验证逻辑
  // 例如检查文件大小、检查文件结构等
  
  // 模拟检查文件内容
  if (fileName.includes('error') || fileName.includes('invalid')) {
    return {
      valid: false,
      error: '上传失败: 缺失首行标题，请确保Excel文件包含完整的表头信息。'
    };
  }
  
  return { valid: true };
};

// 查看明细
const viewDetails = () => {
  ElMessage.info('查看文件明细');
};

// 下一步
const nextStep = () => {
  if (activeStep.value === 1 && !validateStep1()) {
    return;
  }
  
  if (activeStep.value === 2 && !validateStep2()) {
    return;
  }
  
  activeStep.value++;
  
  // 如果完成了导入文件步骤，完成引导
  if (activeStep.value === 2 && showGuide.value && !guideCompleted.value) {
    completeGuide();
  }
};

// 完成导入
const completeImport = () => {
  ElMessage.success('文件导入成功！');
  // 跳转回项目页
  router.push('/project');
};

// 校验步骤1
const validateStep1 = () => {
  if (!fileTypeSelected.value) {
    //ElMessage.warning('请选择文件类型');
      ElMessage({
    message: '请选择文件类型',
    type: 'warning'
  })
    return false;
  }
  
  if (!selectedFile.value) {
    ElMessage.warning('请选择要上传的文件');
    return false;
  }
  
  // 如果有文件验证错误，阻止进入下一步
  if (uploadError.value) {
    ElMessage.error('请先解决文件错误再继续');
    return false;
  }
  
  return true;
};

// 校验步骤2
const validateStep2 = () => {
  // 检查必填字段是否都已映射
  const requiredUnmapped = mappingData.value
    .filter(item => item.isRequired && !item.isSkuSource)
    .some(item => (!item.sourceField || item.sourceField.length === 0) || !item.targetField);
    
  if (requiredUnmapped) {
    ElMessage.warning('请完成所有必填字段的映射');
    return false;
  }
  
  // 检查SKU字段是否至少有一个源字段
  const skuFields = mappingData.value.filter(item => item.targetField === 'sku');
  if (skuFields.length > 0) {
    const hasValidSkuMapping = skuFields.some(item => item.sourceField && item.sourceField.length > 0);
    if (!hasValidSkuMapping) {
      ElMessage.warning('请为SKU字段至少设置一个源字段');
      return false;
    }
  }
  
  return true;
};

// 模拟文件处理进度
const simulateFileProcessing = () => {
  // 重置进度状态
  showProcessingDialog.value = true;
  processingPercentage.value = 0;
  currentStep.value = 1;
  processingComplete.value = false;
  
  // 模拟解析数据阶段 (0%-30%)
  const parseDataInterval = setInterval(() => {
    if (processingPercentage.value < 30) {
      processingPercentage.value += 2;
    } else {
      clearInterval(parseDataInterval);
      currentStep.value = 2; // 进入验证字段阶段
      
      // 模拟验证字段阶段 (30%-60%)
      const validateFieldsInterval = setInterval(() => {
        if (processingPercentage.value < 60) {
          processingPercentage.value += 3;
        } else {
          clearInterval(validateFieldsInterval);
          currentStep.value = 3; // 进入准备导入阶段
          
          // 模拟准备导入阶段 (60%-90%)
          const prepareImportInterval = setInterval(() => {
            if (processingPercentage.value < 90) {
              processingPercentage.value += 2;
            } else {
              clearInterval(prepareImportInterval);
              currentStep.value = 4; // 进入完成阶段
              
              // 模拟完成阶段 (90%-100%)
              const completeInterval = setInterval(() => {
                if (processingPercentage.value < 100) {
                  processingPercentage.value += 1;
                } else {
                  clearInterval(completeInterval);
                  processingComplete.value = true;
                  
                  // 延迟关闭对话框
                  setTimeout(() => {
                    showProcessingDialog.value = false;
                    ElMessage.success('文件处理完成');
                  }, 1000);
                }
              }, 100);
            }
          }, 150);
        }
      }, 150);
    }
  }, 100);
};

// 返回
const goBack = () => {
  router.push('/');
};

// 取消操作
const cancelOperation = () => {
  ElMessageBox.confirm(
    '确定要取消操作吗？所有已上传的数据将丢失。',
    '此页面显示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('操作已取消');
    // 跳转回项目页
    router.push('/');
  }).catch(() => {
    ElMessage.info('取消操作已撤销');
  });
};

// 下载模板
const handleDownloadTemplate = () => {
  // 根据不同的文件类型提供不同的模板下载
  const templateUrls: Record<string, string> = {
    '销售出库订单': '/templates/sales_order_template.xlsx',
    '物料主数据': '/templates/material_data_template.xlsx',
    '入库单据': '/templates/inbound_receipt_template.xlsx',
    '库存记录': '/templates/inventory_template.xlsx'
  };

  const url = templateUrls[fileTypeSelected.value];
  if (url) {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileTypeSelected.value}导入模板.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success(`${fileTypeSelected.value}导入模板下载成功`);
    
    // 自动更新引导位置
    updateGuidePosition();
    
    // 如果正在引导，移动到下一步（引导用户上传文件）
    if (showGuide.value && !guideCompleted.value && currentGuideStep.value === 2) {
      setTimeout(() => {
        currentGuideStep.value = 3;
      }, 800);
    }
  } else {
    ElMessage.error('模板文件不存在');
  }
};

// 字段处理规则相关数据
const processingRules = ref({
  // 基础编号-特殊字符处理
  externalCode: false,
  packagingCode: false,
  gridCode: false,
  productionDate: false,
  shelfLife: false,
  
  // SKU合并规则
  skuInput: '',
  
  // 表格规则-默认值
  tableRule: {
    enabled: false,
    collapsed: true,
    option: 1
  },
  
  // 物料规格-合并规则设置
  materialSpec: {
    enabled: false,
    collapsed: true,
    option: 1
  },
  
  // 物料编号-合并规则设置
  materialCode: {
    enabled: false,
    collapsed: true,
    option: 1
  },
  
  // 订单状态-合并规则设置
  orderStatus: {
    enabled: false,
    collapsed: true,
    option: 1
  },
  
  // 上架波次号-合并规则设置
  shelfWaveNumber: {
    enabled: false,
    collapsed: true,
    option: 1
  },
  
  // 单个单据-合并规则设置
  singleOrder: {
    enabled: false,
    collapsed: true,
    option: 1
  },
  
  // 物料分类-合并规则设置
  materialCategory: {
    enabled: false,
    collapsed: true,
    option: 1
  },
  
  // 包装长度-合并规则设置
  packagingLength: {
    enabled: false,
    collapsed: true,
    option: 1
  },
  
  // 包装规格-合并规则设置
  packagingSpec: {
    enabled: false,
    collapsed: true,
    option: 1
  }
});

// 定义规则类型，用于索引验证
type RuleKey = 'tableRule' | 'materialSpec' | 'materialCode' | 'orderStatus' | 
               'shelfWaveNumber' | 'singleOrder' | 'materialCategory' | 
               'packagingLength' | 'packagingSpec';

// 折叠/展开规则面板
const toggleRule = (rule: RuleKey) => {
  processingRules.value[rule].collapsed = !processingRules.value[rule].collapsed;
};

onMounted(() => {
  // 从查询参数获取数据
  const id = route.query.id;
  const name = route.query.name;
  
  if (id) {
    projectId.value = parseInt(id.toString(), 10);
    projectName.value = name?.toString() || `项目 ${id}`;
  } else {
    ElMessage.error('缺少项目信息，无法继续');
    router.push('/project');
  }
  
  // 初始化引导提示位置
  updateGuidePosition();
  
  // 设置交互监听
  setupInteractionObserver();
});

// 计算属性：是否有SKU字段
// const hasSKUField = computed(() => {
//   return mappingData.value.some(item => item.targetField === 'sku' && !item.isSkuSource);
// });

// 工具函数：获取SKU字段的索引
// const getSkuFieldIndex = () => {
//   return mappingData.value.findIndex(item => item.targetField === 'sku' && !item.isSkuSource);
// };
</script>

<style scoped lang="scss">
.file-import-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.full-width {
    width: 20%;
    margin-bottom: 10px;
  }

.download-template {
  margin: 10px 0 15px;
}

.system-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;

  .system-title {
    font-size: 18px;
    font-weight: 500;
  }

  .user-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logout-btn {
    color: #409EFF;
  }
}

.import-header {
  margin-bottom: 20px;
  
  h2 {
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  p {
    color: #666;
    margin-bottom: 0;
  }
}

.import-steps {
  margin-bottom: 30px;
}

.step-content {
  margin-bottom: 30px;
}

.step-body {
  min-height: 400px;
}

.step-title {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
}

.file-upload-card,
.mapping-card,
.rules-card {
  margin-bottom: 20px;
}

.file-select-area {
  padding: 10px;
  
  .full-width {
    width: 100%;
  }
}

.upload-area {
  width: 100%;
  
  .upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 0;
  }
  
  .el-icon--upload {
    font-size: 50px;
    color: #8c939d;
    margin-bottom: 16px;
  }
  
  .el-upload__text {
    font-size: 16px;
    color: #606266;
    margin-bottom: 10px;
    
    em {
      color: #409EFF;
      font-style: normal;
      margin-left: 4px;
      cursor: pointer;
    }
  }
  
  .el-upload__tip {
    font-size: 14px;
    color: #909399;
    text-align: center;
  }
}

.uploaded-files {
  margin-top: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  
  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .file-info {
      display: flex;
      align-items: center;
      gap: 20px;
      
      .file-name {
        font-weight: 500;
        color: #303133;
      }
      
      .file-date {
        color: #909399;
        font-size: 13px;
      }
    }
  }
}

.upload-error {
  margin-top: 15px;
  
  .el-alert {
    border-radius: 4px;
  }
}

.import-instructions {
  margin-bottom: 20px;
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #409EFF;

  .instruction-header {
    margin-bottom: 10px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .instruction-list {
    padding-left: 20px;
    margin: 0;
    
    li {
      margin-bottom: 5px;
      color: #666;
    }
  }
}

.mapping-header,
.rules-header {
  margin-bottom: 20px;
  
  h3 {
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  p {
    color: #666;
    margin-bottom: 0;
  }
}

.mapping-instructions {
  margin-bottom: 20px;
  background-color: #f0f9ff;
  padding: 15px 20px;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.mapping-instructions .instruction-header {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
  font-weight: 500;
  color: #409EFF;
}

.mapping-instructions .instruction-list {
  padding-left: 20px;
  margin: 0;
  color: #606266;
}

.mapping-instructions .instruction-list li {
  margin-bottom: 5px;
}

.mapping-table {
  margin-top: 20px;
}

.rules-content {
  .rule-section {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
  }
}

.rule-section-header {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 15px;
  color: #303133;
  display: flex;
  align-items: center;
}

.circle-icon {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #409EFF;
  border-radius: 50%;
  margin-right: 10px;
}

.rule-description {
  color: #606266;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.6;
  padding: 0 10px;
}

.special-chars-section, .sku-section {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.option-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  
  .label {
    color: #606266;
    font-size: 14px;
  }
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

.rule-options {
  padding: 0 10px;
}

.collapsible-rule-section {
  margin-bottom: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fff;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.collapsible-header {
  padding: 12px 15px;
  background-color: #f5f7fa;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .rule-title {
    font-size: 15px;
    color: #303133;
  }
  
  &:hover {
    background-color: #e9ecf2;
  }
  
  .el-icon {
    transition: transform 0.3s;
    font-size: 18px;
    color: #909399;
  }
}

.collapsible-content {
  padding: 15px 0;
  border-top: 1px solid #ebeef5;
  background-color: #f9f9f9;
  transition: all 0.3s ease-in-out;
  max-height: 500px;
  overflow: hidden;
  
  .option-row {
    padding: 12px 20px;
    margin: 0 10px 8px;
    border-radius: 4px;
    background-color: #fff;
    border: 1px solid #ebeef5;
    
    &:hover {
      background-color: #f0f2f5;
    }
    
    &:last-child {
      margin-bottom: 10px;
    }
  }
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-actions,
.right-actions {
  display: flex;
  gap: 10px;
}

// 处理进度对话框相关样式
.processing-dialog-content {
  padding: 10px;

  .processing-title {
    text-align: center;
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 500;
  }

  .processing-steps {
    display: flex;
    justify-content: space-between;
    margin: 30px 0;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 16px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #EBEEF5;
      z-index: 1;
    }

    .processing-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;
      width: 20%;

      .step-circle {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background-color: #EBEEF5;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
        font-weight: 500;
        margin-bottom: 8px;
        transition: all 0.3s;
      }

      .step-name {
        font-size: 14px;
        color: #909399;
        transition: all 0.3s;
      }

      &.active {
        .step-circle {
          background-color: #409EFF;
          color: white;
        }

        .step-name {
          color: #409EFF;
          font-weight: 500;
        }
      }

      &.complete {
        .step-circle {
          background-color: #67C23A;
          color: white;
        }

        .step-name {
          color: #67C23A;
        }
      }
    }
  }

  .processing-notice {
    text-align: center;
    color: #909399;
    font-size: 14px;
    margin-top: 20px;
  }
}

.guide-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  pointer-events: none; /* 允许点击穿透到底层元素 */
}

/* 高亮区域样式 */
.guide-spotlight {
  position: absolute;
  background-color: transparent;
  border: 2px solid #409EFF;
  border-radius: 4px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
  pointer-events: none; /* 允许鼠标点击穿透 */
  z-index: 1001;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  animation: pulse 1.5s infinite alternate;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4), 0 0 5px rgba(64, 158, 255, 0.5);
  }
  100% {
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4), 0 0 15px rgba(64, 158, 255, 0.8);
  }
}

.guide-popup {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: absolute;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  z-index: 1002;
  pointer-events: auto; /* 确保弹出框可以被点击 */
  transform-origin: center center;
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.guide-popup .guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.guide-popup .guide-header .guide-step {
  font-weight: 500;
  color: #409EFF;
}

.guide-popup .guide-header .guide-close {
  color: #909399;
}

.guide-popup .guide-content {
  margin-bottom: 20px;
}

.guide-popup .guide-content h3 {
  margin-bottom: 10px;
  font-weight: 500;
  color: #303133;
}

.guide-popup .guide-content p {
  color: #606266;
  line-height: 1.5;
  font-size: 14px;
}

.guide-popup .guide-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 箭头基本样式 */
.guide-popup::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

/* 箭头位置 - 根据动态放置位置调整 */
.guide-placement-top::after {
  border-top-color: white;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
}

.guide-placement-bottom::after {
  border-bottom-color: white;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
}

.guide-placement-left::after {
  border-left-color: white;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
}

.guide-placement-right::after {
  border-right-color: white;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
}

/* 居中位置不显示箭头 */
.guide-placement-center::after {
  display: none;
}

.mapping-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
}

.scheme-selection {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  
  .scheme-select {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .scheme-select-input {
    width: 240px;
  }
  
  .save-scheme-btn {
    font-weight: normal;
  }
}

.add-field-btn {
  margin-bottom: 15px;
}

.required-tag {
  margin: 0 auto;
  padding: 2px 8px;
}

// 添加一些动画效果
.collapsible-content {
  transition: all 0.3s ease-in-out;
  max-height: 500px;
  overflow: hidden;
}

// 容器宽度控制
.step-body {
  min-height: 400px;
  max-width: 1000px;
  margin: 0 auto;
}

.sku-section {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.sku-input-container {
  display: flex;
  align-items: center;
  gap: 15px;
  
  .label {
    color: #606266;
    font-size: 14px;
    white-space: nowrap;
  }
  
  .el-input {
    width: 300px;
    max-width: 100%;
  }
}

/* 添加新的边框容器样式 */
.import-area-bordered {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #fff;
}

.sku-source-field {
  position: relative;
  padding-top: 20px;
  padding-left: 10px;
  margin-left: 5px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sku-source-label {
  position: absolute;
  top: 0;
  left: 10px;
  background-color: #e6f2ff;
  padding: 0 8px;
  color: #409EFF;
  font-size: 12px;
  border-radius: 10px;
  line-height: 18px;
}

.add-sku-source-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 5px;
  z-index: 2;
}

.add-source-field-row {
  display: flex;
  align-items: center;
  padding: 10px 10px 10px 30px;
  border: 1px dashed #dcdfe6;
  border-top: none;
  background-color: #f9f9f9;
  width: calc(43% - 20px);
  margin-bottom: 15px;
  margin-left: 10px;
  border-radius: 0 0 4px 4px;
  box-sizing: border-box;

  .add-source-btn {
    background-color: #67c23a;
    border-color: #67c23a;
    color: white;
    margin-right: 8px;
    
    &:hover {
      opacity: 0.9;
      background-color: #67c23a;
      border-color: #67c23a;
      color: white;
    }
  }

  .add-source-text {
    color: #303133;
    font-size: 14px;
  }
}

.sku-field-container {
  position: relative;
}

.add-source-btn-container {
  display: flex;
  align-items: center;
  margin-top: 10px;
  
  .add-source-btn {
    background-color: #67c23a;
    border-color: #67c23a;
    color: white;
    margin-right: 8px;
    
    &:hover {
      opacity: 0.9;
      background-color: #67c23a;
      border-color: #67c23a;
      color: white;
    }
  }
  
  .add-source-text {
    color: #303133;
    font-size: 14px;
    cursor: pointer;
  }
}

/* 新增：源字段行样式 */
.source-field-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  animation: slideDown 0.3s ease-out;
  transform-origin: top center;
  
  .el-select {
    flex: 1;
    margin-right: 8px;
  }
  
  .el-button {
    flex-shrink: 0;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
}

/* 新添加字段高亮效果 */
.highlight-field {
  animation: pulse-highlight 1.5s ease;
}

@keyframes pulse-highlight {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.6);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(64, 158, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}

/* 添加源字段动画效果 */
@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-15px) scaleY(0.8);
  }
  60% {
    opacity: 1;
    transform: translateY(3px) scaleY(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
}

/* 删除源字段动画效果 */
@keyframes fadeOut {
  0% {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-15px) scaleY(0.8);
    max-height: 0;
  }
}

/* 添加源字段按钮样式增强 */
.add-source-btn-container {
  display: flex;
  align-items: center;
  margin-top: 10px;
  
  .add-source-btn {
    background-color: #67c23a;
    border-color: #67c23a;
    color: white;
    margin-right: 8px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    &:hover {
      opacity: 0.9;
      background-color: #67c23a;
      border-color: #67c23a;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(103, 194, 58, 0.25);
    }
    
    &:active {
      transform: translateY(1px);
      box-shadow: 0 2px 4px rgba(103, 194, 58, 0.25);
    }
  }
  
  .add-source-text {
    color: #303133;
    font-size: 14px;
    cursor: pointer;
  }
}
</style> 