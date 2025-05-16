<template>
  <div> <!-- Outer div to replace .step-body from parent -->
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
          v-model="internalSelectedSchemeId"
          placeholder="-- 请选择 --"
          clearable
          class="scheme-select-input"
        >
          <el-option
            v-for="scheme in props.mappingSchemesOptions"
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
          :disabled="!internalSelectedSchemeId"
          @click="handleDeleteSchemeClick"
        >
          <el-icon><DeleteIcon /></el-icon>
        </el-button>
      </div>
      <el-button
        type="primary"
        plain
        class="save-scheme-btn"
        @click="handleSaveSchemeClick"
      >
        <el-icon><Document /></el-icon> 保存当前方案
      </el-button>
    </div>

    <!-- 新增：方案名称和描述输入区域，仅在未选择方案时显示 -->
    <div v-if="!internalSelectedSchemeId" class="new-scheme-inputs">
      <el-form label-position="top">
        <el-form-item label="方案名称" required>
          <el-input
            v-model="internalNewSchemeName"
            placeholder="输入方案名称，例如：标准处理规则"
          />
        </el-form-item>
        <el-form-item label="方案描述 (选填)">
          <el-input
            type="textarea"
            v-model="internalNewSchemeDescription"
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
      <el-table :data="props.mappingData" border>
        <el-table-column label="文件原始字段" min-width="180">
          <template #default="scope">
            <div :class="{ 'sku-source-field': scope.row.isSkuSource, 'sku-field-container': scope.row.targetField === 'sku' && !scope.row.isSkuSource }">
              <div v-for="(_, index) in scope.row.sourceField" :key="index" class="source-field-row">
                <el-select
                  v-model="scope.row.sourceField[index]"
                  placeholder="选择文件字段"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="item in props.sourceFieldsOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
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
                v-for="item in props.targetFieldsOptions"
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
            <el-switch v-else v-model="scope.row.isRequired" @change="handleIsRequiredChange(scope.row)" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="80" align="center">
          <template #default="scope">
            <el-button
              type="danger"
              circle
              plain
              size="small"
              @click="removeMappingItem(scope.$index)"
              :disabled="scope.row.isSourceField && itemIsRequiredSystemField(scope.row)"
            >
              <el-icon><DeleteIcon /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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
          v-for="field in props.availableFieldsForAddingOptions"
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { InfoFilled, Delete as DeleteIcon, Document, Plus } from '@element-plus/icons-vue';

interface MappingItem {
  sourceField: Array<string>;
  targetField: string;
  previewData: string;
  isRequired: boolean;
  isSourceField: boolean; // Indicates if it's one of the initial system target fields
  targetFieldText?: string;
  isLocked?: boolean;
  parentIndex?: number;
  isSkuSource?: boolean; // Indicates if it's an additional source field for a SKU
}

const props = defineProps<{
  mappingData: MappingItem[];
  sourceFieldsOptions: string[];
  targetFieldsOptions: { value: string; label: string; }[];
  mappingSchemesOptions: { id: number; name: string; }[];
  selectedMappingSchemeId: number | null;
  newSchemeNameProp: string;
  newSchemeDescriptionProp: string;
  availableFieldsForAddingOptions: { label: string; value: string; }[];
}>();

const emit = defineEmits<{
  (e: 'update:mappingData', value: MappingItem[]): void;
  (e: 'update:selectedMappingSchemeId', value: number | null): void;
  (e: 'update:newSchemeNameProp', value: string): void;
  (e: 'update:newSchemeDescriptionProp', value: string): void;
  (e: 'request-save-scheme'): void;
  (e: 'request-delete-scheme'): void;
}>();

const showAddFieldDialog = ref(false);
const fieldsToAdd = ref<string[]>([]);

const internalSelectedSchemeId = ref(props.selectedMappingSchemeId);
watch(() => props.selectedMappingSchemeId, (newValue) => {
  internalSelectedSchemeId.value = newValue;
});
watch(internalSelectedSchemeId, (newValue) => {
  emit('update:selectedMappingSchemeId', newValue);
});

const internalNewSchemeName = ref(props.newSchemeNameProp);
watch(() => props.newSchemeNameProp, (val) => internalNewSchemeName.value = val);
watch(internalNewSchemeName, (val) => emit('update:newSchemeNameProp', val));

const internalNewSchemeDescription = ref(props.newSchemeDescriptionProp);
watch(() => props.newSchemeDescriptionProp, (val) => internalNewSchemeDescription.value = val);
watch(internalNewSchemeDescription, (val) => emit('update:newSchemeDescriptionProp', val));

const cloneMappingData = (): MappingItem[] => {
  return JSON.parse(JSON.stringify(props.mappingData));
};

const addMappingField = () => {
  fieldsToAdd.value = [];
  showAddFieldDialog.value = true;
};

