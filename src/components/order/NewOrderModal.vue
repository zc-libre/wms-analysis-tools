<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import BaseModal from '@/components/base/BaseModal.vue'

// Props 接口
interface Props {
  /** 是否显示模态框 */
  modelValue: boolean
}

const props = defineProps<Props>()

// Emits 接口
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

// 计算属性：模态框可见性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单数据
const form = reactive({
  customerName: '',
  customerContact: '',
  address: '',
  notes: '',
  items: [
    {
      sku: '',
      productName: '',
      quantity: 1,
      price: 0,
      get totalAmount() {
        return this.quantity * this.price
      }
    }
  ]
})

// 表单校验规则
const rules = {
  customerName: [
    { required: true, message: '请输入客户名称', trigger: 'blur' },
    { min: 2, max: 50, message: '客户名称长度应在2-50个字符之间', trigger: 'blur' }
  ],
  customerContact: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入收货地址', trigger: 'blur' }
  ],
  'items.0.sku': [
    { required: true, message: '请输入SKU', trigger: 'blur' }
  ],
  'items.0.productName': [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  'items.0.quantity': [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量不能小于1', trigger: 'blur' }
  ],
  'items.0.price': [
    { required: true, message: '请输入单价', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '单价不能小于0.01', trigger: 'blur' }
  ]
}

// 表单ref
const formRef = ref<any>(null)

// 提交loading状态
const submitLoading = ref(false)

// 计算总金额
const totalAmount = computed(() => {
  return form.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
})

// 添加商品行
const addItem = () => {
  form.items.push({
    sku: '',
    productName: '',
    quantity: 1,
    price: 0,
    get totalAmount() {
      return this.quantity * this.price
    }
  })
}

// 删除商品行
const removeItem = (index: number) => {
  if (form.items.length > 1) {
    form.items.splice(index, 1)
  } else {
    ElMessage.warning('至少保留一项商品')
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  form.items = [
    {
      sku: '',
      productName: '',
      quantity: 1,
      price: 0,
      get totalAmount() {
        return this.quantity * this.price
      }
    }
  ]
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 提交成功
    ElMessage.success('新增订单成功')
    
    // 关闭模态框
    visible.value = false
    
    // 重置表单
    resetForm()
    
    // 通知父组件重新获取数据
    emit('success')
  } catch (error) {
    console.error('表单验证失败', error)
  } finally {
    submitLoading.value = false
  }
}

// 关闭前重置表单
const handleClose = () => {
  resetForm()
}
</script>

<template>
  <base-modal
    v-model="visible"
    title="新增订单"
    width="800px"
    confirm-text="提交"
    :confirm-loading="submitLoading"
    @confirm="submitForm"
    @closed="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="new-order-form"
    >
      <!-- 客户信息部分 -->
      <h3 class="new-order-form__section-title">客户信息</h3>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户名称" prop="customerName">
            <el-input v-model="form.customerName" placeholder="请输入客户名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系方式" prop="customerContact">
            <el-input v-model="form.customerContact" placeholder="请输入联系方式" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="收货地址" prop="address">
        <el-input v-model="form.address" placeholder="请输入收货地址" />
      </el-form-item>
      
      <!-- 商品信息部分 -->
      <div class="new-order-form__section-header">
        <h3 class="new-order-form__section-title">商品信息</h3>
        <el-button type="primary" size="small" @click="addItem">
          <el-icon><Plus /></el-icon>
          添加商品
        </el-button>
      </div>
      
      <div class="new-order-form__items">
        <div 
          v-for="(item, index) in form.items" 
          :key="index"
          class="new-order-form__item"
        >
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="`SKU (${index + 1})`" :prop="`items.${index}.sku`">
                <el-input v-model="item.sku" placeholder="请输入SKU" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="`商品名称 (${index + 1})`" :prop="`items.${index}.productName`">
                <el-input v-model="item.productName" placeholder="请输入商品名称" />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item :label="`数量 (${index + 1})`" :prop="`items.${index}.quantity`">
                <el-input-number 
                  v-model="item.quantity" 
                  :min="1" 
                  :precision="0"
                  controls-position="right"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item :label="`单价 (${index + 1})`" :prop="`items.${index}.price`">
                <el-input-number 
                  v-model="item.price" 
                  :min="0.01" 
                  :precision="2"
                  controls-position="right"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="3" class="item-actions-column">
              <div class="item-actions">
                <el-button 
                  type="danger" 
                  circle 
                  size="small"
                  :disabled="form.items.length <= 1"
                  @click="removeItem(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
                <span class="item-amount">¥{{ item.totalAmount.toFixed(2) }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      
      <!-- 备注和总计 -->
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label="订单备注" prop="notes">
            <el-input 
              v-model="form.notes" 
              type="textarea" 
              rows="2"
              placeholder="请输入订单备注"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <div class="new-order-form__total">
            <span class="total-label">订单总金额：</span>
            <span class="total-amount">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </base-modal>
</template>

<style lang="scss" scoped>
.new-order-form {
  padding: $spacing-small;
  
  &__section-title {
    font-size: $font-size-medium;
    margin: 0 0 $spacing-base 0;
    padding-bottom: $spacing-small;
    border-bottom: 1px solid $color-border-lighter;
    color: $color-text-primary;
  }
  
  &__section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  &__items {
    margin-bottom: $spacing-base;
    max-height: 300px;
    overflow-y: auto;
  }
  
  &__item {
    padding: $spacing-small;
    margin-bottom: $spacing-small;
    border: 1px solid $color-border-lighter;
    border-radius: $border-radius-base;
    
    &:hover {
      background-color: $color-bg-light;
    }
  }
  
  &__total {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
    padding-top: 30px;
    
    .total-label {
      color: $color-text-regular;
      margin-right: $spacing-small;
    }
    
    .total-amount {
      font-size: $font-size-large;
      font-weight: $font-weight-bold;
      color: $color-danger;
    }
  }
  
  .item-actions-column {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  
  .item-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 4px;
    
    .item-amount {
      margin-top: $spacing-small;
      color: $color-primary;
      font-weight: $font-weight-medium;
    }
  }
}
</style> 