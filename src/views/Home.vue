<template>
  <div class="home-view">
    <OrderData />
  </div>
</template>

<script setup lang="ts">
import OrderData from './OrderData.vue'
</script>

<style lang="scss" scoped>
.home-view {
  height: 100%;
  width: 100%;
}

.page-breadcrumb {
  padding: 16px 0;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 16px;
}
</style>