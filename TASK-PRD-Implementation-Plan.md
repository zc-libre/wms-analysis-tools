# Context
Filename: TASK-PRD-Implementation-Plan.md
Created On: $(date +%Y-%m-%dT%H:%M:%S)
Created By: AI Assistant
Associated Protocol: RIPER-5 + Multidimensional + Agent Protocol

# Task Description
根据 `docs/prd-warehouse-analysis-tool-vue.md` 生成详细的实施计划文档。

# Project Overview
项目名称：仓储管理系统Vue迁移项目
目标：将基于HTML的分析工具迁移到Vue 3 + TypeScript + Element Plus 架构。
主要技术栈：Vue 3, TypeScript, Sass, Element Plus, Pinia, Vite, Vue Router, Axios, Vitest。

---
*The following sections are maintained by the AI during protocol execution*
---

# Analysis (Populated by RESEARCH mode)
PRD 文档分析完成。关键信息摘要如下：

*   **核心目标**: 将现有 HTML 仓储管理分析工具迁移至现代 Vue 3 技术栈（TS, Sass, Element Plus, Pinia, Vite），实现 100% 功能对等，并提升可维护性、开发者体验和性能。
*   **主要功能模块**:
    *   项目管理 (CRUD, 文件管理)
    *   订单数据管理 (表格展示, 筛选/搜索, 详情查看, 导出, 添加)
    *   物料数据管理 (表格展示, 筛选/搜索, CRUD, 属性跟踪)
    *   入库单据管理 (表格展示, 筛选/搜索, CRUD)
    *   库存记录管理 (表格展示, 筛选/搜索, CRUD)
    *   AI 助手 (可折叠面板, 对话历史, 模型选择, 消息输入/重生成)
*   **关键非功能性需求**:
    *   性能（加载时间 < 2s, 过渡 < 300ms, 大表格虚拟滚动）
    *   可用性（保持 UX 熟悉度, 平板响应式 >= 768px, 交互状态, 加载指示器）
    *   可维护性（组件化, TS 覆盖率 > 90%, Composition API, Pinia, Sass BEM）
    *   安全性（客户端验证, XSS 防护, HTTP-only Cookie）
    *   国际化（为 i18n 准备）
*   **结构化开发流程**: PRD 已定义了清晰的 Epic 和 Story 结构，覆盖从项目设置到部署的完整流程。
*   **技术栈**: Vue 3 (Composition API), TypeScript (严格模式), Sass, Vite, Element Plus, Pinia, Vue Router, Axios, Vitest, ESLint, Prettier。

# Proposed Solution (Populated by INNOVATE mode)
PRD 文档 (`docs/prd-warehouse-analysis-tool-vue.md`) 提供了详细且结构化的开发计划，包括 Epics 和 Stories。该计划覆盖了项目目标、功能需求、非功能性需求以及技术栈选择。

经过评估，直接采用 PRD 中定义的 Epic 和 Story 结构作为实施计划的基础是最合适的方案。这确保了与需求的一致性，并利用了既定的开发蓝图。

# Implementation Plan (Generated by PLAN mode)
Implementation Checklist:

**@: 项目设置和核心架构**
1.  **Story-1**: 使用 Vite 初始化 Vue 3 项目，集成 TypeScript, Sass, Element Plus。 (`npm create vite@latest wms-app --template vue-ts`)
2.  **Story-1**: 安装 Sass (`npm install -D sass`) 和 Element Plus (`npm install element-plus @element-plus/icons-vue`)。
3.  **Story-1**: 配置 `vite.config.ts` 以支持 Sass 和 Element Plus 按需导入 (使用 `unplugin-vue-components`, `unplugin-auto-import`)。
4.  **Story-2**: 创建标准项目目录结构: `src/components`, `src/views`, `src/stores`, `src/router`, `src/assets`, `src/styles`, `src/services`, `src/types`。
5.  **Story-3**: 安装 Vue Router (`npm install vue-router@4`)。
6.  **Story-3**: 配置基础路由 (`src/router/index.ts`)，定义初始路由（例如 Home, Login）。
7.  **Story-4**: 安装 Pinia (`npm install pinia`)。
8.  **Story-4**: 配置 Pinia 实例 (`src/stores/index.ts`) 并创建示例 store（例如 `src/stores/user.ts`）。
9.  **Story-5**: 创建 Sass 变量文件 (`src/styles/variables.scss`, `src/styles/element-variables.scss`) 并配置 `vite.config.ts` 以全局注入，实现 Element Plus 主题定制基础。
10. **Story-6**: 安装 Axios (`npm install axios`)。
11. **Story-6**: 创建基础 API 服务 (`src/services/api.ts`) 和模拟数据服务 (`src/services/mockData.ts`) 用于开发。
12. **Story-6**: 配置 ESLint (`npm init @eslint/config`) 和 Prettier (`npm install -D prettier eslint-config-prettier eslint-plugin-prettier`)，确保代码规范。
13. **Story-6**: 配置 TypeScript `tsconfig.json` 使用严格模式。

