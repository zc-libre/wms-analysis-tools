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
      <!-- 步骤1: 导入文件 - Replaced with Step1ImportFile component -->
      <div v-if="activeStep === 1" class="step-body">
        <Step1ImportFile 
          :file-type-selected="fileTypeSelected" 
          :current-guide-step="currentGuideStep" 
          :show-guide="showGuide" 
          :guide-completed="guideCompleted"
          @update:fileTypeSelected="fileTypeSelected = $event"
          @download-template-clicked="handleDownloadTemplate"
          @file-changed-raw="handleFileChange" 
          @element-ready="handleChildElementReady" 
          @guide-interaction="handleChildGuideInteraction"
        />
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
            <li>请将上传文件中的原始字段与系统销售出库订单字段进行映射，以确保数据正确导入。</li>
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
        
        <!-- 新增：方案名称和描述输入区域，仅在未选择方案时显示 -->
        <div v-if="!selectedMappingScheme" class="new-scheme-inputs">
          <el-form label-position="top">
            <el-form-item label="方案名称" required>
              <el-input 
                v-model="newSchemeName" 
                placeholder="输入方案名称，例如：标准处理规则" 
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
                  <div v-for="(_, index) in scope.row.sourceField" :key="index" class="source-field-row">
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
            <li>请配置各个字段的处理规则，以确保数据导入过程中能够正确处理异常情况。</li>
            <li>可以选择已保存的映射方案快速完成配置。</li>
            <li>不同类型的字段有不同的规则选项，可以根据需要开启或关闭。</li>
            <li>开启必填校验规则的字段，如有缺失数据将被标记为异常。</li>
            <li>点击保存后，规则方案将被保存并可在下次导入时使用。</li>
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
        
        <!-- 新增：方案名称和描述输入区域，仅在未选择方案时显示 -->
        <div v-if="!selectedMappingScheme" class="new-scheme-inputs">
          <el-form label-position="top">
            <el-form-item label="方案名称" required>
              <el-input 
                v-model="newSchemeName" 
                placeholder="输入方案名称，例如：标准处理规则" 
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
              
        <!-- SKU合并规则 -->
        <div class="collapsible-rule-section" v-if="shouldShowRule('skuCombination')">
          <div class="collapsible-header" @click="toggleRule('skuCombination')">
            <div class="header-left">
              <el-switch v-model="processingRules.skuCombination.enabled" @click.stop="handleSwitchChange('skuCombination', $event)" />
              <span class="rule-title">库存合并</span>
            </div>
            <el-icon>
              <component :is="processingRules.skuCombination.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.skuCombination.collapsed" class="collapsible-content">
            <div class="enhanced-rule-description">
              <el-icon class="description-icon"><InfoFilled /></el-icon>
              <div class="description-content">
                <p>开启后，在<strong>SKU相同</strong>的情况下，选择哪些属性的值一致的情况下才会进行合并。</p>
                <div class="example-box">
                  <p class="example-title"><el-icon><Warning /></el-icon> 示例：</p>
                  <p>假设选择了<span class="highlight-text">质检状态</span>（未检测、合格、不合格），则：</p>
                  <ul class="example-list">
                    <li><el-tag size="small" effect="plain">未检测</el-tag> 状态的SKU记录彼此合并</li>
                    <li><el-tag size="small" effect="plain">合格</el-tag> 状态的SKU记录彼此合并</li>
                    <li><el-tag size="small" effect="plain">不合格</el-tag> 状态的SKU记录彼此合并</li>
                  </ul>
                  <p class="note-text"><el-icon><CircleCheck /></el-icon> 不同状态之间的SKU记录<strong>不会</strong>进行合并</p>
                </div>
              </div>
            </div>
            
            <div class="special-chars-section">
              <div class="section-title">
                <el-icon><Menu /></el-icon>
                <span>选择合并条件</span>
              </div>
              <div class="special-chars-list">
                <div class="checkbox-item">
                  <el-checkbox v-model="processingRules.skuCombination.externalBatch">外部批次</el-checkbox>
                </div>
                <div class="checkbox-item">
                  <el-checkbox v-model="processingRules.skuCombination.packagingCode">包装代码</el-checkbox>
                </div>
                <div class="checkbox-item">
                  <el-checkbox v-model="processingRules.skuCombination.qualityStatus">质检状态</el-checkbox>
                </div>
                <div class="checkbox-item">
                  <el-checkbox v-model="processingRules.skuCombination.productionDate">生产日期</el-checkbox>
                </div>
                <div class="checkbox-item">
                  <el-checkbox v-model="processingRules.skuCombination.shelfLife">保质期</el-checkbox>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 单据类型 - 默认值 -->
        <div class="collapsible-rule-section document-type-section" v-if="shouldShowRule('tableRule')">
          <div class="collapsible-header" @click="toggleRule('tableRule')">
            <div class="header-left">
              <el-switch v-model="processingRules.tableRule.enabled" @click.stop="handleSwitchChange('tableRule', $event)" />
              <span class="rule-title">单据类型 - 默认值</span>
            </div>
            <el-icon>
              <component :is="processingRules.tableRule.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.tableRule.collapsed" class="collapsible-content">
            <div class="enhanced-rule-description">
              <el-icon class="description-icon"><InfoFilled /></el-icon>
              <div class="description-content">
                <p>系统支持为空白字段自动填充默认值，开启此选项可确保导入数据的完整性。</p>
              </div>
            </div>
            <div class="default-value-container">
              <div class="default-value-item">
                <el-input
                  v-model="processingRules.tableRule.defaultType"
                  class="default-value-input"
                  placeholder="例如：销售出库"
                >
                  <template #prepend>默认值</template>
                  <template #append>
                    <el-tooltip content="此值将用于填充表格中空白的单据类型字段" placement="top">
                      <el-icon><InfoFilled /></el-icon>
                    </el-tooltip>
                  </template>
                </el-input>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 单据项 - 默认值 -->
        <div class="collapsible-rule-section document-type-section" v-if="shouldShowRule('documentItemRule')">
          <div class="collapsible-header" @click="toggleRule('documentItemRule')">
            <div class="header-left">
              <el-switch v-model="processingRules.documentItemRule.enabled" @click.stop="handleSwitchChange('documentItemRule', $event)" />
              <span class="rule-title">单据项 - 默认值</span>
            </div>
            <el-icon>
              <component :is="processingRules.documentItemRule.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.documentItemRule.collapsed" class="collapsible-content">
            <div class="enhanced-rule-description">
              <el-icon class="description-icon"><InfoFilled /></el-icon>
              <div class="description-content">
                <p>系统支持为空白字段自动填充默认值，开启此选项可确保导入数据的完整性。</p>
              </div>
            </div>
            <div class="default-value-container">
              <div class="default-value-item">
                <el-input
                  v-model="processingRules.documentItemRule.defaultValue"
                  class="default-value-input"
                  placeholder="例如：标准项"
                >
                  <template #prepend>默认值</template>
                  <template #append>
                    <el-tooltip content="此值将用于填充表格中空白的单据项字段" placement="top">
                      <el-icon><InfoFilled /></el-icon>
                    </el-tooltip>
                  </template>
                </el-input>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 物料编号 - 异常值处理 -->
        <div class="collapsible-rule-section" v-if="shouldShowRule('materialSpec')">
          <div class="collapsible-header" @click="toggleRule('materialSpec')">
            <div class="header-left">
              <el-switch v-model="processingRules.materialSpec.enabled" @click.stop="handleSwitchChange('materialSpec', $event)" />
              <span class="rule-title">物料编号 - 异常值处理</span>
            </div>
            <el-icon>
              <component :is="processingRules.materialSpec.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.materialSpec.collapsed" class="collapsible-content">
            <div class="enhanced-rule-description">
              <el-icon class="description-icon"><InfoFilled /></el-icon>
              <div class="description-content">
                <p>系统支持对异常值进行处理，开启此选项可确保导入数据的质量。</p>
              </div>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.materialSpec.option" :label="1">删除（跳过该行数据）</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.materialSpec.option" :label="2">默认值替换</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.materialSpec.option" :label="3">随机生成</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 需求数量 - 异常值处理 -->
        <div class="collapsible-rule-section" v-if="shouldShowRule('materialCode')">
          <div class="collapsible-header" @click="toggleRule('materialCode')">
            <div class="header-left">
              <el-switch v-model="processingRules.materialCode.enabled" @click.stop="handleSwitchChange('materialCode', $event)" />
              <span class="rule-title">需求数量 - 异常值处理</span>
            </div>
            <el-icon>
              <component :is="processingRules.materialCode.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.materialCode.collapsed" class="collapsible-content">
            <div class="enhanced-rule-description">
              <el-icon class="description-icon"><InfoFilled /></el-icon>
              <div class="description-content">
                <p>系统支持对异常值进行处理，开启此选项可确保导入数据的质量。</p>
              </div>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.materialCode.option" :label="1">删除（跳过该行数据）</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.materialCode.option" :label="2">平均值替换</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.materialCode.option" :label="3">中位数替换</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.materialCode.option" :label="4">默认值替换</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 订单优先级 - 异常值处理-->
        <div class="collapsible-rule-section" v-if="shouldShowRule('orderStatus')">
          <div class="collapsible-header" @click="toggleRule('orderStatus')">
            <div class="header-left">
              <el-switch v-model="processingRules.orderStatus.enabled" @click.stop="handleSwitchChange('orderStatus', $event)" />
              <span class="rule-title">订单优先级 - 异常值处理</span>
            </div>
            <el-icon>
              <component :is="processingRules.orderStatus.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.orderStatus.collapsed" class="collapsible-content">
            <div class="enhanced-rule-description">
              <el-icon class="description-icon"><InfoFilled /></el-icon>
              <div class="description-content">
                <p>系统支持对异常值进行处理，开启此选项可确保导入数据的质量。</p>
              </div>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.orderStatus.option" :label="1">删除（跳过该行数据）</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.orderStatus.option" :label="2">默认值替换</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 上级波次编号 - 异常值处理 -->
        <div class="collapsible-rule-section" v-if="shouldShowRule('shelfWaveNumber')">
          <div class="collapsible-header" @click="toggleRule('shelfWaveNumber')">
            <div class="header-left">
              <el-switch v-model="processingRules.shelfWaveNumber.enabled" @click.stop="handleSwitchChange('shelfWaveNumber', $event)" />
              <span class="rule-title">上级波次编号 - 异常值处理</span>
            </div>
            <el-icon>
              <component :is="processingRules.shelfWaveNumber.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.shelfWaveNumber.collapsed" class="collapsible-content">
            <div class="enhanced-rule-description">
              <el-icon class="description-icon"><InfoFilled /></el-icon>
              <div class="description-content">
                <p>系统支持对异常值进行处理，开启此选项可确保导入数据的质量。</p>
              </div>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.shelfWaveNumber.option" :label="1">删除（跳过该行数据）</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.shelfWaveNumber.option" :label="2">默认值替换</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.shelfWaveNumber.option" :label="3">随机生成</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 单个体积 - 异常值处理 -->
        <div class="collapsible-rule-section" v-if="shouldShowRule('singleOrder')">
          <div class="collapsible-header" @click="toggleRule('singleOrder')">
            <div class="header-left">
              <el-switch v-model="processingRules.singleOrder.enabled" @click.stop="handleSwitchChange('singleOrder', $event)" />
              <span class="rule-title">单个体积 - 异常值处理</span>
            </div>
            <el-icon>
              <component :is="processingRules.singleOrder.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.singleOrder.collapsed" class="collapsible-content">
            <div class="enhanced-rule-description">
              <el-icon class="description-icon"><InfoFilled /></el-icon>
              <div class="description-content">
                <p>系统支持对异常值进行处理，开启此选项可确保导入数据的质量。</p>
              </div>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.singleOrder.option" :label="1">删除（跳过该行数据）</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.singleOrder.option" :label="2">默认值替换</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.singleOrder.option" :label="3">随机生成</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 物料冷热度 - 异常值处理 -->
        <div class="collapsible-rule-section" v-if="shouldShowRule('materialCategory')">
          <div class="collapsible-header" @click="toggleRule('materialCategory')">
            <div class="header-left">
              <el-switch v-model="processingRules.materialCategory.enabled" @click.stop="handleSwitchChange('materialCategory', $event)" />
              <span class="rule-title">物料冷热度 - 异常值处理</span>
            </div>
            <el-icon>
              <component :is="processingRules.materialCategory.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.materialCategory.collapsed" class="collapsible-content">
            <div class="enhanced-rule-description">
              <el-icon class="description-icon"><InfoFilled /></el-icon>
              <div class="description-content">
                <p>系统支持对异常值进行处理，开启此选项可确保导入数据的质量。</p>
              </div>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.materialCategory.option" :label="1">删除（跳过该行数据）</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.materialCategory.option" :label="2">默认值替换</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.materialCategory.option" :label="3">随机生成</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 包装长度 - 异常值处理 -->
        <div class="collapsible-rule-section" v-if="shouldShowRule('packagingLength')">
          <div class="collapsible-header" @click.stop="toggleRule('packagingLength')">
            <div class="header-left">
              <el-switch v-model="processingRules.packagingLength.enabled" @click.stop="handleSwitchChange('packagingLength', $event)" />
              <span class="rule-title">包装长度 - 异常值处理</span>
            </div>
            <el-icon>
              <component :is="processingRules.packagingLength.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.packagingLength.collapsed" class="collapsible-content">
            <div class="enhanced-rule-description">
              <el-icon class="description-icon"><InfoFilled /></el-icon>
              <div class="description-content">
                <p>系统支持对异常值进行处理，开启此选项可确保导入数据的质量。</p>
              </div>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.packagingLength.option" :label="1">删除（跳过该行数据）</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.packagingLength.option" :label="2">默认值替换</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.packagingLength.option" :label="3">随机生成</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 包装宽度 - 异常值处理 -->
        <div class="collapsible-rule-section" v-if="shouldShowRule('packagingSpec')">
          <div class="collapsible-header" @click="toggleRule('packagingSpec')">
            <div class="header-left">
              <el-switch v-model="processingRules.packagingSpec.enabled" @click.stop="handleSwitchChange('packagingSpec', $event)" />
              <span class="rule-title">包装宽度 - 异常值处理</span>
            </div>
            <el-icon>
              <component :is="processingRules.packagingSpec.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.packagingSpec.collapsed" class="collapsible-content">
            <div class="enhanced-rule-description">
              <el-icon class="description-icon"><InfoFilled /></el-icon>
              <div class="description-content">
                <p>系统支持对异常值进行处理，开启此选项可确保导入数据的质量。</p>
              </div>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.packagingSpec.option" :label="1">删除（跳过该行数据）</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.packagingSpec.option" :label="2">默认值替换</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.packagingSpec.option" :label="3">随机生成</el-radio>
            </div>
          </div>
        </div>
        
        <!-- 包装高度 - 异常值处理 -->
        <div class="collapsible-rule-section" v-if="shouldShowRule('packagingHeight')">
          <div class="collapsible-header" @click="toggleRule('packagingHeight')">
            <div class="header-left">
              <el-switch v-model="processingRules.packagingHeight.enabled" @click.stop="handleSwitchChange('packagingHeight', $event)" />
              <span class="rule-title">包装高度 - 异常值处理</span>
            </div>
            <el-icon>
              <component :is="processingRules.packagingHeight.collapsed ? icons.ArrowRight : icons.ArrowDown" />
            </el-icon>
          </div>
          
          <div v-if="!processingRules.packagingHeight.collapsed" class="collapsible-content">
            <div class="enhanced-rule-description">
              <el-icon class="description-icon"><InfoFilled /></el-icon>
              <div class="description-content">
                <p>系统支持对异常值进行处理，开启此选项可确保导入数据的质量。</p>
              </div>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.packagingHeight.option" :label="1">删除（跳过该行数据）</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.packagingHeight.option" :label="2">默认值替换</el-radio>
            </div>
            <div class="option-row">
              <el-radio v-model="processingRules.packagingHeight.option" :label="3">随机生成</el-radio>
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
        <el-button @click="goBack" v-if="activeStep === 1" ><el-icon><ArrowLeft /></el-icon> 返回</el-button>
        <el-button v-if="activeStep > 1" @click="previousStep"><el-icon><ArrowLeft /></el-icon> 上一步</el-button>
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
        <el-button v-if="activeStep === 3" type="primary" @click="submitAnalysis" class="analysis-btn">
          <el-icon><DataAnalysis /></el-icon> 提交分析
        </el-button>
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
            <div class="step-name">上传到服务器</div>
          </div>
          <div class="processing-step" :class="{ 'active': currentStep >= 5, 'complete': currentStep > 5 }">
            <div class="step-circle">5</div>
            <div class="step-name">完成</div>
          </div>
        </div>
        
        <div class="processing-status">
          <div class="status-item">
            <span class="status-label">当前状态:</span>
            <span class="status-value">{{ fileProcessingStatus.processingStep }}</span>
          </div>
          <div class="status-item" v-if="fileProcessingStatus.totalRows > 0">
            <span class="status-label">已处理行数:</span>
            <span class="status-value">{{ fileProcessingStatus.processedRows }} / {{ fileProcessingStatus.totalRows }}</span>
          </div>
          <div class="status-item" v-if="currentStep >= 4 && fileUploadStatus.totalBytes > 0">
            <span class="status-label">上传进度:</span>
            <span class="status-value">{{ (fileUploadStatus.uploadedBytes / (1024*1024)).toFixed(2) }} MB / {{ (fileUploadStatus.totalBytes / (1024*1024)).toFixed(2) }} MB ({{ fileUploadStatus.uploadPercentage }}%)</span>
          </div>
          <div class="status-item" v-if="currentStep >= 4">
            <span class="status-label">上传状态:</span>
            <span class="status-value">{{ fileUploadStatus.uploadingStep }}</span>
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
import type { UploadFile } from 'element-plus';
import { InfoFilled, Delete as DeleteIcon, Document, Close, Plus, ArrowDown, ArrowRight, ArrowLeft, Warning, CircleCheck, Menu, DataAnalysis } from '@element-plus/icons-vue';
import * as XLSX from 'xlsx';
import { useProjectStore } from '../stores/project';
import Step1ImportFile from '@/components/FileImport/Step1ImportFile.vue';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const fileTypeSelected = ref('')
const activeStep = ref(1);

