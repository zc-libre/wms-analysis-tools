<script setup lang="ts">
// 主内容区组件，作为路由视图的容器
import OrderData from '@/views/OrderData.vue'; // 导入订单数据视图
</script>

<template>
  <div class="main-content">
    <!-- 这里可以根据需要使用router-view或直接加载OrderData组件 -->
    <OrderData />
    
    <!-- 根据需要可以保留router-view
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    -->
  </div>
</template>

<style lang="scss" scoped>
.main-content {
  height: 100%;
  width: 100%;
  
  // 页面过渡动画
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s; // 使用固定值替代变量
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
</style> 