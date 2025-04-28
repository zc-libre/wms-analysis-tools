<script setup lang="ts">
import { computed } from 'vue'
import { Document, Edit, Delete } from '@element-plus/icons-vue'

// 定义props
const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

// 定义事件
const emit = defineEmits(['view-files', 'edit', 'delete'])

// 查看文件
const handleViewFiles = () => {
  emit('view-files', props.project)
}

// 编辑项目
const handleEdit = () => {
  emit('edit', props.project)
}

// 删除项目
const handleDelete = () => {
  emit('delete', props.project)
}

// 根据状态获取显示标签
const statusTag = computed(() => {
  switch (props.project.status) {
    case 'inProgress':
      return { label: '进行中', type: 'primary' }
    case 'completed':
      return { label: '已完成', type: 'success' }
    case 'paused':
      return { label: '已暂停', type: 'warning' }
    case 'cancelled':
      return { label: '已取消', type: 'danger' }
    default:
      return { label: '未知', type: 'info' }
  }
})
</script>

<template>
  <el-card class="project-card" shadow="hover">
    <div class="project-card__header">
      <div class="project-card__title-area">
        <h3 class="project-card__title">{{ project.name }}</h3>
        <el-tag size="small" :type="statusTag.type">{{ statusTag.label }}</el-tag>
      </div>
      <div class="project-card__code">{{ project.code }}</div>
    </div>
    
    <div class="project-card__info">
      <div class="project-card__info-item">
        <span class="project-card__info-label">负责人：</span>
        <span class="project-card__info-value">{{ project.manager }}</span>
      </div>
      <div class="project-card__info-item">
        <span class="project-card__info-label">部门：</span>
        <span class="project-card__info-value">{{ project.department }}</span>
      </div>
      <div class="project-card__info-item">
        <span class="project-card__info-label">开始日期：</span>
        <span class="project-card__info-value">{{ project.startDate }}</span>
      </div>
      <div class="project-card__info-item">
        <span class="project-card__info-label">结束日期：</span>
        <span class="project-card__info-value">{{ project.endDate || '未设置' }}</span>
      </div>
    </div>
    
    <div class="project-card__progress">
      <span class="project-card__progress-label">进度：</span>
      <el-progress 
        :percentage="project.progress" 
        :color="project.progress >= 100 ? '#67C23A' : ''"
      />
    </div>
    
    <div class="project-card__footer">
      <el-tooltip content="查看文件" placement="top">
        <el-button 
          type="primary" 
          :icon="Document"
          circle
          @click="handleViewFiles"
        />
      </el-tooltip>
      <el-tooltip content="编辑项目" placement="top">
        <el-button 
          type="primary" 
          :icon="Edit"
          circle
          @click="handleEdit"
        />
      </el-tooltip>
      <el-tooltip content="删除项目" placement="top">
        <el-button 
          type="danger" 
          :icon="Delete"
          circle
          @click="handleDelete"
        />
      </el-tooltip>
    </div>
  </el-card>
</template>

<style scoped>
.project-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-card__header {
  margin-bottom: 16px;
}

.project-card__title-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.project-card__title {
  font-size: 16px;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-card__code {
  font-size: 12px;
  color: #909399;
}

.project-card__info {
  margin-bottom: 16px;
}

.project-card__info-item {
  margin-bottom: 8px;
  font-size: 14px;
  display: flex;
}

.project-card__info-label {
  color: #606266;
  width: 70px;
  flex-shrink: 0;
}

.project-card__info-value {
  color: #303133;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-card__progress {
  margin-bottom: 16px;
}

.project-card__progress-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
  display: inline-block;
}

.project-card__footer {
  margin-top: auto;
  display: flex;
  justify-content: space-around;
}
</style> 