// Simplified parent error handling, child handles its own UI errors for uploads.
// Parent can show global messages for things like processing errors.
const handleParentErrorMessage = (errorMsg: string) => {
  ElMessage.error(errorMsg);
};

const showGuide = ref(true);
const currentGuideStep = ref(1);
const guideCompleted = ref(false);
const guideTargetElements = ref<Record<string, any>>({});

const icons = {
  ArrowDown,
  ArrowRight
};

interface GuideStep {
  id: number;
  title: string;
  content: string;
  targetName: string;
  placement: string;
  [key: string]: any;
}

const guideStepsRaw: GuideStep[] = [
  {
    id: 1,
    title: '第一步：选择文件类型',
    content: '请先从下拉菜单中选择您需要导入的文件类型，不同的文件类型有不同的模板格式。',
    targetName: 'fileTypeSelect',
    placement: 'bottom'
  },
  {
    id: 2,
    title: '第二步：下载模板',
    content: '点击下载按钮获取导入模板。您需要按照模板格式准备数据，确保数据能正确导入系统。',
    targetName: 'downloadTemplate',
    placement: 'bottom'
  },
  {
    id: 3,
    title: '第三步：上传文件',
    content: '请将按照模板格式准备好的文件拖拽到此区域或点击上传。支持Excel和CSV格式的文件。',
    targetName: 'fileUploadArea',
    placement: 'top'
  },
  {
    id: 4,
    title: '最后一步：继续',
    content: '文件上传并验证成功后，点击"下一步"按钮进入字段映射环节。',
    targetName: 'nextStepButton',
    placement: 'left'
  }
];