**@ 布局组件实现**
14. **Story-1**: 创建基础布局组件 `src/layouts/DefaultLayout.vue`。
15. **Story-1**: 创建导航栏组件 `src/components/layout/TheNavbar.vue`。
16. **Story-1**: 创建侧边栏组件 `src/components/layout/TheSidebar.vue`。
17. **Story-1**: 创建主内容区域组件 `src/components/layout/MainContent.vue`。
18. **Story-1**: 在 `DefaultLayout.vue` 中集成 TheNavbar, TheSidebar, 和 MainContent，并设置基础样式。
19. **Story-1**: 在 `src/router/index.ts` 中配置路由使用 `DefaultLayout`。
20. **Story-2**: 在 `TheNavbar.vue` 中实现用户信息显示（从 Pinia store 获取）和登出按钮/逻辑。
21. **Story-3**: 在 `TheSidebar.vue` 中实现菜单项（可基于路由配置生成）和可折叠功能（例如使用 Element Plus 的 `ElAside` 或自定义实现）。
22. **Story-4**: 创建可重用的基础模态框组件 `src/components/base/BaseModal.vue`（封装 Element Plus `ElDialog`）。
23. **Story-4**: 创建可重用的基础表格组件 `src/components/base/BaseTable.vue`（封装 Element Plus `ElTable`，考虑加入分页、加载状态等）。
24. **Story-4**: 创建可重用的基础按钮组件 `src/components/base/BaseButton.vue`（封装 Element Plus `ElButton`，可能包含加载状态）。
25. **Story-5**: 在 `src/styles/main.scss` 或特定布局/组件样式中定义响应式断点（例如使用 `@media` 查询），确保在平板设备（>=768px）上布局正常。参考 Element Plus 响应式设计。

**Epic-3: 项目管理功能**
26. **Story-1**: 创建项目管理视图 `src/views/ProjectManagement.vue` 并配置路由。
27. **Story-1**: 创建项目列表组件 `src/components/project/ProjectList.vue`，用于展示项目卡片。
28. **Story-2**: 创建项目卡片组件 `src/components/project/ProjectCard.vue`，使用 Element Plus `ElCard`，包含项目信息（名称、公司、位置）和操作按钮（编辑、删除、查看文件）。实现卡片内容的展开/折叠功能以显示文件列表。
29. **Story-3**: 创建新增项目模态框组件 `src/components/project/NewProjectModal.vue`，使用 `BaseModal` 和 Element Plus 表单组件 (`ElForm`, `ElFormItem`, `ElInput`) 实现表单和验证。
30. **Story-4**: 创建编辑项目模态框组件 `src/components/project/EditProjectModal.vue`，复用 `NewProjectModal` 的结构，加载现有数据并实现更新逻辑。
31. **Story-5**: 创建删除项目确认模态框组件 `src/components/project/DeleteProjectModal.vue`，使用 `BaseModal` 和 Element Plus `ElMessageBox` 或自定义确认逻辑。
32. **Story-6**: 创建文件抽屉组件 `src/components/project/FileDrawer.vue`，使用 Element Plus `ElDrawer`，展示项目关联的文件列表（按类型分类），包含上传和删除按钮。
33. **Story-7**: 在 `FileDrawer.vue` 中集成 Element Plus `ElUpload` 组件，实现文件上传功能，并添加必要的客户端验证（文件类型、大小限制）。
34. **Story-8**: 在 `FileDrawer.vue` 中实现文件列表选择和批量删除功能（可能需要 `ElTable` 的选择功能和确认提示）。

**Epic-4: 订单数据管理功能**
35. **Story-1**: 创建订单数据视图 `src/views/OrderData.vue` 并配置路由，可能使用 Element Plus `ElTabs` 来组织不同类型的订单（如果需要）。
36. **Story-2**: 创建销售订单表格组件 `src/components/order/SalesOrderTable.vue`，使用 `BaseTable`，实现列定义、数据加载（使用模拟数据服务）、分页（使用 `ElPagination`）。
37. **Story-3**: 在 `SalesOrderTable.vue` 或其父组件中实现按单据编号和 SKU 的筛选/搜索输入框和逻辑（更新表格数据源）。
38. **Story-4**: 创建订单详情模态框组件 `src/components/order/OrderDetailModal.vue`，使用 `BaseModal` 展示选定订单的详细信息。
39. **Story-5**: 在 `SalesOrderTable.vue` 或 `OrderData.vue` 中添加导出按钮，实现将当前表格数据导出为 Excel 和 CSV 格式的功能（可能需要 `xlsx` 和 `papaparse` 等库）。
40. **Story-6**: 创建新增订单模态框组件 `src/components/order/NewOrderModal.vue`，使用 `BaseModal` 和 Element Plus 表单组件，实现订单信息的录入和客户端验证。

