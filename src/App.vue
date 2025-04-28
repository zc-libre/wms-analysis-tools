<script setup lang="ts">
import TopBar from './components/TopBar.vue'

</script>

<template>
  <el-container class="app-layout">
    <el-header class="app-header">
      <TopBar />
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<style lang="scss">
html, body, #app, .app-layout {
  height: 100%;
  margin: 0;
  padding: 0;
}

.app-header {
  padding: 0;
  height: 60px; // Or match TopBar height
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: #fff;
  position: sticky; 
  top: 0;
  z-index: 1000; // Ensure it's above content
}

.app-main {
  padding: 15px; // Keep or adjust padding based on desired look
  background-color: #f8f9fa; // Match content bg
  // The height will naturally fill remaining space if app-layout is 100%
  // The overflow should likely be handled by the content within router-view
  // For example, by the .layout-main class in DefaultLayout.vue if that's still used,
  // or by the specific view's container.
}

// Remove default body margin
body {
  margin: 0;
}

// Remove previous container styles if they conflict
/*
.app-container {
  height: 100%;
  width: 100%;
}

.tailwind-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
*/
</style>
