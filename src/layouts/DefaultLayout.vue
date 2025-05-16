<script setup lang="ts">
import MainContent from '../components/layout/MainContent.vue'
import Sidebar from '../components/Sidebar.vue'

</script>

<template>
  <div class="layout-default">
    <el-container class="layout-container">
      <el-container class="layout-body">
        <el-aside width="240px" class="layout-aside">
          <Sidebar />
        </el-aside>
        
        <el-main class="layout-main">
          <MainContent />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.layout-default {
  height: 100%;
  overflow: hidden;
}

.layout-container {
  height: 100%;
}

.layout-body {
  height: 100%;
  display: flex;
}

.layout-aside {
  height: 100%;
  background-color: #fff;
  overflow-y: auto;
  width: 240px;
  border-right: 1px solid #e6e6e6;
}

.layout-main {
  background-color: #f8f9fa;
  padding: 0 10px;
  overflow-y: auto;
  flex: 1;
}
</style> 