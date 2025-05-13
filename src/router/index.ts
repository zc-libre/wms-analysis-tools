import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 导入布局组件
const DefaultLayout = () => import('@/layouts/DefaultLayout.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: {
          title: '首页'
        }
      },
      {
        path: '/order-data',
        name: 'OrderData',
        component: () => import('@/views/OrderData.vue'),
        meta: {
          title: '订单数据'
        }
      },
      {
        path: '/material-data',
        name: 'MaterialData',
        component: () => import('@/views/MaterialData.vue'),
        meta: {
          title: '物料数据'
        }
      },
      {
        path: '/inbound-order',
        name: 'InboundOrder',
        component: () => import('@/views/InboundOrder.vue'),
        meta: {
          title: '入库单据'
        }
      },
      {
        path: '/inventory',
        name: 'Inventory',
        component: () => import('@/views/InventoryRecord.vue'),
        meta: {
          title: '库存记录'
        }
      }
      
    ]
  },
  {
    path: '/file-import',
    name: 'FileImport',
    component: () => import('@/views/FileImport.vue'),
    meta: {
      title: '文件导入'
    }
  },
  {
    path: '/analysis-result',
    name: 'AnalysisResult',
    component: () => import('@/views/AnalysisResult.vue'),
    meta: {
      title: '分析结果'
    }
  },
  {
    path: '/cleanout-result',
    name: 'CleanoutResult',
    component: () => import('@/views/CleanoutResult.vue'),
    meta: {
      title: '清洗结果'
    }
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: () => import('@/views/Analysis.vue'),
    meta: {
      title: '订单分析'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '404'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // 始终滚动到顶部
    return { top: 0 }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - 仓储管理系统` || '仓储管理系统'
  next()
})

export default router 