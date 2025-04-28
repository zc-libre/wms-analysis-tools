import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  // 侧边栏折叠状态，默认在小屏幕下折叠
  const isSidebarCollapsed = ref(window.innerWidth < 768)
  
  // 切换侧边栏折叠状态
  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }
  
  // 设置侧边栏状态
  function setSidebarCollapsed(collapsed: boolean) {
    isSidebarCollapsed.value = collapsed
  }
  
  return {
    isSidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed
  }
}) 