const guideSteps = ref<GuideStep[]>(guideStepsRaw.map(s => ({ ...s })));

const getCurrentGuide = (): GuideStep => {
  const stepConfig = guideSteps.value.find((step: GuideStep) => step.id === currentGuideStep.value);
  let currentStepDetails: GuideStep = stepConfig || guideSteps.value[0];
  
  let stepOutput = { ...currentStepDetails }; 

  if (stepOutput.id === 1 && fileTypeSelected.value) {
    stepOutput.content = `您已选择 "${fileTypeSelected.value}"，现在可以下载对应的模板文件了。`;
  } else if (stepOutput.id === 2 && fileTypeSelected.value) {
    stepOutput.content = `请下载 "${fileTypeSelected.value}" 的导入模板，按照模板格式准备您的数据文件，以保证导入成功。`;
  }
  // Removed uploadedFiles.value.length check here. The guide content might need adjustment
  // or rely on a different flag if it needs to reflect the number of uploaded files.
  else if (stepOutput.id === 3 /* && uploadedFiles.value.length > 0 */) { 
    stepOutput.content = '文件已选择！您可以点击页面上的"下一步"按钮继续操作。'; // Adjusted message
  } else if (stepOutput.id === 4 /* && uploadedFiles.value.length > 0 */) {
    stepOutput.content = `文件已准备好，点击"下一步"按钮进入字段映射环节。`; // Adjusted message
  }
  return stepOutput;
};