const addSkuSourceField = (parentIndex: number) => {
  const currentMappingData = cloneMappingData();
  const parentItem = currentMappingData[parentIndex];
  if (parentItem.targetField !== 'sku' || parentItem.isSkuSource) return; // Only for main SKU definition

  // Add new source field to the parent SKU item
  parentItem.sourceField.push('');
  emit('update:mappingData', currentMappingData);

  nextTick(() => {
    const parentRowEl = document.querySelectorAll('.el-table__row')[parentIndex];
    if (parentRowEl) {
        const sourceFieldRows = parentRowEl.querySelectorAll('.source-field-row');
        const newRowIndex = parentItem.sourceField.length - 1;
        if (sourceFieldRows && sourceFieldRows.length > newRowIndex) {
            const selectElement = sourceFieldRows[newRowIndex].querySelector('.el-select');
            if (selectElement) {
                selectElement.classList.add('highlight-field');
                setTimeout(() => {
                    selectElement.classList.remove('highlight-field');
                }, 1500);
            }
        }
    }
  });
};

const removeSourceField = (rowIndex: number, fieldIndex: number) => {
  const currentMappingData = cloneMappingData();
  const row = currentMappingData[rowIndex];

  if (row.sourceField.length <= 1) {
    ElMessage.warning('至少需要保留一个源字段');
    return;
  }
  
  // Animation handling might need specific selectors if row elements are reused by el-table
  // For simplicity, direct data manipulation is prioritized here.
  row.sourceField.splice(fieldIndex, 1);
  emit('update:mappingData', currentMappingData);
};

const confirmAddFieldSelection = () => {
  const currentMappingData = cloneMappingData();
  fieldsToAdd.value.forEach(targetFieldValue => {
    const exists = currentMappingData.some(item => item.targetField === targetFieldValue);
    if (!exists) {
      const fieldOption = props.availableFieldsForAddingOptions.find(f => f.value === targetFieldValue);
      currentMappingData.push({
        sourceField: [], // Initially empty, user needs to map it
        targetField: targetFieldValue,
        previewData: '',
        isRequired: false, // Newly added fields are not required by default
        isSourceField: false, // This means it's NOT one of the initial system target fields
        targetFieldText: fieldOption?.label || targetFieldValue,
      });
    }
  });
  emit('update:mappingData', currentMappingData);
  showAddFieldDialog.value = false;
};

// Renamed from removeMappingField to avoid conflict with vue's internal naming if any, and to be more specific
const removeMappingItem = (indexToRemove: number) => {
  const originalData = cloneMappingData();
  const itemToRemove = originalData[indexToRemove];

  // Prevent deletion based on original logic's disabled state:
  // :disabled="scope.row.isSourceField && itemIsRequiredSystemField(scope.row)"
  // itemIsRequiredSystemField means it's a system field (isSourceField=true) and it's required.
  if (itemToRemove.isSourceField && itemIsRequiredSystemField(itemToRemove)) {
    // This case should be prevented by the :disabled attribute primarily.
    // ElMessage.warning('必填的系统目标字段不允许删除。'); 
    return;
  }

  const indicesToDelete = new Set<number>();
  indicesToDelete.add(indexToRemove);

  // If deleting a main SKU definition, also remove its child source fields
  if (itemToRemove.targetField === 'sku' && !itemToRemove.isSkuSource) {
    originalData.forEach((field, i) => {
      if (field.isSkuSource && field.parentIndex === indexToRemove) {
        indicesToDelete.add(i);
      }
    });
  }

  const sortedIndices = Array.from(indicesToDelete).sort((a, b) => b - a);
  let resultData = [...originalData];
  sortedIndices.forEach(idx => resultData.splice(idx, 1));

  // Adjust parentIndex for remaining SKU child fields if their parent's original index changed
  // This simplified adjustment tries to mimic the original implicit behavior.
  // A robust solution for parentIndex is complex if multiple hierarchical items are removed.
  resultData = resultData.map(field => {
    if (field.parentIndex !== undefined) {
      let shift = 0;
      sortedIndices.forEach(deletedIdx => {
        if (deletedIdx < field.parentIndex!) {
          shift++;
        }
      });
      // If the parent itself was deleted, this child becomes orphaned.
      // The original code removed children with the parent (handled by adding children to indicesToDelete).
      // This shift is for items whose parents *weren't* deleted but shifted.
      if (!indicesToDelete.has(field.parentIndex!)) {
         return { ...field, parentIndex: field.parentIndex! - shift };
      } else {
        // Parent was deleted, this field is an orphan if it wasn't deleted itself.
        // This state should ideally not happen if children are correctly removed with parent.
        // For safety, nullify parentIndex or handle as per requirements.
        // Given the current removal logic, this path might not be hit often for SKU children.
        return { ...field, parentIndex: undefined }; // Or some other handling for orphaned items
      }
    }
    return field;
  });
  
  emit('update:mappingData', resultData);
};

