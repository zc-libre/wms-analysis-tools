import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

// Import custom styles (including Sass variables and element overrides)
import '@/styles/main.scss'

// 1. 导入消息工具
import { messageUtil } from '@/utils/message';

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.use(pinia)

// 2. 将消息工具挂载到全局属性
app.config.globalProperties.$message = messageUtil;

app.mount('#app')
