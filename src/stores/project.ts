import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ProjectFile {
  id: string
  name: string
  date: string
  size: string
}

export interface Project {
  id: number
  name: string
  company: string
  location: string
  filesVisible?: boolean
  files: ProjectFile[]
}

export const useProjectStore = defineStore('project', () => {
  // 当前选中的项目ID和信息
  const currentProjectId = ref<number | null>(null)
  const currentProjectName = ref<string>('')
  const currentFileType = ref<string>('')

  // 设置当前项目
  const setCurrentProject = (id: number, name: string) => {
    currentProjectId.value = id
    currentProjectName.value = name
  }

  // 设置文件类型
  const setFileType = (fileType: string) => {
    currentFileType.value = fileType
  }

  // 重置当前项目信息
  const resetCurrentProject = () => {
    currentProjectId.value = null
    currentProjectName.value = ''
    currentFileType.value = ''
  }

  return {
    currentProjectId,
    currentProjectName,
    currentFileType,
    setCurrentProject,
    setFileType,
    resetCurrentProject
  }
}) 