const itemIsRequiredSystemField = (item: MappingItem): boolean => {
    // Helper to check if an item is one of the original "isSourceField" and also "isRequired"
    // This is used for the disable logic of delete button
    return item.isSourceField && props.targetFieldsOptions.some(tf => tf.value === item.targetField && item.isRequired);
};


const handleIsRequiredChange = (row: MappingItem) => {
    const currentMappingData = cloneMappingData();
    const itemInMap = currentMappingData.find(item => item.targetField === row.targetField && item.targetFieldText === row.targetFieldText);
    if(itemInMap) {
        itemInMap.isRequired = row.isRequired;
    }
    emit('update:mappingData', currentMappingData);
};


const handleSaveSchemeClick = () => {
  if (!props.selectedMappingSchemeId && !internalNewSchemeName.value.trim()) {
      ElMessage.warning('请输入方案名称');
      return;
  }
  emit('request-save-scheme');
};

const handleDeleteSchemeClick = () => {
  if (!internalSelectedSchemeId.value) return;
  emit('request-delete-scheme');
};

const validate = (): boolean => {
  const currentMappingData = props.mappingData;
  const requiredUnmapped = currentMappingData
    .filter(item => item.isRequired && !item.isSkuSource) // Check required fields that are not SKU sub-sources
    .some(item => {
        const hasNoSource = !item.sourceField || item.sourceField.length === 0 || item.sourceField.some(sf => !sf || sf.trim() === '');
        return hasNoSource || !item.targetField;
    });

  if (requiredUnmapped) {
    ElMessage.warning('请完成所有必填字段的映射（确保每个必填目标字段都已关联至少一个有效的源文件字段）。');
    return false;
  }

  // Check main SKU definitions (not isSkuSource)
  const skuMainFields = currentMappingData.filter(item => item.targetField === 'sku' && !item.isSkuSource);
  if (skuMainFields.length > 0) {
    const hasInvalidSkuMapping = skuMainFields.some(item => 
        !item.sourceField || item.sourceField.length === 0 || item.sourceField.some(sf => !sf || sf.trim() === '')
    );
    if (hasInvalidSkuMapping) {
      ElMessage.warning('请为SKU目标字段至少设置一个有效的源文件字段。');
      return false;
    }
  }
  return true;
};

defineExpose({
  validate
});

</script>

<style scoped lang="scss">
// Styles from FileImport.vue relevant to Step 2 will be pasted here.
// This includes .mapping-title, .mapping-instructions, .scheme-selection, .new-scheme-inputs,
// .add-field-btn, .mapping-table, .required-tag, .sku-source-field, .sku-source-label,
// .add-source-btn-container, .source-field-row, and keyframes like highlight-field,
// fadeIn, slideDown, fadeOut.

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
}

.scheme-selection .scheme-select {
  display: flex;
  align-items: center;
  gap: 10px;
}

.scheme-selection .scheme-select-input {
  width: 240px;
}

.scheme-selection .save-scheme-btn {
  font-weight: normal;
}

.new-scheme-inputs {
  margin-bottom: 20px; // Added margin for spacing
}

.add-field-btn {
  margin-bottom: 15px;
}

.mapping-table {
  margin-top: 20px;
}

.required-tag {
  margin: 0 auto;
  padding: 2px 8px;
}

.sku-source-field {
  position: relative;
  padding-top: 20px; // Space for the label
  // padding-left: 10px; // Removed for better alignment with non-sku rows
  // margin-left: 5px; // Removed
  animation: fadeIn 0.3s ease-in-out; // Keep animation
}

.sku-source-label {
  position: absolute;
  top: 0;
  left: 0; // Align with the start of the cell content area
  background-color: #e6f2ff;
  padding: 0 8px;
  color: #409EFF;
  font-size: 12px;
  border-radius: 10px;
  line-height: 18px;
}

.sku-field-container { // For rows that ARE SKU but not a sub-source, for add button
  position: relative;
}

.add-source-btn-container {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.add-source-btn-container .add-source-btn {
  background-color: #67c23a;
  border-color: #67c23a;
  color: white;
  margin-right: 8px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.add-source-btn-container .add-source-btn:hover {
  opacity: 0.9;
  background-color: #67c23a;
  border-color: #67c23a;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(103, 194, 58, 0.25);
}

.add-source-btn-container .add-source-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(103, 194, 58, 0.25);
}

.source-field-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  animation: slideDown 0.3s ease-out; // Keep animation
  transform-origin: top center;
}

.source-field-row .el-select {
  flex: 1;
  margin-right: 8px;
}

.source-field-row .el-button {
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.source-field-row .el-button:hover {
  transform: scale(1.1);
}

.source-field-row .el-button:active {
  transform: scale(0.95);
}

.highlight-field {
  animation: pulse-highlight 1.5s ease;
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

@keyframes fadeOut { /* This was in original but not directly used by a class, might be for JS animation */
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

/* Ensure dialog footer buttons are spaced */
.el-dialog__footer .dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px; /* Add gap for spacing */
}
</style> 