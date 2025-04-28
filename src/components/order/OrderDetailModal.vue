<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'

interface OrderItem {
  id: number
  sku: string
  productName: string
  quantity: number
  price: number
  totalAmount: number
}

interface Order {
  id: number
  orderNumber: string
  customerName: string
  customerContact?: string
  orderDate: string
  status: string
  items?: OrderItem[]
  totalAmount: number
  address?: string
  notes?: string
}

interface Props {
  /** 是否显示模态框 */
  modelValue: boolean
  /** 订单数据 */
  order: Order | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// 计算属性：模态框可见性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 计算属性：是否有订单数据
const hasOrderData = computed(() => !!props.order)

// 计算属性：格式化总金额
const formattedTotalAmount = computed(() => {
  if (!props.order) return '¥0.00'
  return `¥${props.order.totalAmount.toFixed(2)}`
})

// 计算属性：状态标签类型
const statusTagType = computed(() => {
  if (!props.order) return ''
  
  switch (props.order.status) {
    case '待处理':
      return 'warning'
    case '已确认':
      return 'primary'
    case '已发货':
      return 'success'
    case '已完成':
      return 'info'
    default:
      return ''
  }
})
</script>

<template>
  <base-modal
    v-model="visible"
    title="订单详情"
    width="700px"
    :show-footer="false"
  >
    <div v-if="hasOrderData" class="order-detail">
      <!-- 订单基本信息 -->
      <div class="order-detail__section">
        <h3 class="order-detail__section-title">基本信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">
            {{ order?.orderNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="下单日期">
            {{ order?.orderDate }}
          </el-descriptions-item>
          <el-descriptions-item label="客户名称">
            {{ order?.customerName }}
          </el-descriptions-item>
          <el-descriptions-item label="联系方式">
            {{ order?.customerContact || '未提供' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="statusTagType">{{ order?.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">
            <span class="order-detail__amount">{{ formattedTotalAmount }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 订单商品列表 -->
      <div class="order-detail__section">
        <h3 class="order-detail__section-title">商品清单</h3>
        <el-table :data="order?.items || []" border stripe style="width: 100%">
          <el-table-column prop="sku" label="SKU" width="120" />
          <el-table-column prop="productName" label="商品名称" min-width="150" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="scope">
              ¥{{ scope.row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="小计" width="120">
            <template #default="scope">
              ¥{{ scope.row.totalAmount.toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 收货地址 -->
      <div class="order-detail__section">
        <h3 class="order-detail__section-title">收货地址</h3>
        <p class="order-detail__address">{{ order?.address || '未提供收货地址' }}</p>
      </div>
      
      <!-- 订单备注 -->
      <div class="order-detail__section">
        <h3 class="order-detail__section-title">订单备注</h3>
        <p class="order-detail__notes">{{ order?.notes || '无备注信息' }}</p>
      </div>
    </div>
    
    <div v-else class="order-detail__empty">
      <el-empty description="暂无订单数据" />
    </div>
  </base-modal>
</template>

<style lang="scss" scoped>
.order-detail {
  padding: $spacing-small;
  
  &__section {
    margin-bottom: $spacing-large;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  &__section-title {
    font-size: $font-size-medium;
    margin: 0 0 $spacing-base 0;
    padding-bottom: $spacing-small;
    border-bottom: 1px solid $color-border-lighter;
    color: $color-text-primary;
  }
  
  &__amount {
    color: $color-danger;
    font-weight: $font-weight-bold;
  }
  
  &__address,
  &__notes {
    padding: $spacing-base;
    background-color: $color-bg-light;
    border-radius: $border-radius-base;
    margin: 0;
    min-height: 24px;
  }
  
  &__empty {
    padding: $spacing-extra-large 0;
  }
}
</style> 