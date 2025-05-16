<template>
  <div>
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
          :model-value="props.selectedMappingSchemeProp"
          @update:model-value="emit('update:selectedMappingSchemeProp', $event)"
          placeholder="-- 请选择 --"
          clearable
          class="scheme-select-input"
        >
          <el-option
            v-for="scheme in props.mappingSchemes"
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
          :disabled="!props.selectedMappingSchemeProp"
          @click="emit('delete-scheme')"
        >
          <el-icon><DeleteIcon /></el-icon>
        </el-button>
      </div>
      <el-button
        type="primary"
        plain
        class="save-scheme-btn"
        @click="emit('save-scheme')"
      >
        <el-icon><Document /></el-icon> 保存当前方案
      </el-button>
    </div>

    <!-- 新增：方案名称和描述输入区域，仅在未选择方案时显示 -->
    <div v-if="!props.selectedMappingSchemeProp" class="new-scheme-inputs">
      <el-form label-position="top">
        <el-form-item label="方案名称" required>
          <el-input
            :model-value="props.newSchemeNameProp"
            @update:model-value="emit('update:newSchemeNameProp', $event)"
            placeholder="输入方案名称，例如：标准处理规则"
          />
        </el-form-item>
        <el-form-item label="方案描述 (选填)">
          <el-input
            type="textarea"
            :model-value="props.newSchemeDescriptionProp"
            @update:model-value="emit('update:newSchemeDescriptionProp', $event)"
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
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { InfoFilled, Delete as DeleteIcon, Document, ArrowDown, ArrowRight, Warning, CircleCheck, Menu } from '@element-plus/icons-vue';

interface Scheme {
  id: number;
  name: string;
}

interface Props {
  fileHeaders: string[];
  selectedMappingSchemeProp: number | null;
  mappingSchemes: Scheme[];
  newSchemeNameProp: string;
  newSchemeDescriptionProp: string;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:selectedMappingSchemeProp', value: number | null): void;
  (e: 'update:newSchemeNameProp', value: string): void;
  (e: 'update:newSchemeDescriptionProp', value: string): void;
  (e: 'delete-scheme'): void;
  (e: 'save-scheme'): void;
}>();

const icons = {
  ArrowDown,
  ArrowRight
};

type RuleKey =
  | 'documentNumberValidation'
  | 'skuCombination'
  | 'tableRule'
  | 'documentItemRule'
  | 'materialSpec'
  | 'materialCode'
  | 'orderStatus'
  | 'shelfWaveNumber'
  | 'singleOrder'
  | 'materialCategory'
  | 'packagingLength'
  | 'packagingSpec'
  | 'packagingHeight';

const processingRules = ref({
  documentNumberValidation: { enabled: false, collapsed: true, externalCode: false, packagingCode: false, gridCode: false, productionDate: false, shelfLife: false, atSymbol: false, percentSymbol: false, hyphen: false, dash: false, underscore: false },
  skuCombination: { enabled: false, collapsed: true, skuInput: '', externalBatch: false, packagingCode: false, qualityStatus: false, productionDate: false, shelfLife: false },
  tableRule: { enabled: false, collapsed: true, option: 1, activeTab: 'default', defaultType: '销售出库' },
  documentItemRule: { enabled: false, collapsed: true, defaultValue: '标准项' },
  materialSpec: { enabled: false, collapsed: true, option: 1 },
  materialCode: { enabled: false, collapsed: true, option: 1 },
  orderStatus: { enabled: false, collapsed: true, option: 1 },
  shelfWaveNumber: { enabled: false, collapsed: true, option: 1 },
  singleOrder: { enabled: false, collapsed: true, option: 1 },
  materialCategory: { enabled: false, collapsed: true, option: 1 },
  packagingLength: { enabled: false, collapsed: true, option: 1 },
  packagingSpec: { enabled: false, collapsed: true, option: 1 },
  packagingHeight: { enabled: false, collapsed: true, option: 1 }
});

const ruleHeadersMapping: Record<RuleKey, string[]> = {
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

const toggleRule = (rule: RuleKey) => {
  processingRules.value[rule].collapsed = !processingRules.value[rule].collapsed;
  // Original FileImport had a line to auto-enable when expanded, which might be desired:
  // if (!processingRules.value[rule].collapsed) {
  //   processingRules.value[rule].enabled = true;
  // }
};

const handleSwitchChange = (rule: RuleKey, _event: Event) => { // _event might not be needed if not used
  processingRules.value[rule].collapsed = !processingRules.value[rule].enabled;
};

Object.keys(processingRules.value).forEach((key) => {
  const ruleKey = key as RuleKey;
  watch(() => processingRules.value[ruleKey].enabled, (newVal) => {
    processingRules.value[ruleKey].collapsed = !newVal;
  });
});

const shouldShowRule = (ruleKey: RuleKey): boolean => {
  if (!props.fileHeaders || props.fileHeaders.length === 0) {
    return true;
  }
  const matchingHeaders = ruleHeadersMapping[ruleKey];
  if (!matchingHeaders) return true;
  return props.fileHeaders.some(header =>
    matchingHeaders.some(matchHeader =>
      header.toLowerCase().includes(matchHeader.toLowerCase())
    )
  );
};
</script>

<style scoped lang="scss">
// Styles from FileImport.vue relevant to Step 3
.mapping-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
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

.new-scheme-inputs {
  margin-bottom: 20px;
   .el-form-item {
     margin-bottom: 15px;
   }
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
    &:nth-child(4) { animation-delay: 0.4s; }

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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  .enhanced-rule-description {
    animation: fadeInRight 0.5s ease-out;
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

.default-value-input {
  width: 100%;
  max-width: 600px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:focus-within {
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
    .el-input__inner {
        background-color: #f8faff;
    }
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
   .el-input__append {
      background-color: #f4f8ff;
      color: #409EFF;
      padding: 0 12px;
      transition: all 0.3s;
      &:hover {
        background-color: #e6f1ff;
      }
    }
    .el-input__inner {
      transition: all 0.3s;
    }
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
</style> 