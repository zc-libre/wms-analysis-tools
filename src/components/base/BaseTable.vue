<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

interface Props {
  /** 表格数据 */
  data: any[]
  /** 表格高度 */
  height?: string | number
  /** 表格最大高度 */
  maxHeight?: string | number
  /** 是否带有纵向边框 */
  border?: boolean
  /** 是否为斑马纹表格 */
  stripe?: boolean
  /** 是否显示表头 */
  showHeader?: boolean
  /** 是否显示表格内容 */
  showBody?: boolean
  /** 是否显示加载中 */
  loading?: boolean
  /** 是否显示选择框 */
  showSelection?: boolean
  /** 是否显示索引 */
  showIndex?: boolean
  /** 索引起始值 */
  indexStart?: number
  /** 是否显示操作栏 */
  showOperation?: boolean
  /** 每页显示条目个数 */
  pageSize?: number
  /** 总条目数 */
  total?: number
  /** 当前页数 */
  currentPage?: number
  /** 是否自动计算高度 */
  autoHeight?: boolean
  /** 是否显示分页 */
  showPagination?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 'auto',
  maxHeight: 'auto',
  border: true,
  stripe: true,
  showHeader: true,
  showBody: true,
  loading: false,
  showSelection: false,
  showIndex: false,
  indexStart: 1,
  showOperation: false,
  pageSize: 10,
  total: 0,
  currentPage: 1,
  autoHeight: false,
  showPagination: true
})

const emit = defineEmits<{
  (e: 'size-change', size: number): void
  (e: 'current-change', current: number): void
  (e: 'selection-change', selection: any[]): void
  (e: 'row-click', row: any, column: any, event: Event): void
}>()

// 计算内部分页大小
const innerPageSize = computed({
  get: () => props.pageSize,
  set: (value) => emit('size-change', value)
})

// 计算内部当前页
const innerCurrentPage = computed({
  get: () => props.currentPage,
  set: (value) => emit('current-change', value)
})

// 选中行数据
const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

// 行点击事件
const handleRowClick = (row: any, column: any, event: Event) => {
  emit('row-click', row, column, event)
}

// 自动计算高度部分
const tableRef = ref<HTMLElement | null>(null)
const tableHeight = ref(props.height)

// 初始化自动高度
onMounted(() => {
  if (props.autoHeight) {
    calcTableHeight()
    window.addEventListener('resize', calcTableHeight)
  }
})

// 计算表格高度
const calcTableHeight = () => {
  if (!tableRef.value) return
  
  // 计算表格容器到底部的距离，减去分页器高度和其他边距
  const bottomOffset = props.showPagination ? 50 : 0
  const containerHeight = window.innerHeight - tableRef.value.getBoundingClientRect().top - bottomOffset
  
  tableHeight.value = `${Math.max(300, containerHeight)}px`
}
</script>

<template>
  <div class="base-table">
    <!-- 表格主体 -->
    <el-table
      ref="tableRef"
      :data="data"
      :height="autoHeight ? tableHeight : height"
      :max-height="maxHeight"
      :border="border"
      :stripe="stripe"
      :show-header="showHeader"
      v-loading="loading"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      class="base-table__table"
    >
      <!-- 选择框列 -->
      <el-table-column
        v-if="showSelection"
        type="selection"
        width="50"
        align="center"
        fixed="left"
      />
      
      <!-- 索引列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        width="50"
        align="center"
        :index="indexStart"
        label="序号"
        fixed="left"
      />
      
      <!-- 表格列 - 通过插槽传入 -->
      <slot />
      
      <!-- 操作列 -->
      <el-table-column
        v-if="showOperation"
        label="操作"
        align="center"
        fixed="right"
        min-width="100"
      >
        <template #default="scope" fixed="right" min-width="150">
          <slot name="operation" :row="scope.row" :$index="scope.$index" />
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页器 -->
    <div v-if="showPagination" class="base-table__pagination">
      <el-pagination
        v-model:current-page="innerCurrentPage"
        v-model:page-size="innerPageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.base-table {
  width: 100%;
  
  &__table {
    width: 100%;
  }
  
  &__pagination {
    margin-top: $spacing-base;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 