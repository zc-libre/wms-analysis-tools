<script setup lang="ts">
import TopBar from './components/TopBar.vue'

</script>

<template>
  <el-container class="app-layout">
    <el-header class="app-header">
      <TopBar />
    </el-header>
    <el-main class="app-main">
      <transition name="fade-slide" mode="out-in">
        <router-view />
      </transition>
    </el-main>
  </el-container>
</template>

<style lang="scss">
@use './styles/mixins/scrollbar' as *;

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
  // 使用新的混合宏，只在需要滚动时显示滚动条
  @include scrollbar-on-hover();
}

// 页面过渡动画样式
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
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
