# Tailwind CSS 与 Sass/BEM 混合使用指南

## 概述

本项目同时使用了两种 CSS 方案：
1. **Sass/BEM** - 用于现有组件和全局样式架构
2. **Tailwind CSS** - 用于快速开发和原型设计

本指南说明如何在保持现有 Sass/BEM 架构的同时，集成 Tailwind CSS 工具类。

## 使用原则

### 何时使用 Sass/BEM

- 全局样式定义（如变量、混合宏、重置样式）
- 复杂组件的样式架构
- 需要深度嵌套或高度自定义的样式
- Element Plus 相关的组件样式扩展

### 何时使用 Tailwind CSS

- 快速构建 UI 原型
- 简单布局和间距调整
- 响应式设计调整
- 不需要大量自定义样式的小型组件

### 混合使用方式

我们支持以下几种混合使用方式：

1. **分离使用**：不同组件使用不同方案
   ```vue
   <!-- Tailwind 组件 -->
   <div class="p-4 bg-white rounded-lg shadow">...</div>

   <!-- Sass/BEM 组件 -->
   <div class="card">...</div>
   ```

2. **在 Sass/BEM 中使用 Tailwind 指令**：
   ```scss
   .card {
     &__title {
       @apply text-xl font-bold text-primary;
     }
   }
   ```

3. **混合类名**：
   ```vue
   <div class="card flex p-4 gap-2">
     <div class="card__content flex-1">...</div>
   </div>
   ```

## Tailwind 配置说明

Tailwind 已配置为与 Element Plus 主题集成，主要做了以下调整：

1. 自定义颜色使用 Element Plus 变量：
   ```
   'primary': 'var(--el-color-primary)'
   ```

2. 禁用了 Tailwind 的预设样式 (`preflight: false`)，避免与 Element Plus 冲突

3. 自定义字体大小与 Element Plus 对齐

## 示例组件

参考 `src/components/TailwindExample.vue` 了解混合使用的具体实现和最佳实践。

## 注意事项

1. **样式优先级**：Tailwind 类通常具有较高特异性，可能覆盖某些 Sass/BEM 样式
2. **文件大小**：合理使用 Tailwind 的 JIT 模式和 PurgeCSS 功能，避免生成过大的 CSS 文件
3. **一致性**：尽量在团队内达成一致的使用方式，避免风格混乱
4. **渐进迁移**：对于现有组件，建议保持 Sass/BEM 方式，新组件可考虑使用 Tailwind

## 未来建议

随着项目发展，可考虑以下策略：

1. 逐步将更多组件迁移到 Tailwind 工具类
2. 创建自定义 Tailwind 插件封装常用样式模式
3. 建立统一的设计令牌系统，在 Sass 变量和 Tailwind 主题之间共享 