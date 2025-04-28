<template>
  <div class="top-bar">
    <div class="system-title">流通行业智能仓储管理系统分析工具</div>
    <div class="user-info">
      <span class="welcome-text">欢迎，管理员</span>
      <el-link :underline="false" class="logout-link">
        <el-icon><i-ep-switch-button /></el-icon> 退出
      </el-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { SwitchButton as EpSwitchButton } from '@element-plus/icons-vue' // Assuming auto-import is configured
</script>

<style scoped lang="scss">
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  background-color: #fff; // Or inherit from header
  border-bottom: 1px solid #dcdfe6; // Element Plus border color
}

.system-title {
  font-weight: 600;
  color: #409eff; // Element Plus primary color
  font-size: 1.1rem;
}

.user-info {
  display: flex;
  align-items: center;
}

.welcome-text {
  margin-right: 15px;
  font-size: 0.9rem;
  color: #606266; // Element Plus primary text color
}

.logout-link {
  color: #606266;
  &:hover {
    color: #409eff;
  }
  .el-icon {
    margin-right: 4px;
  }
}
</style> 