const nextStepButton = ref<any>(null);
const guidePopupStyle = ref({});
const spotlightStyle = ref({});

const updateGuidePosition = async () => {
  await nextTick();
  const currentGuide = getCurrentGuide();
  const targetName = currentGuide.targetName;
  let targetElementInstance: any = null;

  if (targetName === 'nextStepButton') {
    targetElementInstance = nextStepButton.value;
  } else if (guideTargetElements.value[targetName]) {
    targetElementInstance = guideTargetElements.value[targetName];
  }
  
  const targetDOMElement = targetElementInstance?.$el || targetElementInstance;

  if (targetDOMElement) {
    const rect = targetDOMElement.getBoundingClientRect();
    let placement = currentGuide.placement;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Declare these variables once
    const popupWidth = Math.min(320, viewportWidth * 0.8);
    const popupHeight = 150; 
    const arrowSize = 10;
    const margin = 15;
    let top, left; // Declare top and left here, assign below

    spotlightStyle.value = {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
    };
    
    // 智能计算最佳放置位置，避免溢出屏幕
    // 优先使用指定的位置，但如果空间不足则自动调整
    if (placement === 'top' && rect.top > popupHeight + margin + arrowSize) {
      // 顶部有足够空间
      top = rect.top - popupHeight - margin - arrowSize;
      left = rect.left + rect.width / 2 - popupWidth / 2;
      // currentGuide.placement = 'bottom'; // Do not modify currentGuide.placement here, it's reactive state
      placement = 'bottom';
    } else if (placement === 'bottom' && viewportHeight - rect.bottom > popupHeight + margin + arrowSize) {
      // 底部有足够空间
      top = rect.bottom + margin + arrowSize;
      left = rect.left + rect.width / 2 - popupWidth / 2;
      // currentGuide.placement = 'top';
      placement = 'top';
    } else if (placement === 'left' && rect.left > popupWidth + margin + arrowSize) {
      // 左侧有足够空间
      top = rect.top + rect.height / 2 - popupHeight / 2;
      left = rect.left - popupWidth - margin + arrowSize;
      // currentGuide.placement = 'right';
      placement = 'right';
    } else if (placement === 'right' && viewportWidth - rect.right > popupWidth + margin + arrowSize) {
      // 右侧有足够空间
      top = rect.top + rect.height / 2 - popupHeight / 2;
      left = rect.right + margin + arrowSize;
      // currentGuide.placement = 'left';
      placement = 'left';
    } else {
      // 根据可用空间自动选择位置
      if (viewportHeight - rect.bottom > popupHeight + margin + arrowSize) {
        // 放底部
        top = rect.bottom + margin + arrowSize;
        left = rect.left + rect.width / 2 - popupWidth / 2;
        // currentGuide.placement = 'bottom';
        placement = 'bottom';
      } else if (rect.top > popupHeight + margin + arrowSize) {
        // 放顶部
        top = rect.top - popupHeight - margin - arrowSize;
        left = rect.left + rect.width / 2 - popupWidth / 2;
        // currentGuide.placement = 'top';
        placement = 'top';
      } else if (viewportWidth - rect.right > popupWidth + margin + arrowSize) {
        // 放右侧
        top = rect.top + rect.height / 2 - popupHeight / 2;
        left = rect.right + margin + arrowSize;
        // currentGuide.placement = 'right';
        placement = 'right';
      } else if (rect.left > popupWidth + margin + arrowSize) {
        // 放左侧
        top = rect.top + rect.height / 2 - popupHeight / 2;
        left = rect.left - popupWidth - margin + arrowSize;
        // currentGuide.placement = 'left';
        placement = 'left';
      } else {
        // 居中显示（最后手段）
        top = (viewportHeight - popupHeight) / 2;
        left = (viewportWidth - popupWidth) / 2;
        // currentGuide.placement = 'center';
        placement = 'center';
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
        // popup.className = `guide-popup guide-placement-${currentGuide.placement}`; // Use the resolved placement
        popup.className = `guide-popup guide-placement-${placement}`;
      }
    }, 0);
  }
};

// 文件处理状态
const fileProcessingStatus = ref({
  totalRows: 0,
  processedRows: 0,
  processingStep: '准备解析', // '解析数据', '验证字段', '准备导入', '完成'
});

// 文件上传状态
const fileUploadStatus = ref({
  uploadedBytes: 0,
  totalBytes: 0,
  uploadPercentage: 0,
  uploadingStep: '准备上传', // '准备上传', '获取授权', '上传中', '上传完成'
  uploadUrl: '',
});

// 文件内容相关
const fileData = ref<any[]>([]);
const fileHeaders = ref<string[]>([]); // 初始化为空数组
const previewData = ref<Record<string, string>>({});

// 文件处理进度相关
const showProcessingDialog = ref(false);
const processingPercentage = ref(0);
const currentStep = ref(1);
const processingComplete = ref(false);

// 导入文件相关数据
const projectId = ref<number | null>(null);
const projectName = ref('');

const selectedFile = ref<File | null>(null); // Keep as File, as .raw is File type

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
const handleFileChange = (uploadFileFromChild: UploadFile, 
                          callbacks: { 
                            showError: (msg: string) => void; 
                            addFileToList: (fileInfo: { name: string; date: string; size?: string }) => void; 
                            clearError: () => void; 
                          }) => { 
  const file = uploadFileFromChild.raw;
  if (!file) {
    callbacks.showError('无法获取原始文件数据');
    return;
  }

  if (!fileTypeSelected.value) {
    // Parent can still show a global message, or rely on child's handling if appropriate
    ElMessage.warning('请先选择导入文件类型'); 
    // callbacks.showError('请先选择导入文件类型'); // Or use child's error display
    return;  
  }
  
  selectedFile.value = file;
  
  const validationResult = validateFile(file); // Parent still validates the raw file
  if (!validationResult.valid) {
    callbacks.showError(validationResult.error || '文件验证失败');
    return;
  }
  
  callbacks.clearError(); // Clear any previous error in child UI
  
  // Add to child's list successfully
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  callbacks.addFileToList({
    name: file.name,
    date: formattedDate,
    size: formatFileSize(file.size) 
  });
  
  // Proceed with parent-level processing (reading file content, etc.)
  processFileWithProgress(file);
  
  // Guide logic in parent remains largely the same
  if (showGuide.value && !guideCompleted.value) {
    // This uses parent's uploadedFiles.length, which is now removed. 
    // The condition for auto-advancing guide step 3 should be re-evaluated.
    // For now, we assume that if a file is processed by `processFileWithProgress`,
    // it implies a successful upload for guide purposes.
    if (currentGuideStep.value === 3) { 
      setTimeout(() => {
        currentGuideStep.value = 4;
      }, 800);
    }
  }
};

