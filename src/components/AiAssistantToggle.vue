<template>
  <div class="ai-assistant-toggle">
    <el-button type="primary" circle size="large">
      <el-icon :size="24"><ChatDotRound /></el-icon>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ChatDotRound } from '@element-plus/icons-vue'

// Logic for toggling the AI panel can be added here later
</script>

<style scoped lang="scss">
.ai-assistant-toggle {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 1000; // Ensure it's above other content

  .el-button {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .el-button:hover {
     transform: scale(1.1);
     transition: transform 0.2s ease-in-out;
  }
}
</style> 