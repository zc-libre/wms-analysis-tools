import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const username = ref('管理员')
  const avatar = ref('')
  const permissions = ref<string[]>([])

  // 方法
  const setUserInfo = (user: { username: string; avatar: string; permissions: string[] }) => {
    username.value = user.username
    avatar.value = user.avatar
    permissions.value = user.permissions
  }

  const resetUserInfo = () => {
    username.value = ''
    avatar.value = ''
    permissions.value = []
  }

  // 计算属性
  const isAdmin = () => {
    return permissions.value.includes('admin')
  }

  return {
    // 状态
    username,
    avatar,
    permissions,
    // 方法
    setUserInfo,
    resetUserInfo,
    // 计算属性
    isAdmin
  }
}) 