const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return size + ' B';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB';
  } else if (size < 1024 * 1024 * 1024) {
    return (size / 1024 / 1024).toFixed(2) + ' MB';
  } else {
    return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  }
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
  
  // 检查文件大小
  const maxSize = 200 * 1024 * 1024; // 200MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `文件大小超过限制。最大支持 200MB，当前文件大小: ${formatFileSize(file.size)}`
    };
  }
  
  // 已上传文件检查
  const fileExists = uploadedFiles.value.some(uploadedFile => uploadedFile.name === file.name);
  if (fileExists) {
    return {
      valid: false,
      error: `文件 "${file.name}" 已存在，请删除后重新上传或更换文件名`
    };
  }
  
  return { valid: true };
};

// 查看明细
const viewDetails = () => {
  projectStore.setFileType(fileTypeSelected.value);
  
  // 导航到文件明细页面，不再使用查询参数
  router.push({
    path: '/cleanout-result'
  });
};

// 下一步
const nextStep = () => {
  if (activeStep.value === 1 && !validateStep1()) {
    return;
  }
  
  if (activeStep.value === 2 && !validateStep2()) {
    return;
  }

  // 如果下一步将进入第三步（字段处理规则），预先检查字段头部信息
  if (activeStep.value === 2) {
    console.log('准备进入第三步，当前文件头部字段:', fileHeaders.value);
    // 测试几个规则是否会显示
    console.log('单据编号规则是否显示:', shouldShowRule('documentNumberValidation'));
    console.log('SKU合并规则是否显示:', shouldShowRule('skuCombination'));
  }
  
  activeStep.value++;
  
  // 如果完成了导入文件步骤，完成引导
  if (activeStep.value === 2 && showGuide.value && !guideCompleted.value) {
    completeGuide();
  }
};

// 完成导入
const completeImport = () => {
  // 显示加载中提示
  ElMessage({
    message: '正在提交数据，请稍候...',
    type: 'info',
    duration: 2000
  });
  
  // 准备要提交的数据（记录日志）
  console.log('准备提交的数据:', {
    projectId: projectId.value,
    fileType: fileTypeSelected.value,
    filesCount: uploadedFiles.value.length,
    mappingFields: mappingData.value.length,
    processingRules: Object.keys(processingRules.value).filter(key => 
      processingRules.value[key as keyof typeof processingRules.value].enabled
    )
  });
  
  // 模拟API调用和数据处理
  setTimeout(() => {
    // 记录完成日志
    console.log('文件导入完成');
    
    // 成功消息
    ElMessage.success('文件导入成功！数据已保存至系统');
    
    // 返回项目页面并刷新
    setTimeout(() => {
      router.push('/');
    }, 1000);
  }, 1500);
};

// 校验步骤1
const validateStep1 = () => {
  // 检查是否选择了文件类型
  if (!fileTypeSelected.value) {
    ElMessage.warning('请选择文件类型');
    return false;
  }
  
  // 检查是否选择了文件
  if (!selectedFile.value) {
    ElMessage.warning('请选择要上传的文件');
    return false;
  }
  
  // 检查是否有文件验证错误
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

// 返回上一步
const previousStep = () => {
  if (activeStep.value > 1) {
    activeStep.value--;
  }
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
  // 单据编号-特殊字符校验
  documentNumberValidation: {
    enabled: false,
    collapsed: true,
    externalCode: false,
    packagingCode: false,
    gridCode: false,
    productionDate: false,
    shelfLife: false,
    // 新增特殊字符属性
    atSymbol: false,
    percentSymbol: false,
    hyphen: false,
    dash: false,
    underscore: false
  },
  
  // SKU合并规则
  skuCombination: {
    enabled: false,
    collapsed: true,
    skuInput: '',
    // 新增属性
    externalBatch: false,
    packagingCode: false,
    qualityStatus: false,
    productionDate: false,
    shelfLife: false
  },
  
  // 表格规则-默认值
  tableRule: {
    enabled: false,
    collapsed: true,
    option: 1,
    activeTab: 'default',  // 添加此属性
    defaultType: '销售出库'  // 添加此属性
  },
  
  // 单据项-默认值
  documentItemRule: {
    enabled: false,
    collapsed: true,
    defaultValue: '标准项'
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
  },
  
  // 包装高度-合并规则设置
  packagingHeight: {
    enabled: false,
    collapsed: true,
    option: 1
  }
});

// 定义规则类型，用于索引验证
type RuleKey = 'documentNumberValidation' | 'skuCombination' | 'tableRule' | 'documentItemRule' | 'materialSpec' | 'materialCode' | 
               'orderStatus' | 'shelfWaveNumber' | 'singleOrder' | 'materialCategory' | 
               'packagingLength' | 'packagingSpec' | 'packagingHeight';

// 折叠/展开规则面板
const toggleRule = (rule: RuleKey) => {
  processingRules.value[rule].collapsed = !processingRules.value[rule].collapsed;
  processingRules.value[rule].enabled = !processingRules.value[rule].collapsed;
};

// 处理开关点击事件
const handleSwitchChange = (rule: RuleKey, _event: Event) => {
  // 当开关状态改变时，同步修改折叠状态
  processingRules.value[rule].collapsed = !processingRules.value[rule].enabled;
};

// 添加监听器，监听所有规则的enabled状态
Object.keys(processingRules.value).forEach((key) => {
  watch(() => processingRules.value[key as RuleKey].enabled, (newVal) => {
    // 当开关状态变化时，更新折叠状态
    processingRules.value[key as RuleKey].collapsed = !newVal;
  });
});