**Epic-5: 物料、入库和库存功能**
41. **Story-1**: 创建物料数据视图 `src/views/MaterialData.vue` 并配置路由。
42. **Story-1**: 创建物料数据表格组件 `src/components/material/MaterialDataTable.vue`，使用 `BaseTable`，实现 CRUD 操作按钮、分页、搜索和筛选功能。
43. **Story-2**: 创建入库单据视图 `src/views/InboundOrder.vue` 并配置路由。
44. **Story-2**: 创建入库单据表格组件 `src/components/inbound/InboundOrderTable.vue`，使用 `BaseTable`，实现 CRUD 操作按钮、分页、搜索和筛选功能。
45. **Story-3**: 创建库存记录视图 `src/views/InventoryRecord.vue` 并配置路由。
46. **Story-3**: 创建库存记录表格组件 `src/components/inventory/InventoryRecordTable.vue`，使用 `BaseTable`，实现 CRUD 操作按钮、分页、按记录ID/SKU/容器的搜索和筛选功能。
47. **Story-4**: 创建可重用的 CRUD 模态框组件（例如 `src/components/shared/CrudModal.vue`）或分别为物料、入库单、库存记录创建独立的 CRUD 模态框（如 `MaterialCrudModal.vue`, `InboundCrudModal.vue`, `InventoryCrudModal.vue`），包含表单和验证逻辑。
48. **Story-5**: 确保 `MaterialDataTable.vue`, `InboundOrderTable.vue`, `InventoryRecordTable.vue` 都已实现相应的搜索和筛选功能。

**Epic-6: AI助手功能**
49. **Story-1**: 创建 AI 助手面板组件 `src/components/ai/AIAssistantPanel.vue`，实现可折叠/展开的侧边面板或浮动窗口样式。
50. **Story-2**: 创建聊天窗口组件 `src/components/ai/ChatWindow.vue`，用于在 `AIAssistantPanel.vue` 内显示对话消息列表（用户消息和 AI 响应）。
51. **Story-3**: 创建消息输入组件 `src/components/ai/MessageInput.vue`，包含文本输入框和发送按钮，集成到 `AIAssistantPanel.vue`。
52. **Story-4**: 在 Pinia store (`src/stores/aiChat.ts`) 或 `AIAssistantPanel.vue` 的状态中实现聊天线程管理（添加新消息、存储历史记录、支持展开/折叠线程）。
53. **Story-5**: 在 `AIAssistantPanel.vue` 中添加 Element Plus `ElSelect` 下拉菜单，用于选择不同的 AI 模型。
54. **Story-6**: 在 `ChatWindow.vue` 的 AI 消息旁边添加重试/重新生成按钮，并实现调用 AI 服务重新获取响应的逻辑。

**Epic-7: 测试、优化和部署**
55. **Story-1**: 安装 Vitest (`npm install -D vitest @vitest/ui`) 和 Vue Test Utils (`npm install -D @vue/test-utils`).
56. **Story-1**: 为关键业务逻辑组件（例如 Pinia stores, 服务函数, 复杂表单/表格组件）编写单元测试 (`*.spec.ts`)，目标覆盖率 95%。
57. **Story-2**: (可选，根据需要) 使用 Vitest 或 Cypress (`npm install -D cypress`) 为主要用户流程（如项目创建、订单添加、数据筛选）创建集成测试。
58. **Story-3**: 使用浏览器开发者工具 (Lighthouse, Performance tab) 和 Vite analyze 插件 (`vite-plugin-visualizer`) 分析构建包大小和运行时性能，进行必要的优化（代码分割、懒加载、虚拟滚动检查、减少重渲染）。目标 Lighthouse > 90 分。
59. **Story-4**: 配置 `vite.config.ts` 中的 `build` 选项，用于生产环境构建（代码压缩、tree-shaking、哈希文件名等）。
60. **Story-5**: (根据部署环境决定) 创建部署脚本 (`deploy.sh`) 或配置 CI/CD 管道（例如使用 GitHub Actions, GitLab CI），实现自动化构建和部署流程。
61. **Story-6**: 编写 README.md 文档，描述项目设置、开发规范、架构决策和部署方法。为复杂组件添加 JSDoc 或 TSDoc 注释。

# Current Execution Step (Updated by EXECUTE mode when starting a step)
> N/A (尚未开始执行)

# Task Progress (Appended by EXECUTE mode after each step completion)
*   N/A (尚未开始执行)

# Final Review (Populated by REVIEW mode)
[最终审查待填充] 