onMounted(() => {
  // 从 Pinia store 获取项目信息
  projectId.value = projectStore.currentProjectId;
  projectName.value = projectStore.currentProjectName;
  
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
    
    // 如果还是没有数据，尝试从查询参数获取（向后兼容旧版本）
    if (!projectId.value) {
      const id = route.query.id;
      const name = route.query.name;
      
      if (id) {
        projectId.value = parseInt(id.toString(), 10);
        projectName.value = name?.toString() || `项目 ${id}`;
      } else {
        ElMessage.error('缺少项目信息，无法继续');
        router.push('/');
      }
    }
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

// 提交分析
const submitAnalysis = () => {
  // 确保将所有必要项目信息保存到全局状态
  projectStore.setCurrentProject(projectId.value!, projectName.value);
  projectStore.setFileType(fileTypeSelected.value);
  
  // 同时更新 sessionStorage 中的数据
  // 获取现有数据以便保留其他字段
  let projectData = { id: projectId.value!, name: projectName.value };
  try {
    const storedProject = sessionStorage.getItem('currentProject');
    if (storedProject) {
      const existingData = JSON.parse(storedProject);
      projectData = { ...existingData, ...projectData };
    }
  } catch (e) {
    console.error('解析sessionStorage中的项目数据失败', e);
  }
  
  // 更新 sessionStorage
  sessionStorage.setItem('currentProject', JSON.stringify(projectData));
  
  // 导航到分析页面，不再使用查询参数
  router.push({
    path: '/analysis'
  });
};

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

// {{ 添加方法以处理子组件发出的引导交互 }}
const handleChildGuideInteraction = (payload: { type: 'skip' | 'next-step-clicked' | 'completed' }) => {
  if (payload.type === 'skip') {
    skipGuide();
  } else if (payload.type === 'next-step-clicked') {
    nextGuideStep();
  } else if (payload.type === 'completed') {
    completeGuide();
  }
};

const handleChildElementReady = (payload: { name: string, element: any }) => {
  guideTargetElements.value[payload.name] = payload.element;
  if (showGuide.value && !guideCompleted.value) {
    const currentGuideData = getCurrentGuide();
    if (currentGuideData.targetName === payload.name) {
      updateGuidePosition();
    }
  }
};

const autoAdvanceGuide = () => {
  if (!showGuide.value || guideCompleted.value) return;
  const currentStepVal = currentGuideStep.value;
  // const fileIsSelectedForProcessing = !!selectedFile.value; // Ensure this line is actually removed

  if (currentStepVal === 1 && fileTypeSelected.value) {
    setTimeout(() => { currentGuideStep.value = 2; }, 800);
  } 
  // Further auto-advance logic might need review based on precise UX needs after component split
};

const setupInteractionObserver = () => {
  watch(fileTypeSelected, () => {
    updateGuidePosition();
    autoAdvanceGuide();
  });
  
  // watch(uploadedFiles, () => { // uploadedFiles is no longer in parent
  //   updateGuidePosition();
  //   autoAdvanceGuide();
  // });
  
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

// 监听activeStep变化，检查规则显示状态
watch(activeStep, (newStep) => {
  if (newStep === 3) {
    // 当进入第三步时检查文件头部和规则显示状态
    console.log('进入第三步，当前文件头部字段:', fileHeaders.value);
    // 测试所有规则的显示状态
    Object.keys(ruleHeadersMapping).forEach((key) => {
      console.log(`规则 ${key} 是否显示:`, shouldShowRule(key as RuleKey));
    });
  }
});

// 文件解析函数
const parseFile = async (file: File): Promise<{
  headers: string[],
  data: any[],
  previewData: Record<string, string>
}> => {
  return new Promise((resolve, reject) => {
    // 重置处理状态
    fileProcessingStatus.value.processingStep = '解析数据';
    fileProcessingStatus.value.processedRows = 0;
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        // 开始解析
        const data = e.target?.result;
        
        if (!data) {
          throw new Error('无法读取文件内容');
        }
        
        // 使用 xlsx 解析文件
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 将工作表转换为JSON对象数组
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          throw new Error('文件中没有数据');
        }
        
        // 获取表头（第一行）
        const headers = jsonData[0].map(String);
        
        // 检查是否有表头
        if (headers.length === 0) {
          throw new Error('文件缺少表头信息');
        }
        
        // 构建数据行（跳过表头）
        const rows = [];
        // 用于存储每列的预览数据
        const preview: Record<string, string> = {};
        
        // 获取预览数据（第二行，如果存在）
        if (jsonData.length > 1) {
          const previewRow = jsonData[1];
          for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const value = previewRow[i];
            if (value !== undefined) {
              preview[header] = String(value);
            }
          }
        }
        
        // 更新总行数
        fileProcessingStatus.value.totalRows = jsonData.length - 1; // 减去表头
        
        // 处理每一行数据，更新进度
        for (let i = 1; i < jsonData.length; i++) {
          const row: Record<string, any> = {};
          for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            const value = jsonData[i][j];
            row[header] = value;
          }
          rows.push(row);
          
          // 更新处理行数，每10行更新一次
          if (i % 10 === 0) {
            fileProcessingStatus.value.processedRows = i;
            // 给UI一点时间来更新
            await new Promise(r => setTimeout(r, 0));
          }
        }
        
        // 完成处理
        fileProcessingStatus.value.processedRows = jsonData.length - 1;
        fileProcessingStatus.value.processingStep = '验证字段';
        
        resolve({
          headers,
          data: rows,
          previewData: preview
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    // 读取文件内容
    reader.readAsBinaryString(file);
  });
};

// 根据表头更新字段映射
const updateFieldMappings = (headers: string[]) => {
  // 更新源字段列表
  sourceFields.value = headers;
  
  // 尝试自动匹配字段
  const mappingsByTarget: Record<string, string[]> = {
    'orderNumber': ['单据编号', '订单编号', 'order_id', 'orderId', 'order_number'],
    'sku': ['sku', 'item_sku', 'SKU', 'product_sku', 'productSku', '物料编码'],
    'quantity': ['quantity', 'qty', '数量', 'amount', '需求数量'],
    'orderDate': ['订单日期', '日期', 'order_date', 'date', '单据时间'],
    'materialCode': ['物料编码', '物料编号', 'material_code', 'materialCode', '料号']
  };
  
  // 尝试自动匹配必填字段
  mappingData.value = mappingData.value.map(item => {
    // 如果是必填字段，尝试自动匹配
    if (item.isRequired) {
      const targets = mappingsByTarget[item.targetField];
      if (targets) {
        // 查找匹配的表头
        const matchedHeader = headers.find(header => {
          return targets.some(target => 
            header.toLowerCase().includes(target.toLowerCase())
          );
        });
        
        // 如果找到匹配的表头，更新
        if (matchedHeader) {
          item.sourceField = [matchedHeader];
        }
      }
    }
    return item;
  });
};

// 处理文件上传
const processFileWithProgress = async (file: File) => {
  try {
    // 显示处理对话框
    showProcessingDialog.value = true;
    processingPercentage.value = 0;
    currentStep.value = 1;
    processingComplete.value = false;
    
    // 初始化上传状态
    fileUploadStatus.value.totalBytes = file.size;
    fileUploadStatus.value.uploadedBytes = 0;
    fileUploadStatus.value.uploadPercentage = 0;
    
    // 解析文件 (0%-40%)
    const result = await parseFile(file);
    fileData.value = result.data;
    fileHeaders.value = result.headers;
    previewData.value = result.previewData;
    processingPercentage.value = 40;
    currentStep.value = 2;
    
    // 验证字段并更新映射 (40%-60%)
    await new Promise(resolve => setTimeout(resolve, 200)); // 给UI一点时间
    fileProcessingStatus.value.processingStep = '验证字段';
    updateFieldMappings(result.headers);
    processingPercentage.value = 60;
    currentStep.value = 3;
    
    // 准备导入 (60%-70%)
    await new Promise(resolve => setTimeout(resolve, 300));
    fileProcessingStatus.value.processingStep = '准备导入';
    processingPercentage.value = 70;
    
    // 模拟获取MinIO上传URL (70%-75%)
    fileProcessingStatus.value.processingStep = '获取上传授权';
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟返回的授权URL
    const timestamp = new Date().getTime();
    const randomId = Math.floor(Math.random() * 1000000);
    const uploadUrl = `https://minio-server.example.com/upload/${timestamp}-${randomId}/${file.name}`;
    fileUploadStatus.value.uploadUrl = uploadUrl;
    processingPercentage.value = 75;
    currentStep.value = 4; // 进入上传步骤
    
    // 模拟上传文件到MinIO (75%-95%)
    fileProcessingStatus.value.processingStep = '上传到服务器';
    fileUploadStatus.value.uploadingStep = '上传中';
    
    // 模拟分块上传
    const chunkSize = 1024 * 1024; // 1MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    for (let chunk = 0; chunk < totalChunks; chunk++) {
      // 计算当前分块的上传百分比在总进度中的权重
      const chunkProgressStart = 75 + (chunk / totalChunks) * 20;
      const chunkProgressEnd = 75 + ((chunk + 1) / totalChunks) * 20;
      
      // 模拟分块上传进度
      for (let progress = 0; progress <= 100; progress += 5) {
        // 更新当前分块的上传字节数
        const start = chunk * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const bytesToUpload = end - start;
        const bytesUploaded = Math.floor((bytesToUpload * progress) / 100);
        const totalBytesUploaded = Math.min((chunk * chunkSize) + bytesUploaded, file.size);
        
        // 更新UI显示
        fileUploadStatus.value.uploadedBytes = totalBytesUploaded;
        fileUploadStatus.value.uploadPercentage = Math.floor((totalBytesUploaded / file.size) * 100);
        
        // 计算总体进度
        processingPercentage.value = Math.floor(chunkProgressStart + ((progress / 100) * (chunkProgressEnd - chunkProgressStart)));
        
        // 给UI时间更新
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    // 上传完成
    fileUploadStatus.value.uploadingStep = '上传完成';
    fileUploadStatus.value.uploadPercentage = 100;
    processingPercentage.value = 95;
    
    // 完成所有处理 (95%-100%)
    await new Promise(resolve => setTimeout(resolve, 500));
    processingPercentage.value = 100;
    currentStep.value = 5; // 进入完成步骤
    processingComplete.value = true;
    
    // 延迟关闭对话框
    setTimeout(() => {
      showProcessingDialog.value = false;
      ElMessage.success('文件处理并上传完成');
    }, 1000);
  } catch (error: any) {
    processingComplete.value = false;
    showProcessingDialog.value = false;
    // Call the corrected and simplified error handler
    handleParentErrorMessage(`文件处理失败: ${error.message}`); 
    
    // No need to interact with child's uploadedFiles list here, 
    // as the error is from parent's processing, not initial upload by child.
    // Child will have already added the file to its list if it passed its own initial checks.
  }
};

const ruleHeadersMapping = {
  documentNumberValidation: ['单据编号', 'order_id', 'orderId', 'order_number', '订单编号'],
  skuCombination: ['sku', 'SKU', 'item_sku', 'product_sku', 'productSku', '物料编码', '物料编号'],
  tableRule: ['单据类型', 'document_type', 'documentType', 'type'],
  documentItemRule: ['单据项', 'document_item', 'documentItem', 'item'],
  materialSpec: ['物料规格', 'material_spec', 'materialSpec', 'spec', '规格'],
  materialCode: ['数量', 'quantity', 'qty', 'amount', '需求数量'], 
  orderStatus: ['订单优先级', 'order_priority', 'orderPriority', 'priority', '优先级'],
  shelfWaveNumber: ['上级波次编号', 'parent_wave_number', 'parentWaveNumber', 'wave_number', '波次', '波次编号'],
  singleOrder: ['单个体积', 'volume', '体积', 'single_volume', 'singleVolume'],
  materialCategory: ['物料冷热度', 'material_temperature', 'materialTemperature', '冷热度', 'temperature'],
  packagingLength: ['包装长度', 'packaging_length', 'packagingLength', 'length', '长度'],
  packagingSpec: ['包装宽度', 'packaging_width', 'packagingWidth', 'width', '宽度'],
  packagingHeight: ['包装高度', 'packaging_height', 'packagingHeight', 'height', '高度']
};

const shouldShowRule = (ruleKey: RuleKey): boolean => {
  if (!fileHeaders.value || fileHeaders.value.length === 0) {
    return true;
  }
  const matchingHeaders = ruleHeadersMapping[ruleKey as keyof typeof ruleHeadersMapping]; 
  if (!matchingHeaders) return true; 
  return fileHeaders.value.some(header => 
    matchingHeaders.some(matchHeader => 
      header.toLowerCase().includes(matchHeader.toLowerCase())
    )
  );
};

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
  padding: 16px 20px;
  background-color: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  /* 使用Vue 3兼容的::v-deep选择器 */
  ::v-deep(.el-step__head) {
    &.is-process {
      color: #409EFF;
      border-color: #409EFF;
    }
    
    &.is-success {
      color: #67C23A;
      border-color: #67C23A;
    }
  }

  ::v-deep(.el-step__icon) {
    width: 24px;
    height: 24px;
    font-size: 18px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  ::v-deep(.el-step__icon.is-text) {
    border-width: 2px;
    background-color: #fff;
  }

  ::v-deep(.el-step__icon.is-text.is-process) {
    background-color: #409EFF;
    color: #fff;
  }

  ::v-deep(.el-step__icon.is-text.is-success) {
    background-color: #67C23A;
    color: #fff;
  }

  ::v-deep(.el-step__icon.is-icon.is-process) {
    color: #409EFF;
  }

  ::v-deep(.el-step__icon.is-icon.is-success) {
    color: #67C23A;
  }

  ::v-deep(.el-step__title) {
    font-size: 15px;
    font-weight: 500;
    transition: all 0.3s;
  }

  ::v-deep(.el-step__title.is-process) {
    font-weight: 600;
    color: #409EFF;
    transform: scale(1.05);
  }

  ::v-deep(.el-step__title.is-success) {
    color: #67C23A;
  }

  ::v-deep(.el-step__line) {
    height: 2px;
    background-color: #e4e7ed;
  }

  ::v-deep(.el-step__line-inner) {
    height: 100%;
    border-width: 0;
    background-color: #67C23A;
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  }

  /* 悬浮效果 */
  ::v-deep(.el-step:hover .el-step__icon) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* 激活状态动画效果 */
  ::v-deep(.el-step.is-process .el-step__icon) {
    animation: pulse-icon 1.5s infinite alternate;
  }
}

/* 脉冲动画 */
@keyframes pulse-icon {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(64, 158, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
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
  border-radius: 8px;
  background-color: #fff;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  
  &:focus-within {
    border-color: #c6e2ff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
}

.collapsible-header {
  padding: 14px 18px;
  background-color: #f5f7fa;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 18px;
    right: 18px;
    height: 1px;
    background-color: #ebeef5;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 18px;
  }
  
  .rule-title {
    font-size: 15px;
    color: #303133;
    font-weight: 500;
    transition: color 0.3s;
  }
  
  &:hover {
    background-color: #e9ecf2;
    
    .rule-title {
      color: #409EFF;
    }
    
    &::after {
      opacity: 1;
    }
  }
  
  .el-icon {
    transition: all 0.3s;
    font-size: 18px;
    color: #909399;
  }
}

.collapsible-content {
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
  background-color: #fcfcfc;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  max-height: 500px;
  overflow: hidden;
  animation: slideDown 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  
  .option-row {
    padding: 12px 20px;
    margin: 0 15px 10px;
    border-radius: 6px;
    background-color: #fff;
    border: 1px solid #ebeef5;
    transition: all 0.3s;
    animation: fadeIn 0.3s ease-out forwards;
    opacity: 0;
    
    &:nth-child(1) { animation-delay: 0.1s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.3s; }
    
    &:hover {
      background-color: #f0f8ff;
      border-color: #c6e2ff;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:last-child {
      margin-bottom: 10px;
    }
  }
}

@keyframes slideDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 500px;
    opacity: 1;
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

.special-chars-list {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  padding: 10px;
}

.checkbox-item {
  padding: 5px 15px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

.enhanced-rule-description {
  display: flex;
  background-color: #f0f9ff;
  border-radius: 8px;
  padding: 15px;
  margin: 0 10px 20px;
  border-left: 4px solid #409EFF;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  animation: fadeInDown 0.5s ease-out;

  &:hover {
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .description-icon {
    font-size: 22px;
    color: #409EFF;
    margin-right: 5px;
    align-self: flex-start;
  }

  .description-content {
    flex: 1;

    p {
      margin-bottom: 12px;
      line-height: 1.6;
      color: #444;
      font-size: 14px;

      strong {
        color: #303133;
        font-weight: 600;
      }
    }

    .highlight-text {
      background-color: rgba(255, 193, 7, 0.2);
      padding: 2px 4px;
      border-radius: 3px;
      color: #b88230;
      font-weight: 500;
    }

    .example-box {
      background-color: #fff;
      border-radius: 6px;
      padding: 12px 15px;
      margin-top: 12px;
      border: 1px solid #e9e9eb;
      animation: fadeIn 0.5s ease-out 0.2s backwards;

      .example-title {
        font-weight: 500;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        color: #303133;
        font-size: 15px;

        .el-icon {
          color: #e6a23c;
          margin-right: 5px;
          font-size: 16px;
        }
      }

      .example-list {
        padding-left: 20px;
        margin: 10px 0;
        
        li {
          margin-bottom: 8px;
          position: relative;
          padding-left: 5px;
          animation: slideInRight 0.4s ease-out;
          animation-fill-mode: both;

          &:nth-child(1) { animation-delay: 0.1s; }
          &:nth-child(2) { animation-delay: 0.2s; }
          &:nth-child(3) { animation-delay: 0.3s; }

          .el-tag {
            margin-right: 5px;
            border-color: #dcdfe6;
            font-weight: 500;
          }
        }
      }

      .note-text {
        font-size: 14px;
        color: #67c23a;
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px dashed #e4e7ed;
        display: flex;
        align-items: center;

        .el-icon {
          color: #67c23a;
          margin-right: 5px;
          font-size: 16px;
        }
      }
    }
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
  font-weight: 500;
  color: #409EFF;
}

.special-chars-section {
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  margin: 0 10px 10px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    font-weight: 500;
    color: #409EFF;
    font-size: 15px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #e4e7ed;
    
    .el-icon {
      font-size: 16px;
    }
  }
}

.special-chars-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  
  .checkbox-item {
    padding: 8px 12px;
    background-color: #f9f9f9;
    border-radius: 6px;
    transition: all 0.3s;
    flex: 1 0 auto;
    min-width: 100px;
    animation: fadeIn 0.4s ease-out;
    animation-fill-mode: both;
    border: 1px solid transparent;
    
    &:nth-child(1) { animation-delay: 0.1s; }
    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.2s; }
    &:nth-child(4) { animation-delay: 0.25s; }
    &:nth-child(5) { animation-delay: 0.3s; }
    
    &:hover {
      background-color: #f0f9ff;
      transform: translateY(-2px);
      border-color: #c6e2ff;
    }
    
    .el-checkbox {
      width: 100%;
      
      .el-checkbox__label {
        font-size: 14px;
      }
      
      &.is-checked .el-checkbox__label {
        color: #409EFF;
        font-weight: 500;
      }
    }
  }
}

.system-support-text {
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.default-value-container {
  display: flex;
  gap: 10px;
}

.default-value-item {
  display: flex;
  align-items: center;
}

.default-value-input {
  width: 100%;
  max-width: 600px;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:focus-within {
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
  }
  
  .el-input__wrapper {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  
  .el-input__prepend {
    background-color: #409EFF;
    color: white;
    font-weight: 500;
    border-color: #409EFF;
    min-width: 70px;
    justify-content: center;
  }
}

.default-value-container {
  padding: 0 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeInUp 0.4s ease-out;
}

.default-value-item {
  width: 100%;
  margin-bottom: 10px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.document-type-section {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  
  &:hover {
    border-color: #c6e2ff;
  }
  
  .collapsible-header {
    background: linear-gradient(to right, #f5f7fa, #f0f8ff);
    
    &:hover {
      background: linear-gradient(to right, #e9ecf2, #e6f1ff);
    }
  }
  
  .default-value-input {
    .el-input__inner {
      transition: all 0.3s;
    }
    
    &:focus-within {
      .el-input__inner {
        background-color: #f8faff;
      }
    }
    
    .el-input__append {
      background-color: #f4f8ff;
      color: #409EFF;
      padding: 0 12px;
      transition: all 0.3s;
      
      &:hover {
        background-color: #e6f1ff;
      }
    }
  }
  
  .enhanced-rule-description {
    animation: fadeInRight 0.5s ease-out;
  }
}

/* 添加分析按钮的样式 */
.analysis-btn {
  margin-right: 10px;
  background-color: #409EFF;
  border-color: #409EFF;
  transition: all 0.3s;
  
  &:hover {
    background-color: #66b1ff;
    border-color: #66b1ff;
    transform: translateY(-2px);
    box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.4);
  }
  
  &:active {
    background-color: #3a8ee6;
    border-color: #3a8ee6;
    transform: translateY(0);
  }
}

/* 文件处理状态信息样式 */
.processing-status {
  margin: 20px 0;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;

  .status-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    padding: 5px 0;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .status-label {
      color: #606266;
      font-size: 14px;
    }
    
    .status-value {
      color: #303133;
      font-weight: 500;
      font-size: 14px;
    }
  }
}
</style> 